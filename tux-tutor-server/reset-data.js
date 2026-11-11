const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Always load tux-tutor-server/.env regardless of caller CWD and override stale shell env vars
const envPath = path.resolve(__dirname, '.env');
const envResult = dotenv.config({ path: envPath, override: true });

if (envResult.error) {
  console.warn(`⚠️  Warning loading ${envPath}: ${envResult.error.message}`);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(`❌ DATABASE_URL is not set. Checked ${envPath}`);
  process.exit(1);
}

const parsedDb = (() => {
  try {
    const url = new URL(databaseUrl);
    return { host: url.hostname, database: url.pathname.replace(/^\//, '') || '(default)' };
  } catch {
    return { host: '(invalid URL)', database: '(unknown)' };
  }
})();

console.log(`\n🔌 Target database: ${parsedDb.host}/${parsedDb.database}`);
if (parsedDb.host.includes('localhost') || parsedDb.host === '127.0.0.1') {
  console.warn('⚠️  WARNING: Connected to LOCALHOST — verify DATABASE_URL in tux-tutor-server/.env if expecting Neon.');
} else {
  console.log('✅ Remote/Neon PostgreSQL database confirmed.\n');
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl },
  },
});

const DELETION_STEPS = [
  { name: 'LoginLog', delegate: () => prisma.loginLog },
  { name: 'Otp', delegate: () => prisma.otp },
  { name: 'PasswordResetToken', delegate: () => prisma.passwordResetToken },
  { name: 'XpEvent', delegate: () => prisma.xpEvent },
  { name: 'Achievement', delegate: () => prisma.achievement },
  { name: 'UserMission', delegate: () => prisma.userMission },
  { name: 'User', delegate: () => prisma.user },
];

/**
 * Deletes all user and authentication records in FK-safe order while preserving World and Mission tables.
 */
async function resetData() {
  let hasErrors = false;

  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma.\n');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exitCode = 1;
    return;
  }

  console.log('--- Cleaning user and auth data from active database ---');

  for (const step of DELETION_STEPS) {
    try {
      const result = await step.delegate().deleteMany();
      console.log(`✅ [OK] Deleted ${step.name}: ${result.count} row(s)`);
    } catch (err) {
      hasErrors = true;
      console.error(`❌ [ERROR] Failed deleting ${step.name}: ${err.message}`);
    }
  }

  console.log('\n--- Verification (Row Counts) ---');
  try {
    for (const step of DELETION_STEPS) {
      const count = await step.delegate().count();
      console.log(`  ${step.name}: ${count}`);
      if (count !== 0) {
        hasErrors = true;
      }
    }

    const worldCount = await prisma.world.count();
    const missionCount = await prisma.mission.count();
    console.log(`  World (preserved): ${worldCount}`);
    console.log(`  Mission (preserved): ${missionCount}`);
  } catch (err) {
    hasErrors = true;
    console.error(`❌ [ERROR] Verification query failed: ${err.message}`);
  }

  if (hasErrors) {
    console.error('\n⚠️  Database reset finished with errors.');
    process.exitCode = 1;
  } else {
    console.log('\n✅ All user and authentication records have been reset (World & Mission preserved).');
  }
}

resetData()
  .catch((err) => {
    console.error('❌ Unexpected error resetting database:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database.');
  });

