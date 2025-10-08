-- =====================================================
-- COMPLETE HYBRID ARCHITECTURE MIGRATION
-- Adds missing backend_agent_executions table + enum
-- Plus any missing website_snapshots columns
-- =====================================================

-- Connect to production schema
SET search_path TO production, public;

-- =====================================================
-- 1. CREATE BACKEND AGENT STATUS ENUM IN PRODUCTION SCHEMA
-- =====================================================
-- Drop the public enum if it exists (to avoid conflicts)
DROP TYPE IF EXISTS public.backend_agent_status CASCADE;

-- Create enum in production schema to match table location
CREATE TYPE IF NOT EXISTS production.backend_agent_status AS ENUM(
    'pending', 
    'running', 
    'completed', 
    'failed'
);

-- =====================================================
-- 2. CREATE BACKEND AGENT EXECUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS production.backend_agent_executions (
    id varchar(255) PRIMARY KEY,
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    agent_name varchar(100) NOT NULL,
    status production.backend_agent_status NOT NULL DEFAULT 'pending',
    started_at timestamp NOT NULL DEFAULT now(),
    completed_at timestamp,
    result jsonb,
    error text,
    execution_time integer, -- milliseconds
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- =====================================================
-- 3. CREATE MISSING CONTENT_CHANGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS production.content_changes (
    id serial PRIMARY KEY,
    website_snapshot_id uuid NOT NULL REFERENCES production.website_snapshots(id) ON DELETE CASCADE,
    change_type varchar(50) NOT NULL,
    change_description text,
    impact_score integer,
    detected_at timestamp NOT NULL DEFAULT now(),
    previous_snapshot_id uuid REFERENCES production.website_snapshots(id),
    created_at timestamp DEFAULT now()
);

-- =====================================================
-- 4. ADD MISSING WEBSITE_SNAPSHOTS COLUMNS (IF NEEDED)
-- =====================================================
ALTER TABLE production.website_snapshots 
ADD COLUMN IF NOT EXISTS title varchar(255),
ADD COLUMN IF NOT EXISTS meta_description varchar(255),
ADD COLUMN IF NOT EXISTS has_title boolean,
ADD COLUMN IF NOT EXISTS has_meta_description boolean,
ADD COLUMN IF NOT EXISTS has_structured_data boolean,
ADD COLUMN IF NOT EXISTS structured_data_types_count integer,
ADD COLUMN IF NOT EXISTS quality_score integer;

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_backend_agent_executions_evaluation_id 
    ON production.backend_agent_executions (evaluation_id);

CREATE INDEX IF NOT EXISTS idx_backend_agent_executions_status 
    ON production.backend_agent_executions (status);

CREATE INDEX IF NOT EXISTS idx_backend_agent_executions_agent_name 
    ON production.backend_agent_executions (agent_name);

CREATE INDEX IF NOT EXISTS idx_content_changes_website_snapshot_id 
    ON production.content_changes (website_snapshot_id);

CREATE INDEX IF NOT EXISTS idx_content_changes_detected_at 
    ON production.content_changes (detected_at);

-- =====================================================
-- 6. VERIFY TABLES EXIST
-- =====================================================
SELECT 
    'backend_agent_executions' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'production' 
  AND table_name = 'backend_agent_executions'

UNION ALL

SELECT 
    'content_changes' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'production' 
  AND table_name = 'content_changes'

UNION ALL

SELECT 
    'website_snapshots' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'production' 
  AND table_name = 'website_snapshots';

-- Show the new table structures
\d production.backend_agent_executions;
\d production.content_changes;

COMMIT;
