# Leaderboard Automation & Monitoring Guide

## 🕐 Automated Scheduling System

### **Daily Evaluation Schedule**
- **Default Time**: 2:00 AM UTC daily
- **Configurable**: Set via `DAILY_EVALUATION_HOUR` environment variable
- **Batch Processing**: 5 brands per batch (configurable)
- **Daily Limit**: 20 evaluations per day (configurable)
- **Retry Logic**: 3 attempts per failed evaluation

### **Automated Tasks**
1. **Daily Evaluations** (2:00 AM UTC)
   - Process evaluation queue systematically
   - Generate real ADI scores for queued brands
   - Update leaderboard cache with fresh data
   - Clean up expired cache entries

2. **Hourly Health Checks** (Top of every hour)
   - Monitor queue status and processing health
   - Check for stuck evaluations
   - Validate cache performance
   - Alert on high failure rates (>10%)

3. **Daily Cleanup** (1:00 AM UTC)
   - Remove expired cache entries
   - Clean old performance metrics (30+ days)
   - Optimize database performance

## 🚀 Starting Automated Scheduling

### **Option 1: Background Service (Recommended)**
```bash
# Start automated scheduler
npm run leaderboard:scheduler

# Runs continuously with:
# - Daily evaluations at 2 AM UTC
# - Hourly health checks
# - Daily cleanup at 1 AM UTC
```

### **Option 2: API-Controlled Scheduler**
```bash
# Start scheduler via API
curl -X POST https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "start", "dailyEvaluationHour": 2, "batchSize": 5}'

# Stop scheduler
curl -X POST https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

### **Option 3: Manual Trigger (Testing)**
```bash
# Trigger immediate evaluation
curl -X POST https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "trigger"}'
```

## 📊 Monitoring & Status Checking

### **Real-time Status Monitoring**
```bash
# Check scheduler status
curl "https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler?action=status"

# Response:
{
  "status": "running",
  "isRunning": false,
  "lastRunStatus": "success",
  "lastRunTime": "2024-01-15T02:00:00.000Z",
  "consecutiveFailures": 0,
  "nextRunTime": "2024-01-16T02:00:00.000Z"
}
```

### **Health Check Monitoring**
```bash
# Comprehensive health check
curl "https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler?action=health"

# Response:
{
  "status": "healthy",
  "data": {
    "timestamp": "2024-01-15T14:30:00.000Z",
    "scheduler": "running",
    "database": "connected",
    "lastCheck": "2024-01-15T14:30:00.000Z"
  }
}
```

### **Queue Statistics Monitoring**
```bash
# Check evaluation queue status
curl "https://ai-discoverability-index.netlify.app/api/leaderboard-population?action=stats"

# Response:
{
  "queueStats": {
    "pending": 15,
    "running": 2,
    "completed": 127,
    "failed": 3,
    "totalToday": 8
  },
  "cacheStats": {
    "totalEntries": 89,
    "expiredEntries": 5
  }
}
```

## 🔔 Alert & Notification System

### **Automatic Alerts**
1. **Success Notifications**: Daily evaluation completion
2. **Error Alerts**: Individual evaluation failures
3. **Warning Alerts**: High failure rates (>10%)
4. **Critical Alerts**: 3+ consecutive daily failures

### **Webhook Configuration**
```bash
# Set alert webhook URL
export ALERT_WEBHOOK_URL="https://your-monitoring-service.com/webhook"

# Start scheduler with webhook alerts
npm run leaderboard:scheduler
```

### **Alert Payload Examples**

**Success Notification:**
```json
{
  "type": "success",
  "timestamp": "2024-01-15T02:15:00.000Z",
  "service": "leaderboard-scheduler",
  "data": {
    "evaluationsProcessed": 8,
    "duration": 900000,
    "finalStats": {
      "pending": 12,
      "completed": 135,
      "failed": 3
    }
  }
}
```

**Error Alert:**
```json
{
  "type": "error",
  "timestamp": "2024-01-15T02:05:00.000Z",
  "service": "leaderboard-scheduler",
  "data": {
    "error": "Database connection timeout",
    "consecutiveFailures": 1,
    "lastRunTime": "2024-01-15T02:00:00.000Z"
  }
}
```

**Critical Alert:**
```json
{
  "level": "CRITICAL",
  "service": "leaderboard-scheduler",
  "message": "3 consecutive evaluation failures",
  "timestamp": "2024-01-15T02:00:00.000Z",
  "action_required": "Manual intervention needed"
}
```

## 📈 Performance Monitoring

### **Key Metrics Tracked**
- **Evaluation Success Rate**: Target >95%
- **Processing Duration**: Target <15 minutes per batch
- **Queue Health**: Pending vs. completed ratios
- **Cache Performance**: Hit rates and expiration management
- **System Uptime**: Scheduler availability

### **Monitoring Dashboard Queries**
```sql
-- Daily evaluation success rate
SELECT 
  DATE(recorded_at) as date,
  SUM(CASE WHEN metric_name = 'daily_evaluation_success' THEN metric_value ELSE 0 END) as successes,
  SUM(CASE WHEN metric_name = 'daily_evaluation_error' THEN metric_value ELSE 0 END) as errors
FROM system_performance_metrics 
WHERE metric_type = 'leaderboard_scheduler'
GROUP BY DATE(recorded_at)
ORDER BY date DESC;

-- Queue processing trends
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_evaluations,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM evaluation_queue 
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🛠 Troubleshooting & Maintenance

### **Common Issues & Solutions**

**Issue: Scheduler Not Running**
```bash
# Check status
curl "http://ai-discoverability-index.netlify.app/api/leaderboard-scheduler?action=status"

# Start if stopped
curl -X POST http://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

**Issue: High Failure Rate**
```bash
# Check queue for failed evaluations
curl "http://ai-discoverability-index.netlify.app/api/leaderboard-population?action=queue"

# Manual retry of failed evaluations
curl -X POST http://ai-discoverability-index.netlify.app/api/leaderboard-population \
  -H "Content-Type: application/json" \
  -d '{"action": "retry_failed"}'
```

**Issue: Stuck Evaluations**
```bash
# Check for running evaluations
curl "http://ai-discoverability-index.netlify.app/api/leaderboard-population?action=stats"

# Reset stuck evaluations (if needed)
curl -X POST http://ai-discoverability-index.netlify.app/api/leaderboard-population \
  -H "Content-Type: application/json" \
  -d '{"action": "reset_stuck"}'
```

### **Manual Intervention Commands**
```bash
# Force immediate evaluation run
curl -X POST http://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "trigger"}'

# Check detailed queue status
npm run leaderboard:test

# Manual queue processing
npm run leaderboard:process

# Re-seed brands if needed
npm run leaderboard:seed
```

## 📋 Daily Operations Checklist

### **Morning Check (9 AM)**
- [ ] Verify overnight evaluation completed successfully
- [ ] Check queue status and processing health
- [ ] Review any error alerts or notifications
- [ ] Validate leaderboard data freshness

### **Commands for Daily Check**
```bash
# Quick status check
curl "http://ai-discoverability-index.netlify.app/api/leaderboard-scheduler?action=status"

# Detailed health check
curl "http://ai-discoverability-index.netlify.app/api/leaderboard-scheduler?action=health"

# Queue statistics
curl "http://ai-discoverability-index.netlify.app/api/leaderboard-population?action=stats"
```

### **Weekly Review (Mondays)**
- [ ] Analyze evaluation success rates
- [ ] Review cache performance metrics
- [ ] Check for any recurring issues
- [ ] Update brand selections if needed

### **Monthly Maintenance**
- [ ] Review and optimize evaluation priorities
- [ ] Update brand taxonomy if needed
- [ ] Analyze user engagement with leaderboards
- [ ] Performance optimization review

## 🎯 Success Metrics & KPIs

### **Operational KPIs**
- **Daily Evaluation Success Rate**: Target >95%
- **Average Processing Time**: Target <15 minutes per batch
- **Queue Backlog**: Target <50 pending evaluations
- **Cache Hit Rate**: Target >80%
- **System Uptime**: Target >99.5%

### **Business KPIs**
- **Data Freshness**: Target <30 days average age
- **Leaderboard Coverage**: Target 500+ brands across 26 niches
- **User Engagement**: Leaderboard view frequency and duration
- **Evaluation Conversion**: User evaluation request rates

## 🔧 Configuration Options

### **Environment Variables**
```bash
# Scheduler configuration
DAILY_EVALUATION_HOUR=2          # 0-23, default 2 (2 AM UTC)
BATCH_SIZE=5                     # Brands per batch, default 5
DAILY_LIMIT=20                   # Max evaluations per day, default 20
ALERT_WEBHOOK_URL=https://...    # Optional webhook for alerts
LOG_LEVEL=info                   # info, debug, error

# Database configuration
NETLIFY_DATABASE_URL=postgresql://...  # Neon database connection
```

### **Scheduler Customization**
```typescript
// Custom scheduler configuration
const scheduler = new LeaderboardScheduler({
  dailyEvaluationHour: 3,        // 3 AM UTC
  batchSize: 10,                 // Larger batches
  dailyLimit: 50,                // Higher daily limit
  alertWebhook: 'https://...',   // Slack/Discord webhook
  logLevel: 'debug'              // Verbose logging
})
```

## 📱 Integration with Monitoring Services

### **Slack Integration**
```bash
# Set Slack webhook
export ALERT_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Alerts will be sent to your Slack channel
```

### **Discord Integration**
```bash
# Set Discord webhook
export ALERT_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK"
```

### **Custom Monitoring Service**
```bash
# Set custom webhook
export ALERT_WEBHOOK_URL="https://your-monitoring.com/api/alerts"
```

## 🎉 Summary

The automated leaderboard evaluation system provides:

✅ **Automated Daily Evaluations**: Runs at 2 AM UTC daily
✅ **Comprehensive Monitoring**: Real-time status and health checks
✅ **Error Handling**: Automatic retries and failure alerts
✅ **Performance Tracking**: Detailed metrics and KPI monitoring
✅ **Manual Override**: API endpoints for manual control
✅ **Webhook Alerts**: Integration with monitoring services
✅ **Graceful Degradation**: Continues operation despite individual failures

**Commands Summary:**
- `npm run leaderboard:scheduler` - Start automated scheduler
- `GET /api/leaderboard-scheduler?action=status` - Check status
- `POST /api/leaderboard-scheduler {"action": "trigger"}` - Manual trigger
- `GET /api/leaderboard-population?action=stats` - Queue statistics

The system ensures continuous, reliable evaluation processing with comprehensive monitoring and alerting for production environments.