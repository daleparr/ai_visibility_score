-- =====================================================================================
-- BULLETPROOF DEDUPLICATION INDEXES MIGRATION
-- Ensures per-evaluation deduplication while preserving unlimited history across evaluations
-- =====================================================================================

BEGIN;

-- 1. Dimension Scores: One score per evaluation + dimension name
-- Prevents duplicate dimension scores within a single evaluation
CREATE UNIQUE INDEX IF NOT EXISTS dimension_scores_eval_dim_uk 
  ON production.dimension_scores (evaluation_id, dimension_name);

-- 2. Website Snapshots: One snapshot per evaluation + URL + page type  
-- Prevents duplicate snapshots of the same page within a single evaluation
CREATE UNIQUE INDEX IF NOT EXISTS website_snapshots_eval_url_kind_uk 
  ON production.website_snapshots (evaluation_id, url, page_type);

-- 3. Crawl Site Signals: One signal record per evaluation
-- Ensures only one crawl signal record per evaluation
CREATE UNIQUE INDEX IF NOT EXISTS crawl_site_signals_eval_uk 
  ON production.crawl_site_signals (evaluation_id);

-- 4. Evaluation Features: One feature record per evaluation
-- Ensures only one feature record per evaluation  
CREATE UNIQUE INDEX IF NOT EXISTS evaluation_features_flat_eval_uk 
  ON production.evaluation_features_flat (evaluation_id);

-- 5. Brands: One brand per user + normalized host
-- Prevents duplicate brands for the same user/domain combination
CREATE UNIQUE INDEX IF NOT EXISTS brands_user_host_uk 
  ON production.brands (user_id, normalized_host);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS evaluations_brand_created_idx 
  ON production.evaluations (brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS dimension_scores_eval_created_idx 
  ON production.dimension_scores (evaluation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS website_snapshots_eval_created_idx 
  ON production.website_snapshots (evaluation_id, created_at DESC);

-- Verification: Check that all indexes were created successfully
DO $$
DECLARE
    missing_indexes text[] := ARRAY[]::text[];
    idx_name text;
    expected_indexes text[] := ARRAY[
        'dimension_scores_eval_dim_uk',
        'website_snapshots_eval_url_kind_uk', 
        'crawl_site_signals_eval_uk',
        'evaluation_features_flat_eval_uk',
        'brands_user_host_uk'
    ];
BEGIN
    -- Check each expected index
    FOREACH idx_name IN ARRAY expected_indexes
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'production' AND indexname = idx_name
        ) THEN
            missing_indexes := array_append(missing_indexes, idx_name);
        END IF;
    END LOOP;
    
    -- Report results
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE WARNING 'Missing indexes: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE 'All deduplication indexes created successfully';
    END IF;
END
$$;

COMMIT;

-- Final verification query
SELECT 
    'DEDUPLICATION_INDEXES_STATUS' as check_type,
    COUNT(*) as total_indexes,
    array_agg(indexname ORDER BY indexname) as index_names
FROM pg_indexes 
WHERE schemaname = 'production' 
  AND indexname IN (
    'dimension_scores_eval_dim_uk',
    'website_snapshots_eval_url_kind_uk', 
    'crawl_site_signals_eval_uk',
    'evaluation_features_flat_eval_uk',
    'brands_user_host_uk'
  );