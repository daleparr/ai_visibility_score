# Google Authentication Setup Guide

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click "Select a project" at the top
   - Either select existing project or click "New Project"
   - Give it a name like "AI Visibility Score"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" 
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name it "AI Visibility Score Auth"

5. **Configure OAuth Consent Screen** (if prompted)
   - Go to "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Fill in required fields:
     - App name: "AI Visibility Score"
     - User support email: your email
     - Developer contact: your email
   - Save and continue through the steps

6. **Set Authorized Origins and Redirect URIs**
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3005
   https://your-production-domain.com
   ```
   
   **Authorized redirect URIs:**
   ```
   https://your-supabase-project-url.supabase.co/auth/v1/callback
   ```
   
   Replace `your-supabase-project-url` with your actual Supabase project URL

7. **Copy Your Credentials**
   - Copy the "Client ID" 
   - Copy the "Client Secret"

## Step 2: Configure Supabase

1. **In your Supabase Dashboard** (where you are now):
   - Paste the **Client ID** in the "Client IDs" field
   - Paste the **Client Secret** in the "Client Secret" field
   - Click "Save"

## Step 3: Update Your Environment Variables

Update your `.env.local` file with your real Supabase credentials:

```env
# Replace with your actual Supabase project URL and keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3005
NODE_ENV=development

# Encryption Key (generate a real one)
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

## Step 4: Get Your Supabase Credentials

1. **In Supabase Dashboard**:
   - Go to "Settings" > "API"
   - Copy your "Project URL" 
   - Copy your "anon public" key
   - Copy your "service_role" key (keep this secret!)

## Step 5: Test Authentication

1. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev -- --port 3005
   ```

2. **Test the auth flow**:
   - Go to http://localhost:3005
   - Click "Sign In" 
   - Try Google authentication

## Troubleshooting

**Common Issues:**

1. **"redirect_uri_mismatch" error**
   - Make sure the redirect URI in Google Console exactly matches your Supabase callback URL

2. **"unauthorized_client" error**
   - Check that your domain is in the "Authorized JavaScript origins"

3. **Still seeing demo mode**
   - Make sure your `.env.local` doesn't contain "demo" in the URLs
   - Restart your development server after changing environment variables

## Security Notes

- Never commit your `.env.local` file to git
- Keep your service role key secret
- Use different credentials for production vs development