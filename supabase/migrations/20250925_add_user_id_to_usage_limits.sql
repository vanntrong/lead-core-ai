-- Migration: Add user_id to usage_limits and set foreign key to auth.users

ALTER TABLE usage_limits
ADD COLUMN user_id UUID NOT NULL;

-- Set up foreign key constraint to auth.users
ALTER TABLE usage_limits
ADD CONSTRAINT fk_usage_limits_user_id
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);

-- Enable RLS for usage_limits
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow users to access their own usage_limits
CREATE POLICY "Users can access their own usage_limits" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own usage_limits" ON usage_limits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage_limits" ON usage_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own usage_limits" ON usage_limits
  FOR DELETE USING (auth.uid() = user_id);
