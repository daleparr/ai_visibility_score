-- Emergency fix for normalized_host column
-- Run this independently to unblock MVP testing

SET search_path = production, public;

-- Add normalized_host column if missing
ALTER TABLE production.brands 
ADD COLUMN IF NOT EXISTS normalized_host text
GENERATED ALWAYS AS (
  lower(
    split_part(
      regexp_replace(
        regexp_replace(coalesce(website_url, ''), '^https?://', '', 'i'),
        '^www\.',
        '',
        'i'
      ),
      '/',
      1
    )
  )
) STORED;

-- Add unique index
CREATE UNIQUE INDEX IF NOT EXISTS brands_user_normalized_host_uk 
ON production.brands (user_id, normalized_host);

-- Verify
SELECT 'normalized_host column created' as status, 
       EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_schema='production' 
         AND table_name='brands' 
         AND column_name='normalized_host'
       ) as exists;