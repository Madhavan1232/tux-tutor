const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT authentication token in incoming requests.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tux_tutor_super_secret_jwt_key_2026');
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication session expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
}

module.exports = {
  requireAuth,
};

