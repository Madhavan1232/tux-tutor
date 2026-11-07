const transporter = require('../config/mailer');

/**
 * Sends an email using Nodemailer with Gmail.
 *
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Subject line of the email
 * @param {string} params.html - HTML body content
 * @returns {Promise<Object>} - Information about the sent email
 */
async function sendMail({ to, subject, html }) {
  const fromAddress = process.env.GMAIL_USER;
  const fromHeader = process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('resend.dev')
    ? process.env.EMAIL_FROM
    : `"Tux Tutor" <${fromAddress}>`;

  const mailOptions = {
    from: fromHeader,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

sendMail.sendMail = sendMail;
module.exports = sendMail;

