-- ============================================================================
-- TUX TUTOR DATABASE RESET SCRIPT (PostgreSQL)
-- Description: Drops all existing tables and recreates them fresh according to
--              the Prisma schema specification.
-- Database:    tux_tutor_db (schema: public)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- STEP 1: DROP ALL EXISTING TABLES & SEQUENCES
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS "UserMission" CASCADE;
DROP TABLE IF EXISTS "Achievement" CASCADE;
DROP TABLE IF EXISTS "Otp" CASCADE;
DROP TABLE IF EXISTS "PasswordResetToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Mission" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- ----------------------------------------------------------------------------
-- STEP 2: CREATE FRESH TABLES
-- ----------------------------------------------------------------------------

-- 1. User Table
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Unique indexes for User
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");


-- 2. Mission Table
CREATE TABLE "Mission" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "world" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "command" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);


-- 3. UserMission (Join table for User <-> Mission progress)
CREATE TABLE "UserMission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "missionId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserMission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique composite index to prevent duplicate mission completions
CREATE UNIQUE INDEX "UserMission_userId_missionId_key" ON "UserMission"("userId", "missionId");


-- 4. Achievement Table
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "badge" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);


-- 5. Otp Table (Email Verification & Passwordless Auth)
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- Index for fast lookup by email and creation timestamp
CREATE INDEX "Otp_email_createdAt_idx" ON "Otp"("email", "createdAt");


-- 6. PasswordResetToken Table
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");


-- ----------------------------------------------------------------------------
-- STEP 3: SEED STARTER MISSIONS (World 001 - Directory Navigation)
-- ----------------------------------------------------------------------------
INSERT INTO "Mission" ("title", "description", "world", "xpReward", "command", "expectedOutput")
VALUES
    (
        'Inspect Working Directory',
        'Print the absolute path of your current operative working directory.',
        '001.navigation',
        10,
        'pwd',
        '/home/tux/academy'
    ),
    (
        'Examine System Kernel',
        'Inspect the active Linux kernel architecture and build specifications.',
        '001.navigation',
        15,
        'uname -r',
        '6.8.0-tux-x86_64'
    ),
    (
        'List Directory Contents',
        'List all files including hidden dotfiles and detailed permissions.',
        '001.navigation',
        10,
        'ls -la',
        'drwxr-xr-x 2 tux tux 4096'
    ),
    (
        'Verify Operative Identity',
        'Display your current effective user name and security group assignments.',
        '001.navigation',
        10,
        'whoami',
        'tux'
    ),
    (
        'Read Mission Briefing',
        'Display the contents of the primary mission directive file.',
        '001.navigation',
        20,
        'cat mission.txt',
        'MODULE 001: Traverse directory tree using cd and inspect logs.'
    );

COMMIT;

-- ----------------------------------------------------------------------------
-- VERIFICATION
-- ----------------------------------------------------------------------------
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

