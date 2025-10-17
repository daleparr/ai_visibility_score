-- =============================================================================
-- Evaluation Form Configuration - CMS Control
-- Make input field, button text, tiers, and subtext editable via CMS
-- =============================================================================

INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT 
  p.id,
  'evaluation_form_config',
  'json',
  $${
    "input": {
      "placeholder": "Enter your website URL (e.g., example.com)",
      "icon": "globe"
    },
    "button": {
      "text": "Get Benchmark Score",
      "text_analyzing": "Analyzing...",
      "icon": "arrow-right"
    },
    "subtext": {
      "items": [
        {"icon": "check", "text": "Quick scan"},
        {"icon": "check", "text": "2-day turnaround"},
        {"icon": "check", "text": "Baseline assessment"}
      ]
    },
    "tier_buttons": [
      {
        "tier_key": "quick-scan",
        "label": "Quick Scan",
        "price": "$499",
        "subtitle": "4 dimensions",
        "color": "green"
      },
      {
        "tier_key": "full-audit",
        "label": "💎 Full Audit",
        "price": "$2,500",
        "subtitle": "Board-Ready",
        "color": "brand",
        "highlight": true
      },
      {
        "tier_key": "enterprise",
        "label": "🏢 Enterprise",
        "price": "$10,000",
        "subtitle": "M&A Ready",
        "color": "purple"
      }
    ]
  }$$::jsonb,
  2,
  true
FROM cms_pages p
WHERE p.slug = 'homepage'
ON CONFLICT (page_id, block_key) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Evaluation Form Config Created!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎯 NOW EDITABLE IN CMS:';
  RAISE NOTICE '';
  RAISE NOTICE '📝 INPUT FIELD:';
  RAISE NOTICE '   - Placeholder text';
  RAISE NOTICE '   - Icon choice';
  RAISE NOTICE '';
  RAISE NOTICE '📝 BUTTON:';
  RAISE NOTICE '   - Button text ("Get Benchmark Score")';
  RAISE NOTICE '   - Analyzing state text';
  RAISE NOTICE '   - Icon';
  RAISE NOTICE '';
  RAISE NOTICE '📝 SUBTEXT:';
  RAISE NOTICE '   - Quick scan, 2-day turnaround, Baseline assessment';
  RAISE NOTICE '   - Add/remove/edit items';
  RAISE NOTICE '';
  RAISE NOTICE '📝 TIER BUTTONS:';
  RAISE NOTICE '   - Quick Scan: $499, 4 dimensions';
  RAISE NOTICE '   - Full Audit: $2,500, Board-Ready';
  RAISE NOTICE '   - Enterprise: $10,000, M&A Ready';
  RAISE NOTICE '   - Edit prices, labels, subtitles, colors';
  RAISE NOTICE '';
  RAISE NOTICE '🎨 CMS PATH:';
  RAISE NOTICE '   Page Content → Homepage → evaluation_form_config';
  RAISE NOTICE '   Edit JSON to change any text/config';
  RAISE NOTICE '   Changes appear immediately!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

