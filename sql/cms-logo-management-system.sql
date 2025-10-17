-- =============================================================================
-- Logo & Client Trust Badge Management System
-- Upload and manage brand logos for "Trusted by" sections
-- =============================================================================

-- Client/Brand logos table
CREATE TABLE IF NOT EXISTS client_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Logo info
  logo_name VARCHAR(255) NOT NULL, -- 'Nike', 'Adidas', 'Supreme'
  logo_slug VARCHAR(100) UNIQUE NOT NULL, -- 'nike', 'adidas', 'supreme'
  
  -- File details
  file_url VARCHAR(500) NOT NULL, -- Full URL to image
  file_type VARCHAR(20) NOT NULL, -- 'svg', 'png', 'webp'
  file_size INTEGER, -- In bytes
  
  -- Dimensions (for validation and display)
  width INTEGER, -- Actual width in pixels
  height INTEGER, -- Actual height in pixels
  recommended_display_width INTEGER DEFAULT 180, -- How wide to display
  
  -- Logo variants (optional)
  dark_mode_url VARCHAR(500), -- Alternative for dark backgrounds
  square_logo_url VARCHAR(500), -- Square version if needed
  
  -- Display settings
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Categorization
  category VARCHAR(100), -- 'client', 'partner', 'case_study', 'featured'
  industry VARCHAR(100), -- 'fashion', 'tech', 'b2b_saas', etc.
  
  -- Metadata
  company_url VARCHAR(500), -- Optional link when logo is clicked
  tooltip_text VARCHAR(255), -- Hover text
  alt_text VARCHAR(255) NOT NULL, -- Accessibility
  
  -- Usage tracking
  usage_locations TEXT[], -- Where this logo appears: ['homepage', 'about', 'reports']
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logo collections (groupings for different sections)
CREATE TABLE IF NOT EXISTS logo_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_key VARCHAR(100) UNIQUE NOT NULL, -- 'homepage_trusted', 'enterprise_clients', 'case_studies'
  collection_name VARCHAR(255) NOT NULL,
  description TEXT,
  display_location VARCHAR(100), -- 'homepage', 'about', 'reports_landing'
  max_logos_shown INTEGER DEFAULT 6, -- How many to display
  randomize_order BOOLEAN DEFAULT false, -- Shuffle on each load
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logo-to-collection mapping
CREATE TABLE IF NOT EXISTS logo_collection_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES logo_collections(id) ON DELETE CASCADE,
  logo_id UUID REFERENCES client_logos(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(collection_id, logo_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_logos_active ON client_logos(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_logos_category ON client_logos(category);
CREATE INDEX IF NOT EXISTS idx_logos_slug ON client_logos(logo_slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON logo_collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collection_mapping_collection ON logo_collection_mapping(collection_id);

-- =============================================================================
-- FILE UPLOAD SPECIFICATIONS (For Reference)
-- =============================================================================

COMMENT ON TABLE client_logos IS 
'Logo Upload Specifications:
- Preferred Format: SVG (vector, scales perfectly)
- Alternative Formats: PNG with transparency, WebP
- Optimal Dimensions: 200px width × 80px height (2.5:1 ratio)
- Acceptable Range: 150-300px width, 60-120px height
- Max File Size: 500KB (preferably <100KB)
- Color Mode: Logos should work on white AND dark backgrounds
- Transparency: Required for PNG/WebP (no white boxes around logos)

Best Practices:
- SVG: Export with viewBox, remove unnecessary metadata
- PNG: Use PNG-8 or PNG-24 with alpha channel
- WebP: 90% quality, lossy compression with transparency
- Naming: lowercase-with-dashes.svg (e.g., nike-logo.svg)
- Test: Preview on both light and dark backgrounds before uploading';

-- =============================================================================
-- SEED DEFAULT COLLECTIONS
-- =============================================================================

INSERT INTO logo_collections (collection_key, collection_name, description, display_location, max_logos_shown, randomize_order) VALUES

('homepage_trusted', 'Homepage Trusted By', 
 'Brand logos displayed in "Trusted by" section on homepage', 
 'homepage', 6, false),

('enterprise_clients', 'Enterprise Clients', 
 'Major enterprise customers for case studies and credibility', 
 'about', 12, false),

('case_study_featured', 'Featured Case Studies', 
 'Clients with detailed case studies', 
 'case_studies', 8, false),

('industry_leaders', 'Industry Leaders', 
 'Category leaders analyzed in our reports', 
 'reports_landing', 10, true)

ON CONFLICT (collection_key) DO NOTHING;

-- =============================================================================
-- SAMPLE LOGOS (Placeholder - Replace with real uploads)
-- =============================================================================

INSERT INTO client_logos (logo_name, logo_slug, file_url, file_type, width, height, is_active, category, alt_text, display_order) VALUES

-- Fashion leaders (examples - replace with real logos)
('Supreme', 'supreme', '/logos/supreme.svg', 'svg', 200, 80, false, 'featured', 'Supreme logo', 1),
('Nike', 'nike', '/logos/nike.svg', 'svg', 200, 80, false, 'featured', 'Nike logo', 2),
('Adidas', 'adidas', '/logos/adidas.svg', 'svg', 200, 80, false, 'featured', 'Adidas logo', 3),
('Patagonia', 'patagonia', '/logos/patagonia.svg', 'svg', 200, 80, false, 'featured', 'Patagonia logo', 4)

ON CONFLICT (logo_slug) DO NOTHING;

-- Map logos to homepage collection (activate when real logos uploaded)
INSERT INTO logo_collection_mapping (collection_id, logo_id, display_order)
SELECT 
  (SELECT id FROM logo_collections WHERE collection_key = 'homepage_trusted'),
  l.id,
  l.display_order
FROM client_logos l
WHERE l.is_active = true
ON CONFLICT (collection_id, logo_id) DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT 
  COUNT(*) as total_logos,
  COUNT(*) FILTER (WHERE is_active = true) as active_logos,
  COUNT(*) FILTER (WHERE file_type = 'svg') as svg_count,
  COUNT(*) FILTER (WHERE file_type = 'png') as png_count
FROM client_logos;

DO $$
DECLARE
  logo_count INTEGER;
  collection_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO logo_count FROM client_logos;
  SELECT COUNT(*) INTO collection_count FROM logo_collections;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Logo Management System Created!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 CLIENT LOGOS:';
  RAISE NOTICE '   Total: % (% sample placeholders)', logo_count, logo_count;
  RAISE NOTICE '   Active: 0 (activate after real uploads)';
  RAISE NOTICE '';
  RAISE NOTICE '📁 LOGO COLLECTIONS:';
  RAISE NOTICE '   - Homepage Trusted By (6 logos max)';
  RAISE NOTICE '   - Enterprise Clients (12 logos max)';
  RAISE NOTICE '   - Case Study Featured (8 logos)';
  RAISE NOTICE '   - Industry Leaders (10 logos, randomized)';
  RAISE NOTICE '';
  RAISE NOTICE '📏 UPLOAD SPECS:';
  RAISE NOTICE '   ✅ Preferred: SVG (vector, scales perfectly)';
  RAISE NOTICE '   ✅ Alternative: PNG/WebP with transparency';
  RAISE NOTICE '   ✅ Dimensions: 200px × 80px (2.5:1 ratio)';
  RAISE NOTICE '   ✅ Max Size: 500KB (ideally <100KB)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 NEXT: Upload real logos via CMS → Add to collections → Activate';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

