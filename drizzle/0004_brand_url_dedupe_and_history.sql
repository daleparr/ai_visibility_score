-- 0004_brand_url_dedupe_and_history.sql
-- Purpose: Enforce one brand per user per normalized host, keep evaluations append-only,
--          and prevent duplicate artifact rows within a single evaluation.
-- Safe, backward-compatible constraints implemented as UNIQUE INDEXes (IF NOT EXISTS).

-- Always schema-qualify for safety
SET search_path = production, public;

-- 1) Brands: normalized host + unique per user/account
-- Add a generated column that extracts a canonical host from website_url
-- Example: https://www.EndClothing.com/ => endclothing.com
ALTER TABLE production.brands
  ADD COLUMN IF NOT EXISTS normalized_host text
  GENERATED ALWAYS AS (
    lower(
      split_part(
        regexp_replace(
          regexp_replace(coalesce(website_url, ''), '^https?://', '', 'i'),
          '^www\.',
          '',
          'i'
        ),
        '/',
        1
      )
    )
  ) STORED;

-- Unique per user/account + host
CREATE UNIQUE INDEX IF NOT EXISTS brands_user_normalized_host_uk
  ON production.brands (user_id, normalized_host);

-- Optional helper index if you frequently filter by normalized_host alone
CREATE INDEX IF NOT EXISTS brands_normalized_host_idx
  ON production.brands (normalized_host);

-- 2) Evaluations timeline remains append-only (no schema change required)

-- 3) Artifact de-duplication within the same run (evaluation)
-- Prevent duplicate pages saved multiple times during a single evaluation
CREATE UNIQUE INDEX IF NOT EXISTS website_snapshots_eval_url_kind_uk
  ON production.website_snapshots (evaluation_id, url, page_type);

CREATE UNIQUE INDEX IF NOT EXISTS crawl_signals_eval_uk
  ON production.crawl_site_signals (evaluation_id);

CREATE UNIQUE INDEX IF NOT EXISTS features_eval_uk
  ON production.evaluation_features_flat (evaluation_id);

-- Dimension scores should also be unique per evaluation per dimension
CREATE UNIQUE INDEX IF NOT EXISTS dimension_scores_eval_dim_name_uk
  ON production.dimension_scores (evaluation_id, dimension_name);

-- 4) Time-series query helpers (performance indexes)
CREATE INDEX IF NOT EXISTS crawl_signals_brand_created_idx
  ON production.crawl_site_signals (brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS features_brand_created_idx
  ON production.evaluation_features_flat (brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS snapshots_brand_created_idx
  ON production.website_snapshots (brand_id, created_at DESC);

-- 5) Optional storage optimization across runs (commented out)
-- Avoid storing identical content across runs for a given (url,page_type)
-- Uncomment if/when you want this behavior:
-- CREATE UNIQUE INDEX IF NOT EXISTS website_snapshots_url_kind_hash_uk
--   ON production.website_snapshots (url, page_type, content_hash);

-- 6) Documentation of common queries (for reference)
-- Latest snapshot per (brand_id, url, page_type):
-- SELECT DISTINCT ON (ws.brand_id, ws.url, ws.page_type) ws.*
-- FROM production.website_snapshots ws
-- WHERE ws.brand_id = $1
-- ORDER BY ws.brand_id, ws.url, ws.page_type, ws.created_at DESC;

-- Evaluations timeline for a brand:
-- SELECT id, status, overall_score, grade, created_at, completed_at
-- FROM production.evaluations
-- WHERE brand_id = $1
-- ORDER BY created_at DESC
-- LIMIT 50;

-- Page evolution across runs:
-- SELECT ws.evaluation_id, e.created_at, ws.content_hash, ws.title, ws.meta_description
-- FROM production.website_snapshots ws
-- JOIN production.evaluations e ON e.id = ws.evaluation_id
-- WHERE ws.brand_id = $1 AND ws.url = $2 AND ws.page_type = 'homepage'
-- ORDER BY e.created_at DESC;