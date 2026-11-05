/**
 * HTML Email template for Tux Tutor Password Reset
 * Follows the dark luxury minimalist editorial design system:
 * - Pure Black (#000000)
 * - Deep Crimson / Accent Red (#DC2626 / #770600)
 * - Text White (#FFFFFF) & Muted (#BCB3B3)
 */
function generateResetPasswordEmailHtml({ resetLink, email }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tux Tutor – Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #161414; border: 1px solid #770600; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.9);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Top Brand Banner -->
          <tr>
            <td style="padding: 28px 36px 20px; border-bottom: 1px solid rgba(119, 6, 0, 0.35);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 15px; font-weight: 700; letter-spacing: 0.18em; color: #FFFFFF;">TUX TUTOR</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-family: ui-monospace, Consolas, monospace; letter-spacing: 0.1em; color: #DC2626; font-weight: 600;">[PASSWORD_RECOVERY]</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em;">
                Reset Your Password
              </h1>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #BCB3B3;">
                We received a request to reset the password for your TUX TUTOR account associated with <strong style="color: #FFFFFF;">${email}</strong>.
              </p>
              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #BCB3B3;">
                Click the button below to choose a new password. For security, this link will expire in <strong style="color: #FFFFFF;">15 minutes</strong>.
              </p>

              <!-- Reset Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #DC2626; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: 0.02em; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);">
                      Reset Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link Fallback -->
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                <p style="margin: 0 0 8px; font-size: 12px; color: #8E8E93; line-height: 1.5;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; word-break: break-all;">
                  <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="color: #DC2626; text-decoration: underline;">
                    ${resetLink}
                  </a>
                </p>
              </div>

              <!-- Security Notice -->
              <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.5; color: #6E6E73;">
                If you did not request this password reset, no action is needed. Your password will remain unchanged and your account is secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px 28px; background-color: #100E0E; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #555252; letter-spacing: 0.04em;">
                &copy; ${new Date().getFullYear()} TUX TUTOR &middot; Linux Learning Platform &middot; Production Sandbox
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

module.exports = {
  generateResetPasswordEmailHtml,
};

