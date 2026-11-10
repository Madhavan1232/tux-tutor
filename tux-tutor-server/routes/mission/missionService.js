const prisma = require('../../db');

const LEVEL_TIERS = [
  { min: 1,  max: 5,  title: 'Egg' },
  { min: 6,  max: 10, title: 'Chick' },
  { min: 11, max: 20, title: 'Rockhopper' },
  { min: 21, max: 35, title: 'Emperor' },
  { min: 36, max: Infinity, title: 'Root Penguin' },
];

function getLevelTitle(level) {
  const tier = LEVEL_TIERS.find((t) => level >= t.min && level <= t.max);
  return tier ? tier.title : 'Egg';
}

function calculateLevelFromXp(xp) {
  return Math.max(1, Math.floor(xp / 500) + 1);
}

/**
 * Get mission definition for the workspace.
 * Omits full hints array beyond what the user has unlocked.
 */
async function getMissionById(missionId, userId) {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      worldRef: true,
    },
  });

  if (!mission) {
    throw new Error('Mission not found');
  }

  let userMission = null;
  if (userId) {
    userMission = await prisma.userMission.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId,
        },
      },
    });
  }

  const allHints = Array.isArray(mission.hints) ? mission.hints : [];
  const hintsUsedCount = userMission?.hintsUsed || 0;
  // Only reveal hints up to hintsUsedCount
  const revealedHints = allHints.slice(0, hintsUsedCount);

  return {
    id: mission.id,
    worldId: mission.worldId,
    worldName: mission.worldRef?.name || mission.world || 'Linux World',
    worldOrderIndex: mission.worldRef?.orderIndex || 1,
    orderIndex: mission.orderIndex,
    type: mission.type,
    title: mission.title,
    description: mission.description,
    xpReward: mission.xpReward,
    instructions: mission.instructions || mission.description,
    goal: mission.goal || mission.title,
    steps: Array.isArray(mission.steps) ? mission.steps : [],
    seedFiles: Array.isArray(mission.seedFiles) ? mission.seedFiles : [],
    setupScript: mission.setupScript || '',
    validateScript: mission.validateScript || '',
    fastForwardScript: mission.fastForwardScript || '',
    allowUpload: Boolean(mission.allowUpload),
    uploadConfig: mission.uploadConfig || null,
    minSeconds: mission.minSeconds || 3,
    requiresStateFrom: mission.requiresStateFrom || null,
    totalHints: allHints.length,
    hintsUsed: hintsUsedCount,
    revealedHints,
    userProgress: userMission
      ? {
          status: userMission.status,
          startedAt: userMission.startedAt,
          completedAt: userMission.completedAt,
          stepsCompleted: userMission.stepsCompleted || [],
          hintsUsed: userMission.hintsUsed,
          xpAwarded: userMission.xpAwarded,
        }
      : null,
  };
}

/**
 * Start or initialize mission progress for a user.
 */
async function startMission(missionId, userId) {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) throw new Error('Mission not found');

  const now = new Date();
  const userMission = await prisma.userMission.upsert({
    where: {
      userId_missionId: {
        userId,
        missionId,
      },
    },
    update: {
      startedAt: now,
    },
    create: {
      userId,
      missionId,
      status: 'in_progress',
      startedAt: now,
      stepsCompleted: [],
      hintsUsed: 0,
      xpAwarded: 0,
    },
  });

  return {
    success: true,
    missionId,
    startedAt: userMission.startedAt,
    status: userMission.status,
  };
}

/**
 * Reveal progressive hint at index and record usage.
 */
async function revealHint(missionId, hintIndex, userId) {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) throw new Error('Mission not found');

  const allHints = Array.isArray(mission.hints) ? mission.hints : [];
  if (hintIndex < 0 || hintIndex >= allHints.length) {
    throw new Error('Hint index out of range');
  }

  const newHintsUsed = hintIndex + 1;

  const userMission = await prisma.userMission.upsert({
    where: {
      userId_missionId: {
        userId,
        missionId,
      },
    },
    update: {
      hintsUsed: {
        increment: 0, // ensure field exists
      },
    },
    create: {
      userId,
      missionId,
      status: 'in_progress',
      startedAt: new Date(),
      stepsCompleted: [],
      hintsUsed: newHintsUsed,
    },
  });

  const updatedHintsUsed = Math.max(userMission.hintsUsed || 0, newHintsUsed);
  if (updatedHintsUsed !== userMission.hintsUsed) {
    await prisma.userMission.update({
      where: { id: userMission.id },
      data: { hintsUsed: updatedHintsUsed },
    });
  }

  return {
    hint: allHints[hintIndex],
    hintIndex,
    totalHints: allHints.length,
    hintsUsed: updatedHintsUsed,
  };
}

/**
 * Save interim step checklist progress.
 */
async function saveProgress(missionId, userId, { stepsCompleted, hintsUsed }) {
  await prisma.userMission.upsert({
    where: {
      userId_missionId: {
        userId,
        missionId,
      },
    },
    update: {
      stepsCompleted: stepsCompleted || [],
      ...(hintsUsed !== undefined ? { hintsUsed } : {}),
    },
    create: {
      userId,
      missionId,
      status: 'in_progress',
      startedAt: new Date(),
      stepsCompleted: stepsCompleted || [],
      hintsUsed: hintsUsed || 0,
    },
  });

  return { success: true };
}

/**
 * Complete mission idempotently, award XP (with progressive hint penalty), update streak and level.
 */
async function completeMission(missionId, userId, { timeElapsedSeconds } = {}) {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { worldRef: true },
  });
  if (!mission) throw new Error('Mission not found');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const existingProgress = await prisma.userMission.findUnique({
    where: {
      userId_missionId: {
        userId,
        missionId,
      },
    },
  });

  // Anti-cheat verification
  if (!existingProgress || !existingProgress.startedAt) {
    // Auto-create startedAt if missing to be forgiving but track time
  } else {
    const elapsed = (Date.now() - new Date(existingProgress.startedAt).getTime()) / 1000;
    const minTime = mission.minSeconds || 2;
    if (elapsed < minTime && (timeElapsedSeconds || 0) < minTime) {
      throw new Error(`Mission completed too quickly (minimum plausible time is ${minTime}s)`);
    }
  }

  // Next mission discovery
  const nextMissionInWorld = await prisma.mission.findFirst({
    where: {
      worldId: mission.worldId,
      orderIndex: { gt: mission.orderIndex },
    },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, title: true, orderIndex: true, type: true },
  });

  let nextMission = nextMissionInWorld;
  if (!nextMission) {
    const nextWorld = await prisma.world.findFirst({
      where: { orderIndex: { gt: mission.worldRef?.orderIndex || 1 } },
      orderBy: { orderIndex: 'asc' },
      include: {
        missions: {
          orderBy: { orderIndex: 'asc' },
          take: 1,
        },
      },
    });
    if (nextWorld?.missions?.length) {
      nextMission = nextWorld.missions[0];
    }
  }

  // Idempotency: If already completed, do not award XP again!
  if (existingProgress?.status === 'completed') {
    return {
      alreadyCompleted: true,
      xpAwarded: 0,
      totalXp: user.xp,
      newLevel: user.level,
      levelTitle: getLevelTitle(user.level),
      streak: user.streakCurrent,
      nextMission: nextMission ? { id: nextMission.id, title: nextMission.title } : null,
      message: 'Mission was already completed previously.',
    };
  }

  // Calculate XP penalty for hints used
  // 0 hints: 100%, 1 hint: 80%, 2 hints: 60%, 3+ hints: 40% floor
  const hintsUsed = existingProgress?.hintsUsed || 0;
  let penaltyMultiplier = 1.0;
  if (hintsUsed === 1) penaltyMultiplier = 0.8;
  else if (hintsUsed === 2) penaltyMultiplier = 0.6;
  else if (hintsUsed >= 3) penaltyMultiplier = 0.4;

  const xpAwarded = Math.max(10, Math.round(mission.xpReward * penaltyMultiplier));

  // Streak calculations
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let newStreakCurrent = user.streakCurrent || 0;
  let newStreakBest = user.streakBest || 0;

  if (!user.lastActiveDate) {
    newStreakCurrent = 1;
    newStreakBest = Math.max(newStreakBest, 1);
  } else {
    const lastActive = new Date(user.lastActiveDate);
    const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const diffDays = Math.round((today - lastActiveDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreakCurrent += 1;
      newStreakBest = Math.max(newStreakBest, newStreakCurrent);
    } else if (diffDays > 1) {
      newStreakCurrent = 1;
    }
    // If diffDays === 0, same day activity, streak remains same
  }

  const updatedTotalXp = user.xp + xpAwarded;
  const newLevel = calculateLevelFromXp(updatedTotalXp);

  // Perform atomic update inside transaction
  await prisma.$transaction([
    prisma.userMission.upsert({
      where: {
        userId_missionId: {
          userId,
          missionId,
        },
      },
      update: {
        status: 'completed',
        completedAt: now,
        xpAwarded,
      },
      create: {
        userId,
        missionId,
        status: 'completed',
        startedAt: now,
        completedAt: now,
        xpAwarded,
        hintsUsed,
      },
    }),
    prisma.xpEvent.create({
      data: {
        userId,
        amount: xpAwarded,
        createdAt: now,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: updatedTotalXp,
        level: newLevel,
        streak: newStreakCurrent,
        streakCurrent: newStreakCurrent,
        streakBest: newStreakBest,
        lastActiveDate: now,
      },
    }),
  ]);

  return {
    alreadyCompleted: false,
    xpAwarded,
    totalXp: updatedTotalXp,
    newLevel,
    levelTitle: getLevelTitle(newLevel),
    streak: newStreakCurrent,
    nextMission: nextMission ? { id: nextMission.id, title: nextMission.title } : null,
  };
}

module.exports = {
  getMissionById,
  startMission,
  revealHint,
  saveProgress,
  completeMission,
  getLevelTitle,
};
