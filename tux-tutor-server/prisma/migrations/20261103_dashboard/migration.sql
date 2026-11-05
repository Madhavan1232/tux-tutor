-- ============================================================
-- Tux Tutor — Dashboard Migration
-- Adds: World, XpEvent tables
--       Updates User with streak/last_active_date columns
--       Updates Mission with world_id, order_index, type columns
-- ============================================================

-- ── Add new columns to User ──────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "streak_current"    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "streak_best"       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "last_active_date"  TIMESTAMP(3);

-- Migrate old streak value to streak_current
UPDATE "User" SET "streak_current" = "streak" WHERE "streak_current" = 0 AND "streak" > 0;

-- ── Create World table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "World" (
  "id"                  SERIAL NOT NULL,
  "name"                TEXT NOT NULL,
  "order_index"         INTEGER NOT NULL,
  "unlock_requirement"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "World_order_index_key" ON "World"("order_index");

-- ── Create MissionType enum ────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MissionType') THEN
    CREATE TYPE "MissionType" AS ENUM ('mission', 'boss');
  END IF;
END$$;

-- ── Add new columns to Mission ────────────────────────────────
ALTER TABLE "Mission"
  ADD COLUMN IF NOT EXISTS "world_id"      INTEGER,
  ADD COLUMN IF NOT EXISTS "order_index"   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "type"          "MissionType" NOT NULL DEFAULT 'mission',
  ADD COLUMN IF NOT EXISTS "xp_reward"     INTEGER NOT NULL DEFAULT 50;

-- Migrate xpReward → xp_reward if both columns exist
UPDATE "Mission"
  SET "xp_reward" = "xpReward"
  WHERE "xp_reward" = 50 AND "xpReward" != 10;

-- Add FK once World rows exist (applied after seed)
-- ALTER TABLE "Mission" ADD CONSTRAINT "Mission_world_id_fkey"
--   FOREIGN KEY ("world_id") REFERENCES "World"("id") ON DELETE CASCADE;

-- ── Create XpEvent table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "XpEvent" (
  "id"          SERIAL NOT NULL,
  "user_id"     INTEGER NOT NULL,
  "amount"      INTEGER NOT NULL,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "XpEvent"
  ADD CONSTRAINT "XpEvent_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
  NOT VALID;  -- skip validation of existing rows for speed
