require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

// Confirm which DB we're hitting before anything else
const dbUrl = process.env.DATABASE_URL || '(DATABASE_URL not set!)';
const dbHost = (() => {
  try { return new URL(dbUrl).hostname; } catch { return dbUrl; }
})();
console.log(`\n🔌 Connecting to: ${dbHost}`);
if (dbHost.includes('localhost') || dbHost === '127.0.0.1') {
  console.error('⚠️  WARNING: Connected to LOCALHOST — not Neon! Check your .env file.');
} else {
  console.log('✅ Neon (remote) database confirmed.\n');
}

const prisma = new PrismaClient();

async function resetData() {
  console.log('--- Cleaning user data from active database ---');
  
  // 1. Delete dependent user data
  const delUserMissions = await prisma.userMission.deleteMany();
  console.log(`Deleted UserMissions: ${delUserMissions.count}`);

  const delAchievements = await prisma.achievement.deleteMany();
  console.log(`Deleted Achievements: ${delAchievements.count}`);

  const delXpEvents = await prisma.xpEvent.deleteMany();
  console.log(`Deleted XpEvents: ${delXpEvents.count}`);

  const delTokens = await prisma.passwordResetToken.deleteMany();
  console.log(`Deleted PasswordResetTokens: ${delTokens.count}`);

  // 2. Delete Users
  const delUsers = await prisma.user.deleteMany();
  console.log(`Deleted Users: ${delUsers.count}`);

  // 3. Delete OTPs
  const delOtps = await prisma.otp.deleteMany();
  console.log(`Deleted OTP records: ${delOtps.count}`);

  // 4. Delete LoginLogs
  const delLogs = await prisma.loginLog.deleteMany();
  console.log(`Deleted LoginLogs: ${delLogs.count}`);

  console.log('--- Verification ---');
  const userCount = await prisma.user.count();
  const otpCount = await prisma.otp.count();
  console.log(`Current User count: ${userCount}`);
  console.log(`Current Otp count: ${otpCount}`);
  console.log('All user and authentication records have been successfully wiped.');
}

resetData()
  .catch((e) => {
    console.error('Error resetting database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

