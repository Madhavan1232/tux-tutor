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

test('Test 6: Sidebar omits Profile and Settings tabs while popover retains them', async ({ page }) => {
  const sidebarNav = page.getByRole('complementary', { name: 'Main navigation' }).locator('nav');
  await expect(sidebarNav.getByRole('link')).toHaveCount(5);
  await expect(sidebarNav.getByRole('link', { name: 'Profile' })).toHaveCount(0);
  await expect(sidebarNav.getByRole('link', { name: 'Settings' })).toHaveCount(0);

  const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
  await expect(mobileNav.locator('a')).toHaveCount(5);
  await expect(mobileNav.locator('a[aria-label="Profile"]')).toHaveCount(0);
  await expect(mobileNav.locator('a[aria-label="Settings"]')).toHaveCount(0);

  await page.getByTestId('user-button').click();
  const popover = page.getByTestId('user-popover');
  await expect(popover.getByRole('button', { name: 'View Profile' })).toBeVisible();
  await expect(popover.getByRole('button', { name: 'Settings' })).toBeVisible();
});

test('Test 7: Sidebar brand title renders TUX (bold charcoal) + TUTOR (semibold gold) in Space Grotesk', async ({ page }) => {
  const brandLink = page.getByRole('complementary', { name: 'Main navigation' }).getByRole('link', { name: 'Tux Tutor' });
  await expect(brandLink).toBeVisible();

  const tuxSpan = brandLink.locator('span', { hasText: /^TUX$/ });
  const tutorSpan = brandLink.locator('span', { hasText: /^TUTOR$/ });
  await expect(tuxSpan).toBeVisible();
  await expect(tutorSpan).toBeVisible();

  const tuxStyle = await tuxSpan.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, letterSpacing: cs.letterSpacing };
  });
  const tutorStyle = await tutorSpan.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color };
  });
  const navLabelFont = await page
    .getByRole('complementary', { name: 'Main navigation' })
    .locator('nav a span')
    .nth(1)
    .evaluate((el) => getComputedStyle(el).fontFamily);

  expect(tuxStyle.fontFamily).toContain('Space Grotesk');
  expect(tuxStyle.fontSize).toBe('20px');
  expect(tuxStyle.fontWeight).toBe('700');
  expect(tuxStyle.color).toBe('rgb(29, 29, 31)');

  expect(tutorStyle.fontFamily).toContain('Space Grotesk');
  expect(tutorStyle.fontSize).toBe('20px');
  expect(tutorStyle.fontWeight).toBe('600');
  expect(tutorStyle.color).toBe('rgb(201, 168, 76)');

  expect(navLabelFont).not.toContain('Space Grotesk');
});
