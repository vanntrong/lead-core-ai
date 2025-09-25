-- Migration: Add flagged field to leads table
-- Adds a boolean column 'flagged' to indicate flagged leads (default: false)

ALTER TABLE leads ADD COLUMN flagged BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN leads.flagged IS 'Indicates if the lead is flagged for moderation (excluded from exports).';
