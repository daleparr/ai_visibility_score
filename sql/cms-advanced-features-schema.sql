-- =============================================================================
-- CMS ADVANCED FEATURES: Tier Management, User Profiles, Stripe Invoicing
-- Date: October 17, 2025
-- Features: Custom pricing tiers, user access control, branded invoicing
-- =============================================================================

-- =============================================================================
-- 1. PRICING TIERS & PACKAGES MANAGEMENT
-- =============================================================================

-- Pricing tiers (predefined + custom)
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key VARCHAR(100) UNIQUE NOT NULL, -- 'quick-scan', 'full-audit', 'custom-enterprise-acme'
  tier_name VARCHAR(255) NOT NULL,
  tier_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'custom', 'legacy'
  price_amount DECIMAL(10,2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'GBP',
  billing_period VARCHAR(50), -- 'one-time', 'monthly', 'annual'
  is_active BOOLEAN DEFAULT true,
  is_visible_public BOOLEAN DEFAULT true, -- Show on pricing page
  is_custom BOOLEAN DEFAULT false, -- Custom package for specific customer
  custom_for_user_id UUID REFERENCES users(id), -- If custom, which customer
  stripe_price_id VARCHAR(255), -- Stripe Price ID for billing
  display_order INTEGER DEFAULT 0,
  badge_text VARCHAR(100), -- 'Most Popular', 'Best Value', 'Enterprise'
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features (reusable feature library)
CREATE TABLE IF NOT EXISTS tier_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key VARCHAR(100) UNIQUE NOT NULL, -- 'aidi-score', 'industry-percentile', 'api-access'
  feature_name VARCHAR(255) NOT NULL,
  feature_category VARCHAR(100), -- 'evaluation', 'reporting', 'support', 'data-access'
  description TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tier-Feature mapping (which features in which tiers)
CREATE TABLE IF NOT EXISTS tier_feature_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID REFERENCES pricing_tiers(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES tier_features(id) ON DELETE CASCADE,
  is_included BOOLEAN DEFAULT true, -- true = included, false = excluded/limited
  feature_limit VARCHAR(100), -- '10 evaluations/month', 'unlimited', '5 users'
  display_order INTEGER DEFAULT 0,
  UNIQUE(tier_id, feature_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_active ON pricing_tiers(is_active, is_visible_public);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_custom ON pricing_tiers(is_custom, custom_for_user_id);
CREATE INDEX IF NOT EXISTS idx_tier_features_category ON tier_features(feature_category);
CREATE INDEX IF NOT EXISTS idx_tier_mapping_tier ON tier_feature_mapping(tier_id);

-- =============================================================================
-- 2. USER PROFILES & ACCESS MANAGEMENT
-- =============================================================================

-- Enhanced user profiles (extends existing users table)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  job_title VARCHAR(255),
  phone VARCHAR(50),
  avatar_url VARCHAR(500),
  bio TEXT,
  linkedin_url VARCHAR(500),
  twitter_handle VARCHAR(100),
  website_url VARCHAR(500),
  timezone VARCHAR(100) DEFAULT 'Europe/London',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles and permissions
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'editor', 'viewer', 'customer', 'collaborator'
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL, -- {"cms_edit": true, "blog_publish": true, "users_manage": false}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User role assignments
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
  UNIQUE(user_id, role_id)
);

-- User activity log
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL, -- 'login', 'cms_edit', 'tier_change', 'invoice_generated'
  action_details JSONB, -- Additional context
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_key ON user_roles(role_key);
CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id, created_at DESC);

-- =============================================================================
-- 3. STRIPE INVOICING & BILLING
-- =============================================================================

-- Customer tier subscriptions
CREATE TABLE IF NOT EXISTS customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES pricing_tiers(id),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'past_due', 'trialing'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices (tracked from Stripe)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES customer_subscriptions(id),
  stripe_invoice_id VARCHAR(255) UNIQUE,
  invoice_number VARCHAR(100), -- AIDI-2025-001
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'GBP',
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  invoice_pdf_url VARCHAR(500),
  hosted_invoice_url VARCHAR(500),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  line_items JSONB, -- Array of {description, amount, quantity}
  metadata JSONB, -- Custom data: {brand_logo, customer_notes, etc}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items (for custom invoices)
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL, -- quantity * unit_price
  tier_feature_id UUID REFERENCES tier_features(id), -- Optional link to feature
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing events (audit trail)
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL, -- 'tier_change', 'invoice_sent', 'payment_received', 'subscription_cancelled'
  event_source VARCHAR(50) DEFAULT 'cms', -- 'cms', 'stripe_webhook', 'api'
  related_invoice_id UUID REFERENCES invoices(id),
  related_subscription_id UUID REFERENCES customer_subscriptions(id),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON customer_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON customer_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_user ON billing_events(user_id, created_at DESC);

-- =============================================================================
-- 4. INITIAL DATA - DEFAULT ROLES
-- =============================================================================

-- Insert default user roles
INSERT INTO user_roles (role_key, role_name, description, permissions) VALUES
('super_admin', 'Super Admin', 'Full system access including user management and billing', 
 '{"cms_edit": true, "blog_publish": true, "jobs_manage": true, "users_manage": true, "tiers_manage": true, "invoices_create": true, "settings_edit": true}'::jsonb),
 
('admin', 'Administrator', 'CMS and content management access', 
 '{"cms_edit": true, "blog_publish": true, "jobs_manage": true, "users_view": true, "tiers_view": true}'::jsonb),
 
('editor', 'Content Editor', 'Can edit CMS content and blog posts', 
 '{"cms_edit": true, "blog_publish": false, "blog_draft": true, "jobs_view": true}'::jsonb),
 
('customer_premium', 'Premium Customer', 'Paid tier customer with full report access', 
 '{"reports_view": true, "api_access": true, "evaluations_run": true}'::jsonb),
 
('customer_basic', 'Basic Customer', 'Free tier customer with limited access', 
 '{"reports_view_limited": true, "evaluations_run_limited": true}'::jsonb),
 
('collaborator', 'Sector Collaborator', 'Guest expert with data access', 
 '{"sector_data_view": true, "reports_early_access": true, "commentary_submit": true}'::jsonb)
 
ON CONFLICT (role_key) DO NOTHING;

-- =============================================================================
-- 5. DEFAULT PRICING TIERS
-- =============================================================================

-- Insert standard AIDI pricing tiers
INSERT INTO pricing_tiers (tier_key, tier_name, tier_type, price_amount, price_currency, billing_period, is_active, is_visible_public, badge_text, description, display_order) VALUES

('quick-scan', 'Quick Scan', 'standard', 499.00, 'GBP', 'one-time', true, true, NULL, 
 'Rapid 4-dimension baseline assessment', 1),

('full-audit', 'Full Audit', 'standard', 2500.00, 'GBP', 'one-time', true, true, 'Most Popular', 
 'Comprehensive 12-dimension strategic assessment', 2),

('protected-site', 'Protected Site Audit', 'standard', 5000.00, 'GBP', 'one-time', true, true, NULL, 
 'Human-assisted deep crawl with credentials', 3),

('enterprise-package', 'Enterprise Package', 'standard', 10000.00, 'GBP', 'one-time', true, true, NULL, 
 'Strategic intelligence for major decisions', 4),

('index-pro-monthly', 'Index Pro', 'standard', 119.00, 'GBP', 'monthly', true, true, NULL, 
 'Monthly industry reports subscription', 5),

('enterprise-monthly', 'Enterprise', 'standard', 319.00, 'GBP', 'monthly', true, true, NULL, 
 'Enterprise-level competitive intelligence', 6)

ON CONFLICT (tier_key) DO UPDATE SET
  tier_name = EXCLUDED.tier_name,
  price_amount = EXCLUDED.price_amount,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =============================================================================
-- 6. DEFAULT FEATURES LIBRARY
-- =============================================================================

INSERT INTO tier_features (feature_key, feature_name, feature_category, description, is_premium) VALUES

-- Evaluation Features
('quick-evaluation', '4-Dimension Quick Evaluation', 'evaluation', 'Rapid baseline assessment', false),
('full-evaluation', '12-Dimension Full Evaluation', 'evaluation', 'Complete AIDI evaluation', true),
('competitor-analysis', 'Competitor Benchmarking', 'evaluation', 'Compare against competitors', true),
('quarterly-reevaluation', 'Quarterly Re-evaluation', 'evaluation', 'Track progress over time', true),

-- Reporting Features
('executive-summary', 'Executive Summary Report', 'reporting', 'Board-ready summary', false),
('detailed-report', '30-Page Detailed Report', 'reporting', 'Complete analysis', true),
('pdf-download', 'PDF Download', 'reporting', 'Downloadable reports', true),
('api-access', 'API Access', 'reporting', 'Programmatic data access', true),
('monthly-reports', 'Monthly Industry Reports', 'reporting', 'Sector leaderboards', true),
('12month-archive', '12-Month Archive Access', 'reporting', 'Historical data', true),

-- Support Features
('email-support', 'Email Support', 'support', 'Standard email support', false),
('priority-support', 'Priority Support', 'support', '24-hour response time', true),
('strategy-calls', 'Quarterly Strategy Calls', 'support', 'Expert consultation', true),
('implementation-consulting', 'Implementation Consulting (4hrs)', 'support', 'Hands-on guidance', true),

-- Data & Intelligence
('statistical-ci', '95% Confidence Intervals', 'data-access', 'Statistical validation', true),
('percentile-ranking', 'Industry Percentile Rankings', 'data-access', 'Competitive positioning', true),
('raw-data-export', 'Raw Data Export', 'data-access', 'CSV/JSON downloads', true),
('custom-dashboards', 'Custom Dashboards', 'data-access', 'Tailored views', true)

ON CONFLICT (feature_key) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  description = EXCLUDED.description;

-- =============================================================================
-- 7. DEFAULT TIER-FEATURE MAPPINGS
-- =============================================================================

-- Quick Scan tier features
INSERT INTO tier_feature_mapping (tier_id, feature_id, is_included, feature_limit, display_order)
SELECT 
  (SELECT id FROM pricing_tiers WHERE tier_key = 'quick-scan'),
  id,
  true,
  CASE feature_key
    WHEN 'quick-evaluation' THEN '1 evaluation'
    WHEN 'executive-summary' THEN '2-page report'
    ELSE NULL
  END,
  ROW_NUMBER() OVER ()
FROM tier_features
WHERE feature_key IN ('quick-evaluation', 'executive-summary', 'email-support')
ON CONFLICT (tier_id, feature_id) DO NOTHING;

-- Full Audit tier features
INSERT INTO tier_feature_mapping (tier_id, feature_id, is_included, display_order)
SELECT 
  (SELECT id FROM pricing_tiers WHERE tier_key = 'full-audit'),
  id,
  true,
  ROW_NUMBER() OVER ()
FROM tier_features
WHERE feature_key IN (
  'full-evaluation', 'detailed-report', 'pdf-download', 
  'competitor-analysis', 'statistical-ci', 'percentile-ranking',
  'email-support', '12month-archive'
)
ON CONFLICT (tier_id, feature_id) DO NOTHING;

-- Enterprise tier features  
INSERT INTO tier_feature_mapping (tier_id, feature_id, is_included, display_order)
SELECT 
  (SELECT id FROM pricing_tiers WHERE tier_key = 'enterprise-package'),
  id,
  true,
  ROW_NUMBER() OVER ()
FROM tier_features
WHERE is_premium = true -- All premium features
ON CONFLICT (tier_id, feature_id) DO NOTHING;

-- =============================================================================
-- 8. INVOICE TEMPLATES & BRANDING
-- =============================================================================

-- Invoice branding settings
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  logo_url VARCHAR(500),
  company_name VARCHAR(255) DEFAULT 'AI Discoverability Index (AIDI)',
  company_address TEXT,
  company_email VARCHAR(255) DEFAULT 'billing@aidi.com',
  company_phone VARCHAR(50),
  tax_id VARCHAR(100), -- VAT number, etc.
  footer_text TEXT,
  terms_conditions TEXT,
  header_color VARCHAR(7) DEFAULT '#2563EB', -- Hex color
  accent_color VARCHAR(7) DEFAULT '#7C3AED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default invoice template
INSERT INTO invoice_templates (template_key, template_name, is_default, company_name, company_address, footer_text, terms_conditions)
VALUES (
  'default-aidi',
  'AIDI Standard Invoice',
  true,
  'AI Discoverability Index (AIDI)',
  'London, United Kingdom',
  'Thank you for choosing AIDI for your AI visibility intelligence needs.',
  'Payment due within 30 days. All prices in GBP. For questions, contact billing@aidi.com'
)
ON CONFLICT (template_key) DO UPDATE SET
  is_default = EXCLUDED.is_default,
  updated_at = NOW();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check tier counts
SELECT 
  'Pricing Tiers' as table_name,
  COUNT(*) as record_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM pricing_tiers
UNION ALL
SELECT 
  'Tier Features',
  COUNT(*),
  COUNT(*) FILTER (WHERE is_premium = true)
FROM tier_features
UNION ALL
SELECT 
  'User Roles',
  COUNT(*),
  NULL
FROM user_roles;

-- Success message
DO $$
DECLARE
  tier_count INTEGER;
  feature_count INTEGER;
  role_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tier_count FROM pricing_tiers;
  SELECT COUNT(*) INTO feature_count FROM tier_features;
  SELECT COUNT(*) INTO role_count FROM user_roles;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ CMS Advanced Features Schema Created!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '💰 Pricing Tiers: %', tier_count;
  RAISE NOTICE '✨ Tier Features: %', feature_count;
  RAISE NOTICE '👥 User Roles: %', role_count;
  RAISE NOTICE '📊 Tables Created: pricing_tiers, tier_features, tier_feature_mapping';
  RAISE NOTICE '🔐 Tables Created: user_profiles, user_roles, user_role_assignments';
  RAISE NOTICE '💳 Tables Created: customer_subscriptions, invoices, invoice_line_items';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎯 Next: Run this SQL in Neon, then deploy CMS UI components';
  RAISE NOTICE '';
END $$;

