const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../../db');

const OTP_EXPIRY_MINUTES = 5;
const COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

/**
 * Validates cooldown and generates a cryptographically secure 6-digit OTP.
 * Hashes the OTP and persists it in PostgreSQL.
 *
 * @param {string} email
 * @returns {Promise<{ otp: string, expiresAt: Date, otpId: number }>}
 */
async function generateAndStoreOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check for cooldown from the most recent OTP
  const latestOtp = await prisma.otp.findFirst({
    where: { email: normalizedEmail },
    orderBy: { createdAt: 'desc' },
  });

  if (latestOtp) {
    const elapsedSeconds = Math.floor((Date.now() - latestOtp.createdAt.getTime()) / 1000);
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const waitTime = COOLDOWN_SECONDS - elapsedSeconds;
      const error = new Error(`Please wait ${waitTime}s before requesting a new verification code.`);
      error.statusCode = 429;
      error.retryAfter = waitTime;
      throw error;
    }
  }

  // 2. Generate cryptographically secure 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();

  // 3. Hash OTP before storing
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // 4. Save to database
  const createdRecord = await prisma.otp.create({
    data: {
      email: normalizedEmail,
      otpHash,
      expiresAt,
      attempts: 0,
    },
  });

  return { otp, expiresAt, otpId: createdRecord.id };
}

/**
 * Removes an unconsumed OTP record if email delivery fails, preventing cooldown locks.
 * @param {number} otpId
 */
async function removeOtpRecord(otpId) {
  try {
    if (otpId) {
      await prisma.otp.delete({ where: { id: otpId } });
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Validates the OTP securely with attempt tracking and atomic consumption.
 * Authenticates or registers the user inside a transaction.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.otp
 * @param {string} [params.password] - Optional password to set on registration
 * @returns {Promise<{ user: Object, isNewUser: boolean }>}
 */
async function verifyAndConsumeOtp({ email, otp, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find the most recent active OTP for this email
  const record = await prisma.otp.findFirst({
    where: {
      email: normalizedEmail,
      consumedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    const error = new Error('No pending verification code found. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Check if OTP has expired
  if (new Date() > record.expiresAt) {
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Check attempt limit
  if (record.attempts >= MAX_ATTEMPTS) {
    const error = new Error('Maximum verification attempts exceeded. This code is invalidated. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Secure comparison using bcrypt
  const isMatch = await bcrypt.compare(otp.trim(), record.otpHash);

  if (!isMatch) {
    const updatedRecord = await prisma.otp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    const remaining = MAX_ATTEMPTS - updatedRecord.attempts;
    const error = new Error(
      remaining > 0
        ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Invalid code. Maximum attempts exceeded. Please request a new code.'
    );
    error.statusCode = 400;
    throw error;
  }

  // 5. Database transaction to atomically mark consumed and find/create user
  let isNewUser = false;
  const user = await prisma.$transaction(async (tx) => {
    // Invalidate OTP
    await tx.otp.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    // Check if user exists
    let existingUser = await tx.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existingUser) {
      isNewUser = true;
      const baseUsername = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);
      const uniqueSuffix = crypto.randomInt(100, 999);
      const generatedUsername = `${baseUsername || 'operative'}_${uniqueSuffix}`;
      
      const userPassword = password && password.length >= 6
        ? await bcrypt.hash(password, 10)
        : await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);

      existingUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          username: generatedUsername,
          password: userPassword,
          xp: 0,
          level: 1,
          streak: 1,
        },
      });
    } else if (password && password.length >= 6) {
      // If user provided a password and wants to update/set it
      const newPasswordHash = await bcrypt.hash(password, 10);
      existingUser = await tx.user.update({
        where: { id: existingUser.id },
        data: { password: newPasswordHash },
      });
    }

    return existingUser;
  });

  return { user, isNewUser };
}

module.exports = {
  generateAndStoreOtp,
  removeOtpRecord,
  verifyAndConsumeOtp,
  COOLDOWN_SECONDS,
};
