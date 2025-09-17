# 🔧 Google OAuth Fix Guide - Redirect URI Mismatch

## ✅ **CONFIRMED DIAGNOSIS**
Your Google Cloud Console OAuth configuration has incorrect redirect URIs. Your NextAuth.js setup expects:
- **Required Redirect URI**: `http://localhost:3000/api/auth/callback/google`

## 🛠️ **STEP-BY-STEP FIX**

### Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (the one with Client ID: `994280862134-349t9rue6chetb4jaaktcn0rs1kevfei`)

### Step 2: Navigate to OAuth Credentials
1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"**
3. Find your OAuth 2.0 Client ID (should show `994280862134-349t9rue6chetb4jaaktcn0rs1kevfei`)
4. Click the **pencil icon** (Edit) next to it

### Step 3: Fix Authorized Redirect URIs
In the **"Authorized redirect URIs"** section:

1. **REMOVE** any existing URIs that look like:
   - `https://your-supabase-project-url.supabase.co/auth/v1/callback`
   - Any other incorrect URIs

2. **ADD** the correct URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

3. **For production** (when you deploy), you'll also need:
   ```
   https://your-production-domain.com/api/auth/callback/google
   ```

### Step 4: Verify Authorized JavaScript Origins
In the **"Authorized JavaScript origins"** section, ensure you have:
```
http://localhost:3000
https://ai-discoverability-index.netlify.app
```

### Step 5: Save Changes
1. Click **"Save"** at the bottom
2. Wait for the confirmation message

## 🧪 **TEST THE FIX**

After making these changes:

1. **Restart your development server**:
   ```bash
   # Stop current server (Ctrl+C in terminal)
   npm run dev
   ```

2. **Test the OAuth flow**:
   - Go to: http://localhost:3000/auth/signin
   - Click "Continue with Google"
   - You should now be redirected to Google's consent screen without errors
   - After granting permission, you should be redirected back to your app

## 🔍 **VERIFICATION CHECKLIST**

- [ ] Google Cloud Console shows correct redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] JavaScript origins includes: `http://localhost:3000`
- [ ] Development server restarted
- [ ] OAuth flow completes without "redirect_uri_mismatch" error

## 🚨 **TROUBLESHOOTING**

If you still get errors after this fix:

1. **Clear browser cache** and try again
2. **Double-check the URI** - it must be exactly: `http://localhost:3000/api/auth/callback/google`
3. **Verify your .env.local** has: `NEXTAUTH_URL=http://localhost:3000`
4. **Check console logs** for any additional error details

## 📋 **PRODUCTION DEPLOYMENT NOTES**

When you deploy to production, you'll need to:
1. Add your production domain to both:
   - Authorized JavaScript origins: `https://ai-discoverability-index.netlify.app`
   - Authorized redirect URIs: `https://ai-discoverability-index.netlify.app/api/auth/callback/google`
2. Update `NEXTAUTH_URL` in your production environment variables to: `https://ai-discoverability-index.netlify.app`

**✅ CONFIGURATION COMPLETE!** Based on the screenshot, your Google Cloud Console is already properly configured with both development and production URLs.

---

**Need help?** If you encounter any issues during this process, let me know which step you're stuck on!