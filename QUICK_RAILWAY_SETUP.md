# 🚂 Quick Railway Setup for Windows

## Step 1: Login to Railway (Manual)
Since Railway CLI requires interactive authentication, please run this command in your terminal:

```bash
railway login
```

This will open your browser for authentication. Once logged in, come back to the terminal.

## Step 2: Link to Your Project
After logging in, run:

```bash
railway link -p 858930f6-89f7-446a-99d9-c900a78192ac
```

## Step 3: Navigate to Railway Workers Directory
```bash
cd railway-workers
```

## Step 4: Add Redis Service (if not already added)
```bash
railway add redis
```

## Step 5: Set Environment Variables
Run these commands one by one:

### Core Configuration
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set LOG_LEVEL=info
```

### Authentication (CRITICAL - Generate Strong Secrets)
```bash
railway variables set JWT_SECRET="aidi-jwt-secret-2025-production-32-characters-minimum"
railway variables set NETLIFY_CALLBACK_SECRET="aidi-callback-secret-2025-production"
```

### Netlify Integration
```bash
railway variables set NETLIFY_CALLBACK_URL="https://ai-visibility-score.netlify.app/.netlify/functions/bridge-callback"
railway variables set ALLOWED_ORIGINS="https://ai-visibility-score.netlify.app"
```

### Database (Copy from your Netlify environment)
```bash
# Get this from Netlify environment variables
railway variables set DATABASE_URL="your-neon-database-url-here"
```

### API Keys (Copy from your Netlify environment)
```bash
railway variables set OPENAI_API_KEY="your-openai-key"
railway variables set ANTHROPIC_API_KEY="your-anthropic-key"
railway variables set GOOGLE_AI_API_KEY="your-google-key"
railway variables set MISTRAL_API_KEY="your-mistral-key"
railway variables set BRAVE_API_KEY="your-brave-key"
railway variables set PERPLEXITY_API_KEY="your-perplexity-key"
```

### Performance Settings
```bash
railway variables set QUEUE_CONCURRENCY=4
railway variables set MAX_JOB_ATTEMPTS=3
railway variables set JOB_TIMEOUT=600000
```

## Step 6: Deploy
```bash
railway up
```

## Step 7: Get Your Railway URL
```bash
railway domain
```

---

**Once you complete these steps, let me know your Railway URL and I'll help you configure the Netlify side!**
