const resend = require('../config/resend');
const { generateOtpEmailHtml } = require('../templates/otpEmail');
const { generateResetPasswordEmailHtml } = require('../templates/resetPasswordEmail');

/**
 * Sends a transactional OTP email using the official Resend SDK.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.otp - Plain 6-digit OTP code
 * @returns {Promise<{ id: string }>}
 */
async function sendOtpEmail({ to, otp }) {
  let from = (process.env.EMAIL_FROM || '').trim() || 'Tux Tutor <onboarding@resend.dev>';

  // Guard against unverified public webmail domains (gmail, yahoo, etc.)
  // Resend strictly requires onboarding@resend.dev until a custom domain is verified
  if (/@(gmail|yahoo|outlook|hotmail|icloud)\.com/i.test(from)) {
    console.warn(`[Resend Notice] '${from}' is a public webmail domain. Resend only permits sending from 'onboarding@resend.dev' or custom verified domains. Falling back to 'Tux Tutor <onboarding@resend.dev>'.`);
    from = 'Tux Tutor <onboarding@resend.dev>';
  }

  const subject = 'Tux Tutor – Your Login Verification Code';
  const html = generateOtpEmailHtml({ otp, email: to });

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Resend Error Detail]:', error);
      const err = new Error(error.message || 'Failed to dispatch email via Resend.');
      err.statusCode = error.statusCode || 502;
      err.resendError = error;
      throw err;
    }

    return data;
  } catch (err) {
    console.error('[EmailService] Dispatch failed:', err.message);
    throw err;
  }
}

/**
 * Sends a transactional Password Reset email using the official Resend SDK.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.resetLink - Password reset URL
 * @returns {Promise<{ id: string }>}
 */
async function sendPasswordResetEmail({ to, resetLink }) {
  let from = (process.env.EMAIL_FROM || '').trim() || 'Tux Tutor <onboarding@resend.dev>';

  if (/@(gmail|yahoo|outlook|hotmail|icloud)\.com/i.test(from)) {
    from = 'Tux Tutor <onboarding@resend.dev>';
  }

  const subject = 'Tux Tutor – Reset Your Password';
  const html = generateResetPasswordEmailHtml({ resetLink, email: to });

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Resend Password Reset Error]:', error);
      const err = new Error(error.message || 'Failed to dispatch password reset email via Resend.');
      err.statusCode = error.statusCode || 502;
      err.resendError = error;
      throw err;
    }

    console.log(`[EmailService] Password reset email dispatched to ${to}`);
    return data;
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
