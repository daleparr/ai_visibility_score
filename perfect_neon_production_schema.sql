-- =====================================================================================
-- PERFECT NEONDB PRODUCTION SCHEMA
-- Comprehensive schema based on production codebase analysis
-- Addresses all missing tables, columns, and constraints causing evaluation failures
-- =====================================================================================

-- Set search path to production schema
SET search_path TO production, public;

-- =====================================================================================
-- 1. ENUMS (Create in public schema for cross-schema access)
-- =====================================================================================

-- Core evaluation enums
CREATE TYPE IF NOT EXISTS public.evaluation_status AS ENUM('pending', 'running', 'completed', 'failed');
CREATE TYPE IF NOT EXISTS public.agent_status AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE IF NOT EXISTS public.grade_type AS ENUM('A', 'B', 'C', 'D', 'F');
CREATE TYPE IF NOT EXISTS public.recommendation_priority AS ENUM('1', '2', '3');

-- Industry and subscription enums
CREATE TYPE IF NOT EXISTS public.adi_industry_category AS ENUM(
    'apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics', 
    'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors', 
    'luxury', 'mass_market', 'b2b', 'services'
);
CREATE TYPE IF NOT EXISTS public.adi_subscription_tier AS ENUM('free', 'professional', 'enterprise');

-- Leaderboard and evaluation enums
CREATE TYPE IF NOT EXISTS public.page_type AS ENUM('homepage', 'product', 'about', 'contact', 'blog', 'search_results');
CREATE TYPE IF NOT EXISTS public.evaluation_queue_status AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE IF NOT EXISTS public.trigger_type AS ENUM('score_change', 'new_competitor', 'industry_shift');
CREATE TYPE IF NOT EXISTS public.competitive_evaluation_status AS ENUM('pending', 'running', 'completed', 'failed');
CREATE TYPE IF NOT EXISTS public.selection_type AS ENUM('manual', 'algorithmic', 'competitive_trigger');
CREATE TYPE IF NOT EXISTS public.model_id AS ENUM('gpt4o', 'claude35', 'gemini15');

-- =====================================================================================
-- 2. CORE USER MANAGEMENT TABLES
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL UNIQUE,
    email_verified timestamp,
    name varchar(255),
    image varchar(500),
    stripe_customer_id varchar(255),
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    type varchar(255) NOT NULL,
    provider varchar(255) NOT NULL,
    provider_account_id varchar(255) NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type varchar(255),
    scope varchar(255),
    id_token text,
    session_state varchar(255),
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token varchar(255) NOT NULL UNIQUE,
    user_id uuid NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    expires timestamp NOT NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.user_profiles (
    id uuid PRIMARY KEY REFERENCES production.users(id) ON DELETE CASCADE,
    full_name varchar(255),
    company_name varchar(255),
    role varchar(100),
    industry varchar(100),
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 3. SUBSCRIPTION AND PAYMENT MANAGEMENT
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.subscriptions (
    id serial PRIMARY KEY,
    user_id uuid REFERENCES production.users(id) ON DELETE CASCADE,
    stripe_customer_id varchar(255) UNIQUE,
    stripe_subscription_id varchar(255) UNIQUE,
    tier varchar(50) DEFAULT 'free' CHECK (tier IN ('free', 'index-pro', 'enterprise')),
    status varchar(50) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
    current_period_start timestamp,
    current_period_end timestamp,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.payments (
    id serial PRIMARY KEY,
    user_id uuid REFERENCES production.users(id) ON DELETE CASCADE,
    subscription_id integer REFERENCES production.subscriptions(id),
    stripe_payment_intent_id varchar(255) UNIQUE,
    stripe_invoice_id varchar(255),
    amount integer, -- in pence
    currency varchar(10) DEFAULT 'gbp',
    status varchar(50),
    tier varchar(50),
    created_at timestamp DEFAULT now()
);

-- Legacy ADI subscriptions (keeping for compatibility)
CREATE TABLE IF NOT EXISTS production.adi_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    tier public.adi_subscription_tier NOT NULL DEFAULT 'free',
    stripe_subscription_id varchar(255),
    stripe_customer_id varchar(255),
    current_period_start timestamp,
    current_period_end timestamp,
    is_active boolean DEFAULT true,
    monthly_evaluation_limit integer DEFAULT 3,
    api_access_enabled boolean DEFAULT false,
    benchmarking_enabled boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 4. BRAND MANAGEMENT WITH DEDUPLICATION
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.brands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    website_url varchar(500) NOT NULL,
    -- Generated column for URL normalization and deduplication
    normalized_host varchar(255) GENERATED ALWAYS AS (
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
    ) STORED,
    industry varchar(100),
    description text,
    competitors jsonb,
    adi_industry_id uuid,
    adi_enabled boolean DEFAULT false,
    annual_revenue_range varchar(50),
    employee_count_range varchar(50),
    primary_market_regions jsonb,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 5. EVALUATION SYSTEM CORE TABLES
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL REFERENCES production.brands(id) ON DELETE CASCADE,
    status public.evaluation_status DEFAULT 'pending',
    overall_score integer,
    grade public.grade_type,
    verdict text,
    strongest_dimension varchar(100),
    weakest_dimension varchar(100),
    biggest_opportunity varchar(100),
    adi_score integer,
    adi_grade public.grade_type,
    confidence_interval integer,
    reliability_score integer,
    industry_percentile integer,
    global_rank integer,
    methodology_version varchar(20) DEFAULT 'ADI-v1.0',
    started_at timestamp DEFAULT now(),
    completed_at timestamp,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.dimension_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    dimension_name varchar(100) NOT NULL,
    score integer NOT NULL,
    explanation text,
    recommendations jsonb,
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 6. CRITICAL MISSING TABLES (CAUSING CURRENT FAILURES)
-- =====================================================================================

-- Crawl Site Signals - MISSING TABLE causing evaluation failures
CREATE TABLE IF NOT EXISTS production.crawl_site_signals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    load_time_ms integer,
    is_mobile_friendly boolean DEFAULT false,
    has_https boolean DEFAULT false,
    has_robots_txt boolean DEFAULT false,
    has_sitemap_xml boolean DEFAULT false,
    viewport_meta varchar(500),
    has_meta_description boolean DEFAULT false,
    has_title boolean DEFAULT false,
    has_h1 boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Website Snapshots - Enhanced with missing html_content column
CREATE TABLE IF NOT EXISTS production.website_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid REFERENCES production.brands(id),
    evaluation_id uuid REFERENCES production.evaluations(id) ON DELETE CASCADE,
    url varchar(500) NOT NULL,
    page_type public.page_type NOT NULL DEFAULT 'homepage',
    content_hash varchar(64) NOT NULL,
    raw_html text,
    html_content text, -- CRITICAL: Missing column causing failures
    structured_content jsonb,
    metadata jsonb,
    screenshot_url varchar(500),
    crawl_timestamp timestamp DEFAULT now(),
    content_size_bytes integer,
    load_time_ms integer,
    status_code integer DEFAULT 200,
    title varchar(255),
    meta_description varchar(255),
    has_title boolean,
    has_meta_description boolean,
    has_structured_data boolean,
    structured_data_types_count integer,
    quality_score integer,
    created_at timestamp DEFAULT now()
);

-- Evaluation Results - Enhanced with missing columns
CREATE TABLE IF NOT EXISTS production.evaluation_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    provider_name varchar(50) NOT NULL,
    test_type varchar(100) NOT NULL,
    prompt_used text,
    response_received text,
    score_contribution integer,
    -- CRITICAL: Missing columns causing failures
    has_schema boolean DEFAULT false,
    schema_type varchar(100),
    schema_errors jsonb,
    has_meta_description boolean DEFAULT false,
    has_title boolean DEFAULT false,
    has_h1 boolean DEFAULT false,
    is_mobile_friendly boolean DEFAULT false,
    load_time_ms integer,
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 7. ADI AGENT SYSTEM TABLES
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.adi_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    agent_name varchar(100) NOT NULL,
    agent_version varchar(20) DEFAULT 'v1.0',
    status public.agent_status DEFAULT 'pending',
    started_at timestamp,
    completed_at timestamp,
    execution_time_ms integer,
    input_data jsonb,
    output_data jsonb,
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.adi_agent_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id uuid NOT NULL REFERENCES production.adi_agents(id) ON DELETE CASCADE,
    result_type varchar(100) NOT NULL,
    raw_value integer,
    normalized_score integer,
    confidence_level integer,
    evidence jsonb,
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 8. AI PROVIDER MANAGEMENT
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.ai_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
    provider_name varchar(50) NOT NULL,
    api_key_encrypted text,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 9. RECOMMENDATIONS AND BENCHMARKING
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    priority public.recommendation_priority NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    impact_level varchar(20),
    effort_level varchar(20),
    category varchar(50),
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.competitor_benchmarks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    competitor_url varchar(500) NOT NULL,
    competitor_name varchar(255),
    overall_score integer,
    dimension_scores jsonb,
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 10. INDUSTRY AND LEADERBOARD SYSTEM
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.adi_industries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL UNIQUE,
    category public.adi_industry_category NOT NULL,
    description text,
    query_canon jsonb,
    benchmark_criteria jsonb,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.adi_benchmarks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id uuid REFERENCES production.adi_industries(id),
    benchmark_date timestamp NOT NULL,
    total_brands_evaluated integer,
    median_score integer,
    p25_score integer,
    p75_score integer,
    p90_score integer,
    top_performer_score integer,
    dimension_medians jsonb,
    methodology_version varchar(20),
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.adi_leaderboards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL REFERENCES production.brands(id) ON DELETE CASCADE,
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    industry_id uuid REFERENCES production.adi_industries(id),
    rank_global integer,
    rank_industry integer,
    rank_category integer,
    adi_score integer,
    score_change_30d integer,
    score_change_90d integer,
    is_public boolean DEFAULT false,
    featured_badge varchar(100),
    leaderboard_date timestamp NOT NULL,
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- 11. LEADERBOARD DATA SYSTEM
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.evaluation_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name varchar(255) NOT NULL,
    website_url varchar(500) NOT NULL,
    niche_category varchar(100) NOT NULL,
    priority integer DEFAULT 5,
    status public.evaluation_queue_status DEFAULT 'pending',
    scheduled_at timestamp DEFAULT now(),
    started_at timestamp,
    completed_at timestamp,
    retry_count integer DEFAULT 0,
    error_message text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.leaderboard_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    niche_category varchar(100) NOT NULL,
    brand_name varchar(255) NOT NULL,
    website_url varchar(500) NOT NULL,
    evaluation_id uuid REFERENCES production.evaluations(id),
    adi_score integer NOT NULL,
    grade varchar(5) NOT NULL,
    pillar_scores jsonb NOT NULL,
    dimension_scores jsonb NOT NULL,
    strength_highlight jsonb NOT NULL,
    gap_highlight jsonb NOT NULL,
    rank_global integer,
    rank_sector integer,
    rank_industry integer,
    rank_niche integer,
    trend_data jsonb,
    last_evaluated timestamp NOT NULL,
    cache_expires timestamp NOT NULL,
    is_public boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.leaderboard_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    niche_category varchar(100) NOT NULL,
    total_brands integer NOT NULL,
    evaluated_brands integer NOT NULL,
    average_score integer NOT NULL,
    median_score integer NOT NULL,
    top_performer varchar(255),
    top_score integer,
    last_updated timestamp NOT NULL,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.competitive_triggers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES production.users(id),
    brand_id uuid REFERENCES production.brands(id),
    competitor_url varchar(500) NOT NULL,
    competitor_name varchar(255),
    trigger_type public.trigger_type NOT NULL,
    evaluation_status public.competitive_evaluation_status DEFAULT 'pending',
    evaluation_id uuid REFERENCES production.evaluations(id),
    triggered_at timestamp DEFAULT now(),
    processed_at timestamp
);

CREATE TABLE IF NOT EXISTS production.niche_brand_selection (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    niche_category varchar(100) NOT NULL,
    brand_name varchar(255) NOT NULL,
    website_url varchar(500) NOT NULL,
    selection_type public.selection_type NOT NULL,
    priority integer DEFAULT 5,
    evaluation_status varchar(50) DEFAULT 'pending',
    evaluation_id uuid REFERENCES production.evaluations(id),
    added_at timestamp DEFAULT now(),
    last_evaluated timestamp
);

-- =====================================================================================
-- 12. CONTENT CHANGE DETECTION
-- =====================================================================================

CREATE TABLE IF NOT EXISTS production.content_changes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    website_snapshot_id uuid REFERENCES production.website_snapshots(id),
    change_type varchar(50) NOT NULL CHECK (change_type IN ('content_update', 'structure_change', 'new_feature', 'removal', 'performance_change')),
    change_description text,
    impact_score integer,
    detected_at timestamp DEFAULT now(),
    previous_snapshot_id uuid REFERENCES production.website_snapshots(id)
);

-- =====================================================================================
-- 13. CRITICAL UNIQUE CONSTRAINTS AND INDEXES
-- =====================================================================================

-- Prevent duplicate brands per user/domain
CREATE UNIQUE INDEX IF NOT EXISTS brands_user_normalized_host_uk 
    ON production.brands (user_id, normalized_host);

-- Prevent duplicate dimension scores per evaluation
CREATE UNIQUE INDEX IF NOT EXISTS dimension_scores_eval_dim_uk 
    ON production.dimension_scores (evaluation_id, dimension_name);

-- Prevent duplicate crawl signals per evaluation
CREATE UNIQUE INDEX IF NOT EXISTS crawl_site_signals_eval_uk 
    ON production.crawl_site_signals (evaluation_id);

-- Prevent duplicate website snapshots per evaluation + URL
CREATE UNIQUE INDEX IF NOT EXISTS website_snapshots_eval_url_kind_uk 
    ON production.website_snapshots (evaluation_id, url, page_type);

-- =====================================================================================
-- 14. PERFORMANCE INDEXES
-- =====================================================================================

-- Core query performance indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_brand_created 
    ON production.evaluations (brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dimension_scores_eval_created 
    ON production.dimension_scores (evaluation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_website_snapshots_eval_created 
    ON production.website_snapshots (evaluation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crawl_site_signals_evaluation_id 
    ON production.crawl_site_signals (evaluation_id);

CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluation_id 
    ON production.evaluation_results (evaluation_id);

CREATE INDEX IF NOT EXISTS idx_brands_normalized_host 
    ON production.brands (normalized_host);

CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_category 
    ON production.leaderboard_cache (niche_category);

CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_score 
    ON production.leaderboard_cache (adi_score DESC);

-- =====================================================================================
-- 15. FOREIGN KEY CONSTRAINTS (Additional Safety)
-- =====================================================================================

-- Ensure referential integrity for critical tables
ALTER TABLE production.crawl_site_signals 
    ADD CONSTRAINT IF NOT EXISTS fk_crawl_signals_evaluation 
    FOREIGN KEY (evaluation_id) REFERENCES production.evaluations(id) ON DELETE CASCADE;

ALTER TABLE production.website_snapshots 
    ADD CONSTRAINT IF NOT EXISTS fk_website_snapshots_evaluation 
    FOREIGN KEY (evaluation_id) REFERENCES production.evaluations(id) ON DELETE CASCADE;

ALTER TABLE production.evaluation_results 
    ADD CONSTRAINT IF NOT EXISTS fk_evaluation_results_evaluation 
    FOREIGN KEY (evaluation_id) REFERENCES production.evaluations(id) ON DELETE CASCADE;

-- =====================================================================================
-- 16. SCHEMA VALIDATION AND COMMENTS
-- =====================================================================================

-- Add helpful comments for critical tables
COMMENT ON TABLE production.crawl_site_signals IS 'Technical crawl metrics per evaluation - prevents agent failures';
COMMENT ON TABLE production.website_snapshots IS 'HTML content snapshots with html_content column for agent analysis';
COMMENT ON TABLE production.evaluation_results IS 'Enhanced evaluation results with schema and technical columns';
COMMENT ON TABLE production.brands IS 'Brand management with normalized_host for deduplication';
COMMENT ON TABLE production.dimension_scores IS 'Per-evaluation dimension scores with unique constraint';

-- =====================================================================================
-- SCHEMA COMPLETION SUMMARY
-- =====================================================================================

-- This schema addresses:
-- ✅ Missing crawl_site_signals table (causing evaluation failures)
-- ✅ Missing html_content column in website_snapshots (causing data loss)
-- ✅ Missing columns in evaluation_results (has_schema, schema_type, etc.)
-- ✅ Brand deduplication with normalized_host
-- ✅ Proper unique constraints to prevent data duplication
-- ✅ Performance indexes for common query patterns
-- ✅ Complete foreign key relationships
-- ✅ All enums and types used by the application
-- ✅ Leaderboard and competitive analysis tables
-- ✅ Content change detection system
-- ✅ AI provider management
-- ✅ Subscription and payment tracking

COMMIT;
