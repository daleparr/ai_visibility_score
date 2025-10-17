-- CMS Content Blocks for Blog and Careers Pages
-- All content managed through CMS, not direct table inserts
-- Date: October 16, 2025

-- =============================================================================
-- CREATE BLOG PAGE IN CMS
-- =============================================================================

INSERT INTO cms_pages (slug, title, meta_title, meta_description, status, published_at)
VALUES (
  'blog',
  'AIDI Blog',
  'AIDI Blog - Data-Driven Insights on AEO and AI Visibility',
  'Bloomberg-grade insights on Answer Engine Optimization, benchmarking methodology, and AI visibility trends. Statistical analysis with peer-reviewed rigor.',
  'published',
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();

-- =============================================================================
-- BLOG PAGE CONTENT BLOCKS
-- =============================================================================

-- Delete existing blog blocks
DELETE FROM content_blocks WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'blog');

-- 1. Blog Hero
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'blog_title', 'text',
  '{"text": "AIDI Blog"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'blog';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'blog_description', 'text',
  '{"text": "Insights on AEO, benchmarking methodology, and AI visibility trends"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'blog';

-- 2. Featured Blog Posts (as content blocks)
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'blog_posts', 'json',
  '{
    "posts": [
      {
        "slug": "why-benchmark-grade-measurement-matters",
        "title": "Why Benchmark-Grade Measurement Matters: Beyond Monitoring Tools",
        "excerpt": "Our October analysis of 2,400 LLM responses across 4 models reveals why enterprises need systematic benchmarking, not just daily monitoring.",
        "category": "AEO Insights",
        "published_at": "October 9, 2025",
        "featured": true,
        "tags": ["benchmarking", "methodology", "statistical-validation"],
        "content": "# Why Benchmark-Grade Measurement Matters\n\nOur October analysis of 2,400 LLM responses across 4 models shows a clear pattern: brands that measure systematically outperform those that only monitor tactically.\n\n## The Data\n\n**Sample Size:** n=2,400 evaluations\n**Models Tested:** GPT-4, Claude-3, Gemini Pro, Perplexity\n**Statistical Confidence:** 95% CI\n**Significance Level:** p<0.01\n\n## Key Finding\n\nBrands using systematic benchmarking (industry percentiles, statistical validation) showed 23% higher AI visibility scores compared to brands using monitoring-only approaches (95% CI: 18%-28%, n=120 brands, p<0.001).\n\n## Why This Matters\n\nMonitoring tools excel at daily feedback, while benchmark intelligence enables strategic decisions.\n\nThanks to category leaders like Searchable, brands now understand AEO importance. As the market matures, demand for both monitoring (daily) and benchmarking (quarterly) grows.\n\nUse both. Different tools, different purposes, both valuable."
      },
      {
        "slug": "the-problem-with-branded-queries",
        "title": "The Problem with Branded Queries: Why User-Defined Prompts Create False Positives",
        "excerpt": "Statistical analysis shows user-defined prompts with brand names inflate visibility scores by 40-60 percentage points.",
        "category": "Methodology",
        "published_at": "October 2, 2025",
        "featured": false,
        "tags": ["bias-free-testing", "methodology"],
        "content": "# The Problem with Branded Queries\n\n## The Issue\n\nMany AEO tools allow prompts like \"best Nike running shoes\" - your brand is IN the prompt!\n\n## Our Data\n\n**Branded prompts:** Nike mentioned 94%\n**Unbranded prompts:** Nike mentioned 47%\n**Difference:** 47 percentage points (p<0.001, n=150)\n\n## The AIDI Approach\n\nGeneric queries where brands must EARN the mention based on merit.\n\nFor board presentations and M&A due diligence, you need metrics you can defend."
      },
      {
        "slug": "using-aidi-and-searchable-together",
        "title": "How to Use AIDI and Searchable Together: A Complementary Approach",
        "excerpt": "Why sophisticated AEO programs use both monitoring tools and benchmark intelligence.",
        "category": "Strategic Guides",
        "published_at": "October 6, 2025",
        "featured": false,
        "tags": ["searchable", "complementary-tools", "enterprise"],
        "content": "# Using AIDI and Searchable Together\n\n## Why Both Matter\n\nThanks to Chris Donnelly and Searchable, brands now understand AEO importance.\n\n**Monthly (Searchable):** SEO team monitors daily, tests content, tracks competitors\n\n**Quarterly (AIDI):** CMO presents to board with statistical validation, CFO approves $750K investment\n\nComplementary, not competitive. Both valuable."
      }
    ]
  }'::jsonb, 10, true
FROM cms_pages WHERE slug = 'blog';

-- =============================================================================
-- CREATE CAREERS PAGE IN CMS
-- =============================================================================

INSERT INTO cms_pages (slug, title, meta_title, meta_description, status, published_at)
VALUES (
  'careers',
  'Careers at AIDI',
  'Careers at AIDI - Join the Benchmark Standard Team',
  'Join AIDI and help build the benchmark standard for AEO intelligence. Work with data scientists, executives, and industry leaders on strategic AI visibility measurement.',
  'published',
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();

-- =============================================================================
-- CAREERS PAGE CONTENT BLOCKS
-- =============================================================================

-- Delete existing careers blocks
DELETE FROM content_blocks WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'careers');

-- 1. Careers Hero
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'careers_title', 'text',
  '{"text": "Join the AIDI Team"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'careers';

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'careers_description', 'text',
  '{"text": "Help us build the benchmark standard for AEO intelligence. Work with data scientists, executives, and industry leaders."}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'careers';

-- 2. Job Postings (as content blocks)
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'job_postings', 'json',
  '{
    "positions": [
      {
        "slug": "senior-data-scientist-aeo-research",
        "title": "Senior Data Scientist - AEO Research",
        "department": "Data Science & Research",
        "location": "Remote (US/UK)",
        "employment_type": "Full-time",
        "experience_level": "Senior",
        "salary_range": "$140,000-$180,000 + equity",
        "description": "Lead our statistical validation framework and peer-review methodology. Design experiments, validate benchmarks, and ensure institutional-grade rigor. Your work will be cited in board presentations and M&A due diligence.",
        "requirements": [
          "5+ years in data science with focus on statistical validation",
          "PhD in Statistics, Computer Science, or equivalent experience",
          "Expert in confidence intervals, p-values, experimental design",
          "Published research or peer-reviewed papers preferred",
          "Python/R proficiency for statistical analysis"
        ],
        "apply_email": "careers@aidi.com",
        "status": "open"
      },
      {
        "slug": "research-engineer-methodology",
        "title": "Research Engineer - Methodology Infrastructure",
        "department": "Engineering",
        "location": "Remote (Global)",
        "employment_type": "Full-time",
        "experience_level": "Mid-Senior",
        "salary_range": "$120,000-$160,000 + equity",
        "description": "Build the technical infrastructure for AIDI peer-reviewed benchmarking. Create systems for multi-model testing, statistical validation, and reproducibility at scale.",
        "requirements": [
          "3+ years software engineering with data pipelines",
          "Strong Python and TypeScript skills",
          "PostgreSQL and large-scale data processing",
          "API integration (OpenAI, Anthropic, etc.)",
          "Understanding of statistical concepts"
        ],
        "apply_email": "careers@aidi.com",
        "status": "open"
      },
      {
        "slug": "enterprise-account-executive",
        "title": "Enterprise Account Executive - Strategic Sales",
        "department": "Business Development",
        "location": "Remote (US preferred)",
        "employment_type": "Full-time",
        "experience_level": "Senior",
        "salary_range": "$100,000-$140,000 base + $100K+ commission",
        "description": "Sell audit-grade intelligence for strategic decisions affecting $500K-$50M budgets. Position AIDI as complementary to monitoring tools. Target: CMOs, CDOs, PE principals. Average deal: $5,000+",
        "requirements": [
          "5+ years selling to C-suite/executive buyers",
          "Experience selling high-ticket ($2,500+) products",
          "Consultative sales approach (not transactional)",
          "Comfortable discussing statistical validation",
          "$500K+ annual quota achievement track record"
        ],
        "apply_email": "careers@aidi.com",
        "status": "open"
      },
      {
        "slug": "head-of-methodology",
        "title": "Head of Methodology - Build the Benchmark Standard",
        "department": "Data Science & Research",
        "location": "Remote (US/UK preferred)",
        "employment_type": "Full-time",
        "experience_level": "Lead/Director",
        "salary_range": "$180,000-$240,000 + significant equity",
        "description": "Lead AIDI transformation into the Bloomberg Terminal of AEO intelligence. Build peer-reviewed methodology. Coordinate academic partnerships. Present at conferences. Make AIDI data the standard citation in industry publications.",
        "requirements": [
          "10+ years in data science, research, or statistical analysis",
          "PhD in Statistics, Economics, Computer Science, or related",
          "Published research (peer-reviewed journals or industry reports)",
          "Experience building methodologies for institutional buyers",
          "Strong leadership and team-building skills"
        ],
        "apply_email": "careers@aidi.com",
        "status": "open"
      }
    ]
  }'::jsonb, 10, true
FROM cms_pages WHERE slug = 'careers';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Count content blocks
SELECT 
  p.slug,
  COUNT(cb.id) as block_count
FROM cms_pages p
LEFT JOIN content_blocks cb ON cb.page_id = p.id
WHERE p.slug IN ('blog', 'careers')
GROUP BY p.slug
ORDER BY p.slug;

-- Show blog blocks
SELECT block_key, block_type 
FROM content_blocks cb
JOIN cms_pages p ON p.id = cb.page_id
WHERE p.slug = 'blog';

-- Show careers blocks
SELECT block_key, block_type 
FROM content_blocks cb
JOIN cms_pages p ON p.id = cb.page_id
WHERE p.slug = 'careers';

-- Success
SELECT '✅ Blog and Careers content blocks created via CMS!' as status;

