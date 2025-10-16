-- Run these queries in Neon to verify the Industry Reports schema

-- 1. Check if industry_sectors has the correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'industry_sectors' 
ORDER BY ordinal_position;

-- 2. Check if sectors are seeded
SELECT slug, name, active 
FROM industry_sectors 
ORDER BY name;

-- 3. Check sector_prompts structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sector_prompts' 
ORDER BY ordinal_position;

-- 4. Count prompts per sector
SELECT s.slug, s.name, COUNT(sp.id) as prompt_count
FROM industry_sectors s
LEFT JOIN sector_prompts sp ON s.id = sp.sector_id
GROUP BY s.id, s.slug, s.name
ORDER BY s.name;

-- 5. Check if brand_performance has the right structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'brand_performance' 
ORDER BY ordinal_position;

-- 6. Check report_subscriptions structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'report_subscriptions' 
ORDER BY ordinal_position;

-- Expected results:
-- - industry_sectors should have: id, slug, name, description, icon_url, target_audience, market_size_notes, active, metadata, created_at, updated_at
-- - Should have 10 sectors: automotive, cpg, dtc, fashion, fintech, igaming, politics, tech, travel, wellness
-- - sector_prompts should have: id, sector_id, prompt_text, prompt_type, intent_category, geographic_scope, temporal_context, expected_brand_count, bias_controls, active, created_at, updated_at
-- - Prompt count should be 0 initially (needs seeding)

