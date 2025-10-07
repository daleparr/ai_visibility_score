# 🚂 Railway Deployment Steps

## Step 1: Manual Railway Setup (5 minutes)

Since Railway CLI requires interactive authentication, please follow these steps manually:

### 1.1 Login to Railway
```bash
railway login
# This will open your browser for authentication
# Sign up/login with GitHub, Google, or email
```

### 1.2 Create New Project
```bash
cd railway-workers
railway init
# Choose "Create new project"
# Name it: "aidi-railway-workers"
```

### 1.3 Add Redis Service
```bash
railway add redis
# This adds a Redis instance to your project
```

### 1.4 Get Railway URL
```bash
railway domain
# Note the URL - you'll need it for Netlify configuration
# Example: https://aidi-railway-workers.railway.app
```

## Step 2: Environment Variables Setup

### 2.1 Core Configuration
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set LOG_LEVEL=info
```

### 2.2 Authentication (CRITICAL)
```bash
# Generate a strong JWT secret (32+ characters)
railway variables set JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-32chars+"
railway variables set NETLIFY_CALLBACK_SECRET="your-callback-secret-change-this-too"
```

### 2.3 Netlify Integration
```bash
# Replace with your actual Netlify URL
railway variables set NETLIFY_CALLBACK_URL="https://ai-visibility-score.netlify.app/.netlify/functions/bridge-callback"
railway variables set ALLOWED_ORIGINS="https://ai-visibility-score.netlify.app"
```

### 2.4 Database (Copy from Netlify)
```bash
# Get this from your Netlify environment variables
railway variables set DATABASE_URL="your-neon-database-url-from-netlify"
```

### 2.5 External API Keys (Copy from Netlify)
```bash
# Copy these exact values from your Netlify environment variables
railway variables set OPENAI_API_KEY="your-openai-key"
railway variables set ANTHROPIC_API_KEY="your-anthropic-key"
railway variables set GOOGLE_AI_API_KEY="your-google-key"
railway variables set MISTRAL_API_KEY="your-mistral-key"
railway variables set BRAVE_API_KEY="your-brave-key"
railway variables set PERPLEXITY_API_KEY="your-perplexity-key"
```

### 2.6 Performance Tuning
```bash
railway variables set QUEUE_CONCURRENCY=4
railway variables set MAX_JOB_ATTEMPTS=3
railway variables set JOB_TIMEOUT=600000
```

## Step 3: Deploy to Railway
```bash
railway up
# This will build and deploy your application
# Wait for deployment to complete (2-3 minutes)
```

## Step 4: Verify Deployment
```bash
# Test health endpoint
curl https://your-railway-url.railway.app/health

# Test detailed health
curl https://your-railway-url.railway.app/health/detailed
```

---

**Once you complete these steps, let me know and I'll continue with the Netlify integration!**

## Expected Output
After successful deployment, you should see:
- ✅ Railway project created
- ✅ Redis service running
- ✅ Application deployed and healthy
- ✅ Health endpoints responding
- 📝 Railway URL noted for Netlify configuration

## Troubleshooting
If you encounter issues:
1. Check Railway logs: `railway logs --tail`
2. Verify environment variables: `railway variables`
3. Check service status in Railway dashboard
4. Ensure all required environment variables are set
