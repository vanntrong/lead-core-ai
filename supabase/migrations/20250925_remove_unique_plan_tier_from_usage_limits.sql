-- Migration: Remove UNIQUE constraint on plan_tier from usage_limits table

ALTER TABLE usage_limits DROP CONSTRAINT usage_limits_plan_tier_key;
