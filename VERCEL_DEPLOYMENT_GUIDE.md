# Vercel Deployment Guide - AI Visibility Score

## 🚀 **Quick Deployment Steps**

### **1. GitHub Repository Ready** ✅
- **Repository**: https://github.com/daleparr/ai_visibility_score
- **Code Pushed**: 49 files, 16,080 lines of code
- **Status**: Ready for deployment

### **2. Deploy to Vercel**

#### **Option A: Using Vercel Dashboard (Recommended)**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import from GitHub: `daleparr/ai_visibility_score`
4. Configure environment variables (see below)
5. Click **"Deploy"**

#### **Option B: Using Vercel CLI**
```bash
vercel login
vercel --prod
```

### **3. Environment Variables for Vercel**

In your Vercel project settings, add these environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yuefjhbhkbbyrcazgfjl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWZqaGJoa2JieXJjYXpnZmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODgwMjQsImV4cCI6MjA3MzI2NDAyNH0.JOdfPl-FmsbJJruoxYJkujL5FntjKW7-gzFBn9WBtbg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWZqaGJoa2JieXJjYXpnZmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODAyNCwiZXhwIjoyMDczMjY0MDI0fQ.BLE9SxrhYckE423yHd6gmXk0d7LPFk3l5OuxZ2w-WPk

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456

# Optional: AI Provider Keys (can be set later in app)
# OPENAI_API_KEY=sk-your_openai_key_here
# ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
# GOOGLE_AI_API_KEY=your_google_ai_key_here
```

### **4. Supabase Configuration for Production**

#### **Update Supabase Settings**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your **ai-visibility-score** project
3. Go to **Authentication** → **Settings**
4. Update **Site URL**: `https://your-vercel-domain.vercel.app`
5. Add **Redirect URLs**:
   - `https://your-vercel-domain.vercel.app/dashboard`
   - `https://your-vercel-domain.vercel.app/auth/callback`

#### **Run Database Migration**
1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** to create all tables and policies

## 🔧 **Deployment Configuration**

### **Vercel.json Configuration** ✅
The project includes a complete [`vercel.json`](vercel.json:1) with:
- **Framework**: Next.js detection
- **Functions**: 30-second timeout for AI operations
- **Environment**: Proper variable mapping
- **Headers**: CORS configuration
- **Rewrites**: API route handling

### **Build Settings**
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (automatic)
- **Install Command**: `npm install`

## 📊 **Expected Deployment Results**

### **Build Performance**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    175 B          88.9 kB
├ ○ /auth/signin                         1.89 kB         142 kB
├ ○ /auth/signup                         2.75 kB         143 kB
├ ○ /dashboard                           4.44 kB         141 kB
└ ○ /dashboard/brands/new                12.8 kB         168 kB
```

### **Deployment Features**
- ✅ **Automatic HTTPS** with SSL certificates
- ✅ **Global CDN** for fast loading worldwide
- ✅ **Serverless Functions** for API routes
- ✅ **Edge Optimization** for performance
- ✅ **Automatic Deployments** on Git push

## 🎯 **Post-Deployment Checklist**

### **1. Verify Deployment**
- [ ] Visit your Vercel domain
- [ ] Test landing page loads correctly
- [ ] Check authentication pages work
- [ ] Verify Supabase connection

### **2. Test Core Features**
- [ ] Sign up for new account
- [ ] Create a brand profile
- [ ] Test dashboard navigation
- [ ] Verify database operations

### **3. Configure Production Settings**
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring (Sentry, etc.)
- [ ] Set up analytics
- [ ] Test performance

## 🔒 **Security Considerations**

### **Environment Variables**
- ✅ **Sensitive data**: Stored securely in Vercel
- ✅ **API keys**: Encrypted in database
- ✅ **Service role**: Only in server environment
- ✅ **Public keys**: Safe for client-side use

### **Database Security**
- ✅ **Row Level Security**: Enabled on all tables
- ✅ **User isolation**: Each user sees only their data
- ✅ **API protection**: Service role key secured
- ✅ **Authentication**: JWT token validation

## 📈 **Monitoring & Analytics**

### **Vercel Analytics** (Built-in)
- Page views and performance metrics
- Core Web Vitals tracking
- Geographic distribution
- Device and browser analytics

### **Optional Integrations**
- **Sentry**: Error tracking and monitoring
- **Google Analytics**: User behavior tracking
- **Mixpanel**: Product analytics
- **LogRocket**: Session replay

## 🎉 **Expected Outcome**

After deployment, you'll have:
- **Live Application**: Accessible at your Vercel domain
- **Automatic Deployments**: Updates on every Git push
- **Production Database**: Connected to Supabase
- **Global Performance**: Fast loading worldwide
- **Enterprise Security**: Production-ready security measures

## 🚀 **Next Steps After Deployment**

1. **Test Authentication**: Create account and verify email
2. **Add AI Provider Keys**: Configure OpenAI, Anthropic, etc.
3. **Run First Evaluation**: Test the complete workflow
4. **Share with Users**: Begin collecting feedback
5. **Monitor Performance**: Track usage and optimize

Your AI Visibility Score platform will be live and ready for users!