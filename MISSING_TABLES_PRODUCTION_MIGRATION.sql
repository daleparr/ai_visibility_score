-- =====================================================
-- PRODUCTION MISSING TABLES MIGRATION
-- Creates crawl artifact tables in production schema used by live app
-- =====================================================

CREATE SCHEMA IF NOT EXISTS production;
SET search_path TO production, public;

-- Ensure pgcrypto available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Website snapshots table (page-level crawl artifacts)
CREATE TABLE IF NOT EXISTS production.website_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES production.brands(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES production.evaluations(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  page_type VARCHAR(50) NOT NULL CHECK (page_type IN ('homepage','product','about','contact','blog','search_results')),
  content_hash VARCHAR(64) NOT NULL,
  raw_html TEXT,
  structured_content JSONB,
  metadata JSONB,
  screenshot_url VARCHAR(500),
  crawl_timestamp TIMESTAMP DEFAULT NOW(),
  content_size_bytes INTEGER,
  load_time_ms INTEGER,
  status_code INTEGER DEFAULT 200,
  title VARCHAR(255),
  meta_description VARCHAR(255),
  has_title BOOLEAN,
  has_meta_description BOOLEAN,
  has_structured_data BOOLEAN,
  structured_data_types_count INTEGER,
  quality_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_snapshots_eval ON production.website_snapshots(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_website_snapshots_hash ON production.website_snapshots(content_hash);

-- Content change detection
CREATE TABLE IF NOT EXISTS production.content_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_snapshot_id UUID REFERENCES production.website_snapshots(id) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('content_update','structure_change','new_feature','removal','performance_change')),
  change_description TEXT,
  impact_score INTEGER,
  detected_at TIMESTAMP DEFAULT NOW(),
  previous_snapshot_id UUID REFERENCES production.website_snapshots(id)
);

-- Site-level crawl signals (one row per evaluation)
CREATE TABLE IF NOT EXISTS production.crawl_site_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES production.brands(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  homepage_title_present BOOLEAN,
  homepage_description_present BOOLEAN,
  homepage_structured_data_present BOOLEAN,
  homepage_structured_data_types_count INTEGER,
  homepage_quality_score INTEGER,
  homepage_content_size_bytes INTEGER,
  sitemap_present BOOLEAN,
  sitemap_url VARCHAR(500),
  sitemap_url_count INTEGER,
  robots_present BOOLEAN,
  robots_url VARCHAR(500),
  robots_has_sitemap BOOLEAN,
  pages_crawled INTEGER,
  pages_discovered INTEGER,
  crawl_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawl_site_signals_eval ON production.crawl_site_signals(evaluation_id);

-- Flat feature vector (analytics-friendly)
CREATE TABLE IF NOT EXISTS production.evaluation_features_flat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES production.brands(id) ON DELETE CASCADE,
  f_homepage_quality_score INTEGER,
  f_has_structured_data BOOLEAN,
  f_structured_data_types_count INTEGER,
  f_has_robots_txt BOOLEAN,
  f_has_sitemap BOOLEAN,
  f_sitemap_url_count INTEGER,
  f_homepage_title_present BOOLEAN,
  f_homepage_description_present BOOLEAN,
  f_pages_crawled INTEGER,
  f_pages_discovered INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluation_features_flat_eval ON production.evaluation_features_flat(evaluation_id);

-- Verification
SELECT 'Missing tables migration applied' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema='production' AND table_name IN ('website_snapshots','content_changes','crawl_site_signals','evaluation_features_flat') ORDER BY table_name;