# Complete Supabase Setup Guide

## Quick Setup Checklist

### ✅ Step 1: Get Your Supabase Project Details
From your Supabase dashboard, go to **Settings > API** and copy:
- Project URL: `https://your-project-id.supabase.co`
- anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- service_role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### ✅ Step 2: Update Environment Variables
Replace your `.env.local` file content with:

```env
# Supabase Configuration (REPLACE WITH YOUR ACTUAL VALUES)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3005
NODE_ENV=development

# Encryption Key (generate a random 32-character string)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# AI Provider API Keys (Optional - for testing evaluation features)
# OPENAI_API_KEY=sk-your_openai_api_key_here
# ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here
# GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### ✅ Step 3: Set Up Database Schema
In your Supabase dashboard, go to **SQL Editor** and run this migration:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE evaluation_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE recommendation_priority AS ENUM ('1', '2', '3');
CREATE TYPE grade_type AS ENUM ('A', 'B', 'C', 'D', 'F');

-- Brands table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    competitors TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    status evaluation_status DEFAULT 'pending',
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    grade grade_type,
    verdict TEXT,
    strongest_dimension VARCHAR(100),
    weakest_dimension VARCHAR(100),
    biggest_opportunity VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dimension scores table
CREATE TABLE dimension_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    dimension_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    explanation TEXT,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI providers table
CREATE TABLE ai_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_name)
);

-- Evaluation results table
CREATE TABLE evaluation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    prompt_used TEXT,
    response_received TEXT,
    score_contribution INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    priority recommendation_priority NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    impact_level VARCHAR(20) CHECK (impact_level IN ('high', 'medium', 'low')),
    effort_level VARCHAR(20) CHECK (effort_level IN ('high', 'medium', 'low')),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(100),
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_evaluations_brand_id ON evaluations(brand_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_dimension_scores_evaluation_id ON dimension_scores(evaluation_id);
CREATE INDEX idx_ai_providers_user_id ON ai_providers(user_id);
CREATE INDEX idx_evaluation_results_evaluation_id ON evaluation_results(evaluation_id);
CREATE INDEX idx_recommendations_evaluation_id ON recommendations(evaluation_id);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimension_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own brands" ON brands
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage evaluations for their brands" ON evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM brands 
            WHERE brands.id = evaluations.brand_id 
            AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view dimension scores for their evaluations" ON dimension_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM evaluations e
            JOIN brands b ON e.brand_id = b.id
            WHERE e.id = dimension_scores.evaluation_id 
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own AI providers" ON ai_providers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### ✅ Step 4: Configure Google OAuth (You're already doing this!)

In your Supabase dashboard under **Authentication > Providers > Google**:

1. **Enable Google provider** ✅ (You've done this)
2. **Get Google OAuth credentials** from Google Cloud Console:
   - Go to: https://console.cloud.google.com/
   - Create/select project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Set authorized origins: `http://localhost:3005`
   - Set redirect URI: `https://your-supabase-url.supabase.co/auth/v1/callback`

3. **Add credentials to Supabase**:
   - Client ID: (from Google Console)
   - Client Secret: (from Google Console)

### ✅ Step 5: Test the Setup

1. **Restart your dev server**:
   ```bash
   # Stop current server (Ctrl+C in terminal)
   npm run dev -- --port 3005
   ```

2. **Test authentication**:
   - Go to http://localhost:3005
   - Click "Sign In"
   - Try Google authentication
   - Should redirect to dashboard after successful login

### ✅ Step 6: Verify Database Connection

After successful login, check if:
- User profile is created automatically
- You can access the dashboard
- No more "demo mode" indicators appear

## Troubleshooting

**If you see "demo mode" still active:**
- Check your `.env.local` file doesn't contain "demo" in URLs
- Restart the development server
- Clear browser cache/cookies

**If Google auth fails:**
- Verify redirect URI matches exactly
- Check authorized origins include your domain
- Ensure Google+ API is enabled

**If database errors occur:**
- Verify the SQL migration ran successfully
- Check RLS policies are enabled
- Confirm your service role key is correct

## Next Steps After Setup

Once authentication works:
1. Test brand creation
2. Try running an evaluation (will need AI provider API keys)
3. Explore the full dashboard functionality
4. Set up production deployment when ready

Your application will then be fully functional with real authentication and database!