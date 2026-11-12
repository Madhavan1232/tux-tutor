import { test, expect } from '@playwright/test';

function buildWindingPathDashboard() {
  return {
    user: {
      name: 'Alex',
      displayName: 'Alex',
      username: 'learner',
      email: 'learner@example.com',
      level: 2,
      xp: 350,
      xpToNext: 500,
    },
    streak: { current: 2, best: 2, activeToday: true },
    stats: { missionsCompleted: 3, missionsTotal: 4, totalXp: 350 },
    worlds: [
      {
        id: 1,
        name: 'Terminal Shell',
        orderIndex: 1,
        unlocked: true,
        progress: 75,
        missions: [
          { id: 1, title: 'Echo & Print', status: 'completed', xpReward: 50 },
          { id: 2, title: 'Navigate Dirs', status: 'completed', xpReward: 50 },
          { id: 3, title: 'List Files', status: 'completed', xpReward: 50 },
        ],
        boss: { id: 4, title: 'Shell Mastery', status: 'current', xpReward: 150 },
      },
    ],
    todaysMission: {
      id: 4,
      title: 'Shell Mastery',
      worldName: 'Terminal Shell',
      xpReward: 150,
    },
    leaderboard: [],
    nextWorld: null,
  };
}

test.describe('Winding Mission Path UI & Alignment', () => {
  test('starts with top fade lead-in, passes through all node centers, and connects cleanly into 72px Final Assessment node', async ({
    page,
  }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 1,
            username: 'learner',
            email: 'learner@example.com',
            displayName: 'Alex',
            name: 'Alex',
            level: 2,
            xp: 350,
            streak: 2,
          },
        }),
      });
    });

    await page.route('**/api/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWindingPathDashboard()),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('tux_token', 'mock-jwt-token');
    });

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const bossButton = page.getByRole('button', {
      name: /Final Assessment: Module 1/i,
    });
    await expect(bossButton).toBeVisible();
    await bossButton.scrollIntoViewIfNeeded();
    // Wait briefly for Framer Motion reveal transition to settle at scale:1, y:0
    await page.waitForTimeout(700);

    // 1. Verify top lead-in gradient mask + ~60px vertical lead-in before first node
    const trackPath = page.getByTestId('snake-path-track-1');
    await expect(trackPath).toBeVisible();
    const dAttr = await trackPath.getAttribute('d');
    expect(dAttr).toBeTruthy();

    // Verify top fade gradient & mask elements exist inside the SVG
    const svgInfo = await trackPath.evaluate((pathEl) => {
      const svg = pathEl.closest('svg');
      if (!svg) return null;
      const mask = svg.querySelector('#path-top-fade-mask-1');
      const grad = svg.querySelector('#path-top-fade-grad-1');
      const stops = grad ? Array.from(grad.querySelectorAll('stop')) : [];
      const svgRect = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      return {
        hasMask: Boolean(mask),
        hasGrad: Boolean(grad),
        stopOpacities: stops.map((s) => s.getAttribute('stop-opacity')),
        viewBoxWidth: vb.width,
        viewBoxHeight: vb.height,
        rect: {
          left: svgRect.left,
          top: svgRect.top,
          width: svgRect.width,
          height: svgRect.height,
        },
        pathZonePaddingBottom: getComputedStyle(
          svg.closest('div[class*="pathZone"]') ?? svg.parentElement!
        ).paddingBottom,
      };
    });

    expect(svgInfo).not.toBeNull();
    expect(svgInfo!.hasMask).toBe(true);
    expect(svgInfo!.hasGrad).toBe(true);
    expect(svgInfo!.stopOpacities[0]).toBe('0');
    expect(svgInfo!.stopOpacities[svgInfo!.stopOpacities.length - 1]).toBe('1');
    expect(svgInfo!.pathZonePaddingBottom).toBe('120px');

    // Parse all node waypoints from the SVG path string:
    // Format: M x0 (y0-60) L x0 y0 C c1x c1y c2x c2y x1 y1 ...
    const leadMatch = dAttr!.match(/^M\s+([\d.-]+)\s+([\d.-]+)\s+L\s+([\d.-]+)\s+([\d.-]+)/);
    expect(leadMatch).not.toBeNull();
    const leadStartX = Number(leadMatch![1]);
    const leadStartY = Number(leadMatch![2]);
    const firstNodeX = Number(leadMatch![3]);
    const firstNodeY = Number(leadMatch![4]);

    expect(leadStartX).toBeCloseTo(firstNodeX, 1);
    expect(firstNodeY - leadStartY).toBeCloseTo(60, 1);

    const curveMatches = Array.from(
      dAttr!.matchAll(/C\s+[\d.-]+[\s,]+[\d.-]+[\s,]+[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.-]+)[\s,]+([\d.-]+)/g)
    );
    const svgNodes = [
      { x: firstNodeX, y: firstNodeY },
      ...curveMatches.map((m) => ({ x: Number(m[1]), y: Number(m[2]) })),
    ];

    // Expect 3 regular mission nodes + 1 final assessment node = 4 nodes
    expect(svgNodes).toHaveLength(4);

    // 2. Measure every rendered node button center inside the path list and assert SVG alignment <= 2px
    const nodeList = page.getByRole('list', { name: /Learning path for Terminal Shell/i });
    const listButtons = await nodeList.locator('button').evaluateAll((buttons) =>
      buttons.map((btn) => {
        const r = btn.getBoundingClientRect();
        const style = getComputedStyle(btn);
        return {
          ariaLabel: btn.getAttribute('aria-label') || '',
          width: r.width,
          height: r.height,
          centerX: r.left + r.width / 2,
          centerY: r.top + r.height / 2,
          borderColor: style.borderTopColor,
          backgroundColor: style.backgroundColor,
        };
      })
    );

    expect(listButtons).toHaveLength(4);

    for (let i = 0; i < svgNodes.length; i++) {
      const wp = svgNodes[i];
      const vpX = svgInfo!.rect.left + (wp.x / svgInfo!.viewBoxWidth) * svgInfo!.rect.width;
      const vpY = svgInfo!.rect.top + (wp.y / svgInfo!.viewBoxHeight) * svgInfo!.rect.height;
      const btn = listButtons[i];

      expect(Math.abs(btn.centerX - vpX)).toBeLessThanOrEqual(2.5);
      expect(Math.abs(btn.centerY - vpY)).toBeLessThanOrEqual(2.5);
    }

    // 3. Regular node size = 56px, Final Assessment node size = 72px & gold dark theme
    for (let i = 0; i < 3; i++) {
      expect(Math.round(listButtons[i].width)).toBe(56);
      expect(Math.round(listButtons[i].height)).toBe(56);
    }

    const bossStats = listButtons[3];
    expect(Math.round(bossStats.width)).toBe(72);
    expect(Math.round(bossStats.height)).toBe(72);
    expect(bossStats.borderColor).toBe('rgb(240, 180, 41)');
    expect(bossStats.backgroundColor).toBe('rgb(20, 20, 24)');

    // Crown/Star icon present, no Play icon inside boss button
    await expect(bossButton.locator('svg.lucide-crown')).toBeVisible();
    await expect(bossButton.locator('svg.lucide-play')).toHaveCount(0);

    // "FINAL ASSESSMENT" label in gold small-caps above boss button
    const assessmentLabel = page.getByText('FINAL ASSESSMENT');
    await expect(assessmentLabel).toBeVisible();
    const labelStyle = await assessmentLabel.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        bottom: r.bottom,
        color: s.color,
        fontVariantCaps: s.fontVariantCaps,
      };
    });
    const bossRect = await bossButton.boundingBox();
    expect(bossRect).not.toBeNull();
    expect(labelStyle.bottom).toBeLessThan(bossRect!.y);
    expect(labelStyle.color).toBe('rgb(240, 180, 41)');
    expect(labelStyle.fontVariantCaps).toBe('small-caps');

    // Verify Final Assessment node fits cleanly in the viewport without bottom clipping
    const viewport = page.viewportSize()!;
    expect(bossRect!.y + bossRect!.height).toBeLessThan(viewport.height);
  });
});
