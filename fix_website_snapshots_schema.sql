-- =====================================================
-- FIX WEBSITE_SNAPSHOTS SCHEMA - Add Missing Columns
-- =====================================================

-- Connect to production schema
SET search_path TO production, public;

-- Add missing columns to website_snapshots table
ALTER TABLE production.website_snapshots 
ADD COLUMN IF NOT EXISTS title varchar(255),
ADD COLUMN IF NOT EXISTS meta_description varchar(255),
ADD COLUMN IF NOT EXISTS has_title boolean,
ADD COLUMN IF NOT EXISTS has_meta_description boolean,
ADD COLUMN IF NOT EXISTS has_structured_data boolean,
ADD COLUMN IF NOT EXISTS structured_data_types_count integer,
ADD COLUMN IF NOT EXISTS quality_score integer;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'production' 
  AND table_name = 'website_snapshots'
ORDER BY ordinal_position;
