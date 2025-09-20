-- 0003_leaderboard_cache_unique_index.sql
-- Purpose: Ensure unique upsert target for leaderboard_cache (website_url, niche_category)
-- Safe to run multiple times

BEGIN;
CREATE UNIQUE INDEX IF NOT EXISTS ux_leaderboard_cache_site_niche
  ON production.leaderboard_cache (website_url, niche_category);
COMMIT;