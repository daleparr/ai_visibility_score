-- Comprehensive Evaluation System Enhancement
-- Adds federated learning, advanced crawling, caching, and analytics capabilities

-- Federated Learning Data Collection
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

-- Enhanced Website Crawling and Content Storage
CREATE TABLE IF NOT EXISTS website_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  evaluation_id UUID REFERENCES evaluations(id),
  url VARCHAR(500) NOT NULL,
  page_type VARCHAR(50) NOT NULL CHECK (page_type IN ('homepage', 'product', 'about', 'contact', 'blog', 'search_results')),
  content_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for change detection
  raw_html TEXT,
  structured_content JSONB, -- Extracted structured data
  metadata JSONB, -- Page metadata, load times, etc.
  screenshot_url VARCHAR(500),
  crawl_timestamp TIMESTAMP DEFAULT NOW(),
  content_size_bytes INTEGER,
  load_time_ms INTEGER,
  status_code INTEGER DEFAULT 200,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_snapshot_id UUID REFERENCES website_snapshots(id),
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('content_update', 'structure_change', 'new_feature', 'removal', 'performance_change')),
  change_description TEXT,
  impact_score INTEGER, -- 1-10 scale of change significance
  detected_at TIMESTAMP DEFAULT NOW(),
  previous_snapshot_id UUID REFERENCES website_snapshots(id)
);

-- Advanced Caching Strategy
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

CREATE TABLE IF NOT EXISTS cache_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_type VARCHAR(50) NOT NULL,
  date_bucket DATE NOT NULL, -- Daily aggregation
  total_requests INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,
  hit_rate DECIMAL(5,2) DEFAULT 0.0,
  average_response_time_ms INTEGER DEFAULT 0,
  data_freshness_score DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Advanced Analytics and Trend Analysis
CREATE TABLE IF NOT EXISTS evaluation_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  trend_type VARCHAR(50) NOT NULL CHECK (trend_type IN ('score_trajectory', 'dimension_improvement', 'competitive_position', 'market_share')),
  time_period VARCHAR(20) NOT NULL CHECK (time_period IN ('7d', '30d', '90d', '1y')),
  trend_direction VARCHAR(10) NOT NULL CHECK (trend_direction IN ('up', 'down', 'stable', 'volatile')),
  trend_strength DECIMAL(5,2) NOT NULL, -- -100 to +100
  trend_data JSONB NOT NULL, -- Time series data points
  confidence_level DECIMAL(5,2) NOT NULL, -- 0-100%
  statistical_significance BOOLEAN DEFAULT false,
  calculated_at TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS predictive_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('score_forecast', 'risk_assessment', 'opportunity_detection', 'competitive_threat')),
  prediction_horizon VARCHAR(20) NOT NULL CHECK (prediction_horizon IN ('1m', '3m', '6m', '1y')),
  predicted_value DECIMAL(8,2),
  confidence_interval JSONB, -- {lower: number, upper: number}
  probability_score DECIMAL(5,2) NOT NULL, -- 0-100%
  supporting_evidence JSONB,
  model_version VARCHAR(20) NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Enhanced Competitive Intelligence
CREATE TABLE IF NOT EXISTS competitive_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  competitor_brand_id UUID REFERENCES brands(id),
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('head_to_head', 'gap_analysis', 'strength_comparison', 'market_positioning')),
  analysis_data JSONB NOT NULL,
  key_insights JSONB, -- Array of insight objects
  competitive_advantage_score DECIMAL(5,2), -- -100 to +100
  threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  opportunity_score DECIMAL(5,2), -- 0-100
  analyzed_at TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP NOT NULL
);

-- User Behavior and Engagement Analytics
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  engagement_type VARCHAR(50) NOT NULL CHECK (engagement_type IN ('evaluation_request', 'leaderboard_view', 'comparison_analysis', 'report_download', 'dashboard_interaction')),
  engagement_data JSONB NOT NULL,
  duration_seconds INTEGER,
  interaction_depth INTEGER, -- Number of sub-actions
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
  conversion_event BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance Optimization Tables
CREATE TABLE IF NOT EXISTS system_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('evaluation_time', 'api_response', 'database_query', 'agent_execution', 'cache_performance')),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- ms, seconds, percentage, etc.
  context_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_federated_learning_user ON federated_learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_federated_learning_type ON federated_learning_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_federated_learning_created ON federated_learning_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_website_snapshots_brand ON website_snapshots(brand_id);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_evaluation ON website_snapshots(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_hash ON website_snapshots(content_hash);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_timestamp ON website_snapshots(crawl_timestamp);

CREATE INDEX IF NOT EXISTS idx_evaluation_cache_key ON evaluation_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_evaluation_cache_type ON evaluation_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_evaluation_cache_expires ON evaluation_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_evaluation_cache_brand ON evaluation_cache(brand_id);

CREATE INDEX IF NOT EXISTS idx_evaluation_trends_brand ON evaluation_trends(brand_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_trends_type ON evaluation_trends(trend_type);
CREATE INDEX IF NOT EXISTS idx_evaluation_trends_period ON evaluation_trends(time_period);

CREATE INDEX IF NOT EXISTS idx_competitive_analysis_brand ON competitive_analysis(brand_id);
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_competitor ON competitive_analysis(competitor_brand_id);
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_type ON competitive_analysis(analysis_type);

CREATE INDEX IF NOT EXISTS idx_user_engagement_user ON user_engagement_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_type ON user_engagement_metrics(engagement_type);
CREATE INDEX IF NOT EXISTS idx_user_engagement_created ON user_engagement_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_system_performance_type ON system_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_performance_name ON system_performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_performance_recorded ON system_performance_metrics(recorded_at);

-- Views for Common Queries
CREATE OR REPLACE VIEW leaderboard_with_trends AS
SELECT 
  lc.*,
  et.trend_direction,
  et.trend_strength,
  ca.competitive_advantage_score
FROM leaderboard_cache lc
LEFT JOIN evaluation_trends et ON lc.evaluation_id = et.brand_id AND et.trend_type = 'score_trajectory' AND et.time_period = '30d'
LEFT JOIN competitive_analysis ca ON lc.evaluation_id = ca.brand_id AND ca.analysis_type = 'market_positioning'
WHERE lc.is_public = true;

CREATE OR REPLACE VIEW brand_performance_summary AS
SELECT 
  b.id as brand_id,
  b.name as brand_name,
  b.website_url,
  e.adi_score,
  e.grade,
  e.industry_percentile,
  et.trend_direction,
  et.trend_strength,
  pi.predicted_value as score_forecast_3m,
  pi.confidence_interval as forecast_confidence
FROM brands b
LEFT JOIN evaluations e ON b.id = e.brand_id
LEFT JOIN evaluation_trends et ON b.id = et.brand_id AND et.trend_type = 'score_trajectory' AND et.time_period = '30d'
LEFT JOIN predictive_insights pi ON b.id = pi.brand_id AND pi.insight_type = 'score_forecast' AND pi.prediction_horizon = '3m'
WHERE e.status = 'completed'
ORDER BY e.adi_score DESC;

-- Triggers for Data Consistency
CREATE OR REPLACE FUNCTION update_cache_access_stats()
RETURNS TRIGGER AS $$
BEGIN
  NEW.access_count = OLD.access_count + 1;
  NEW.last_accessed = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cache_access_update
  BEFORE UPDATE ON evaluation_cache
  FOR EACH ROW
  WHEN (OLD.cached_data IS DISTINCT FROM NEW.cached_data)
  EXECUTE FUNCTION update_cache_access_stats();

-- Comments for Documentation
COMMENT ON TABLE federated_learning_sessions IS 'Collects anonymized user interaction data for model improvement';
COMMENT ON TABLE website_snapshots IS 'Stores website content snapshots for change detection and analysis';
COMMENT ON TABLE evaluation_cache IS 'High-performance caching layer for evaluation results and computations';
COMMENT ON TABLE evaluation_trends IS 'Time-series analysis of brand performance trends';
COMMENT ON TABLE predictive_insights IS 'AI-generated predictions and forecasts for brand performance';
COMMENT ON TABLE competitive_analysis IS 'Detailed competitive intelligence and positioning analysis';
COMMENT ON TABLE user_engagement_metrics IS 'User behavior analytics for platform optimization';
COMMENT ON TABLE system_performance_metrics IS 'System performance monitoring and optimization data';