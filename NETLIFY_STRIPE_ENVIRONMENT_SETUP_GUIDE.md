# Netlify Stripe Environment Variables Setup Guide

## 🎯 **Quick Fix for Stripe Errors**

The Stripe errors you're seeing in production are caused by missing environment variables in Netlify. Here's how to fix them:

## 📋 **Step-by-Step Instructions**

### **1. Access Netlify Dashboard**
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign in to your account
3. Select your **AI Discoverability Index** site

### **2. Navigate to Environment Variables**
1. Click on **"Site settings"** in the top navigation
2. In the left sidebar, click **"Environment variables"**
3. You'll see the current environment variables (if any)

### **3. Add Required Stripe Variables**

Click **"Add a variable"** for each of these:

#### **STRIPE_SECRET_KEY**
- **Key**: `STRIPE_SECRET_KEY`
- **Value**: `sk_test_...` (your Stripe secret key from Stripe dashboard)
- **Scopes**: Select **"All deploy contexts"**

#### **STRIPE_PUBLISHABLE_KEY** 
- **Key**: `STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_...` (your Stripe publishable key from Stripe dashboard)
- **Scopes**: Select **"All deploy contexts"**

#### **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
- **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_...` (same as above - this is for client-side access)
- **Scopes**: Select **"All deploy contexts"**

### **4. Add Database Variable (if missing)**

#### **DATABASE_URL**
- **Key**: `DATABASE_URL`
- **Value**: Your Neon PostgreSQL connection string
- **Scopes**: Select **"All deploy contexts"**

### **5. Add NextAuth Variables (if missing)**

#### **NEXTAUTH_SECRET**
- **Key**: `NEXTAUTH_SECRET`
- **Value**: A random 32+ character string (you can generate one)
- **Scopes**: Select **"All deploy contexts"**

#### **NEXTAUTH_URL**
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://ai-discoverability-index.netlify.app`
- **Scopes**: Select **"All deploy contexts"**

## 🔑 **Where to Find Your Stripe Keys**

### **Getting Stripe Keys:**
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign in to your Stripe account
3. In the left sidebar, click **"Developers"**
4. Click **"API keys"**
5. You'll see:
   - **Publishable key**: `pk_test_...` (for test mode) or `pk_live_...` (for live mode)
   - **Secret key**: Click **"Reveal test key"** to see `sk_test_...` (for test mode)

### **Test vs Live Mode:**
- **Test Mode**: Use `pk_test_...` and `sk_test_...` keys
- **Live Mode**: Use `pk_live_...` and `sk_live_...` keys

**Recommendation**: Start with test mode keys, then switch to live mode when ready for production.

## 🚀 **After Adding Variables**

### **1. Trigger a New Deploy**
1. In Netlify dashboard, go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the deployment to complete (usually 2-3 minutes)

### **2. Verify the Fix**
1. Visit your site: `https://ai-discoverability-index.netlify.app`
2. Try to upgrade to Professional tier
3. Check that the Stripe checkout works
4. Check the browser console for any remaining errors

## 🔧 **Complete Environment Variables List**

Here's the complete list of environment variables your site needs:

```bash
# Database
DATABASE_URL=postgresql://[your-neon-connection-string]

# Stripe
STRIPE_SECRET_KEY=sk_test_[your-stripe-secret-key]
STRIPE_PUBLISHABLE_KEY=pk_test_[your-stripe-publishable-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your-stripe-publishable-key]

# NextAuth
NEXTAUTH_SECRET=[random-32-character-string]
NEXTAUTH_URL=https://ai-discoverability-index.netlify.app

# Optional: AI Provider Keys
OPENAI_API_KEY=[your-openai-key]
ANTHROPIC_API_KEY=[your-anthropic-key]
GOOGLE_AI_API_KEY=[your-google-ai-key]
```

## ⚠️ **Security Notes**

1. **Never commit API keys to Git** - Always use environment variables
2. **Use test keys initially** - Switch to live keys only when ready for production
3. **Regenerate keys if compromised** - Stripe allows you to regenerate keys anytime
4. **Restrict key permissions** - In Stripe dashboard, you can limit what each key can do

## 🐛 **Troubleshooting**

### **If Stripe errors persist:**
1. Check that the keys are correctly copied (no extra spaces)
2. Ensure you're using the right test/live mode keys
3. Verify the keys are active in your Stripe dashboard
4. Check that the deployment completed successfully

### **If database errors persist:**
1. Verify the `DATABASE_URL` is correct
2. Check that your Neon database is active
3. Ensure the connection string includes the correct password

## ✅ **Expected Result**

After adding these environment variables and redeploying:
- ✅ Stripe checkout sessions will work
- ✅ Users can upgrade to Professional/Enterprise tiers
- ✅ Database operations will work (dashboard will show data)
- ✅ No more "Stripe is not initialized" errors
- ✅ No more "DATABASE_URL not found" errors

The environment variable setup is the final step to get your production site fully functional!