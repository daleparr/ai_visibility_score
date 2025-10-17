-- =============================================================================
-- Homepage Variant Control - Switch Between Full and Minimal Designs
-- A/B test different homepage approaches without losing content
-- =============================================================================

-- Add homepage variant setting to CMS theme settings
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT 
  p.id,
  'homepage_variant',
  'json',
  $${
    "active_variant": "full",
    "variants": {
      "full": {
        "name": "Full Homepage",
        "description": "Complete homepage with features, pricing, pillars, trust indicators. Information-rich for SEO and thorough buyers.",
        "conversion_focus": "Educate and convert through comprehensive value proposition"
      },
      "minimal": {
        "name": "Minimal/Bloomberg Style",
        "description": "Spacious, empty homepage with single prominent URL input. Premium feel, focus on immediate action.",
        "conversion_focus": "Maximum simplicity for C-level buyers and fast activation"
      }
    },
    "notes": "Toggle in CMS → Theme Editor → Homepage Variant to switch designs. Both variants use same evaluation backend."
  }$$::jsonb,
  999,
  true
FROM cms_pages p
WHERE p.slug = 'homepage'
ON CONFLICT (page_id, block_key) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();

-- Verification
SELECT content->'active_variant' as current_variant, content->'variants' as available_variants
FROM content_blocks cb
JOIN cms_pages p ON p.id = cb.page_id
WHERE p.slug = 'homepage' AND cb.block_key = 'homepage_variant';

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Homepage Variant Control Created!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎨 HOMEPAGE VARIANTS:';
  RAISE NOTICE '';
  RAISE NOTICE '1️⃣  FULL (Current Default):';
  RAISE NOTICE '   - Feature sections, Three Pillars cards';
  RAISE NOTICE '   - Dynamic pricing cards';
  RAISE NOTICE '   - Trust indicators, logos';
  RAISE NOTICE '   - Information-rich, SEO-optimized';
  RAISE NOTICE '   Best for: Thorough buyers, SEO, education';
  RAISE NOTICE '';
  RAISE NOTICE '2️⃣  MINIMAL (Bloomberg Style):';
  RAISE NOTICE '   - Spacious white background';
  RAISE NOTICE '   - Single prominent URL input';
  RAISE NOTICE '   - 3 trust signals only';
  RAISE NOTICE '   - AI model logos below input';
  RAISE NOTICE '   - Everything else below fold';
  RAISE NOTICE '   Best for: C-level buyers, premium feel, fast activation';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 HOW TO SWITCH:';
  RAISE NOTICE '   CMS → Page Content → Homepage → Edit homepage_variant';
  RAISE NOTICE '   Change "active_variant": "full" → "minimal"';
  RAISE NOTICE '   Save → Homepage switches instantly!';
  RAISE NOTICE '';
  RAISE NOTICE '💡 A/B TESTING:';
  RAISE NOTICE '   Test minimal for 1 week, measure conversion';
  RAISE NOTICE '   Compare to full version';
  RAISE NOTICE '   Choose winner based on data';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

