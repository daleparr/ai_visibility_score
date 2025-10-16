-- Add sector and competitor tracking to evaluations
-- This allows personalized competitive benchmarking

-- Add columns to evaluations table
ALTER TABLE evaluations 
ADD COLUMN IF NOT EXISTS industry_sector_id UUID REFERENCES industry_sectors(id),
ADD COLUMN IF NOT EXISTS primary_competitors JSONB DEFAULT '[]', -- Array of competitor names/domains
ADD COLUMN IF NOT EXISTS sector_confirmed_at TIMESTAMPTZ, -- When user confirmed their sector
ADD COLUMN IF NOT EXISTS competitor_data JSONB DEFAULT '{}'; -- Enriched competitor info

-- Add to users table for persistence
ALTER TABLE users
ADD COLUMN IF NOT EXISTS primary_sector_id UUID REFERENCES industry_sectors(id),
ADD COLUMN IF NOT EXISTS tracked_competitors JSONB DEFAULT '[]', -- User's main competitors across evaluations
ADD COLUMN IF NOT EXISTS sector_set_at TIMESTAMPTZ;

-- Index for sector-based queries
CREATE INDEX IF NOT EXISTS idx_evaluations_sector ON evaluations(industry_sector_id);
CREATE INDEX IF NOT EXISTS idx_users_sector ON users(primary_sector_id);

-- Create competitor tracking table for more advanced analysis
CREATE TABLE IF NOT EXISTS competitor_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_domain TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  sector_id UUID REFERENCES industry_sectors(id),
  confidence TEXT DEFAULT 'user-confirmed', -- 'user-confirmed', 'ai-suggested', 'industry-standard'
  relationship_type TEXT DEFAULT 'direct', -- 'direct', 'adjacent', 'aspirational'
  added_at TIMESTAMPTZ DEFAULT now(),
  last_validated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, brand_domain, competitor_domain)
);

CREATE INDEX IF NOT EXISTS idx_competitor_relationships_user ON competitor_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_relationships_sector ON competitor_relationships(sector_id);

COMMENT ON TABLE competitor_relationships IS 'Tracks brand-competitor relationships for personalized benchmarking';
COMMENT ON COLUMN evaluations.industry_sector_id IS 'Which industry sector this brand operates in';
COMMENT ON COLUMN evaluations.primary_competitors IS 'User-provided list of top 3-5 competitors';
COMMENT ON COLUMN users.primary_sector_id IS 'User primary industry sector';

