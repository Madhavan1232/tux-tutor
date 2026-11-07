import { test, expect } from '@playwright/test';

// We mock localStorage to simulate a logged-in user
test.beforeEach(async ({ page }) => {
  // Set the user in localStorage BEFORE the app loads so it's available on first render
  await page.addInitScript(() => {
    localStorage.setItem('tux_user', JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      level: 5,
      xp: 1200,
    }));
  });

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // Wait for the 600ms splash screen to finish and the sidebar to appear
  await page.getByTestId('user-button').waitFor({ state: 'visible', timeout: 5000 });
});

test('Test 1: UserButton renders in sidebar with avatar initials', async ({ page }) => {
  const avatar = page.getByTestId('user-avatar');
  await expect(avatar).toBeVisible();
  await expect(avatar).toContainText('TU'); // "Test User" → "TU"
});

test('Test 2: Clicking UserButton opens the popover', async ({ page }) => {
  const btn = page.getByTestId('user-button');
  await btn.click();
  await expect(page.getByTestId('user-popover')).toBeVisible();
});

test('Test 3: Popover shows name, email, level, XP', async ({ page }) => {
  await page.getByTestId('user-button').click();
  await expect(page.getByTestId('popover-name')).toHaveText('Test User');
  await expect(page.getByTestId('popover-email')).toHaveText('test@example.com');
  const levelXp = page.getByTestId('popover-level-xp');
  await expect(levelXp).toContainText('Level 5');
  await expect(levelXp).toContainText('1,200 XP');
});

test('Test 4: Clicking Sign out triggers logout', async ({ page }) => {
  await page.getByTestId('user-button').click();
  await page.getByTestId('menu-sign-out').click();
  // After sign-out, app should navigate back to auth page (no sidebar)
  await expect(page.getByTestId('user-button')).not.toBeVisible({ timeout: 3000 });
});

test('Test 5: Popover closes when clicking outside', async ({ page }) => {
  await page.getByTestId('user-button').click();
  await expect(page.getByTestId('user-popover')).toBeVisible();
  // Click outside the popover
  await page.mouse.click(10, 10);
  await expect(page.getByTestId('user-popover')).not.toBeVisible();
});
