-- =============================================================================
-- Industry Report Pricing & Sector Lock System
-- Flexible pricing: Individual sectors, 3-pack, 5-pack, all-access
-- Lock sectors without content, custom pricing per sector
-- =============================================================================

-- =============================================================================
-- 1. SECTOR PRICING & AVAILABILITY
-- =============================================================================

CREATE TABLE IF NOT EXISTS industry_report_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_slug VARCHAR(100) UNIQUE NOT NULL, -- 'fashion', 'beauty', 'tech'
  sector_name VARCHAR(255) NOT NULL, -- 'Fashion & Apparel'
  sector_description TEXT,
  is_available BOOLEAN DEFAULT false, -- Lock/unlock sector
  has_content BOOLEAN DEFAULT false, -- Does this sector have report data?
  brand_count INTEGER DEFAULT 0, -- Number of brands analyzed
  last_report_date TIMESTAMP WITH TIME ZONE,
  
  -- Individual sector pricing
  monthly_price DECIMAL(10,2) DEFAULT 119.00,
  annual_price DECIMAL(10,2) DEFAULT 1190.00, -- 2 months free
  
  -- Display & Marketing
  badge_text VARCHAR(100), -- 'Coming Soon', 'Beta', 'Popular'
  demo_cta_text VARCHAR(255) DEFAULT 'Request Demo for This Sector',
  demo_cta_url VARCHAR(500) DEFAULT '/demo',
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. BUNDLE PRICING PACKAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS industry_report_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_key VARCHAR(100) UNIQUE NOT NULL, -- '3-sector-pack', '5-sector-pack', 'all-access'
  bundle_name VARCHAR(255) NOT NULL,
  bundle_type VARCHAR(50) NOT NULL, -- 'fixed' or 'custom_select'
  
  -- Sector selection
  sector_count INTEGER, -- 3, 5, or NULL for all
  sector_selection_type VARCHAR(50) DEFAULT 'customer_choice', -- 'customer_choice', 'predefined', 'all'
  predefined_sectors VARCHAR(100)[], -- If predefined, which sectors?
  
  -- Pricing
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2),
  price_per_sector DECIMAL(10,2), -- For showing unit economics
  
  -- Marketing
  badge_text VARCHAR(100), -- 'Best Value', 'Most Popular'
  value_proposition TEXT, -- 'Save 40% vs individual sectors'
  is_active BOOLEAN DEFAULT true,
  is_visible_public BOOLEAN DEFAULT true,
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. CUSTOMER SECTOR SUBSCRIPTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS customer_sector_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES industry_report_bundles(id),
  
  -- Which sectors does this subscription include?
  included_sectors VARCHAR(100)[], -- ['fashion', 'beauty', 'tech']
  
  -- Pricing snapshot (at time of purchase)
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2),
  
  -- Stripe integration
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sectors_available ON industry_report_sectors(is_available, has_content);
CREATE INDEX IF NOT EXISTS idx_sectors_slug ON industry_report_sectors(sector_slug);
CREATE INDEX IF NOT EXISTS idx_bundles_active ON industry_report_bundles(is_active, is_visible_public);
CREATE INDEX IF NOT EXISTS idx_customer_sectors_user ON customer_sector_subscriptions(user_id, status);

-- =============================================================================
-- 4. SEED DEFAULT SECTORS (Based on your 26 niches mapped to 11 sectors)
-- =============================================================================

INSERT INTO industry_report_sectors (sector_slug, sector_name, sector_description, is_available, has_content, brand_count, monthly_price, annual_price, badge_text, display_order) VALUES

-- Available sectors (have leaderboard data)
('fashion', 'Fashion & Apparel', 'Sustainable fashion, luxury brands, affordable clothing, athletic wear. Track how AI recommends fashion brands.', true, true, 67, 119.00, 1190.00, 'Popular', 1),
('beauty', 'Beauty & Personal Care', 'Skincare, makeup, natural beauty products, anti-aging. Monitor AI recommendations for beauty brands.', true, true, 38, 119.00, 1190.00, 'Popular', 2),
('tech', 'Consumer Electronics & Tech', 'Smartphones, laptops, gaming, smart home, fitness trackers. Track tech product AI visibility.', true, true, 29, 119.00, 1190.00, NULL, 3),
('wellness', 'Health & Wellness', 'Supplement brands, fitness equipment, wellness products, organic health foods.', true, true, 22, 119.00, 1190.00, NULL, 4),

-- Coming soon sectors (no data yet - LOCKED)
('cpg', 'CPG & FMCG', 'Consumer packaged goods, food & beverage, household products.', false, false, 0, 149.00, 1490.00, 'Coming Q1 2026', 5),
('home', 'Home & Lifestyle', 'Home decor, kitchen appliances, furniture, smart home products.', false, false, 0, 119.00, 1190.00, 'Coming Q1 2026', 6),
('hospitality', 'Hospitality & Travel', 'Hotels, airlines, booking platforms, vacation rentals, travel services.', false, false, 0, 149.00, 1490.00, 'Coming Q2 2026', 7),
('automotive', 'Mobility & Automotive', 'Auto brands, EV manufacturers, ride-sharing, micro-mobility.', false, false, 0, 149.00, 1490.00, 'Coming Q2 2026', 8),
('finance', 'Banking & Fintech', 'Digital banks, payment platforms, investment apps, lending, insurance tech.', false, false, 0, 199.00, 1990.00, 'Coming Q2 2026', 9),
('b2b-saas', 'B2B SaaS & Software', 'Enterprise software, productivity tools, developer platforms, cloud services.', false, false, 0, 149.00, 1490.00, 'Coming Q3 2026', 10),
('professional-services', 'Professional Services', 'Consulting, agencies, legal services, accounting, business services.', false, false, 0, 199.00, 1990.00, 'Coming Q3 2026', 11)

ON CONFLICT (sector_slug) DO UPDATE SET
  sector_name = EXCLUDED.sector_name,
  sector_description = EXCLUDED.sector_description,
  is_available = EXCLUDED.is_available,
  has_content = EXCLUDED.has_content,
  brand_count = EXCLUDED.brand_count,
  monthly_price = EXCLUDED.monthly_price,
  badge_text = EXCLUDED.badge_text,
  updated_at = NOW();

-- =============================================================================
-- 5. SEED BUNDLE PACKAGES
-- =============================================================================

INSERT INTO industry_report_bundles (bundle_key, bundle_name, bundle_type, sector_count, sector_selection_type, monthly_price, annual_price, price_per_sector, badge_text, value_proposition, display_order) VALUES

-- Single sector (baseline)
('single-sector', 'Single Sector', 'fixed', 1, 'customer_choice', 119.00, 1190.00, 119.00, NULL, 
 'Perfect for focused competitive intelligence in one industry', 1),

-- 3-Sector Pack (25% discount)
('3-sector-pack', '3-Sector Package', 'custom_select', 3, 'customer_choice', 269.00, 2690.00, 89.67, 'Save 25%', 
 'Choose any 3 sectors. £89.67/sector (vs £119 individual) - Save £88/month', 2),

-- 5-Sector Pack (35% discount)
('5-sector-pack', '5-Sector Package', 'custom_select', 5, 'customer_choice', 389.00, 3890.00, 77.80, 'Save 35%', 
 'Choose any 5 sectors. £77.80/sector (vs £119 individual) - Save £206/month', 3),

-- All-Access (45% discount)
('all-access', 'All-Access Pass', 'custom_select', NULL, 'all', 719.00, 7190.00, 65.36, 'Best Value - Save 45%', 
 'Access all 11 sectors. £65.36/sector (vs £119 individual) - Save £590/month', 4)

ON CONFLICT (bundle_key) DO UPDATE SET
  monthly_price = EXCLUDED.monthly_price,
  annual_price = EXCLUDED.annual_price,
  value_proposition = EXCLUDED.value_proposition,
  updated_at = NOW();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Show available vs locked sectors
SELECT 
  sector_name,
  monthly_price,
  brand_count,
  CASE 
    WHEN is_available = true AND has_content = true THEN '✅ AVAILABLE'
    WHEN is_available = false THEN '🔒 LOCKED (' || COALESCE(badge_text, 'Coming Soon') || ')'
    ELSE '⚠️ PENDING'
  END as status,
  CASE 
    WHEN is_available = false THEN demo_cta_text
    ELSE 'Subscribe Now'
  END as cta_text
FROM industry_report_sectors
ORDER BY display_order;

-- Show bundle pricing
SELECT 
  bundle_name,
  sector_count,
  monthly_price,
  price_per_sector,
  ROUND((1 - (price_per_sector / 119.00)) * 100) as discount_percent,
  value_proposition
FROM industry_report_bundles
ORDER BY display_order;

-- Success message
DO $$
DECLARE
  available_count INTEGER;
  locked_count INTEGER;
  bundle_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO available_count FROM industry_report_sectors WHERE is_available = true;
  SELECT COUNT(*) INTO locked_count FROM industry_report_sectors WHERE is_available = false;
  SELECT COUNT(*) INTO bundle_count FROM industry_report_bundles;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Industry Report Pricing System Created!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 SECTORS:';
  RAISE NOTICE '   ✅ Available: % (Fashion, Beauty, Tech, Wellness)', available_count;
  RAISE NOTICE '   🔒 Locked: % (Showing demo CTAs)', locked_count;
  RAISE NOTICE '';
  RAISE NOTICE '💰 BUNDLE PACKAGES:';
  RAISE NOTICE '   - Single: £119/month';
  RAISE NOTICE '   - 3-Pack: £269/month (save 25%% = £89.67/sector)';
  RAISE NOTICE '   - 5-Pack: £389/month (save 35%% = £77.80/sector)';
  RAISE NOTICE '   - All-Access: £719/month (save 45%% = £65.36/sector)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 STRATEGY:';
  RAISE NOTICE '   Locked sectors show "Request Demo" CTA';
  RAISE NOTICE '   Available sectors show pricing & subscribe buttons';
  RAISE NOTICE '   Bundle discounts drive multi-sector purchases';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

