-- =====================================================
-- COMPREHENSIVE PRODUCTION SCHEMA FOR NEON DATABASE
-- AI Discoverability Index with Advanced Analytics
-- Includes federated learning, predictive insights, and competitive analysis
-- =====================================================

-- Set search path to production schema
SET search_path TO production, public;

-- =====================================================
-- STEP 1: CREATE ALL ENUMS IN PRODUCTION SCHEMA
-- =====================================================

-- Core evaluation enums
CREATE TYPE production.adi_industry_category AS ENUM('apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics', 'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors', 'luxury', 'mass_market', 'b2b', 'services');
CREATE TYPE production.adi_subscription_tier AS ENUM('free', 'professional', 'enterprise');
CREATE TYPE production.agent_status AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE production.evaluation_status AS ENUM('pending', 'running', 'completed', 'failed');
CREATE TYPE production.grade_type AS ENUM('A', 'B', 'C', 'D', 'F');
CREATE TYPE production.recommendation_priority AS ENUM('1', '2', '3');

-- Leaderboard system enums
CREATE TYPE production.evaluation_queue_status AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE production.trigger_type AS ENUM('user_added', 'auto_detected', 'leaderboard_gap');
CREATE TYPE production.selection_type AS ENUM('market_leader', 'emerging', 'geographic_mix', 'price_coverage');
CREATE TYPE production.competitive_evaluation_status AS ENUM('pending', 'queued', 'completed', 'failed');

-- =====================================================
-- STEP 2: CREATE CORE USER & AUTH TABLES
-- =====================================================

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

-- Accounts table for OAuth
CREATE TABLE production.accounts (
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

-- Sessions table
CREATE TABLE production.sessions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	session_token VARCHAR(255) NOT NULL UNIQUE,
	user_id UUID NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
	expires TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles
CREATE TABLE production.user_profiles (
	id UUID PRIMARY KEY REFERENCES production.users(id) ON DELETE CASCADE,
	full_name VARCHAR(255),
	company_name VARCHAR(255),
	role VARCHAR(100),
	industry VARCHAR(100),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE BRAND & EVALUATION TABLES
-- =====================================================

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
	
	-- Unique constraint for deduplication
	UNIQUE(user_id, normalized_host)
);

-- Evaluations table
CREATE TABLE production.evaluations (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	brand_id UUID NOT NULL REFERENCES production.brands(id) ON DELETE CASCADE,
	status production.evaluation_status DEFAULT 'pending',
	overall_score INTEGER,
	grade production.grade_type,
	verdict TEXT,
	strongest_dimension VARCHAR(100),
	weakest_dimension VARCHAR(100),
	biggest_opportunity VARCHAR(100),
	adi_score INTEGER,
	adi_grade production.grade_type,
	confidence_interval INTEGER,
	reliability_score INTEGER,
	industry_percentile INTEGER,
	global_rank INTEGER,
	methodology_version VARCHAR(20) DEFAULT 'ADI-v1.0',
	started_at TIMESTAMP DEFAULT NOW(),
	completed_at TIMESTAMP,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Dimension scores
CREATE TABLE production.dimension_scores (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
	dimension_name VARCHAR(100) NOT NULL,
	score INTEGER NOT NULL,
	explanation TEXT,
	recommendations JSONB,
	created_at TIMESTAMP DEFAULT NOW(),
	
	-- Prevent duplicate dimensions per evaluation
	UNIQUE(evaluation_id, dimension_name)
);

-- =====================================================
-- STEP 4: CREATE LEADERBOARD SYSTEM TABLES
-- =====================================================

-- Evaluation Queue Management
CREATE TABLE production.evaluation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  niche_category VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 5,
  status production.evaluation_queue_status DEFAULT 'pending',
  scheduled_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard Cache for Real Evaluation Data
CREATE TABLE production.leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_category VARCHAR(100) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  evaluation_id UUID REFERENCES production.evaluations(id),
  adi_score INTEGER NOT NULL,
  grade VARCHAR(5) NOT NULL,
  pillar_scores JSONB NOT NULL,
  dimension_scores JSONB NOT NULL,
  strength_highlight JSONB NOT NULL,
  gap_highlight JSONB NOT NULL,
  rank_global INTEGER,
  rank_sector INTEGER,
  rank_industry INTEGER,
  rank_niche INTEGER,
  trend_data JSONB,
  last_evaluated TIMESTAMP NOT NULL,
  cache_expires TIMESTAMP NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint for cache entries
  UNIQUE(niche_category, website_url)
);

-- =====================================================
-- STEP 5: CREATE CRAWL DATA TABLES
-- =====================================================

-- Website Snapshots for Crawl Data
CREATE TABLE production.website_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES production.brands(id),
  evaluation_id UUID REFERENCES production.evaluations(id),
  url VARCHAR(500) NOT NULL,
  page_type VARCHAR(50) NOT NULL CHECK (page_type IN ('homepage', 'product', 'about', 'contact', 'blog', 'search_results')),
  content_hash VARCHAR(64) NOT NULL,
  raw_html TEXT,
  structured_content JSONB,
  metadata JSONB,
  screenshot_url VARCHAR(500),
  crawl_timestamp TIMESTAMP DEFAULT NOW(),
  content_size_bytes INTEGER,
  load_time_ms INTEGER,
  status_code INTEGER DEFAULT 200,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate snapshots
  UNIQUE(evaluation_id, url, page_type)
);

-- Crawl Site Signals
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
  
  -- Prevent duplicate signals
  UNIQUE(evaluation_id, signal_type, source_url)
);

-- Evaluation Features Flat
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
  
  -- Prevent duplicate features
  UNIQUE(evaluation_id, feature_name, feature_category)
);

-- =====================================================
-- STEP 6: CREATE FEDERATED LEARNING TABLES
-- =====================================================

-- Federated Learning Sessions
CREATE TABLE production.federated_learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES production.users(id),
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('evaluation_feedback', 'ui_interaction', 'search_behavior', 'comparison_analysis')),
  interaction_data JSONB NOT NULL,
  model_version VARCHAR(20) DEFAULT 'v1.0',
  privacy_level VARCHAR(20) DEFAULT 'anonymized' CHECK (privacy_level IN ('anonymized', 'pseudonymized', 'aggregated')),
  contribution_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Model Improvements Tracking
CREATE TABLE production.model_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  improvement_type VARCHAR(50) NOT NULL CHECK (improvement_type IN ('scoring_accuracy', 'dimension_weights', 'agent_performance', 'user_satisfaction')),
  baseline_metric DECIMAL(8,4) NOT NULL,
  improved_metric DECIMAL(8,4) NOT NULL,
  improvement_percentage DECIMAL(5,2) NOT NULL,
  data_source VARCHAR(50) NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'deployed', 'rolled_back')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Engagement Metrics
CREATE TABLE production.user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES production.users(id),
  session_id VARCHAR(255),
  engagement_type VARCHAR(50) NOT NULL CHECK (engagement_type IN ('evaluation_request', 'leaderboard_view', 'comparison_analysis', 'report_download', 'dashboard_interaction')),
  engagement_data JSONB NOT NULL,
  duration_seconds INTEGER,
  interaction_depth INTEGER,
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
  conversion_event BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 7: CREATE ANALYTICS & PREDICTIVE TABLES
-- =====================================================

-- Evaluation Trends Analysis
CREATE TABLE production.evaluation_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES production.brands(id),
  trend_type VARCHAR(50) NOT NULL CHECK (trend_type IN ('score_trajectory', 'dimension_improvement', 'competitive_position', 'market_share')),
  time_period VARCHAR(20) NOT NULL CHECK (time_period IN ('7d', '30d', '90d', '1y')),
  trend_direction VARCHAR(10) NOT NULL CHECK (trend_direction IN ('up', 'down', 'stable', 'volatile')),
  trend_strength DECIMAL(5,2) NOT NULL,
  trend_data JSONB NOT NULL,
  confidence_level DECIMAL(5,2) NOT NULL,
  statistical_significance BOOLEAN DEFAULT false,
  calculated_at TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP NOT NULL
);

-- Predictive Insights
CREATE TABLE production.predictive_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES production.brands(id),
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('score_forecast', 'risk_assessment', 'opportunity_detection', 'competitive_threat')),
  prediction_horizon VARCHAR(20) NOT NULL CHECK (prediction_horizon IN ('1m', '3m', '6m', '1y')),
  predicted_value DECIMAL(8,2),
  confidence_interval JSONB,
  probability_score DECIMAL(5,2) NOT NULL,
  supporting_evidence JSONB,
  model_version VARCHAR(20) NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Competitive Analysis
CREATE TABLE production.competitive_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES production.brands(id),
  competitor_brand_id UUID REFERENCES production.brands(id),
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('head_to_head', 'gap_analysis', 'strength_comparison', 'market_positioning')),
  analysis_data JSONB NOT NULL,
  key_insights JSONB,
  competitive_advantage_score DECIMAL(5,2),
  threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  opportunity_score DECIMAL(5,2),
  analyzed_at TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP NOT NULL
);

-- Evaluation Cache for Performance
CREATE TABLE production.evaluation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  cache_type VARCHAR(50) NOT NULL CHECK (cache_type IN ('evaluation_result', 'dimension_score', 'benchmark_data', 'competitor_analysis')),
  brand_id UUID REFERENCES production.brands(id),
  evaluation_id UUID REFERENCES production.evaluations(id),
  cached_data JSONB NOT NULL,
  cache_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT NOW(),
  cache_hit_rate DECIMAL(5,2) DEFAULT 0.0
);

-- =====================================================
-- STEP 8: CREATE SUBSCRIPTION TABLES
-- =====================================================

-- Subscriptions
CREATE TABLE production.subscriptions (
	id SERIAL PRIMARY KEY,
	user_id UUID REFERENCES production.users(id),
	stripe_customer_id VARCHAR(255) UNIQUE,
	stripe_subscription_id VARCHAR(255) UNIQUE,
	tier VARCHAR(50) DEFAULT 'free' CHECK (tier IN ('free', 'professional', 'enterprise')),
	status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
	current_period_start TIMESTAMP,
	current_period_end TIMESTAMP,
	cancel_at_period_end BOOLEAN DEFAULT false,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 9: CREATE PERFORMANCE INDEXES
-- =====================================================

-- Core table indexes
CREATE INDEX idx_brands_user_id ON production.brands(user_id);
CREATE INDEX idx_brands_website_url ON production.brands(website_url);
CREATE INDEX idx_brands_normalized_host ON production.brands(normalized_host);
CREATE INDEX idx_evaluations_brand_id ON production.evaluations(brand_id);
CREATE INDEX idx_evaluations_status ON production.evaluations(status);
CREATE INDEX idx_evaluations_created_at ON production.evaluations(created_at);
CREATE INDEX idx_dimension_scores_evaluation_id ON production.dimension_scores(evaluation_id);
CREATE INDEX idx_website_snapshots_evaluation_id ON production.website_snapshots(evaluation_id);
CREATE INDEX idx_crawl_site_signals_evaluation_id ON production.crawl_site_signals(evaluation_id);
CREATE INDEX idx_evaluation_features_flat_evaluation_id ON production.evaluation_features_flat(evaluation_id);

-- Federated Learning Indexes
CREATE INDEX idx_federated_learning_user ON production.federated_learning_sessions(user_id);
CREATE INDEX idx_federated_learning_type ON production.federated_learning_sessions(session_type);
CREATE INDEX idx_federated_learning_created ON production.federated_learning_sessions(created_at);

-- Analytics Indexes
CREATE INDEX idx_evaluation_trends_brand ON production.evaluation_trends(brand_id);
CREATE INDEX idx_predictive_insights_brand ON production.predictive_insights(brand_id);
CREATE INDEX idx_competitive_analysis_brand ON production.competitive_analysis(brand_id);
CREATE INDEX idx_evaluation_cache_key ON production.evaluation_cache(cache_key);
CREATE INDEX idx_evaluation_cache_expires ON production.evaluation_cache(expires_at);

-- =====================================================
-- STEP 10: VERIFICATION
-- =====================================================

-- Set permissions
GRANT USAGE ON SCHEMA production TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA production TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA production TO PUBLIC;

-- Verification queries
SELECT 'Comprehensive Production Schema Created Successfully' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'production';
SELECT table_name FROM information_schema.tables WHERE table_schema = 'production' ORDER BY table_name;