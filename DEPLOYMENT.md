# AI Visibility Score - Deployment Guide

This guide covers deploying the AI Visibility Score platform to Vercel with Supabase backend.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Supabase Account](https://supabase.com)
- [GitHub Repository](https://github.com) (for automatic deployments)
- Node.js 18+ locally for development

## 1. Supabase Setup

### Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ai-visibility-score`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### Configure Database

1. Wait for project initialization (2-3 minutes)
2. Go to **SQL Editor** in the Supabase dashboard
3. Run the migration file:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
   ```
4. Execute the migration to create all tables and policies

### Get API Keys

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

### Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `https://your-domain.vercel.app`
3. Add **Redirect URLs**:
   - `https://your-domain.vercel.app/dashboard`
   - `http://localhost:3000/dashboard` (for development)

#### Enable OAuth Providers (Optional)

For Google OAuth:
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

## 2. Vercel Deployment

### Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing the AI Visibility Score code

### Configure Environment Variables

In the Vercel project settings, add these environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production

# Encryption Key (Generate a 32-character random string)
ENCRYPTION_KEY=your_32_character_encryption_key

# Optional: AI Provider API Keys (can be set by users in the app)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (3-5 minutes)
3. Your app will be available at `https://your-project.vercel.app`

## 3. Domain Configuration

### Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Supabase **Site URL** and **Redirect URLs** with your custom domain

### SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## 4. Post-Deployment Setup

### Verify Database Connection

1. Visit your deployed app
2. Try to sign up for a new account
3. Check Supabase **Authentication** → **Users** to confirm user creation

### Test AI Provider Integration

1. Sign in to your app
2. Go to **Settings** → **AI Providers**
3. Add API keys for at least one provider
4. Create a test brand and run an evaluation

### Monitor Performance

1. Check Vercel **Analytics** for performance metrics
2. Monitor Supabase **Logs** for database queries
3. Set up error tracking with Sentry (optional)

## 5. Environment-Specific Configuration

### Development Environment

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=your_32_character_encryption_key
```

### Staging Environment

Create a separate Vercel project for staging:
1. Use the same Supabase project or create a separate staging project
2. Configure environment variables with staging values
3. Use a staging domain like `staging-ai-visibility.vercel.app`

## 6. Scaling Considerations

### Database Scaling

- **Supabase Pro**: For production workloads
- **Connection Pooling**: Enabled by default in Supabase
- **Read Replicas**: Available in Supabase Pro for read-heavy workloads

### Vercel Scaling

- **Pro Plan**: For production applications
- **Edge Functions**: For global performance
- **Analytics**: For monitoring and optimization

### AI Provider Rate Limits

- Implement rate limiting in your application
- Use caching for expensive AI operations
- Consider provider-specific optimizations

## 7. Security Checklist

- [ ] Environment variables are properly configured
- [ ] Supabase RLS policies are enabled and tested
- [ ] API keys are encrypted in the database
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] Authentication is properly configured
- [ ] CORS headers are set correctly

## 8. Monitoring and Maintenance

### Health Checks

Create monitoring for:
- Database connectivity
- AI provider API availability
- Application response times
- Error rates

### Backup Strategy

- Supabase provides automatic backups
- Consider additional backup strategies for critical data
- Test restore procedures regularly

### Updates and Maintenance

- Monitor dependencies for security updates
- Keep Supabase and Vercel platforms updated
- Regular performance optimization

## 9. Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are properly installed
- Review build logs in Vercel dashboard

**Database Connection Issues**
- Verify Supabase environment variables
- Check RLS policies
- Confirm database migrations are applied

**Authentication Problems**
- Verify redirect URLs in Supabase
- Check OAuth provider configuration
- Confirm environment variables are set

**AI Provider Errors**
- Validate API keys
- Check rate limits
- Verify provider-specific configurations

### Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Project GitHub Issues

## 10. Cost Optimization

### Vercel Costs
- Use appropriate plan for your usage
- Monitor function execution time
- Optimize bundle size

### Supabase Costs
- Monitor database usage
- Optimize queries for performance
- Use appropriate plan for your scale

### AI Provider Costs
- Implement caching strategies
- Use appropriate models for each task
- Monitor token usage across providers

This deployment guide ensures a production-ready setup for the AI Visibility Score platform with proper security, scalability, and monitoring in place.