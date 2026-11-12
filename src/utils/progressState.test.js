import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCompletionToDashboard,
  applyCompletionToUser,
  applyOptimisticToDashboard,
  applyOptimisticToUser,
  calculateLevelFromXp,
  calculateXpToNext,
  estimateMissionXpReward,
  markMissionCompletedInWorlds,
} from './progressState.js';

function createDashboardFixture() {
  return {
    user: {
      name: 'Test User',
      level: 1,
      xp: 0,
      xpToNext: 500,
    },
    streak: { current: 0, best: 0, activeToday: false },
    stats: { missionsCompleted: 0, missionsTotal: 6, totalXp: 0 },
    worlds: [
      {
        id: 1,
        name: 'Terminal Shell',
        orderIndex: 1,
        unlocked: true,
        progress: 0,
        missions: [
          { id: 1, title: 'Mission 1', status: 'current', xpReward: 50 },
          { id: 2, title: 'Mission 2', status: 'locked', xpReward: 50 },
        ],
        boss: { id: 3, status: 'locked' },
      },
    ],
  };
}

test('calculateLevelFromXp and calculateXpToNext match backend progression tiers', () => {
  assert.equal(calculateLevelFromXp(0), 1);
  assert.equal(calculateLevelFromXp(499), 1);
  assert.equal(calculateLevelFromXp(500), 2);
  assert.equal(calculateXpToNext(1), 500);
  assert.equal(calculateXpToNext(2), 1150);
});

test('estimateMissionXpReward applies progressive hint penalty with 10 XP floor', () => {
  assert.equal(estimateMissionXpReward(50, 0), 50);
  assert.equal(estimateMissionXpReward(50, 1), 40);
  assert.equal(estimateMissionXpReward(50, 2), 30);
  assert.equal(estimateMissionXpReward(50, 3), 20);
  assert.equal(estimateMissionXpReward(15, 5), 10);
});

test('optimistic update followed by completion reconciliation updates XP and stats without double-counting', () => {
  const initialUser = { id: 1, level: 1, xp: 0, streak: 0 };
  const initialDashboard = createDashboardFixture();

  // 1. Optimistic update
  const optUser = applyOptimisticToUser(initialUser, 50);
  const optDashboard = applyOptimisticToDashboard(initialDashboard, {
    missionId: 1,
    earnedXp: 50,
    alreadyCompleted: false,
  });

  assert.equal(optUser.xp, 50);
  assert.equal(optDashboard.user.xp, 50);
  assert.equal(optDashboard.stats.totalXp, 50);
  assert.equal(optDashboard.stats.missionsCompleted, 1);
  assert.equal(optDashboard.worlds[0].missions[0].status, 'completed');
  assert.equal(optDashboard.worlds[0].missions[1].status, 'current');
  assert.equal(optDashboard.worlds[0].progress, 50);

  // 2. Authoritative completion payload arrives (also 50 totalXp)
  const serverResult = {
    alreadyCompleted: false,
    xpAwarded: 50,
    totalXp: 50,
    newLevel: 1,
    streak: 1,
  };
  const finalUser = applyCompletionToUser(optUser, serverResult);
  const finalDashboard = applyCompletionToDashboard(optDashboard, serverResult, {
    missionId: 1,
  });

  assert.equal(finalUser.xp, 50);
  assert.equal(finalUser.streak, 1);
  assert.equal(finalDashboard.user.xp, 50);
  assert.equal(finalDashboard.stats.totalXp, 50);
  assert.equal(finalDashboard.stats.missionsCompleted, 1);
  assert.equal(finalDashboard.streak.current, 1);
  assert.equal(finalDashboard.streak.activeToday, true);
});

test('markMissionCompletedInWorlds unlocks boss when all regular missions complete', () => {
  const worlds = markMissionCompletedInWorlds(
    [
      {
        id: 1,
        unlocked: true,
        progress: 50,
        missions: [
          { id: 1, status: 'completed' },
          { id: 2, status: 'current' },
        ],
        boss: { id: 3, status: 'locked' },
      },
    ],
    2
  );

  assert.equal(worlds[0].progress, 100);
  assert.equal(worlds[0].missions[1].status, 'completed');
  assert.equal(worlds[0].boss.status, 'current');
});

