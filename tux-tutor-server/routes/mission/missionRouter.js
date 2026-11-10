const express = require('express');
const jwt = require('jsonwebtoken');
const {
  getMission,
  startMission,
  getHint,
  saveProgress,
  completeMission,
} = require('./missionController');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Optional auth helper: decodes token if present without rejecting if absent
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

// Public or optionally authenticated mission fetch
router.get('/:id', optionalAuth, getMission);

// Authenticated progression endpoints
router.post('/:id/start', authMiddleware, startMission);
router.post('/:id/hints/:index', authMiddleware, getHint);
router.post('/:id/progress', authMiddleware, saveProgress);
router.post('/:id/complete', authMiddleware, completeMission);

module.exports = router;
