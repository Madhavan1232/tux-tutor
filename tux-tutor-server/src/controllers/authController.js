const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateAndStoreOtp, removeOtpRecord, verifyAndConsumeOtp, COOLDOWN_SECONDS } = require('../services/otpService');
const { sendOtpEmail, sendPasswordResetEmail } = require('../services/emailService');
const prisma = require('../../db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/login
 * Password-based sign in. If password matches, issues JWT token and redirects to home.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No account found with this email. Please enlist to register your operative account.',
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Please check your credentials and try again.',
      });
    }

    // Issue JWT
    const secret = process.env.JWT_SECRET || 'tux_tutor_super_secret_jwt_key_2026';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[login Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during login. Please try again.',
    });
  }
}

/**
 * POST /api/auth/send-otp
 * Validates email, enforces cooldown, generates hashed OTP, and dispatches via Resend.
 */
async function sendOtp(req, res) {
  let createdOtpId = null;

  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Safety net: check if an account with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.log(`[sendOtp Conflict] Duplicate email detected for: ${normalizedEmail}`);
      return res.status(409).json({
        status: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
      });
    }

    // 1. Generate secure OTP & save hash to DB
    const { otp, expiresAt, otpId } = await generateAndStoreOtp(normalizedEmail);
    createdOtpId = otpId;

    // 2. Dispatch via Resend transactional email
    try {
      await sendOtpEmail({ to: normalizedEmail, otp });
    } catch (emailError) {
      // If delivery fails, remove the OTP record so the user is NOT stuck with a 60s cooldown lock!
      await removeOtpRecord(createdOtpId);

      console.error('[sendOtp] Resend dispatch failure:', emailError.message);
      return res.status(emailError.statusCode || 502).json({
        success: false,
        error: emailError.message || 'Failed to send verification email. Please check your Resend configuration.',
      });
    }

    // Generic response — NEVER return the OTP value in the response
    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email. It will expire in 5 minutes.',
      cooldownSeconds: COOLDOWN_SECONDS,
      expiresAt,
    });
  } catch (err) {
    console.error('[sendOtp Error]:', err.message);

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'An unexpected error occurred while sending verification code.',
      retryAfter: err.retryAfter,
    });
  }
}

/**
 * POST /api/auth/verify-otp
 * Verifies OTP securely, registers or authenticates user, and issues JWT.
 */
async function verifyOtp(req, res) {
  try {
    const { email, otp, password } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 6-digit verification code.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP and create/authenticate user
    const { user, isNewUser } = await verifyAndConsumeOtp({
      email: normalizedEmail,
      otp: otp.trim(),
      password,
    });

    // Generate JWT
    const secret = process.env.JWT_SECRET || 'tux_tutor_super_secret_jwt_key_2026';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: isNewUser ? 'Welcome to Tux Tutor! Account created.' : 'Welcome back! Signed in successfully.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[verifyOtp Error]:', err.message);

    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Verification failed. Please try again.',
    });
  }
}

/**
 * GET /api/auth/me
 * Retrieves authenticated user data using verified JWT.
 */
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile.',
    });
  }
}

/**
 * POST /api/auth/check-email
 * Checks if an email exists in the database.
 * Handles case-insensitivity, whitespace trimming, and unverified account detection.
 */
async function checkEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please enter an email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    // 1. Check if user already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(200).json({
        exists: true,
        isUnverified: false,
        status: 'EXISTS',
        message: 'An account with this email already exists.',
      });
    }

    // 2. Check if an unverified registration exists (unconsumed Otp record within last 24h)
    const pendingOtp = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingOtp) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (pendingOtp.createdAt > oneDayAgo) {
        return res.status(200).json({
          exists: true,
          isUnverified: true,
          status: 'UNVERIFIED',
          message: 'You started signing up before. Complete verification.',
        });
      }
    }

    // 3. Email is available for new registration
    return res.status(200).json({
      exists: false,
      isUnverified: false,
      status: 'AVAILABLE',
      message: 'Email is available.',
    });
  } catch (err) {
    console.error('[checkEmail Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Could not verify email. Please try again.',
    });
  }
}

/**
 * POST /api/auth/forgot-password
 * Generates a unique 15-minute password reset token and sends the reset link via email.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify account exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address.',
      });
    }

    // Invalidate existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate cryptographically secure random token (UUID or 32-byte hex)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Construct reset link: https://tuxtutor.com/reset-password?token=<token> or local dev URL
    const clientBaseUrl = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://tuxtutor.com' : 'http://localhost:5173');
    const resetLink = `${clientBaseUrl}/reset-password?token=${token}`;

    console.log(`[forgotPassword] Reset link generated for ${user.email}: ${resetLink}`);

    // Dispatch email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetLink,
      });
    } catch (mailErr) {
      console.warn('[forgotPassword] Email dispatch warning (sandbox fallback):', mailErr.message);
      // In local dev, the link is logged above so testing can proceed uninterrupted
    }

    return res.status(200).json({
      success: true,
      message: 'Reset link sent to your registered email — check your inbox. Expires in 15 minutes.',
    });
  } catch (err) {
    console.error('[forgotPassword Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your request. Please try again.',
    });
  }
}

/**
 * GET /api/auth/verify-reset-token
 * Validates whether the token exists in the database and has not expired.
 */
async function verifyResetToken(req, res) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Password reset token is missing or invalid.',
      });
    }

    const cleanToken = token.trim();

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: cleanToken },
      include: {
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'This password reset link is invalid or has expired.',
      });
    }

    if (record.expiresAt <= new Date()) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { id: record.id } }).catch(() => {});
      return res.status(400).json({
        success: false,
        error: 'This password reset link has expired. Please request a new one.',
      });
    }

    return res.status(200).json({
      success: true,
      email: record.user.email,
    });
  } catch (err) {
    console.error('[verifyResetToken Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to verify reset token. Please try again.',
    });
  }
}

/**
 * POST /api/auth/reset-password
 * Validates passwords match, checks token validity, ensures new password != current password,
 * hashes new password, updates database, and invalidates token.
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Password reset token is missing or invalid.',
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please enter and confirm your new password.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Confirm password does not match new password.',
      });
    }

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!PASSWORD_REGEX.test(newPassword) || /\s/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols without spaces.',
      });
    }

    // Verify token exists and is valid
    const cleanToken = token.trim();
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: cleanToken },
      include: { user: true },
    });

    if (!record || record.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'This password reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Check if new password is same as current password using bcrypt
    const isSamePassword = await bcrypt.compare(newPassword, record.user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'Your new password cannot be the same as your current password.',
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: record.userId },
      data: { password: newPasswordHash },
    });

    // Invalidate and delete all reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId },
    });

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset. Please sign in with your new password.',
    });
  } catch (err) {
    console.error('[resetPassword Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while resetting your password. Please try again.',
    });
  }
}

module.exports = {
  login,
  sendOtp,
  verifyOtp,
  checkEmail,
  getMe,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
