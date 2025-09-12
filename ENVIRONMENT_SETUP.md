# Environment Variables Setup Guide

This guide helps you properly configure environment variables for the AI Visibility Score platform.

## Required Environment Variables

You should have **exactly one** of each of these variables:

### Supabase Configuration (Required)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Application Configuration (Required)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=your_32_character_random_string_here
NODE_ENV=development
```

### AI Provider API Keys (Optional - can be set in app)
```bash
OPENAI_API_KEY=sk-your_openai_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here
```

## Troubleshooting Multiple Supabase URLs

If you have multiple Supabase URLs in your environment, here's how to fix it:

### 1. Check Your Environment Files

Look for these files in your project root:
- `.env.local` (highest priority)
- `.env.development` 
- `.env.production`
- `.env`

### 2. Remove Duplicate Variables

Open each file and ensure you have **only one** of each variable:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Clean Environment File Template

Create a new `.env.local` file with only these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456
NODE_ENV=development

# Optional: AI Provider Keys
OPENAI_API_KEY=sk-your_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
GOOGLE_AI_API_KEY=your_google_key_here
```

## Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Generating Encryption Key

Generate a 32-character random string for `ENCRYPTION_KEY`:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Using OpenSSL
openssl rand -hex 16

# Manual (use any 32 characters)
abcdefghijklmnopqrstuvwxyz123456
```

## Environment Variable Priority

Next.js loads environment variables in this order (highest to lowest priority):
1. `.env.local` (always loaded, ignored by git)
2. `.env.development` or `.env.production` (based on NODE_ENV)
3. `.env`

**Recommendation**: Use `.env.local` for all local development variables.

## Verification Steps

1. **Delete conflicting files**: Remove any duplicate `.env*` files
2. **Create clean `.env.local`**: Use the template above
3. **Restart development server**: `npm run dev`
4. **Test connection**: Visit the app and try to sign up

## Common Issues

### Issue: "Multiple Supabase URLs found"
**Solution**: Check all `.env*` files and remove duplicates

### Issue: "Cannot connect to Supabase"
**Solution**: Verify your project URL and keys are correct

### Issue: "Environment variables not loading"
**Solution**: Restart your development server after changing `.env` files

### Issue: "Authentication not working"
**Solution**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

## Production Environment

For production deployment on Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable individually
4. Redeploy your application

## Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Use different Supabase projects for development/production
- Rotate API keys regularly
- Keep service role keys secure (they have admin access)

## Quick Fix Command

If you want to start fresh, run these commands:

```bash
# Remove all environment files
rm .env .env.local .env.development .env.production

# Copy the example file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

This should resolve any issues with multiple Supabase URLs in your environment configuration.