-- =====================================================================================
-- ENHANCED JAVASCRIPT PARSER SCHEMA ADDITIONS
-- Comprehensive schema enhancements to support Beautiful Soup-equivalent data extraction
-- 
-- IMPORTANT: This file contains ONLY the NEW tables and columns needed for enhanced parsing
-- All additions are backward compatible - no existing tables are modified
-- 
-- Execute this after backing up your production database
-- =====================================================================================

-- Set search path to production schema
SET search_path TO production, public;

-- =====================================================================================
-- PHASE 1: BUSINESS INTELLIGENCE TABLES
-- Core business data extracted by enhanced JavaScript parser
-- =====================================================================================

-- Business Intelligence Core Table
CREATE TABLE IF NOT EXISTS production.business_intelligence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    brand_id uuid REFERENCES production.brands(id),
    
    -- Core Business Classification
    industry varchar(100),
    business_type varchar(50) CHECK (business_type IN ('B2B', 'B2C', 'Mixed', 'Unknown')),
    estimated_size varchar(50), -- '1-10', '10-50', '50-200', '200+', etc.
    founded_year integer,
    target_audience text,
    
    -- Brand Analysis
    brand_mentions_count integer DEFAULT 0,
    brand_name_variations jsonb, -- Different ways brand is mentioned
    
    -- Content Quality Assessment
    content_quality_score integer CHECK (content_quality_score >= 0 AND content_quality_score <= 100),
    content_quality_factors jsonb, -- Array of factors affecting quality
    
    -- Data Source & Confidence
    extraction_method varchar(50) CHECK (extraction_method IN (
        'direct_crawl', 'web_archive', 'search_cache', 'social_media', 
        'business_directory', 'dns_whois', 'synthetic_generation'
    )),
    confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
    data_freshness_days integer, -- How old is the source data
    
    -- Metadata
    extraction_timestamp timestamp DEFAULT now(),
    parser_version varchar(20) DEFAULT 'v6.2',
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Products Extracted from Website
CREATE TABLE IF NOT EXISTS production.extracted_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_intelligence_id uuid NOT NULL REFERENCES production.business_intelligence(id) ON DELETE CASCADE,
    
    -- Product Details
    name varchar(500) NOT NULL,
    price varchar(100), -- Store as string to handle various formats
    description text,
    category varchar(100),
    sku varchar(100),
    availability varchar(50), -- 'in_stock', 'out_of_stock', 'limited', etc.
    
    -- Extraction Metadata
    extraction_source varchar(50) CHECK (extraction_source IN (
        'structured_data', 'html_parsing', 'inference', 'product_page'
    )),
    source_url varchar(500),
    confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
    
    created_at timestamp DEFAULT now()
);

-- Services Extracted from Website
CREATE TABLE IF NOT EXISTS production.extracted_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_intelligence_id uuid NOT NULL REFERENCES production.business_intelligence(id) ON DELETE CASCADE,
    
    -- Service Details
    service_name varchar(255) NOT NULL,
    description text,
    category varchar(100),
    pricing_model varchar(50), -- 'subscription', 'one_time', 'consultation', etc.
    
    -- Extraction Metadata
    extraction_confidence integer CHECK (extraction_confidence >= 0 AND extraction_confidence <= 100),
    created_at timestamp DEFAULT now()
);

-- Contact Information Extracted
CREATE TABLE IF NOT EXISTS production.extracted_contact_info (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_intelligence_id uuid NOT NULL REFERENCES production.business_intelligence(id) ON DELETE CASCADE,
    
    -- Contact Details
    contact_type varchar(50) NOT NULL CHECK (contact_type IN ('email', 'phone', 'address', 'fax', 'website')),
    contact_value varchar(500) NOT NULL,
    contact_label varchar(100), -- 'support', 'sales', 'main', 'headquarters', etc.
    is_primary boolean DEFAULT false,
    
    -- Geographic Context (for addresses)
    city varchar(100),
    state_province varchar(100),
    country varchar(100),
    postal_code varchar(20),
    
    -- Validation Status
    is_validated boolean DEFAULT false,
    validation_method varchar(50),
    
    created_at timestamp DEFAULT now()
);

-- Social Media Profiles Discovered
CREATE TABLE IF NOT EXISTS production.social_media_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_intelligence_id uuid NOT NULL REFERENCES production.business_intelligence(id) ON DELETE CASCADE,
    
    -- Platform Details
    platform varchar(50) NOT NULL CHECK (platform IN (
        'facebook', 'twitter', 'x', 'instagram', 'linkedin', 'youtube', 
        'tiktok', 'pinterest', 'snapchat', 'other'
    )),
    profile_url varchar(500) NOT NULL,
    username varchar(100),
    
    -- Engagement Metrics (estimated)
    follower_estimate varchar(50), -- '1K-10K', '10K-50K', etc.
    engagement_level varchar(20) CHECK (engagement_level IN ('low', 'medium', 'high', 'very_high')),
    
    -- Profile Quality
    is_verified boolean DEFAULT false,
    profile_completeness_score integer CHECK (profile_completeness_score >= 0 AND profile_completeness_score <= 100),
    last_post_estimate varchar(50), -- 'within_week', 'within_month', 'over_month', etc.
    
    -- Discovery Method
    discovery_method varchar(50) CHECK (discovery_method IN (
        'website_links', 'domain_inference', 'search_results', 'structured_data'
    )),
    
    created_at timestamp DEFAULT now()
);

-- Competitor Mentions Analysis
CREATE TABLE IF NOT EXISTS production.competitor_mentions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_intelligence_id uuid NOT NULL REFERENCES production.business_intelligence(id) ON DELETE CASCADE,
    
    -- Competitor Details
    competitor_name varchar(255) NOT NULL,
    competitor_domain varchar(255),
    mention_context text, -- The actual text where competitor was mentioned
    
    -- Mention Analysis
    mention_type varchar(50) CHECK (mention_type IN (
        'comparison', 'alternative', 'vs_competitor', 'partnership', 'supplier', 'customer'
    )),
    sentiment varchar(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    
    -- Context Location
    page_section varchar(50), -- 'header', 'main_content', 'footer', 'sidebar'
    source_url varchar(500),
    
    created_at timestamp DEFAULT now()
);

-- Key Topics and Themes Extracted
CREATE TABLE IF NOT EXISTS production.content_topics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_intelligence_id uuid NOT NULL REFERENCES production.business_intelligence(id) ON DELETE CASCADE,
    
    -- Topic Details
    topic varchar(255) NOT NULL,
    frequency_count integer DEFAULT 1,
    density_percentage decimal(5,2), -- Percentage of total content
    topic_rank integer, -- 1-10 for top topics
    
    -- Topic Classification
    topic_category varchar(50) CHECK (topic_category IN (
        'product', 'service', 'industry', 'technology', 'location', 'brand', 'other'
    )),
    relevance_score integer CHECK (relevance_score >= 0 AND relevance_score <= 100),
    
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- PHASE 2: ADVANCED SEO ANALYSIS TABLES
-- Detailed SEO insights from enhanced HTML parsing
-- =====================================================================================

-- SEO Analysis Core
CREATE TABLE IF NOT EXISTS production.seo_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    
    -- Title Optimization
    title_optimization_score integer CHECK (title_optimization_score >= 0 AND title_optimization_score <= 100),
    title_length integer,
    title_issues jsonb, -- Array of issues found
    title_suggestions jsonb, -- Array of improvement suggestions
    
    -- Meta Description Analysis
    meta_description_score integer CHECK (meta_description_score >= 0 AND meta_description_score <= 100),
    meta_description_length integer,
    meta_description_issues jsonb,
    meta_description_suggestions jsonb,
    
    -- Heading Structure Analysis
    heading_structure_score integer CHECK (heading_structure_score >= 0 AND heading_structure_score <= 100),
    h1_count integer DEFAULT 0,
    h2_count integer DEFAULT 0,
    h3_count integer DEFAULT 0,
    h4_count integer DEFAULT 0,
    h5_count integer DEFAULT 0,
    h6_count integer DEFAULT 0,
    missing_heading_levels jsonb, -- Array of skipped heading levels
    heading_hierarchy_issues jsonb,
    
    -- Content Analysis
    word_count integer DEFAULT 0,
    readability_score integer CHECK (readability_score >= 0 AND readability_score <= 100),
    duplicate_content_detected boolean DEFAULT false,
    content_uniqueness_score integer CHECK (content_uniqueness_score >= 0 AND content_uniqueness_score <= 100),
    
    -- Image Optimization
    total_images_count integer DEFAULT 0,
    images_with_alt_count integer DEFAULT 0,
    image_optimization_score integer CHECK (image_optimization_score >= 0 AND image_optimization_score <= 100),
    
    -- Link Analysis
    internal_links_count integer DEFAULT 0,
    external_links_count integer DEFAULT 0,
    broken_links_count integer DEFAULT 0,
    
    -- Overall SEO Score
    overall_seo_score integer CHECK (overall_seo_score >= 0 AND overall_seo_score <= 100),
    
    -- Analysis Metadata
    analysis_timestamp timestamp DEFAULT now(),
    parser_version varchar(20) DEFAULT 'v6.2',
    created_at timestamp DEFAULT now()
);

-- Keyword Analysis Details
CREATE TABLE IF NOT EXISTS production.keyword_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_analysis_id uuid NOT NULL REFERENCES production.seo_analysis(id) ON DELETE CASCADE,
    
    -- Keyword Details
    keyword varchar(255) NOT NULL,
    density_percentage decimal(5,2) CHECK (density_percentage >= 0 AND density_percentage <= 100),
    frequency_count integer DEFAULT 1,
    keyword_rank integer CHECK (keyword_rank >= 1 AND keyword_rank <= 50), -- Top 50 keywords
    
    -- Keyword Context
    keyword_category varchar(50) CHECK (keyword_category IN (
        'brand', 'product', 'service', 'industry', 'location', 'feature', 'benefit', 'other'
    )),
    first_occurrence_location varchar(50), -- 'title', 'h1', 'h2', 'meta_description', 'body'
    
    -- SEO Value
    seo_value_score integer CHECK (seo_value_score >= 0 AND seo_value_score <= 100),
    competition_level varchar(20) CHECK (competition_level IN ('low', 'medium', 'high', 'very_high')),
    
    created_at timestamp DEFAULT now()
);

-- Technical SEO Details
CREATE TABLE IF NOT EXISTS production.technical_seo (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    
    -- URL and Canonical
    canonical_url varchar(500),
    has_canonical boolean DEFAULT false,
    canonical_issues jsonb,
    
    -- Robots and Crawling
    robots_directives text,
    robots_meta_content varchar(255),
    crawlability_score integer CHECK (crawlability_score >= 0 AND crawlability_score <= 100),
    
    -- Structured Data
    structured_data_present boolean DEFAULT false,
    structured_data_types jsonb, -- Array of schema.org types found
    structured_data_errors jsonb,
    structured_data_score integer CHECK (structured_data_score >= 0 AND structured_data_score <= 100),
    
    -- Page Performance Indicators
    estimated_load_time_ms integer,
    mobile_friendly boolean DEFAULT false,
    responsive_design_score integer CHECK (responsive_design_score >= 0 AND responsive_design_score <= 100),
    
    -- Security and Protocol
    uses_https boolean DEFAULT false,
    security_headers_present boolean DEFAULT false,
    
    -- Social Media Integration
    open_graph_present boolean DEFAULT false,
    twitter_card_present boolean DEFAULT false,
    social_meta_score integer CHECK (social_meta_score >= 0 AND social_meta_score <= 100),
    
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- PHASE 3: ACCESSIBILITY AUDIT TABLES
-- WCAG compliance and accessibility analysis
-- =====================================================================================

-- Accessibility Analysis Core
CREATE TABLE IF NOT EXISTS production.accessibility_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    
    -- Overall Accessibility Scoring
    overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
    wcag_compliance_level varchar(10) CHECK (wcag_compliance_level IN ('A', 'AA', 'AAA', 'Non-compliant')),
    
    -- Issue Counts by Severity
    total_issues_count integer DEFAULT 0,
    critical_issues_count integer DEFAULT 0,
    high_issues_count integer DEFAULT 0,
    medium_issues_count integer DEFAULT 0,
    low_issues_count integer DEFAULT 0,
    
    -- Specific Accessibility Metrics
    images_without_alt_count integer DEFAULT 0,
    links_without_text_count integer DEFAULT 0,
    form_elements_without_labels_count integer DEFAULT 0,
    heading_structure_violations_count integer DEFAULT 0,
    color_contrast_violations_count integer DEFAULT 0,
    
    -- Compliance Percentages
    alt_text_compliance_percentage integer CHECK (alt_text_compliance_percentage >= 0 AND alt_text_compliance_percentage <= 100),
    keyboard_navigation_score integer CHECK (keyboard_navigation_score >= 0 AND keyboard_navigation_score <= 100),
    screen_reader_compatibility_score integer CHECK (screen_reader_compatibility_score >= 0 AND screen_reader_compatibility_score <= 100),
    
    -- Analysis Metadata
    analysis_timestamp timestamp DEFAULT now(),
    wcag_version varchar(10) DEFAULT '2.1',
    created_at timestamp DEFAULT now()
);

-- Detailed Accessibility Issues
CREATE TABLE IF NOT EXISTS production.accessibility_issues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    accessibility_analysis_id uuid NOT NULL REFERENCES production.accessibility_analysis(id) ON DELETE CASCADE,
    
    -- Issue Classification
    issue_type varchar(100) NOT NULL, -- 'missing_alt_text', 'empty_links', 'color_contrast', etc.
    severity varchar(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    wcag_guideline varchar(50), -- '1.1.1', '2.4.4', etc.
    wcag_level varchar(5) CHECK (wcag_level IN ('A', 'AA', 'AAA')),
    
    -- Issue Details
    description text NOT NULL,
    element_selector varchar(500), -- CSS selector for the problematic element
    element_tag varchar(50), -- 'img', 'a', 'input', etc.
    
    -- Fix Information
    suggested_fix text,
    fix_complexity varchar(20) CHECK (fix_complexity IN ('easy', 'medium', 'hard', 'complex')),
    estimated_fix_time_minutes integer,
    
    -- Impact Assessment
    user_impact_description text,
    affected_user_groups jsonb, -- Array of affected disability groups
    
    created_at timestamp DEFAULT now()
);

-- Accessibility Recommendations
CREATE TABLE IF NOT EXISTS production.accessibility_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    accessibility_analysis_id uuid NOT NULL REFERENCES production.accessibility_analysis(id) ON DELETE CASCADE,
    
    -- Recommendation Details
    recommendation_title varchar(255) NOT NULL,
    recommendation_description text NOT NULL,
    priority varchar(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Implementation Details
    implementation_effort varchar(20) CHECK (implementation_effort IN ('minimal', 'moderate', 'significant', 'major')),
    estimated_impact_score integer CHECK (estimated_impact_score >= 0 AND estimated_impact_score <= 100),
    
    -- Categories
    recommendation_category varchar(50) CHECK (recommendation_category IN (
        'images', 'navigation', 'forms', 'content', 'structure', 'color_contrast', 'multimedia', 'other'
    )),
    
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- PHASE 4: ANTI-BOT BYPASS TRACKING TABLES
-- Track bypass method success rates and data quality
-- =====================================================================================

-- Crawl Bypass Attempts Tracking
CREATE TABLE IF NOT EXISTS production.crawl_bypass_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE CASCADE,
    
    -- Target Information
    target_url varchar(500) NOT NULL,
    target_domain varchar(255) NOT NULL,
    
    -- Bypass Method Details
    bypass_method varchar(50) NOT NULL CHECK (bypass_method IN (
        'cached_content', 'web_archive', 'search_cache', 'social_media_parsing',
        'business_directory_apis', 'dns_whois', 'synthetic_generation'
    )),
    method_priority integer CHECK (method_priority >= 1 AND method_priority <= 10),
    
    -- Attempt Results
    success boolean NOT NULL,
    confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
    data_source varchar(100), -- 'Internet Archive', 'Google Cache', etc.
    
    -- Performance Metrics
    execution_time_ms integer,
    data_size_bytes integer,
    
    -- Error Information (if failed)
    error_message text,
    error_category varchar(50) CHECK (error_category IN (
        'network_error', 'parsing_error', 'no_data_available', 'rate_limited', 'access_denied', 'other'
    )),
    
    -- Fallback Information
    fallback_available boolean DEFAULT false,
    next_method_attempted varchar(50),
    
    created_at timestamp DEFAULT now()
);

-- Bypass Data Quality Assessment
CREATE TABLE IF NOT EXISTS production.bypass_data_quality (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bypass_attempt_id uuid NOT NULL REFERENCES production.crawl_bypass_attempts(id) ON DELETE CASCADE,
    
    -- Data Quality Metrics
    data_completeness_score integer CHECK (data_completeness_score >= 0 AND data_completeness_score <= 100),
    data_accuracy_score integer CHECK (data_accuracy_score >= 0 AND data_accuracy_score <= 100),
    data_freshness_days integer, -- How old is the source data
    
    -- Source Reliability
    source_reliability_score integer CHECK (source_reliability_score >= 0 AND source_reliability_score <= 100),
    source_last_updated timestamp,
    
    -- Verification Status
    verification_status varchar(50) CHECK (verification_status IN (
        'verified', 'partially_verified', 'unverified', 'conflicting'
    )),
    verification_method varchar(100),
    
    -- Data Coverage Analysis
    has_business_intelligence boolean DEFAULT false,
    has_seo_data boolean DEFAULT false,
    has_contact_info boolean DEFAULT false,
    has_product_data boolean DEFAULT false,
    
    -- Quality Flags
    data_quality_flags jsonb, -- Array of quality issues or notes
    
    created_at timestamp DEFAULT now()
);

-- Bypass Method Performance Statistics
CREATE TABLE IF NOT EXISTS production.bypass_method_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Method Information
    bypass_method varchar(50) NOT NULL,
    target_domain_pattern varchar(255), -- Pattern like '*.co.uk', 'e-commerce', etc.
    
    -- Success Statistics
    total_attempts integer DEFAULT 0,
    successful_attempts integer DEFAULT 0,
    success_rate_percentage decimal(5,2),
    
    -- Performance Statistics
    avg_execution_time_ms integer,
    avg_confidence_score integer,
    avg_data_quality_score integer,
    
    -- Time Period
    stats_period_start timestamp NOT NULL,
    stats_period_end timestamp NOT NULL,
    
    -- Last Updated
    last_calculated timestamp DEFAULT now(),
    created_at timestamp DEFAULT now()
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- Critical indexes for query performance on new tables
-- =====================================================================================

-- Business Intelligence Indexes
CREATE INDEX IF NOT EXISTS idx_business_intelligence_evaluation_id ON production.business_intelligence(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_brand_id ON production.business_intelligence(brand_id);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_industry ON production.business_intelligence(industry);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_business_type ON production.business_intelligence(business_type);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_extraction_method ON production.business_intelligence(extraction_method);

-- Product and Service Indexes
CREATE INDEX IF NOT EXISTS idx_extracted_products_business_intelligence_id ON production.extracted_products(business_intelligence_id);
CREATE INDEX IF NOT EXISTS idx_extracted_products_category ON production.extracted_products(category);
CREATE INDEX IF NOT EXISTS idx_extracted_services_business_intelligence_id ON production.extracted_services(business_intelligence_id);

-- Contact and Social Media Indexes
CREATE INDEX IF NOT EXISTS idx_extracted_contact_info_business_intelligence_id ON production.extracted_contact_info(business_intelligence_id);
CREATE INDEX IF NOT EXISTS idx_extracted_contact_info_type ON production.extracted_contact_info(contact_type);
CREATE INDEX IF NOT EXISTS idx_social_media_profiles_business_intelligence_id ON production.social_media_profiles(business_intelligence_id);
CREATE INDEX IF NOT EXISTS idx_social_media_profiles_platform ON production.social_media_profiles(platform);

-- SEO Analysis Indexes
CREATE INDEX IF NOT EXISTS idx_seo_analysis_evaluation_id ON production.seo_analysis(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_seo_analysis_id ON production.keyword_analysis(seo_analysis_id);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_keyword ON production.keyword_analysis(keyword);
CREATE INDEX IF NOT EXISTS idx_technical_seo_evaluation_id ON production.technical_seo(evaluation_id);

-- Accessibility Indexes
CREATE INDEX IF NOT EXISTS idx_accessibility_analysis_evaluation_id ON production.accessibility_analysis(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_issues_analysis_id ON production.accessibility_issues(accessibility_analysis_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_issues_severity ON production.accessibility_issues(severity);

-- Bypass Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_crawl_bypass_attempts_evaluation_id ON production.crawl_bypass_attempts(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_crawl_bypass_attempts_method ON production.crawl_bypass_attempts(bypass_method);
CREATE INDEX IF NOT EXISTS idx_crawl_bypass_attempts_domain ON production.crawl_bypass_attempts(target_domain);
CREATE INDEX IF NOT EXISTS idx_bypass_data_quality_attempt_id ON production.bypass_data_quality(bypass_attempt_id);

-- =====================================================================================
-- VIEWS FOR COMMON QUERIES
-- Useful views for dashboard and reporting queries
-- =====================================================================================

-- Business Intelligence Summary View
CREATE OR REPLACE VIEW production.v_business_intelligence_summary AS
SELECT 
    bi.evaluation_id,
    bi.brand_id,
    bi.industry,
    bi.business_type,
    bi.confidence_score,
    bi.extraction_method,
    COUNT(DISTINCT ep.id) as products_count,
    COUNT(DISTINCT es.id) as services_count,
    COUNT(DISTINCT eci.id) as contact_info_count,
    COUNT(DISTINCT smp.id) as social_profiles_count,
    COUNT(DISTINCT cm.id) as competitor_mentions_count,
    bi.created_at
FROM production.business_intelligence bi
LEFT JOIN production.extracted_products ep ON bi.id = ep.business_intelligence_id
LEFT JOIN production.extracted_services es ON bi.id = es.business_intelligence_id
LEFT JOIN production.extracted_contact_info eci ON bi.id = eci.business_intelligence_id
LEFT JOIN production.social_media_profiles smp ON bi.id = smp.business_intelligence_id
LEFT JOIN production.competitor_mentions cm ON bi.id = cm.business_intelligence_id
GROUP BY bi.id, bi.evaluation_id, bi.brand_id, bi.industry, bi.business_type, 
         bi.confidence_score, bi.extraction_method, bi.created_at;

-- SEO Analysis Summary View
CREATE OR REPLACE VIEW production.v_seo_analysis_summary AS
SELECT 
    sa.evaluation_id,
    sa.overall_seo_score,
    sa.title_optimization_score,
    sa.meta_description_score,
    sa.heading_structure_score,
    sa.readability_score,
    sa.image_optimization_score,
    sa.word_count,
    sa.h1_count,
    sa.total_images_count,
    sa.images_with_alt_count,
    sa.internal_links_count,
    sa.external_links_count,
    COUNT(DISTINCT ka.id) as keywords_analyzed_count,
    ts.structured_data_present,
    ts.mobile_friendly,
    ts.uses_https,
    sa.created_at
FROM production.seo_analysis sa
LEFT JOIN production.keyword_analysis ka ON sa.id = ka.seo_analysis_id
LEFT JOIN production.technical_seo ts ON sa.evaluation_id = ts.evaluation_id
GROUP BY sa.id, sa.evaluation_id, sa.overall_seo_score, sa.title_optimization_score,
         sa.meta_description_score, sa.heading_structure_score, sa.readability_score,
         sa.image_optimization_score, sa.word_count, sa.h1_count, sa.total_images_count,
         sa.images_with_alt_count, sa.internal_links_count, sa.external_links_count,
         ts.structured_data_present, ts.mobile_friendly, ts.uses_https, sa.created_at;

-- Accessibility Summary View
CREATE OR REPLACE VIEW production.v_accessibility_summary AS
SELECT 
    aa.evaluation_id,
    aa.overall_score,
    aa.wcag_compliance_level,
    aa.total_issues_count,
    aa.critical_issues_count,
    aa.high_issues_count,
    aa.medium_issues_count,
    aa.low_issues_count,
    aa.alt_text_compliance_percentage,
    aa.keyboard_navigation_score,
    aa.screen_reader_compatibility_score,
    COUNT(DISTINCT ai.id) as detailed_issues_count,
    COUNT(DISTINCT ar.id) as recommendations_count,
    aa.created_at
FROM production.accessibility_analysis aa
LEFT JOIN production.accessibility_issues ai ON aa.id = ai.accessibility_analysis_id
LEFT JOIN production.accessibility_recommendations ar ON aa.id = ar.accessibility_analysis_id
GROUP BY aa.id, aa.evaluation_id, aa.overall_score, aa.wcag_compliance_level,
         aa.total_issues_count, aa.critical_issues_count, aa.high_issues_count,
         aa.medium_issues_count, aa.low_issues_count, aa.alt_text_compliance_percentage,
         aa.keyboard_navigation_score, aa.screen_reader_compatibility_score, aa.created_at;

-- Bypass Method Success Rate View
CREATE OR REPLACE VIEW production.v_bypass_method_success_rates AS
SELECT 
    bypass_method,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN success = true THEN 1 END) as successful_attempts,
    ROUND(
        (COUNT(CASE WHEN success = true THEN 1 END)::decimal / COUNT(*)) * 100, 2
    ) as success_rate_percentage,
    AVG(confidence_score) as avg_confidence_score,
    AVG(execution_time_ms) as avg_execution_time_ms,
    MIN(created_at) as first_attempt,
    MAX(created_at) as last_attempt
FROM production.crawl_bypass_attempts
GROUP BY bypass_method
ORDER BY success_rate_percentage DESC;

-- =====================================================================================
-- GRANTS AND PERMISSIONS
-- Ensure proper access permissions for application
-- =====================================================================================

-- Grant permissions to application user (adjust username as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA production TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA production TO your_app_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA production TO your_readonly_user;

-- =====================================================================================
-- COMPLETION MESSAGE
-- =====================================================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================================================';
    RAISE NOTICE 'ENHANCED JAVASCRIPT PARSER SCHEMA ADDITIONS COMPLETED SUCCESSFULLY';
    RAISE NOTICE '=====================================================================================';
    RAISE NOTICE 'Added Tables:';
    RAISE NOTICE '- Business Intelligence: 6 tables (business_intelligence, extracted_products, etc.)';
    RAISE NOTICE '- SEO Analysis: 3 tables (seo_analysis, keyword_analysis, technical_seo)';
    RAISE NOTICE '- Accessibility: 3 tables (accessibility_analysis, accessibility_issues, etc.)';
    RAISE NOTICE '- Bypass Tracking: 3 tables (crawl_bypass_attempts, bypass_data_quality, etc.)';
    RAISE NOTICE '- Performance: 15+ indexes created';
    RAISE NOTICE '- Reporting: 4 summary views created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Update application code to populate new tables';
    RAISE NOTICE '2. Test enhanced parser integration';
    RAISE NOTICE '3. Monitor query performance';
    RAISE NOTICE '4. Adjust permissions as needed';
    RAISE NOTICE '=====================================================================================';
END $$;
