# AI Visibility Score - Three-Tier Pricing Implementation Plan

## 🎯 Pricing Strategy Overview

### Tier Structure: Free → Premium → Professional
**Goal**: Maximize conversion from free to premium (£19.99) with clear value proposition, then upsell to professional (£89.99) for advanced features.

## 💰 Detailed Pricing Analysis

### Tier 1: Free (£0/month)
**Target Cost**: <£1 per evaluation
**Implementation**: GPT-4o mini only

```typescript
const FREE_TIER_CONFIG = {
  evaluationsPerMonth: 3,
  evaluationsPerBrand: 1, // Prevent brand spam
  aiProvider: 'gpt-4o-mini',
  tokenLimit: 3000,
  dimensions: 5, // Simplified scoring
  processingTime: '48 hours',
  features: [
    'basic_evaluation',
    'pdf_report',
    'email_notification'
  ],
  costPerEvaluation: 0.75, // £0.75 using GPT-4o mini
  monthlyCostPerUser: 2.25 // 3 × £0.75
}
```

### Tier 2: Premium (£19.99/month)
**Target Margin**: 60%+
**Value Proposition**: Professional insights with all AI models

```typescript
const PREMIUM_TIER_CONFIG = {
  evaluationsPerMonth: 25,
  evaluationsPerBrand: 5,
  aiProviders: ['gpt-4', 'claude-3', 'gemini-pro', 'mistral', 'llama'],
  tokenLimit: 15000,
  dimensions: 10, // Full ADI framework
  processingTime: 'real-time',
  features: [
    'multi_model_consensus',
    'advanced_reporting',
    'leaderboard_access',
    'trend_analysis',
    'email_alerts',
    'competitor_comparison',
    'industry_benchmarks'
  ],
  costPerEvaluation: 2.50, // £2.50 for 5-model consensus
  monthlyCostPerUser: 62.50, // 25 × £2.50
  grossMargin: 68.7% // (£19.99 - £6.25) / £19.99
}
```

### Tier 3: Professional (£89.99/month)
**Target Margin**: 70%+
**Value Proposition**: Enterprise-grade monitoring and API access

```typescript
const PROFESSIONAL_TIER_CONFIG = {
  evaluationsPerMonth: 200,
  evaluationsPerBrand: 20,
  aiProviders: ['gpt-4', 'claude-3', 'gemini-pro', 'mistral', 'llama'],
  tokenLimit: 20000,
  dimensions: 10,
  processingTime: 'priority',
  features: [
    ...PREMIUM_TIER_CONFIG.features,
    'aidi_monitoring',
    'api_access',
    'white_label_reports',
    'custom_integrations',
    'priority_support',
    'bulk_operations',
    'advanced_analytics',
    'data_export'
  ],
  costPerEvaluation: 2.50,
  monthlyCostPerUser: 500, // 200 × £2.50
  grossMargin: 82.2% // (£89.99 - £16.00) / £89.99
}
```

## 🔧 Implementation Architecture

### 1. Subscription Management System

```typescript
interface SubscriptionTier {
  id: string
  name: 'free' | 'premium' | 'professional'
  priceGBP: number
  limits: UsageLimits
  features: FeatureSet
  aiProviders: AIProviderConfig[]
}

interface UsageLimits {
  evaluationsPerMonth: number
  evaluationsPerBrand: number
  evaluationsPerDay: number
  concurrentEvaluations: number
  apiCallsPerMonth?: number
  storageGB: number
}

interface FeatureSet {
  multiModelConsensus: boolean
  realTimeProcessing: boolean
  advancedReporting: boolean
  leaderboardAccess: boolean
  aidiMonitoring: boolean
  apiAccess: boolean
  prioritySupport: boolean
  whiteLabeling: boolean
}
```

### 2. Cost Control Implementation

```typescript
class CostController {
  private readonly COST_LIMITS = {
    free: { daily: 50, monthly: 1500 }, // £50/day, £1500/month
    premium: { daily: 200, monthly: 6000 },
    professional: { daily: 1000, monthly: 30000 }
  }

  async checkCostLimits(userId: string, tier: string): Promise<boolean> {
    const usage = await this.getCurrentUsage(userId)
    const limits = this.COST_LIMITS[tier]
    
    return usage.dailyCost < limits.daily && 
           usage.monthlyCost < limits.monthly
  }

  async trackEvaluationCost(
    userId: string, 
    evaluationId: string, 
    cost: number
  ): Promise<void> {
    await this.db.usageTracking.create({
      userId,
      evaluationId,
      cost,
      timestamp: new Date(),
      tier: await this.getUserTier(userId)
    })
  }
}
```

### 3. Evaluation Queue Management

```typescript
interface EvaluationQueue {
  priority: 'low' | 'normal' | 'high'
  estimatedWaitTime: number
  maxConcurrent: number
}

const QUEUE_CONFIG = {
  free: {
    priority: 'low',
    estimatedWaitTime: 48 * 60 * 60, // 48 hours
    maxConcurrent: 1
  },
  premium: {
    priority: 'normal',
    estimatedWaitTime: 5 * 60, // 5 minutes
    maxConcurrent: 2
  },
  professional: {
    priority: 'high',
    estimatedWaitTime: 60, // 1 minute
    maxConcurrent: 5
  }
}
```

## 📊 Market Reindexing Strategy

### Reindexing Schedule & Costs

```typescript
interface ReindexingStrategy {
  globalLeaderboards: {
    frequency: 'weekly',
    day: 'sunday',
    time: '02:00 UTC',
    estimatedEvaluations: 1000,
    costPerReindex: 250, // £250
    annualCost: 13000 // £13,000
  },
  industryBenchmarks: {
    frequency: 'bi-weekly',
    estimatedEvaluations: 500,
    costPerReindex: 125,
    annualCost: 3250
  },
  trendingAnalysis: {
    frequency: 'daily',
    estimatedEvaluations: 100,
    costPerReindex: 25,
    annualCost: 9125
  },
  competitorUpdates: {
    frequency: 'monthly',
    estimatedEvaluations: 2000,
    costPerReindex: 500,
    annualCost: 6000
  }
}

// Total annual reindexing cost: £31,375
```

### Smart Reindexing Optimization

```typescript
class SmartReindexer {
  async shouldReindex(category: string): Promise<boolean> {
    const lastUpdate = await this.getLastUpdate(category)
    const significantChanges = await this.detectSignificantChanges(category)
    const userDemand = await this.getUserDemandMetrics(category)
    
    return significantChanges > 0.1 || // 10% change threshold
           userDemand > 0.8 || // High user interest
           this.isScheduledUpdate(category, lastUpdate)
  }

  async optimizeReindexing(): Promise<void> {
    // Only reindex categories with significant changes or high demand
    // Reduces reindexing costs by ~40%
  }
}
```

## 🛡️ API Usage Monitoring & Control

### Real-time Monitoring System

```typescript
interface APIMonitor {
  trackUsage(request: APIRequest): void
  checkLimits(userId: string): Promise<boolean>
  alertOnThreshold(userId: string, threshold: number): void
  generateUsageReport(period: string): UsageReport
}

class APIUsageTracker implements APIMonitor {
  private readonly ALERT_THRESHOLDS = [50, 75, 90, 95] // Percentage of limits

  async trackUsage(request: APIRequest): Promise<void> {
    const usage = {
      userId: request.userId,
      provider: request.provider,
      model: request.model,
      inputTokens: request.inputTokens,
      outputTokens: request.outputTokens,
      cost: this.calculateCost(request),
      timestamp: new Date()
    }

    await this.db.apiUsage.create(usage)
    await this.checkAndAlert(request.userId)
  }

  async checkLimits(userId: string): Promise<boolean> {
    const tier = await this.getUserTier(userId)
    const usage = await this.getCurrentUsage(userId)
    const limits = this.getTierLimits(tier)

    return usage.monthlyTokens < limits.monthlyTokens &&
           usage.monthlyCost < limits.monthlyCost &&
           usage.dailyRequests < limits.dailyRequests
  }
}
```

### Cost Prediction & Alerts

```typescript
interface CostPredictor {
  predictMonthlyCost(userId: string): Promise<number>
  alertOnProjectedOverage(userId: string): Promise<void>
  suggestOptimizations(userId: string): Promise<Optimization[]>
}

class SmartCostPredictor implements CostPredictor {
  async predictMonthlyCost(userId: string): Promise<number> {
    const currentUsage = await this.getCurrentUsage(userId)
    const daysInMonth = new Date().getDate()
    const remainingDays = 30 - daysInMonth
    
    const dailyAverage = currentUsage.monthlyCost / daysInMonth
    return currentUsage.monthlyCost + (dailyAverage * remainingDays)
  }

  async suggestOptimizations(userId: string): Promise<Optimization[]> {
    const usage = await this.getDetailedUsage(userId)
    const suggestions = []

    if (usage.duplicateEvaluations > 0.1) {
      suggestions.push({
        type: 'reduce_duplicates',
        potentialSavings: usage.duplicateEvaluations * 0.8,
        description: 'Use cached results for similar evaluations'
      })
    }

    if (usage.offPeakUsage < 0.3) {
      suggestions.push({
        type: 'schedule_off_peak',
        potentialSavings: usage.peakCost * 0.2,
        description: 'Schedule non-urgent evaluations during off-peak hours'
      })
    }

    return suggestions
  }
}
```

## 🎯 Conversion Strategy

### Free to Premium Conversion Tactics

```typescript
interface ConversionStrategy {
  triggers: ConversionTrigger[]
  incentives: ConversionIncentive[]
  timing: ConversionTiming
}

const CONVERSION_TACTICS = {
  limitReached: {
    trigger: 'monthly_limit_reached',
    message: 'Unlock unlimited evaluations with Premium',
    incentive: '50% off first month',
    timing: 'immediate'
  },
  qualityDifference: {
    trigger: 'evaluation_completed',
    message: 'See how Premium 5-model consensus improves accuracy',
    incentive: 'free_premium_sample',
    timing: 'after_first_evaluation'
  },
  competitorInsight: {
    trigger: 'competitor_mentioned',
    message: 'Compare against competitors with Premium',
    incentive: 'free_competitor_analysis',
    timing: 'contextual'
  }
}
```

### Premium to Professional Conversion

```typescript
const PROFESSIONAL_UPSELL = {
  apiUsage: {
    trigger: 'api_interest_shown',
    message: 'Integrate AI Visibility Score into your workflow',
    incentive: 'free_api_trial',
    timing: 'after_10_evaluations'
  },
  bulkOperations: {
    trigger: 'multiple_brands_added',
    message: 'Manage multiple brands efficiently with Professional',
    incentive: 'bulk_discount',
    timing: 'after_5_brands'
  },
  monitoring: {
    trigger: 'regular_usage_pattern',
    message: 'Get automated AIDI monitoring alerts',
    incentive: 'free_monitoring_setup',
    timing: 'after_30_days'
  }
}
```

## 📈 Revenue Projections (Revised)

### Optimistic Scenario (1,000 users)
```
User Distribution:
- Free: 600 users (£0 revenue, £1,350 cost)
- Premium: 350 users (£6,997 revenue, £2,188 cost)
- Professional: 50 users (£4,500 revenue, £800 cost)

Monthly Totals:
- Revenue: £11,497
- Costs: £4,338
- Gross Profit: £7,159 (62% margin)
- Net Profit: £4,659 (after £2,500 operational costs)
```

### Conservative Scenario (1,000 users)
```
User Distribution:
- Free: 700 users (£0 revenue, £1,575 cost)
- Premium: 250 users (£4,998 revenue, £1,563 cost)
- Professional: 50 users (£4,500 revenue, £800 cost)

Monthly Totals:
- Revenue: £9,498
- Costs: £3,938
- Gross Profit: £5,560 (59% margin)
- Net Profit: £3,060 (after £2,500 operational costs)
```

## 🚀 Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)
- [ ] Implement tier-based evaluation engine
- [ ] Add subscription management system
- [ ] Deploy usage tracking and limits
- [ ] Create cost monitoring dashboard

### Phase 2: Features (Weeks 5-8)
- [ ] Build premium reporting features
- [ ] Implement leaderboard access controls
- [ ] Add AIDI monitoring system
- [ ] Create API access layer

### Phase 3: Optimization (Weeks 9-12)
- [ ] Deploy smart caching system
- [ ] Implement conversion tracking
- [ ] Add cost prediction alerts
- [ ] Launch automated upselling

### Phase 4: Scale (Weeks 13-16)
- [ ] Optimize reindexing strategy
- [ ] Add bulk operations for Professional
- [ ] Implement white-label features
- [ ] Deploy advanced analytics

This implementation plan provides a clear path to profitable, scalable operations with strong conversion funnels and cost controls.