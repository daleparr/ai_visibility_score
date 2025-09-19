
# 📊 Data Visibility Guide: Where to See Crawl, Evaluation & Federated Learning Data

## 🗄️ Database Tables Overview

Based on the Neon database interface shown, you can access all data through the **Tables** section. Here's where each type of data will be visible:

## 🕷️ CRAWL DATA

### **Primary Tables**
1. **`website_snapshots`** - Complete website crawl data
   - Raw HTML content from crawled pages
   - Structured content extraction
   - Page metadata and performance metrics
   - Screenshots and load times
   - Content change detection hashes

2. **`content_changes`** - Website change tracking
   - Content updates and modifications
   - Structure changes and new features
   - Impact scoring for changes
   - Historical change timeline

### **Access Methods**
```sql
-- View latest crawl data for Gymshark
SELECT * FROM website_snapshots 
WHERE url LIKE '%gymshark%' 
ORDER BY crawl_timestamp DESC;

-- See content changes over time
SELECT * FROM content_changes 
WHERE website_snapshot_id IN (
  SELECT id FROM website_snapshots WHERE url LIKE '%gymshark%'
) ORDER BY detected_at DESC;
```

### **API Access**
```bash
# Get crawl data via API
curl "https://ai-discoverability-index.netlify.app/api/crawl-data?brand=Gymshark"
```

## 📊 EVALUATION DATA

### **Primary Tables**
1. **`evaluations`** - Core evaluation results
   - Overall ADI scores and grades
   - Confidence intervals and reliability scores
   - Industry percentiles and global rankings
   - Evaluation status and completion times

2. **`dimension_scores`** - Detailed dimension analysis
   - Individual scores for all 9 ADI dimensions
   - Explanations and recommendations per dimension
   - Performance breakdowns

3. **`adi_agents`** - Agent execution tracking
   - Individual agent performance and results
   - Execution times and success rates
   - Input/output data for each agent

4. **`adi_agent_results`** - Detailed agent outputs
   - Raw values and normalized scores
   - Confidence levels and evidence
   - Result types and classifications

5. **`leaderboard_cache`** - Real-time leaderboard data
   - Current rankings and scores
   - Pillar breakdowns and highlights
   - Trend data and competitive positioning

### **Access Methods**
```sql
-- View Gymshark's latest evaluation
SELECT e.*, ds.dimension_name, ds.score, ds.explanation
FROM evaluations e
LEFT JOIN dimension_scores ds ON e.id = ds.evaluation_id
WHERE e.brand_id IN (SELECT id FROM brands WHERE name LIKE '%Gymshark%')
ORDER BY e.created_at DESC;

-- See agent performance for evaluation
SELECT aa.agent_name, aa.status, aa.execution_time_ms, aar.result_type, aar.normalized_score
FROM adi_agents aa
LEFT JOIN adi_agent_results aar ON aa.id = aar.agent_id
WHERE aa.evaluation_id = 'your-evaluation-id'
ORDER BY aa.created_at;
```

### **API Access**
```bash
# Get evaluation data
curl "https://ai-discoverability-index.netlify.app/api/evaluations?brand=Gymshark"

# Get leaderboard position
curl "https://ai-discoverability-index.netlify.app/api/leaderboards?type=niche&category=Activewear%20%26%20Athleisure"
```

## 🤖 FEDERATED LEARNING DATA

### **Primary Tables**
1. **`federated_learning_sessions`** - User interaction data
   - Anonymized user behavior patterns
   - UI interaction tracking
   - Search behavior analysis
   - Comparison analysis data

2. **`model_improvements`** - AI model enhancement tracking
   - Scoring accuracy improvements
   - Dimension weight optimizations
   - Agent performance enhancements
   - User satisfaction metrics

3. **`user_engagement_metrics`** - User behavior analytics
   - Evaluation requests and usage patterns
   - Leaderboard viewing behavior
   - Report downloads and interactions
   - Conversion events and satisfaction scores

### **Access Methods**
```sql
-- View federated learning insights
SELECT session_type, COUNT(*) as sessions, 
       AVG(contribution_score) as avg_contribution
FROM federated_learning_sessions 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY session_type;

-- See model improvements over time
SELECT improvement_type, baseline_metric, improved_metric, 
       improvement_percentage, model_version
FROM model_improvements 
ORDER BY created_at DESC;

-- Analyze user engagement patterns
SELECT engagement_type, COUNT(*) as interactions,
       AVG(duration_seconds) as avg_duration,
       AVG(satisfaction_score) as avg_satisfaction
FROM user_engagement_metrics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY engagement_type;
```

### **API Access**
```bash
# Get federated learning insights
curl "https://ai-discoverability-index.netlify.app/api/federated-learning/insights"

# Get model improvement metrics
curl "https://ai-discoverability-index.netlify.app/api/model-improvements"
```

## 🎯 NEON DATABASE ACCESS

### **Direct Database Access**
1. **Neon Console**: Use the Tables interface shown in your screenshot
2. **SQL Editor**: Run custom queries in the Neon SQL Editor
3. **Database Studio**: Use `npm run db:studio` for local Drizzle Studio
4. **API Endpoints**: Access data via production APIs

### **Table Navigation in Neon**
From your screenshot, I can see the existing tables. After migration completion, you'll also see:

**New Tables Added:**
- `evaluation_queue` - Brand evaluation management
- `leaderboard_cache` - Real-time leaderboard data
- `competitive_triggers` - Auto-evaluation triggers
- `niche_brand_selection` - Curated brand selections
- `leaderboard_stats` - Analytics and metrics
- `federated_learning_sessions` - User interaction data
- `model_improvements` - AI enhancement tracking
- `website_snapshots` - Crawl data storage
- `content_changes` - Change detection
- `evaluation_cache` - Performance optimization
- `cache_performance` - Cache analytics
- `evaluation_trends` - Trend analysis
- `predictive_insights` - AI forecasting
- `competitive_analysis` - Competitive intelligence
- `user_engagement_metrics` - User behavior
- `system_performance_metrics` - System monitoring

## 📱 DASHBOARD ACCESS

### **Admin Dashboard** (Future Enhancement)
```typescript
// Planned dashboard routes for data visualization
/dashboard/admin/crawl-data      // Website crawl monitoring
/dashboard/admin/evaluations     // Evaluation results and analytics
/dashboard/admin/federated       // Federated learning insights
/dashboard/admin/performance     // System performance metrics
```

### **API Dashboard Endpoints**
```bash
# Crawl data dashboard
curl "https://ai-discoverability-index.netlify.app/api/admin/crawl-dashboard"

# Evaluation analytics
curl "https://ai-discoverability-index.netlify.app/api/admin/evaluation-analytics"

# Federated learning insights
curl "https://ai-discoverability-index.netlify.app/api/admin/federated-insights"
```

## 🔍 SPECIFIC DATA QUERIES

### **Gymshark Crawl Data**
```sql
-- See Gymshark's website snapshots
SELECT url, page_type, content_size_bytes, load_time_ms, 
       crawl_timestamp, status_code
FROM website_snapshots 
WHERE url LIKE '%gymshark%' 
ORDER BY crawl_timestamp DESC;
```

### **Gymshark Evaluation Data**
```sql
-- See Gymshark's ADI evaluation results
SELECT b.name, e.adi_score, e.grade, e.industry_percentile,
       e.strongest_dimension, e.weakest_dimension, e.completed_at
FROM brands b
JOIN evaluations e ON b.id = e.brand_id
WHERE b.name LIKE '%Gymshark%'
ORDER BY e.completed_at DESC;
```

### **Federated Learning Insights**
```sql
-- See user interaction patterns
SELECT session_type, COUNT(*) as sessions,
       AVG(contribution_score) as avg_contribution
FROM federated_learning_sessions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY session_type;
```

## 🎛️ MONITORING DASHBOARD

### **Real-time Data Access**
```bash
# System overview
curl "https://ai-discoverability-index.netlify.app/api/admin/dashboard"

# Crawl status
curl "https://ai-discoverability-index.netlify.app/api/admin/crawl-status"

# Evaluation progress
curl "https://ai-discoverability-index.netlify.app/api/admin/evaluation-progress"

# Federated learning metrics
curl "https://ai-discoverability-index.netlify.app/api/admin/federated-metrics"
```

## 📊 DATA VISUALIZATION LOCATIONS

### **1. Neon Database Console** (Current)
- **Tables Tab**: Direct access to all raw data
- **SQL Editor**: Custom queries and analysis
- **Monitoring**: Database performance and usage

### **2. Production API Endpoints** (Live)
- **Structured Data**: JSON responses for applications
- **Real-time Access**: Current data with caching
- **Filtered Views**: Specific data subsets

### **3. Admin Dashboard** (Future)
- **Visual Analytics**: Charts and graphs
- **Real-time Monitoring**: Live data updates
- **Export Functions**: Data download and reporting

## 🎯 SUMMARY

**Where You'll See the Data:**

### **Crawl Data**: 
- **Neon Tables**: `website_snapshots`, `content_changes`
- **API**: `/api/crawl-data`, `/api/admin/crawl-status`

### **Evaluation Data**: 
- **Neon Tables**: `evaluations`, `dimension_scores`, `adi_agents`, `adi_agent_results`, `leaderboard_cache`
- **API**: `/api/evaluations`, `/api/leaderboards`, `/api/admin/evaluation-analytics`

### **Federated Learning Data**: 
- **Neon Tables**: `federated_learning_sessions`, `model_improvements`, `user_engagement_metrics`
- **API**: `/api/federated-learning/insights`, `/api/admin/federated-metrics`

**Current Access**: Use the Neon Tables interface shown in your screenshot to browse all data directly. The migration is adding 16 new tables that will appear in this same interface once completed.

**Production APIs**: All data accessible via https://ai-discoverability-index.netlify.app API endpoints for programmatic access and dashboard integration.
</result>
</attempt_completion>