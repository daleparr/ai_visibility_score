# ✅ Blog & Careers: Proper CMS Integration

**Correct Approach:** All content in `content_blocks` table, editable via `/admin/cms`

**Not:** Direct SQL inserts into blog_posts/job_postings tables

---

## What Needs to Happen

### 1. Run CMS Content Blocks SQL (5 minutes)

**File:** `sql/cms-blog-and-careers-content-blocks.sql`

**This creates:**
- Blog page in CMS with content_blocks
- Careers page in CMS with content_blocks
- All blog posts as JSON content blocks
- All job postings as JSON content blocks

**Editable via:** `/admin/cms` → Page Content → Blog or Careers

---

### 2. Update Frontend to Fetch from CMS (I'll do this)

**Blog page** needs to:
- Fetch `blog_posts` content block from CMS
- Render posts from JSON
- Not fetch from blog_posts table

**Careers page** needs to:
- Fetch `job_postings` content block from CMS
- Render positions from JSON
- Not fetch from job_postings table

---

## Run This SQL First

**In Neon SQL Editor:**

1. Open: `sql/cms-blog-and-careers-content-blocks.sql`
2. Copy ALL
3. Paste into SQL Editor
4. Click "Run"
5. Verify: blog and careers pages created with content blocks

**Then say "CMS blocks created"** and I'll update the frontend to fetch from CMS!


