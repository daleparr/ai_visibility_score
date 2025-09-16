# AI Visibility Score - Backend Improvements Architecture

## 🎯 Objective
Design backend improvements to support a three-tier pricing model with cost-effective free evaluations (<£1) and premium features for paid tiers.

## 💰 Cost Analysis for Free Tier

### Current OpenAI Pricing (GPT Models)
- **GPT-4o mini**: $0.15/1M input tokens, $0.60/1M output tokens
- **GPT-3.5 Turbo**: $0.50/1M input tokens, $2.00/1M output tokens
- **GPT-4**: $30/1M input tokens, $60/1M output tokens

### Free Tier Cost Target: <£1 per evaluation

**Using GPT-4o mini (cheapest option):**
- Average cost: $0.375/1M tokens (blended input/output)
- Target: £1 = ~$1.25 per evaluation
- Token budget: ~3,333 tokens per evaluation
- **Recommendation**: Use GPT-4o mini with 3K token limit for free tier

## 🏗️ Three-Tier Architecture Design

### Tier 1: Free (£0/month)
**Features:**
- 3 evaluations per month per brand
- GPT-4o mini only
- Basic scoring (simplified 5-dimension model)
- 48-hour evaluation processing
- Basic PDF report

**Cost per evaluation:** ~£0.75
**Monthly cost (3 evals):** ~£2.25 per user

### Tier 2: Premium (£19.99/month)
**Features:**
- 25 evaluations per month
- All 5 AI models (consensus scoring)
- Full 10-dimension ADI framework
- Real-time evaluation processing
- Advanced reporting & analytics
- Leaderboard access
- Email alerts

**Cost per evaluation:** ~£2.50 (5 models)
**Monthly cost (25 evals):** ~£62.50 per user

### Tier 3: Professional (£89.99/month)
**Features:**
- 200 evaluations per month
- All premium features plus:
- AIDI monitoring & alerts
- Competitor benchmarking
- API access
- White-label reports
- Priority support
- Custom integrations

**Cost per evaluation:** ~£2.50 (5 models)
**Monthly cost (200 evals):** ~£500 per user

## 🔧 Backend Implementation Strategy

### 1. Evaluation Engine Redesign

```typescript
interface EvaluationTier {
  name: 'free' | 'premium' | 'professional'
  aiProviders: AIProviderName[]
  dimensions: DimensionName[]
  tokenLimit: number
  processingPriority: 'low' | 'normal' | 'high'
  features: FeatureSet
}

const TIER_CONFIGURATIONS: Record<string, EvaluationTier> = {
  free: {
    name: 'free',
    aiProviders: ['openai-mini'],
    dimensions: ['schema', 'semantic', 'citation', 'commerce', 'sentiment'],
    tokenLimit: 3000,
    processingPriority: 'low',
    features: ['basic_report']
  },
  premium: {
    name: 'premium',
    aiProviders: ['openai', 'anthropic', 'google', 'mistral', 'llama'],
    dimensions: ALL_DIMENSIONS,
    tokenLimit: 15000,
    processingPriority: 'normal',
    features: ['advanced_report', 'leaderboards', 'analytics']
  },
  professional: {
    name: 'professional',
    aiProviders: ['openai', 'anthropic', 'google', 'mistral', 'llama'],
    dimensions: ALL_DIMENSIONS,
    tokenLimit: 20000,
    processingPriority: 'high',
    features: ['all_features', 'api_access', 'monitoring']
  }
}
```

### 2. Usage Limits & Controls

```typescript
interface UsageLimits {
  evaluationsPerMonth: number
  evaluationsPerBrand: number
  evaluationsPerDay: number
  concurrentEvaluations: number
}

const USAGE_LIMITS: Record<string, UsageLimits> = {
  free: {
    evaluationsPerMonth: 3,
    evaluationsPerBrand: 1, // Prevent spam
    evaluationsPerDay: 1,
    concurrentEvaluations: 1
  },
  premium: {
    evaluationsPerMonth: 25,
    evaluationsPerBrand: 5,
    evaluationsPerDay: 5,
    concurrentEvaluations: 2
  },
  professional: {
    evaluationsPerMonth: 200,
    evaluationsPerBrand: 20,
    evaluationsPerDay: 20,
    concurrentEvaluations: 5
  }
}
```

### 3. API Usage Monitoring System

```typescript
interface APIUsageTracker {
  trackRequest(userId: string, provider: string, tokens: number, cost: number): void
  getCurrentUsage(userId: string, period: 'day' | 'month'): UsageStats
  checkLimits(userId: string, requestedTokens: number): boolean
  alertOnThreshold(userId: string, threshold: number): void
}

interface UsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  byProvider: Record<string, ProviderUsage>
  remainingQuota: number
}
```

## 📊 Market Reindexing Strategy

### Reindexing Frequency
- **Global Leaderboards**: Weekly (Sundays)
- **Industry Benchmarks**: Bi-weekly
- **Trending Analysis**: Daily
- **Competitor Updates**: Monthly

### Implementation
```typescript
interface ReindexingSchedule {
  globalLeaderboards: {
    frequency: 'weekly',
    day: 'sunday',
    time: '02:00 UTC',
    estimatedCost: '£50/week'
  },
  industryBenchmarks: {
    frequency: 'bi-weekly',
    estimatedCost: '£200/month'
  },
  trendingAnalysis: {
    frequency: 'daily',
    estimatedCost: '£300/month'
  }
}
```

## 🛡️ Cost Control Mechanisms

### 1. Circuit Breakers
```typescript
interface CircuitBreaker {
  dailySpendLimit: number
  monthlySpendLimit: number
  userSpendLimit: number
  emergencyShutoff: boolean
}

const COST_CONTROLS = {
  daily: £1000,
  monthly: £25000,
  perUser: £100,
  alertThresholds: [50, 75, 90] // Percentage of limits
}
```

### 2. Rate Limiting
```typescript
interface RateLimiter {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  burstAllowance: number
}
```

### 3. Queue Management
```typescript
interface EvaluationQueue {
  priority: 'low' | 'normal' | 'high'
  estimatedProcessingTime: number
  maxQueueSize: number
  processingOrder: 'fifo' | 'priority'
}
```

## 🔄 Evaluation Limits per Brand

### Anti-Spam Measures
```typescript
interface BrandEvaluationLimits {
  maxEvaluationsPerBrand: {
    free: 1,      // Once per month per brand
    premium: 5,   // 5 times per month per brand
    professional: 20 // 20 times per month per brand
  },
  cooldownPeriod: {
    free: '7 days',
    premium: '24 hours',
    professional: '1 hour'
  },
  duplicateDetection: {
    enabled: true,
    timeWindow: '30 days',
    similarityThreshold: 0.95
  }
}
```

## 📈 Pricing Strategy Analysis

### Revenue Projections (1,000 users)
```
User Distribution:
- Free: 700 users (0 revenue, £1,575 cost)
- Premium: 250 users (£4,998 revenue, £15,625 cost)
- Professional: 50 users (£4,500 revenue, £25,000 cost)

Total Monthly:
- Revenue: £9,498
- Costs: £42,200
- Net: -£32,702 (requires optimization)
```

### Optimization Strategies
1. **Reduce free tier costs**: Use caching, simpler models
2. **Increase conversion rates**: 30% free → premium
3. **Add usage-based pricing**: Overage charges
4. **Enterprise tier**: £299/month for unlimited

## 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure (Month 1)
- [ ] Implement tier-based evaluation engine
- [ ] Add usage tracking and limits
- [ ] Create cost monitoring dashboard
- [ ] Deploy circuit breakers

### Phase 2: Feature Differentiation (Month 2)
- [ ] Build advanced reporting for premium
- [ ] Implement leaderboard access controls
- [ ] Add AIDI monitoring system
- [ ] Create API access layer

### Phase 3: Optimization (Month 3)
- [ ] Implement intelligent caching
- [ ] Add evaluation result reuse
- [ ] Optimize AI provider selection
- [ ] Deploy automated cost controls

## 🎯 Success Metrics

### Cost Targets
- Free tier: <£1 per evaluation
- Premium tier: 60%+ gross margin
- Professional tier: 70%+ gross margin

### Conversion Targets
- Free → Premium: 25%
- Premium → Professional: 15%
- Monthly churn: <5%

### Operational Targets
- Evaluation processing time: <2 minutes (premium)
- System uptime: 99.9%
- API response time: <500ms

This architecture provides a scalable, cost-effective foundation for the three-tier pricing model while maintaining quality and controlling operational expenses.