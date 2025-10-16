-- Seed the 10 initial industry sectors
-- Run this in Neon SQL Editor after the schema is created

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
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_audience = EXCLUDED.target_audience,
  active = EXCLUDED.active,
  updated_at = now();

-- Verify the insert worked
SELECT slug, name, active FROM industry_sectors ORDER BY name;

