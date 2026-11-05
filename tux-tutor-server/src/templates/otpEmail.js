/**
 * HTML Email template for Tux Tutor OTP Verification
 * Follows the dark luxury minimalist editorial design system:
 * - Pure Black (#000000)
 * - Deep Burgundy (#770600)
 * - Accent Red (#7A0401)
 * - Text White (#FFFFFF) & Muted (#BCB3B3)
 */
function generateOtpEmailHtml({ otp, email }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tux Tutor – Your Login Verification Code</title>
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
                    <span style="font-size: 11px; font-family: ui-monospace, Consolas, monospace; letter-spacing: 0.1em; color: #770600; font-weight: 600;">[AUTH_SECURE]</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 500; color: #FFFFFF; letter-spacing: -0.02em;">
                Welcome to Tux Tutor!
              </h1>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #BCB3B3;">
                Your one-time login verification code for <strong style="color: #FFFFFF;">${email}</strong> is:
              </p>

              <!-- OTP Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #000000; border: 1px solid #7A0401; border-radius: 6px; padding: 20px 24px;">
                    <div style="font-family: ui-monospace, 'JetBrains Mono', Consolas, monospace; font-size: 34px; font-weight: 700; letter-spacing: 0.28em; color: #FFFFFF; text-indent: 0.28em;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Warning -->
              <p style="margin: 24px 0 12px; font-size: 13px; line-height: 1.5; color: #BCB3B3;">
                ⏱ <strong>This code expires in 5 minutes.</strong>
              </p>
              <p style="margin: 0 0 28px; font-size: 12px; line-height: 1.5; color: #888888;">
                If you didn't request this code, please ignore this email or contact security.
              </p>

              <!-- Divider -->
              <div style="border-top: 1px solid rgba(119, 6, 0, 0.25); margin: 20px 0;"></div>

              <!-- Motto & Sign-off -->
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #FFFFFF;">
                Learn Linux. Complete missions. Level up!
              </p>
              <p style="margin: 0; font-size: 13px; color: #770600; font-weight: 600;">
                — Tux Tutor Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 36px 24px; background-color: #0d0b0b; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #666666; font-family: ui-monospace, Consolas, monospace;">
                Tux Tutor Kernel Simulation Engine • Automated Verification
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
  generateOtpEmailHtml,
};

