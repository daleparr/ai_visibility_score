# Step-by-Step Supabase Setup Guide

I can see you have an "ai-visibility-score" project in your Supabase dashboard. Let's get it configured properly!

## Step 1: Get Your Supabase Credentials

### 1.1 Click on your "ai-visibility-score" project
From your dashboard, click on the "ai-visibility-score" project card.

### 1.2 Navigate to Settings → API
1. In the left sidebar, click on the **⚙️ Settings** icon (gear icon at the bottom)
2. Click on **API** in the settings menu

### 1.3 Copy Your Project Credentials
You'll see a page with your project details. Copy these **exact values**:

**Project URL** (this is your NEXT_PUBLIC_SUPABASE_URL):
```
https://[your-project-id].supabase.co
```

**anon public key** (this is your NEXT_PUBLIC_SUPABASE_ANON_KEY):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[long-string-of-characters]
```

**service_role key** (this is your SUPABASE_SERVICE_ROLE_KEY):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[different-long-string]
```

## Step 2: Set Up Your Database

### 2.1 Run the Database Migration
1. In your Supabase project, go to **SQL Editor** (in the left sidebar)
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql` from your project
4. Click **Run** to create all the tables and security policies

## Step 3: Create Your Environment File

### 3.1 Create .env.local file
In your project root (where package.json is), create a new file called `.env.local`:

```bash
# =============================================================================
# AI VISIBILITY SCORE - LOCAL ENVIRONMENT
# =============================================================================

# SUPABASE CONFIGURATION (Replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# APPLICATION CONFIGURATION
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ENCRYPTION KEY (Generate this - see instructions below)
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456

# OPTIONAL: AI PROVIDER KEYS (You can add these later in the app)
# OPENAI_API_KEY=sk-your_key_here
# ANTHROPIC_API_KEY=sk-ant-your_key_here
# GOOGLE_AI_API_KEY=your_google_key_here
```

### 3.2 Generate Your Encryption Key

The `ENCRYPTION_KEY` needs to be exactly 32 characters. Here are 3 ways to generate one:

**Option 1: Use Node.js (if you have it installed)**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Option 2: Use an online generator**
Go to https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
- Select "256-bit"
- Click "Generate"
- Copy the hex key (should be 64 characters, use first 32)

**Option 3: Create manually**
Use any 32 characters (letters and numbers):
```
abcdefghijklmnopqrstuvwxyz123456
```

## Step 4: Replace the Values in .env.local

Edit your `.env.local` file and replace:

1. **NEXT_PUBLIC_SUPABASE_URL**: Paste your Project URL from Step 1.3
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Paste your anon public key from Step 1.3
3. **SUPABASE_SERVICE_ROLE_KEY**: Paste your service_role key from Step 1.3
4. **ENCRYPTION_KEY**: Paste your 32-character key from Step 3.2

## Step 5: Test Your Setup

### 5.1 Install Dependencies
```bash
npm install
```

### 5.2 Start Development Server
```bash
npm run dev
```

### 5.3 Test the Connection
1. Open http://localhost:3000 in your browser
2. Click "Get Started" or "Sign Up"
3. Try to create an account
4. If successful, you'll see the dashboard

## Step 6: Verify Database Setup

### 6.1 Check User Creation
1. Go back to your Supabase dashboard
2. Click on **Authentication** in the left sidebar
3. Click on **Users**
4. You should see your test user account

### 6.2 Check Tables
1. Go to **Table Editor** in the left sidebar
2. You should see tables like: `brands`, `evaluations`, `user_profiles`, etc.

## Troubleshooting

### Problem: "Cannot connect to Supabase"
**Solution**: Double-check your URL and keys are copied correctly (no extra spaces)

### Problem: "Environment variables not found"
**Solution**: Make sure your file is named exactly `.env.local` (with the dot at the beginning)

### Problem: "Tables don't exist"
**Solution**: Run the SQL migration from Step 2.1

### Problem: Multiple environment files
**Solution**: Delete any other `.env*` files and only keep `.env.local`

## Your Final .env.local Should Look Like:

```bash
# SUPABASE CONFIGURATION
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0ODAwMCwiZXhwIjoxOTUyMTI0MDAwfQ.example_signature_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NTQ4MDAwLCJleHAiOjE5NTIxMjQwMDB9.different_signature_here

# APPLICATION CONFIGURATION
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# AI PROVIDER KEYS (Optional)
# OPENAI_API_KEY=sk-your_actual_openai_key_here
# ANTHROPIC_API_KEY=sk-ant-your_actual_anthropic_key_here
```

Once you complete these steps, your AI Visibility Score platform will be fully configured and ready to use!