-- ============================================================================
-- TUX TUTOR DATABASE RESET SCRIPT (PostgreSQL)
-- Description: Drops and recreates all tables according to schema.prisma
-- Target DB:   Configured via DATABASE_URL in tux-tutor-server/.env
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- STEP 1: DROP ALL EXISTING TABLES & TYPES
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS "LoginLog" CASCADE;
DROP TABLE IF EXISTS "XpEvent" CASCADE;
DROP TABLE IF EXISTS "UserMission" CASCADE;
DROP TABLE IF EXISTS "Achievement" CASCADE;
DROP TABLE IF EXISTS "Otp" CASCADE;
DROP TABLE IF EXISTS "PasswordResetToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Mission" CASCADE;
DROP TABLE IF EXISTS "World" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
DROP TYPE IF EXISTS "MissionType" CASCADE;

-- ----------------------------------------------------------------------------
-- STEP 2: CREATE TYPES & FRESH TABLES
-- ----------------------------------------------------------------------------
CREATE TYPE "MissionType" AS ENUM ('mission', 'boss');

-- 1. User Table
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "password" TEXT,
    "github_id" TEXT,
    "google_id" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "streak_current" INTEGER NOT NULL DEFAULT 0,
    "streak_best" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_github_id_key" ON "User"("github_id");
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- 2. World Table
CREATE TABLE "World" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "unlock_requirement" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "World_order_index_key" ON "World"("order_index");

-- 3. Mission Table
CREATE TABLE "Mission" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "world" TEXT,
    "world_id" INTEGER,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "type" "MissionType" NOT NULL DEFAULT 'mission',
    "xp_reward" INTEGER NOT NULL DEFAULT 50,
    "command" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Mission_world_id_fkey" FOREIGN KEY ("world_id") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. UserMission Table
CREATE TABLE "UserMission" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserMission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserMission_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserMission_user_id_mission_id_key" ON "UserMission"("user_id", "mission_id");

-- 5. XpEvent Table
CREATE TABLE "XpEvent" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "XpEvent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Achievement Table
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "badge" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Otp Table
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

CREATE INDEX "Otp_email_createdAt_idx" ON "Otp"("email", "createdAt");

-- 8. PasswordResetToken Table
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

-- 9. LoginLog Table
CREATE TABLE "LoginLog" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoginLog_email_idx" ON "LoginLog"("email");
CREATE INDEX "LoginLog_timestamp_idx" ON "LoginLog"("timestamp");

COMMIT;
