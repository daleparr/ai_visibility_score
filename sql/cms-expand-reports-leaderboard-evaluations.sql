-- =============================================================================
-- CMS EXPANSION: Industry Reports, Leaderboard & Evaluation Reports
-- Date: October 17, 2025
-- Purpose: Enable content management for all report and leaderboard sections
-- =============================================================================

-- =============================================================================
-- 1. LEADERBOARD PAGE CMS CONTENT
-- =============================================================================

-- Add leaderboard page if not exists
INSERT INTO cms_pages (slug, title, meta_title, meta_description, status, published_at)
VALUES (
  'leaderboards',
  'AI Discoverability Leaderboards',
  'AIDI Leaderboards - Brand Rankings Across Industries',
  'Real-time competitive intelligence. Track how brands rank in AI discoverability across sectors, industries, and niches. Updated daily with statistical validation.',
  'published',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Leaderboard: Hero Section
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'leaderboard_terminal_title', 'text',
  '{"text": "AI DISCOVERABILITY TERMINAL"}'::jsonb, 1, true
FROM cms_pages WHERE slug = 'leaderboards'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content,
  display_order = EXCLUDED.display_order;

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'leaderboard_status_badge', 'text',
  '{"text": "LIVE DATA FEED"}'::jsonb, 2, true
FROM cms_pages WHERE slug = 'leaderboards'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Leaderboard: FOMO Alert Bar
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'leaderboard_alert_bar', 'json',
  '{
    "icon": "⚡",
    "headline": "MARKET ALERT:",
    "message": "3 brands moved up this week • Rankings updated daily • Don't fall behind",
    "cta_text": "Track My Brand",
    "cta_url": "/evaluate"
  }'::jsonb, 10, true
FROM cms_pages WHERE slug = 'leaderboards'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Leaderboard: Lock Screen for Free Users
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'leaderboard_lock_screen', 'json',
  '{
    "headline": "Premium Leaderboards",
    "description": "Access competitive intelligence and industry rankings with Index Pro or Enterprise.",
    "cta_primary": {
      "text": "Upgrade to Index Pro - £119/month",
      "tier": "index-pro"
    },
    "cta_secondary": {
      "text": "View Demo",
      "url": "/demo"
    }
  }'::jsonb, 15, true
FROM cms_pages WHERE slug = 'leaderboards'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Leaderboard: Market Intelligence Cards
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'leaderboard_intelligence_cards', 'json',
  '{
    "cards": [
      {
        "id": "market-intelligence",
        "icon": "📊",
        "title": "Market Intelligence",
        "metrics": [
          {
            "label": "Sector Average",
            "value": "dynamic",
            "key": "averageScore"
          },
          {
            "label": "Top Performer",
            "value": "dynamic",
            "key": "topPerformer"
          },
          {
            "label": "Your Opportunity",
            "value": "+8-15 points",
            "highlight": true
          }
        ],
        "gradient": "from-blue-900 to-blue-800",
        "border": "blue-600"
      },
      {
        "id": "trending-analysis",
        "icon": "📈",
        "title": "Trending Analysis",
        "sections": [
          {
            "label": "Rising Stars",
            "type": "dynamic",
            "key": "trendingUp",
            "badge_style": "bg-green-700 text-green-100"
          },
          {
            "label": "Falling Behind",
            "type": "dynamic",
            "key": "trendingDown",
            "badge_style": "bg-red-700 text-red-100"
          }
        ],
        "gradient": "from-green-900 to-green-800",
        "border": "green-600"
      },
      {
        "id": "certification-hub",
        "icon": "🏆",
        "title": "Certification Hub",
        "badge": {
          "text": "Top 10%",
          "subtext": "AIDI Certification Available"
        },
        "cta": {
          "text": "Claim Your Badge",
          "action": "certification"
        },
        "gradient": "from-purple-900 to-purple-800",
        "border": "purple-600"
      }
    ]
  }'::jsonb, 30, true
FROM cms_pages WHERE slug = 'leaderboards'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Leaderboard: Market Overview Section
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'leaderboard_market_overview', 'json',
  '{
    "headline": "AI Discoverability Market Overview",
    "sectors": [
      {
        "emoji": "👕",
        "name": "Fashion & Apparel",
        "niches": 5,
        "avg_score": "78/100",
        "trend": "+2.3 this quarter",
        "trend_direction": "up"
      },
      {
        "emoji": "💄",
        "name": "Beauty & Personal Care",
        "niches": 4,
        "avg_score": "82/100",
        "trend": "+1.8 this quarter",
        "trend_direction": "up"
      },
      {
        "emoji": "🛍️",
        "name": "Multi-Brand Retail",
        "niches": 4,
        "avg_score": "85/100",
        "trend": "-0.5 this quarter",
        "trend_direction": "down"
      },
      {
        "emoji": "📱",
        "name": "Consumer Electronics",
        "niches": 3,
        "avg_score": "88/100",
        "trend": "+3.1 this quarter",
        "trend_direction": "up"
      }
    ]
  }'::jsonb, 40, true
FROM cms_pages WHERE slug = 'leaderboards'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Leaderboard: Executive Summary
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'leaderboard_executive_summary', 'json',
  '{
    "headline": "Executive Summary",
    "insights": [
      {
        "title": "Market Leaders",
        "color": "green-400",
        "description": "Top performers excel in schema implementation and knowledge graph presence. Average score gap between #1 and #10: 15 points."
      },
      {
        "title": "Opportunity Areas",
        "color": "orange-400",
        "description": "Conversational copy optimization shows biggest ROI potential. Brands improving this dimension see +8 point average gains."
      },
      {
        "title": "Market Dynamics",
        "color": "purple-400",
        "description": "AI visibility directly correlates with revenue growth. Top quartile brands show 23% higher customer acquisition."
      }
    ]
  }'::jsonb, 50, true
FROM cms_pages WHERE slug = 'leaderboards'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Leaderboard: Bottom CTA
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'leaderboard_bottom_cta', 'json',
  '{
    "headline": "Don't Get Left Behind",
    "subheadline": "Your competitors are already optimizing for AI. See where you rank.",
    "ctas": [
      {
        "text": "Get My AIDI Score",
        "icon": "⚡",
        "style": "primary",
        "url": "/evaluate",
        "for_tier": ["free", "index-pro"]
      },
      {
        "text": "Upgrade to Enterprise - £319",
        "icon": "🛡️",
        "style": "upgrade",
        "tier": "enterprise",
        "for_tier": ["index-pro"]
      },
      {
        "text": "View Sample Report",
        "icon": "🔗",
        "style": "secondary",
        "url": "/demo",
        "for_tier": ["free", "index-pro", "enterprise"]
      }
    ]
  }'::jsonb, 60, true
FROM cms_pages WHERE slug = 'leaderboards'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- =============================================================================
-- 2. INDUSTRY REPORTS PAGE CMS CONTENT (Individual Sector Reports)
-- =============================================================================

-- Add industry report template page
INSERT INTO cms_pages (slug, title, meta_title, meta_description, status, published_at)
VALUES (
  'industry-report-template',
  'Industry Report Template',
  'AI Visibility Report Template - Monthly Brand Rankings',
  'Template for monthly AI visibility reports showing how brands rank in AI recommendations with statistical validation.',
  'published',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Industry Report: Hero Section
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'industry_report_hero', 'json',
  '{
    "badge": {
      "text": "Monthly Report",
      "icon": "📊"
    },
    "headline_template": "{sector_name} AI Visibility Report",
    "subheadline_template": "{month} {year} Edition",
    "description": "<p>Track how leading AI models recommend brands in {sector_name}. Statistical analysis of {brand_count}+ brands with 95% confidence intervals.</p>"
  }'::jsonb, 1, true
FROM cms_pages WHERE slug = 'industry-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Industry Report: Beta Banner
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'industry_report_beta_banner', 'json',
  '{
    "enabled": true,
    "title": "🌟 BETA REPORT - FOUNDING MEMBER PRICING",
    "message": "This is a beta report using AIDI evaluation data. Subscribe now at £99/month (save £20). Price locks in for life. Beta ends Feb 28.",
    "cta": {
      "text": "Get Beta Access - £99/month",
      "url": "/pricing?tier=beta-pro"
    }
  }'::jsonb, 5, true
FROM cms_pages WHERE slug = 'industry-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Industry Report: Methodology Note
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'industry_report_methodology_note', 'richtext',
  '{
    "html": "<div class=\"border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r\"><h4 class=\"font-bold text-blue-900 mb-2\">ℹ️  BETA METHODOLOGY NOTE</h4><p class=\"text-blue-800 mb-3\">This beta report establishes brand rankings using AIDI evaluation scores (our audit-grade AI discoverability framework).</p><p class=\"text-blue-800 mb-3\"><strong>Full reports (launching February 2025) will add:</strong></p><ul class=\"list-disc list-inside text-blue-800 mb-3 space-y-1\"><li>Direct LLM probe data (GPT-4, Claude, Gemini, Perplexity)</li><li>20 prompts per sector measuring brand mentions</li><li>Statistical significance testing (p-values, CI)</li><li>Model-specific bias detection</li><li>Month-over-month trend analysis</li></ul><p class=\"text-blue-800 font-semibold\">Beta subscribers get automatic upgrade to full methodology at locked beta pricing.</p></div>"
  }'::jsonb, 10, true
FROM cms_pages WHERE slug = 'industry-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Industry Report: Key Insights Template
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'industry_report_key_insights', 'json',
  '{
    "headline": "Key Insights",
    "insights_template": [
      {
        "type": "top_performer",
        "icon": "👑",
        "title_template": "{brand_name} Leads the Pack",
        "description_template": "With an AIDI score of {score}/100, {brand_name} demonstrates excellence in {strength_area}."
      },
      {
        "type": "rising_star",
        "icon": "⭐",
        "title_template": "Watch {brand_name}",
        "description_template": "Gained {points} points this month, showing strong momentum in {improvement_area}."
      },
      {
        "type": "opportunity",
        "icon": "💡",
        "title_template": "Sector-Wide Gap",
        "description_template": "Average brands trail leaders by {gap} points. Primary opportunity: {opportunity_area}."
      }
    ]
  }'::jsonb, 20, true
FROM cms_pages WHERE slug = 'industry-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Industry Report: Leaderboard Section Headers
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'industry_report_leaderboard_headers', 'json',
  '{
    "table_title": "Complete Rankings",
    "columns": [
      {"key": "rank", "label": "Rank", "width": "w-16"},
      {"key": "brand", "label": "Brand", "width": "flex-1"},
      {"key": "aidi_score", "label": "AIDI Score", "width": "w-24"},
      {"key": "infrastructure", "label": "Infrastructure", "width": "w-28"},
      {"key": "perception", "label": "Perception", "width": "w-28"},
      {"key": "commerce", "label": "Commerce", "width": "w-28"},
      {"key": "trend", "label": "Trend", "width": "w-20"}
    ],
    "free_view_limit": 10,
    "lock_message": "Subscribe to see all {total_brands} brands"
  }'::jsonb, 30, true
FROM cms_pages WHERE slug = 'industry-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Industry Report: Statistical Summary
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'industry_report_stats_summary', 'json',
  '{
    "headline": "Statistical Summary",
    "metrics": [
      {
        "label": "Brands Analyzed",
        "key": "brand_count",
        "format": "number"
      },
      {
        "label": "Average Score",
        "key": "avg_score",
        "format": "score"
      },
      {
        "label": "Score Range",
        "key": "score_range",
        "format": "range"
      },
      {
        "label": "Confidence Level",
        "value": "95%",
        "format": "text"
      }
    ],
    "note": "All scores calculated using identical AIDI evaluation methodology for fair comparison."
  }'::jsonb, 40, true
FROM cms_pages WHERE slug = 'industry-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Industry Report: Pricing Tiers
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'industry_report_pricing', 'json',
  '{
    "headline": "Choose Your Access Level",
    "tiers": [
      {
        "id": "free-preview",
        "name": "Free Preview",
        "price": "$0",
        "period": "",
        "features": [
          "Executive summary",
          "Top 10 leaderboard",
          "1 month archive",
          "Statistical validation included"
        ],
        "cta": "View Free Report",
        "highlighted": false
      },
      {
        "id": "beta-pro",
        "name": "Beta Pro",
        "price": "£99",
        "period": "/sector/month",
        "original_price": "£119",
        "save": "Save £20/month",
        "badge": "BETA SPECIAL",
        "features": [
          "Complete leaderboard (50+ brands)",
          "95% confidence intervals",
          "12 month archive",
          "PDF downloads",
          "Beta price locks in forever"
        ],
        "cta": "Get Beta Access",
        "highlighted": true
      },
      {
        "id": "enterprise",
        "name": "Enterprise",
        "price": "£269",
        "period": "/sector/month",
        "original_price": "£319",
        "features": [
          "Brand-specific deep dives",
          "Custom competitor analysis",
          "API access",
          "Quarterly strategy calls",
          "M&A due diligence support"
        ],
        "cta": "Contact Sales",
        "highlighted": false
      }
    ]
  }'::jsonb, 50, true
FROM cms_pages WHERE slug = 'industry-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- =============================================================================
-- 3. EVALUATION REPORT CMS CONTENT (Individual Brand Reports)
-- =============================================================================

-- Add evaluation report template page
INSERT INTO cms_pages (slug, title, meta_title, meta_description, status, published_at)
VALUES (
  'evaluation-report-template',
  'AIDI Evaluation Report Template',
  'AIDI Evaluation Report - AI Discoverability Analysis',
  'Comprehensive AI discoverability evaluation report with scores across 12 dimensions and strategic recommendations.',
  'published',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Evaluation Report: Header Section
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'eval_report_header', 'json',
  '{
    "badge": {
      "text": "AIDI Evaluation Report",
      "icon": "📊"
    },
    "title_template": "{brand_name} AI Discoverability Analysis",
    "subtitle_template": "Complete evaluation across {dimension_count} dimensions",
    "metadata": [
      {"label": "Evaluation Date", "key": "evaluation_date"},
      {"label": "Evaluation ID", "key": "evaluation_id"},
      {"label": "Methodology Version", "value": "AIDI v1.2"}
    ]
  }'::jsonb, 1, true
FROM cms_pages WHERE slug = 'evaluation-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Evaluation Report: Executive Summary
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'eval_report_executive_summary', 'json',
  '{
    "headline": "Executive Summary",
    "score_card": {
      "overall_label": "Overall AIDI Score",
      "grade_labels": {
        "A+": "Exceptional AI Visibility",
        "A": "Excellent AI Visibility",
        "B+": "Strong AI Visibility",
        "B": "Good AI Visibility",
        "C": "Moderate AI Visibility",
        "D": "Limited AI Visibility",
        "F": "Minimal AI Visibility"
      }
    },
    "pillars_section": {
      "title": "Pillar Performance",
      "pillars": [
        {
          "key": "infrastructure",
          "name": "Infrastructure & Machine Readability",
          "icon": "⚡",
          "description": "How well AI systems can parse and understand your content"
        },
        {
          "key": "perception",
          "name": "Perception & Reputation",
          "icon": "🔍",
          "description": "How AI models perceive and describe your brand"
        },
        {
          "key": "commerce",
          "name": "Commerce & Customer Experience",
          "icon": "📊",
          "description": "How confidently AI can recommend and facilitate transactions"
        }
      ]
    }
  }'::jsonb, 10, true
FROM cms_pages WHERE slug = 'evaluation-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Evaluation Report: Competitive Context
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'eval_report_competitive_context', 'json',
  '{
    "headline": "Competitive Context",
    "description": "See how you compare to industry benchmarks and competitors.",
    "metrics": [
      {
        "label": "Industry Rank",
        "key": "industry_rank",
        "format": "rank_of_total",
        "tooltip": "Your position among all evaluated brands in your industry"
      },
      {
        "label": "Percentile",
        "key": "percentile",
        "format": "percentile",
        "tooltip": "Percentage of brands you outperform"
      },
      {
        "label": "Gap to Leader",
        "key": "gap_to_leader",
        "format": "points",
        "tooltip": "Points separating you from #1 ranked brand"
      },
      {
        "label": "Sector Average",
        "key": "sector_avg",
        "format": "score"
      }
    ]
  }'::jsonb, 20, true
FROM cms_pages WHERE slug = 'evaluation-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Evaluation Report: Strengths & Gaps
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'eval_report_strengths_gaps', 'json',
  '{
    "sections": [
      {
        "type": "strengths",
        "headline": "🏆 Key Strengths",
        "description": "Areas where you excel in AI discoverability",
        "card_style": "border-green-500 bg-green-50"
      },
      {
        "type": "gaps",
        "headline": "🎯 Priority Gaps",
        "description": "High-impact opportunities for improvement",
        "card_style": "border-orange-500 bg-orange-50"
      }
    ],
    "item_template": {
      "dimension_name": "{dimension}",
      "score": "{score}/100",
      "percentile": "{percentile}th percentile",
      "description": "{analysis}"
    }
  }'::jsonb, 30, true
FROM cms_pages WHERE slug = 'evaluation-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Evaluation Report: Detailed Dimension Scores
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'eval_report_dimension_details', 'json',
  '{
    "headline": "Detailed Dimension Analysis",
    "description": "In-depth evaluation across all 12 AIDI dimensions",
    "dimension_card_template": {
      "header": {
        "dimension_name": "{dimension}",
        "pillar": "{pillar}",
        "score": "{score}/100",
        "grade": "{grade}"
      },
      "body": {
        "what_we_tested": "Description of evaluation methodology for this dimension",
        "findings": "Key findings from the analysis",
        "impact": "Business impact of performance in this area"
      },
      "recommendations": {
        "title": "Recommended Actions",
        "priority": "High / Medium / Low",
        "items": []
      }
    }
  }'::jsonb, 40, true
FROM cms_pages WHERE slug = 'evaluation-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Evaluation Report: Action Plan
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'eval_report_action_plan', 'json',
  '{
    "headline": "90-Day Action Roadmap",
    "description": "Prioritized recommendations to improve your AI discoverability",
    "phases": [
      {
        "phase": "Quick Wins (Days 1-30)",
        "icon": "⚡",
        "description": "High-impact, low-effort improvements",
        "color": "green"
      },
      {
        "phase": "Strategic Initiatives (Days 31-60)",
        "icon": "🎯",
        "description": "Core infrastructure improvements",
        "color": "blue"
      },
      {
        "phase": "Advanced Optimization (Days 61-90)",
        "icon": "🚀",
        "description": "Competitive differentiators",
        "color": "purple"
      }
    ],
    "recommendation_format": {
      "title": "Action item title",
      "impact": "Expected score improvement",
      "effort": "Implementation effort level",
      "resources": "Required resources or tools"
    }
  }'::jsonb, 50, true
FROM cms_pages WHERE slug = 'evaluation-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Evaluation Report: Methodology Transparency
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'eval_report_methodology', 'richtext',
  '{
    "html": "<div class=\"border-t-2 border-slate-200 pt-8 mt-12\"><h3 class=\"text-2xl font-bold mb-4\">📚 Methodology & Validation</h3><p class=\"text-slate-700 mb-4\">This evaluation was conducted using AIDI v1.2, our peer-reviewed framework for measuring AI discoverability.</p><div class=\"grid md:grid-cols-3 gap-6\"><div><h4 class=\"font-semibold text-blue-900 mb-2\">🎯 Standardized Testing</h4><p class=\"text-sm text-slate-600\">Every brand evaluated with identical methodology. No user-defined prompts. Fair comparison across industries.</p></div><div><h4 class=\"font-semibold text-blue-900 mb-2\">📊 Statistical Rigor</h4><p class=\"text-sm text-slate-600\">Multi-run averaging with 95% confidence intervals. Test-retest reliability: r = 0.94</p></div><div><h4 class=\"font-semibold text-blue-900 mb-2\">✅ Peer-Reviewed</h4><p class=\"text-sm text-slate-600\">Published framework with academic validation. Third-party auditable results.</p></div></div><p class=\"text-sm text-slate-500 mt-6\">Full methodology documentation: <a href=\"/methodology\" class=\"text-blue-600 hover:underline\">aidi.com/methodology</a></p></div>"
  }'::jsonb, 60, true
FROM cms_pages WHERE slug = 'evaluation-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- Evaluation Report: Next Steps CTA
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT id, 'eval_report_next_steps', 'json',
  '{
    "headline": "Ready to Improve Your AI Visibility?",
    "options": [
      {
        "title": "Implementation Support",
        "description": "Get expert help implementing recommendations",
        "icon": "🤝",
        "cta": "Book Consultation",
        "url": "/contact?type=implementation"
      },
      {
        "title": "Re-evaluate in 90 Days",
        "description": "Track your progress with quarterly evaluations",
        "icon": "🔄",
        "cta": "Schedule Re-evaluation",
        "url": "/evaluate?mode=re-evaluation"
      },
      {
        "title": "Competitor Analysis",
        "description": "Benchmark against specific competitors",
        "icon": "⚔️",
        "cta": "Compare Competitors",
        "url": "/evaluate?mode=competitor-analysis"
      }
    ]
  }'::jsonb, 70, true
FROM cms_pages WHERE slug = 'evaluation-report-template'
ON CONFLICT (page_id, block_key) DO UPDATE SET
  content = EXCLUDED.content;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Count blocks per page
SELECT 
  p.slug,
  p.title,
  COUNT(cb.id) as block_count
FROM cms_pages p
LEFT JOIN content_blocks cb ON cb.page_id = p.id
WHERE p.slug IN ('leaderboards', 'industry-report-template', 'evaluation-report-template')
GROUP BY p.slug, p.title
ORDER BY p.slug;

-- List all leaderboard blocks
SELECT 
  block_key, 
  block_type,
  display_order
FROM content_blocks cb
JOIN cms_pages p ON p.id = cb.page_id
WHERE p.slug = 'leaderboards'
ORDER BY display_order;

-- List all industry report blocks
SELECT 
  block_key, 
  block_type,
  display_order
FROM content_blocks cb
JOIN cms_pages p ON p.id = cb.page_id
WHERE p.slug = 'industry-report-template'
ORDER BY display_order;

-- List all evaluation report blocks
SELECT 
  block_key, 
  block_type,
  display_order
FROM content_blocks cb
JOIN cms_pages p ON p.id = cb.page_id
WHERE p.slug = 'evaluation-report-template'
ORDER BY display_order;

-- Success message
DO $$
DECLARE
  leaderboard_count INTEGER;
  industry_count INTEGER;
  eval_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO leaderboard_count FROM content_blocks cb
  JOIN cms_pages p ON p.id = cb.page_id WHERE p.slug = 'leaderboards';
  
  SELECT COUNT(*) INTO industry_count FROM content_blocks cb
  JOIN cms_pages p ON p.id = cb.page_id WHERE p.slug = 'industry-report-template';
  
  SELECT COUNT(*) INTO eval_count FROM content_blocks cb
  JOIN cms_pages p ON p.id = cb.page_id WHERE p.slug = 'evaluation-report-template';
  
  RAISE NOTICE '✅ CMS Expansion Complete!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 Leaderboard Page: % blocks', leaderboard_count;
  RAISE NOTICE '📈 Industry Report Template: % blocks', industry_count;
  RAISE NOTICE '📋 Evaluation Report Template: % blocks', eval_count;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎯 You can now manage ALL copy through /admin/cms';
  RAISE NOTICE '💡 Next: Update frontend components to fetch from CMS';
END $$;

