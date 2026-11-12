import { test, expect } from '@playwright/test';

const CHEERPX_STUB_ESM = `
const encoder = new TextEncoder();
const makeDevice = () => ({ reset: async () => {} });
export const CloudDevice = { create: async () => makeDevice() };
export const HttpBytesDevice = { create: async () => makeDevice() };
export const IDBDevice = { create: async () => makeDevice() };
export const OverlayDevice = { create: async () => makeDevice() };
export const DataDevice = { create: async () => makeDevice() };
export const Linux = {
  create: async () => {
    let consoleFn = null;
    return {
      setCustomConsole: (fn) => {
        consoleFn = fn;
        return () => {};
      },
      run: async (_bin, args) => {
        if (Array.isArray(args) && args.includes('--login')) {
          return new Promise(() => {});
        }
        const cmd = Array.isArray(args) ? args.join(' ') : '';
        if (cmd.includes('__TUX_VM_OK__') && consoleFn) {
          consoleFn(encoder.encode('__TUX_VM_OK__\\n'));
        }
        return { status: 0 };
      },
    };
  },
};
export default { Linux, CloudDevice, HttpBytesDevice, IDBDevice, OverlayDevice, DataDevice };
`;

test.describe('Mission Completion XP & Progress Synchronization', () => {
  test('updates right sidebar XP, stats, and bottom user card after mission completion without reload', async ({
    page,
  }) => {
    const serverState = {
      xp: 0,
      level: 1,
      xpToNext: 500,
      streak: 0,
      missionsCompleted: 0,
      mission1Status: 'current',
    };
    const eventLog: string[] = [];

    // Intercept CheerpX Vite module chunk (only outside-of-app VM runtime)
    await page.route('**/@leaningtech_cheerpx*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: CHEERPX_STUB_ESM,
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 7,
            username: 'learner',
            email: 'learner@example.com',
            displayName: 'Alex',
            name: 'Alex',
            level: serverState.level,
            xp: serverState.xp,
            streak: serverState.streak,
          },
        }),
      });
    });

    await page.route('**/api/dashboard', async (route) => {
      eventLog.push('GET /api/dashboard');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Alex',
            displayName: 'Alex',
            username: 'learner',
            email: 'learner@example.com',
            level: serverState.level,
            xp: serverState.xp,
            xpToNext: serverState.xpToNext,
          },
          streak: {
            current: serverState.streak,
            best: serverState.streak,
            activeToday: serverState.streak > 0,
          },
          stats: {
            missionsCompleted: serverState.missionsCompleted,
            missionsTotal: 2,
            totalXp: serverState.xp,
          },
          worlds: [
            {
              id: 1,
              name: 'Terminal Shell',
              orderIndex: 1,
              unlocked: true,
              progress: serverState.mission1Status === 'completed' ? 50 : 0,
              missions: [
                {
                  id: 1,
                  title: 'Explore Your Terminal',
                  status: serverState.mission1Status,
                  xpReward: 50,
                },
                {
                  id: 2,
                  title: 'Navigating Directories',
                  status: serverState.mission1Status === 'completed' ? 'current' : 'locked',
                  xpReward: 100,
                },
              ],
              boss: null,
            },
          ],
          todaysMission: {
            id: serverState.mission1Status === 'completed' ? 2 : 1,
            title:
              serverState.mission1Status === 'completed'
                ? 'Navigating Directories'
                : 'Explore Your Terminal',
            worldName: 'Terminal Shell',
            xpReward: serverState.mission1Status === 'completed' ? 100 : 50,
          },
          leaderboard: [],
          nextWorld: null,
        }),
      });
    });

    await page.route('**/api/missions/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          mission: {
            id: 1,
            worldId: 1,
            worldName: 'Terminal Shell',
            worldOrderIndex: 1,
            orderIndex: 1,
            type: 'mission',
            title: 'Explore Your Terminal',
            description: 'Create hello.txt',
            goal: 'Create hello.txt',
            xpReward: 50,
            instructions: 'Create hello.txt',
            steps: [{ id: 's1', text: 'Create hello.txt', check: 'test -f hello.txt' }],
            seedFiles: [],
            setupScript: '',
            validateScript: 'true',
            totalHints: 0,
            hintsUsed: 0,
            revealedHints: [],
            userProgress: null,
          },
        }),
      });
    });

    await page.route('**/api/missions/1/start', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, missionId: 1, status: 'in_progress' }),
      });
    });

    await page.route('**/api/missions/1/complete', async (route) => {
      eventLog.push('POST /api/missions/1/complete');
      // Simulate server awarding +500 XP so level also transitions 1 -> 2 and stats update
      serverState.xp = 500;
      serverState.level = 2;
      serverState.xpToNext = 1150;
      serverState.streak = 1;
      serverState.missionsCompleted = 1;
      serverState.mission1Status = 'completed';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          alreadyCompleted: false,
          xpAwarded: 500,
          totalXp: 500,
          newLevel: 2,
          levelTitle: 'Egg',
          streak: 1,
          nextMission: { id: 2, title: 'Navigating Directories' },
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('tux_token', 'mock-jwt-token');
      localStorage.setItem(
        'tux_user',
        JSON.stringify({
          id: 7,
          username: 'learner',
          email: 'learner@example.com',
          displayName: 'Alex',
          name: 'Alex',
          level: 1,
          xp: 0,
          streak: 0,
        })
      );
    });

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // 1. Initial dashboard & sidebar state shows 0 XP / 500, Level 1, 0 missions done
    const levelSection = page.getByRole('region', { name: 'Level and experience' });
    await expect(levelSection).toBeVisible();
    await expect(levelSection.getByText('Level 1 · Egg')).toBeVisible();
    await expect(levelSection.getByText('0 XP')).toBeVisible();
    await expect(levelSection.getByText('/ 500')).toBeVisible();

    const missionStats = page.getByRole('region', { name: 'Mission progress' });
    await expect(missionStats).toContainText('0Missions done');
    await expect(missionStats).toContainText('0Total XP');

    await expect(page.getByTestId('user-level')).toContainText('Lv.1 · 0 XP');

    // 2. Navigate via SPA to Mission 1 and complete it
    await page.getByRole('button', { name: 'Start mission: Explore Your Terminal' }).click();

    const checkBtn = page.getByRole('button', { name: 'Check my work' });
    await expect(checkBtn).toBeVisible({ timeout: 15000 });
    await checkBtn.click();

    // 3. Verify complete -> refresh sequence happened before showing celebration
    const celebration = page.getByTestId('tux-celebration');
    await expect(celebration).toBeVisible({ timeout: 10000 });

    const completeIndex = eventLog.indexOf('POST /api/missions/1/complete');
    const refreshAfterCompleteIndex = eventLog.indexOf('GET /api/dashboard', completeIndex + 1);
    expect(completeIndex).toBeGreaterThan(-1);
    expect(refreshAfterCompleteIndex).toBeGreaterThan(completeIndex);

    // Dismiss celebration & click Back to Learning Path (SPA navigation, no page reload)
    await celebration.click();
    const backBtn = page.getByRole('button', { name: 'Back to Learning Path' });
    await expect(backBtn).toBeVisible({ timeout: 5000 });
    await backBtn.click();

    // 4. All dashboard & sidebar components reflect updated 500 XP, Lv.2, streak, and 1 mission done
    const updatedLevelSection = page.getByRole('region', { name: 'Level and experience' });
    await expect(updatedLevelSection.getByText('Level 2 · Egg')).toBeVisible();
    await expect(updatedLevelSection.getByText('500 XP')).toBeVisible();
    await expect(updatedLevelSection.getByText('/ 1,150')).toBeVisible();

    const updatedStats = page.getByRole('region', { name: 'Mission progress' });
    await expect(updatedStats).toContainText('1Missions done');
    await expect(updatedStats).toContainText('500Total XP');

    await expect(page.getByTestId('user-level')).toContainText('Lv.2 · 500 XP');
    await page.getByTestId('user-button').click();
    await expect(page.getByTestId('popover-level-xp')).toHaveText('Level 2 · 500 XP');
  });
});

