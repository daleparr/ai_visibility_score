# Netlify Environment Variable Setup Guide

## 🎯 Enable Production Mode - Step by Step

Perfect! I can see you're already in the Netlify Environment variables page. Here's exactly what to do:

### Current Status:
✅ You're in the right place: Environment variables page
✅ I can see `DEMO_MODE` is already listed in your variables

### 📋 Step-by-Step Instructions:

#### Step 1: Edit DEMO_MODE Variable
1. **Look for the `DEMO_MODE` row** in the list (I can see it's there)
2. **Click anywhere on the `DEMO_MODE` row** to select/edit it
3. **Look for an "Edit" button or pencil icon** that appears
4. **Click the Edit button**

#### Step 2: Change the Value
1. **Find the "Value" field** (currently set to `true` or similar)
2. **Clear the current value**
3. **Type**: `false`
4. **Click "Save" or "Update"**

#### Step 3: Confirm Changes
1. **Verify** the `DEMO_MODE` value now shows `false`
2. **Netlify will automatically trigger a redeploy**
3. **Wait 2-3 minutes** for the deployment to complete

### 🔍 What to Look For:

#### In the Environment Variables List:
- `DEMO_MODE` should show value: `false`
- Other variables should remain unchanged

#### After Redeploy:
- Visit: https://ai-visibility-score.netlify.app/dashboard
- The "Demo Mode Active" banner should be **GONE**
- Dashboard will show empty state (no demo data)
- You can create real brands that persist in the database

### 🚀 Expected Results:

#### Before Change (Current):
- Shows "Demo Mode Active" banner
- Displays sample/demo data
- Brand creation doesn't persist

#### After Change (Production):
- No demo mode banner
- Clean dashboard (no demo data)
- Zero-friction access to all features
- Brand creation stores in live Neon database
- Session-based user management active

### 🆘 If You Need Help:
1. **Can't find Edit button?** - Try clicking directly on the `DEMO_MODE` text
2. **No Save option?** - Look for "Update" or checkmark icon
3. **Changes not saving?** - Refresh the page and try again

### 🎉 Success Indicators:
- `DEMO_MODE` shows `false` in the list
- Netlify shows "Deploying" status
- After deployment, demo banner disappears from site

Let me know when you've made the change and I'll help verify the production mode is working!