-- =====================================================
-- COMPLETE FRESH NEON DATABASE SCHEMA
-- AI Discoverability Index with Leaderboard System
-- Run this entire script in Neon SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE ALL ENUMS
-- =====================================================

-- Core evaluation enums
CREATE TYPE adi_industry_category AS ENUM('apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics', 'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors', 'luxury', 'mass_market', 'b2b', 'services');
CREATE TYPE adi_subscription_tier AS ENUM('free', 'professional', 'enterprise');
CREATE TYPE agent_status AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE evaluation_status AS ENUM('pending', 'running', 'completed', 'failed');
CREATE TYPE grade_type AS ENUM('A', 'B', 'C', 'D', 'F');
CREATE TYPE recommendation_priority AS ENUM('1', '2', '3');

-- Leaderboard system enums
CREATE TYPE evaluation_queue_status AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE trigger_type AS ENUM('user_added', 'auto_detected', 'leaderboard_gap');
CREATE TYPE selection_type AS ENUM('market_leader', 'emerging', 'geographic_mix', 'price_coverage');
CREATE TYPE competitive_evaluation_status AS ENUM('pending', 'queued', 'completed', 'failed');

-- =====================================================
-- STEP 2: CREATE CORE USER & AUTH TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
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
CREATE TABLE accounts (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE sessions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	session_token VARCHAR(255) NOT NULL UNIQUE,
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
	id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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

-- Brands table
CREATE TABLE brands (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name VARCHAR(255) NOT NULL,
	website_url VARCHAR(500) NOT NULL,
	industry VARCHAR(100),
	description TEXT,
	competitors JSONB,
	adi_industry_id UUID,
	adi_enabled BOOLEAN DEFAULT false,
	annual_revenue_range VARCHAR(50),
	employee_count_range VARCHAR(50),
	primary_market_regions JSONB,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE evaluations (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
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
	global_rank INTEGER,
	methodology_version VARCHAR(20) DEFAULT 'ADI-v1.0',
	started_at TIMESTAMP DEFAULT NOW(),
	completed_at TIMESTAMP,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Dimension scores
CREATE TABLE dimension_scores (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
	dimension_name VARCHAR(100) NOT NULL,
	score INTEGER NOT NULL,
	explanation TEXT,
	recommendations JSONB,
	created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 4: CREATE LEADERBOARD SYSTEM TABLES
-- =====================================================

-- Evaluation Queue Management
CREATE TABLE evaluation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  niche_category VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 5,
  status evaluation_queue_status DEFAULT 'pending',
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
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_category VARCHAR(100) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  evaluation_id UUID REFERENCES evaluations(id),
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
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Competitive Triggers for Auto-Evaluation
CREATE TABLE competitive_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  brand_id UUID REFERENCES brands(id),
  competitor_url VARCHAR(500) NOT NULL,
  competitor_name VARCHAR(255),
  trigger_type trigger_type NOT NULL,
  evaluation_status competitive_evaluation_status DEFAULT 'pending',
  evaluation_id UUID REFERENCES evaluations(id),
  triggered_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Niche Brand Selection for Systematic Population
CREATE TABLE niche_brand_selection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_category VARCHAR(100) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  selection_type selection_type NOT NULL,
  priority INTEGER DEFAULT 5,
  evaluation_status VARCHAR(50) DEFAULT 'pending',
  evaluation_id UUID REFERENCES evaluations(id),
  added_at TIMESTAMP DEFAULT NOW(),
  last_evaluated TIMESTAMP
);

-- Leaderboard Statistics for Analytics
CREATE TABLE leaderboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_category VARCHAR(100) NOT NULL,
  total_brands INTEGER NOT NULL,
  evaluated_brands INTEGER NOT NULL,
  average_score DECIMAL(5,2) NOT NULL,
  median_score DECIMAL(5,2) NOT NULL,
  top_performer VARCHAR(255),
  top_score INTEGER,
  last_updated TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 5: CREATE CRAWL DATA TABLES
-- =====================================================

-- Website Snapshots for Crawl Data
CREATE TABLE website_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  evaluation_id UUID REFERENCES evaluations(id),
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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Changes Detection
CREATE TABLE content_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_snapshot_id UUID REFERENCES website_snapshots(id),
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('content_update', 'structure_change', 'new_feature', 'removal', 'performance_change')),
  change_description TEXT,
  impact_score INTEGER,
  detected_at TIMESTAMP DEFAULT NOW(),
  previous_snapshot_id UUID REFERENCES website_snapshots(id)
);

-- =====================================================
-- STEP 6: CREATE FEDERATED LEARNING TABLES
-- =====================================================

-- Federated Learning Sessions
CREATE TABLE federated_learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('evaluation_feedback', 'ui_interaction', 'search_behavior', 'comparison_analysis')),
  interaction_data JSONB NOT NULL,
  model_version VARCHAR(20) DEFAULT 'v1.0',
  privacy_level VARCHAR(20) DEFAULT 'anonymized' CHECK (privacy_level IN ('anonymized', 'pseudonymized', 'aggregated')),
  contribution_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Model Improvements Tracking
CREATE TABLE model_improvements (
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
CREATE TABLE user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
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
-- STEP 7: CREATE ANALYTICS & PERFORMANCE TABLES
-- =====================================================

-- Evaluation Cache for Performance
CREATE TABLE evaluation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  cache_type VARCHAR(50) NOT NULL CHECK (cache_type IN ('evaluation_result', 'dimension_score', 'benchmark_data', 'competitor_analysis')),
  brand_id UUID REFERENCES brands(id),
  evaluation_id UUID REFERENCES evaluations(id),
  cached_data JSONB NOT NULL,
  cache_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT NOW(),
  cache_hit_rate DECIMAL(5,2) DEFAULT 0.0
);

-- Cache Performance Tracking
CREATE TABLE cache_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_type VARCHAR(50) NOT NULL,
  date_bucket DATE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,
  hit_rate DECIMAL(5,2) DEFAULT 0.0,
  average_response_time_ms INTEGER DEFAULT 0,
  data_freshness_score DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation Trends Analysis
CREATE TABLE evaluation_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
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
CREATE TABLE predictive_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
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
CREATE TABLE competitive_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  competitor_brand_id UUID REFERENCES brands(id),
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('head_to_head', 'gap_analysis', 'strength_comparison', 'market_positioning')),
  analysis_data JSONB NOT NULL,
  key_insights JSONB,
  competitive_advantage_score DECIMAL(5,2),
  threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  opportunity_score DECIMAL(5,2),
  analyzed_at TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP NOT NULL
);

-- System Performance Metrics
CREATE TABLE system_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('evaluation_time', 'api_response', 'database_query', 'agent_execution', 'cache_performance')),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  context_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 8: CREATE SUBSCRIPTION TABLES
-- =====================================================

-- Subscriptions
CREATE TABLE subscriptions (
	id SERIAL PRIMARY KEY,
	user_id UUID REFERENCES users(id),
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
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_website_url ON brands(website_url);
CREATE INDEX IF NOT EXISTS idx_evaluations_brand_id ON evaluations(brand_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_dimension_scores_evaluation_id ON dimension_scores(evaluation_id);

-- Evaluation Queue Indexes
CREATE INDEX IF NOT EXISTS idx_evaluation_queue_status ON evaluation_queue(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_queue_priority ON evaluation_queue(priority DESC, scheduled_at ASC);
CREATE INDEX IF NOT EXISTS idx_evaluation_queue_niche ON evaluation_queue(niche_category);

-- Leaderboard Cache Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_niche ON leaderboard_cache(niche_category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_rank_niche ON leaderboard_cache(niche_category, rank_niche);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_expires ON leaderboard_cache(cache_expires);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_public ON leaderboard_cache(is_public) WHERE is_public = true;

-- Competitive Triggers Indexes
CREATE INDEX IF NOT EXISTS idx_competitive_triggers_user ON competitive_triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_competitive_triggers_status ON competitive_triggers(evaluation_status);

-- Website Snapshots Indexes
CREATE INDEX IF NOT EXISTS idx_website_snapshots_brand ON website_snapshots(brand_id);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_evaluation ON website_snapshots(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_hash ON website_snapshots(content_hash);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_timestamp ON website_snapshots(crawl_timestamp);

-- Federated Learning Indexes
CREATE INDEX IF NOT EXISTS idx_federated_learning_user ON federated_learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_federated_learning_type ON federated_learning_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_federated_learning_created ON federated_learning_sessions(created_at);

-- Evaluation Cache Indexes
CREATE INDEX IF NOT EXISTS idx_evaluation_cache_key ON evaluation_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_evaluation_cache_type ON evaluation_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_evaluation_cache_expires ON evaluation_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_evaluation_cache_brand ON evaluation_cache(brand_id);

-- =====================================================
-- STEP 10: INSERT INITIAL DATA - GYMSHARK & COMPETITORS
-- =====================================================

-- Add Gymshark and key activewear competitors
INSERT INTO niche_brand_selection (niche_category, brand_name, website_url, selection_type, priority) VALUES
('Activewear & Athleisure', 'Gymshark', 'https://uk.gymshark.com/', 'market_leader', 1),
('Activewear & Athleisure', 'Nike', 'https://www.nike.com/', 'market_leader', 1),
('Activewear & Athleisure', 'Lululemon', 'https://lululemon.com/', 'market_leader', 1),
('Activewear & Athleisure', 'Under Armour', 'https://www.underarmour.com/', 'market_leader', 2),
('Activewear & Athleisure', 'Adidas', 'https://www.adidas.com/', 'market_leader', 1),
('Activewear & Athleisure', 'Alo Yoga', 'https://www.aloyoga.com/', 'emerging', 3),
('Activewear & Athleisure', 'Sweaty Betty', 'https://www.sweatybetty.com/', 'emerging', 3),
('Activewear & Athleisure', 'Outdoor Voices', 'https://outdoorvoices.com/', 'emerging', 4);

-- Add luxury fashion brands
INSERT INTO niche_brand_selection (niche_category, brand_name, website_url, selection_type, priority) VALUES
('Luxury Fashion Houses', 'Chanel', 'https://www.chanel.com/', 'market_leader', 1),
('Luxury Fashion Houses', 'Dior', 'https://www.dior.com/', 'market_leader', 1),
('Luxury Fashion Houses', 'Gucci', 'https://www.gucci.com/', 'market_leader', 1),
('Luxury Fashion Houses', 'Prada', 'https://www.prada.com/', 'market_leader', 2),
('Luxury Fashion Houses', 'Louis Vuitton', 'https://www.louisvuitton.com/', 'market_leader', 1);

-- Add streetwear brands
INSERT INTO niche_brand_selection (niche_category, brand_name, website_url, selection_type, priority) VALUES
('Streetwear', 'Supreme', 'https://www.supremenewyork.com/', 'market_leader', 1),
('Streetwear', 'Off-White', 'https://www.off---white.com/', 'market_leader', 1),
('Streetwear', 'Stone Island', 'https://www.stoneisland.com/', 'market_leader', 2),
('Streetwear', 'Palace', 'https://www.palaceskateboards.com/', 'emerging', 3),
('Streetwear', 'Kith', 'https://kith.com/', 'emerging', 3);

-- Add tech giants
INSERT INTO niche_brand_selection (niche_category, brand_name, website_url, selection_type, priority) VALUES
('Tech Giants', 'Apple', 'https://www.apple.com/', 'market_leader', 1),
('Tech Giants', 'Google', 'https://www.google.com/', 'market_leader', 1),
('Tech Giants', 'Microsoft', 'https://www.microsoft.com/', 'market_leader', 1),
('Tech Giants', 'Amazon', 'https://www.amazon.com/', 'market_leader', 1),
('Tech Giants', 'Meta', 'https://www.meta.com/', 'market_leader', 2);

-- =====================================================
-- STEP 11: VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created
SELECT 'Tables created successfully!' as status, COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- List all new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify Gymshark was added
SELECT 'Gymshark verification:' as check_type, 
       brand_name, website_url, niche_category, selection_type
FROM niche_brand_selection 
WHERE brand_name = 'Gymshark';

-- Check total brand selections by niche
SELECT niche_category, COUNT(*) as brand_count
FROM niche_brand_selection 
GROUP BY niche_category 
ORDER BY brand_count DESC;

-- Final success message
SELECT '🎉 COMPLETE FRESH SCHEMA CREATED SUCCESSFULLY! 🎉' as final_status,
       'Gymshark and competitors added to leaderboard system' as gymshark_status,
       'Ready for automated evaluations and competitive intelligence' as next_steps;