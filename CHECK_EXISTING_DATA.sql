-- Check what evaluation data exists for Industry Reports

-- 1. How many completed evaluations do we have?
SELECT COUNT(*) as total_evaluations,
       COUNT(DISTINCT brand_id) as unique_brands
FROM evaluations 
WHERE status = 'completed';

-- 2. Check leaderboard_cache data
SELECT COUNT(*) as cached_brands,
       COUNT(DISTINCT niche_category) as niches_covered
FROM leaderboard_cache;

-- 3. Evaluations by niche/category
SELECT 
  COALESCE(e.industry_sector_id::text, 'uncategorized') as sector,
  COUNT(*) as eval_count
FROM evaluations e
WHERE e.status = 'completed'
GROUP BY e.industry_sector_id
ORDER BY eval_count DESC
LIMIT 20;

-- 4. Check if we have brands in leaderboard cache
SELECT niche_category, COUNT(*) as brand_count
FROM leaderboard_cache
GROUP BY niche_category
ORDER BY brand_count DESC
LIMIT 20;

-- 5. Sample brands from leaderboard
SELECT brand_name, niche_category, adi_score, grade, rank_niche
FROM leaderboard_cache
ORDER BY adi_score DESC
LIMIT 20;

