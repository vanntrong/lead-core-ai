-- Migration: Add 'flagged' column to leads
ALTER TABLE leads ADD COLUMN flagged BOOLEAN DEFAULT FALSE;