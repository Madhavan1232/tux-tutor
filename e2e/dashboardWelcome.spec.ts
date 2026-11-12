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

    const sidebar = page.getByRole('complementary', { name: 'Main navigation' });
    await expect(sidebar.getByTestId('sidebar-welcome')).toHaveCount(0);

    // Main content has no "Welcome back" heading and starts with clean Option A breadcrumb + subtitle
    await expect(page.getByRole('main').getByText(/Welcome back/i)).toHaveCount(0);
    const breadcrumb = page.getByTestId('path-breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toHaveText('Linux Mastery Path');
    await expect(breadcrumb.locator('svg.lucide-route')).toBeVisible();
    await expect(breadcrumb.locator('svg.lucide-navigation')).toHaveCount(0);

    const headerStyles = await page.evaluate(() => {
      const bc = document.querySelector('[data-testid="path-breadcrumb"]');
      const sub = document.querySelector('[data-testid="path-subtitle"]');
      const summary = document.querySelector('[data-testid="modules-cleared-summary"]');
      const countEl = summary?.querySelector('strong');
      const bcs = bc ? getComputedStyle(bc) : null;
      const subs = sub ? getComputedStyle(sub) : null;
      const sums = summary ? getComputedStyle(summary) : null;
      const cs = countEl ? getComputedStyle(countEl) : null;
      return {
        bcFont: bcs?.fontFamily,
        bcSize: bcs?.fontSize,
        bcWeight: bcs?.fontWeight,
        bcColor: bcs?.color,
        bcTransform: bcs?.textTransform,
        bcBorderWidth: bcs?.borderTopWidth,
        bcBg: bcs?.backgroundColor,
        subSize: subs?.fontSize,
        subColor: subs?.color,
        subWeight: subs?.fontWeight,
        sumColor: sums?.color,
        countColor: cs?.color,
      };
    });
    expect(headerStyles.bcFont).toContain('Space Grotesk');
    expect(headerStyles.bcSize).toBe('12px');
    expect(headerStyles.bcWeight).toBe('600');
    expect(headerStyles.bcColor).toBe('rgb(240, 180, 41)');
    expect(headerStyles.bcTransform).toBe('uppercase');
    expect(headerStyles.bcBorderWidth).toBe('0px');
    expect(headerStyles.bcBg).toBe('rgba(0, 0, 0, 0)');
    expect(headerStyles.subSize).toBe('14px');
    expect(headerStyles.subColor).toBe('rgb(107, 114, 128)');
    expect(headerStyles.subWeight).toBe('400');
    expect(headerStyles.sumColor).toBe('rgb(107, 114, 128)');
    expect(headerStyles.countColor).toBe('rgb(240, 180, 41)');

    await expect(page.getByTestId('path-subtitle')).toContainText(
      'Build real Linux skills — one mission at a time.'
    );
    await expect(page.getByTestId('modules-cleared-summary')).toContainText('0 of 1 Modules Cleared');
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

    await expect(page.getByTestId('sidebar-welcome')).toHaveCount(0);
    await expect(page.getByRole('main').getByText(/Welcome back/i)).toHaveCount(0);
    await expect(page.getByTestId('user-name')).toHaveText('Madhavanvairava');
  });

  test('renders redesigned module card labels, cleared pill, progress text, and metadata', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 1,
            username: 'madhavan',
            email: 'madhavan@example.com',
            displayName: 'Madhavan',
            name: 'Madhavan',
            level: 2,
            xp: 650,
            streak: 3,
          },
        }),
      });
    });

    await page.route('**/api/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Madhavan',
            displayName: 'Madhavan',
            level: 2,
            xp: 650,
            xpToNext: 1000,
          },
          streak: { current: 3, best: 3, activeToday: true },
          stats: { missionsCompleted: 11, missionsTotal: 18, totalXp: 650 },
          worlds: [
            {
              id: 1,
              name: 'Terminal Shell',
              orderIndex: 1,
              unlocked: true,
              progress: 100,
              missions: [
                { id: 1, title: 'M1', status: 'completed', xpReward: 50 },
                { id: 2, title: 'M2', status: 'completed', xpReward: 50 },
                { id: 3, title: 'M3', status: 'completed', xpReward: 50 },
                { id: 4, title: 'M4', status: 'completed', xpReward: 50 },
                { id: 5, title: 'M5', status: 'completed', xpReward: 50 },
              ],
              boss: { id: 101, status: 'completed' },
            },
            {
              id: 2,
              name: 'Filesystem Hierarchy',
              orderIndex: 2,
              unlocked: true,
              progress: 83,
              missions: [
                { id: 6, title: 'M6', status: 'completed', xpReward: 50 },
                { id: 7, title: 'M7', status: 'completed', xpReward: 50 },
                { id: 8, title: 'M8', status: 'completed', xpReward: 50 },
                { id: 9, title: 'M9', status: 'completed', xpReward: 50 },
                { id: 10, title: 'M10', status: 'completed', xpReward: 50 },
              ],
              boss: { id: 102, status: 'current' },
            },
            {
              id: 3,
              name: 'Streams & Pipelines',
              orderIndex: 3,
              unlocked: false,
              progress: 0,
              missions: [{ id: 11, title: 'M11', status: 'locked', xpReward: 50 }],
              boss: null,
            },
          ],
          todaysMission: {
            id: 102,
            title: 'Boss · Filesystem Hierarchy',
            worldName: 'Filesystem Hierarchy',
            xpReward: 150,
          },
          leaderboard: [],
          nextWorld: null,
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('tux_token', 'mock-jwt-token');
      localStorage.setItem(
        'tux_user',
        JSON.stringify({
          id: 1,
          username: 'madhavan',
          email: 'madhavan@example.com',
          level: 2,
          xp: 650,
        })
      );
    });

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const world1 = page.getByRole('region', { name: 'World 1: Terminal Shell' });
    await expect(world1).toBeVisible();

    const zoneTag1 = world1.getByText('MODULE 01 · TERMINAL SHELL');
    await expect(zoneTag1).toBeVisible();
    const zoneTagStyles = await zoneTag1.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        fontSize: s.fontSize,
        letterSpacing: s.letterSpacing,
        fontVariantCaps: s.fontVariantCaps,
        borderTopWidth: s.borderTopWidth,
        backgroundColor: s.backgroundColor,
        color: s.color,
      };
    });
    expect(zoneTagStyles.fontSize).toBe('11px');
    expect(zoneTagStyles.letterSpacing).toBe('1.1px');
    expect(zoneTagStyles.fontVariantCaps).toBe('small-caps');
    expect(zoneTagStyles.borderTopWidth).toBe('0px');
    expect(zoneTagStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');

    const clearedPill = world1.getByText('Cleared');
    await expect(clearedPill).toBeVisible();
    await expect(clearedPill.locator('svg')).toHaveCount(1);
    const pillStyles = await clearedPill.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        backgroundColor: s.backgroundColor,
        color: s.color,
        fontSize: s.fontSize,
        borderRadius: s.borderRadius,
        padding: s.padding,
      };
    });
    expect(pillStyles.backgroundColor).toBe('rgba(201, 168, 76, 0.125)');
    expect(pillStyles.color).toBe('rgb(201, 168, 76)');
    expect(pillStyles.fontSize).toBe('11px');
    expect(pillStyles.borderRadius).toBe('4px');
    expect(pillStyles.padding).toBe('2px 8px');

    const worldTitle1 = world1.getByRole('heading', { level: 3, name: 'Terminal Shell' });
    const titleStyles = await worldTitle1.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fontSize: s.fontSize, fontWeight: s.fontWeight, color: s.color };
    });
    expect(titleStyles.fontSize).toBe('18px');
    expect(titleStyles.fontWeight).toBe('600');
    expect(titleStyles.color).toBe('rgb(255, 255, 255)');

    await expect(world1.getByText('100%', { exact: true })).toBeVisible();
    await expect(world1.getByText('6 / 6 missions completed')).toBeVisible();

    const world2 = page.getByRole('region', { name: 'World 2: Filesystem Hierarchy' });
    await expect(world2.getByText('MODULE 02 · FILESYSTEM HIERARCHY')).toBeVisible();
    await expect(world2.getByText('83%', { exact: true })).toBeVisible();
    await expect(world2.getByText('5 / 6 missions completed')).toBeVisible();

    const world2Toggle = world2.locator('button[aria-controls="world-2-path"]');
    if ((await world2Toggle.getAttribute('aria-expanded')) !== 'true') {
      await world2Toggle.click();
    }
    await expect(world2.getByText('6 missions · ~45 min')).toBeVisible();
    await expect(world2.getByText(/Winding Mission Path/i)).toHaveCount(0);
    await expect(world2.getByText(/Advance along the path/i)).toHaveCount(0);

    const world3 = page.getByRole('region', { name: 'World 3: Streams & Pipelines' });
    await expect(world3.getByText('LOCKED MODULE')).toBeVisible();
    await expect(world3.getByText('Complete Module 02 to unlock')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

