-- Evaluation and environment info
SELECT 'EVAL CHECK' AS section, current_setting('search_path') AS search_path;

-- Evaluation row
SELECT id, brand_id, status, overall_score, grade, created_at, completed_at
FROM production.evaluations
WHERE id = '07fba108-4ad4-4a15-8bdc-1d904b5c98d7'::uuid;

-- Brand row
SELECT 'BRAND' AS section;
SELECT b.id AS brand_id, b.website_url
FROM production.brands b
JOIN production.evaluations e ON e.brand_id = b.id
WHERE e.id = '07fba108-4ad4-4a15-8bdc-1d904b5c98d7'::uuid;

-- Dimension counts
SELECT 'DIMENSION SCORES COUNT' AS section;
SELECT COUNT(*) AS dim_count
FROM production.dimension_scores
WHERE evaluation_id = '07fba108-4ad4-4a15-8bdc-1d904b5c98d7'::uuid;

-- Dimension sample
SELECT 'DIMENSION SAMPLE' AS section;
SELECT dimension_name, score, created_at
FROM production.dimension_scores
WHERE evaluation_id = '07fba108-4ad4-4a15-8bdc-1d904b5c98d7'::uuid
ORDER BY created_at DESC
LIMIT 5;

-- Artifact counts
SELECT 'ARTIFACT COUNTS' AS section;
SELECT
  (SELECT COUNT(*) FROM production.website_snapshots WHERE evaluation_id = '07fba108-4ad4-4a15-8bdc-1d904b5c98d7'::uuid) AS website_snapshots,
  (SELECT COUNT(*) FROM production.crawl_site_signals WHERE evaluation_id = '07fba108-4ad4-4a15-8bdc-1d904b5c98d7'::uuid) AS crawl_site_signals,
  (SELECT COUNT(*) FROM production.evaluation_features_flat WHERE evaluation_id = '07fba108-4ad4-4a15-8bdc-1d904b5c98d7'::uuid) AS evaluation_features_flat;

-- Latest totals for context
SELECT 'TOTAL COUNTS' AS section;
SELECT
  (SELECT COUNT(*) FROM production.evaluations) AS evaluations_total,
  (SELECT COUNT(*) FROM production.dimension_scores) AS dimension_scores_total,
  (SELECT COUNT(*) FROM production.website_snapshots) AS website_snapshots_total,
  (SELECT COUNT(*) FROM production.crawl_site_signals) AS crawl_site_signals_total,
  (SELECT COUNT(*) FROM production.evaluation_features_flat) AS evaluation_features_flat_total;