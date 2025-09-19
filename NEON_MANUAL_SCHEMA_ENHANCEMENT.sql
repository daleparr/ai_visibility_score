-- MANUAL NEON DATABASE SCHEMA ENHANCEMENT
-- Copy and paste this into Neon SQL Editor
-- Run each section separately for better error handling

-- =====================================================
-- SECTION 1: CREATE ENUMS (Run this first)
-- =====================================================

-- Evaluation Queue Status
DO $$ BEGIN
    CREATE TYPE evaluation_queue_status AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Trigger Types
DO $$ BEGIN
    CREATE TYPE trigger_type AS ENUM('user_added', 'auto_detected', 'leaderboard_gap');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Selection Types
DO $$ BEGIN
    CREATE TYPE selection_type AS ENUM('market_leader', 'emerging', 'geographic_mix', 'price_coverage');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Competitive Evaluation Status
DO $$ BEGIN
    CREATE TYPE competitive_evaluation_status AS ENUM('pending', 'queued', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- SECTION 2: CORE LEADERBOARD TABLES (Run this second)
-- =====================================================

-- Evaluation Queue Management
CREATE TABLE IF NOT EXISTS evaluation_queue (
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
CREATE TABLE IF NOT EXISTS leaderboard_cache (
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
CREATE TABLE IF NOT EXISTS competitive_triggers (
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
CREATE TABLE IF NOT EXISTS niche_brand_selection (
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
CREATE TABLE IF NOT EXISTS leaderboard_stats (
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
-- SECTION 3: ADVANCED ANALYTICS TABLES (Run this third)
-- =====================================================

-- Website Snapshots for Crawl Data
CREATE TABLE IF NOT EXISTS website_snapshots (
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
CREATE TABLE IF NOT EXISTS content_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_snapshot_id UUID REFERENCES website_snapshots(id),
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('content_update', 'structure_change', 'new_feature', 'removal', 'performance_change')),
  change_description TEXT,
  impact_score INTEGER,
  detected_at TIMESTAMP DEFAULT NOW(),
  previous_snapshot_id UUID REFERENCES website_snapshots(id)
);

-- Evaluation Cache for Performance
CREATE TABLE IF NOT EXISTS evaluation_cache (
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

-- =====================================================
-- SECTION 4: FEDERATED LEARNING TABLES (Run this fourth)
-- =====================================================

-- Federated Learning Sessions
CREATE TABLE IF NOT EXISTS federated_learning_sessions (
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
CREATE TABLE IF NOT EXISTS model_improvements (
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
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
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
-- SECTION 5: ANALYTICS & TRENDS (Run this fifth)
-- =====================================================

-- Evaluation Trends Analysis
CREATE TABLE IF NOT EXISTS evaluation_trends (
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
CREATE TABLE IF NOT EXISTS predictive_insights (
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
CREATE TABLE IF NOT EXISTS competitive_analysis (
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

-- =====================================================
-- SECTION 6: PERFORMANCE MONITORING (Run this sixth)
-- =====================================================

-- Cache Performance Tracking
CREATE TABLE IF NOT EXISTS cache_performance (
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

-- System Performance Metrics
CREATE TABLE IF NOT EXISTS system_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('evaluation_time', 'api_response', 'database_query', 'agent_execution', 'cache_performance')),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  context_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 7: INDEXES FOR PERFORMANCE (Run this seventh)
-- =====================================================

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

-- Trends and Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_evaluation_trends_brand ON evaluation_trends(brand_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_trends_type ON evaluation_trends(trend_type);
CREATE INDEX IF NOT EXISTS idx_evaluation_trends_period ON evaluation_trends(time_period);

-- Competitive Analysis Indexes
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_brand ON competitive_analysis(brand_id);
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_competitor ON competitive_analysis(competitor_brand_id);
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_type ON competitive_analysis(analysis_type);

-- User Engagement Indexes
CREATE INDEX IF NOT EXISTS idx_user_engagement_user ON user_engagement_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_type ON user_engagement_metrics(engagement_type);
CREATE INDEX IF NOT EXISTS idx_user_engagement_created ON user_engagement_metrics(created_at);

-- System Performance Indexes
CREATE INDEX IF NOT EXISTS idx_system_performance_type ON system_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_performance_name ON system_performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_performance_recorded ON system_performance_metrics(recorded_at);

-- =====================================================
-- SECTION 8: INITIAL DATA - GYMSHARK (Run this eighth)
-- =====================================================

-- Add Gymshark to niche brand selection
INSERT INTO niche_brand_selection (
  niche_category, 
  brand_name, 
  website_url, 
  selection_type, 
  priority
) VALUES (
  'Activewear & Athleisure', 
  'Gymshark', 
  'https://uk.gymshark.com/', 
  'market_leader', 
  1
) ON CONFLICT DO NOTHING;

-- Add other key activewear brands
INSERT INTO niche_brand_selection (niche_category, brand_name, website_url, selection_type, priority) VALUES
('Activewear & Athleisure', 'Nike', 'https://www.nike.com/', 'market_leader', 1),
('Activewear & Athleisure', 'Lululemon', 'https://lululemon.com/', 'market_leader', 1),
('Activewear & Athleisure', 'Under Armour', 'https://www.underarmour.com/', 'market_leader', 2),
('Activewear & Athleisure', 'Adidas', 'https://www.adidas.com/', 'market_leader', 1),
('Activewear & Athleisure', 'Alo Yoga', 'https://www.aloyoga.com/', 'emerging', 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SECTION 9: VERIFICATION QUERIES (Run this last)
-- =====================================================

-- Verify all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'evaluation_queue',
  'leaderboard_cache',
  'competitive_triggers',
  'niche_brand_selection',
  'leaderboard_stats',
  'website_snapshots',
  'content_changes',
  'evaluation_cache',
  'federated_learning_sessions',
  'model_improvements',
  'user_engagement_metrics',
  'evaluation_trends',
  'predictive_insights',
  'competitive_analysis',
  'cache_performance',
  'system_performance_metrics'
)
ORDER BY table_name;

-- Verify Gymshark was added
SELECT * FROM niche_brand_selection WHERE brand_name = 'Gymshark';

-- Check total brand selections
SELECT niche_category, COUNT(*) as brand_count
FROM niche_brand_selection 
GROUP BY niche_category 
ORDER BY brand_count DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- If you see this message, the schema enhancement is complete!
SELECT 'Schema enhancement completed successfully! 🎉' as status;