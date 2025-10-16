-- CMS Content Blocks Only - Insert Missing Blocks
-- Run this if the main migration only created pages but not blocks
-- Date: October 16, 2025

-- First, let's clear any existing blocks and start fresh
DELETE FROM content_blocks WHERE page_id IN (
  SELECT id FROM cms_pages WHERE slug IN (
    'homepage', 'methodology', 'faq', 'aidi-vs-monitoring-tools', 'reports-landing'
  )
);

-- =============================================================================
-- HOMEPAGE CONTENT BLOCKS (15 blocks)
-- =============================================================================

-- Hero Section (5 blocks)
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'hero_badge', 'text', 
  '{"text": "✓ Available Now - No Waitlist"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'homepage';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'hero_headline', 'text',
  '{"text": "The Benchmark Standard for AEO Intelligence"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'homepage';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'hero_subhead', 'text',
  '{"text": "Scientifically rigorous. Statistically validated. Board-ready insights."}'::jsonb, 3, true
FROM cms_pages WHERE slug = 'homepage';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'hero_description', 'richtext',
  '{"html": "<p>While monitoring tools provide quick feedback, AIDI delivers the systematic benchmarking enterprises need for strategic decisions.</p>"}'::jsonb, 4, true
FROM cms_pages WHERE slug = 'homepage';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'trust_indicators', 'json',
  '{"items": ["✓ Peer-Reviewed Methodology", "✓ Industry Benchmarked", "✓ Statistical Confidence Intervals", "✓ Built by Data Scientists"]}'::jsonb, 5, true
FROM cms_pages WHERE slug = 'homepage';

-- Pricing Section (1 block with all tiers)
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'pricing_tiers', 'json',
  '{"tiers": [{"id": "quick-scan", "name": "Quick Scan", "price": "$499", "description": "Rapid 4-dimension baseline assessment", "features": ["2-minute evaluation", "Core AEO dimensions", "Quick benchmark score", "Upgrade recommendation"], "cta": "Start Quick Scan", "highlight": false}, {"id": "full-audit", "name": "Full Audit", "price": "$2,500", "badge": "Most Popular", "description": "Comprehensive 12-dimension strategic assessment", "features": ["Complete AEO evaluation", "Industry percentile ranking", "Statistical confidence intervals", "Competitive benchmarking", "Board-ready reporting", "90-day action roadmap"], "cta": "Get Full Audit", "highlight": true}, {"id": "protected-site", "name": "Protected Site Audit", "price": "$5,000", "description": "Human-assisted deep crawl with credentials", "features": ["Everything in Full Audit, plus:", "Password-protected site access", "Staging environment analysis", "Pre-launch evaluation", "Member portal review", "Data scientist-conducted audit"], "cta": "Schedule Deep Audit", "highlight": false}, {"id": "enterprise", "name": "Enterprise Package", "price": "$10,000", "description": "Strategic intelligence for major decisions", "features": ["Everything in Protected Site, plus:", "5+ competitor deep analysis", "M&A due diligence focus", "Executive presentation prep", "Implementation consulting (4 hrs)", "Quarterly re-evaluation included"], "cta": "Contact Sales", "highlight": false}]}'::jsonb, 40, true
FROM cms_pages WHERE slug = 'homepage';

-- Footer (1 block)
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'footer_about', 'richtext',
  '{"html": "<p>The AI Discoverability Index (AIDI) provides the benchmark standard for measuring brand visibility in AI-powered answer engines.</p><p>Built by data scientists for executives who need audit-grade results for strategic decisions—board presentations, M&A due diligence, and investment planning.</p><p>We''re grateful to category leaders like Searchable for raising awareness about AEO. As the market matures, AIDI provides the systematic measurement standard that enterprises require.</p>"}'::jsonb, 100, true
FROM cms_pages WHERE slug = 'homepage';

-- =============================================================================
-- METHODOLOGY PAGE CONTENT BLOCKS (3 blocks)
-- =============================================================================

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'methodology_intro', 'richtext',
  '{"html": "<p>Our testing methodology is publicly available, peer-reviewable, and follows research-grade protocols. Unlike proprietary \"black box\" approaches, every AIDI methodology is publicly auditable—because trust requires transparency.</p>"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'methodology';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'methodology_version', 'json',
  '{"version": "1.2", "published": "October 2025", "last_updated": "October 15, 2025"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'methodology';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'core_principles', 'json',
  '{"headline": "Five Pillars of Scientific Rigor", "principles": [{"id": "standardized-tests", "icon": "🎯", "title": "Standardized Tests", "description": "Every brand tested identically. No user-defined prompts. No branded queries. Fair comparison across industries.", "why_matters": "User-customizable tests create incomparable data. To benchmark fairly, every brand must face identical evaluation criteria.", "implementation": ["Fixed prompt library (100+ standardized queries)", "Locked test framework (version controlled)", "No brand names in baseline prompts", "Category-level language only"], "stat_rigor": "Test-Retest Reliability: r = 0.94 (95% CI: 0.91-0.96)"}, {"id": "unbiased-queries", "icon": "🔍", "title": "Unbiased Queries", "description": "Generic, category-level language that reflects real buyer behavior.", "problem_example": "Prompt: \"best Nike shoes\" ❌ Brand is IN the prompt", "solution_example": "Prompt: \"best running shoes under $150\" ✓ Brand must earn mention", "approach": ["Generic product category queries", "Budget-constrained searches", "Use-case specific prompts"]}, {"id": "multi-run-averaging", "icon": "📊", "title": "Multi-Run Averaging", "description": "3+ runs per dimension with statistical confidence intervals.", "why_matters": "AI models exhibit stochastic behavior—the same prompt can yield different responses.", "protocol": ["Minimum 3 runs per prompt", "Statistical averaging with CI calculation", "Outlier detection and handling"], "formula": "95% CI = Mean ± (1.96 × SE)"}, {"id": "industry-baselines", "icon": "🏆", "title": "Industry Baselines", "description": "Percentile rankings (1st-99th) across 15+ industries.", "problem": "Your score: 67 ← What does this mean?", "solution": "Your score: 67 (42nd percentile in SaaS) - trailing leaders by 18 points"}, {"id": "peer-reviewed", "icon": "📚", "title": "Peer-Reviewed", "description": "Published framework with academic validation. Third-party auditable.", "why_matters": "For institutional buyers—boards, CFOs, auditors—you need externally verified methodology."}]}'::jsonb, 10, true
FROM cms_pages WHERE slug = 'methodology';

-- =============================================================================
-- FAQ PAGE CONTENT BLOCKS (1 block with all categories)
-- =============================================================================

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'faq_categories', 'json',
  '{"categories": [{"name": "Competitive Positioning", "questions": [{"id": "searchable-difference", "question": "How is AIDI different from Searchable?", "answer": "<p>Great question! Searchable and AIDI serve complementary needs:</p><p><strong>SEARCHABLE: Daily Monitoring</strong><br>Quick feedback, user-customizable tests, subscription pricing ($99-999/month)</p><p><strong>AIDI: Strategic Benchmarking</strong><br>Statistical validation, industry percentiles, per-audit pricing ($2,500-10,000)</p><p>Many customers use BOTH: Searchable for day-to-day monitoring, AIDI for quarterly strategic validation. Think: Fitbit (daily) + Clinical bloodwork (quarterly).</p>"}, {"id": "use-instead", "question": "Can I use AIDI instead of Searchable?", "answer": "<p>You could, but we don''t recommend it.</p><p>Searchable excels at daily monitoring, tactical optimization, and practitioner workflows.</p><p>AIDI excels at quarterly validation, board presentations, and M&A due diligence.</p><p>They''re complementary, not competitive.</p>"}]}, {"name": "Methodology & Rigor", "questions": [{"id": "audit-grade", "question": "What do you mean by ''audit-grade'' rigor?", "answer": "<p>Audit-grade means results you can defend to boards, CFOs, and auditors:</p><ul><li>Reproducible: Same test, same result (±3 points at 95% confidence)</li><li>Statistically Validated: Confidence intervals, p-values reported</li><li>Benchmarked: Industry percentiles, not isolated scores</li><li>Peer-Reviewed: Published methodology, third-party auditable</li></ul><p>When presenting to the board or evaluating M&A targets, you need audit-grade rigor, not monitoring-grade estimates.</p>"}, {"id": "bias-free", "question": "What does ''bias-free testing'' mean?", "answer": "<p>Bias-free means your brand must earn mentions based on merit, not prompt engineering.</p><p><strong>THE PROBLEM:</strong> User prompts like \"best Nike running shoes\" include the brand name (artificial inflation).</p><p><strong>AIDI APPROACH:</strong> Generic queries like \"best running shoes under $150\" where brand must earn the mention.</p><p>You get TRUE competitive positioning, not inflated scores.</p>"}]}, {"name": "Pricing & Value", "questions": [{"id": "why-expensive", "question": "Why is AIDI more expensive than monitoring tools?", "answer": "<p>Strategic pricing reflects strategic value.</p><p>Monitoring tools ($99-999/month): Designed for ongoing access and practitioner budgets.</p><p>AIDI ($2,500-10,000/audit): Designed for strategic decisions and executive budgets.</p><p><strong>VALUE CONTEXT:</strong></p><ul><li>$2,500 audit influences $500K marketing investment → 0.5% of budget</li><li>$10,000 audit informs $15M M&A decision → 0.07% of deal size</li><li>$5,000 audit prevents $2M valuation mistake → 2.5X ROI</li></ul>"}}]}]}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'faq';

-- =============================================================================
-- POSITIONING PAGE CONTENT BLOCKS (2 blocks)
-- =============================================================================

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'positioning_intro', 'richtext',
  '{"html": "<p>Thanks to innovators like Searchable and Chris Donnelly, brands are waking up to the importance of AI visibility. As the AEO market matures, enterprises face a new question: How do I measure this strategically?</p><p>That''s where AIDI comes in—not to replace monitoring tools, but to complement them with systematic benchmarking.</p>"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'aidi-vs-monitoring-tools';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'comparison_table', 'json',
  '{"monitoring": {"icon": "📊", "title": "Monitoring-Grade Tools", "description": "Tools like Searchable excel at daily practitioner monitoring:", "strengths": ["Quick feedback on changes", "Tactical alert systems", "User-customizable tests", "Subscription pricing ($99-999/mo)"], "perfect_for": "Day-to-day optimization", "audience": "SEO/marketing practitioners", "pricing": "$99-999/month subscriptions"}, "benchmarking": {"icon": "🔬", "title": "Benchmark-Grade Intelligence", "description": "AIDI provides strategic benchmarking for executives:", "strengths": ["Industry percentile rankings", "Statistical validation (CI, p-values)", "Peer-reviewed methodology", "Strategic pricing ($2,500-10,000)"], "perfect_for": "Board presentations, M&A, strategy", "audience": "C-suite executives, data scientists", "pricing": "$2,500-10,000 per strategic audit"}, "conclusion": "<p><strong>Both are valuable. Neither is replaceable.</strong></p><p>Use monitoring tools for daily tactics. Use AIDI for quarterly strategic validation.</p><p>When the decision matters—board presentations, M&A due diligence, vendor selection—you need benchmark-grade rigor, not monitoring-grade alerts.</p>"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'aidi-vs-monitoring-tools';

-- =============================================================================
-- REPORTS LANDING PAGE CONTENT BLOCKS (4 blocks)
-- =============================================================================

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'reports_hero_headline', 'text',
  '{"text": "Monthly AI Brand Visibility Reports"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'reports-landing';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'reports_hero_description', 'richtext',
  '{"html": "<p>Track how leading AI models recommend brands across industries with statistical confidence intervals. Data-driven insights for CMOs, brand strategists, and data scientists.</p>"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'reports-landing';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'reports_hero_badges', 'json',
  '{"badges": ["4 AI Models Tracked", "95% Confidence Intervals", "Audit-Grade Data"]}'::jsonb, 3, true
FROM cms_pages WHERE slug = 'reports-landing';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'reports_value_props', 'json',
  '{"props": [{"icon": "📊", "title": "Industry Percentile Rankings", "description": "See how your brand ranks vs. competitors with statistical validation. Know exactly where you stand: 42nd percentile, trailing leaders by 18 points."}, {"icon": "🎯", "title": "Statistical Confidence", "description": "All data reported with 95% confidence intervals, sample sizes (n=X), and p-values. Reproducible methodology you can defend to boards."}, {"icon": "💡", "title": "Strategic Insights", "description": "Data-driven recommendations grounded in empirical evidence. Our October analysis of 2,400 responses shows Nike gained 12 percentage points (p<0.01)."}]}'::jsonb, 10, true
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
DO $$
BEGIN
  RAISE NOTICE '✅ Content blocks inserted successfully!';
  RAISE NOTICE '📊 Expected counts: homepage=7, methodology=3, faq=1, positioning=2, reports=4';
END $$;

