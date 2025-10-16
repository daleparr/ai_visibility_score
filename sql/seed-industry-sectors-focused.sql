-- Seed FOCUSED industry sectors (5 core sectors instead of 10)
-- These cover the highest-value markets with clearest differentiation

-- Clear any existing data first (optional - only if you want fresh start)
-- TRUNCATE industry_sectors CASCADE;

INSERT INTO industry_sectors (slug, name, description, target_audience, active, metadata) VALUES

-- 1. E-COMMERCE & CONSUMER BRANDS (Combines: DTC, Fashion, CPG, Wellness)
('ecommerce', 'E-commerce & Consumer Brands', 
 'Direct-to-consumer brands, fashion retailers, consumer packaged goods, wellness products. Covers clothing, beauty, fitness, home goods, food & beverage, and lifestyle brands.',
 'Brand Managers, CMOs, E-commerce Directors, DTC Founders',
 true,
 '{"subsectors": ["fashion", "beauty", "wellness", "cpg", "dtc"], "promptCount": 30, "expectedBrands": 100, "marketSize": "$2T+"}'),

-- 2. FINANCIAL SERVICES (Combines: Fintech, Banking, Payments)
('financial', 'Financial Services & Fintech', 
 'Digital banks, payment platforms, investment apps, lending services, insurance tech, and cryptocurrency. Modern financial services and banking.',
 'Product Managers, Marketing Heads, Fintech Founders',
 true,
 '{"subsectors": ["banking", "payments", "investing", "lending", "crypto"], "promptCount": 25, "expectedBrands": 50, "marketSize": "$300B+"}'),

-- 3. TECHNOLOGY & SOFTWARE (Combines: Consumer Electronics, SaaS)
('technology', 'Technology & Software', 
 'Consumer electronics, smartphones, laptops, SaaS platforms, productivity tools, smart devices, and tech services.',
 'Product Marketing Managers, Tech CMOs, Growth Leads',
 true,
 '{"subsectors": ["consumer-electronics", "saas", "productivity", "smart-home"], "promptCount": 28, "expectedBrands": 70, "marketSize": "$1.5T+"}'),

-- 4. TRAVEL & HOSPITALITY
('travel', 'Travel & Hospitality', 
 'Hotels, airlines, booking platforms, vacation rentals, travel experiences, and tourism services.',
 'Marketing Executives, Revenue Managers, Hotel Brand Directors',
 true,
 '{"subsectors": ["hotels", "airlines", "booking", "experiences"], "promptCount": 25, "expectedBrands": 60, "marketSize": "$1.5T+"}'),

-- 5. iGAMING & ENTERTAINMENT
('igaming', 'iGaming & Online Entertainment', 
 'Online casinos, sports betting, poker platforms, gaming sites, and entertainment betting services.',
 'Casino Operators, Affiliate Managers, Platform Directors',
 true,
 '{"subsectors": ["casinos", "sports-betting", "poker", "daily-fantasy"], "promptCount": 22, "expectedBrands": 40, "marketSize": "$100B+"}')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_audience = EXCLUDED.target_audience,
  active = EXCLUDED.active,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Verify
SELECT slug, name, 
       (metadata->>'subsectors')::text as subsectors,
       (metadata->>'marketSize')::text as market_size
FROM industry_sectors 
ORDER BY name;

-- Expected: 5 rows showing consolidated sectors

