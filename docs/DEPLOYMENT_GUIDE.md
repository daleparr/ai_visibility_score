# ADI System Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the AI Discoverability Index (ADI) system, including both traditional and intelligent queue configurations, environment setup, and production optimization.

---

## Prerequisites

### **System Requirements**
- **Node.js**: 18.x or higher
- **Database**: PostgreSQL 14+ (Neon recommended)
- **Hosting**: Netlify (for serverless functions)
- **Domain**: Custom domain recommended for production

### **Required Accounts & Services**
- **Netlify Account**: For hosting and serverless functions
- **Neon Database**: For PostgreSQL hosting
- **GitHub Account**: For repository hosting and CI/CD
- **Domain Provider**: For custom domain (optional)

### **Development Tools**
```bash
# Required global packages
npm install -g netlify-cli
npm install -g drizzle-kit
npm install -g tsx

# Verify installations
node --version    # Should be 18.x+
netlify --version # Should be latest
```

---

## Environment Setup

### **1. Database Configuration (Neon)**

#### **Create Neon Database**
1. Sign up at [neon.tech](https://neon.tech)
2. Create new project: "ai-visibility-score"
3. Note connection details:
   - Host: `ep-xxx-xxx.us-east-1.aws.neon.tech`
   - Database: `neondb`
   - Username: `neondb_owner`
   - Password: `[generated]`

#### **Database URL Format**
```bash
# Standard connection
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Enhanced connection with parameters
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require&target_session_attrs=read-write&connect_timeout=10&application_name=adi-system"
```

#### **Schema Setup**
```bash
# Run schema migration
npm run db:push

# Verify schema
npm run db:studio
```

### **2. Environment Variables**

#### **Core Configuration**
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&target_session_attrs=read-write&connect_timeout=10"
NEON_DATABASE_URL="$DATABASE_URL"

# Application
NEXT_PUBLIC_APP_URL="https://your-app.netlify.app"
NODE_ENV="production"

# Queue System Configuration
QUEUE_SYSTEM="intelligent"              # or "traditional"
QUEUE_ENABLED="true"
QUEUE_MAX_CONCURRENT="3"
QUEUE_MAX_SIZE="50"
QUEUE_MAX_RETRIES="4"
QUEUE_CIRCUIT_BREAKER_TIMEOUT="900000"  # 15 minutes

# Feature Flags
QUEUE_PROGRESSIVE_TIMEOUTS="true"
QUEUE_PRIORITY_SCHEDULING="true"
QUEUE_FALLBACK_STRATEGIES="true"
QUEUE_RESOURCE_MANAGEMENT="true"
QUEUE_CIRCUIT_BREAKERS="true"

# Agent Timeouts (milliseconds)
CRAWL_AGENT_TIMEOUT="900000"           # 15 minutes
LLM_TEST_AGENT_TIMEOUT="300000"        # 5 minutes
SENTIMENT_AGENT_TIMEOUT="180000"       # 3 minutes
GEO_VISIBILITY_AGENT_TIMEOUT="240000"  # 4 minutes
COMMERCE_AGENT_TIMEOUT="180000"        # 3 minutes
CITATION_AGENT_TIMEOUT="120000"        # 2 minutes

# API Keys (if using external services)
OPENAI_API_KEY="sk-..."                # For LLM testing
ANTHROPIC_API_KEY="sk-ant-..."         # For Claude testing
```

#### **Development vs Production**
```bash
# Development (.env.local)
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
QUEUE_SYSTEM="traditional"             # Simpler for development

# Production (.env)
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://ai-visibility-score.netlify.app"
QUEUE_SYSTEM="intelligent"             # Full features for production
```

---

## Deployment Methods

### **Method 1: Netlify CLI Deployment**

#### **Initial Setup**
```bash
# Clone repository
git clone https://github.com/your-org/ai-visibility-score.git
cd ai-visibility-score

# Install dependencies
npm install

# Login to Netlify
netlify login

# Initialize Netlify site
netlify init

# Set environment variables
netlify env:set DATABASE_URL "your-database-url"
netlify env:set QUEUE_SYSTEM "intelligent"
# ... (set all required variables)
```

#### **Deploy**
```bash
# Build and deploy
npm run build
netlify deploy --prod

# Or deploy with build
netlify deploy --build --prod
```

### **Method 2: GitHub Integration (Recommended)**

#### **Setup GitHub Integration**
1. Push code to GitHub repository
2. Connect repository to Netlify:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Select GitHub repository
   - Configure build settings

#### **Build Configuration**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# Function configuration
[functions]
  directory = "netlify/functions"
  
[functions."background-agents"]
  timeout = 900  # 15 minutes

[functions."intelligent-background-agents"]
  timeout = 900  # 15 minutes

# Redirects for API routes
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# Headers for CORS
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

#### **Environment Variables in Netlify**
```bash
# Via Netlify UI: Site Settings > Environment Variables
# Or via CLI:
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set QUEUE_SYSTEM "intelligent"
netlify env:set NEXT_PUBLIC_APP_URL "https://your-site.netlify.app"
```

### **Method 3: Docker Deployment (Alternative)**

#### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### **Docker Compose**
```yaml
version: '3.8'
services:
  adi-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - QUEUE_SYSTEM=intelligent
      - NODE_ENV=production
    depends_on:
      - postgres
      
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=adi_db
      - POSTGRES_USER=adi_user
      - POSTGRES_PASSWORD=adi_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
volumes:
  postgres_data:
```

---

## Configuration Options

### **Queue System Configuration**

#### **Traditional System (Simple)**
```bash
# Environment variables
QUEUE_SYSTEM="traditional"
QUEUE_ENABLED="true"

# Features
QUEUE_PROGRESSIVE_TIMEOUTS="false"
QUEUE_PRIORITY_SCHEDULING="false"
QUEUE_FALLBACK_STRATEGIES="false"

# Characteristics
# - Fixed timeouts per agent
# - Simple retry logic
# - Basic error handling
# - Suitable for development/testing
```

#### **Intelligent System (Advanced)**
```bash
# Environment variables
QUEUE_SYSTEM="intelligent"
QUEUE_ENABLED="true"

# Features
QUEUE_PROGRESSIVE_TIMEOUTS="true"
QUEUE_PRIORITY_SCHEDULING="true"
QUEUE_FALLBACK_STRATEGIES="true"
QUEUE_RESOURCE_MANAGEMENT="true"
QUEUE_CIRCUIT_BREAKERS="true"

# Resource limits
QUEUE_MAX_CONCURRENT="3"
QUEUE_MAX_SIZE="50"
QUEUE_MAX_RETRIES="4"

# Characteristics
# - Progressive timeout handling
# - Priority-based scheduling
# - Intelligent fallback strategies
# - Resource-aware execution
# - Suitable for production
```

### **Agent-Specific Configuration**

#### **Crawl Agent (Critical)**
```bash
# Timeout configuration
CRAWL_AGENT_TIMEOUT="900000"           # 15 minutes max

# Sitemap processing limits
CRAWL_AGENT_MAX_SITEMAP_INDEXES="1"    # Ultra-conservative
CRAWL_AGENT_MAX_CONTENT_SITEMAPS="2"   # Ultra-conservative
CRAWL_AGENT_MAX_URLS_DISCOVERED="1500" # Conservative limit

# Anti-bot evasion
CRAWL_AGENT_ENABLE_ANTI_BOT="true"
CRAWL_AGENT_MIN_DELAY="800"            # Minimum request delay (ms)
CRAWL_AGENT_MAX_DELAY="1500"           # Maximum request delay (ms)

# Fallback strategy
CRAWL_AGENT_ENABLE_FALLBACK="true"
CRAWL_AGENT_FALLBACK_MODE="minimal"    # Homepage only fallback
```

#### **LLM Test Agent (High Priority)**
```bash
# Timeout and limits
LLM_TEST_AGENT_TIMEOUT="300000"        # 5 minutes max
LLM_TEST_AGENT_MAX_QUERIES="10"        # Query limit per model
LLM_TEST_AGENT_MAX_MODELS="3"          # Model limit

# API configuration
OPENAI_API_KEY="sk-..."                # OpenAI API key
ANTHROPIC_API_KEY="sk-ant-..."         # Anthropic API key
LLM_TEST_AGENT_TIMEOUT_PER_QUERY="30000" # 30 seconds per query

# Fallback strategy
LLM_TEST_AGENT_ENABLE_FALLBACK="true"
LLM_TEST_AGENT_FALLBACK_QUERIES="2"    # Reduced query count
LLM_TEST_AGENT_FALLBACK_MODELS="1"     # Single model fallback
```

### **Performance Tuning**

#### **Memory Optimization**
```bash
# Node.js memory settings
NODE_OPTIONS="--max-old-space-size=512"  # 512MB heap limit

# Function memory limits (Netlify)
FUNCTIONS_MEMORY="256"                   # 256MB per function

# Queue processing limits
QUEUE_MAX_CONCURRENT="3"                 # Conservative concurrency
QUEUE_CLEANUP_INTERVAL="300000"         # 5 minutes cleanup
```

#### **Network Optimization**
```bash
# Connection timeouts
DATABASE_CONNECT_TIMEOUT="10"           # 10 seconds
HTTP_REQUEST_TIMEOUT="30000"            # 30 seconds
API_CALL_TIMEOUT="30000"                # 30 seconds

# Retry configuration
MAX_RETRY_ATTEMPTS="3"
RETRY_BACKOFF_MULTIPLIER="2"
RETRY_BASE_DELAY="1000"                 # 1 second base delay
```

---

## Production Optimization

### **Performance Monitoring**

#### **Health Check Endpoints**
```typescript
// Add to your monitoring system
const healthChecks = [
  'https://your-app.netlify.app/api/debug/db-status',
  'https://your-app.netlify.app/.netlify/functions/intelligent-background-agents',
  'https://your-app.netlify.app/api/debug/system-health'
]

// Monitor every 5 minutes
setInterval(async () => {
  for (const endpoint of healthChecks) {
    try {
      const response = await fetch(endpoint, { timeout: 10000 })
      const health = await response.json()
      
      if (!health.ok) {
        // Alert: Service unhealthy
        console.error(`Health check failed: ${endpoint}`, health)
      }
    } catch (error) {
      // Alert: Service unreachable
      console.error(`Health check error: ${endpoint}`, error)
    }
  }
}, 5 * 60 * 1000)
```

#### **Performance Metrics**
```bash
# Key metrics to monitor
- Evaluation success rate (target: >95%)
- Average completion time (target: <12 minutes)
- Agent timeout rate (target: <5%)
- Database response time (target: <2 seconds)
- Queue processing delay (target: <30 seconds)
- Memory usage (target: <80% of limit)
- Error rate (target: <2%)
```

### **Scaling Configuration**

#### **Horizontal Scaling**
```bash
# Netlify automatically scales functions
# Configure limits to prevent overload:

QUEUE_MAX_CONCURRENT="3"                # Conservative for stability
QUEUE_MAX_SIZE="50"                     # Prevent memory issues
DATABASE_CONNECTION_LIMIT="10"          # Database connection pool

# For high traffic, consider:
QUEUE_MAX_CONCURRENT="5"                # Increase if system stable
QUEUE_MAX_SIZE="100"                    # Increase if memory allows
```

#### **Database Scaling**
```bash
# Neon database scaling
# - Automatically scales compute
# - Monitor connection usage
# - Consider read replicas for high read loads

# Connection optimization
DATABASE_POOL_SIZE="10"                 # Connection pool size
DATABASE_IDLE_TIMEOUT="30000"          # 30 seconds idle timeout
DATABASE_STATEMENT_TIMEOUT="60000"     # 60 seconds statement timeout
```

### **Security Configuration**

#### **Environment Security**
```bash
# Secure environment variables
# - Never commit secrets to repository
# - Use Netlify environment variables
# - Rotate API keys regularly
# - Use least-privilege database users

# Database security
DATABASE_SSL_MODE="require"             # Force SSL connections
DATABASE_SSL_CERT_PATH="/path/to/cert"  # SSL certificate path (if needed)

# API security
CORS_ALLOWED_ORIGINS="https://your-domain.com"
API_RATE_LIMIT="100"                    # Requests per minute
```

#### **Function Security**
```bash
# Netlify function security
NETLIFY_FUNCTION_TIMEOUT="900"          # 15 minutes max
NETLIFY_FUNCTION_MEMORY="256"           # 256MB memory limit

# Input validation
ENABLE_INPUT_VALIDATION="true"
MAX_REQUEST_SIZE="10485760"             # 10MB max request size
ENABLE_RATE_LIMITING="true"
```

---

## Testing & Validation

### **Pre-Deployment Testing**

#### **Local Testing**
```bash
# Start development server
npm run dev

# Test database connection
npm run db:test

# Test queue system
npm run test:queue

# Run agent tests
npm run test:agents

# Integration tests
npm run test:integration
```

#### **Staging Deployment**
```bash
# Deploy to staging branch
git checkout staging
git merge main
netlify deploy --alias staging

# Test staging environment
npm run test:e2e -- --baseUrl https://staging--your-site.netlify.app

# Load testing
npm run test:load -- --target https://staging--your-site.netlify.app
```

### **Production Validation**

#### **Smoke Tests**
```bash
# Basic functionality tests
curl https://your-app.netlify.app/api/debug/db-status
curl https://your-app.netlify.app/.netlify/functions/intelligent-background-agents

# Test evaluation creation
curl -X POST https://your-app.netlify.app/api/evaluation \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://example.com", "brandName": "Example"}'
```

#### **Performance Validation**
```bash
# Monitor key metrics for 24 hours after deployment
- Success rate should be >95%
- Average completion time should be <12 minutes
- No memory leaks or resource exhaustion
- Database performance within acceptable limits
```

---

## Maintenance & Updates

### **Regular Maintenance Tasks**

#### **Weekly Tasks**
```bash
# Check system health
npm run health:check

# Review error logs
netlify logs:functions --filter error

# Monitor performance metrics
npm run metrics:report

# Update dependencies (if needed)
npm audit
npm update
```

#### **Monthly Tasks**
```bash
# Database maintenance
npm run db:analyze
npm run db:vacuum

# Performance review
npm run performance:report

# Security audit
npm audit --audit-level high
npm run security:scan

# Backup verification
npm run backup:verify
```

### **Update Procedures**

#### **Code Updates**
```bash
# Development workflow
git checkout -b feature/update-xyz
# Make changes
git commit -m "Update: xyz feature"
git push origin feature/update-xyz

# Create pull request
# Review and test
# Merge to main

# Deploy to production
git checkout main
git pull origin main
netlify deploy --prod
```

#### **Configuration Updates**
```bash
# Update environment variables
netlify env:set NEW_VARIABLE "value"

# Update function configuration
# Edit netlify.toml
git commit -m "Update: function configuration"
git push origin main

# Redeploy
netlify deploy --prod
```

### **Rollback Procedures**

#### **Quick Rollback**
```bash
# Rollback to previous deployment
netlify rollback

# Or rollback to specific deployment
netlify rollback --deployment-id abc123
```

#### **Full Rollback**
```bash
# Revert code changes
git revert HEAD
git push origin main

# Redeploy
netlify deploy --prod

# Verify rollback
npm run test:smoke
```

---

## Troubleshooting Deployment Issues

### **Common Deployment Problems**

#### **Build Failures**
```bash
# Check build logs
netlify logs:build

# Common issues:
1. Missing environment variables
2. Node.js version mismatch
3. Dependency conflicts
4. TypeScript errors

# Solutions:
netlify env:list                        # Check environment variables
netlify env:set NODE_VERSION "18"       # Set Node.js version
npm ci                                  # Clean install dependencies
npm run type-check                      # Check TypeScript
```

#### **Function Deployment Issues**
```bash
# Check function logs
netlify logs:functions

# Common issues:
1. Function timeout too low
2. Memory limit exceeded
3. Import/export errors
4. Environment variable access

# Solutions:
# Update netlify.toml function timeout
[functions."background-agents"]
  timeout = 900

# Check function size
netlify functions:list

# Test function locally
netlify dev
```

#### **Database Connection Issues**
```bash
# Test database connection
curl https://your-app.netlify.app/api/debug/db-status

# Common issues:
1. Incorrect DATABASE_URL format
2. SSL configuration problems
3. Connection limit exceeded
4. Network connectivity issues

# Solutions:
netlify env:get DATABASE_URL            # Verify URL format
# Add connection parameters
DATABASE_URL="postgresql://...?sslmode=require&target_session_attrs=read-write"
```

### **Performance Issues**

#### **Slow Response Times**
```bash
# Check function performance
netlify logs:functions --filter duration

# Optimize database queries
npm run db:analyze

# Enable caching
# Add cache headers to API responses
Cache-Control: public, max-age=300

# Optimize bundle size
npm run analyze
```

#### **Memory Issues**
```bash
# Monitor memory usage
netlify logs:functions --filter memory

# Increase function memory limit
[functions."background-agents"]
  memory = 512

# Optimize memory usage
# - Use streaming for large responses
# - Implement garbage collection
# - Reduce object creation in loops
```

This deployment guide provides comprehensive instructions for successfully deploying and maintaining the ADI system in production environments, with emphasis on reliability, performance, and security.
