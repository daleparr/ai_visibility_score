-- =============================================================================
-- AI Model Logos with Tier-Based Display
-- Show which AI models are used per tier (creates FOMO for upgrades)
-- =============================================================================

-- Add AI model logos to client_logos table
-- These are special category logos that show which models we test

INSERT INTO client_logos (
  logo_name, logo_slug, file_url, file_type, width, height, 
  alt_text, category, is_active, display_order, usage_locations
) VALUES

-- AI Model Labs (Tier-based visibility)
('OpenAI', 'openai', '/logos/openai.svg', 'svg', 120, 120, 'OpenAI logo', 'ai_model', true, 1, 
 ARRAY['homepage_models', 'evaluation_report_models']),

('Anthropic', 'anthropic', '/logos/anthropic.svg', 'svg', 120, 120, 'Anthropic logo', 'ai_model', true, 2,
 ARRAY['homepage_models', 'evaluation_report_models']),

('Google AI', 'google-ai', '/logos/google-ai.svg', 'svg', 120, 120, 'Google AI logo', 'ai_model', true, 3,
 ARRAY['homepage_models', 'evaluation_report_models']),

('Perplexity', 'perplexity', '/logos/perplexity.svg', 'svg', 120, 120, 'Perplexity logo', 'ai_model', true, 4,
 ARRAY['homepage_models', 'evaluation_report_models']),

('Mistral AI', 'mistral', '/logos/mistral.svg', 'svg', 120, 120, 'Mistral AI logo', 'ai_model', true, 5,
 ARRAY['homepage_models', 'evaluation_report_models'])

ON CONFLICT (logo_slug) DO UPDATE SET
  category = 'ai_model',
  usage_locations = EXCLUDED.usage_locations,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- AI Model Display Rules (Which models shown per tier)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_model_tier_display (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key VARCHAR(100) NOT NULL, -- 'free', 'index-pro', 'enterprise'
  model_slug VARCHAR(100) NOT NULL, -- 'openai', 'anthropic', etc.
  is_displayed BOOLEAN DEFAULT true,
  model_version VARCHAR(100), -- 'GPT-3.5', 'GPT-4', 'Claude 3.5 Sonnet'
  badge_text VARCHAR(100), -- 'Limited', 'Full Access', 'Frontier Models'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tier_key, model_slug)
);

-- Seed tier-based AI model display rules
INSERT INTO ai_model_tier_display (tier_key, model_slug, is_displayed, model_version, badge_text, display_order) VALUES

-- FREE TIER: OpenAI only (ChatGPT 3.5)
('free', 'openai', true, 'GPT-3.5 Turbo', 'Basic Model', 1),
('free', 'anthropic', false, NULL, NULL, 2),
('free', 'google-ai', false, NULL, NULL, 3),
('free', 'perplexity', false, NULL, NULL, 4),
('free', 'mistral', false, NULL, NULL, 5),

-- INDEX PRO TIER: All frontier models
('index-pro', 'openai', true, 'GPT-4 Turbo', 'Frontier Model', 1),
('index-pro', 'anthropic', true, 'Claude 3.5 Sonnet', 'Frontier Model', 2),
('index-pro', 'google-ai', true, 'Gemini 1.5 Pro', 'Frontier Model', 3),
('index-pro', 'perplexity', true, 'Perplexity AI', 'Frontier Model', 4),
('index-pro', 'mistral', true, 'Mistral Large', 'Frontier Model', 5),

-- ENTERPRISE TIER: All models + priority access badge
('enterprise', 'openai', true, 'GPT-4 Turbo', 'Priority Access', 1),
('enterprise', 'anthropic', true, 'Claude 3.5 Sonnet', 'Priority Access', 2),
('enterprise', 'google-ai', true, 'Gemini 1.5 Pro', 'Priority Access', 3),
('enterprise', 'perplexity', true, 'Perplexity AI', 'Priority Access', 4),
('enterprise', 'mistral', true, 'Mistral Large', 'Priority Access', 5)

ON CONFLICT (tier_key, model_slug) DO UPDATE SET
  is_displayed = EXCLUDED.is_displayed,
  model_version = EXCLUDED.model_version,
  badge_text = EXCLUDED.badge_text;

-- Create index
CREATE INDEX IF NOT EXISTS idx_model_tier_display ON ai_model_tier_display(tier_key, is_displayed);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Show which models each tier sees
SELECT 
  tier_key,
  string_agg(
    CASE WHEN is_displayed THEN model_slug ELSE NULL END, 
    ', ' 
    ORDER BY display_order
  ) as displayed_models,
  COUNT(*) FILTER (WHERE is_displayed = true) as model_count
FROM ai_model_tier_display
GROUP BY tier_key
ORDER BY 
  CASE tier_key
    WHEN 'enterprise' THEN 1
    WHEN 'index-pro' THEN 2
    WHEN 'free' THEN 3
  END;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ AI Model Logo System Created!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🤖 AI MODELS SEEDED: 5 frontier model labs';
  RAISE NOTICE '';
  RAISE NOTICE '📊 TIER-BASED DISPLAY:';
  RAISE NOTICE '   FREE: 1 model (OpenAI GPT-3.5) ← Shows what they''re missing!';
  RAISE NOTICE '   INDEX PRO: 5 models (All frontier models) ✨';
  RAISE NOTICE '   ENTERPRISE: 5 models (All + priority badge) 🌟';
  RAISE NOTICE '';
  RAISE NOTICE '💡 CONVERSION STRATEGY:';
  RAISE NOTICE '   Free users see: 🟢 OpenAI + 🔒🔒🔒🔒 (locked/grayed)';
  RAISE NOTICE '   Creates FOMO → Drives Index Pro upgrades';
  RAISE NOTICE '';
  RAISE NOTICE '📏 LOGO SPECS:';
  RAISE NOTICE '   Format: SVG preferred (120×120px square for model logos)';
  RAISE NOTICE '   Location: /public/logos/[model].svg';
  RAISE NOTICE '   Display: Grayscale by default, color on hover';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 USAGE:';
  RAISE NOTICE '   - Homepage: Under evaluation form';
  RAISE NOTICE '   - Evaluation Reports: "AI Models Analyzed" card';
  RAISE NOTICE '   - Tier comparison: Show feature differences';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

