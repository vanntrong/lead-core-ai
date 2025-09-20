-- Migration: Add stripe_subscription_id to subscriptions table

ALTER TABLE subscriptions
ADD COLUMN stripe_subscription_id TEXT;
