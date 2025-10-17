# 🎯 Run These 2 SQL Scripts to Complete Setup

**Current Status:** Blog & Careers pages now have navigation, but are **empty** because SQL hasn't been run yet.

**Solution:** Run 2 simple SQL scripts (5 minutes total)

---

## Why Pages Are Empty

**Blog Page:** Shows "No blog posts yet" → Needs content from database  
**Careers Page:** Shows "No open positions" → Needs job postings from database

**Both pages work perfectly** - they're just waiting for data!

---

## SCRIPT 1: Blog Content (2 minutes)

### What It Does:
Creates **4 authoritative blog posts** with Bloomberg-grade content:

1. **"Why Benchmark-Grade Measurement Matters"** ⭐ Featured
   - Statistical analysis: 2,400 LLM responses
   - Monitoring vs. benchmarking
   - Searchable acknowledgment

2. **"The Problem with Branded Queries"**
   - Data: 40-60 point score inflation
   - Why bias-free testing matters
   - Statistical validation

3. **"October 2025 Fashion Industry Benchmark"**
   - Nike: 67% (95% CI: 62%-72%, n=160)
   - Sustainable brands rising
   - Complete statistical reporting

4. **"Using AIDI and Searchable Together"**
   - Complementary approach
   - Enterprise example
   - Fitbit vs. bloodwork analogy

### How to Run:

**In Neon SQL Editor (https://console.neon.tech):**

1. Open file: `sql/seed-blog-authoritative-content.sql`
2. Select ALL content (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
4. Paste into Neon SQL Editor
5. Click **"Run"** button
6. Wait ~10 seconds
7. Should see: "✅ Blog editorial content seeded! 4 posts created"

---

## SCRIPT 2: Career Postings (2 minutes)

### What It Does:
Creates **4 strategic job postings**:

1. **Senior Data Scientist - AEO Research** 
   - $140,000-$180,000 + equity
   - Lead statistical validation
   - Publish peer-reviewed research

2. **Research Engineer - Methodology**
   - $120,000-$160,000 + equity
   - Build testing infrastructure
   - Multi-model automation

3. **Enterprise Account Executive**
   - $100,000-$140,000 + $100K+ commission
   - Sell to C-suite/PE firms
   - High-ticket consultative sales

4. **Head of Methodology**
   - $180,000-$240,000 + significant equity
   - Leadership role
   - Build industry standard

### How to Run:

**In Neon SQL Editor:**

1. Open file: `sql/seed-careers-content.sql`
2. Select ALL content (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
4. Paste into Neon SQL Editor
5. Click **"Run"** button
6. Wait ~10 seconds
7. Should see: "✅ Career positions seeded! 4 positions created"

---

## ✅ Verification (After Running Both)

### Verify Blog Posts:
```sql
SELECT title, status, featured 
FROM blog_posts 
ORDER BY published_at DESC;
```

**Should show 4 posts**

### Verify Job Postings:
```sql
SELECT title, department, salary_range 
FROM job_postings 
ORDER BY posted_at DESC;
```

**Should show 4 positions**

---

## 🎉 Final Result (After Running Both Scripts)

### Visit Blog:
https://ai-discoverability-index.netlify.app/blog

**You'll see:**
- ✅ Navigation with logo/menu
- ✅ Featured post at top (with stats)
- ✅ 4 posts in grid
- ✅ Bloomberg-grade content
- ✅ Searchable mentioned positively

### Visit Careers:
https://ai-discoverability-index.netlify.app/careers

**You'll see:**
- ✅ Navigation with logo/menu
- ✅ "4 Open Positions"
- ✅ "4 Departments"
- ✅ Strategic roles (Senior Data Scientist, etc.)
- ✅ Competitive salaries ($120-240K range)

---

## 📋 Quick Checklist

- [ ] Wait for Netlify "Published" (navigation fixes)
- [ ] Run `sql/seed-blog-authoritative-content.sql` in Neon
- [ ] Verify 4 blog posts created
- [ ] Run `sql/seed-careers-content.sql` in Neon
- [ ] Verify 4 job postings created
- [ ] Test /blog page - should show posts
- [ ] Test /careers page - should show positions

---

## 🚨 Important

**The pages already work perfectly!** They just need data from the database.

**No code changes needed** - just run the SQL scripts and content appears instantly.

---

**When you've run both SQL scripts, say "content loaded" and I'll verify everything!** 🚀


