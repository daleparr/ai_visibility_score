-- Leaderboard Data System Migration
-- Adds evaluation queue, leaderboard cache, and competitive triggers

-- Evaluation Queue Management
CREATE TABLE IF NOT EXISTS evaluation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  niche_category VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
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
  pillar_scores JSONB NOT NULL, -- {infrastructure: 85, perception: 90, commerce: 78}
  dimension_scores JSONB NOT NULL, -- Array of dimension scores
  strength_highlight JSONB NOT NULL, -- {dimension: string, score: number, description: string}
  gap_highlight JSONB NOT NULL, -- {dimension: string, score: number, description: string}
  rank_global INTEGER,
  rank_sector INTEGER,
  rank_industry INTEGER,
  rank_niche INTEGER,
  trend_data JSONB, -- {direction: 'up'|'down'|'stable', change: number, period: string}
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
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('user_added', 'auto_detected', 'leaderboard_gap')),
  evaluation_status VARCHAR(50) DEFAULT 'pending' CHECK (evaluation_status IN ('pending', 'queued', 'completed', 'failed')),
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
  selection_type VARCHAR(50) NOT NULL CHECK (selection_type IN ('market_leader', 'emerging', 'geographic_mix', 'price_coverage')),
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

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_evaluation_queue_status ON evaluation_queue(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_queue_priority ON evaluation_queue(priority DESC, scheduled_at ASC);
CREATE INDEX IF NOT EXISTS idx_evaluation_queue_niche ON evaluation_queue(niche_category);

CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_niche ON leaderboard_cache(niche_category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_rank_niche ON leaderboard_cache(niche_category, rank_niche);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_expires ON leaderboard_cache(cache_expires);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_public ON leaderboard_cache(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_competitive_triggers_user ON competitive_triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_competitive_triggers_status ON competitive_triggers(evaluation_status);

CREATE INDEX IF NOT EXISTS idx_niche_brand_selection_niche ON niche_brand_selection(niche_category);
CREATE INDEX IF NOT EXISTS idx_niche_brand_selection_status ON niche_brand_selection(evaluation_status);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_evaluation_queue_updated_at BEFORE UPDATE ON evaluation_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboard_cache_updated_at BEFORE UPDATE ON leaderboard_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();