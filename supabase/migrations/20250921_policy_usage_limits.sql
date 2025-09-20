-- Policy: Allow users to SELECT usage_limits for their plan_tier
CREATE POLICY "Users can select usage_limits for their plan" ON usage_limits
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriptions.plan_tier = usage_limits.plan_tier
      AND subscriptions.user_id = auth.uid()
  ))