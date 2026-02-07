-- Add last_activity_at column to profiles table for tracking online status
ALTER TABLE profiles ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Create an index for faster queries
CREATE INDEX idx_profiles_last_activity_at ON profiles(last_activity_at DESC);
