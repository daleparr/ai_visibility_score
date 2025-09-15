# Production Deployment Guide

## Overview
This guide will help you transition from demo mode to full production with live database integration while maintaining zero-friction access (no OAuth required).

## Current Status
✅ **Database**: Neon PostgreSQL successfully migrated and seeded  
✅ **Deployment**: Successfully deployed on Netlify  
✅ **Session Management**: OAuth-free session system implemented  
✅ **Components**: All dashboard components updated for production  

## Step 1: Configure Netlify Environment Variables

### Required Variables (Set in Netlify Dashboard)
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```bash
# Core Production Settings
DEMO_MODE=false
NODE_ENV=production

# Database (Already configured)
DATABASE_URL=postgresql://neondb_owner:npg_lj3PsSKue6IG@ep-snowy-heart-abt3z4wo-pooler.eu-west-2.aws.neon.tech/neondb

# Authentication (Optional - platform works without OAuth)
NEXTAUTH_SECRET=your-secure-secret-key-here
NEXTAUTH_URL=https://ai-visibility-score.netlify.app

# Application Settings
NEXT_PUBLIC_APP_NAME=AI Visibility Score
NEXT_PUBLIC_APP_DESCRIPTION=Evaluate how your brand appears in AI-powered search and recommendation systems
```

### Optional AI Provider Keys (For Live Evaluations)
```bash
# Add these for full AI evaluation functionality
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
GOOGLE_AI_API_KEY=your-google-ai-key-here
```

### Feature Flags
```bash
# Enable premium features
ENABLE_ADI_FEATURES=true
ENABLE_BENCHMARKING=true
ENABLE_EXPORT_FEATURES=true
```

## Step 2: Deploy Changes

After setting environment variables in Netlify:

1. **Trigger a new deployment** (Netlify will automatically redeploy with new environment variables)
2. **Monitor the deployment** in Netlify dashboard
3. **Verify the build succeeds** without errors

## Step 3: Test Production Features

### 3.1 Test Database Integration
1. Visit your live site: `https://ai-visibility-score.netlify.app`
2. Navigate to **Dashboard**
3. Click **"Add New Brand"**
4. Create a test brand with:
   - Name: "Test Production Brand"
   - Website: "https://example.com"
   - Industry: "Technology"
5. **Verify**: Brand appears in dashboard (stored in live Neon database)

### 3.2 Test Session Management
1. **Open incognito/private browser window**
2. Visit the site and create another brand
3. **Verify**: Each session gets a unique guest user ID
4. **Check**: Brands are isolated per session

### 3.3 Test Zero-Friction Access
1. **No login required** - users can immediately access all features
2. **No OAuth barriers** - direct access to dashboard and brand creation
3. **Session persistence** - data persists during user session

## Step 4: Validation Checklist

### ✅ Core Functionality
- [ ] Dashboard loads without errors
- [ ] Brand creation works with live database
- [ ] Session-based user management functions
- [ ] No hardcoded demo data appears
- [ ] Database operations use Neon PostgreSQL

### ✅ User Experience
- [ ] Zero-friction access (no login required)
- [ ] Fast page loads
- [ ] Responsive design works
- [ ] Error handling graceful

### ✅ Technical Validation
- [ ] `DEMO_MODE=false` in environment
- [ ] Database connections successful
- [ ] No console errors in browser
- [ ] Netlify functions working

## Step 5: Monitor and Optimize

### Performance Monitoring
- Monitor Netlify analytics for page load times
- Check Neon database performance metrics
- Watch for any error patterns in logs

### Database Health
- Monitor connection pool usage
- Check query performance
- Verify data integrity

## Troubleshooting

### Issue: Demo data still appears
**Solution**: Verify `DEMO_MODE=false` is set in Netlify environment variables and redeploy

### Issue: Database connection errors
**Solution**: Check `DATABASE_URL` is correctly set and Neon database is accessible

### Issue: Session not persisting
**Solution**: Verify cookies are working and session management is properly initialized

### Issue: Build failures
**Solution**: Check all required environment variables are set and no TypeScript errors exist

## Next Steps (Optional)

### Add AI Provider Keys
To enable live AI evaluations, add API keys for:
- OpenAI (GPT models)
- Anthropic (Claude models)  
- Google AI (Gemini models)

### Enable Advanced Features
- Set `ENABLE_ADI_FEATURES=true` for premium analytics
- Configure rate limiting for production usage
- Add monitoring and alerting

## Support

If you encounter issues:
1. Check Netlify deployment logs
2. Verify environment variables are correctly set
3. Test database connectivity
4. Review browser console for errors

The platform is now ready for production use with live database integration and zero-friction access!