const prisma = require('../../db');
const { formatDisplayName } = require('../../src/utils/displayName');

/**
 * dashboardService — all SQL queries for GET /api/dashboard.
 * Uses Prisma ORM; no raw SQL except for the XP aggregation.
 */

/**
 * Calculates mission status for a user within a world.
 * - completed: present in UserMission
 * - current:   the first incomplete mission in the world
 * - locked:    all missions after the first incomplete one
 */
function computeMissionStatuses(missions, completedIds) {
  const completedSet = new Set(completedIds);
  let foundCurrent = false;

  return missions.map((m) => {
    if (completedSet.has(m.id)) {
      return { ...m, status: 'completed' };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { ...m, status: 'current' };
    }
    return { ...m, status: 'locked' };
  });
}

/**
 * Determines world unlock status.
 * A world is unlocked if the user has completed >= its unlock_requirement
 * missions from the previous world.
 */
function isWorldUnlocked(world, allCompletedIds, worlds) {
  if (world.orderIndex === 1) return true; // first world always unlocked

  const prevWorld = worlds.find((w) => w.orderIndex === world.orderIndex - 1);
  if (!prevWorld) return false;

  const prevCompleted = prevWorld.missions.filter((m) =>
    allCompletedIds.has(m.id)
  ).length;

  return prevCompleted >= world.unlockRequirement;
}

/**
 * Main dashboard data aggregation.
 * @param {number} userId
 */
async function getDashboardData(userId) {
  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      level: true,
      xp: true,
      streakCurrent: true,
      streakBest: true,
      lastActiveDate: true,
    },
  });

  if (!user) throw new Error('User not found');

  // Fetch all worlds with their missions (ordered)
  const worlds = await prisma.world.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      missions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  // Fetch user's completed missions
  const userMissions = await prisma.userMission.findMany({
    where: { userId, status: 'completed' },
    select: { missionId: true },
  });
  const completedIds = new Set(userMissions.map((um) => um.missionId));

  // Calculate streak active today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);
  const activeToday = lastActive ? lastActive.getTime() === today.getTime() : false;

  // Build worlds payload
  const worldsPayload = worlds.map((world) => {
    const unlocked = isWorldUnlocked(world, completedIds, worlds);

    // Split missions and boss
    const regularMissions = world.missions.filter((m) => m.type === 'mission');
    const bossMission = world.missions.find((m) => m.type === 'boss');

    // Assign statuses
    const missionsWithStatus = unlocked
      ? computeMissionStatuses(regularMissions, [...completedIds])
      : regularMissions.map((m) => ({ ...m, status: 'locked' }));

    const completedCount = missionsWithStatus.filter(
      (m) => m.status === 'completed'
    ).length;
    const progress = regularMissions.length > 0
      ? Math.round((completedCount / regularMissions.length) * 100)
      : 0;

    const bossStatus = !unlocked ? 'locked'
      : bossMission && completedIds.has(bossMission.id) ? 'completed'
      : completedCount === regularMissions.length ? 'current'
      : 'locked';

    return {
      id: world.id,
      name: world.name,
      orderIndex: world.orderIndex,
      unlocked,
      progress,
      missions: missionsWithStatus.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        xpReward: m.xpReward,
      })),
      boss: bossMission
        ? { id: bossMission.id, status: bossStatus }
        : null,
    };
  });

  // Today's mission = first incomplete mission in current world
  const currentWorld = worldsPayload.find((w) => {
    if (!w.unlocked) return false;
    const allDone =
      w.missions.every((m) => m.status === 'completed') &&
      (w.boss?.status === 'completed' || !w.boss);
    return !allDone;
  });
  const todaysMission = currentWorld
    ? currentWorld.missions.find((m) => m.status === 'current')
    : null;

  const todaysMissionPayload = todaysMission
    ? {
        id: todaysMission.id,
        title: todaysMission.title,
        worldName: currentWorld.name,
        xpReward: todaysMission.xpReward,
      }
    : null;

  // Stats
  const totalMissions = worlds.reduce(
    (sum, w) => sum + w.missions.filter((m) => m.type === 'mission').length,
    0
  );

  // Total XP from XpEvents (fallback to user.xp if events haven't been backfilled)
  const xpAgg = await prisma.xpEvent.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  const totalXp = Math.max(xpAgg._sum.amount ?? 0, user.xp ?? 0);

  // Weekly leaderboard — sum XP events over last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyXpRaw = await prisma.xpEvent.groupBy({
    by: ['userId'],
    where: { createdAt: { gte: sevenDaysAgo } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 10,
  });

  // Fetch usernames for leaderboard
  const leaderboardUserIds = weeklyXpRaw.map((r) => r.userId);
  const leaderboardUsers = await prisma.user.findMany({
    where: { id: { in: leaderboardUserIds } },
    select: { id: true, username: true, displayName: true },
  });
  const userMap = Object.fromEntries(
    leaderboardUsers.map((u) => [u.id, formatDisplayName(u) || u.username])
  );

  let leaderboard = weeklyXpRaw.map((r, idx) => ({
    rank: idx + 1,
    username: userMap[r.userId] ?? 'unknown',
    weeklyXp: r._sum.amount ?? 0,
    isCurrentUser: r.userId === userId,
  }));

  // If current user isn't in top 10, append them
  if (!leaderboard.some((e) => e.isCurrentUser)) {
    const myWeeklyXp = await prisma.xpEvent.aggregate({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      _sum: { amount: true },
    });
    leaderboard.push({
      rank: leaderboard.length + 1,
      username: formatDisplayName(user) || user.username,
      weeklyXp: myWeeklyXp._sum.amount ?? 0,
      isCurrentUser: true,
    });
  }

  // Next world to unlock
  const nextLockedWorld = worldsPayload.find((w) => !w.unlocked);
  let nextWorldPayload = null;
  if (nextLockedWorld) {
    const prevWorld = worldsPayload.find(
      (w) => w.orderIndex === nextLockedWorld.orderIndex - 1
    );
    const rawWorld = worlds.find((w) => w.id === nextLockedWorld.id);
    if (prevWorld && rawWorld) {
      const completedInPrev = prevWorld.missions.filter(
        (m) => m.status === 'completed'
      ).length;
      nextWorldPayload = {
        name: nextLockedWorld.name,
        required: rawWorld.unlockRequirement,
        completed: completedInPrev,
      };
    }
  }

  // XP to next level (simple formula: 500 * level * 1.15)
  const xpToNext = Math.round(500 * user.level * Math.pow(1.15, user.level - 1));

  const savedName = user.displayName?.trim() || null;

  return {
    user: {
      name: savedName,
      displayName: savedName,
      username: user.username,
      email: user.email,
      level: user.level,
      xp: user.xp,
      xpToNext,
    },
    streak: {
      current: user.streakCurrent,
      best: user.streakBest,
      activeToday,
    },
    stats: {
      missionsCompleted: completedIds.size,
      missionsTotal: totalMissions,
      totalXp,
    },
    worlds: worldsPayload,
    todaysMission: todaysMissionPayload,
    leaderboard,
    nextWorld: nextWorldPayload,
  };
}

module.exports = { getDashboardData };
