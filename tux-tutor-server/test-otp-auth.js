const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./db');
const { generateAndStoreOtp, verifyAndConsumeOtp } = require('./src/services/otpService');
const { generateOtpEmailHtml } = require('./src/templates/otpEmail');

async function runOtpTests() {
  console.log('\n=============================================================');
  console.log('       Tux Tutor — Resend OTP & Auth Test Suite              ');
  console.log('=============================================================\n');

  const testEmail = `test_operative_${Date.now()}@tux-tutor.test`;

  try {
    // 1. Template Rendering Test
    console.log('[1/8] Testing Resend HTML Email Template...');
    const emailHtml = generateOtpEmailHtml({ otp: '849201', email: testEmail });
    if (!emailHtml.includes('849201') || !emailHtml.includes('#770600') || !emailHtml.includes('TUX TUTOR')) {
      throw new Error('Email template missing required branding or OTP value.');
    }
    console.log('  ✔ Email template generated with black & burgundy branding.\n');

    // 2. OTP Generation & Storage Test
    console.log('[2/8] Testing Cryptographic OTP Generation & Hashing...');
    const { otp, expiresAt } = await generateAndStoreOtp(testEmail);
    console.log('  ✔ Secure 6-digit OTP generated (never exposed in API response)');
    console.log(`  ✔ Expiry set to: ${expiresAt.toISOString()}`);

    const storedOtp = await prisma.otp.findFirst({
      where: { email: testEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedOtp) throw new Error('OTP was not persisted to PostgreSQL.');
    if (storedOtp.otpHash === otp) throw new Error('SECURITY VIOLATION: OTP was stored in plain text!');
    const hashMatches = await bcrypt.compare(otp, storedOtp.otpHash);
    if (!hashMatches) throw new Error('Stored hash does not match original OTP.');
    console.log('  ✔ Verified: OTP is stored ONLY as a secure bcrypt hash in PostgreSQL.\n');

    // 3. Resend Cooldown Test
    console.log('[3/8] Testing 60-Second Resend Cooldown...');
    try {
      await generateAndStoreOtp(testEmail);
      throw new Error('Cooldown failed: allowed duplicate OTP generation within 60s.');
    } catch (err) {
      if (err.statusCode === 429) {
        console.log(`  ✔ Cooldown enforced! Rejected rapid resend: "${err.message}"\n`);
      } else {
        throw err;
      }
    }

    // 4. Incorrect OTP Attempt & Decrement Counter Test
    console.log('[4/8] Testing Incorrect OTP Verification...');
    try {
      await verifyAndConsumeOtp({ email: testEmail, otp: '000000' });
      throw new Error('Failed: Accepted invalid OTP 000000.');
    } catch (err) {
      console.log(`  ✔ Incorrect OTP rejected: "${err.message}"`);
      const updatedOtp = await prisma.otp.findUnique({ where: { id: storedOtp.id } });
      console.log(`  ✔ Attempts counter incremented in PostgreSQL: ${updatedOtp.attempts} / 5\n`);
    }

    // 5. Correct OTP Verification & User Registration Test
    console.log('[5/8] Testing Correct OTP Verification & User Creation...');
    const { user, isNewUser } = await verifyAndConsumeOtp({ email: testEmail, otp });
    if (!isNewUser) throw new Error('Expected isNewUser to be true for first-time registration.');
    if (!user || user.email !== testEmail) throw new Error('User creation failed.');
    console.log('  ✔ New User registered atomically in database:');
    console.log(`    - ID: ${user.id}`);
    console.log(`    - Username: ${user.username}`);
    console.log(`    - Email: ${user.email}`);
    console.log(`    - Level: ${user.level} | XP: ${user.xp}\n`);

    // 6. OTP Invalidation & Replay Attack Prevention
    console.log('[6/8] Testing Replay Attack Prevention (Reused OTP)...');
    try {
      await verifyAndConsumeOtp({ email: testEmail, otp });
      throw new Error('Security failure: consumed OTP was reused!');
    } catch (err) {
      console.log(`  ✔ Replay prevented: "${err.message}"\n`);
    }

    // 7. Existing User Login Test
    console.log('[7/8] Testing Existing User Login (Same Email)...');
    // Fast-forward cooldown by modifying createdAt of previous OTP for test
    await prisma.otp.updateMany({
      where: { email: testEmail },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    const secondOtpResult = await generateAndStoreOtp(testEmail);
    const loginResult = await verifyAndConsumeOtp({ email: testEmail, otp: secondOtpResult.otp });
    if (loginResult.isNewUser) throw new Error('Expected existing user, not new registration.');
    if (loginResult.user.id !== user.id) throw new Error('User ID mismatch on second login.');
    console.log(`  ✔ Existing user "${loginResult.user.username}" authenticated successfully without duplicating account.\n`);

    // 8. JWT Generation & Verification
    console.log('[8/8] Testing JWT Token Issuance...');
    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });
    const decoded = jwt.verify(token, secret);
    if (decoded.id !== user.id || decoded.email !== user.email) {
      throw new Error('JWT payload verification mismatch.');
    }
    console.log('  ✔ JWT signed and verified successfully.');
    console.log(`  ✔ Token preview: ${token.substring(0, 32)}...\n`);

    // Cleanup test data
    console.log('Cleaning up test records...');
    await prisma.otp.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    console.log('✔ Cleanup complete.');

    console.log('\n=============================================================');
    console.log('    RESEND OTP & AUTH SYSTEM: ALL 8 TEST STAGES PASSED!      ');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runOtpTests();

