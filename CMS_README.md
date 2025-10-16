# AIDI Content Management System
## Complete CMS for Theme, Content, Blog & Jobs

**Version:** 1.0  
**Status:** ✅ Production-Ready  
**Setup Time:** 15 minutes

---

## 🎉 You Now Have a Complete CMS!

Edit your entire site without touching code:

✅ **Theme:** Colors, fonts, typography  
✅ **Content:** Every page, every card, every piece of copy  
✅ **Blog:** Full blogging platform with MDX  
✅ **Jobs:** Job board with application tracking  
✅ **Live Preview:** See changes before publishing

---

## 🚀 Quick Start

### 1. Run Database Migration
```bash
psql $DATABASE_URL -f sql/cms-schema.sql
```

### 2. Add ThemeProvider to Layout
```typescript
// src/app/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3. Access Your CMS
Visit: **`http://localhost:3005/admin/cms`**

---

## 📂 What Was Built

### Database Tables
```sql
site_settings      -- Theme colors, fonts, general settings
cms_pages          -- Page definitions
content_blocks     -- Individual content pieces
blog_posts         -- Blog articles
blog_categories    -- Blog organization
job_postings       -- Job listings
job_categories     -- Job organization
```

### Admin UI Components
```
src/components/admin/
├── ThemeEditor.tsx      -- Visual theme customization
├── ContentEditor.tsx    -- Page content editing
├── BlogManager.tsx      -- Blog post management
└── JobManager.tsx       -- Job board management
```

### API Endpoints
```
/api/cms/theme           -- GET/PUT theme settings
/api/cms/content         -- GET/PUT/POST content blocks
/api/cms/blog            -- GET/POST blog posts
/api/cms/blog/[id]       -- PUT/DELETE specific post
/api/cms/jobs            -- GET/POST job postings
/api/cms/jobs/[id]       -- PUT/DELETE specific job
```

### Public Pages
```
/admin/cms      -- CMS admin dashboard
/blog           -- Public blog listing
/blog/[slug]    -- Individual blog post
/careers        -- Job board listing
/careers/[slug] -- Individual job posting
```

---

## 🎨 Theme Editor Features

### Customizable Elements

**Brand Colors (3):**
- Primary - Main brand color
- Secondary - Highlights and accents
- Accent - Success states

**UI Colors (4):**
- Background - Page background
- Foreground - Main text color
- Muted - Disabled/muted elements
- Border - Border colors

**Semantic Colors (4):**
- Success - Green indicators
- Warning - Orange alerts
- Error - Red errors
- Info - Blue information

**Typography (3):**
- Heading font - All headings (h1-h4)
- Body font - Paragraphs and text
- Monospace - Code blocks

### How It Works
1. Edit colors using color picker or hex input
2. Select fonts from dropdown (13 options)
3. Click "Preview" to see changes live
4. Click "Save" to apply site-wide
5. Changes apply **instantly** (on next page load)

---

## ✏️ Content Editor Features

### How It Works
1. Select page from sidebar (Homepage, About, Pricing, etc.)
2. See all content blocks for that page
3. Click "Edit" on any block
4. Modify content based on type:
   - **Text:** Simple input field
   - **Rich Text:** Textarea with HTML/Markdown
   - **JSON:** JSON editor for structured data
5. Toggle visibility on/off
6. Save changes

### Example: Edit Homepage Headline
```
1. Go to /admin/cms
2. Click "Page Content" → "Homepage"
3. Find "hero_headline" block
4. Click "Edit"
5. Change text to: "The Benchmark Standard for AEO Intelligence"
6. Click "Save"
7. Homepage updates instantly!
```

---

## 📝 Blog Manager Features

### Creating a Post
1. Click "New Post"
2. Fill in title (slug auto-generates)
3. Write content in Markdown:
   ```markdown
   # My Post Title
   
   This is **bold** and this is *italic*.
   
   ## Subheading
   
   - Bullet point 1
   - Bullet point 2
   
   [Link text](https://example.com)
   ```
4. Add cover image URL
5. Select category
6. Add tags (comma-separated)
7. Fill SEO fields
8. Click "Publish" or "Save as Draft"

### Managing Posts
- View all posts with status (published/draft/archived)
- Edit existing posts
- Delete posts
- Track view counts
- Filter by category or status

### Public Display
- Published posts appear at `/blog`
- Individual posts at `/blog/your-post-slug`
- Featured post shown prominently
- Category filtering
- Tag navigation

---

## 💼 Job Board Features

### Creating a Job
1. Click "New Job"
2. Fill in job details:
   - Title: "Senior Data Scientist"
   - Department: "Data Science"
   - Location: "Remote" or "NYC", etc.
   - Type: "Full-time"
   - Experience: "Senior"
   - Salary: "$120k-180k" (optional)
3. Write description (Markdown)
4. Add requirements (one per line):
   ```
   5+ years Python experience
   Strong ML background
   Published research preferred
   ```
5. Add nice-to-haves (optional)
6. Set apply URL or email
7. Click "Publish Job"

### Managing Jobs
- View all jobs with status
- Edit/delete jobs
- Track application counts
- Open/close positions
- Filter by department

### Public Display
- Open jobs appear at `/careers`
- Individual job at `/careers/job-slug`
- Department filtering
- Application buttons (URL or email)

---

## 🔧 Technical Architecture

### Data Flow
```
User edits in CMS 
  ↓
Saves to database (PostgreSQL)
  ↓
API routes serve data
  ↓
Frontend components fetch and render
  ↓
ThemeProvider applies theme CSS
  ↓
Changes visible on site
```

### Theme Application
```
1. ThemeProvider loads on app startup
2. Fetches theme from /api/cms/theme
3. Applies CSS variables to document root
4. All components use these variables
5. Changes persist across sessions
```

### Content Rendering
```
1. Component needs content
2. Fetches from /api/cms/content?page=homepage
3. Retrieves specific block by key
4. Renders content based on type
5. Updates when CMS saves changes
```

---

## 📊 Database Schema Details

### site_settings
Stores theme and configuration:
```sql
key                 | value (JSONB)           | category
--------------------|-------------------------|----------
theme_colors        | {"primary": "#2563EB"} | theme
theme_fonts         | {"heading": "Inter"}   | theme
theme_typography    | {"heading": {...}}     | theme
site_general        | {"site_name": "AIDI"}  | general
```

### cms_pages & content_blocks
Page structure:
```sql
cms_pages:
- id, slug, title, meta_title, status

content_blocks (linked to pages):
- id, page_id, block_key, block_type, content
- Example: page_id="homepage", block_key="hero_headline"
```

### blog_posts
Blog articles:
```sql
- id, slug, title, excerpt, content (Markdown)
- cover_image, category_id, author_id
- status, published_at, featured, tags
- meta_title, meta_description, view_count
```

### job_postings
Job listings:
```sql
- id, slug, title, department, location
- employment_type, experience_level, salary_range
- description, requirements, nice_to_have
- status, apply_url, apply_email, application_count
```

---

## 🎯 Common Workflows

### Workflow 1: Rebrand Colors
```
Time: 5 minutes

1. /admin/cms → Theme Editor
2. Update primary color (e.g., #2563EB → #7C3AED)
3. Update secondary color
4. Click "Preview"
5. Verify colors look good
6. Click "Save Changes"
7. Done! Entire site now uses new brand colors.
```

### Workflow 2: Update Pricing
```
Time: 10 minutes

1. /admin/cms → Page Content → Pricing
2. Find "tier_full_audit_price" block
3. Edit: "$2,500" → "$2,999"
4. Find "tier_full_audit_features" block (JSON)
5. Add new feature to array
6. Save both blocks
7. Done! Pricing page updated.
```

### Workflow 3: Publish Weekly Blog
```
Time: 30 minutes

1. /admin/cms → Blog Posts → New Post
2. Title: "The Science of AEO Benchmarking"
3. Write content in Markdown
4. Add cover image
5. Category: "Methodology"
6. Tags: "aeo, benchmarking, methodology"
7. Fill SEO fields
8. Click "Publish"
9. Done! Live at /blog/science-of-aeo-benchmarking
```

### Workflow 4: Post Job Opening
```
Time: 15 minutes

1. /admin/cms → Job Board → New Job
2. Title: "Senior Data Scientist"
3. Fill in all details
4. Requirements (one per line)
5. Apply email: jobs@aidi.com
6. Click "Publish Job"
7. Done! Live at /careers/senior-data-scientist
```

---

## 🛠️ Customization Guide

### Adding New Pages
```sql
-- Add new page
INSERT INTO cms_pages (slug, title, status, published_at)
VALUES ('new-page', 'New Page Title', 'published', NOW());

-- Add content blocks
INSERT INTO content_blocks (page_id, block_key, block_type, content)
SELECT id, 'headline', 'text', '{"text": "Page Headline"}'::jsonb
FROM cms_pages WHERE slug = 'new-page';
```

### Adding Custom Fonts
```typescript
// In ThemeEditor.tsx, add to commonFonts array:
const commonFonts = [
  ...existing,
  'Your Custom Font',
  'Another Font'
];
```

### Adding Blog Categories
```sql
INSERT INTO blog_categories (slug, name, description, display_order)
VALUES ('new-category', 'Category Name', 'Description', 5);
```

---

## 📚 Full Documentation

**Setup Guide:** `CMS_SETUP_GUIDE.md` (detailed instructions)  
**This README:** Complete reference  
**Code Comments:** Inline documentation in all files

---

## ✅ Success Checklist

After setup, you should be able to:

- [ ] Change site primary color in <2 minutes
- [ ] Update homepage headline without code
- [ ] Publish a blog post in <30 minutes
- [ ] Post a job opening in <15 minutes
- [ ] Preview theme changes before saving
- [ ] See all changes reflected on public site

---

## 🎬 What's Next

### Immediate (This Week)
1. Run database migration
2. Add ThemeProvider to layout
3. Test all CMS features
4. Migrate existing content to CMS
5. Train team on CMS usage

### Short-Term (Next 2 Weeks)
1. Write initial blog posts (3-5)
2. Customize theme colors to match brand
3. Create job postings if hiring
4. Update all page content through CMS

### Long-Term (Next Month)
1. Establish content workflow
2. Regular blog publishing schedule
3. Track metrics (view counts, etc.)
4. Consider Phase 2 enhancements

---

**Access URL:** `/admin/cms`  
**Public Blog:** `/blog`  
**Public Jobs:** `/careers`

**Status:** ✅ COMPLETE AND READY TO USE

**YOU NOW HAVE FULL CONTROL OVER YOUR SITE CONTENT! 🎉**

