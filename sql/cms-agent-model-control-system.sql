-- =============================================================================
-- Agent & Model Control System for CMS
-- Real-time cost control, model selection, performance monitoring
-- =============================================================================

-- =============================================================================
-- 1. AI MODEL CONFIGURATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_model_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Model identification
  model_key VARCHAR(100) UNIQUE NOT NULL, -- 'gpt-4-turbo', 'claude-3-5-sonnet', 'gemini-1.5-pro'
  model_name VARCHAR(255) NOT NULL, -- 'GPT-4 Turbo'
  model_provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'google', 'perplexity', 'mistral'
  model_version VARCHAR(100), -- Specific version identifier
  
  -- Availability & Status
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true, -- Provider availability (can disable if API down)
  available_for_tiers VARCHAR(100)[] DEFAULT ARRAY['index-pro', 'enterprise'], -- Which tiers can use
  
  -- Cost Information
  cost_per_1k_input_tokens DECIMAL(10,6), -- $0.030000
  cost_per_1k_output_tokens DECIMAL(10,6), -- $0.060000
  estimated_cost_per_evaluation DECIMAL(10,4), -- Average cost per AIDI eval
  
  -- Model Parameters
  max_tokens INTEGER DEFAULT 4096,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  top_p DECIMAL(3,2) DEFAULT 1.0,
  
  -- Performance Metrics (updated from usage)
  avg_response_time_ms INTEGER, -- Average response time
  avg_tokens_per_request INTEGER,
  success_rate DECIMAL(5,2), -- 99.50% success rate
  
  -- Metadata
  description TEXT,
  capabilities JSONB, -- {"supports_vision": true, "max_context": 128000}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. AGENT CONFIGURATIONS (11 AIDI Agents)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent identification
  agent_key VARCHAR(100) UNIQUE NOT NULL, -- 'crawl_agent', 'schema_agent', 'llm_test_agent'
  agent_name VARCHAR(255) NOT NULL,
  agent_category VARCHAR(50), -- 'infrastructure', 'perception', 'commerce'
  
  -- Status & Availability
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT true, -- If false, can be disabled to save costs
  execution_order INTEGER DEFAULT 0,
  
  -- Model Assignment
  primary_model_key VARCHAR(100), -- Which AI model this agent uses (if any)
  fallback_model_key VARCHAR(100), -- Fallback if primary fails
  uses_llm BOOLEAN DEFAULT false, -- Does this agent call LLMs?
  
  -- Cost & Performance
  avg_execution_time_ms INTEGER,
  avg_cost_per_run DECIMAL(10,4),
  success_rate DECIMAL(5,2),
  
  -- Configuration
  agent_config JSONB, -- Agent-specific settings
  timeout_seconds INTEGER DEFAULT 30,
  max_retries INTEGER DEFAULT 3,
  
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. COST TRACKING & BUDGETS
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was called
  model_key VARCHAR(100),
  agent_key VARCHAR(100),
  evaluation_id UUID REFERENCES evaluations(id),
  
  -- Usage metrics
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  
  -- Cost calculation
  input_cost DECIMAL(10,6),
  output_cost DECIMAL(10,6),
  total_cost DECIMAL(10,6),
  
  -- Performance
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Metadata
  request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_key DATE DEFAULT CURRENT_DATE -- For daily aggregation
);

-- Budget controls
CREATE TABLE IF NOT EXISTS cost_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  budget_type VARCHAR(50) NOT NULL, -- 'daily', 'monthly', 'per_evaluation'
  budget_limit DECIMAL(10,2) NOT NULL,
  current_spend DECIMAL(10,2) DEFAULT 0,
  
  -- Alert settings
  alert_threshold_percent INTEGER DEFAULT 80, -- Alert at 80% of budget
  alert_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_model_configs_active ON ai_model_configurations(is_active, model_provider);
CREATE INDEX IF NOT EXISTS idx_agent_configs_active ON agent_configurations(is_active, execution_order);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_date ON api_cost_tracking(date_key, model_key);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_eval ON api_cost_tracking(evaluation_id);

-- =============================================================================
-- 4. SEED AI MODEL CONFIGURATIONS
-- =============================================================================

INSERT INTO ai_model_configurations (
  model_key, model_name, model_provider, model_version,
  is_active, available_for_tiers, cost_per_1k_input_tokens, cost_per_1k_output_tokens,
  estimated_cost_per_evaluation, max_tokens, temperature, description
) VALUES

-- OpenAI Models
('chatgpt-4', 'ChatGPT 4.0', 'openai', 'gpt-4-turbo-preview',
 true, ARRAY['index-pro', 'enterprise'], 0.010000, 0.030000, 0.45, 4096, 0.7,
 'ChatGPT 4.0 - Baseline for Index Pro & Enterprise (customizable)'),

('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo',
 true, ARRAY['free'], 0.001000, 0.002000, 0.08, 4096, 0.7,
 'Free tier baseline model - Fast and cost-effective'),

-- Anthropic Models
('claude-sonnet-4.1', 'Claude Sonnet 4.1', 'anthropic', 'claude-3-5-sonnet-20241022',
 true, ARRAY['index-pro', 'enterprise'], 0.003000, 0.015000, 0.28, 4096, 0.7,
 'Claude Sonnet 4.1 - Baseline for Index Pro & Enterprise (customizable)'),

-- Perplexity
('perplexity-pro', 'Perplexity Pro', 'perplexity', 'sonar-pro',
 true, ARRAY['index-pro', 'enterprise'], 0.003000, 0.015000, 0.25, 4096, 0.7,
 'Perplexity Pro - Baseline for Index Pro & Enterprise (customizable)'),

-- Google Models
('gemini-2.5-flash', 'Gemini 2.5 Flash', 'google', 'gemini-2-5-flash-latest',
 true, ARRAY['index-pro', 'enterprise'], 0.000350, 0.001050, 0.06, 4096, 0.7,
 'Gemini 2.5 Flash - Baseline for Index Pro & Enterprise (customizable)'),

-- Mistral
('mistral-large', 'Mistral Large', 'mistral', 'mistral-large-latest',
 true, ARRAY['index-pro', 'enterprise'], 0.003000, 0.009000, 0.22, 4096, 0.7,
 'Mistral Large - Baseline for Index Pro & Enterprise (customizable)')

ON CONFLICT (model_key) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  model_version = EXCLUDED.model_version,
  cost_per_1k_input_tokens = EXCLUDED.cost_per_1k_input_tokens,
  cost_per_1k_output_tokens = EXCLUDED.cost_per_1k_output_tokens,
  estimated_cost_per_evaluation = EXCLUDED.estimated_cost_per_evaluation,
  updated_at = NOW();

-- =============================================================================
-- 5. SEED AGENT CONFIGURATIONS (11 AIDI Agents)
-- =============================================================================

INSERT INTO agent_configurations (
  agent_key, agent_name, agent_category, is_active, is_required,
  execution_order, primary_model_key, uses_llm, avg_cost_per_run, description
) VALUES

-- Infrastructure Agents
('crawl_agent', 'Crawl Agent', 'infrastructure', true, true, 1, NULL, false, 0.02,
 'Fetches HTML from website - No LLM cost'),

('schema_agent', 'Schema Agent', 'infrastructure', true, true, 2, NULL, false, 0.01,
 'Analyzes structured data - No LLM cost'),

('semantic_agent', 'Semantic Agent', 'infrastructure', true, false, 3, 'gpt-3.5-turbo', true, 0.05,
 'Evaluates semantic clarity - Can disable to save costs'),

('knowledge_graph_agent', 'Knowledge Graph Agent', 'infrastructure', true, false, 4, 'gpt-3.5-turbo', true, 0.06,
 'Assesses entity relationships - Optional'),

('llm_test_agent', 'LLM Test Agent', 'infrastructure', true, true, 5, 'gpt-4-turbo', true, 0.35,
 'Runs LLM probes - EXPENSIVE but critical'),

-- Perception Agents
('geo_visibility_agent', 'Geo-Visibility Agent', 'perception', true, false, 6, 'gpt-3.5-turbo', true, 0.08,
 'Checks geographic presence - Can disable'),

('citation_agent', 'Citation Agent', 'perception', true, false, 7, NULL, false, 0.03,
 'Analyzes external citations - No LLM cost'),

('sentiment_agent', 'Sentiment Agent', 'perception', true, false, 8, 'gpt-3.5-turbo', true, 0.07,
 'Evaluates brand sentiment - Optional'),

-- Commerce Agents
('commerce_agent', 'Commerce Agent', 'commerce', true, false, 9, 'gpt-3.5-turbo', true, 0.06,
 'Assesses commerce readiness - Can disable'),

('brand_heritage_agent', 'Brand Heritage Agent', 'commerce', true, false, 10, 'gpt-3.5-turbo', true, 0.05,
 'Analyzes brand history - Optional'),

-- Aggregator
('score_aggregator', 'Score Aggregator', 'infrastructure', true, true, 11, NULL, false, 0.01,
 'Calculates final AIDI score - Required')

ON CONFLICT (agent_key) DO UPDATE SET
  agent_name = EXCLUDED.agent_name,
  primary_model_key = EXCLUDED.primary_model_key,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- =============================================================================
-- 6. SEED DEFAULT BUDGETS
-- =============================================================================

INSERT INTO cost_budgets (budget_type, budget_limit, alert_threshold_percent, alert_email, period_start, period_end) VALUES

('daily', 100.00, 80, 'alerts@aidi.com', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
('monthly', 3000.00, 85, 'alerts@aidi.com', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'),
('per_evaluation', 1.00, 90, 'alerts@aidi.com', NULL, NULL)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Show model costs
SELECT 
  model_name,
  model_provider,
  is_active,
  array_to_string(available_for_tiers, ', ') as tiers,
  CONCAT('$', cost_per_1k_input_tokens, ' / $', cost_per_1k_output_tokens) as cost_per_1k,
  CONCAT('$', estimated_cost_per_evaluation) as est_per_eval
FROM ai_model_configurations
ORDER BY estimated_cost_per_evaluation DESC;

-- Show agent configurations
SELECT 
  agent_name,
  agent_category,
  is_active,
  uses_llm,
  primary_model_key,
  CONCAT('$', COALESCE(avg_cost_per_run, 0)) as avg_cost,
  CASE WHEN is_required THEN '✅ Required' ELSE '⚙️ Optional' END as requirement
FROM agent_configurations
ORDER BY execution_order;

DO $$
DECLARE
  model_count INTEGER;
  agent_count INTEGER;
  active_agents INTEGER;
BEGIN
  SELECT COUNT(*) INTO model_count FROM ai_model_configurations WHERE is_active = true;
  SELECT COUNT(*) INTO agent_count FROM agent_configurations;
  SELECT COUNT(*) INTO active_agents FROM agent_configurations WHERE is_active = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Agent & Model Control System Created!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🤖 AI MODELS CONFIGURED: % models', model_count;
  RAISE NOTICE '   - OpenAI: GPT-4 Turbo ($0.45/eval), GPT-3.5 ($0.08/eval)';
  RAISE NOTICE '   - Anthropic: Claude 3.5 Sonnet ($0.28/eval), Haiku ($0.05/eval)';
  RAISE NOTICE '   - Google: Gemini 1.5 Pro ($0.32/eval), Flash ($0.06/eval)';
  RAISE NOTICE '   - Perplexity: Sonar Pro ($0.25/eval)';
  RAISE NOTICE '   - Mistral: Mistral Large ($0.22/eval)';
  RAISE NOTICE '';
  RAISE NOTICE '⚙️ AGENTS CONFIGURED: % agents (% active)', agent_count, active_agents;
  RAISE NOTICE '   Required: Crawl, Schema, LLM Test, Score Aggregator';
  RAISE NOTICE '   Optional: Semantic, Knowledge Graph, Geo, Citation, etc.';
  RAISE NOTICE '';
  RAISE NOTICE '💰 COST CONTROL:';
  RAISE NOTICE '   Daily budget: $100 (alert at 80%%)';
  RAISE NOTICE '   Monthly budget: $3,000 (alert at 85%%)';
  RAISE NOTICE '   Per-evaluation cap: $1.00';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 TIER MODEL ACCESS:';
  RAISE NOTICE '   Free: GPT-3.5 only ($0.08/eval)';
  RAISE NOTICE '   Pro/Enterprise: All 8 models ($0.05-$0.45/eval)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 CMS CONTROLS:';
  RAISE NOTICE '   - Enable/disable models per tier';
  RAISE NOTICE '   - Switch model versions instantly';
  RAISE NOTICE '   - Toggle optional agents on/off';
  RAISE NOTICE '   - Set budgets and alerts';
  RAISE NOTICE '   - View real-time cost tracking';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

