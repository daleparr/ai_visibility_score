-- =============================================================================
-- Add CMS Control for Three Pillars & Value Proposition Cards
-- Makes all card copy editable via CMS
-- =============================================================================

-- Three Pillars Cards (Homepage/Evaluate page)
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT 
  p.id,
  'three_pillars_cards',
  'json',
  $${
    "heading": "Three Pillars of AI Visibility",
    "subheading": "Our evaluation framework tests how AI models discover, understand, and recommend your brand",
    "pillars": [
      {
        "number": "1",
        "icon": "🏗️",
        "title": "Infrastructure & Machine Readability",
        "subtitle": "Can AI parse and understand your brand's digital footprint?",
        "features": [
          "Schema & Structured Data Coverage",
          "Semantic Clarity & Disambiguation",
          "Ontologies & Taxonomy Structure",
          "Knowledge Graph Presence",
          "LLM Readability Optimization",
          "Conversational Copy Analysis"
        ]
      },
      {
        "number": "2",
        "icon": "🔍",
        "title": "Perception & Reputation",
        "subtitle": "Can AI explain why your brand matters?",
        "features": [
          "Geographic Visibility Testing",
          "Citation Strength Analysis",
          "AI Response Quality Assessment",
          "Sentiment & Trust Signals",
          "Brand Heritage Recognition"
        ]
      },
      {
        "number": "3",
        "icon": "🛒",
        "title": "Commerce & Customer Experience",
        "subtitle": "Can AI recommend and transact with confidence?",
        "features": [
          "Hero Product Identification",
          "Product Recommendation Accuracy",
          "Shipping & Delivery Clarity",
          "Return Policy Accessibility",
          "Competitive Positioning"
        ]
      }
    ]
  }$$::jsonb,
  5,
  true
FROM cms_pages p
WHERE p.slug = 'homepage'
ON CONFLICT (page_id, block_key) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();

-- Reports Page Value Props
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT 
  p.id,
  'reports_value_props',
  'json',
  $${
    "props": [
      {
        "icon": "📊",
        "title": "Brand Leaderboards",
        "description": "See how your brand ranks in AI recommendations vs. competitors. Track month-over-month changes."
      },
      {
        "icon": "🎯",
        "title": "Emerging Threats",
        "description": "Spot new competitors gaining AI visibility before they dominate your market."
      },
      {
        "icon": "💡",
        "title": "Actionable Insights",
        "description": "Get specific recommendations to improve your brand's AI discoverability."
      }
    ]
  }$$::jsonb,
  3,
  true
FROM cms_pages p
WHERE p.slug = 'reports-landing'
ON CONFLICT (page_id, block_key) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();

-- Reports Page CTA Section
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT 
  p.id,
  'reports_cta_section',
  'json',
  $${
    "headline": "Start with a Free Preview",
    "description": "Get executive summaries and top 10 brand rankings for any sector. Upgrade for full leaderboards, archive access, and PDF exports.",
    "button_text": "Browse Reports",
    "button_url": "#sectors"
  }$$::jsonb,
  10,
  true
FROM cms_pages p
WHERE p.slug = 'reports-landing'
ON CONFLICT (page_id, block_key) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();

-- Verification
SELECT 
  p.slug as page,
  cb.block_key,
  cb.block_type,
  cb.is_visible
FROM content_blocks cb
JOIN cms_pages p ON p.id = cb.page_id
WHERE cb.block_key IN ('three_pillars_cards', 'reports_value_props', 'reports_cta_section')
ORDER BY p.slug, cb.display_order;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Card Content Blocks Created!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📝 THREE PILLARS CARDS (Homepage):';
  RAISE NOTICE '   - Infrastructure & Machine Readability (6 features)';
  RAISE NOTICE '   - Perception & Reputation (5 features)';
  RAISE NOTICE '   - Commerce & Customer Experience (5 features)';
  RAISE NOTICE '   CMS Path: Page Content → Homepage → three_pillars_cards';
  RAISE NOTICE '';
  RAISE NOTICE '📝 VALUE PROPS (Reports page):';
  RAISE NOTICE '   - Brand Leaderboards';
  RAISE NOTICE '   - Emerging Threats';
  RAISE NOTICE '   - Actionable Insights';
  RAISE NOTICE '   CMS Path: Page Content → Industry Reports → reports_value_props';
  RAISE NOTICE '';
  RAISE NOTICE '📝 CTA SECTION (Reports page):';
  RAISE NOTICE '   - Headline: Start with a Free Preview';
  RAISE NOTICE '   - Description + button';
  RAISE NOTICE '   CMS Path: Page Content → Industry Reports → reports_cta_section';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 EDIT IN CMS:';
  RAISE NOTICE '   All card titles, descriptions, features now editable';
  RAISE NOTICE '   Changes appear immediately on frontend';
  RAISE NOTICE '';
END $$;

