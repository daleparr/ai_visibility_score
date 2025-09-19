-- =====================================================
-- CRITICAL PRODUCTION SCHEMA MIGRATION
-- Ensures all tables exist in production schema for live web app
-- =====================================================

-- Create production schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS production;

-- Set search path to production schema
SET search_path TO production, public;

-- Create all required enums in production schema
DO $$ BEGIN
    CREATE TYPE production.evaluation_status AS ENUM ('pending', 'running', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production.grade_type AS ENUM ('A', 'B', 'C', 'D', 'F');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production.recommendation_priority AS ENUM ('1', '2', '3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production.adi_subscription_tier AS ENUM ('free', 'professional', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production.adi_industry_category AS ENUM (
        'apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics',
        'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors',
        'luxury', 'mass_market', 'b2b', 'services'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production.agent_status AS ENUM ('pending', 'running', 'completed', 'failed', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Core Authentication Tables
CREATE TABLE IF NOT EXISTS production.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified TIMESTAMP,
    name VARCHAR(255),
    image VARCHAR(500),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production.user_profiles (
    id UUID PRIMARY KEY REFERENCES production.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(100),
    industry VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Core Business Tables
CREATE TABLE IF NOT EXISTS production.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    competitors JSONB,
    adi_industry_id UUID,
    adi_enabled BOOLEAN DEFAULT false,
    annual_revenue_range VARCHAR(50),
    employee_count_range VARCHAR(50),
    target_market VARCHAR(100),
    brand_positioning TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CRITICAL: Evaluation Tables (Main issue)
CREATE TABLE IF NOT EXISTS production.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES production.brands(id) ON DELETE CASCADE,
    status production.evaluation_status DEFAULT 'pending',
    overall_score INTEGER,
    grade VARCHAR(5),
    verdict TEXT,
    strongest_dimension VARCHAR(255),
    weakest_dimension VARCHAR(255),
    biggest_opportunity TEXT,
    adi_score INTEGER,
    adi_grade VARCHAR(5),
    confidence_interval INTEGER,
    reliability_score INTEGER,
    industry_percentile INTEGER,
    global_rank INTEGER,
    methodology_version VARCHAR(50),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CRITICAL: Dimension Scores Table (Main issue)
CREATE TABLE IF NOT EXISTS production.dimension_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    dimension_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    explanation TEXT,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Provider Tables
CREATE TABLE IF NOT EXISTS production.ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_key_encrypted TEXT,
    provider_type VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation Results
CREATE TABLE IF NOT EXISTS production.evaluation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES production.ai_providers(id),
    result_data JSONB NOT NULL,
    execution_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations
CREATE TABLE IF NOT EXISTS production.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority production.recommendation_priority DEFAULT '2',
    impact_score INTEGER,
    effort_score INTEGER,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Competitor Benchmarks
CREATE TABLE IF NOT EXISTS production.competitor_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_url VARCHAR(500),
    benchmark_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS production.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50),
    price_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ADI Specific Tables
CREATE TABLE IF NOT EXISTS production.adi_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    tier production.adi_subscription_tier DEFAULT 'free',
    monthly_evaluations_limit INTEGER DEFAULT 5,
    monthly_evaluations_used INTEGER DEFAULT 0,
    advanced_analytics BOOLEAN DEFAULT false,
    api_access BOOLEAN DEFAULT false,
    white_label BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production.adi_industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category production.adi_industry_category,
    description TEXT,
    benchmark_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production.adi_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    agent_type VARCHAR(100),
    configuration JSONB,
    is_active BOOLEAN DEFAULT true,
    execution_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CRITICAL: ADI Agent Results (Where crawl data is stored)
CREATE TABLE IF NOT EXISTS production.adi_agent_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES production.evaluations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES production.adi_agents(id),
    agent_name VARCHAR(255) NOT NULL,
    status production.agent_status DEFAULT 'pending',
    results JSONB,
    execution_time INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production.adi_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID REFERENCES production.adi_industries(id),
    dimension_name VARCHAR(255) NOT NULL,
    percentile_25 DECIMAL(5,2),
    percentile_50 DECIMAL(5,2),
    percentile_75 DECIMAL(5,2),
    percentile_90 DECIMAL(5,2),
    sample_size INTEGER,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Leaderboard Tables
CREATE TABLE IF NOT EXISTS production.adi_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    industry VARCHAR(100),
    adi_score INTEGER NOT NULL,
    grade VARCHAR(5),
    industry_rank INTEGER,
    global_rank INTEGER,
    evaluation_date TIMESTAMP,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production.leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES production.evaluations(id),
    brand_name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    industry VARCHAR(100),
    adi_score INTEGER NOT NULL,
    grade VARCHAR(5),
    industry_rank INTEGER,
    global_rank INTEGER,
    is_public BOOLEAN DEFAULT true,
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_production_evaluations_brand_id ON production.evaluations(brand_id);
CREATE INDEX IF NOT EXISTS idx_production_evaluations_status ON production.evaluations(status);
CREATE INDEX IF NOT EXISTS idx_production_evaluations_created_at ON production.evaluations(created_at);

CREATE INDEX IF NOT EXISTS idx_production_dimension_scores_evaluation_id ON production.dimension_scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_production_dimension_scores_dimension_name ON production.dimension_scores(dimension_name);

CREATE INDEX IF NOT EXISTS idx_production_adi_agent_results_evaluation_id ON production.adi_agent_results(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_production_adi_agent_results_agent_name ON production.adi_agent_results(agent_name);
CREATE INDEX IF NOT EXISTS idx_production_adi_agent_results_created_at ON production.adi_agent_results(created_at);

CREATE INDEX IF NOT EXISTS idx_production_brands_user_id ON production.brands(user_id);
CREATE INDEX IF NOT EXISTS idx_production_brands_website_url ON production.brands(website_url);

CREATE INDEX IF NOT EXISTS idx_production_leaderboard_cache_adi_score ON production.leaderboard_cache(adi_score DESC);
CREATE INDEX IF NOT EXISTS idx_production_leaderboard_cache_industry ON production.leaderboard_cache(industry);

-- Grant permissions
GRANT USAGE ON SCHEMA production TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA production TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA production TO PUBLIC;

-- Comments for documentation
COMMENT ON SCHEMA production IS 'Production schema for AI Discoverability Index live web application';
COMMENT ON TABLE production.evaluations IS 'Core evaluation records - CRITICAL for data persistence';
COMMENT ON TABLE production.dimension_scores IS 'Individual dimension scores - CRITICAL for detailed analysis';
COMMENT ON TABLE production.adi_agent_results IS 'Crawl data and agent execution results';

-- Verification queries
SELECT 'Production schema migration completed successfully' as status;
SELECT COUNT(*) as total_production_tables FROM information_schema.tables WHERE table_schema = 'production';