-- AI Discoverability Index (ADI) Foundation Schema
-- This migration adds the premium ADI features while maintaining compatibility
-- with the existing AI Visibility Score system

-- Enable necessary extensions for ADI
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity searches

-- Create ADI-specific types
CREATE TYPE adi_subscription_tier AS ENUM ('free', 'professional', 'enterprise');
CREATE TYPE adi_industry_category AS ENUM (
    'apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics', 
    'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors',
    'luxury', 'mass_market', 'b2b', 'services'
);
CREATE TYPE agent_status AS ENUM ('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE adi_evaluation_type AS ENUM ('standard', 'adi_premium', 'benchmark');

-- ADI Subscriptions table
CREATE TABLE adi_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier adi_subscription_tier NOT NULL DEFAULT 'free',
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    monthly_evaluation_limit INTEGER DEFAULT 3,
    api_access_enabled BOOLEAN DEFAULT false,
    benchmarking_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADI Industries table for benchmarking
CREATE TABLE adi_industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category adi_industry_category NOT NULL,
    description TEXT,
    query_canon JSONB, -- Industry-specific query templates
    benchmark_criteria JSONB, -- Industry-specific scoring adjustments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced brands table for ADI
ALTER TABLE brands ADD COLUMN IF NOT EXISTS adi_industry_id UUID REFERENCES adi_industries(id);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS adi_enabled BOOLEAN DEFAULT false;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS annual_revenue_range VARCHAR(50);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS employee_count_range VARCHAR(50);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS primary_market_regions TEXT[];

-- ADI Evaluations (extends existing evaluations)
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS evaluation_type adi_evaluation_type DEFAULT 'standard';
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS adi_score INTEGER CHECK (adi_score >= 0 AND adi_score <= 100);
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS adi_grade grade_type;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS confidence_interval DECIMAL(4,2); -- ±2.4 format
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS reliability_score DECIMAL(4,2); -- Inter-model agreement
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS industry_percentile DECIMAL(5,2);
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS global_rank INTEGER;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS methodology_version VARCHAR(20) DEFAULT 'ADI-v1.0';

-- ADI Agents table for tracking agent execution
CREATE TABLE adi_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    agent_version VARCHAR(20) DEFAULT 'v1.0',
    status agent_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_time_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADI Agent Results (detailed outputs from each agent)
CREATE TABLE adi_agent_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES adi_agents(id) ON DELETE CASCADE,
    result_type VARCHAR(100) NOT NULL, -- 'schema_coverage', 'citation_count', etc.
    raw_value DECIMAL(10,4),
    normalized_score INTEGER CHECK (normalized_score >= 0 AND normalized_score <= 100),
    confidence_level DECIMAL(4,2),
    evidence JSONB, -- Supporting data/artifacts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADI Benchmarks table for industry comparisons
CREATE TABLE adi_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID REFERENCES adi_industries(id),
    benchmark_date DATE NOT NULL,
    total_brands_evaluated INTEGER,
    median_score DECIMAL(5,2),
    p25_score DECIMAL(5,2),
    p75_score DECIMAL(5,2),
    p90_score DECIMAL(5,2),
    top_performer_score DECIMAL(5,2),
    dimension_medians JSONB, -- Median scores for each dimension
    methodology_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADI Leaderboards for public rankings
CREATE TABLE adi_leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    industry_id UUID REFERENCES adi_industries(id),
    rank_global INTEGER,
    rank_industry INTEGER,
    rank_category INTEGER,
    adi_score INTEGER,
    score_change_30d INTEGER,
    score_change_90d INTEGER,
    is_public BOOLEAN DEFAULT false,
    featured_badge VARCHAR(100), -- "Top 10 AI-Ready Streetwear 2025"
    leaderboard_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADI Query Canon for standardized testing
CREATE TABLE adi_query_canon (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID REFERENCES adi_industries(id),
    query_text TEXT NOT NULL,
    query_category VARCHAR(100), -- 'fit', 'occasion', 'ethics', 'logistics'
    query_type VARCHAR(50), -- 'product_discovery', 'comparison', 'recommendation'
    expected_response_elements TEXT[], -- What should appear in good responses
    weight DECIMAL(4,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT 'v1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADI Crawl Artifacts for audit trails
CREATE TABLE adi_crawl_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    artifact_type VARCHAR(100), -- 'html_snapshot', 'schema_extract', 'sitemap'
    url VARCHAR(1000),
    content_hash VARCHAR(64), -- SHA-256 for integrity
    content_size INTEGER,
    storage_path VARCHAR(500), -- S3/storage location
    extracted_data JSONB,
    crawl_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADI API Usage for licensing and rate limiting
CREATE TABLE adi_api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES adi_subscriptions(id),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    request_count INTEGER DEFAULT 1,
    response_size_bytes INTEGER,
    response_time_ms INTEGER,
    status_code INTEGER,
    usage_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_adi_subscriptions_user_id ON adi_subscriptions(user_id);
CREATE INDEX idx_adi_subscriptions_tier ON adi_subscriptions(tier);
CREATE INDEX idx_adi_agents_evaluation_id ON adi_agents(evaluation_id);
CREATE INDEX idx_adi_agents_status ON adi_agents(status);
CREATE INDEX idx_adi_agent_results_agent_id ON adi_agent_results(agent_id);
CREATE INDEX idx_adi_benchmarks_industry_date ON adi_benchmarks(industry_id, benchmark_date);
CREATE INDEX idx_adi_leaderboards_industry_rank ON adi_leaderboards(industry_id, rank_industry);
CREATE INDEX idx_adi_leaderboards_global_rank ON adi_leaderboards(rank_global);
CREATE INDEX idx_adi_leaderboards_date ON adi_leaderboards(leaderboard_date);
CREATE INDEX idx_adi_query_canon_industry ON adi_query_canon(industry_id);
CREATE INDEX idx_adi_crawl_artifacts_evaluation ON adi_crawl_artifacts(evaluation_id);
CREATE INDEX idx_adi_api_usage_user_date ON adi_api_usage(user_id, usage_date);

-- Create updated_at triggers for ADI tables
CREATE TRIGGER update_adi_subscriptions_updated_at BEFORE UPDATE ON adi_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adi_industries_updated_at BEFORE UPDATE ON adi_industries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies for ADI tables
ALTER TABLE adi_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adi_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE adi_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE adi_agent_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE adi_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE adi_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE adi_query_canon ENABLE ROW LEVEL SECURITY;
ALTER TABLE adi_crawl_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE adi_api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscriptions" ON adi_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON adi_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Industries are publicly readable" ON adi_industries
    FOR SELECT USING (true);

CREATE POLICY "Users can view agents for their evaluations" ON adi_agents
    FOR SELECT USING (
        evaluation_id IN (
            SELECT e.id FROM evaluations e 
            JOIN brands b ON e.brand_id = b.id 
            WHERE b.user_id = auth.uid()
        )
    );

CREATE POLICY "Public leaderboards are readable" ON adi_leaderboards
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own API usage" ON adi_api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Insert default industries
INSERT INTO adi_industries (name, category, description) VALUES
('Streetwear', 'apparel', 'Urban fashion and street-inspired clothing brands'),
('Activewear', 'apparel', 'Athletic and fitness-focused clothing brands'),
('Luxury Fashion', 'luxury', 'High-end fashion and designer brands'),
('Fast Fashion', 'mass_market', 'Affordable, trend-driven fashion retailers'),
('Sustainable Fashion', 'apparel', 'Eco-conscious and sustainable clothing brands'),
('Footwear', 'footwear', 'Shoe and sneaker brands across all categories'),
('Beauty & Cosmetics', 'beauty', 'Makeup, skincare, and beauty product brands'),
('Home & Living', 'home', 'Furniture, decor, and home goods brands'),
('Consumer Electronics', 'electronics', 'Technology and electronic device brands'),
('Health & Wellness', 'health_wellness', 'Supplements, fitness, and wellness brands');

-- Insert default query canon for apparel
INSERT INTO adi_query_canon (industry_id, query_text, query_category, query_type) 
SELECT 
    i.id,
    query_text,
    query_category,
    query_type
FROM adi_industries i,
(VALUES 
    ('What are the best sustainable clothing brands?', 'ethics', 'recommendation'),
    ('How do I find clothes that fit my body type?', 'fit', 'product_discovery'),
    ('What should I wear to a business casual event?', 'occasion', 'recommendation'),
    ('How long does shipping usually take?', 'logistics', 'product_discovery'),
    ('What is your return policy?', 'logistics', 'product_discovery'),
    ('Compare this brand to their main competitor', 'comparison', 'comparison'),
    ('What are your best-selling items?', 'product_discovery', 'recommendation'),
    ('Do you offer international shipping?', 'logistics', 'product_discovery'),
    ('What materials do you use in your products?', 'ethics', 'product_discovery'),
    ('How do I care for this garment?', 'care', 'product_discovery')
) AS queries(query_text, query_category, query_type)
WHERE i.category = 'apparel';

-- Add comments for documentation
COMMENT ON TABLE adi_subscriptions IS 'Manages ADI subscription tiers and billing';
COMMENT ON TABLE adi_industries IS 'Industry categories for benchmarking and specialized evaluation';
COMMENT ON TABLE adi_agents IS 'Tracks execution of individual agents in the ADI evaluation pipeline';
COMMENT ON TABLE adi_agent_results IS 'Detailed results from each agent execution';
COMMENT ON TABLE adi_benchmarks IS 'Industry benchmark data for comparative analysis';
COMMENT ON TABLE adi_leaderboards IS 'Public and private brand rankings';
COMMENT ON TABLE adi_query_canon IS 'Standardized queries for consistent evaluation across brands';
COMMENT ON TABLE adi_crawl_artifacts IS 'Audit trail of crawled data and artifacts';
COMMENT ON TABLE adi_api_usage IS 'API usage tracking for rate limiting and billing';