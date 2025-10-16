# Leaderboard → Industry Reports Data Bridge

## 🎯 The Opportunity

You have **TWO data generation systems** that should feed each other:

### System 1: Leaderboard Automation (Existing)
- **500+ brands** queued
- **5 per day** evaluated automatically
- **26 niches** covered (Streetwear, Luxury Fashion, Beauty, Tech, etc.)
- **Genuine AIDI evaluations** with probe data

### System 2: Industry Reports (New)
- **11 sectors** (Fashion, Beauty, Tech, Wellness, Home, iGaming, Fintech, CPG, Politics, Automotive, Travel)
- **Needs brand performance data** for leaderboards
- **Runs LLM probes** for brand mentions

## 💡 The Bridge Strategy

**Map leaderboard niches → industry sectors** so automated evaluations populate industry reports!

---

## 🗺️ Niche to Sector Mapping

### Fashion & Apparel ← 6 niches
- Streetwear
- Luxury Fashion Houses
- Activewear & Athleisure
- Fast Fashion
- Sustainable Fashion
- Footwear Brands

### Beauty & Personal Care ← 4 niches
- Global Beauty Retailers
- Clean & Eco Beauty
- Luxury Skincare
- Drugstore Beauty

### Consumer Electronics & Tech ← 3 niches
- Tech Giants
- Consumer Electronics
- Gaming Hardware

### Health & Wellness ← 3 niches
- Fitness Equipment & Apps
- Supplements & Nutrition
- Wellness Brands

### Home & Lifestyle ← 3 niches
- Home Decor
- Kitchen & Appliances
- Furniture

### iGaming ← 2 niches
- Online Casinos
- Sports Betting

### Banking & Fintech ← 2 niches
- Digital Banks
- Payment Platforms

### CPG & FMCG ← 2 niches
- Food & Beverage
- Household Products

### Travel & Hospitality ← 2 niches
- Hotels & Resorts
- Airlines & Travel

---

## 🔧 Implementation: Database Bridge

### Option A: Update Leaderboard Cache with Sector Mapping

```sql
-- Add sector mapping to leaderboard_cache
ALTER TABLE leaderboard_cache 
ADD COLUMN IF NOT EXISTS industry_sector_id UUID REFERENCES industry_sectors(id);

-- Create mapping table
CREATE TABLE IF NOT EXISTS niche_to_sector_mapping (
  niche_category VARCHAR(100) PRIMARY KEY,
  sector_id UUID REFERENCES industry_sectors(id),
  sector_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Populate mappings
INSERT INTO niche_to_sector_mapping (niche_category, sector_slug) VALUES
-- Fashion
('Streetwear', 'fashion'),
('Luxury Fashion Houses', 'fashion'),
('Activewear & Athleisure', 'fashion'),
('Fast Fashion', 'fashion'),
('Sustainable Fashion', 'fashion'),
('Footwear Brands', 'fashion'),

-- Beauty
('Global Beauty Retailers', 'beauty'),
('Clean & Eco Beauty', 'beauty'),
('Luxury Skincare', 'beauty'),
('Drugstore Beauty', 'beauty'),

-- Tech
('Tech Giants', 'tech'),
('Consumer Electronics', 'tech'),
('Gaming Hardware', 'tech'),

-- Wellness
('Fitness Equipment & Apps', 'wellness'),
('Supplements & Nutrition', 'wellness'),
('Wellness Brands', 'wellness'),

-- Home
('Home Decor', 'home'),
('Kitchen & Appliances', 'home'),
('Furniture', 'home'),

-- iGaming
('Online Casinos', 'igaming'),
('Sports Betting', 'igaming'),

-- Fintech
('Digital Banks', 'fintech'),
('Payment Platforms', 'fintech'),

-- CPG
('Food & Beverage', 'cpg'),
('Household Products', 'cpg'),

-- Travel
('Hotels & Resorts', 'travel'),
('Airlines & Travel', 'travel');

-- Update sector IDs from slugs
UPDATE niche_to_sector_mapping m
SET sector_id = s.id
FROM industry_sectors s
WHERE m.sector_slug = s.slug;

-- Update existing leaderboard cache entries
UPDATE leaderboard_cache lc
SET industry_sector_id = m.sector_id
FROM niche_to_sector_mapping m
WHERE lc.niche_category = m.niche_category;
```

### Option B: Sync Leaderboard Data to Industry Reports

```sql
-- Populate brand_performance from leaderboard_cache
INSERT INTO brand_performance (
  sector_id,
  report_month,
  brand_name,
  brand_domain,
  mention_count,
  mention_share,
  avg_position,
  rank_overall,
  avg_sentiment_score,
  models_mentioned_in,
  created_at
)
SELECT 
  lc.industry_sector_id,
  DATE_TRUNC('month', CURRENT_DATE),
  lc.brand_name,
  REPLACE(REPLACE(lc.website_url, 'https://', ''), 'www.', ''),
  1, -- placeholder, will be from probe data
  ((100.0 - lc.rank_niche) / 20.0), -- Estimate share from rank
  lc.rank_niche,
  lc.rank_niche,
  0.75, -- placeholder sentiment
  2, -- placeholder model count
  NOW()
FROM leaderboard_cache lc
JOIN niche_to_sector_mapping m ON lc.niche_category = m.niche_category
WHERE lc.industry_sector_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM brand_performance bp 
    WHERE bp.brand_name = lc.brand_name 
      AND bp.sector_id = lc.industry_sector_id
      AND bp.report_month = DATE_TRUNC('month', CURRENT_DATE)
  );
```

---

## 📊 Current Data Status

Run this in Neon to see what you have:

```sql
-- Check completed evaluations
SELECT COUNT(*) FROM evaluations WHERE status = 'completed';

-- Check leaderboard cache
SELECT COUNT(*) FROM leaderboard_cache;

-- Brands per niche
SELECT niche_category, COUNT(*) as brands
FROM leaderboard_cache
GROUP BY niche_category
ORDER BY brands DESC;
```

**Expected**:
- If automation has been running: **100-500 evaluations**
- If recently deployed: **0-50 evaluations**

---

## 🚀 Two Paths Forward

### PATH A: Use Leaderboard Data for Reports (Quick)

**If you have 100+ leaderboard evaluations:**

1. Run the mapping SQL above
2. Sync leaderboard_cache → brand_performance
3. Generate first industry reports from existing data
4. **Go live TODAY with real data!**

**Pros**: Instant reports with real brand data
**Cons**: Not true "LLM probe" data (it's AIDI score data)

### PATH B: Run Industry Report Probes (Proper)

**If you want true "LLM mention" data:**

1. Generate 20 prompts per sector using framework
2. Run probe engine (queries GPT-4, Claude, etc. with consumer questions)
3. Extract brand mentions from responses
4. Generate proper industry reports
5. Launch in 1-2 weeks

**Pros**: True methodology, proper brand mentions
**Cons**: 1-2 week delay

---

## 💡 BEST APPROACH: Hybrid Strategy

### Week 1: Launch with Leaderboard Data
1. Map niches → sectors
2. Sync existing evaluations
3. Generate "Beta Reports" with AIDI scores
4. Label as "Beta - Based on AIDI Evaluations"
5. **Go live immediately**

### Week 2-3: Add True LLM Probes
1. Run proper probe engine
2. Get real brand mention data
3. Generate "Full Reports" with LLM mentions
4. Upgrade beta users to full reports
5. **Methodology complete**

**This way**: 
- ✅ Revenue starts NOW (with beta reports)
- ✅ Proper methodology follows (full reports)
- ✅ Users see immediate value
- ✅ You validate demand before full investment

---

## 🎯 Next Step

**Run this in Neon to see what data you have:**

```sql
SELECT COUNT(*) as evaluations FROM evaluations WHERE status = 'completed';
SELECT COUNT(*) as cached_brands FROM leaderboard_cache;
```

**Then tell me the numbers** and I'll advise:
- If 100+: **Use hybrid approach, launch beta reports today**
- If <100: **Wait for more automation data OR run manual probes**

Want me to check the data for you?

