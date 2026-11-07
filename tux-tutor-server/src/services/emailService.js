const { sendMail } = require('../../utils/sendMail');
const { generateOtpEmailHtml } = require('../templates/otpEmail');
const { generateResetPasswordEmailHtml } = require('../templates/resetPasswordEmail');

/**
 * Sends a transactional OTP email using Nodemailer.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.otp - Plain 6-digit OTP code
 * @returns {Promise<Object>}
 */
async function sendOtpEmail({ to, otp }) {
  const subject = 'Tux Tutor – Your Login Verification Code';
  const html = generateOtpEmailHtml({ otp, email: to });

  try {
    const info = await sendMail({
      to,
      subject,
      html,
    });

    return info;
  } catch (err) {
    console.error('[EmailService] Dispatch failed:', err.message);
    throw err;
  }
}

/**
 * Sends a transactional Password Reset email using Nodemailer.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.resetLink - Password reset URL
 * @returns {Promise<Object>}
 */
async function sendPasswordResetEmail({ to, resetLink }) {
  const subject = 'Tux Tutor – Reset Your Password';
  const html = generateResetPasswordEmailHtml({ resetLink, email: to });

  try {
    const info = await sendMail({
      to,
      subject,
      html,
    });

    console.log(`[EmailService] Password reset email dispatched to ${to}`);
    return info;
  } catch (err) {
    console.error('[EmailService] Password reset dispatch failed:', err.message);
    // In local dev, log the reset link prominently so the developer can proceed
    console.log(`\n========================================================`);
    console.log(`[DEV MODE PASSWORD RESET LINK]:`);
    console.log(resetLink);
    console.log(`========================================================\n`);
    throw err;
  }
}

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
};
