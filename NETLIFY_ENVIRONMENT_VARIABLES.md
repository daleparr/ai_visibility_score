# 🌐 Netlify Environment Variables for Railway Bridge

## Required Variables to Add to Netlify

Once your Railway deployment is complete, add these environment variables to your Netlify project:

### 1. Railway Integration
```bash
# Replace with your actual Railway URL from `railway domain`
RAILWAY_API_URL=https://your-railway-app.railway.app

# Must match the JWT_SECRET you set in Railway
RAILWAY_JWT_SECRET=aidi-jwt-secret-2025-production-32-characters-minimum
```

### 2. Feature Flags (Start Disabled for Safety)
```bash
# Bridge Control
ENABLE_RAILWAY_BRIDGE=false

# Tier Configuration (which tiers use Railway)
RAILWAY_BRIDGE_TIERS=free,index-pro,enterprise

# Fallback Options
ENABLE_HYBRID_FALLBACK=true
ENABLE_SYNTHETIC_DATA=false

# Debug Logging
ENABLE_ADVANCED_LOGGING=false
```

### 3. Callback Authentication
```bash
# Must match NETLIFY_CALLBACK_SECRET in Railway
NETLIFY_CALLBACK_SECRET=aidi-callback-secret-2025-production
```

## How to Add These to Netlify

### Option 1: Netlify Dashboard
1. Go to your Netlify project dashboard
2. Click "Site settings" → "Environment variables"
3. Click "Add a variable" for each one above
4. Deploy the site after adding all variables

### Option 2: Netlify CLI
```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your project
netlify link

# Set variables (replace values with your actual values)
netlify env:set RAILWAY_API_URL "https://your-railway-app.railway.app"
netlify env:set RAILWAY_JWT_SECRET "aidi-jwt-secret-2025-production-32-characters-minimum"
netlify env:set ENABLE_RAILWAY_BRIDGE "false"
netlify env:set RAILWAY_BRIDGE_TIERS "free,index-pro,enterprise"
netlify env:set ENABLE_HYBRID_FALLBACK "true"
netlify env:set ENABLE_SYNTHETIC_DATA "false"
netlify env:set ENABLE_ADVANCED_LOGGING "false"
netlify env:set NETLIFY_CALLBACK_SECRET "aidi-callback-secret-2025-production"

# Trigger a new deploy
netlify deploy --prod
```

## Security Notes

⚠️ **CRITICAL**: The `JWT_SECRET` and `RAILWAY_JWT_SECRET` must be identical between Railway and Netlify for authentication to work.

⚠️ **IMPORTANT**: Start with `ENABLE_RAILWAY_BRIDGE=false` to test the deployment without affecting production traffic.

## Verification

After setting these variables and deploying, you can verify the setup by:

1. **Check Feature Flags API**:
   ```bash
   curl https://ai-visibility-score.netlify.app/api/admin/feature-flags
   ```

2. **Test Bridge Endpoint**:
   ```bash
   curl https://ai-visibility-score.netlify.app/api/bridge/enqueue
   # Should return 400 (missing parameters), not 404
   ```

3. **Run Verification Script**:
   ```bash
   node scripts/verify-bridge-setup.js
   ```

---

**Next Steps After Railway Deployment:**
1. Get your Railway URL from `railway domain`
2. Add these environment variables to Netlify
3. Deploy Netlify with new variables
4. Run verification tests
5. Enable bridge in shadow mode
