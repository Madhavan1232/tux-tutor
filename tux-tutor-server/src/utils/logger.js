const fs = require('fs');
const path = require('path');
const winston = require('winston');
const prisma = require('../../db');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'auth.log'),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] ${level}: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});

/**
 * Record a login attempt in both the Prisma LoginLog table and the Winston log file.
 * Strictest guarantee: NEVER log password under any circumstances.
 */
async function recordLoginAttempt({ email, ipAddress, success, reason }) {
  const safeEmail = (email || 'unknown').trim().toLowerCase();
  const safeIp = (ipAddress || 'unknown').trim();
  const timestamp = new Date();

  // 1. Persist to Prisma DB
  try {
    await prisma.loginLog.create({
      data: {
        email: safeEmail,
        ipAddress: safeIp,
        timestamp,
        success: Boolean(success),
      },
    });
  } catch (err) {
    logger.error('Failed to write login log to database', {
      error: err.message,
      email: safeEmail,
      ipAddress: safeIp,
    });
  }

  // 2. Write to Winston log file
  if (success) {
    logger.info('Successful login', {
      email: safeEmail,
      ipAddress: safeIp,
      timestamp: timestamp.toISOString(),
      success: true,
    });
  } else {
    logger.warn('Failed login attempt', {
      email: safeEmail,
      ipAddress: safeIp,
      timestamp: timestamp.toISOString(),
      success: false,
      reason: reason || 'Invalid credentials',
    });
  }
}

/**
 * Log every new successful signup with timestamp and email.
 */
function recordSignupSuccess({ email, username, ipAddress }) {
  const safeEmail = (email || '').trim().toLowerCase();
  const safeIp = (ipAddress || 'unknown').trim();
  const timestamp = new Date().toISOString();

  logger.info('New user registered successfully', {
    email: safeEmail,
    username: username || undefined,
    ipAddress: safeIp,
    timestamp,
  });
}

module.exports = {
  logger,
  recordLoginAttempt,
  recordSignupSuccess,
};
