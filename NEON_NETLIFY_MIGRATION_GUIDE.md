
# Migration Guide: Supabase → Neon + Netlify

## 🎯 Migration Overview

This guide will help you migrate from Supabase to Neon (PostgreSQL) + Netlify deployment for better control and easier deployment.

## ✅ What I've Already Prepared

### 1. **New Database Schema** (`src/lib/db/schema.ts`)
- ✅ Drizzle ORM schema with all tables
- ✅ Proper TypeScript types
- ✅ Relations and constraints
- ✅ Support for both core and ADI features

### 2. **Database Client** (`src/lib/database.ts`)
- ✅ Neon serverless PostgreSQL client
- ✅ Demo mode support for testing
- ✅ All CRUD operations
- ✅ Type-safe queries

### 3. **Authentication** (`src/lib/auth.ts`)
- ✅ NextAuth.js configuration
- ✅ Google OAuth provider
- ✅ Drizzle adapter for database
- ✅ Session management

### 4. **Deployment Configuration**
- ✅ `netlify.toml` - Netlify deployment config
- ✅ `drizzle.config.ts` - Database migration config
- ✅ NextAuth API routes

---

## 🚀 Step-by-Step Migration Process

### Step 1: Set Up Neon Database

1. **Create Neon Account**
   - Go to: https://neon.tech/
   - Sign up with GitHub/Google
   - Create a new project: "AI Visibility Score"

2. **Get Database Connection String**
   - Copy your connection string from Neon dashboard
   - It looks like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Step 2: Update Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "netlify-build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit push:pg", 
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

### Step 3: Update Environment Variables

Create new `.env.local`:

```env
# Neon Database
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3005
NODE_ENV=development

# AI Provider API Keys (Optional)
OPENAI_API_KEY=sk-your_openai_api_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### Step 4: Run Database Migration

```bash
# Generate migration files
npm run db:generate

# Apply migrations to Neon
npm run db:migrate

# (Optional) Open Drizzle Studio to view data
npm run db:studio
```

### Step 5: Set Up Google OAuth

1. **Google Cloud Console**:
   - Go to: https://console.cloud.google.com/
   - Create/select project
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Configure OAuth**:
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:3005
     https://your-netlify-domain.netlify.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3005/api/auth/callback/google
     https://your-netlify-domain.netlify.app/api/auth/callback/google
     ```

### Step 6: Update Application Code

Replace imports in your components:

```typescript
// OLD (Supabase)
import { getBrands, getEvaluations } from '@/lib/supabase'

// NEW (Neon + Drizzle)
import { getBrands, getEvaluations } from '@/lib/database'
```

### Step 7: Deploy to Netlify

1. **Connect Repository**:
   - Go to: https://app.netlify.com/
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - Build command: `npm run netlify-build`
   - Publish directory: `.next`
   - Node version: `18`

3. **Set Environment Variables** in Netlify dashboard:
   ```
   DATABASE_URL=your-neon-connection-string
   NEXTAUTH_URL=https://your-site.netlify.app
   NEXTAUTH_SECRET=your-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy

---

## 🔧 Migration Benefits

### **Neon Advantages:**
- ✅ **Serverless PostgreSQL** - Auto-scaling database
- ✅ **Better Performance** - Faster queries and connections
- ✅ **Cost Effective** - Pay only for what you use
- ✅ **Full PostgreSQL** - No limitations vs Supabase
- ✅ **Branching** - Database branches for development

### **Netlify Advantages:**
- ✅ **Easier Deployment** - Git-based deployments
- ✅ **Edge Functions** - Global performance
- ✅ **Form Handling** - Built-in form processing
- ✅ **CDN** - Global content delivery
- ✅ **Preview Deployments** - Test before production

### **NextAuth Advantages:**
- ✅ **Provider Flexibility** - Easy to add more OAuth providers
- ✅ **Session Management** - Robust session handling
- ✅ **Security** - Industry-standard authentication
- ✅ **Customization** - Full control over auth flow

---

## 🧪 Testing the Migration

### **Local Testing:**
1. **Start development server**:
   ```bash
   npm run dev -- --port 3005
   ```

2. **Test demo mode**:
   - Visit: http://localhost:3005/demo
   - Verify all UI components work
   - Test navigation and interactions

3. **Test with real database**:
   - Set up Neon database
   - Update environment variables
   - Run migrations
   - Test authentication flow

### **Production Testing:**
1. **Deploy to Netlify**
2. **Test authentication with Google**
3. **Verify database connections**
4. **Test all application features**

---

## 🔄 Rollback Plan

If you need to rollback to Supabase:
1. Keep the original Supabase files
2. Switch environment variables back
3. Redeploy to Vercel
4. The migration is non-destructive

---

## 📋 Migration Checklist

### **Pre-Migration:**
- [ ] Create Neon database account
- [ ] Set up Google OAuth credentials
- [ ] Backup any existing data

### **Migration:**
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Test authentication locally
- [ ] Update component imports

### **Deployment:**
- [ ] Connect repository to