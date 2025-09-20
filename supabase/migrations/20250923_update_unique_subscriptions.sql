-- Migration: Update UNIQUE constraint on subscriptions table

ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_plan_tier_key;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_plan_tier_stripe_subscription_id_key UNIQUE (user_id, plan_tier, stripe_subscription_id);
