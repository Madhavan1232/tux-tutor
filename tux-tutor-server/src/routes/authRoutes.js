const express = require('express');
const router = express.Router();
const {
  login,
  sendOtp,
  verifyOtp,
  checkEmail,
  getMe,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  handleGoogleAuth,
  initiateGoogleOAuth,
  handleGoogleCallback,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { otpSendLimiter, emailCheckLimiter } = require('../middleware/rateLimiter');

// Duplicate email check
router.post('/check-email', emailCheckLimiter, checkEmail);

// Registration & OTP endpoints
router.post('/register', otpSendLimiter, sendOtp);
router.post('/send-otp', otpSendLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);

// Password authentication
router.post('/login', login);

// Google OAuth endpoints
router.get('/google', initiateGoogleOAuth);
router.get('/google/callback', handleGoogleCallback);
router.post('/google', handleGoogleAuth);

// Password Reset Flow
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

// Protected session check
router.get('/me', requireAuth, getMe);

module.exports = router;
