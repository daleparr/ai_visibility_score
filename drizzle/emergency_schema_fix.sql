-- EMERGENCY DATABASE SCHEMA FIX
-- Addresses critical missing tables and columns causing evaluation data loss
-- Run this immediately to fix production database schema mismatch

-- Set search path to production schema
SET search_path TO production;

-- 1. CREATE MISSING TABLE: crawl_site_signals
CREATE TABLE IF NOT EXISTS production.crawl_site_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL,
    load_time_ms INTEGER,
    is_mobile_friendly BOOLEAN DEFAULT false,
    has_https BOOLEAN DEFAULT false,
    has_robots_txt BOOLEAN DEFAULT false,
    has_sitemap_xml BOOLEAN DEFAULT false,
    viewport_meta VARCHAR(500),
    has_meta_description BOOLEAN DEFAULT false,
    has_title BOOLEAN DEFAULT false,
    has_h1 BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Add foreign key constraint
    CONSTRAINT fk_crawl_signals_evaluation 
        FOREIGN KEY (evaluation_id) 
        REFERENCES production.evaluations(id) 
        ON DELETE CASCADE,
    
    -- Ensure one record per evaluation
    CONSTRAINT unique_crawl_signals_per_evaluation 
        UNIQUE (evaluation_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_crawl_site_signals_evaluation_id 
    ON production.crawl_site_signals(evaluation_id);

-- 2. CREATE MISSING TABLE: website_snapshots
CREATE TABLE IF NOT EXISTS production.website_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL,
    url VARCHAR(1000) NOT NULL,
    html_content TEXT,
    screenshot_url VARCHAR(1000),
    page_type VARCHAR(50) DEFAULT 'homepage',
    content_hash VARCHAR(64), -- For deduplication
    file_size_bytes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Add foreign key constraint
    CONSTRAINT fk_website_snapshots_evaluation 
        FOREIGN KEY (evaluation_id) 
        REFERENCES production.evaluations(id) 
        ON DELETE CASCADE,
    
    -- Prevent duplicate snapshots for same evaluation + URL
    CONSTRAINT unique_snapshot_per_evaluation_url 
        UNIQUE (evaluation_id, url)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_website_snapshots_evaluation_id 
    ON production.website_snapshots(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_url 
    ON production.website_snapshots(url);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_page_type 
    ON production.website_snapshots(page_type);

-- 3. ADD MISSING COLUMNS TO evaluation_results
-- Check if columns exist before adding them
DO $$ 
BEGIN
    -- Add has_schema column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'production' 
        AND table_name = 'evaluation_results' 
        AND column_name = 'has_schema'
    ) THEN
        ALTER TABLE production.evaluation_results 
        ADD COLUMN has_schema BOOLEAN DEFAULT false;
    END IF;
    
    -- Add schema_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'production' 
        AND table_name = 'evaluation_results' 
        AND column_name = 'schema_type'
    ) THEN
        ALTER TABLE production.evaluation_results 
        ADD COLUMN schema_type VARCHAR(100);
    END IF;
    
    -- Add schema_errors column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'production' 
        AND table_name = 'evaluation_results' 
        AND column_name = 'schema_errors'
    ) THEN
        ALTER TABLE production.evaluation_results 
        ADD COLUMN schema_errors JSONB;
    END IF;
    
    -- Add has_meta_description column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'production' 
        AND table_name = 'evaluation_results' 
        AND column_name = 'has_meta_description'
    ) THEN
        ALTER TABLE production.evaluation_results 
        ADD COLUMN has_meta_description BOOLEAN DEFAULT false;
    END IF;
    
    -- Add has_title column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'production' 
        AND table_name = 'evaluation_results' 
        AND column_name = 'has_title'
    ) THEN
        ALTER TABLE production.evaluation_results 
        ADD COLUMN has_title BOOLEAN DEFAULT false;
    END IF;
    
    -- Add has_h1 column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'production' 
        AND table_name = 'evaluation_results' 
        AND column_name = 'has_h1'
    ) THEN
        ALTER TABLE production.evaluation_results 
        ADD COLUMN has_h1 BOOLEAN DEFAULT false;
    END IF;
    
    -- Add is_mobile_friendly column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'production' 
        AND table_name = 'evaluation_results' 
        AND column_name = 'is_mobile_friendly'
    ) THEN
        ALTER TABLE production.evaluation_results 
        ADD COLUMN is_mobile_friendly BOOLEAN DEFAULT false;
    END IF;
    
    -- Add load_time_ms column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'production' 
        AND table_name = 'evaluation_results' 
        AND column_name = 'load_time_ms'
    ) THEN
        ALTER TABLE production.evaluation_results 
        ADD COLUMN load_time_ms INTEGER;
    END IF;
    
END $$;

-- 4. CREATE ENHANCED PROBE RESULTS TABLE (for future enhanced probes)
CREATE TABLE IF NOT EXISTS production.probe_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL,
    probe_name VARCHAR(100) NOT NULL,
    model_used VARCHAR(50) NOT NULL,
    was_valid BOOLEAN DEFAULT false,
    is_trusted BOOLEAN DEFAULT false,
    confidence_score INTEGER DEFAULT 0,
    raw_output JSONB,
    structured_output JSONB,
    reasoning_chain JSONB, -- For enhanced probe reasoning
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Add foreign key constraint
    CONSTRAINT fk_probe_results_evaluation 
        FOREIGN KEY (evaluation_id) 
        REFERENCES production.evaluations(id) 
        ON DELETE CASCADE,
    
    -- Allow multiple probe results per evaluation (different probes, different models)
    CONSTRAINT unique_probe_per_evaluation_model 
        UNIQUE (evaluation_id, probe_name, model_used)
);

-- Create indexes for probe results
CREATE INDEX IF NOT EXISTS idx_probe_results_evaluation_id 
    ON production.probe_results(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_probe_results_probe_name 
    ON production.probe_results(probe_name);
CREATE INDEX IF NOT EXISTS idx_probe_results_model_used 
    ON production.probe_results(model_used);

-- 5. ADD HYBRID CRAWL DATA TABLE (for Hybrid Crawl Agent results)
CREATE TABLE IF NOT EXISTS production.hybrid_crawl_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL,
    data_sources_used TEXT[] DEFAULT '{}', -- Array of source names
    quality_score INTEGER DEFAULT 0,
    light_crawl_data JSONB,
    brave_search_data JSONB,
    google_cse_data JSONB,
    domain_analysis_data JSONB,
    reputation_signals JSONB,
    key_information JSONB,
    structured_snippets JSONB,
    execution_time_ms INTEGER,
    cache_hit BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Add foreign key constraint
    CONSTRAINT fk_hybrid_crawl_evaluation 
        FOREIGN KEY (evaluation_id) 
        REFERENCES production.evaluations(id) 
        ON DELETE CASCADE,
    
    -- One hybrid crawl result per evaluation
    CONSTRAINT unique_hybrid_crawl_per_evaluation 
        UNIQUE (evaluation_id)
);

-- Create index for hybrid crawl data
CREATE INDEX IF NOT EXISTS idx_hybrid_crawl_data_evaluation_id 
    ON production.hybrid_crawl_data(evaluation_id);

-- 6. VERIFY SCHEMA INTEGRITY
-- Create a verification function
CREATE OR REPLACE FUNCTION production.verify_schema_integrity()
RETURNS TABLE(
    table_name TEXT,
    column_name TEXT,
    status TEXT
) AS $$
BEGIN
    -- Check crawl_site_signals table
    RETURN QUERY
    SELECT 
        'crawl_site_signals'::TEXT,
        'table_exists'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'production' AND table_name = 'crawl_site_signals'
        ) THEN 'OK' ELSE 'MISSING' END::TEXT;
    
    -- Check website_snapshots table
    RETURN QUERY
    SELECT 
        'website_snapshots'::TEXT,
        'table_exists'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'production' AND table_name = 'website_snapshots'
        ) THEN 'OK' ELSE 'MISSING' END::TEXT;
    
    -- Check evaluation_results columns
    RETURN QUERY
    SELECT 
        'evaluation_results'::TEXT,
        'has_schema'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'production' AND table_name = 'evaluation_results' AND column_name = 'has_schema'
        ) THEN 'OK' ELSE 'MISSING' END::TEXT;
    
    RETURN QUERY
    SELECT 
        'evaluation_results'::TEXT,
        'load_time_ms'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'production' AND table_name = 'evaluation_results' AND column_name = 'load_time_ms'
        ) THEN 'OK' ELSE 'MISSING' END::TEXT;
    
    -- Check probe_results table (for enhanced probes)
    RETURN QUERY
    SELECT 
        'probe_results'::TEXT,
        'table_exists'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'production' AND table_name = 'probe_results'
        ) THEN 'OK' ELSE 'MISSING' END::TEXT;
    
    -- Check hybrid_crawl_data table
    RETURN QUERY
    SELECT 
        'hybrid_crawl_data'::TEXT,
        'table_exists'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'production' AND table_name = 'hybrid_crawl_data'
        ) THEN 'OK' ELSE 'MISSING' END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT * FROM production.verify_schema_integrity();

-- 7. GRANT PERMISSIONS (if needed)
-- Grant permissions to application user (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA production TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA production TO your_app_user;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Emergency schema fix completed successfully!';
    RAISE NOTICE 'Tables created: crawl_site_signals, website_snapshots, probe_results, hybrid_crawl_data';
    RAISE NOTICE 'Columns added to evaluation_results: has_schema, schema_type, schema_errors, has_meta_description, has_title, has_h1, is_mobile_friendly, load_time_ms';
    RAISE NOTICE 'Run SELECT * FROM production.verify_schema_integrity(); to verify all changes.';
END $$;
