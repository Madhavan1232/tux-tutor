const { getDashboardData } = require('./dashboardService');

/**
 * dashboardController — handles GET /api/dashboard
 */

/**
 * GET /api/dashboard
 * Protected: requires valid JWT (set by auth middleware).
 */
async function getDashboard(req, res) {
  try {
    // req.user.id is set by the auth middleware (JWT verification)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await getDashboardData(userId);
    return res.json(data);
  } catch (err) {
    console.error('[dashboardController] Error:', err.message);
    return res.status(500).json({ error: 'Failed to load dashboard data' });
  }
}

module.exports = { getDashboard };
