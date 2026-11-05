/**
 * Lightweight in-memory rate limiter for sensitive authentication endpoints.
 * Tracks requests per IP / key to prevent brute force and abuse.
 */
function createRateLimiter({ windowMs = 10 * 60 * 1000, max = 5, message = 'Too many requests. Please try again later.' } = {}) {
  const hits = new Map();

  // Cleanup expired entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const emailKey = req.body && req.body.email ? req.body.email.toLowerCase().trim() : '';
    const key = emailKey ? `email:${emailKey}` : `ip:${ip}`;
    const now = Date.now();

    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      hits.set(key, record);
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
}

module.exports = {
  emailCheckLimiter: createRateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many attempts. Please wait a moment.',
  }),
  otpSendLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 6,
    message: 'Too many OTP requests from this address. Please wait 15 minutes.',
  }),
};

