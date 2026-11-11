-- Add optional display_name column to User table for profile display names
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "display_name" TEXT;

