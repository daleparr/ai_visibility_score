# Industry Reports - Quick Start Guide

## 🚀 Get Running in 30 Minutes

This guide will get you from zero to your first generated report.

## Prerequisites

✅ Node.js 18+ installed  
✅ PostgreSQL database  
✅ OpenAI API key  
✅ Anthropic API key  

## Step 1: Database Setup (5 minutes)

```bash
# Run the schema migration
psql $DATABASE_URL -f sql/industry-reports-schema.sql

# Verify tables created
psql $DATABASE_URL -c "\dt" | grep industry
```

You should see:
- industry_sectors
- sector_prompts  
- probe_results
- brand_performance
- industry_reports
- report_subscriptions
- probe_schedules
- report_access_logs

## Step 2: Environment Variables (2 minutes)

Add to your `.env.local`:

```bash
# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Admin Access
ADMIN_EMAILS=your@email.com

# Already have these
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
```

## Step 3: Install Dependencies (3 minutes)

```bash
npm install
```

The required packages are already in `package.json`:
- `openai` - For GPT-4 access
- `@anthropic-ai/sdk` - For Claude access
- `stripe` - For subscriptions

## Step 4: Seed Prompts (5 minutes)

Create a seed script `scripts/seed-prompts.ts`:

```typescript
import { industryReportsDB } from '../src/lib/industry-reports/db';
import { PROMPT_LIBRARY } from '../src/lib/industry-reports/prompts';

async function main() {
  console.log('Seeding prompts...');
  
  // Seed prompts for each sector
  for (const [sectorSlug, prompts] of Object.entries(PROMPT_LIBRARY)) {
    const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
    
    if (!sector) {
      console.log(`Sector ${sectorSlug} not found, skipping`);
      continue;
    }
    
    const promptsToCreate = prompts.map(p => ({
      ...p,
      sectorId: sector.id,
    }));
    
    const count = await industryReportsDB.bulkCreatePrompts(promptsToCreate);
    console.log(`✓ Seeded ${count} prompts for ${sectorSlug}`);
  }
  
  console.log('Done!');
}

main();
```

Run it:

```bash
npx tsx scripts/seed-prompts.ts
```

## Step 5: Start Dev Server (1 minute)

```bash
npm run dev
```

Visit: http://localhost:3000/reports

## Step 6: Run Your First Probe (10 minutes)

Open a new terminal and trigger a test probe:

```bash
curl -X POST http://localhost:3000/api/industry-reports/probe/run \
  -H "Content-Type: application/json" \
  -d '{"sectorSlug": "fashion"}'
```

This will:
1. Load 30 fashion prompts ✅
2. Query GPT-4 and Claude (Gemini/Perplexity are optional) ✅
3. Extract brand mentions ✅
4. Analyze sentiment ✅
5. Generate insights ✅
6. Create a draft report ✅

**Expected time**: 5-10 minutes (300 API calls)  
**Expected cost**: ~$2-3 in API credits

## Step 7: View Your Report (2 minutes)

1. Go to http://localhost:3000/admin/industry-reports
2. You'll see the fashion sector with a "Draft" report
3. Click "Manage" to review
4. Click "Publish" to make it live
5. Visit http://localhost:3000/reports/fashion

🎉 **You just created your first industry report!**

## Step 8: Test Subscription Flow (5 minutes)

1. Go to http://localhost:3000/reports/fashion
2. You'll see limited data (Free tier)
3. Click "Upgrade to Pro"
4. Enter test Stripe card: `4242 4242 4242 4242`
5. Complete checkout
6. You'll be redirected back with full access

## What's Next?

### Immediate Actions
- [ ] Run probes for 2-3 more sectors
- [ ] Review and publish those reports
- [ ] Test the subscription flow end-to-end
- [ ] Customize branding and copy

### Before Production
- [ ] Set up Stripe production account
- [ ] Configure Netlify scheduled function
- [ ] Add real admin emails
- [ ] Set up monitoring alerts
- [ ] Create help documentation

### Marketing Launch
- [ ] Create landing page copy
- [ ] Prepare sample reports for press
- [ ] Write launch blog post
- [ ] Set up email automation
- [ ] Plan social media campaign

## Troubleshooting

### "Sector not found"
Check that the database schema was applied correctly:
```sql
SELECT * FROM industry_sectors;
```

### "No active prompts"
Make sure you ran the seed script:
```sql
SELECT sector_id, COUNT(*) FROM sector_prompts GROUP BY sector_id;
```

### API errors
Verify your API keys are correct:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Probe timeout
Reduce the batch size in `probe-engine.ts`:
```typescript
const batchSize = 3; // Instead of 5
```

## File Structure Overview

```
src/lib/industry-reports/
├── types.ts              # TypeScript definitions
├── sectors.ts            # Sector configurations
├── prompts.ts            # 200+ prompt templates
├── probe-engine.ts       # LLM orchestration
├── analyzer.ts           # Analytics engine
├── db.ts                 # Database layer
└── scheduler.ts          # Automation

src/app/
├── reports/
│   ├── page.tsx          # Landing page
│   └── [sector]/         # Sector pages
├── admin/
│   └── industry-reports/ # Admin UI
└── api/
    └── industry-reports/ # API routes

sql/
└── industry-reports-schema.sql  # Database schema

netlify/functions/
└── monthly-reports.ts    # Scheduled function
```

## Key Concepts

### Sectors
10 industry verticals (fashion, igaming, fintech, etc.)

### Prompts
Unbiased questions that test how LLMs recommend brands

### Probes
Running prompts across multiple models to gather data

### Brand Performance
Aggregated metrics: mention share, sentiment, rank

### Reports
Monthly publications with leaderboards and insights

### Subscriptions
Free/Pro/Enterprise tiers with different access levels

## Cost Calculator

Per sector, per month:
- 25 prompts × 4 models × 3 runs = 300 API calls
- Average tokens: 500 input + 800 output = 1,300 per call
- Total: ~390,000 tokens
- GPT-4: ~$3
- Claude: ~$2
- **Total: ~$5-10 per sector/month**

At scale (10 sectors): $50-100/month in API costs

## Performance Tips

### Faster Probe Runs
1. Reduce `runNumber` from 3 to 2 (less statistical rigor)
2. Use fewer models (just GPT-4 + Claude)
3. Increase batch size (but watch rate limits)
4. Run probes in parallel for multiple sectors

### Lower Costs
1. Use GPT-4-mini instead of GPT-4-turbo
2. Reduce prompt count (20 instead of 30)
3. Cache results aggressively
4. Use model-specific optimizations

### Better Quality
1. Add more prompts per sector
2. Include domain experts in prompt review
3. Implement human-in-the-loop validation
4. Build feedback mechanisms

## Success Metrics

### First Week
- [ ] 3 sectors with published reports
- [ ] 10 free tier signups
- [ ] 1-2 paid subscribers
- [ ] $100-200 in MRR

### First Month
- [ ] All 10 sectors live
- [ ] 100 free signups
- [ ] 10 paid subscribers
- [ ] $1,000 MRR

### First Quarter
- [ ] 500 free users
- [ ] 50 paid subscribers
- [ ] 5 enterprise clients
- [ ] $5,000+ MRR

## Getting Help

1. **Technical Issues**: Review code comments and types
2. **Database Questions**: Check `db.ts` methods
3. **API Issues**: Review route handlers in `src/app/api/`
4. **Deployment**: See `INDUSTRY_REPORTS_DEPLOYMENT_GUIDE.md`
5. **Business Questions**: See `INDUSTRY_REPORTS_EXECUTIVE_SUMMARY.md`

## Ready to Launch?

✅ **You have everything you need to launch this feature.**

The system is production-ready. Just follow the deployment guide, set up your scheduled functions, and start generating reports.

**Good luck! 🚀**

