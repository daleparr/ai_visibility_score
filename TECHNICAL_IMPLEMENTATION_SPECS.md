# AI Visibility Score - Technical Implementation Specifications

## 🔧 Database Schema Updates

### 1. Subscription Management Tables

```sql
-- Subscription tiers configuration
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'free', 'premium', 'professional'
  price_gbp DECIMAL(10,2) NOT NULL,
  evaluations_per_month INTEGER NOT NULL,
  evaluations_per_brand INTEGER NOT NULL,
  evaluations_per_day INTEGER NOT NULL,
  concurrent_evaluations INTEGER NOT NULL,
  ai_providers JSONB NOT NULL, -- Array of enabled providers
  features JSONB NOT NULL, -- Feature flags
  token_limit INTEGER NOT NULL,
  processing_priority VARCHAR(20) NOT NULL, -- 'low', 'normal', 'high'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL,
  tier_name VARCHAR(50) NOT NULL,
  ai_provider VARCHAR(50) NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_gbp DECIMAL(10,4) NOT NULL,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Monthly usage summaries
CREATE TABLE monthly_usage_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  tier_name VARCHAR(50) NOT NULL,
  total_evaluations INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_gbp DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- Cost alerts
CREATE TABLE cost_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'threshold', 'limit_reached', 'overage'
  threshold_percentage INTEGER,
  current_usage DECIMAL(10,2),
  limit_amount DECIMAL(10,2),
  triggered_at TIMESTAMP DEFAULT NOW(),
  acknowledged_at TIMESTAMP
);
```

### 2. Enhanced Evaluation Tables

```sql
-- Add tier-specific columns to evaluations
ALTER TABLE evaluations ADD COLUMN tier_name VARCHAR(50);
ALTER TABLE evaluations ADD COLUMN ai_providers_used JSONB;
ALTER TABLE evaluations ADD COLUMN total_tokens_used INTEGER;
ALTER TABLE evaluations ADD COLUMN total_cost_gbp DECIMAL(10,4);
ALTER TABLE evaluations ADD COLUMN processing_priority VARCHAR(20);
ALTER TABLE evaluations ADD COLUMN queue_position INTEGER;

-- Evaluation queue management
CREATE TABLE evaluation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  priority VARCHAR(20) NOT NULL, -- 'low', 'normal', 'high'
  estimated_cost_gbp DECIMAL(10,4),
  estimated_processing_time INTEGER, -- seconds
  queued_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'queued' -- 'queued', 'processing', 'completed', 'failed'
);
```

### 3. Market Reindexing Tables

```sql
-- Reindexing schedule and tracking
CREATE TABLE reindexing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL, -- 'global_leaderboards', 'industry_benchmarks', etc.
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  scheduled_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  evaluations_processed INTEGER DEFAULT 0,
  total_cost_gbp DECIMAL(10,2) DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reindexing costs tracking
CREATE TABLE reindexing_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES reindexing_jobs(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'ai_api_calls', 'compute', 'storage'
  cost_gbp DECIMAL(10,4) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🏗️ Backend Service Architecture

### 1. Tier Management Service

```typescript
interface TierService {
  getUserTier(userId: string): Promise<SubscriptionTier>
  checkUsageLimits(userId: string, requestType: string): Promise<boolean>
  trackUsage(userId: string, usage: UsageRecord): Promise<void>
  upgradeUser(userId: string, newTier: string): Promise<void>
  downgradeUser(userId: string, newTier: string): Promise<void>
}

class TierServiceImpl implements TierService {
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await this.db.userSubscriptions.findFirst({
      where: { userId, status: 'active' },
      include: { tier: true }
    })
    
    return subscription?.tier || this.getFreeTier()
  }

  async checkUsageLimits(userId: string, requestType: string): Promise<boolean> {
    const tier = await this.getUserTier(userId)
    const currentUsage = await this.getCurrentMonthUsage(userId)
    
    switch (requestType) {
      case 'evaluation':
        return currentUsage.totalEvaluations < tier.evaluationsPerMonth
      case 'api_call':
        return currentUsage.apiCalls < tier.apiCallsPerMonth
      default:
        return true
    }
  }

  async trackUsage(userId: string, usage: UsageRecord): Promise<void> {
    // Record individual usage
    await this.db.usageTracking.create({
      data: {
        userId,
        evaluationId: usage.evaluationId,
        tierName: usage.tierName,
        aiProvider: usage.aiProvider,
        tokensUsed: usage.tokensUsed,
        costGbp: usage.costGbp,
        processingTimeMs: usage.processingTimeMs
      }
    })

    // Update monthly summary
    await this.updateMonthlySummary(userId, usage)
    
    // Check for alerts
    await this.checkCostAlerts(userId)
  }
}
```

### 2. Cost Control Service

```typescript
interface CostControlService {
  checkDailyCostLimit(userId: string): Promise<boolean>
  checkMonthlyCostLimit(userId: string): Promise<boolean>
  predictMonthlyCost(userId: string): Promise<number>
  createCostAlert(userId: string, alertType: string, details: any): Promise<void>
  getOptimizationSuggestions(userId: string): Promise<Optimization[]>
}

class CostControlServiceImpl implements CostControlService {
  private readonly COST_LIMITS = {
    free: { daily: 5, monthly: 50 },
    premium: { daily: 50, monthly: 500 },
    professional: { daily: 200, monthly: 2000 }
  }

  async checkDailyCostLimit(userId: string): Promise<boolean> {
    const tier = await this.tierService.getUserTier(userId)
    const todayUsage = await this.getTodayUsage(userId)
    const limit = this.COST_LIMITS[tier.name].daily
    
    if (todayUsage.totalCost >= limit * 0.9) {
      await this.createCostAlert(userId, 'approaching_daily_limit', {
        current: todayUsage.totalCost,
        limit,
        percentage: (todayUsage.totalCost / limit) * 100
      })
    }
    
    return todayUsage.totalCost < limit
  }

  async predictMonthlyCost(userId: string): Promise<number> {
    const currentUsage = await this.getCurrentMonthUsage(userId)
    const daysElapsed = new Date().getDate()
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    
    const dailyAverage = currentUsage.totalCost / daysElapsed
    const projectedMonthlyCost = dailyAverage * daysInMonth
    
    return projectedMonthlyCost
  }

  async getOptimizationSuggestions(userId: string): Promise<Optimization[]> {
    const usage = await this.getDetailedUsage(userId)
    const suggestions: Optimization[] = []

    // Check for duplicate evaluations
    if (usage.duplicateEvaluations > 0) {
      suggestions.push({
        type: 'reduce_duplicates',
        potentialSavings: usage.duplicateEvaluations * 2.5,
        description: 'Use cached results for recently evaluated brands',
        actionRequired: 'Enable smart caching in settings'
      })
    }

    // Check for expensive provider usage
    if (usage.expensiveProviderUsage > 0.7) {
      suggestions.push({
        type: 'optimize_providers',
        potentialSavings: usage.totalCost * 0.3,
        description: 'Use cost-effective AI providers for routine evaluations',
        actionRequired: 'Adjust AI provider preferences'
      })
    }

    return suggestions
  }
}
```

### 3. Evaluation Queue Service

```typescript
interface EvaluationQueueService {
  queueEvaluation(evaluation: EvaluationRequest): Promise<QueuePosition>
  processQueue(): Promise<void>
  getQueueStatus(evaluationId: string): Promise<QueueStatus>
  estimateWaitTime(priority: string): Promise<number>
}

class EvaluationQueueServiceImpl implements EvaluationQueueService {
  async queueEvaluation(evaluation: EvaluationRequest): Promise<QueuePosition> {
    const tier = await this.tierService.getUserTier(evaluation.userId)
    const priority = tier.processingPriority
    const estimatedCost = this.estimateEvaluationCost(evaluation, tier)
    
    // Check if user can afford this evaluation
    const canAfford = await this.costControl.checkDailyCostLimit(evaluation.userId)
    if (!canAfford) {
      throw new Error('Daily cost limit exceeded')
    }

    const queueEntry = await this.db.evaluationQueue.create({
      data: {
        evaluationId: evaluation.id,
        userId: evaluation.userId,
        priority,
        estimatedCostGbp: estimatedCost,
        estimatedProcessingTime: this.estimateProcessingTime(tier)
      }
    })

    return {
      position: await this.getQueuePosition(queueEntry.id),
      estimatedWaitTime: await this.estimateWaitTime(priority)
    }
  }

  async processQueue(): Promise<void> {
    const nextEvaluations = await this.db.evaluationQueue.findMany({
      where: { status: 'queued' },
      orderBy: [
        { priority: 'desc' }, // high > normal > low
        { queuedAt: 'asc' }   // FIFO within priority
      ],
      take: this.getMaxConcurrentEvaluations()
    })

    for (const queueEntry of nextEvaluations) {
      await this.startEvaluation(queueEntry)
    }
  }

  private getMaxConcurrentEvaluations(): number {
    // Dynamic based on system load and cost limits
    return Math.min(10, this.getAvailableCapacity())
  }
}
```

### 4. Market Reindexing Service

```typescript
interface ReindexingService {
  scheduleReindexing(jobType: string, scheduledAt: Date): Promise<void>
  executeReindexing(jobId: string): Promise<void>
  getReindexingCosts(period: string): Promise<ReindexingCostSummary>
  optimizeReindexingSchedule(): Promise<void>
}

class ReindexingServiceImpl implements ReindexingService {
  private readonly REINDEXING_SCHEDULE = {
    global_leaderboards: { frequency: 'weekly', day: 'sunday', time: '02:00' },
    industry_benchmarks: { frequency: 'bi-weekly', day: 'sunday', time: '04:00' },
    trending_analysis: { frequency: 'daily', time: '01:00' },
    competitor_updates: { frequency: 'monthly', day: 1, time: '03:00' }
  }

  async scheduleReindexing(jobType: string, scheduledAt: Date): Promise<void> {
    const existingJob = await this.db.reindexingJobs.findFirst({
      where: {
        jobType,
        scheduledAt,
        status: { in: ['pending', 'running'] }
      }
    })

    if (existingJob) {
      console.log(`Reindexing job ${jobType} already scheduled for ${scheduledAt}`)
      return
    }

    await this.db.reindexingJobs.create({
      data: {
        jobType,
        scheduledAt,
        status: 'pending'
      }
    })
  }

  async executeReindexing(jobId: string): Promise<void> {
    const job = await this.db.reindexingJobs.findUnique({
      where: { id: jobId }
    })

    if (!job || job.status !== 'pending') {
      throw new Error(`Invalid job ${jobId}`)
    }

    await this.db.reindexingJobs.update({
      where: { id: jobId },
      data: { status: 'running', startedAt: new Date() }
    })

    try {
      const result = await this.performReindexing(job.jobType)
      
      await this.db.reindexingJobs.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          evaluationsProcessed: result.evaluationsProcessed,
          totalCostGbp: result.totalCost
        }
      })

      // Track detailed costs
      for (const costItem of result.costs) {
        await this.db.reindexingCosts.create({
          data: {
            jobId,
            category: costItem.category,
            costGbp: costItem.amount,
            details: costItem.details
          }
        })
      }

    } catch (error) {
      await this.db.reindexingJobs.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error.message
        }
      })
      throw error
    }
  }

  private async performReindexing(jobType: string): Promise<ReindexingResult> {
    switch (jobType) {
      case 'global_leaderboards':
        return await this.reindexGlobalLeaderboards()
      case 'industry_benchmarks':
        return await this.reindexIndustryBenchmarks()
      case 'trending_analysis':
        return await this.reindexTrendingAnalysis()
      case 'competitor_updates':
        return await this.reindexCompetitorUpdates()
      default:
        throw new Error(`Unknown job type: ${jobType}`)
    }
  }

  private async reindexGlobalLeaderboards(): Promise<ReindexingResult> {
    // Get top 1000 brands for global leaderboard
    const topBrands = await this.getTopBrands(1000)
    const costs: CostItem[] = []
    let totalCost = 0
    let evaluationsProcessed = 0

    for (const brand of topBrands) {
      // Use cheapest model for reindexing
      const evaluationCost = await this.performLightweightEvaluation(brand, 'gpt-4o-mini')
      costs.push({
        category: 'ai_api_calls',
        amount: evaluationCost,
        details: { brandId: brand.id, provider: 'gpt-4o-mini' }
      })
      totalCost += evaluationCost
      evaluationsProcessed++
    }

    // Update leaderboard rankings
    await this.updateGlobalLeaderboard(topBrands)

    return {
      evaluationsProcessed,
      totalCost,
      costs
    }
  }
}
```

## 📊 Monitoring & Analytics

### 1. Real-time Cost Dashboard

```typescript
interface CostDashboard {
  getCurrentCosts(): Promise<CostSummary>
  getCostTrends(period: string): Promise<CostTrend[]>
  getUserCostBreakdown(userId: string): Promise<UserCostBreakdown>
  getSystemWideMetrics(): Promise<SystemMetrics>
}

interface CostSummary {
  today: number
  thisMonth: number
  projectedMonth: number
  byTier: Record<string, number>
  byProvider: Record<string, number>
  topSpenders: UserSpending[]
}

interface SystemMetrics {
  activeUsers: number
  evaluationsToday: number
  averageCostPerEvaluation: number
  queueLength: number
  systemLoad: number
  errorRate: number
}
```

### 2. Automated Alerts System

```typescript
class AlertSystem {
  private readonly ALERT_RULES = [
    {
      name: 'high_daily_cost',
      condition: (metrics: SystemMetrics) => metrics.dailyCost > 1000,
      severity: 'high',
      action: 'notify_admin'
    },
    {
      name: 'user_approaching_limit',
      condition: (user: UserMetrics) => user.monthlyUsage > user.monthlyLimit * 0.9,
      severity: 'medium',
      action: 'notify_user'
    },
    {
      name: 'queue_backup',
      condition: (metrics: SystemMetrics) => metrics.queueLength > 100,
      severity: 'medium',
      action: 'scale_processing'
    }
  ]

  async checkAlerts(): Promise<void> {
    const systemMetrics = await this.getSystemMetrics()
    
    for (const rule of this.ALERT_RULES) {
      if (rule.condition(systemMetrics)) {
        await this.triggerAlert(rule, systemMetrics)
      }
    }
  }

  private async triggerAlert(rule: AlertRule, metrics: any): Promise<void> {
    switch (rule.action) {
      case 'notify_admin':
        await this.sendAdminNotification(rule, metrics)
        break
      case 'notify_user':
        await this.sendUserNotification(rule, metrics)
        break
      case 'scale_processing':
        await this.scaleProcessingCapacity()
        break
    }
  }
}
```

This technical specification provides the foundation for implementing the three-tier pricing model with robust cost controls, monitoring, and optimization capabilities.