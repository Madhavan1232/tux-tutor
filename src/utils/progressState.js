/**
 * progressState.js — Pure helpers for unifying user XP, level, streak, and
 * dashboard progress across optimistic updates, mission completion responses,
 * and /api/dashboard refreshes.
 */

export function calculateLevelFromXp(xp) {
  return Math.max(1, Math.floor((Number(xp) || 0) / 500) + 1);
}

export function calculateXpToNext(level) {
  const safeLevel = Math.max(1, Number(level) || 1);
  return Math.round(500 * safeLevel * Math.pow(1.15, safeLevel - 1));
}

export function estimateMissionXpReward(baseReward, hintsUsed = 0) {
  const safeHints = Math.max(0, Number(hintsUsed) || 0);
  let penaltyMultiplier = 1.0;
  if (safeHints === 1) penaltyMultiplier = 0.8;
  else if (safeHints === 2) penaltyMultiplier = 0.6;
  else if (safeHints >= 3) penaltyMultiplier = 0.4;

  return Math.max(10, Math.round((Number(baseReward) || 50) * penaltyMultiplier));
}

export function mergeDefined(base = {}, patch = {}) {
  const next = { ...(base ?? {}) };
  for (const [key, value] of Object.entries(patch ?? {})) {
    if (value !== undefined) {
      next[key] = value;
    }
  }
  return next;
}

export function isMissionCompletedInWorlds(worlds, missionId) {
  if (!Array.isArray(worlds) || !missionId) return false;
  const targetId = Number(missionId);
  return worlds.some((world) => {
    const inMissions = Array.isArray(world.missions)
      ? world.missions.some((m) => Number(m.id) === targetId && m.status === 'completed')
      : false;
    const isBoss = world.boss && Number(world.boss.id) === targetId && world.boss.status === 'completed';
    return inMissions || Boolean(isBoss);
  });
}

export function markMissionCompletedInWorlds(worlds, missionId) {
  if (!Array.isArray(worlds) || !missionId) return worlds;
  const targetId = Number(missionId);

  return worlds.map((world) => {
    const missions = Array.isArray(world.missions) ? world.missions : [];
    const hasMission = missions.some((m) => Number(m.id) === targetId);
    const hasBoss = world.boss && Number(world.boss.id) === targetId;

    if (!hasMission && !hasBoss) return world;

    let promotedCurrent = false;
    const nextMissions = missions.map((m) => {
      if (Number(m.id) === targetId || m.status === 'completed') {
        return { ...m, status: 'completed' };
      }
      if (m.status === 'current') {
        promotedCurrent = true;
        return m;
      }
      if (!promotedCurrent && m.status === 'locked' && world.unlocked) {
        promotedCurrent = true;
        return { ...m, status: 'current' };
      }
      return m;
    });

    const completedRegular = nextMissions.filter((m) => m.status === 'completed').length;
    const progress =
      nextMissions.length > 0 ? Math.round((completedRegular / nextMissions.length) * 100) : world.progress;

    let nextBoss = world.boss;
    if (world.boss) {
      if (Number(world.boss.id) === targetId || world.boss.status === 'completed') {
        nextBoss = { ...world.boss, status: 'completed' };
      } else if (world.unlocked && completedRegular === nextMissions.length && world.boss.status === 'locked') {
        nextBoss = { ...world.boss, status: 'current' };
      }
    }

    return {
      ...world,
      progress,
      missions: nextMissions,
      boss: nextBoss,
    };
  });
}

export function applyOptimisticToUser(user, earnedXp = 0) {
  if (!user) return user;
  const delta = Math.max(0, Number(earnedXp) || 0);
  const nextXp = (Number(user.xp) || 0) + delta;
  const nextLevel = Math.max(Number(user.level) || 1, calculateLevelFromXp(nextXp));
  return {
    ...user,
    xp: nextXp,
    level: nextLevel,
    xpToNext: calculateXpToNext(nextLevel),
  };
}

export function applyOptimisticToDashboard(
  dashboard,
  { missionId, earnedXp = 0, alreadyCompleted = false } = {}
) {
  if (!dashboard) return dashboard;

  const alreadyInWorlds = isMissionCompletedInWorlds(dashboard.worlds, missionId);
  const effectiveAlreadyCompleted = Boolean(alreadyCompleted) || alreadyInWorlds;
  const xpDelta = effectiveAlreadyCompleted ? 0 : Math.max(0, Number(earnedXp) || 0);
  const missionsDelta = effectiveAlreadyCompleted || !missionId ? 0 : 1;

  const prevXp = Number(dashboard.user?.xp) || 0;
  const nextXp = prevXp + xpDelta;
  const nextLevel = Math.max(Number(dashboard.user?.level) || 1, calculateLevelFromXp(nextXp));

  return {
    ...dashboard,
    user: {
      ...(dashboard.user ?? {}),
      xp: nextXp,
      level: nextLevel,
      xpToNext: calculateXpToNext(nextLevel),
    },
    stats: {
      ...(dashboard.stats ?? {}),
      missionsCompleted: (Number(dashboard.stats?.missionsCompleted) || 0) + missionsDelta,
      totalXp: Math.max((Number(dashboard.stats?.totalXp) || prevXp) + xpDelta, nextXp),
    },
    worlds: missionId ? markMissionCompletedInWorlds(dashboard.worlds, missionId) : dashboard.worlds,
  };
}

export function applyCompletionToUser(user, result) {
  if (!user || !result) return user;
  const nextXp = result.totalXp ?? user.xp ?? 0;
  const nextLevel = result.newLevel ?? user.level ?? calculateLevelFromXp(nextXp);
  return {
    ...user,
    xp: nextXp,
    level: nextLevel,
    xpToNext: calculateXpToNext(nextLevel),
    streak: result.streak ?? user.streak,
  };
}

export function applyCompletionToDashboard(dashboard, result, { missionId } = {}) {
  if (!dashboard || !result) return dashboard;

  const nextXp = result.totalXp ?? dashboard.user?.xp ?? 0;
  const nextLevel = result.newLevel ?? dashboard.user?.level ?? calculateLevelFromXp(nextXp);
  const nextStreakCurrent = result.streak ?? dashboard.streak?.current ?? 0;
  const shouldIncrementDone =
    !result.alreadyCompleted &&
    missionId &&
    !isMissionCompletedInWorlds(dashboard.worlds, missionId);

  return {
    ...dashboard,
    user: {
      ...(dashboard.user ?? {}),
      xp: nextXp,
      level: nextLevel,
      xpToNext: calculateXpToNext(nextLevel),
    },
    streak: {
      ...(dashboard.streak ?? {}),
      current: nextStreakCurrent,
      best: Math.max(Number(dashboard.streak?.best) || 0, nextStreakCurrent),
      activeToday: true,
    },
    stats: {
      ...(dashboard.stats ?? {}),
      missionsCompleted:
        (Number(dashboard.stats?.missionsCompleted) || 0) + (shouldIncrementDone ? 1 : 0),
      totalXp: nextXp,
    },
    worlds: missionId ? markMissionCompletedInWorlds(dashboard.worlds, missionId) : dashboard.worlds,
  };
}

