-- CORRECTED Production Schema - Matches codebase exactly
-- Only adds the missing normalized_host column to existing schema

-- Set search path
SET search_path = production, public;

-- Add the missing normalized_host column to brands table
-- This is the ONLY thing missing from current schema
ALTER TABLE production.brands 
ADD COLUMN IF NOT EXISTS normalized_host text
GENERATED ALWAYS AS (
    lower(
        split_part(
            regexp_replace(
                regexp_replace(coalesce(website_url, ''), '^https?://', '', 'i'),
                '^www\.', '', 'i'
            ),
            '/', 1
        )
    )
) STORED;

-- Add unique constraint for user + normalized host (this was causing our failures)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'brands_user_normalized_host_uk'
    ) THEN
        ALTER TABLE production.brands 
        ADD CONSTRAINT brands_user_normalized_host_uk 
        UNIQUE(user_id, normalized_host);
    END IF;
END $$;

-- Verification
SELECT 'Schema correction completed' as status;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'production' 
AND table_name = 'brands' 
AND column_name = 'normalized_host';