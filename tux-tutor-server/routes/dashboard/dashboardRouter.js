const express = require('express');
const { getDashboard } = require('./dashboardController');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard
 * Returns all data needed for the dashboard page.
 * Protected by JWT auth middleware.
 */
router.get('/', authMiddleware, getDashboard);

module.exports = router;
