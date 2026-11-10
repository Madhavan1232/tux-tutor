import { test, expect } from '@playwright/test';

test.describe('Mission Workspace — Interactive Linux Terminal', () => {
  test('renders mission workspace split view with instructions and terminal', async ({ page }) => {
    // Navigate directly to World 1 Mission 1
    await page.goto('/missions/1');

    // Wait for the workspace root to mount
    const workspace = page.locator('div[data-theme="workspace"]');
    await expect(workspace).toBeVisible({ timeout: 15000 });

    // Verify top breadcrumbs
    await expect(page.getByText('World 1')).toBeVisible();
    await expect(page.getByText('Explore Your Terminal: pwd & ls')).toBeVisible();

    // Verify Tab controls in the Preview Panel
    const taskTabBtn = page.getByRole('tab', { name: 'Task' });
    const filesTabBtn = page.getByRole('tab', { name: 'Files' });
    const hintsTabBtn = page.getByRole('tab', { name: 'Hints' });

    await expect(taskTabBtn).toBeVisible();
    await expect(filesTabBtn).toBeVisible();
    await expect(hintsTabBtn).toBeVisible();

    // Verify Task tab content
    await expect(page.getByText('Mission Goal')).toBeVisible();
    await expect(page.getByText('Mission Objectives')).toBeVisible();
    await expect(page.getByText('Create hello.txt containing the word "tux"')).toBeVisible();

    // Switch to Files tab
    await filesTabBtn.click();
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();

    // Switch to Hints tab
    await hintsTabBtn.click();
    await expect(page.getByText('Guidance & Hints')).toBeVisible();
    await expect(page.getByText(/Reveal Hint 1/i)).toBeVisible();

    // Verify Right Terminal Area & CheerpX Credit
    const terminalRegion = page.getByRole('region', { name: 'Linux Interactive Terminal' });
    await expect(terminalRegion).toBeVisible();
    await expect(page.getByText('Terminal powered by')).toBeVisible();
    const cheerpxLink = page.getByRole('link', { name: 'CheerpX' });
    await expect(cheerpxLink).toHaveAttribute('href', 'https://cheerpx.io');

    // Verify Terminal Toolbar controls
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check my work' })).toBeVisible();
  });
});
