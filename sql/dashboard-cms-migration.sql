-- =====================================================
-- DASHBOARD CMS MIGRATION
-- Creates tables for dashboard content management and dynamic content generation
-- =====================================================

-- Create ENUMs for dashboard content
CREATE TYPE dashboard_content_block_type AS ENUM(
    'executive_summary', 
    'alert_template', 
    'insight_card', 
    'recommendation_block',
    'benchmark_card',
    'trend_chart',
    'heatmap_widget',
    'custom_widget'
);

CREATE TYPE dashboard_template_type AS ENUM(
    'executive', 
    'analyst', 
    'cmo', 
    'custom'
);

CREATE TYPE alert_severity AS ENUM(
    'critical',
    'warning', 
    'info',
    'success'
);

-- Dashboard Content Blocks
CREATE TABLE dashboard_content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_type dashboard_content_block_type NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    metadata JSONB, -- For dynamic content like variables, formatting
    variables TEXT[], -- Array of variable names like ['{avgScore}', '{totalBrands}']
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard Templates
CREATE TABLE dashboard_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL,
    template_type dashboard_template_type NOT NULL,
    content_structure JSONB NOT NULL, -- Defines which blocks to show and their order
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Dashboard Preferences
CREATE TABLE user_dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES dashboard_templates(id),
    custom_settings JSONB, -- Widget positions, alert thresholds, display preferences
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Dashboard Alerts (for tracking alert history and resolution)
CREATE TABLE dashboard_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    alert_type alert_severity NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    metric_name VARCHAR(100),
    metric_value DECIMAL(10,2),
    metric_change DECIMAL(10,2),
    p_value VARCHAR(20),
    confidence_interval VARCHAR(50),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard Insights (for tracking generated insights and recommendations)
CREATE TABLE dashboard_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'trend', 'benchmark', 'recommendation', 'alert'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB, -- Additional data like confidence scores, related metrics
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard Widgets (for custom widget configurations)
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    widget_name VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL, -- Widget-specific configuration
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 3,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard Analytics (for tracking dashboard usage and performance)
CREATE TABLE dashboard_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'view', 'export', 'refresh', 'customize'
    widget_type VARCHAR(50),
    metadata JSONB,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_dashboard_content_blocks_type ON dashboard_content_blocks(block_type);
CREATE INDEX idx_dashboard_content_blocks_active ON dashboard_content_blocks(is_active);
CREATE INDEX idx_dashboard_templates_type ON dashboard_templates(template_type);
CREATE INDEX idx_dashboard_templates_active ON dashboard_templates(is_active);
CREATE INDEX idx_user_dashboard_preferences_user ON user_dashboard_preferences(user_id);
CREATE INDEX idx_dashboard_alerts_user ON dashboard_alerts(user_id);
CREATE INDEX idx_dashboard_alerts_brand ON dashboard_alerts(brand_id);
CREATE INDEX idx_dashboard_alerts_type ON dashboard_alerts(alert_type);
CREATE INDEX idx_dashboard_alerts_resolved ON dashboard_alerts(is_resolved);
CREATE INDEX idx_dashboard_insights_user ON dashboard_insights(user_id);
CREATE INDEX idx_dashboard_insights_type ON dashboard_insights(insight_type);
CREATE INDEX idx_dashboard_insights_read ON dashboard_insights(is_read);
CREATE INDEX idx_dashboard_widgets_user ON dashboard_widgets(user_id);
CREATE INDEX idx_dashboard_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX idx_dashboard_analytics_user ON dashboard_analytics(user_id);
CREATE INDEX idx_dashboard_analytics_action ON dashboard_analytics(action_type);
CREATE INDEX idx_dashboard_analytics_created ON dashboard_analytics(created_at);

-- Create materialized view for dashboard performance metrics
CREATE MATERIALIZED VIEW dashboard_performance_summary AS
SELECT 
    user_id,
    COUNT(*) as total_views,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    COUNT(CASE WHEN action_type = 'export' THEN 1 END) as exports,
    COUNT(CASE WHEN action_type = 'refresh' THEN 1 END) as refreshes,
    MAX(created_at) as last_activity
FROM dashboard_analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_performance_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_performance_summary;
END;
$$ LANGUAGE plpgsql;

-- Insert default dashboard templates
INSERT INTO dashboard_templates (template_name, template_type, content_structure, is_default) VALUES
('Executive Dashboard', 'executive', '{
    "sections": [
        {
            "name": "Executive Summary",
            "blocks": ["portfolio_health", "priority_alerts", "key_insights"]
        },
        {
            "name": "Performance Overview", 
            "blocks": ["trend_chart", "benchmark_comparison"]
        },
        {
            "name": "Portfolio Analysis",
            "blocks": ["heatmap", "brand_performance"]
        }
    ]
}', true),
('Analyst Dashboard', 'analyst', '{
    "sections": [
        {
            "name": "Detailed Analytics",
            "blocks": ["performance_trends", "dimension_analysis", "competitive_benchmarks"]
        },
        {
            "name": "Recommendations",
            "blocks": ["action_items", "improvement_opportunities"]
        }
    ]
}', true),
('CMO Dashboard', 'cmo', '{
    "sections": [
        {
            "name": "Brand Performance",
            "blocks": ["brand_health", "market_position", "competitive_analysis"]
        },
        {
            "name": "Strategic Insights",
            "blocks": ["trend_analysis", "market_opportunities"]
        }
    ]
}', true);

-- Insert default content blocks
INSERT INTO dashboard_content_blocks (block_type, title, content, variables) VALUES
('executive_summary', 'Portfolio Strengthening Template', 'Portfolio strengthening: {aboveBenchmark} of {totalBrands} brands trending upward with statistically significant improvements (p < 0.05)', ARRAY['aboveBenchmark', 'totalBrands']),
('executive_summary', 'Industry Context Template', 'Industry context: Athletic Footwear sector benchmark rose 8 points; maintaining {avgScore}-point average keeps portfolio in 82nd percentile', ARRAY['avgScore']),
('executive_summary', 'Action Recommendation Template', 'Recommended action: Immediate review of Technical Foundation dimension for declining brands; replicate Shopping Experience Quality approach across portfolio', ARRAY[]),
('alert_template', 'Critical Alert Template', '{brandName}: Significant AIDI Score Decline - AIDI score {changeType} {scoreChange} points (from {previousScore} to {currentScore})', ARRAY['brandName', 'changeType', 'scoreChange', 'previousScore', 'currentScore']),
('insight_card', 'Trend Insight Template', 'Portfolio trending {direction}: {change} point {improvement} in latest quarter', ARRAY['direction', 'change', 'improvement']),
('recommendation_block', 'Dimension Focus Template', 'Focus on {dimension} dimension - shows {performance} with {confidence} confidence', ARRAY['dimension', 'performance', 'confidence']);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_dashboard_content_blocks_updated_at BEFORE UPDATE ON dashboard_content_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_templates_updated_at BEFORE UPDATE ON dashboard_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_dashboard_preferences_updated_at BEFORE UPDATE ON user_dashboard_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_alerts_updated_at BEFORE UPDATE ON dashboard_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_insights_updated_at BEFORE UPDATE ON dashboard_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your security model)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_content_blocks TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_templates TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_dashboard_preferences TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_alerts TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_insights TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_widgets TO your_app_user;
-- GRANT SELECT, INSERT ON dashboard_analytics TO your_app_user;

COMMENT ON TABLE dashboard_content_blocks IS 'Stores reusable content blocks for dashboard templates with variable substitution';
COMMENT ON TABLE dashboard_templates IS 'Defines dashboard layouts and content structures for different user types';
COMMENT ON TABLE user_dashboard_preferences IS 'Stores user-specific dashboard customizations and preferences';
COMMENT ON TABLE dashboard_alerts IS 'Tracks dashboard alerts and their resolution status';
COMMENT ON TABLE dashboard_insights IS 'Stores generated insights and recommendations for users';
COMMENT ON TABLE dashboard_widgets IS 'Manages custom widget configurations and positions';
COMMENT ON TABLE dashboard_analytics IS 'Tracks dashboard usage patterns and performance metrics';
