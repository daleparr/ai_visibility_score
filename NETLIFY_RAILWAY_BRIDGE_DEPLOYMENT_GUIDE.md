# 🌉 Netlify-Railway Bridge Deployment Guide

This guide walks you through deploying the complete Netlify-Railway bridge solution for AIDI background agent processing.

## 📋 Prerequisites

- **Netlify Account** with existing AIDI project
- **Railway Account** (free tier available)
- **GitHub/GitLab** repository access
- **Environment Variables** from existing Netlify deployment

## 🚀 Phase 1: Railway Infrastructure Setup

### Step 1: Create Railway Project

1. **Login to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create New Project**
   ```bash
   cd railway-workers
   railway init
   ```

3. **Add Redis Service**
   ```bash
   railway add redis
   ```

### Step 2: Configure Environment Variables

Set these variables in Railway dashboard or CLI:

#### Required Variables
```bash
# Core Configuration
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Authentication (CRITICAL - must match Netlify)
railway variables set JWT_SECRET="your-super-secret-jwt-key-from-netlify"
railway variables set NETLIFY_CALLBACK_SECRET="your-callback-secret"

# Database (shared with Netlify)
railway variables set DATABASE_URL="postgresql://user:pass@host:port/db"

# Netlify Integration
railway variables set NETLIFY_CALLBACK_URL="https://ai-visibility-score.netlify.app/.netlify/functions/bridge-callback"
railway variables set ALLOWED_ORIGINS="https://ai-visibility-score.netlify.app"
```

#### External API Keys (copy from Netlify)
```bash
railway variables set OPENAI_API_KEY="your-openai-key"
railway variables set ANTHROPIC_API_KEY="your-anthropic-key"
railway variables set GOOGLE_AI_API_KEY="your-google-key"
railway variables set MISTRAL_API_KEY="your-mistral-key"
railway variables set BRAVE_API_KEY="your-brave-key"
railway variables set PERPLEXITY_API_KEY="your-perplexity-key"
```

#### Performance Tuning
```bash
railway variables set QUEUE_CONCURRENCY=4
railway variables set MAX_JOB_ATTEMPTS=3
railway variables set JOB_TIMEOUT=600000
railway variables set LOG_LEVEL=info
```

### Step 3: Deploy to Railway

1. **Deploy the application**
   ```bash
   railway up
   ```

2. **Get Railway URL**
   ```bash
   railway domain
   # Note the URL (e.g., https://aidi-railway-workers.railway.app)
   ```

3. **Verify deployment**
   ```bash
   curl https://your-railway-url.railway.app/health
   ```

## 🔗 Phase 2: Netlify Bridge Integration

### Step 1: Update Netlify Environment Variables

Add these to your Netlify environment variables:

```bash
# Railway Integration
RAILWAY_API_URL=https://your-railway-url.railway.app
RAILWAY_JWT_SECRET=your-super-secret-jwt-key-from-netlify

# Feature Flag (start disabled)
ENABLE_RAILWAY_BRIDGE=false
```

### Step 2: Deploy Netlify Updates

1. **Commit and push the bridge code**
   ```bash
   git add .
   git commit -m "Add Railway bridge infrastructure"
   git push origin main
   ```

2. **Verify Netlify deployment**
   - Check build logs for any errors
   - Ensure new functions are deployed

### Step 3: Test Bridge Connection

1. **Test Railway health**
   ```bash
   curl https://your-railway-url.railway.app/health/detailed
   ```

2. **Test Netlify bridge endpoint**
   ```bash
   curl https://ai-visibility-score.netlify.app/api/bridge/enqueue \
        -H "Content-Type: application/json" \
        -d '{"test": true}'
   ```

## ⚡ Phase 3: Gradual Rollout

### Step 1: Enable Bridge (Shadow Mode)

1. **Enable the bridge flag**
   ```bash
   # In Netlify environment variables
   ENABLE_RAILWAY_BRIDGE=true
   ```

2. **Monitor both systems**
   - Watch Netlify function logs
   - Monitor Railway application logs
   - Check database for agent executions

### Step 2: Test with Real Evaluations

1. **Start with free tier evaluations**
   - Lower risk
   - Shorter agent lists
   - Easier to debug

2. **Monitor key metrics**
   - Queue processing time
   - Agent success rates
   - Callback delivery
   - Database consistency

### Step 3: Scale to All Tiers

1. **Enable for index-pro tier**
   ```bash
   # Monitor for 24 hours before proceeding
   ```

2. **Enable for enterprise tier**
   ```bash
   # Full rollout after successful testing
   ```

## 📊 Monitoring & Observability

### Railway Monitoring

1. **Application Metrics**
   ```bash
   # Check Railway dashboard for:
   # - CPU usage
   # - Memory consumption
   # - Request rate
   # - Error rate
   ```

2. **Queue Metrics**
   ```bash
   curl https://your-railway-url.railway.app/queue/status
   ```

3. **Health Checks**
   ```bash
   curl https://your-railway-url.railway.app/health/detailed
   ```

### Netlify Monitoring

1. **Function Logs**
   ```bash
   # Monitor these functions:
   # - bridge-callback
   # - intelligent-background-agents (legacy)
   ```

2. **Database Monitoring**
   ```sql
   -- Check agent execution status
   SELECT status, COUNT(*) 
   FROM backend_agent_executions 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY status;
   ```

## 🚨 Troubleshooting

### Common Issues

#### 1. JWT Authentication Failures
```bash
# Symptoms: 401 errors in Railway logs
# Solution: Verify JWT_SECRET matches between Netlify and Railway

# Test JWT generation
curl -X POST https://ai-visibility-score.netlify.app/api/bridge/enqueue \
     -H "Content-Type: application/json" \
     -d '{"evaluationId":"test","websiteUrl":"https://example.com","agents":["crawl_agent"]}'
```

#### 2. Queue Not Processing
```bash
# Check Redis connection
railway connect redis
redis-cli ping

# Check queue status
curl https://your-railway-url.railway.app/queue/status
```

#### 3. Callback Failures
```bash
# Check Netlify function logs
# Verify callback URL is accessible
curl https://ai-visibility-score.netlify.app/.netlify/functions/bridge-callback
```

#### 4. Agent Execution Timeouts
```bash
# Increase timeout in Railway
railway variables set JOB_TIMEOUT=900000  # 15 minutes

# Check memory usage
railway logs --tail
```

### Debug Commands

```bash
# Railway logs
railway logs --tail

# Netlify logs
netlify functions:log

# Database queries
psql $DATABASE_URL -c "SELECT * FROM backend_agent_executions ORDER BY created_at DESC LIMIT 10;"

# Queue inspection
curl https://your-railway-url.railway.app/queue/status | jq
```

## 🔄 Rollback Plan

If issues occur, you can quickly rollback:

### Immediate Rollback
```bash
# Disable Railway bridge
# In Netlify environment variables:
ENABLE_RAILWAY_BRIDGE=false

# Redeploy Netlify
git commit --allow-empty -m "Disable Railway bridge"
git push origin main
```

### Gradual Rollback
```bash
# Rollback by tier
# 1. Disable enterprise first
# 2. Then index-pro
# 3. Finally free tier
# Monitor each step
```

## 💰 Cost Monitoring

### Railway Costs
- **Starter Plan**: $5/month (512MB RAM, 1GB storage)
- **Pro Plan**: $20/month (8GB RAM, 100GB storage)
- **Usage-based**: CPU hours and network egress

### Additional API Costs
- **OpenAI**: ~$0.002 per 1K tokens
- **Anthropic**: ~$0.008 per 1K tokens
- **Google AI**: ~$0.0005 per 1K tokens
- **Brave Search**: ~$0.005 per search
- **Perplexity**: ~$0.005 per query

### Cost Optimization
```bash
# Monitor usage
railway usage

# Optimize queue concurrency
railway variables set QUEUE_CONCURRENCY=2  # Reduce for lower costs

# Implement request caching
railway variables set ENABLE_RESULT_CACHING=true
```

## 📈 Performance Optimization

### Railway Scaling
```bash
# Increase memory for heavy workloads
# Railway dashboard > Settings > Resources

# Optimize Dockerfile
# Use multi-stage builds
# Minimize image size
```

### Queue Optimization
```bash
# Tune concurrency based on load
railway variables set QUEUE_CONCURRENCY=6  # For high traffic

# Adjust retry logic
railway variables set MAX_JOB_ATTEMPTS=2   # Faster failure detection
```

### Database Optimization
```sql
-- Add indexes for agent executions
CREATE INDEX IF NOT EXISTS idx_backend_agent_executions_evaluation_status 
ON backend_agent_executions(evaluation_id, status);

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## ✅ Success Metrics

### Technical Metrics
- **Agent Success Rate**: >95%
- **Queue Processing Time**: <30 seconds average
- **Callback Delivery**: >99%
- **System Uptime**: >99.9%

### Business Metrics
- **Evaluation Completion Rate**: >98%
- **User Satisfaction**: Reduced timeout errors
- **Cost Efficiency**: <20% increase in infrastructure costs
- **Scalability**: Handle 10x traffic spikes

## 🎯 Next Steps

1. **Week 1**: Deploy and test in shadow mode
2. **Week 2**: Gradual rollout to all tiers
3. **Week 3**: Performance optimization and monitoring
4. **Week 4**: Full production deployment

## 📞 Support

For deployment issues:
1. Check Railway logs: `railway logs --tail`
2. Check Netlify function logs
3. Review database agent execution status
4. Contact development team with specific error messages

---

**Deployment Status**: Ready for Production  
**Last Updated**: October 7, 2025  
**Version**: 1.0.0
