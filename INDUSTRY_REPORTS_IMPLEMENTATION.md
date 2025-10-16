# Monthly Industry Report Series - Implementation Plan

## Executive Summary

This document outlines the implementation of a comprehensive monthly LLM-powered AI brand visibility report series across 10+ industry verticals. This feature positions AIDI as the authoritative data source for AI brand strategy.

## Business Value

### For Brand Managers
- Track brand presence in AI conversations vs. competitors
- Spot emerging threats before they appear in traditional channels
- ROI tracking for AI visibility efforts
- Executive-ready insights for board presentations

### For AIDI
- Premium subscription revenue stream ($99-499/month per sector)
- Thought leadership positioning
- Dataset moat (proprietary industry benchmarks)
- Lead generation for enterprise audit clients

## Technical Architecture

### 1. Database Schema

```sql
-- Industry sectors
CREATE TABLE industry_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prompt templates for each sector
CREATE TABLE sector_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES industry_sectors(id),
  prompt_text TEXT NOT NULL,
  prompt_type TEXT NOT NULL, -- 'head', 'mid-tail', 'long-tail'
  intent_category TEXT, -- 'research', 'comparison', 'recommendation', etc.
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Probe execution results
CREATE TABLE probe_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES industry_sectors(id),
  prompt_id UUID REFERENCES sector_prompts(id),
  model_id TEXT NOT NULL,
  run_date TIMESTAMPTZ NOT NULL,
  response_text TEXT,
  brands_mentioned JSONB, -- Array of {brand, position, context}
  sentiment JSONB, -- {brand: {score, context}}
  sources_cited JSONB,
  metadata JSONB, -- tokens, latency, model version
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aggregated monthly reports
CREATE TABLE industry_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES industry_sectors(id),
  report_month DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  summary JSONB, -- Executive summary data
  leaderboard JSONB, -- Brand rankings
  insights JSONB, -- Key findings, trends, threats
  pdf_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sector_id, report_month)
);

-- Report subscriptions
CREATE TABLE report_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  sector_id UUID REFERENCES industry_sectors(id),
  tier TEXT NOT NULL, -- 'free', 'pro', 'enterprise'
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_probe_results_sector_date ON probe_results(sector_id, run_date DESC);
CREATE INDEX idx_probe_results_model ON probe_results(model_id, run_date DESC);
CREATE INDEX idx_industry_reports_sector_month ON industry_reports(sector_id, report_month DESC);
CREATE INDEX idx_report_subscriptions_user ON report_subscriptions(user_id, status);
```

### 2. Core Components

#### A. Sector & Prompt Management (`/src/lib/industry-reports/`)

**Sectors Module** (`sectors.ts`)
```typescript
export interface Sector {
  id: string;
  slug: string;
  name: string;
  description: string;
  promptCount: number;
  lastReportDate?: Date;
}

export const INITIAL_SECTORS = [
  { slug: 'igaming', name: 'iGaming & Online Gambling', description: '...' },
  { slug: 'fashion', name: 'Fashion & Apparel', description: '...' },
  { slug: 'politics', name: 'Politics & Advocacy', description: '...' },
  { slug: 'cpg', name: 'CPG & FMCG', description: '...' },
  { slug: 'dtc', name: 'DTC Retail', description: '...' },
  { slug: 'fintech', name: 'Banking & Fintech', description: '...' },
  { slug: 'wellness', name: 'Health & Wellness', description: '...' },
  { slug: 'automotive', name: 'Mobility & Automotive', description: '...' },
  { slug: 'tech', name: 'Consumer Electronics', description: '...' },
  { slug: 'travel', name: 'Hospitality & Travel', description: '...' }
];
```

**Prompt Engineering** (`prompts.ts`)
```typescript
export interface SectorPrompt {
  id: string;
  text: string;
  type: 'head' | 'mid-tail' | 'long-tail';
  intentCategory: string;
  biasControls: {
    brandNeutral: boolean;
    temporalContext: string;
    geographicScope?: string;
  };
}

// Example for fashion sector
export const FASHION_PROMPTS: Omit<SectorPrompt, 'id'>[] = [
  {
    text: "What are the best minimalist sneaker brands for everyday wear in 2025?",
    type: 'head',
    intentCategory: 'recommendation',
    biasControls: { brandNeutral: true, temporalContext: '2025' }
  },
  {
    text: "I'm looking for sustainable athleisure brands. What should I consider?",
    type: 'mid-tail',
    intentCategory: 'research',
    biasControls: { brandNeutral: true, temporalContext: 'current' }
  },
  // 20-30 more...
];
```

#### B. LLM Probing Engine (`/src/lib/industry-reports/probe-engine.ts`)

```typescript
export class ProbeEngine {
  private models = ['gpt-4', 'claude-3-5-sonnet', 'gemini-pro', 'perplexity'];
  
  async runSectorProbe(sectorId: string, date: Date) {
    const prompts = await this.getActivePrompts(sectorId);
    const results = [];
    
    for (const prompt of prompts) {
      for (const model of this.models) {
        // Run 3 times for statistical stability
        const runs = await Promise.all([
          this.probe(model, prompt, 1),
          this.probe(model, prompt, 2),
          this.probe(model, prompt, 3)
        ]);
        
        results.push(this.aggregateRuns(runs, prompt, model));
      }
    }
    
    return this.saveResults(sectorId, results, date);
  }
  
  private async probe(model: string, prompt: SectorPrompt, runNumber: number) {
    const response = await this.callLLM(model, prompt.text);
    return {
      response,
      brands: this.extractBrands(response),
      sentiment: this.analyzeSentiment(response),
      sources: this.extractSources(response),
      metadata: { model, runNumber, timestamp: new Date() }
    };
  }
  
  private extractBrands(text: string): BrandMention[] {
    // NER + pattern matching to find brand mentions
    // Track position, context window, co-mentions
  }
  
  private analyzeSentiment(text: string): SentimentAnalysis {
    // Per-brand sentiment scoring
    // Context classification (positive/negative/neutral)
  }
}
```

#### C. Analysis & Insight Engine (`/src/lib/industry-reports/analyzer.ts`)

```typescript
export class ReportAnalyzer {
  async generateMonthlyReport(sectorId: string, month: Date) {
    const probeData = await this.getMonthProbeResults(sectorId, month);
    
    return {
      leaderboard: this.calculateLeaderboard(probeData),
      trends: this.identifyTrends(probeData),
      competitive: this.analyzeCompetitive(probeData),
      threats: this.detectEmergingThreats(probeData),
      recommendations: this.generateRecommendations(probeData)
    };
  }
  
  private calculateLeaderboard(data: ProbeResult[]): BrandRanking[] {
    // Aggregate metrics:
    // - Share of voice (% mentions across all prompts)
    // - Average position when mentioned
    // - Sentiment score
    // - Model coverage (how many models mention it)
    // - Recommendation rate (% of recommendation prompts)
  }
  
  private identifyTrends(data: ProbeResult[]): Trend[] {
    // Month-over-month changes
    // Seasonal patterns
    // Model-specific biases
  }
  
  private detectEmergingThreats(data: ProbeResult[]): Threat[] {
    // New brands appearing in top 5
    // Rapid growth trajectories
    // "AI-native" brand characteristics
  }
}
```

### 3. Admin UI Components

**Location**: `/src/app/admin/industry-reports/`

- **Dashboard** - Overview of all sectors, probe schedules, report status
- **Sector Manager** - Create/edit sectors, view performance
- **Prompt Library** - Manage prompts per sector, test prompts
- **Probe Runner** - Manual trigger, view logs, debug failures
- **Report Editor** - Review drafts, add editorial notes, publish

### 4. Public UI Components

**Location**: `/src/app/reports/`

- **Landing Page** (`/reports`) - Sector cards, sample insights, CTA
- **Sector Hub** (`/reports/[sector]`) - Latest report, archive, subscribe
- **Report Viewer** (`/reports/[sector]/[month]`) - Interactive report with charts
- **Subscription Portal** - Manage sectors, billing, preferences

### 5. API Endpoints

```
POST   /api/industry-reports/probe/run          - Trigger probe for sector
GET    /api/industry-reports/sectors           - List all sectors
GET    /api/industry-reports/[sector]/latest   - Latest report
GET    /api/industry-reports/[sector]/[month]  - Specific report
POST   /api/industry-reports/subscribe         - Subscribe to sector
GET    /api/industry-reports/prompts/[sector]  - Get sector prompts
POST   /api/industry-reports/prompts           - Create new prompt
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Database schema
- ✅ Sector definitions and initial prompts
- ✅ Basic probe engine with OpenAI/Anthropic
- ✅ Data storage pipeline

### Phase 2: Analysis & Reports (Week 3-4)
- Analysis engine for brand extraction and ranking
- Report generation logic
- PDF export functionality
- Admin dashboard for review

### Phase 3: Public Interface (Week 5-6)
- Landing page and sector hubs
- Report viewer with interactive charts
- Gating logic (free preview, full access tiers)
- Email notification system

### Phase 4: Commercialization (Week 7-8)
- Stripe integration for subscriptions
- Tiered access control (free/pro/enterprise)
- Lead capture and CRM integration
- Analytics and conversion tracking

### Phase 5: Automation & Scale (Week 9-10)
- Scheduled monthly probe runs
- Automated report generation
- Email distribution
- Monitoring and alerting

## Pricing Strategy

### Free Tier
- Executive summary only
- Top 10 brands in leaderboard
- 1 month archive access
- Email preview each month

### Pro Tier ($99/month per sector)
- Full report access
- Complete leaderboard (50+ brands)
- 12 month archive
- Downloadable PDFs
- Weekly trend alerts

### Enterprise Tier ($499/month per sector)
- All Pro features
- Brand-specific deep dives
- Custom prompt requests
- API access to raw data
- Quarterly strategy calls

## Success Metrics

### Engagement
- Report views per sector
- Time spent on reports
- Archive navigation depth
- PDF downloads

### Conversion
- Free → Pro conversion rate (target: 5%)
- Pro → Enterprise conversion rate (target: 10%)
- Average sectors per subscriber (target: 2.5)
- Churn rate (target: <5%/month)

### Revenue
- MRR per sector
- Customer lifetime value
- CAC payback period
- Enterprise contract value

## Next Steps

1. **Immediate** - Complete database schema and seed initial sectors
2. **This Week** - Build probe engine core with 3 models
3. **Next Week** - Run pilot probes for iGaming and Fashion
4. **Month 1 Goal** - Publish first 2 industry reports and open beta signups

---

**Status**: Ready to implement
**Owner**: Engineering + Product
**Timeline**: 10 weeks to full production
**Investment**: ~$5K/month in LLM API costs at scale

