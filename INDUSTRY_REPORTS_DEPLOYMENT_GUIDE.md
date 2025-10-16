# Industry Reports - Deployment Guide

## Overview

This guide covers deploying the monthly AI brand visibility report system to production.

## Prerequisites

- PostgreSQL database with industry reports schema deployed
- OpenAI API key
- Anthropic API key
- Stripe account (for subscriptions)
- Admin emails configured
- Netlify or Vercel deployment

## Step 1: Database Setup

Run the schema migration:

```bash
psql $DATABASE_URL -f sql/industry-reports-schema.sql
```

This will create:
- `industry_sectors` - Sector definitions
- `sector_prompts` - Prompt templates
- `probe_results` - Raw LLM responses
- `brand_performance` - Aggregated metrics
- `industry_reports` - Published reports
- `report_subscriptions` - User subscriptions
- `probe_schedules` - Automation schedules

And seed 10 initial sectors (iGaming, Fashion, CPG, DTC, Fintech, Wellness, Automotive, Tech, Travel, Politics).

## Step 2: Seed Prompts

Use the admin UI or run a seeding script:

```typescript
import { industryReportsDB } from '@/lib/industry-reports/db';
import { PROMPT_LIBRARY } from '@/lib/industry-reports/prompts';

async function seedPrompts() {
  for (const [sectorSlug, prompts] of Object.entries(PROMPT_LIBRARY)) {
    const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
    if (sector) {
      const promptsToCreate = prompts.map(p => ({ ...p, sectorId: sector.id }));
      await industryReportsDB.bulkCreatePrompts(promptsToCreate);
      console.log(`Seeded ${prompts.length} prompts for ${sectorSlug}`);
    }
  }
}
```

## Step 3: Environment Variables

Add to `.env` and your deployment platform:

```bash
# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=... # Optional
PERPLEXITY_API_KEY=... # Optional

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin Access
ADMIN_EMAILS=admin@yourdomain.com,other@yourdomain.com

# Database
DATABASE_URL=postgresql://...
```

## Step 4: Configure Scheduled Function

### Netlify

Add to `netlify.toml`:

```toml
[build]
  functions = "netlify/functions"

[[functions]]
  name = "monthly-reports"
  schedule = "0 2 1 * *"  # 2 AM UTC on 1st of each month
```

### Vercel

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/industry-reports/cron/monthly",
      "schedule": "0 2 1 * *"
    }
  ]
}
```

Then create `/api/industry-reports/cron/monthly/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { scheduledMonthlyProbes } from '@/lib/industry-reports/scheduler';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const results = await scheduledMonthlyProbes();
  return NextResponse.json(results);
}
```

## Step 5: Test Probe Run

Manually trigger a probe for one sector:

```bash
curl -X POST https://yourdomain.com/api/industry-reports/probe/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"sectorSlug": "igaming"}'
```

This will:
1. Load prompts for the sector
2. Query 4 LLM models × 3 runs each
3. Extract brand mentions and sentiment
4. Generate analytics and insights
5. Create a draft report
6. Save brand performance data

## Step 6: Review and Publish Reports

1. Go to `/admin/industry-reports`
2. Review the draft report
3. Make any editorial adjustments
4. Click "Publish" to make it live

## Step 7: Set Up Stripe Webhook

1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Step 8: Create Webhook Handler

```typescript
// /api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { industryReportsDB } from '@/lib/industry-reports/db';
import { SUBSCRIPTION_TIERS } from '@/lib/industry-reports/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
      
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
      
    case 'customer.subscription.deleted':
      const deletedSub = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(deletedSub);
      break;
  }
  
  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, sectorId, tier } = session.metadata!;
  const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  
  await industryReportsDB.createSubscription({
    userId,
    sectorId,
    tier: tier as 'free' | 'pro' | 'enterprise',
    status: 'active',
    canViewFullReports: tier !== 'free',
    canDownloadPdfs: tier !== 'free',
    canAccessArchive: tier !== 'free',
    archiveMonthsLimit: tier === 'pro' ? 12 : tier === 'enterprise' ? 36 : 1,
    canRequestCustomPrompts: tier === 'enterprise',
    apiAccessEnabled: tier === 'enterprise',
    priceMonthly: tierConfig.price,
    currency: 'USD',
    billingInterval: 'monthly',
    stripeSubscriptionId: session.subscription as string,
    stripeCustomerId: session.customer as string,
    startedAt: new Date(),
  });
}
```

## Step 9: Monitor Costs

Track LLM API usage:

```typescript
import { calculateProbeCost } from '@/lib/industry-reports/probe-engine';

// After running probes
const cost = calculateProbeCost(probeResults);
console.log(`Probe cost: $${cost.totalCost.toFixed(2)}`);
console.log('Breakdown:', cost.breakdown);
```

Expected monthly costs per sector:
- 25 prompts × 4 models × 3 runs = 300 API calls
- ~$5-10 per sector per month
- Total for 10 sectors: ~$50-100/month

## Step 10: Launch Marketing

1. Create landing page at `/reports`
2. Announce on social media
3. Email existing users about new feature
4. Offer "Founding Member" discount for first 50 subscribers
5. Write blog post about methodology
6. Reach out to industry publications

## Monitoring & Maintenance

### Daily Checks
- Monitor probe success rate
- Check error logs
- Review API costs

### Weekly Tasks
- Review draft reports
- Publish reports
- Respond to custom prompt requests (Enterprise)

### Monthly Tasks
- Analyze subscriber metrics
- Review churn and conversions
- Update prompts based on feedback
- Add new sectors if demand exists

## Scaling Considerations

### Short Term (0-100 subscribers)
- Current architecture handles fine
- Manual report review is manageable

### Medium Term (100-500 subscribers)
- Add caching for popular reports
- Implement CDN for PDF downloads
- Automate more editorial tasks

### Long Term (500+ subscribers)
- Consider dedicated workers for probes
- Add data warehouse for historical analysis
- Build self-service custom reports tool

## Troubleshooting

### Probe Failures
- Check API keys are valid
- Verify rate limits not exceeded
- Review probe logs in admin dashboard

### Missing Brands
- Review prompt quality
- Check brand extraction logic
- Add manual brand aliases if needed

### Low Conversion Rates
- A/B test pricing
- Improve sample reports
- Add more social proof
- Enhance value proposition

## Success Metrics

### Month 1 Goals
- [ ] 50+ free signups
- [ ] 5+ paid subscribers
- [ ] $500 MRR

### Month 3 Goals
- [ ] 200+ free signups
- [ ] 20+ paid subscribers
- [ ] $2,000 MRR

### Month 6 Goals
- [ ] 500+ free signups
- [ ] 50+ paid subscribers
- [ ] $5,000 MRR

## Support & Contact

For questions or issues:
- Email: support@yourdomain.com
- Slack: #industry-reports
- Documentation: https://docs.yourdomain.com/industry-reports

---

**Status**: Ready for production deployment
**Last Updated**: {Date}

