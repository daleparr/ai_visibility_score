# Security Guardrails for AI Discoverability Index

## Overview
This document outlines security measures to prevent accidental exposure of sensitive information in the codebase.

## Secrets Management Rules

### ❌ NEVER DO
- Hardcode production URLs in source code
- Include actual domain names in documentation
- Commit environment variables with real values
- Use production secrets in example files

### ✅ ALWAYS DO
- Use environment variables for all URLs and secrets
- Use placeholder values in documentation (e.g., `https://your-domain.netlify.app`)
- Reference environment variables in code: `process.env.NEXT_PUBLIC_APP_URL`
- Keep example files with dummy values only

## Netlify Secrets Scanning Configuration

Current configuration in `netlify.toml`:
```toml
SECRETS_SCAN_OMIT_KEYS = "NEXT_PUBLIC_APP_URL,NEXTAUTH_URL"
SECRETS_SCAN_OMIT_PATHS = ".next/**,.netlify/**,*.md,docs/**,guides/**"
```

## Code Patterns

### ✅ Correct URL Handling
```typescript
// In API routes
const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// In metadata
metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
```

### ❌ Incorrect URL Handling
```typescript
// DON'T hardcode production URLs
const baseUrl = 'https://ai-discoverability-index.netlify.app'
metadataBase: new URL('https://ai-discoverability-index.netlify.app')
```

## Documentation Guidelines

### ✅ Safe Documentation Examples
```markdown
NEXTAUTH_URL=https://your-domain.netlify.app
Visit: https://your-domain.netlify.app/dashboard
```

### ❌ Unsafe Documentation Examples
```markdown
NEXTAUTH_URL=https://ai-discoverability-index.netlify.app
Visit: https://ai-discoverability-index.netlify.app/dashboard
```

## Pre-Commit Checklist

Before committing code:
- [ ] No hardcoded production URLs in source files
- [ ] All documentation uses placeholder domains
- [ ] Environment variables used for all external URLs
- [ ] No real secrets in example files
- [ ] Netlify secrets scanning configuration is up to date

## Files to Monitor

High-risk files that commonly contain secrets:
- `src/app/layout.tsx` - metadata configuration
- `src/app/api/stripe/**/*.ts` - payment URLs
- `*.md` files - documentation with examples
- `.env.*` files - environment configurations

## Recovery Process

If secrets are accidentally committed:
1. Immediately replace hardcoded values with environment variables
2. Update documentation to use placeholders
3. Commit and push fixes
4. Monitor Netlify build logs for successful deployment
5. Update this document if new patterns are discovered

## Environment Variables

Required environment variables for production:
- `NEXT_PUBLIC_APP_URL` - Public application URL
- `NEXTAUTH_URL` - NextAuth callback URL
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - NextAuth encryption key
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret

## Monitoring

- Netlify automatically scans for secrets during build
- Failed builds due to secrets will block deployment
- Review build logs for any security warnings
- Regularly audit codebase for hardcoded values

---

**Last Updated**: 2025-01-17
**Next Review**: 2025-02-17