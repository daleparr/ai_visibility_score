-- Fresh Production Schema for Neon DB
-- Generated from current codebase to eliminate schema drift
-- Import this manually to Neon DB

-- Drop existing production schema if needed
-- DROP SCHEMA IF EXISTS production CASCADE;

-- Create production schema
CREATE SCHEMA IF NOT EXISTS production;

-- Set search path
SET search_path = production, public;

-- Create ENUMS
CREATE TYPE evaluation_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE grade_type AS ENUM ('A', 'B', 'C', 'D', 'F');
CREATE TYPE recommendation_priority AS ENUM ('1', '2', '3');

-- Core Tables

-- Users table
CREATE TABLE production.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified TIMESTAMP,
    name VARCHAR(255),
    image VARCHAR(500),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles table  
CREATE TABLE production.user_profiles (
    id UUID PRIMARY KEY REFERENCES production.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(100),
    industry VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Brands table with normalized_host
CREATE TABLE production.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    normalized_host TEXT GENERATED ALWAYS AS (
        lower(
            split_part(
                regexp_replace(
                    regexp_replace(coalesce(website_url, ''), '^https?://', '', 'i'),
                    '^www\.', '', 'i'
                ),
                '/', 1
            )
        )
    ) STORED,
    industry VARCHAR(100),
    description TEXT,
    competitors JSONB,
    adi_industry_id UUID,
    adi_enabled BOOLEAN DEFAULT false,
    annual_revenue_range VARCHAR(50),
    employee_count_range VARCHAR(50),
    primary_market_regions JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint for user + normalized host
    UNIQUE(user_id, normalized_host)
);

-- Evaluations table
CREATE TABLE production.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES production.brands(id) ON DELETE CASCADE,
    status evaluation_status DEFAULT 'pending',
    overall_score INTEGER,
    grade grade_type,
    verdict TEXT,
    strongest_dimension VARCHAR(100),
    weakest_dimension VARCHAR(100),
    biggest_opportunity VARCHAR(100),
    adi_score INTEGER,
    adi_grade grade_type,
    confidence_interval INTEGER,
    reliability_score INTEGER,
    industry_percentile INTEGER,
    market_position_strength INTEGER,
    competitive_advantage_score INTEGER,
    benchmark_comparison_score INTEGER,
    accessibility_score INTEGER,
    performance_score INTEGER,
    content_score INTEGER,
    social_media_score INTEGER,
    user_experience_score INTEGER,
    technical_seo_score INTEGER,
    mobile_optimization_score INTEGER,
    brand_consistency_score INTEGER,
    innovation_score INTEGER,
    customer_engagement_score INTEGER,
    market_presence_score INTEGER,
    digital_footprint_score INTEGER,
    analysis_depth_score INTEGER,
    credibility_score INTEGER,
    risk_assessment_score INTEGER,
    growth_potential_score INTEGER,
    evaluation_completeness INTEGER,
    data_richness_score INTEGER,
    insight_quality_score INTEGER,
    trace_id VARCHAR(50),
    agent_version VARCHAR(20) DEFAULT 'ADI-v1.0',
    started_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dimension scores table
CREATE TABLE production.dimension_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    dimension_name VARCHAR(100) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    reasoning TEXT,
    confidence_level DECIMAL(3,2),
    data_sources JSONB,
    methodology TEXT,
    weight DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate dimensions per evaluation
    UNIQUE(evaluation_id, dimension_name)
);

-- Website snapshots table
CREATE TABLE production.website_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    page_type VARCHAR(50),
    content_hash VARCHAR(64),
    html_content TEXT,
    metadata JSONB,
    screenshot_url VARCHAR(500),
    load_time INTEGER,
    page_size INTEGER,
    status_code INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate snapshots per evaluation
    UNIQUE(evaluation_id, url, page_type)
);

-- Crawl site signals table
CREATE TABLE production.crawl_site_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    signal_type VARCHAR(100) NOT NULL,
    signal_value TEXT,
    confidence DECIMAL(3,2),
    source_url VARCHAR(500),
    extraction_method VARCHAR(100),
    raw_data JSONB,
    processed_data JSONB,
    relevance_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate signals per evaluation
    UNIQUE(evaluation_id, signal_type, source_url)
);

-- Evaluation features flat table
CREATE TABLE production.evaluation_features_flat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value TEXT,
    feature_type VARCHAR(50),
    feature_category VARCHAR(50),
    weight DECIMAL(3,2),
    importance_score DECIMAL(3,2),
    raw_data JSONB,
    processed_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate features per evaluation
    UNIQUE(evaluation_id, feature_name, feature_category)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON production.brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_normalized_host ON production.brands(normalized_host);
CREATE INDEX IF NOT EXISTS idx_evaluations_brand_id ON production.evaluations(brand_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON production.evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON production.evaluations(created_at);
CREATE INDEX IF NOT EXISTS idx_dimension_scores_evaluation_id ON production.dimension_scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_evaluation_id ON production.website_snapshots(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_crawl_site_signals_evaluation_id ON production.crawl_site_signals(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_features_flat_evaluation_id ON production.evaluation_features_flat(evaluation_id);

-- Set permissions (adjust as needed)
GRANT USAGE ON SCHEMA production TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA production TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA production TO PUBLIC;

-- Verification queries
SELECT 'Schema created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'production' ORDER BY table_name;