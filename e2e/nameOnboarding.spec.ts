import { test, expect } from '@playwright/test';

const DASHBOARD_STUB = {
  user: {
    name: 'Madhavan-V',
    displayName: 'Madhavan-V',
    username: 'madhavan_101',
    email: 'madhavan@example.com',
    level: 1,
    xp: 0,
    xpToNext: 500,
  },
  streak: { current: 1, best: 1, activeToday: true },
  stats: { missionsCompleted: 0, missionsTotal: 1, totalXp: 0 },
  worlds: [
    {
      id: 1,
      name: 'Terminal Shell',
      orderIndex: 1,
      unlocked: true,
      progress: 0,
      missions: [{ id: 1, title: 'Echo & Print', status: 'current', xpReward: 50 }],
      boss: null,
    },
  ],
  todaysMission: { id: 1, title: 'Echo & Print', worldName: 'Terminal Shell', xpReward: 50 },
  leaderboard: [],
  nextWorld: null,
};

test.describe('Name Setup Onboarding Flow', () => {
  test('OTP verification with empty name opens /onboarding/name, validates input, saves trimmed name, and redirects to /dashboard', async ({
    page,
  }) => {
    let savedPatchPayload: Record<string, unknown> | null = null;
    let savedName: string | null = null;

    await page.route('**/api/auth/check-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ exists: false, verified: false }),
      });
    });

    await page.route('**/api/auth/{register,send-otp}', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, cooldownSeconds: 30 }),
      });
    });

    await page.route('**/api/auth/verify-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'mock-otp-jwt',
          needsNameSetup: true,
          redirectTo: '/onboarding/name',
          user: {
            id: 10,
            username: 'madhavan_101',
            email: 'madhavan@example.com',
            displayName: null,
            name: null,
            level: 1,
            xp: 0,
            streak: 1,
          },
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 10,
            username: 'madhavan_101',
            email: 'madhavan@example.com',
            displayName: savedName,
            name: savedName,
            level: 1,
            xp: 0,
            streak: 1,
          },
        }),
      });
    });

    await page.route('**/api/user/name', async (route) => {
      const req = route.request();
      expect(req.method()).toBe('PATCH');
      savedPatchPayload = req.postDataJSON() as Record<string, unknown>;
      savedName = String(savedPatchPayload.name ?? '');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          redirectTo: '/dashboard',
          user: {
            id: 10,
            username: 'madhavan_101',
            email: 'madhavan@example.com',
            displayName: savedName,
            name: savedName,
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
        body: JSON.stringify(DASHBOARD_STUB),
      });
    });

    // Step 1: Go to Sign up, submit email + password to reach OTP screen
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Sign up for free' }).click();
    await page.locator('#signup-email').fill('madhavan@example.com');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.locator('#signup-password').fill('StrongPass1!');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Step 2: Enter 6-digit OTP -> verify triggers navigation to /onboarding/name
    const otpInputs = page.locator('.otp-single-box');
    await expect(otpInputs).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(String(i + 1));
    }

    await expect(page).toHaveURL(/\/onboarding\/name$/);
    await expect(page.getByRole('heading', { name: 'What should we call you?' })).toBeVisible();
    await expect(
      page.getByText("This is how you'll appear on leaderboards and your profile.")
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /skip/i })).toHaveCount(0);

    const nameInput = page.getByPlaceholder('Enter your name');
    const submitBtn = page.getByRole('button', { name: /Let's go/i });

    // Step 3: Validation checks
    await nameInput.fill('A');
    await submitBtn.click();
    await expect(page.getByRole('alert')).toContainText('at least 2 characters');

    await nameInput.fill('Madhavan!');
    await submitBtn.click();
    await expect(page.getByRole('alert')).toContainText('Only letters, numbers, spaces, and hyphens');

    await nameInput.fill('A'.repeat(31));
    await submitBtn.click();
    await expect(page.getByRole('alert')).toContainText('30 characters or fewer');

    // Step 4: Valid trimmed submit -> PATCH /api/user/name & redirect to /dashboard
    await nameInput.fill('  Madhavan-V  ');
    await submitBtn.click();

    await expect(page).toHaveURL(/\/dashboard$/);
    expect(savedPatchPayload).toEqual({ name: 'Madhavan-V' });
    await expect(page.getByTestId('user-name')).toHaveText('Madhavan-V');
  });

  test('OTP verification skips onboarding when user already has a saved name, and /onboarding/name guard redirects to /dashboard', async ({
    page,
  }) => {
    await page.route('**/api/auth/check-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ exists: false, verified: false }),
      });
    });

    await page.route('**/api/auth/{register,send-otp}', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, cooldownSeconds: 30 }),
      });
    });

    await page.route('**/api/auth/verify-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'mock-existing-jwt',
          needsNameSetup: false,
          redirectTo: '/dashboard',
          user: {
            id: 11,
            username: 'madhavan_102',
            email: 'madhavan@example.com',
            displayName: 'Madhavan',
            name: 'Madhavan',
            level: 2,
            xp: 200,
            streak: 3,
          },
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 11,
            username: 'madhavan_102',
            email: 'madhavan@example.com',
            displayName: 'Madhavan',
            name: 'Madhavan',
            level: 2,
            xp: 200,
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
          ...DASHBOARD_STUB,
          user: { ...DASHBOARD_STUB.user, displayName: 'Madhavan', name: 'Madhavan' },
        }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Sign up for free' }).click();
    await page.locator('#signup-email').fill('madhavan@example.com');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.locator('#signup-password').fill('StrongPass1!');
    await page.getByRole('button', { name: 'Create account' }).click();

    const otpInputs = page.locator('.otp-single-box');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(String(i + 1));
    }

    await expect(page).toHaveURL(/\/dashboard$/);

    // Direct navigation to /onboarding/name when name already exists must redirect to /dashboard
    await page.goto('/onboarding/name', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('new Google user with displayName sees confirmation card and confirms with "Yes, that\'s me"', async ({
    page,
  }) => {
    let patchedName: string | null = null;

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 21,
            username: 'madhavan_v',
            email: 'madhavan@gmail.com',
            displayName: patchedName ?? 'Madhavan V',
            name: patchedName ?? 'Madhavan V',
            level: 1,
            xp: 0,
            streak: 0,
          },
        }),
      });
    });

    await page.route('**/api/user/name', async (route) => {
      const body = route.request().postDataJSON() as { name: string };
      patchedName = body.name;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          redirectTo: '/dashboard',
          user: {
            id: 21,
            username: 'madhavan_v',
            email: 'madhavan@gmail.com',
            displayName: patchedName,
            name: patchedName,
            level: 1,
            xp: 0,
            streak: 0,
          },
        }),
      });
    });

    await page.route('**/api/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...DASHBOARD_STUB,
          user: { ...DASHBOARD_STUB.user, displayName: 'Madhavan V', name: 'Madhavan V' },
        }),
      });
    });

    await page.goto('/?auth_token=mock-google-jwt&is_new=true&google_name=Madhavan%20V', {
      waitUntil: 'domcontentloaded',
    });

    await expect(page).toHaveURL(/\/onboarding\/name$/);
    await expect(page.getByRole('heading', { name: 'Is this your name?' })).toBeVisible();
    await expect(page.getByTestId('google-name-card')).toHaveText('Madhavan V');
    await expect(page.getByRole('button', { name: /skip/i })).toHaveCount(0);

    await page.getByRole('button', { name: "Yes, that's me" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(patchedName).toBe('Madhavan V');
    await expect(page.getByTestId('user-name')).toHaveText('Madhavan V');
  });

  test('new Google user can click "Edit name" to edit pre-filled Google name before saving', async ({
    page,
  }) => {
    let patchedName: string | null = null;

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 22,
            username: 'madhavan_v2',
            email: 'madhavan2@gmail.com',
            displayName: patchedName ?? 'Madhavan V',
            name: patchedName ?? 'Madhavan V',
            level: 1,
            xp: 0,
            streak: 0,
          },
        }),
      });
    });

    await page.route('**/api/user/name', async (route) => {
      const body = route.request().postDataJSON() as { name: string };
      patchedName = body.name;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          redirectTo: '/dashboard',
          user: {
            id: 22,
            username: 'madhavan_v2',
            email: 'madhavan2@gmail.com',
            displayName: patchedName,
            name: patchedName,
            level: 1,
            xp: 0,
            streak: 0,
          },
        }),
      });
    });

    await page.route('**/api/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...DASHBOARD_STUB,
          user: { ...DASHBOARD_STUB.user, displayName: 'Madhavan Vairava', name: 'Madhavan Vairava' },
        }),
      });
    });

    await page.goto('/?auth_token=mock-google-jwt&is_new=true&google_name=Madhavan%20V', {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByRole('heading', { name: 'Is this your name?' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit name' }).click();

    await expect(page.getByRole('heading', { name: 'What should we call you?' })).toBeVisible();
    const input = page.getByPlaceholder('Enter your name');
    await expect(input).toHaveValue('Madhavan V');

    await input.fill('Madhavan Vairava');
    await page.getByRole('button', { name: /Let's go/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    expect(patchedName).toBe('Madhavan Vairava');
    await expect(page.getByTestId('user-name')).toHaveText('Madhavan Vairava');
  });

  test('new Google user without displayName sees blank input screen, and returning Google user goes straight to /dashboard', async ({
    page,
  }) => {
    await page.route('**/api/auth/me', async (route) => {
      const authHeader = route.request().headers()['authorization'] || '';
      const isReturning = authHeader.includes('returning-jwt');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: isReturning
            ? {
                id: 23,
                username: 'returning_user',
                email: 'returning@gmail.com',
                displayName: 'Returning Dev',
                name: 'Returning Dev',
                level: 3,
                xp: 600,
                streak: 4,
              }
            : {
                id: 24,
                username: 'noname_google',
                email: 'noname@gmail.com',
                displayName: null,
                name: null,
                level: 1,
                xp: 0,
                streak: 0,
              },
        }),
      });
    });

    await page.route('**/api/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...DASHBOARD_STUB,
          user: { ...DASHBOARD_STUB.user, displayName: 'Returning Dev', name: 'Returning Dev' },
        }),
      });
    });

    // Case A: Google account with no name -> blank input screen
    await page.goto('/?auth_token=noname-jwt&is_new=true', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/onboarding\/name$/);
    await expect(page.getByRole('heading', { name: 'What should we call you?' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your name')).toHaveValue('');

    // Clear session and test Case B: Returning Google user -> skips onboarding
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?auth_token=returning-jwt&is_new=false', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('user-name')).toHaveText('Returning Dev');
  });
});

