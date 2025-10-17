-- =============================================================================
-- Add Tier Access Control Fields
-- Enable paywall control for pricing tiers
-- =============================================================================

-- Add new columns to pricing_tiers
ALTER TABLE pricing_tiers 
ADD COLUMN IF NOT EXISTS requires_auth BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_level VARCHAR(50) DEFAULT 'public';
-- access_level: 'public', 'authenticated', 'paid_only', 'admin_only'

-- Add comments for clarity
COMMENT ON COLUMN pricing_tiers.requires_auth IS 'If true, user must be logged in to see/purchase this tier';
COMMENT ON COLUMN pricing_tiers.access_level IS 'public = anyone, authenticated = logged in, paid_only = existing customers, admin_only = admin view only';
COMMENT ON COLUMN pricing_tiers.is_visible_public IS 'If true, shows on public pricing page (but may require auth to purchase)';

-- Update existing tiers with sensible defaults
UPDATE pricing_tiers SET
  requires_auth = false,
  access_level = 'public'
WHERE tier_key IN ('quick-scan', 'full-audit', 'protected-site', 'enterprise-package');

-- Set monthly subscriptions to require authentication (upsell path)
UPDATE pricing_tiers SET
  requires_auth = true,
  access_level = 'authenticated'
WHERE tier_key IN ('index-pro-monthly', 'enterprise-monthly');

-- Example: Hide Index Pro & Enterprise from public, show only to authenticated users
UPDATE pricing_tiers SET
  is_visible_public = false,  -- Don't show on public pricing page
  requires_auth = true,        -- Require login to see
  access_level = 'authenticated'  -- Only show to logged-in users
WHERE tier_key IN ('index-pro-monthly', 'enterprise-monthly');

-- Keep one-time tiers visible publicly for lead generation
UPDATE pricing_tiers SET
  is_visible_public = true,
  requires_auth = false,
  access_level = 'public'
WHERE tier_key IN ('quick-scan', 'full-audit');

-- Verification
SELECT 
  tier_name,
  price_amount,
  is_visible_public,
  requires_auth,
  access_level,
  CASE 
    WHEN is_visible_public = true AND requires_auth = false THEN '🌐 Public (Anyone can see & buy)'
    WHEN is_visible_public = true AND requires_auth = true THEN '🔒 Public listing but requires login to buy'
    WHEN is_visible_public = false AND requires_auth = true THEN '🔐 Authenticated only (paywall)'
    WHEN access_level = 'paid_only' THEN '💎 Existing customers only (upsell)'
    ELSE '❓ Custom config'
  END as visibility_status
FROM pricing_tiers
ORDER BY display_order;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tier Access Control Added!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🌐 PUBLIC TIERS (Free lead generation):';
  RAISE NOTICE '   - Quick Scan (£499)';
  RAISE NOTICE '   - Full Audit (£2,500)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 AUTHENTICATED ONLY (Behind paywall - upsell):';
  RAISE NOTICE '   - Index Pro Monthly (£119/month)';
  RAISE NOTICE '   - Enterprise Monthly (£319/month)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 STRATEGY:';
  RAISE NOTICE '   Public users see one-time tiers → sign up → complete eval';
  RAISE NOTICE '   After evaluation → shown monthly tiers as upsell';
  RAISE NOTICE '   Drives free→paid conversion funnel';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

