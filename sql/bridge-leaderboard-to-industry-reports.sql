-- Bridge: Leaderboard Data → Industry Reports
-- Converts your 195 existing AIDI evaluations into beta industry reports

-- Step 1: Create niche-to-sector mapping table
CREATE TABLE IF NOT EXISTS niche_to_sector_mapping (
  niche_category VARCHAR(100) PRIMARY KEY,
  sector_id UUID REFERENCES industry_sectors(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Map all your leaderboard niches to industry sectors
INSERT INTO niche_to_sector_mapping (niche_category, sector_id) VALUES
-- FASHION & APPAREL (6 niches)
('Streetwear', (SELECT id FROM industry_sectors WHERE slug = 'fashion')),
('Luxury Fashion Houses', (SELECT id FROM industry_sectors WHERE slug = 'fashion')),
('Activewear & Athleisure', (SELECT id FROM industry_sectors WHERE slug = 'fashion')),
('Fast Fashion', (SELECT id FROM industry_sectors WHERE slug = 'fashion')),
('Sustainable Fashion', (SELECT id FROM industry_sectors WHERE slug = 'fashion')),
('Footwear Brands', (SELECT id FROM industry_sectors WHERE slug = 'fashion')),

-- BEAUTY & PERSONAL CARE (4 niches)
('Global Beauty Retailers', (SELECT id FROM industry_sectors WHERE slug = 'beauty')),
('Clean & Eco Beauty', (SELECT id FROM industry_sectors WHERE slug = 'beauty')),
('Luxury Skincare', (SELECT id FROM industry_sectors WHERE slug = 'beauty')),
('Drugstore Beauty', (SELECT id FROM industry_sectors WHERE slug = 'beauty')),

-- TECH & ELECTRONICS (3 niches)
('Tech Giants', (SELECT id FROM industry_sectors WHERE slug = 'tech')),
('Consumer Electronics', (SELECT id FROM industry_sectors WHERE slug = 'tech')),
('Gaming Hardware', (SELECT id FROM industry_sectors WHERE slug = 'tech')),

-- WELLNESS (3 niches)
('Fitness Equipment & Apps', (SELECT id FROM industry_sectors WHERE slug = 'wellness')),
('Supplements & Nutrition', (SELECT id FROM industry_sectors WHERE slug = 'wellness')),
('Wellness Brands', (SELECT id FROM industry_sectors WHERE slug = 'wellness')),

-- HOME & LIFESTYLE (3 niches)
('Home Decor', (SELECT id FROM industry_sectors WHERE slug = 'home')),
('Kitchen & Appliances', (SELECT id FROM industry_sectors WHERE slug = 'home')),
('Furniture', (SELECT id FROM industry_sectors WHERE slug = 'home')),

-- IGAMING (2 niches)
('Online Casinos', (SELECT id FROM industry_sectors WHERE slug = 'igaming')),
('Sports Betting', (SELECT id FROM industry_sectors WHERE slug = 'igaming')),

-- FINTECH (2 niches)
('Digital Banks', (SELECT id FROM industry_sectors WHERE slug = 'fintech')),
('Payment Platforms', (SELECT id FROM industry_sectors WHERE slug = 'fintech')),

-- CPG (2 niches)
('Food & Beverage', (SELECT id FROM industry_sectors WHERE slug = 'cpg')),
('Household Products', (SELECT id FROM industry_sectors WHERE slug = 'cpg')),

-- TRAVEL (2 niches)
('Hotels & Resorts', (SELECT id FROM industry_sectors WHERE slug = 'travel')),
('Airlines & Travel', (SELECT id FROM industry_sectors WHERE slug = 'travel')),

-- AUTOMOTIVE (if you have these niches)
('Auto Manufacturers', (SELECT id FROM industry_sectors WHERE slug = 'automotive')),
('EV Brands', (SELECT id FROM industry_sectors WHERE slug = 'automotive'))

ON CONFLICT (niche_category) DO UPDATE SET sector_id = EXCLUDED.sector_id;

-- Step 3: Update leaderboard_cache with sector IDs
ALTER TABLE leaderboard_cache 
ADD COLUMN IF NOT EXISTS industry_sector_id UUID REFERENCES industry_sectors(id);

UPDATE leaderboard_cache lc
SET industry_sector_id = m.sector_id
FROM niche_to_sector_mapping m
WHERE lc.niche_category = m.niche_category;

-- Step 4: Sync to brand_performance (creates beta report data)
INSERT INTO brand_performance (
  sector_id,
  report_month,
  brand_name,
  brand_domain,
  mention_count,
  mention_share,
  avg_position,
  rank_overall,
  avg_sentiment_score,
  models_mentioned_in,
  metadata
)
SELECT 
  lc.industry_sector_id,
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  lc.brand_name,
  REPLACE(REPLACE(LOWER(lc.website_url), 'https://', ''), 'www.', ''),
  ROW_NUMBER() OVER (PARTITION BY lc.industry_sector_id ORDER BY lc.adi_score DESC),
  ((100.0 - ROW_NUMBER() OVER (PARTITION BY lc.industry_sector_id ORDER BY lc.adi_score DESC)) / 
   COUNT(*) OVER (PARTITION BY lc.industry_sector_id))::DECIMAL(5,2),
  ROW_NUMBER() OVER (PARTITION BY lc.industry_sector_id ORDER BY lc.adi_score DESC)::DECIMAL(4,2),
  ROW_NUMBER() OVER (PARTITION BY lc.industry_sector_id ORDER BY lc.adi_score DESC),
  (lc.adi_score / 100.0)::DECIMAL(3,2),
  2,
  jsonb_build_object(
    'source', 'beta_leaderboard_sync',
    'aidi_score', lc.adi_score,
    'grade', lc.grade,
    'niche', lc.niche_category,
    'beta', true
  )
FROM leaderboard_cache lc
WHERE lc.industry_sector_id IS NOT NULL
  AND lc.last_evaluated >= CURRENT_DATE - INTERVAL '60 days'
ON CONFLICT (sector_id, report_month, brand_name) DO NOTHING;

-- Verify results
SELECT 
  s.name as sector_name,
  COUNT(*) as brands,
  MAX(bp.rank_overall) as max_rank,
  AVG(bp.avg_sentiment_score) as avg_sentiment
FROM brand_performance bp
JOIN industry_sectors s ON bp.sector_id = s.id
WHERE bp.report_month = DATE_TRUNC('month', CURRENT_DATE)
  AND bp.metadata->>'beta' = 'true'
GROUP BY s.id, s.name
ORDER BY brands DESC;

