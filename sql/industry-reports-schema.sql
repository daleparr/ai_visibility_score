-- Monthly Industry Report Series Schema
-- This schema supports LLM-powered brand visibility reports across industry verticals

-- Industry sectors/verticals
CREATE TABLE IF NOT EXISTS industry_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  target_audience TEXT, -- 'Brand Managers', 'CMOs', 'Agency Leads', etc.
  market_size_notes TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prompt templates for each sector (20-30 per sector)
CREATE TABLE IF NOT EXISTS sector_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES industry_sectors(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('head', 'mid-tail', 'long-tail')),
  intent_category TEXT NOT NULL, -- 'recommendation', 'comparison', 'research', 'troubleshooting'
  geographic_scope TEXT, -- 'global', 'us', 'eu', etc.
  temporal_context TEXT, -- '2025', 'current', 'next-gen', etc.
  expected_brand_count INTEGER, -- How many brands we expect to see
  bias_controls JSONB DEFAULT '{}', -- Additional bias control metadata
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LLM probe execution results (raw data)
CREATE TABLE IF NOT EXISTS probe_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES industry_sectors(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES sector_prompts(id) ON DELETE SET NULL,
  model_id TEXT NOT NULL, -- 'gpt-4-turbo', 'claude-3-5-sonnet', etc.
  model_version TEXT,
  run_date TIMESTAMPTZ NOT NULL,
  run_number INTEGER DEFAULT 1, -- 1, 2, or 3 for averaging
  
  -- Raw response data
  response_text TEXT,
  response_tokens INTEGER,
  response_latency_ms INTEGER,
  
  -- Extracted structured data
  brands_mentioned JSONB DEFAULT '[]', -- [{brand, position, context_snippet, confidence}]
  brand_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(brands_mentioned)) STORED,
  sentiment_analysis JSONB DEFAULT '{}', -- {brand_name: {score, context, reasoning}}
  sources_cited JSONB DEFAULT '[]', -- [{source, url, mentioned_for_brand}]
  hallucination_flags JSONB DEFAULT '[]', -- Detected inaccuracies
  
  -- Quality metrics
  response_quality_score DECIMAL(3,2), -- 0-1 score
  brand_extraction_confidence DECIMAL(3,2),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aggregated brand performance per sector-month
CREATE TABLE IF NOT EXISTS brand_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES industry_sectors(id) ON DELETE CASCADE,
  report_month DATE NOT NULL,
  brand_name TEXT NOT NULL,
  brand_domain TEXT, -- Normalized domain for linking
  
  -- Core metrics
  mention_count INTEGER DEFAULT 0,
  mention_share DECIMAL(5,2), -- % of total mentions in sector
  avg_position DECIMAL(4,2), -- Average position when mentioned (1-10)
  top_3_appearances INTEGER DEFAULT 0, -- How many times in top 3
  recommendation_rate DECIMAL(5,2), -- % of recommendation prompts where mentioned
  
  -- Model coverage
  models_mentioned_in INTEGER DEFAULT 0, -- Count of unique models
  model_breakdown JSONB DEFAULT '{}', -- {model: mention_count}
  
  -- Sentiment
  avg_sentiment_score DECIMAL(3,2), -- -1 to 1
  sentiment_distribution JSONB DEFAULT '{}', -- {positive: count, neutral: count, negative: count}
  
  -- Competitive context
  rank_overall INTEGER,
  rank_change INTEGER, -- vs. previous month
  co_mentioned_brands JSONB DEFAULT '[]', -- Brands frequently mentioned together
  
  -- Quality & accuracy
  hallucination_rate DECIMAL(5,2), -- % of mentions with detected inaccuracies
  source_citation_rate DECIMAL(5,2), -- % of mentions with proper sources
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(sector_id, report_month, brand_name)
);

-- Monthly published reports
CREATE TABLE IF NOT EXISTS industry_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES industry_sectors(id) ON DELETE CASCADE,
  report_month DATE NOT NULL,
  report_title TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  
  -- Executive summary content
  executive_summary TEXT,
  key_findings JSONB DEFAULT '[]', -- Array of finding objects
  methodology_notes TEXT,
  
  -- Leaderboard data
  leaderboard JSONB DEFAULT '[]', -- Top 50 brands with full metrics
  top_movers JSONB DEFAULT '[]', -- Biggest rank changes
  new_entrants JSONB DEFAULT '[]', -- First-time appearances in top 20
  
  -- Analysis sections
  trends_analysis JSONB DEFAULT '{}', -- Month-over-month trends
  competitive_landscape JSONB DEFAULT '{}', -- Market structure insights
  emerging_threats JSONB DEFAULT '[]', -- New competitors to watch
  model_insights JSONB DEFAULT '{}', -- Per-model analysis
  
  -- Recommendations
  recommendations JSONB DEFAULT '[]', -- Actionable advice by brand tier
  
  -- Assets
  pdf_url TEXT,
  dashboard_url TEXT,
  sample_preview_url TEXT,
  
  -- Publishing
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES users(id),
  editorial_notes TEXT,
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(sector_id, report_month)
);

-- Report subscriptions (gating)
CREATE TABLE IF NOT EXISTS report_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES industry_sectors(id) ON DELETE CASCADE,
  
  -- Subscription details
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  
  -- Access control
  can_view_full_reports BOOLEAN DEFAULT false,
  can_download_pdfs BOOLEAN DEFAULT false,
  can_access_archive BOOLEAN DEFAULT false,
  archive_months_limit INTEGER, -- How many months back can access
  can_request_custom_prompts BOOLEAN DEFAULT false,
  api_access_enabled BOOLEAN DEFAULT false,
  
  -- Billing
  price_monthly DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  billing_interval TEXT DEFAULT 'monthly',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, sector_id)
);

-- Report access logs (for analytics)
CREATE TABLE IF NOT EXISTS report_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  report_id UUID REFERENCES industry_reports(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL, -- 'view', 'download', 'share'
  access_method TEXT, -- 'web', 'email', 'api'
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Probe execution schedules and status
CREATE TABLE IF NOT EXISTS probe_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES industry_sectors(id) ON DELETE CASCADE,
  schedule_type TEXT DEFAULT 'monthly', -- 'monthly', 'weekly', 'manual'
  schedule_config JSONB DEFAULT '{}', -- Cron-like config
  
  -- Execution tracking
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT, -- 'success', 'partial', 'failed'
  last_run_summary JSONB DEFAULT '{}',
  next_scheduled_run TIMESTAMPTZ,
  
  -- Controls
  enabled BOOLEAN DEFAULT true,
  retry_on_failure BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(sector_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_probe_results_sector_date ON probe_results(sector_id, run_date DESC);
CREATE INDEX IF NOT EXISTS idx_probe_results_model ON probe_results(model_id, run_date DESC);
CREATE INDEX IF NOT EXISTS idx_probe_results_prompt ON probe_results(prompt_id);
CREATE INDEX IF NOT EXISTS idx_brand_performance_sector_month ON brand_performance(sector_id, report_month DESC);
CREATE INDEX IF NOT EXISTS idx_brand_performance_brand ON brand_performance(brand_name, report_month DESC);
CREATE INDEX IF NOT EXISTS idx_brand_performance_rank ON brand_performance(sector_id, report_month, rank_overall);
CREATE INDEX IF NOT EXISTS idx_industry_reports_sector_status ON industry_reports(sector_id, status, report_month DESC);
CREATE INDEX IF NOT EXISTS idx_report_subscriptions_user_active ON report_subscriptions(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_report_access_logs_report ON report_access_logs(report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sector_prompts_sector_active ON sector_prompts(sector_id) WHERE active = true;

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_probe_results_brands_gin ON probe_results USING GIN (brands_mentioned);
CREATE INDEX IF NOT EXISTS idx_brand_performance_metadata_gin ON brand_performance USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_industry_reports_leaderboard_gin ON industry_reports USING GIN (leaderboard);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_industry_sectors_updated_at BEFORE UPDATE ON industry_sectors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sector_prompts_updated_at BEFORE UPDATE ON sector_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_performance_updated_at BEFORE UPDATE ON brand_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industry_reports_updated_at BEFORE UPDATE ON industry_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_subscriptions_updated_at BEFORE UPDATE ON report_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_probe_schedules_updated_at BEFORE UPDATE ON probe_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial sectors
INSERT INTO industry_sectors (slug, name, description, target_audience, active) VALUES
('igaming', 'iGaming & Online Gambling', 'Online casinos, sports betting, poker, and gaming platforms', 'Casino Operators, Platform Managers', true),
('fashion', 'Fashion & Apparel', 'Clothing brands, footwear, accessories, and fashion retail', 'Brand Managers, CMOs, Retail Executives', true),
('politics', 'Politics & Advocacy', 'Political campaigns, advocacy groups, think tanks, and policy organizations', 'Campaign Managers, Communications Directors', true),
('cpg', 'CPG & FMCG', 'Consumer packaged goods, food & beverage, household products', 'Brand Managers, Marketing VPs', true),
('dtc', 'DTC Retail', 'Direct-to-consumer brands and e-commerce', 'Founders, Growth Leads, CMOs', true),
('fintech', 'Banking & Fintech', 'Digital banks, payment platforms, lending, investing apps', 'Product Managers, Marketing Heads', true),
('wellness', 'Health & Wellness', 'Fitness, nutrition, mental health, supplements, wellness apps', 'Brand Managers, Growth Marketers', true),
('automotive', 'Mobility & Automotive', 'Auto brands, EV manufacturers, ride-sharing, micro-mobility', 'Marketing Directors, Brand Strategists', true),
('tech', 'Consumer Electronics', 'Smartphones, laptops, wearables, smart home devices', 'Product Marketing, Brand Managers', true),
('travel', 'Hospitality & Travel', 'Hotels, airlines, booking platforms, travel experiences', 'Marketing Executives, Revenue Managers', true)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE industry_sectors IS 'Industry verticals/sectors for monthly AI visibility reports';
COMMENT ON TABLE sector_prompts IS 'Unbiased prompt templates for probing LLMs about each sector';
COMMENT ON TABLE probe_results IS 'Raw results from LLM probes - stores responses and extracted data';
COMMENT ON TABLE brand_performance IS 'Aggregated monthly brand metrics for each sector';
COMMENT ON TABLE industry_reports IS 'Published monthly reports with analysis and insights';
COMMENT ON TABLE report_subscriptions IS 'User subscriptions to sector reports with tiered access';
COMMENT ON TABLE report_access_logs IS 'Analytics on who is viewing/downloading reports';
COMMENT ON TABLE probe_schedules IS 'Automated scheduling for monthly probe runs';

