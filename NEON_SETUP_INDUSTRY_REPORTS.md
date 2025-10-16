# Neon Database Setup for Industry Reports

## Current Status

✅ **All 8 tables exist** (you've already run the main schema)
❌ **No sectors seeded** (0 rows in industry_sectors)
❌ **No prompts seeded** (0 rows in sector_prompts)

## What You Need to Do

### Step 1: Seed the 10 Industry Sectors (1 minute)

**In Neon SQL Editor**, copy and paste this entire file:
📄 `sql/seed-industry-sectors.sql`

Click **Run**. You should see:
- ✅ 10 rows inserted into `industry_sectors`
- ✅ Final SELECT showing all 10 sectors

### Step 2: Verify Sectors Were Seeded

```sql
SELECT slug, name, active FROM industry_sectors ORDER BY name;
```

**Expected**: 10 rows showing:
1. automotive - Mobility & Automotive
2. cpg - CPG & FMCG
3. dtc - DTC Retail
4. fashion - Fashion & Apparel
5. fintech - Banking & Fintech
6. igaming - iGaming & Online Gambling
7. politics - Politics & Advocacy
8. tech - Consumer Electronics
9. travel - Hospitality & Travel
10. wellness - Health & Wellness

### Step 3: Seed Initial Prompts (Optional - for testing)

**In your terminal:**

```bash
npx tsx scripts/seed-industry-prompts.ts
```

This will seed a few starter prompts for igaming and fashion sectors (just for testing).

**OR** - Skip this for now. You can add prompts later via the admin UI or wait to add the full 200+ prompts.

### Step 4: Verify Everything Works

Visit your deployed site:
- **Landing page**: `https://your-site.netlify.app/reports`
- **Should show**: 10 sector cards
- **Click any sector**: Will show "No published reports available yet" (expected)

## What the Warnings Mean

The yellow warnings you saw:
```
Relation "probe_schedules" already exists, skipping
Relation "report_access_logs" already exists, skipping
Relation "report_subscriptions" already exists, skipping
...etc
```

✅ **This is GOOD!** It means the tables already exist from a previous run. The `IF NOT EXISTS` clauses prevent duplicates.

The only issue was the **INSERT for sectors** didn't run, which is why you got 0 rows.

## Quick Fix - Just Run This

**Copy and paste into Neon SQL Editor:**

```sql
-- Insert the 10 sectors
INSERT INTO industry_sectors (slug, name, description, target_audience, active) VALUES
('igaming', 'iGaming & Online Gambling', 'Online casinos, sports betting, poker, and gaming platforms', 'Casino Operators, Platform Managers', true),
('fashion', 'Fashion & Apparel', 'Clothing brands, footwear, accessories, and fashion retail', 'Brand Managers, CMOs, Retail Executives', true),
('politics', 'Politics & Advocacy', 'Political campaigns, advocacy groups, think tanks, and policy organizations', 'Campaign Managers, Communications Directors', true),
('cpg', 'CPG & FMCG', 'Consumer packaged goods, food & beverage, household products', 'Brand Managers, Marketing VPs', true),
('dtc', 'DTC Retail', 'Direct-to-consumer brands and e-commerce', 'Founders, Growth Leads, CMOs', true),
('fintech', 'Banking & Fintech', 'Digital banks, payment platforms, lending, investing apps', 'Product Managers, Marketing Heads', true),
('wellness', 'Health & Wellness', 'Fitness, nutrition, mental health, supplements, wellness apps', 'Brand Managers, Growth Marketers', true),
('automotive', 'Mobility & Automotive', 'Auto brands, EV manufacturers, ride-sharing, micro-mobility', 'Marketing Directors, Brand Strategists', true),
('tech', 'Consumer Electronics', 'Smartphones, laptops, wearables, smart home devices', 'Product Marketing, Brand Managers', true),
('travel', 'Hospitality & Travel', 'Hotels, airlines, booking platforms, travel experiences', 'Marketing Executives, Revenue Managers', true)
ON CONFLICT (slug) DO NOTHING;

-- Verify
SELECT slug, name, active FROM industry_sectors ORDER BY name;
```

**Expected result**: Should show 10 rows.

## After Seeding

Once you run the above INSERT:
- ✅ Visit `/reports` - you'll see 10 beautiful sector cards
- ✅ Click any sector - will show "No reports yet" (expected - no probes run)
- ✅ Visit `/admin/industry-reports` - shows all 10 sectors ready to probe

Then you're ready to:
1. Review the UX and copy
2. Run your first test probe
3. Generate a sample report

---

**TL;DR**: Just copy/paste the INSERT statement above into Neon SQL Editor and click Run. That's all you need! 🚀

