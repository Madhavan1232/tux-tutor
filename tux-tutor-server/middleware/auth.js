const jwt = require('jsonwebtoken');

/**
 * authMiddleware — verifies the JWT from the Authorization header.
 * Attaches decoded user payload to req.user.
 * The token must be: Bearer <token>
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tux_tutor_super_secret_jwt_key_2026'
    );
    req.user = decoded; // { id, username, email, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
