-- CMS Schema for AIDI Platform
-- Manages site settings, theme, content, blog, and jobs

-- ============================================================================
-- THEME & SITE SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'theme', 'seo', 'general', 'integrations'
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- ============================================================================
-- PAGES & CONTENT BLOCKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE NOT NULL, -- e.g., 'homepage', 'about', 'pricing'
  title VARCHAR(255) NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP WITH TIME ZONE,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  block_key VARCHAR(100) NOT NULL, -- e.g., 'hero_headline', 'pricing_tier_1_title'
  block_type VARCHAR(50) NOT NULL, -- 'text', 'richtext', 'json', 'image', 'video'
  content JSONB NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, block_key)
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_page ON content_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_key ON content_blocks(block_key);
CREATE INDEX IF NOT EXISTS idx_content_blocks_order ON content_blocks(page_id, display_order);

-- ============================================================================
-- BLOG SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- Supports MDX
  cover_image VARCHAR(500),
  category_id UUID REFERENCES blog_categories(id),
  author_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP WITH TIME ZONE,
  featured BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[], -- Array of tags
  view_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured, published_at DESC);

-- ============================================================================
-- JOB BOARD
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100), -- 'Engineering', 'Sales', 'Marketing', etc.
  location VARCHAR(100), -- 'Remote', 'NYC', 'Hybrid', etc.
  employment_type VARCHAR(50), -- 'Full-time', 'Part-time', 'Contract'
  experience_level VARCHAR(50), -- 'Entry', 'Mid', 'Senior', 'Lead'
  salary_range VARCHAR(100), -- e.g., '$80k-120k' or 'Competitive'
  description TEXT NOT NULL, -- Supports Markdown
  requirements TEXT[], -- Array of requirements
  nice_to_have TEXT[], -- Array of nice-to-have skills
  category_id UUID REFERENCES job_categories(id),
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'draft'
  apply_url VARCHAR(500),
  apply_email VARCHAR(255),
  posted_at TIMESTAMP WITH TIME ZONE,
  closes_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_slug ON job_postings(slug);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted ON job_postings(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_category ON job_postings(category_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Theme settings (default)
INSERT INTO site_settings (key, value, category, description) VALUES
('theme_colors', 
 '{
   "primary": "#2563EB",
   "secondary": "#7C3AED",
   "accent": "#059669",
   "background": "#FFFFFF",
   "foreground": "#1F2937",
   "muted": "#F3F4F6",
   "border": "#E5E7EB"
 }'::jsonb, 
 'theme', 
 'Main theme colors'
),
('theme_fonts', 
 '{
   "heading": "Inter",
   "body": "Inter",
   "mono": "JetBrains Mono"
 }'::jsonb, 
 'theme', 
 'Typography settings'
),
('theme_typography',
 '{
   "heading": {
     "h1": {"size": "3.5rem", "weight": "700", "lineHeight": "1.1"},
     "h2": {"size": "2.5rem", "weight": "600", "lineHeight": "1.2"},
     "h3": {"size": "1.875rem", "weight": "600", "lineHeight": "1.3"},
     "h4": {"size": "1.5rem", "weight": "600", "lineHeight": "1.4"}
   },
   "body": {
     "base": {"size": "1rem", "lineHeight": "1.6"},
     "large": {"size": "1.125rem", "lineHeight": "1.7"},
     "small": {"size": "0.875rem", "lineHeight": "1.5"}
   }
 }'::jsonb,
 'theme',
 'Typography scale and settings'
),
('site_general',
 '{
   "site_name": "AI Discoverability Index",
   "tagline": "The Benchmark Standard for AEO Intelligence",
   "description": "Scientifically rigorous AEO benchmarking for strategic decisions",
   "contact_email": "hello@aidi.com",
   "support_email": "support@aidi.com"
 }'::jsonb,
 'general',
 'General site information'
);

-- Default homepage
INSERT INTO cms_pages (slug, title, meta_title, meta_description, status, published_at) VALUES
('homepage', 
 'Homepage', 
 'AIDI - The Benchmark Standard for AEO Intelligence',
 'Scientifically rigorous AEO benchmarking with industry percentiles, statistical validation, and peer-reviewed methodology.',
 'published',
 NOW()
);

-- Blog categories
INSERT INTO blog_categories (slug, name, description, display_order) VALUES
('aeo-insights', 'AEO Insights', 'Latest insights on Answer Engine Optimization', 1),
('methodology', 'Methodology', 'Deep dives into our scientific approach', 2),
('case-studies', 'Case Studies', 'Real-world success stories', 3),
('industry-benchmarks', 'Industry Benchmarks', 'Benchmark data and analysis', 4);

-- Job categories
INSERT INTO job_categories (slug, name) VALUES
('engineering', 'Engineering'),
('data-science', 'Data Science'),
('sales', 'Sales & Business Development'),
('marketing', 'Marketing & Content'),
('operations', 'Operations');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get all settings by category
CREATE OR REPLACE FUNCTION get_settings_by_category(category_filter VARCHAR)
RETURNS TABLE (
  key VARCHAR,
  value JSONB,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.key, s.value, s.description
  FROM site_settings s
  WHERE s.category = category_filter;
END;
$$ LANGUAGE plpgsql;

-- Function to update setting (with audit trail)
CREATE OR REPLACE FUNCTION update_site_setting(
  setting_key VARCHAR,
  setting_value JSONB,
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE site_settings
  SET value = setting_value,
      updated_by = user_id,
      updated_at = NOW()
  WHERE key = setting_key;
END;
$$ LANGUAGE plpgsql;

