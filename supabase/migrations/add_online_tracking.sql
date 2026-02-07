-- Add last_activity_at column to profiles table for tracking online status
ALTER TABLE profiles ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Create an index for faster queries
CREATE INDEX idx_profiles_last_activity_at ON profiles(last_activity_at DESC);

-- Create a function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET last_activity_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
