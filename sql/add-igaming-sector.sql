-- =============================================================================
-- Add iGaming Sector to Industry Reports
-- =============================================================================

INSERT INTO industry_report_sectors (
  sector_slug, 
  sector_name, 
  sector_description, 
  is_available, 
  has_content, 
  brand_count, 
  monthly_price, 
  annual_price, 
  badge_text, 
  display_order
) VALUES (
  'igaming',
  'iGaming & Online Gambling',
  'Online casinos, sports betting platforms, poker sites, lottery platforms, esports betting. Track AI visibility for gaming brands.',
  false,  -- Initially locked
  false,  -- No content yet
  0,      -- No brands analyzed yet
  199.00, -- Premium pricing (regulated industry)
  1990.00,
  'Coming Q1 2026',
  12      -- Display at end
)
ON CONFLICT (sector_slug) DO UPDATE SET
  sector_name = EXCLUDED.sector_name,
  sector_description = EXCLUDED.sector_description,
  is_available = EXCLUDED.is_available,
  monthly_price = EXCLUDED.monthly_price,
  badge_text = EXCLUDED.badge_text,
  updated_at = NOW();

-- Verification
SELECT 
  sector_name,
  is_available,
  brand_count,
  monthly_price,
  badge_text
FROM industry_report_sectors
WHERE sector_slug = 'igaming';

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ iGaming Sector Added!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎰 Sector: iGaming & Online Gambling';
  RAISE NOTICE '🔒 Status: Locked (Coming Q1 2026)';
  RAISE NOTICE '💰 Price: £199/month (premium pricing for regulated industry)';
  RAISE NOTICE '📊 Brands: 0 (sector in development)';
  RAISE NOTICE '';
  RAISE NOTICE 'TOTAL SECTORS: 12 (4 available, 8 locked)';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '💡 CMS CONTROL:';
  RAISE NOTICE '   Go to: Industry Reports tab';
  RAISE NOTICE '   Toggle: Lock/unlock iGaming sector';
  RAISE NOTICE '   Edit: Pricing, badge text, demo CTA';
  RAISE NOTICE '';
END $$;

