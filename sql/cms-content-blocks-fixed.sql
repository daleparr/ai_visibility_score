-- CMS Content Blocks - FIXED VERSION
-- Simplified JSON to avoid syntax errors
-- Date: October 16, 2025

-- Clear existing blocks
DELETE FROM content_blocks WHERE page_id IN (
  SELECT id FROM cms_pages WHERE slug IN (
    'homepage', 'methodology', 'faq', 'aidi-vs-monitoring-tools', 'reports-landing'
  )
);

-- =============================================================================
-- HOMEPAGE CONTENT BLOCKS (7 blocks)
-- =============================================================================

-- 1. Hero Badge
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'hero_badge', 'text', 
  '{"text": "Available Now - No Waitlist"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'homepage';

-- 2. Hero Headline
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'hero_headline', 'text',
  '{"text": "The Benchmark Standard for AEO Intelligence"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'homepage';

-- 3. Hero Subhead
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'hero_subhead', 'text',
  '{"text": "Scientifically rigorous. Statistically validated. Board-ready insights."}'::jsonb, 3, true
FROM cms_pages WHERE slug = 'homepage';

-- 4. Hero Description
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'hero_description', 'richtext',
  '{"html": "<p>While monitoring tools provide quick feedback, AIDI delivers the systematic benchmarking enterprises need for strategic decisions.</p>"}'::jsonb, 4, true
FROM cms_pages WHERE slug = 'homepage';

-- 5. Trust Indicators
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'trust_indicators', 'json',
  '{"items": ["Peer-Reviewed Methodology", "Industry Benchmarked", "Statistical Confidence Intervals", "Built by Data Scientists"]}'::jsonb, 5, true
FROM cms_pages WHERE slug = 'homepage';

-- 6. Pricing Headline
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'pricing_headline', 'text',
  '{"text": "Strategic Intelligence, Not Daily Monitoring"}'::jsonb, 40, true
FROM cms_pages WHERE slug = 'homepage';

-- 7. Footer About
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'footer_about', 'richtext',
  '{"html": "<p>The AI Discoverability Index (AIDI) provides the benchmark standard for measuring brand visibility in AI-powered answer engines. Built by data scientists for executives who need audit-grade results for strategic decisions.</p>"}'::jsonb, 100, true
FROM cms_pages WHERE slug = 'homepage';

-- =============================================================================
-- METHODOLOGY PAGE CONTENT BLOCKS (3 blocks)
-- =============================================================================

-- 1. Intro
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'methodology_intro', 'richtext',
  '{"html": "<p>Our testing methodology is publicly available, peer-reviewable, and follows research-grade protocols. Unlike proprietary black box approaches, every AIDI methodology is publicly auditable—because trust requires transparency.</p>"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'methodology';

-- 2. Version
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'methodology_version', 'json',
  '{"version": "1.2", "published": "October 2025", "last_updated": "October 15, 2025"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'methodology';

-- 3. Core Principles (simplified)
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'core_principles', 'json',
  '{"headline": "Five Pillars of Scientific Rigor", "principles": [{"id": "standardized", "icon": "🎯", "title": "Standardized Tests", "description": "Every brand tested identically. No user-defined prompts.", "stat_rigor": "Test-Retest Reliability: r = 0.94"}, {"id": "unbiased", "icon": "🔍", "title": "Unbiased Queries", "description": "Generic queries that reflect real buyer behavior."}, {"id": "averaging", "icon": "📊", "title": "Multi-Run Averaging", "description": "3+ runs per dimension with 95% confidence intervals."}, {"id": "baselines", "icon": "🏆", "title": "Industry Baselines", "description": "Percentile rankings across 15+ industries."}, {"id": "peer-reviewed", "icon": "📚", "title": "Peer-Reviewed", "description": "Published framework with academic validation."}]}'::jsonb, 10, true
FROM cms_pages WHERE slug = 'methodology';

-- =============================================================================
-- FAQ PAGE CONTENT BLOCKS (1 block - simplified)
-- =============================================================================

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'faq_intro', 'richtext',
  '{"html": "<p>Clear answers about AIDI methodology, competitive positioning vs. monitoring tools, pricing, and more. Bloomberg-grade clarity for strategic decisions.</p>"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'faq';

-- =============================================================================
-- POSITIONING PAGE CONTENT BLOCKS (2 blocks)
-- =============================================================================

-- 1. Intro
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'positioning_intro', 'richtext',
  '{"html": "<p>Thanks to innovators like Searchable and Chris Donnelly, brands are waking up to the importance of AI visibility. As the AEO market matures, enterprises need strategic measurement—that is where AIDI comes in.</p>"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'aidi-vs-monitoring-tools';

-- 2. Comparison (simplified)
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'comparison_table', 'json',
  '{"monitoring": {"icon": "📊", "title": "Monitoring-Grade Tools", "description": "Tools like Searchable excel at daily practitioner monitoring", "pricing": "$99-999/month", "audience": "SEO practitioners"}, "benchmarking": {"icon": "🔬", "title": "Benchmark-Grade Intelligence", "description": "AIDI provides strategic benchmarking for executives", "pricing": "$2,500-10,000/audit", "audience": "C-suite executives"}, "conclusion": "Both are valuable. Use monitoring tools for daily tactics. Use AIDI for quarterly strategic validation."}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'aidi-vs-monitoring-tools';

-- =============================================================================
-- REPORTS LANDING PAGE CONTENT BLOCKS (3 blocks)
-- =============================================================================

-- 1. Hero Headline
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'reports_hero_headline', 'text',
  '{"text": "Monthly AI Brand Visibility Reports"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'reports-landing';

-- 2. Hero Description
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'reports_hero_description', 'richtext',
  '{"html": "<p>Track how leading AI models recommend brands across industries with statistical confidence intervals. Data-driven insights for CMOs and data scientists.</p>"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'reports-landing';

-- 3. Hero Badges
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'reports_hero_badges', 'json',
  '{"badges": ["4 AI Models Tracked", "95% Confidence Intervals", "Audit-Grade Data"]}'::jsonb, 3, true
FROM cms_pages WHERE slug = 'reports-landing';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Count blocks per page
SELECT 
  p.slug,
  COUNT(cb.id) as block_count
FROM cms_pages p
LEFT JOIN content_blocks cb ON cb.page_id = p.id
GROUP BY p.slug
ORDER BY p.slug;

-- Show homepage blocks
SELECT block_key, block_type FROM content_blocks cb
JOIN cms_pages p ON p.id = cb.page_id
WHERE p.slug = 'homepage'
ORDER BY display_order;

-- Success message
SELECT '✅ Content blocks inserted successfully!' as status;

