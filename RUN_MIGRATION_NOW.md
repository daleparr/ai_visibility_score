# Run CMS Migration - Step-by-Step Guide
## Follow These Exact Steps

**Time Required:** 15 minutes  
**Difficulty:** Easy (copy/paste)

---

## STEP 1: Get Your Database URL (2 minutes)

### Option A: Via Netlify Dashboard
1. Go to: https://app.netlify.com
2. Select your site: **ai-discoverability-index**
3. Click **Site settings**
4. Click **Environment variables**
5. Find **NETLIFY_DATABASE_URL_UNPOOLED** or **DATABASE_URL**
6. Click **Options** → **Reveal value**
7. Copy the entire value (starts with `postgres://`)

### Option B: Via Neon Console (Easier!)
1. Go to: https://console.neon.tech
2. Select your project
3. Click **Connection Details**
4. Copy the connection string

---

## STEP 2: Run the Migration (5 minutes)

### Method A: Neon SQL Editor (EASIEST - Recommended!)

1. **Go to Neon Console:**
   - Visit: https://console.neon.tech
   - Select your project
   - Click **SQL Editor** in the left sidebar

2. **Open Migration File:**
   - On your computer, open: `sql/cms-content-authoritative-tone-migration.sql`
   - Select ALL content (Ctrl+A or Cmd+A)
   - Copy (Ctrl+C or Cmd+C)

3. **Paste and Run:**
   - In Neon SQL Editor, paste the SQL
   - Click **Run** button (or press Ctrl+Enter)
   - Wait for execution (~10-30 seconds)

4. **Verify Success:**
   - You should see: "✅ CMS Content Migration Complete!"
   - Or green checkmarks indicating successful execution

### Method B: Command Line (If you prefer terminal)

```bash
# Set the database URL (replace with your actual URL)
$env:DATABASE_URL="postgres://your-connection-string-here"

# Run migration
psql $env:DATABASE_URL -f sql/cms-content-authoritative-tone-migration.sql

# Verify
psql $env:DATABASE_URL -c "SELECT slug, COUNT(*) as blocks FROM cms_pages p LEFT JOIN content_blocks cb ON cb.page_id = p.id GROUP BY slug ORDER BY slug;"
```

---

## STEP 3: Verify Migration Worked (3 minutes)

### Run This Query in Neon SQL Editor:

```sql
-- Check pages created
SELECT slug, title, status FROM cms_pages ORDER BY slug;
```

**Expected Results:**
```
slug                      | title                              | status
--------------------------|------------------------------------|----------
aidi-vs-monitoring-tools  | AIDI vs. Monitoring Tools         | published
faq                       | Frequently Asked Questions        | published
homepage                  | Homepage                          | published
methodology               | AIDI Methodology: Peer-Reviewed   | published
reports-landing           | Industry Reports                  | published
```

### Check Content Blocks:

```sql
-- Count blocks per page
SELECT 
  p.slug,
  COUNT(cb.id) as block_count
FROM cms_pages p
LEFT JOIN content_blocks cb ON cb.page_id = p.id
GROUP BY p.slug
ORDER BY p.slug;
```

**Expected Results:**
```
slug                      | block_count
--------------------------|------------
aidi-vs-monitoring-tools  | 2-3
faq                       | 2
homepage                  | 15
methodology               | 3-5
reports-landing           | 4
```

✅ **If you see these results, migration was successful!**

---

## STEP 4: Test CMS Admin (5 minutes)

1. **Access CMS:**
   - Local: http://localhost:3005/admin/cms
   - Production: https://ai-discoverability-index.netlify.app/admin/cms

2. **Browse Content:**
   - Click **Page Content** in sidebar
   - Click **Homepage**
   - You should see blocks: hero_headline, hero_subhead, etc.

3. **Test Editing:**
   - Click **Edit** on "hero_headline"
   - Change text to: "TEST - Migration Successful"
   - Click **Save**
   - Verify it saved

4. **Revert Test:**
   - Edit again
   - Change back to: "The Benchmark Standard for AEO Intelligence"
   - Save

✅ **If you can edit and save, CMS is working!**

---

## ✅ Success Criteria

You've succeeded if:
- [ ] SQL migration ran without errors
- [ ] 5 pages exist in cms_pages table
- [ ] ~30 content blocks exist in content_blocks table
- [ ] CMS admin shows all pages
- [ ] You can edit and save a block

---

## 🚨 If Something Goes Wrong

### Error: "Syntax error near line X"
**Fix:** Copy the SQL file again carefully (might have copy/paste issue)

### Error: "Table does not exist"
**Fix:** Run `sql/cms-schema.sql` first (creates tables)

### Error: "Cannot connect to database"
**Fix:** Verify DATABASE_URL is correct

### CMS Admin Shows No Pages
**Fix:** Migration didn't run successfully - check SQL output for errors

---

## Next Steps After Migration

Once migration is successful:
1. ✅ I'll update the homepage to fetch from CMS
2. ✅ I'll build and test locally
3. ✅ We'll deploy to production
4. ✅ You'll have fully functional CMS with authoritative copy

---

**Ready? Follow the steps above and let me know when complete!**

Say "migration complete" when you're done and I'll proceed to the next steps.


