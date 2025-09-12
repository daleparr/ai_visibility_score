# Vercel Environment Variables - AI Visibility Score

## 🎯 **Required Environment Variables for Vercel**

When you deploy to Vercel, you'll need to add these environment variables in your Vercel project settings:

### **1. Supabase Configuration (Required)**
```
NEXT_PUBLIC_SUPABASE_URL=https://yuefjhbhkbbyrcazgfjl.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWZqaGJoa2JieXJjYXpnZmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODgwMjQsImV4cCI6MjA3MzI2NDAyNH0.JOdfPl-FmsbJJruoxYJkujL5FntjKW7-gzFBn9WBtbg
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWZqaGJoa2JieXJjYXpnZmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODAyNCwiZXhwIjoyMDczMjY0MDI0fQ.BLE9SxrhYckE423yHd6gmXk0d7LPFk3l5OuxZ2w-WPk
```

### **2. Application Configuration (Required)**
```
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```
*Note: Replace with your actual Vercel domain after deployment*

```
NODE_ENV=production
```

```
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456
```

### **3. AI Provider Keys (Optional - can be set later in app)**
```
OPENAI_API_KEY=sk-your_openai_key_here
```

```
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
```

```
GOOGLE_AI_API_KEY=your_google_ai_key_here
```

```
MISTRAL_API_KEY=your_mistral_key_here
```

```
TOGETHER_API_KEY=your_together_key_here
```

---

## 📋 **How to Add Environment Variables in Vercel**

### **Method 1: Vercel Dashboard (Recommended)**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import from GitHub: `daleparr/ai_visibility_score`
4. In the **"Configure Project"** step:
   - Click **"Environment Variables"**
   - Add each variable one by one:
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: `https://yuefjhbhkbbyrcazgfjl.supabase.co`
     - **Environment**: Select all (Production, Preview, Development)
5. Repeat for all variables above
6. Click **"Deploy"**

### **Method 2: Vercel CLI (After login)**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter value: https://yuefjhbhkbbyrcazgfjl.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter the anon key value

# Repeat for all variables...
```

---

## 🔧 **Environment Variable Details**

### **Public Variables (NEXT_PUBLIC_)**
These are safe to expose to the browser:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key for client-side auth
- `NEXT_PUBLIC_APP_URL` - Your application URL for redirects

### **Server-Only Variables**
These are only available on the server:
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access to Supabase (keep secure!)
- `ENCRYPTION_KEY` - For encrypting API keys in database
- `NODE_ENV` - Environment mode
- AI Provider keys (all server-only for security)

---

## ⚠️ **Important Security Notes**

### **DO NOT expose these in client-side code:**
- `SUPABASE_SERVICE_ROLE_KEY` (has admin access)
- `ENCRYPTION_KEY` (used for API key encryption)
- Any AI provider API keys

### **Safe for client-side:**
- `NEXT_PUBLIC_SUPABASE_URL` (public project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (designed for client-side use)
- `NEXT_PUBLIC_APP_URL` (your app's public URL)

---

## 🎯 **Copy-Paste Ready Values**

For quick setup, here are the exact values to copy into Vercel:

**Variable Name**: `NEXT_PUBLIC_SUPABASE_URL`
**Value**: `https://yuefjhbhkbbyrcazgfjl.supabase.co`

**Variable Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWZqaGJoa2JieXJjYXpnZmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODgwMjQsImV4cCI6MjA3MzI2NDAyNH0.JOdfPl-FmsbJJruoxYJkujL5FntjKW7-gzFBn9WBtbg`

**Variable Name**: `SUPABASE_SERVICE_ROLE_KEY`
**Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWZqaGJoa2JieXJjYXpnZmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODAyNCwiZXhwIjoyMDczMjY0MDI0fQ.BLE9SxrhYckE423yHd6gmXk0d7LPFk3l5OuxZ2w-WPk`

**Variable Name**: `NODE_ENV`
**Value**: `production`

**Variable Name**: `ENCRYPTION_KEY`
**Value**: `abcdefghijklmnopqrstuvwxyz123456`

**Variable Name**: `NEXT_PUBLIC_APP_URL`
**Value**: `https://your-project-name.vercel.app` (update after deployment)

---

## 🚀 **Deployment Steps Summary**

1. **✅ Code on GitHub**: https://github.com/daleparr/ai_visibility_score
2. **🔄 Vercel Login**: Currently in progress
3. **⏳ Environment Setup**: Use values above
4. **⏳ Deploy**: After login and env vars are set
5. **⏳ Update Supabase**: Configure redirect URLs with Vercel domain

Once you complete the Vercel login, we can proceed with the deployment!