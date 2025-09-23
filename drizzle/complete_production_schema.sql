-- Final Comprehensive Production Schema for AIDI
-- Generated from src/lib/db/schema.ts, including all necessary tables for leaderboard and core functionality.

-- Create Schemas
CREATE SCHEMA IF NOT EXISTS production;
CREATE SCHEMA IF NOT EXISTS public;

-- Create Enums (Production)
DO $$ BEGIN CREATE TYPE production.evaluation_status AS ENUM('pending', 'running', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE production.grade_type AS ENUM('A', 'B', 'C', 'D', 'F'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE production.recommendation_priority AS ENUM('1', '2', '3'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE production.adi_subscription_tier AS ENUM('free', 'professional', 'enterprise'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE production.adi_industry_category AS ENUM('apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics', 'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors', 'luxury', 'mass_market', 'b2b', 'services'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE production.agent_status AS ENUM('pending', 'running', 'completed', 'failed', 'skipped'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.page_type AS ENUM('homepage', 'product', 'about', 'contact', 'blog', 'search_results', 'faq'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.change_type AS ENUM('content_update', 'structure_change', 'new_feature', 'removal', 'performance_change'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.trigger_type AS ENUM('user_added', 'auto_detected', 'leaderboard_gap'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.competitive_evaluation_status AS ENUM('pending', 'queued', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.selection_type AS ENUM('market_leader', 'emerging', 'geographic_mix', 'price_coverage'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE production.probe_name AS ENUM('schema_probe', 'policy_probe', 'kg_probe', 'semantics_probe'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE production.model_id AS ENUM('gpt4o', 'claude35', 'gemini15'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create Tables
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
  user_id uuid NOT NULL REFERENCES production.users(id) ON DELETE cascade,
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

CREATE TABLE IF NOT EXISTS production.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES production.users(id) ON DELETE cascade,
  name varchar(255) NOT NULL,
  website_url varchar(500) NOT NULL,
  normalized_host varchar(255) GENERATED ALWAYS AS (lower(regexp_replace(website_url, '^(?:https?:\/\/)?(?:www\.)?([^\/]+)(?:\/.*)?$', '\1'))) STORED,
  industry varchar(100),
  description text,
  competitors jsonb,
  adi_industry_id uuid,
  adi_enabled boolean DEFAULT false,
  annual_revenue_range varchar(50),
  employee_count_range varchar(50),
  primary_market_regions jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id, normalized_host)
);

CREATE TABLE IF NOT EXISTS production.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES production.brands(id) ON DELETE cascade,
  status production.evaluation_status DEFAULT 'pending',
  overall_score integer,
  grade production.grade_type,
  verdict text,
  strongest_dimension varchar(100),
  weakest_dimension varchar(100),
  biggest_opportunity varchar(100),
  adi_score integer,
  adi_grade production.grade_type,
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
  evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE cascade,
  dimension_name varchar(100) NOT NULL,
  score integer NOT NULL,
  explanation text,
  recommendations jsonb,
  created_at timestamp DEFAULT now(),
  UNIQUE(evaluation_id, dimension_name)
);

CREATE TABLE IF NOT EXISTS production.website_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid REFERENCES production.brands(id),
    evaluation_id uuid REFERENCES production.evaluations(id),
    url varchar(500) NOT NULL,
    page_type public.page_type NOT NULL,
    content_hash varchar(64) NOT NULL,
    raw_html text,
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
    has_structured_data boolean,
    structured_data_types_count integer,
    quality_score integer,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.adi_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE cascade,
  agent_name varchar(100) NOT NULL,
  agent_version varchar(20) DEFAULT 'v1.0',
  status production.agent_status DEFAULT 'pending',
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
  agent_id uuid NOT NULL REFERENCES production.adi_agents(id) ON DELETE cascade,
  result_type varchar(100) NOT NULL,
  raw_value integer,
  normalized_score integer,
  confidence_level integer,
  evidence jsonb,
  created_at timestamp DEFAULT now()
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

CREATE TABLE IF NOT EXISTS production.page_blobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE cascade,
  url varchar(2048) NOT NULL,
  page_type public.page_type NOT NULL,
  content_hash varchar(64) NOT NULL,
  html_gzip text,
  extracted_jsonld jsonb,
  fetched_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production.probe_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE cascade,
  probe_name production.probe_name NOT NULL,
  model production.model_id NOT NULL,
  prompt_hash varchar(64),
  output_json jsonb,
  is_valid boolean DEFAULT false,
  citations_ok boolean DEFAULT false,
  confidence integer,
  started_at timestamp,
  finished_at timestamp,
  execution_time_ms integer,
  created_at timestamp DEFAULT now()
);

GRANT USAGE ON SCHEMA production TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA production TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA production TO service_role;