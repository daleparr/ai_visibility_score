# Dashboard Data Architecture & CMS Integration Strategy

## Executive Summary

The current dashboard components use mock data. To deliver real business intelligence, we need comprehensive data transformations, CMS integration, and sophisticated analytics pipelines that transform raw evaluation data into actionable executive insights.

---

## 🎯 Current State Analysis

### ✅ What We Have
- **Database Schema**: Complete production schema with brands, evaluations, dimension_scores
- **API Endpoints**: Basic dashboard APIs (`/api/dashboard/brands`, `/api/dashboard/evaluations`)
- **Dashboard Components**: 5 tabbed components with mock data
- **CMS System**: Content management for blog, careers, industry reports

### ❌ What's Missing
- **Real Data Integration**: Dashboard components use hardcoded mock data
- **Business Intelligence Layer**: No aggregation, trending, or comparative analytics
- **CMS Dashboard Mapping**: No CMS integration for dashboard content
- **Advanced Analytics**: No statistical analysis, forecasting, or insights generation

---

## 🏗️ Required Data Transformations

### 1. **Portfolio Health Summary** (`ExecutiveIntelligencePanel`)

#### Current Mock Data:
```typescript
const portfolioSummary = {
  totalBrands: 12,
  avgAidiScore: 78,
  avgAidiScoreChange: 4,
  aboveBenchmark: 9,
  actionRequired: 2,
}
```

#### Required SQL Transformations:
```sql
-- Portfolio Health Summary Query
WITH portfolio_metrics AS (
  SELECT 
    COUNT(DISTINCT b.id) as total_brands,
    AVG(e.adi_score) as avg_aidi_score,
    AVG(e.adi_score) - LAG(AVG(e.adi_score)) OVER (ORDER BY DATE_TRUNC('month', e.completed_at)) as score_change,
    COUNT(CASE WHEN e.industry_percentile >= 75 THEN 1 END) as above_benchmark,
    COUNT(CASE WHEN e.adi_score < 60 OR e.reliability_score < 70 THEN 1 END) as action_required
  FROM brands b
  JOIN evaluations e ON b.id = e.brand_id
  WHERE b.user_id = $1
    AND e.status = 'completed'
    AND e.completed_at >= NOW() - INTERVAL '90 days'
)
SELECT * FROM portfolio_metrics;
```

#### Required API Enhancement:
```typescript
// New API: /api/dashboard/portfolio-summary
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  
  const portfolioData = await db.query(`
    WITH portfolio_metrics AS (
      SELECT 
        COUNT(DISTINCT b.id) as total_brands,
        AVG(e.adi_score) as avg_aidi_score,
        AVG(e.adi_score) - LAG(AVG(e.adi_score)) OVER (ORDER BY DATE_TRUNC('month', e.completed_at)) as score_change,
        COUNT(CASE WHEN e.industry_percentile >= 75 THEN 1 END) as above_benchmark,
        COUNT(CASE WHEN e.adi_score < 60 OR e.reliability_score < 70 THEN 1 END) as action_required
      FROM brands b
      JOIN evaluations e ON b.id = e.brand_id
      WHERE b.user_id = $1
        AND e.status = 'completed'
        AND e.completed_at >= NOW() - INTERVAL '90 days'
    )
    SELECT * FROM portfolio_metrics;
  `, [userId])
  
  return NextResponse.json({ portfolio: portfolioData[0] })
}
```

### 2. **Priority Alerts System** (`ExecutiveIntelligencePanel`)

#### Current Mock Data:
```typescript
const priorityAlerts = [
  {
    id: 1,
    type: 'Critical',
    title: 'Nike: Significant AIDI Score Decline',
    description: 'AIDI score dropped 12 points (from 85 to 73) in Q4.',
    recommendation: 'Immediate review of Technical Foundation dimension.',
    metric: 'AIDI Score',
    change: -12,
    p_value: '< 0.01',
    confidence_interval: '70-76',
  }
]
```

#### Required SQL Transformations:
```sql
-- Priority Alerts Query
WITH score_changes AS (
  SELECT 
    b.name as brand_name,
    b.id as brand_id,
    e.adi_score as current_score,
    LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) as previous_score,
    e.adi_score - LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) as score_change,
    e.completed_at,
    e.strongest_dimension,
    e.weakest_dimension,
    e.biggest_opportunity,
    e.confidence_interval,
    CASE 
      WHEN e.adi_score - LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) < -10 THEN 'Critical'
      WHEN e.adi_score - LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) < -5 THEN 'Warning'
      WHEN e.adi_score - LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) > 5 THEN 'Success'
      ELSE 'Opportunity'
    END as alert_type
  FROM brands b
  JOIN evaluations e ON b.id = e.brand_id
  WHERE b.user_id = $1
    AND e.status = 'completed'
    AND e.completed_at >= NOW() - INTERVAL '30 days'
)
SELECT * FROM score_changes 
WHERE score_change IS NOT NULL
ORDER BY ABS(score_change) DESC;
```

### 3. **Portfolio Heat Map** (`PortfolioHeatMap`)

#### Required Data Structure:
```typescript
interface PortfolioHeatMapData {
  brands: {
    id: string
    name: string
    industry: string
    adiScore: number
    industryRank: number
    revenue: number
    status: 'exceeding' | 'at-risk' | 'action-required'
    trend: 'up' | 'down' | 'stable'
    dimensions: {
      brandPerception: number
      technicalFoundation: number
      shoppingExperience: number
      entityClarity: number
    }
  }[]
  industryBenchmarks: {
    industry: string
    median: number
    p75: number
    p90: number
  }[]
}
```

#### Required SQL:
```sql
-- Portfolio Heat Map Data
WITH brand_performance AS (
  SELECT 
    b.id,
    b.name,
    b.industry,
    e.adi_score,
    e.industry_percentile,
    e.global_rank,
    b.annual_revenue_range,
    CASE 
      WHEN e.adi_score >= 80 AND e.industry_percentile >= 75 THEN 'exceeding'
      WHEN e.adi_score < 60 OR e.industry_percentile < 50 THEN 'action-required'
      ELSE 'at-risk'
    END as status,
    CASE 
      WHEN e.adi_score > LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) THEN 'up'
      WHEN e.adi_score < LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) THEN 'down'
      ELSE 'stable'
    END as trend
  FROM brands b
  JOIN evaluations e ON b.id = e.brand_id
  WHERE b.user_id = $1
    AND e.status = 'completed'
    AND e.completed_at = (
      SELECT MAX(completed_at) 
      FROM evaluations e2 
      WHERE e2.brand_id = b.id
    )
),
dimension_scores AS (
  SELECT 
    ds.evaluation_id,
    ds.dimension_name,
    ds.score
  FROM dimension_scores ds
  JOIN evaluations e ON ds.evaluation_id = e.id
  JOIN brands b ON e.brand_id = b.id
  WHERE b.user_id = $1
    AND e.status = 'completed'
)
SELECT 
  bp.*,
  json_object_agg(ds.dimension_name, ds.score) as dimensions
FROM brand_performance bp
LEFT JOIN dimension_scores ds ON bp.id = ds.evaluation_id
GROUP BY bp.id, bp.name, bp.industry, bp.adi_score, bp.industry_percentile, bp.global_rank, bp.annual_revenue_range, bp.status, bp.trend;
```

### 4. **Performance Trends** (`PerformanceTrends`)

#### Required Time-Series Data:
```sql
-- Performance Trends Query
WITH quarterly_trends AS (
  SELECT 
    DATE_TRUNC('quarter', e.completed_at) as quarter,
    AVG(e.adi_score) as avg_score,
    STDDEV(e.adi_score) as score_stddev,
    COUNT(*) as evaluation_count,
    AVG(e.confidence_interval) as avg_confidence,
    json_object_agg(
      ds.dimension_name, 
      json_build_object(
        'score', AVG(ds.score),
        'trend', CASE 
          WHEN AVG(ds.score) > LAG(AVG(ds.score)) OVER (PARTITION BY ds.dimension_name ORDER BY DATE_TRUNC('quarter', e.completed_at)) THEN 'up'
          WHEN AVG(ds.score) < LAG(AVG(ds.score)) OVER (PARTITION BY ds.dimension_name ORDER BY DATE_TRUNC('quarter', e.completed_at)) THEN 'down'
          ELSE 'stable'
        END
      )
    ) as dimension_trends
  FROM evaluations e
  JOIN brands b ON e.brand_id = b.id
  LEFT JOIN dimension_scores ds ON e.id = ds.evaluation_id
  WHERE b.user_id = $1
    AND e.status = 'completed'
    AND e.completed_at >= NOW() - INTERVAL '2 years'
  GROUP BY DATE_TRUNC('quarter', e.completed_at)
  ORDER BY quarter
)
SELECT * FROM quarterly_trends;
```

### 5. **Enhanced Benchmarks** (`EnhancedBenchmarks`)

#### Required Benchmark Data:
```sql
-- Enhanced Benchmarks Query
WITH user_performance AS (
  SELECT 
    AVG(e.adi_score) as user_avg_score,
    AVG(e.industry_percentile) as user_avg_percentile,
    COUNT(DISTINCT b.id) as user_brand_count
  FROM brands b
  JOIN evaluations e ON b.id = e.brand_id
  WHERE b.user_id = $1
    AND e.status = 'completed'
),
industry_distribution AS (
  SELECT 
    b.industry,
    COUNT(*) as brand_count,
    AVG(e.adi_score) as industry_avg,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY e.adi_score) as p25,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY e.adi_score) as p50,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY e.adi_score) as p75,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY e.adi_score) as p90
  FROM brands b
  JOIN evaluations e ON b.id = e.brand_id
  WHERE e.status = 'completed'
  GROUP BY b.industry
),
top_performers AS (
  SELECT 
    b.name,
    b.industry,
    e.adi_score,
    e.global_rank,
    ROW_NUMBER() OVER (ORDER BY e.adi_score DESC) as rank_position
  FROM brands b
  JOIN evaluations e ON b.id = e.brand_id
  WHERE e.status = 'completed'
  ORDER BY e.adi_score DESC
  LIMIT 10
)
SELECT 
  up.*,
  json_agg(id.*) as industry_benchmarks,
  json_agg(tp.*) as top_performers
FROM user_performance up
CROSS JOIN industry_distribution id
CROSS JOIN top_performers tp
GROUP BY up.user_avg_score, up.user_avg_percentile, up.user_brand_count;
```

---

## 🎛️ CMS Integration Strategy

### 1. **Dashboard Content Management**

#### New CMS Tables Required:
```sql
-- Dashboard Content Blocks
CREATE TABLE dashboard_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type VARCHAR(50) NOT NULL, -- 'executive_summary', 'alert_template', 'insight_card'
  title VARCHAR(255),
  content TEXT NOT NULL,
  metadata JSONB, -- For dynamic content like variables, formatting
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard Templates
CREATE TABLE dashboard_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'executive', 'analyst', 'cmo'
  content_structure JSONB NOT NULL, -- Defines which blocks to show
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Dashboard Preferences
CREATE TABLE user_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  template_id UUID REFERENCES dashboard_templates(id),
  custom_settings JSONB, -- Widget positions, alert thresholds
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### CMS API Endpoints:
```typescript
// /api/cms/dashboard-content
export async function GET(request: NextRequest) {
  const { blockType, templateType } = request.nextUrl.searchParams
  
  const content = await db.query(`
    SELECT dc.*, dt.template_name
    FROM dashboard_content_blocks dc
    LEFT JOIN dashboard_templates dt ON dc.template_id = dt.id
    WHERE dc.block_type = $1 
      AND dc.is_active = true
      AND ($2 IS NULL OR dt.template_type = $2)
  `, [blockType, templateType])
  
  return NextResponse.json({ content })
}

// /api/cms/dashboard-templates
export async function GET(request: NextRequest) {
  const templates = await db.query(`
    SELECT * FROM dashboard_templates 
    WHERE is_active = true
    ORDER BY is_default DESC, created_at DESC
  `)
  
  return NextResponse.json({ templates })
}
```

### 2. **Dynamic Content Generation**

#### Executive Summary Templates:
```typescript
interface ExecutiveSummaryTemplate {
  id: string
  templateName: string
  contentStructure: {
    portfolioHealth: {
      enabled: boolean
      thresholds: {
        critical: number
        warning: number
        success: number
      }
    }
    priorityAlerts: {
      enabled: boolean
      maxAlerts: number
      alertTypes: string[]
    }
    recommendations: {
      enabled: boolean
      maxRecommendations: number
      categories: string[]
    }
  }
  dynamicContent: {
    variables: string[] // ['{avgScore}', '{totalBrands}', '{industryPercentile}']
    templates: {
      [key: string]: string // Template strings with variables
    }
  }
}
```

#### CMS Content Examples:
```json
{
  "executiveSummaryTemplates": [
    {
      "id": "exec_summary_1",
      "templateName": "Portfolio Strengthening",
      "contentStructure": {
        "portfolioHealth": { "enabled": true },
        "priorityAlerts": { "enabled": true, "maxAlerts": 3 },
        "recommendations": { "enabled": true, "maxRecommendations": 2 }
      },
      "dynamicContent": {
        "variables": ["{avgScore}", "{totalBrands}", "{aboveBenchmark}"],
        "templates": {
          "opening": "Portfolio strengthening: {aboveBenchmark} of {totalBrands} brands trending upward with statistically significant improvements (p < 0.05)",
          "context": "Industry context: Athletic Footwear sector benchmark rose 8 points; maintaining {avgScore}-point average keeps portfolio in 82nd percentile",
          "recommendation": "Recommended action: Immediate review of Technical Foundation dimension for declining brands; replicate Shopping Experience Quality approach across portfolio"
        }
      }
    }
  ]
}
```

### 3. **Business Intelligence Layer**

#### Analytics Engine:
```typescript
// /lib/analytics/dashboard-analytics.ts
export class DashboardAnalytics {
  
  // Portfolio Health Analysis
  async getPortfolioHealth(userId: string): Promise<PortfolioHealthSummary> {
    const metrics = await this.calculatePortfolioMetrics(userId)
    const trends = await this.calculateTrendAnalysis(userId)
    const benchmarks = await this.calculateBenchmarkComparison(userId)
    
    return {
      ...metrics,
      trends,
      benchmarks,
      insights: await this.generateInsights(metrics, trends, benchmarks)
    }
  }
  
  // Priority Alerts Generation
  async generatePriorityAlerts(userId: string): Promise<PriorityAlert[]> {
    const scoreChanges = await this.detectScoreChanges(userId)
    const statisticalSignificance = await this.calculateStatisticalSignificance(scoreChanges)
    const recommendations = await this.generateRecommendations(scoreChanges)
    
    return this.formatAlerts(scoreChanges, statisticalSignificance, recommendations)
  }
  
  // Trend Analysis
  async analyzeTrends(userId: string): Promise<TrendAnalysis> {
    const timeSeriesData = await this.getTimeSeriesData(userId)
    const seasonality = await this.detectSeasonality(timeSeriesData)
    const forecasting = await this.generateForecasts(timeSeriesData)
    
    return {
      timeSeries: timeSeriesData,
      seasonality,
      forecasting,
      insights: await this.generateTrendInsights(timeSeriesData, seasonality)
    }
  }
  
  // Benchmark Analysis
  async analyzeBenchmarks(userId: string): Promise<BenchmarkAnalysis> {
    const userPerformance = await this.getUserPerformance(userId)
    const industryBenchmarks = await this.getIndustryBenchmarks(userPerformance.industries)
    const competitiveAnalysis = await this.getCompetitiveAnalysis(userId)
    
    return {
      userPerformance,
      industryBenchmarks,
      competitiveAnalysis,
      percentileRankings: await this.calculatePercentileRankings(userPerformance, industryBenchmarks)
    }
  }
}
```

---

## 📊 Data Pipeline Architecture

### 1. **Real-Time Data Processing**

```typescript
// /lib/data-pipeline/dashboard-pipeline.ts
export class DashboardDataPipeline {
  
  // Real-time evaluation processing
  async processEvaluationResult(evaluationId: string): Promise<void> {
    // 1. Update portfolio metrics
    await this.updatePortfolioMetrics(evaluationId)
    
    // 2. Generate new alerts
    await this.generateAlerts(evaluationId)
    
    // 3. Update trend data
    await this.updateTrendData(evaluationId)
    
    // 4. Refresh benchmarks
    await this.refreshBenchmarks(evaluationId)
    
    // 5. Cache dashboard data
    await this.cacheDashboardData(evaluationId)
  }
  
  // Batch processing for historical data
  async processHistoricalData(userId: string): Promise<void> {
    const evaluations = await this.getUserEvaluations(userId)
    
    for (const evaluation of evaluations) {
      await this.processEvaluationResult(evaluation.id)
    }
    
    // Generate comprehensive insights
    await this.generateComprehensiveInsights(userId)
  }
}
```

### 2. **Caching Strategy**

```typescript
// /lib/cache/dashboard-cache.ts
export class DashboardCache {
  
  // Cache portfolio summary
  async cachePortfolioSummary(userId: string, data: PortfolioSummary): Promise<void> {
    await redis.setex(
      `dashboard:portfolio:${userId}`, 
      300, // 5 minutes
      JSON.stringify(data)
    )
  }
  
  // Cache trend data
  async cacheTrendData(userId: string, data: TrendData): Promise<void> {
    await redis.setex(
      `dashboard:trends:${userId}`,
      600, // 10 minutes
      JSON.stringify(data)
    )
  }
  
  // Cache benchmark data
  async cacheBenchmarkData(industry: string, data: BenchmarkData): Promise<void> {
    await redis.setex(
      `dashboard:benchmarks:${industry}`,
      1800, // 30 minutes
      JSON.stringify(data)
    )
  }
}
```

---

## 🎯 Implementation Roadmap

### Phase 1: Data Foundation (Week 1-2)
1. **Create Analytics Engine** (`/lib/analytics/dashboard-analytics.ts`)
2. **Build Data Pipeline** (`/lib/data-pipeline/dashboard-pipeline.ts`)
3. **Implement Caching Layer** (`/lib/cache/dashboard-cache.ts`)
4. **Create New API Endpoints**:
   - `/api/dashboard/portfolio-summary`
   - `/api/dashboard/priority-alerts`
   - `/api/dashboard/performance-trends`
   - `/api/dashboard/benchmarks`

### Phase 2: CMS Integration (Week 3-4)
1. **Create CMS Tables** for dashboard content
2. **Build CMS API Endpoints** for dynamic content
3. **Create Content Templates** for executive summaries
4. **Implement Dynamic Content Generation**

### Phase 3: Dashboard Enhancement (Week 5-6)
1. **Replace Mock Data** with real API calls
2. **Implement Real-Time Updates** using WebSockets
3. **Add Advanced Analytics** (statistical significance, forecasting)
4. **Create Export Functionality** for reports

### Phase 4: Business Intelligence (Week 7-8)
1. **Implement Machine Learning** for insights generation
2. **Add Predictive Analytics** for score forecasting
3. **Create Competitive Intelligence** features
4. **Build Advanced Filtering** and segmentation

---

## 🔧 Technical Requirements

### Database Enhancements:
```sql
-- Add indexes for dashboard queries
CREATE INDEX idx_evaluations_user_completed ON evaluations(brand_id, completed_at) 
WHERE status = 'completed';

CREATE INDEX idx_dimension_scores_evaluation ON dimension_scores(evaluation_id, dimension_name);

CREATE INDEX idx_brands_user_industry ON brands(user_id, industry);

-- Add materialized views for performance
CREATE MATERIALIZED VIEW portfolio_health_summary AS
SELECT 
  b.user_id,
  COUNT(DISTINCT b.id) as total_brands,
  AVG(e.adi_score) as avg_aidi_score,
  COUNT(CASE WHEN e.industry_percentile >= 75 THEN 1 END) as above_benchmark,
  COUNT(CASE WHEN e.adi_score < 60 THEN 1 END) as action_required,
  MAX(e.completed_at) as last_updated
FROM brands b
JOIN evaluations e ON b.id = e.brand_id
WHERE e.status = 'completed'
GROUP BY b.user_id;

-- Refresh materialized view every hour
CREATE OR REPLACE FUNCTION refresh_portfolio_health_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW portfolio_health_summary;
END;
$$ LANGUAGE plpgsql;
```

### API Rate Limiting:
```typescript
// /lib/rate-limiting/dashboard-limits.ts
export const dashboardRateLimits = {
  portfolioSummary: { requests: 100, window: '1h' },
  priorityAlerts: { requests: 200, window: '1h' },
  performanceTrends: { requests: 50, window: '1h' },
  benchmarks: { requests: 1000, window: '1h' } // Cached data
}
```

---

## 📈 Success Metrics

### Business Intelligence Quality:
- **Accuracy**: 95%+ accuracy in trend predictions
- **Relevance**: 90%+ of alerts result in actionable insights
- **Timeliness**: Real-time updates within 30 seconds
- **Completeness**: 100% of user brands included in analysis

### Performance Metrics:
- **API Response Time**: <200ms for cached data, <2s for computed data
- **Cache Hit Rate**: >80% for dashboard queries
- **Data Freshness**: <5 minutes for real-time metrics
- **Concurrent Users**: Support 1000+ simultaneous dashboard users

### User Experience:
- **Dashboard Load Time**: <3 seconds initial load
- **Real-Time Updates**: <1 second for new evaluation results
- **Export Performance**: <10 seconds for PDF generation
- **Mobile Performance**: <5 seconds on mobile devices

---

This comprehensive data architecture will transform the dashboard from a static mock interface into a dynamic, intelligent business intelligence platform that delivers real value to executives and provides actionable insights for improving AI visibility across their brand portfolio.
