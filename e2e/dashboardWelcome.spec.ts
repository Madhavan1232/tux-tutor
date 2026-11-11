import { test, expect } from '@playwright/test';

const MOCK_WORLDS = [
  {
    id: 1,
    name: 'Linux Basics',
    orderIndex: 1,
    unlocked: true,
    progress: 0,
    missions: [
      { id: 1, title: 'Explore Your Terminal', status: 'current', xpReward: 50 },
    ],
    boss: null,
  },
];

function buildDashboardPayload(userOverrides: Record<string, unknown>) {
  return {
    user: {
      level: 1,
      xp: 0,
      xpToNext: 500,
      ...userOverrides,
    },
    streak: { current: 1, best: 1, activeToday: true },
    stats: { missionsCompleted: 0, missionsTotal: 1, totalXp: 0 },
    worlds: MOCK_WORLDS,
    todaysMission: { id: 1, title: 'Explore Your Terminal', worldName: 'Linux Basics', xpReward: 50 },
    leaderboard: [],
    nextWorld: null,
  };
}

test.describe('Dashboard Welcome Message & Display Name', () => {
  test('shows saved displayName in welcome message and sidebar', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 1,
            username: 'madhavanvairava_380',
            email: 'madhavanvairava_380@gmail.com',
            displayName: 'Madhavan',
            name: 'Madhavan',
            level: 1,
            xp: 0,
            streak: 1,
          },
        }),
      });
    });

    await page.route('**/api/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          buildDashboardPayload({
            name: 'Madhavan',
            displayName: 'Madhavan',
            username: 'madhavanvairava_380',
            email: 'madhavanvairava_380@gmail.com',
          })
        ),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('tux_token', 'mock-jwt-token');
      localStorage.setItem(
        'tux_user',
        JSON.stringify({
          id: 1,
          username: 'madhavanvairava_380',
          email: 'madhavanvairava_380@gmail.com',
          level: 1,
          xp: 0,
        })
      );
    });

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveText('Welcome back, Madhavan.');
    await expect(page.getByTestId('user-name')).toHaveText('Madhavan');
  });

  test('falls back to cleaned email prefix when displayName is missing', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 2,
            username: 'madhavanvairava_380',
            email: 'madhavanvairava_380@gmail.com',
            displayName: null,
            level: 1,
            xp: 0,
            streak: 1,
          },
        }),
      });
    });

    await page.route('**/api/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          buildDashboardPayload({
            displayName: null,
            username: 'madhavanvairava_380',
            email: 'madhavanvairava_380@gmail.com',
          })
        ),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('tux_token', 'mock-jwt-token');
      localStorage.setItem(
        'tux_user',
        JSON.stringify({
          id: 2,
          username: 'madhavanvairava_380',
          email: 'madhavanvairava_380@gmail.com',
          level: 1,
          xp: 0,
        })
      );
    });

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveText('Welcome back, Madhavanvairava.');
    await expect(page.getByTestId('user-name')).toHaveText('Madhavanvairava');
  });
});

