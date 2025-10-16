# CMS Setup Guide
## Complete Content Management System for AIDI

**Created:** October 15, 2025  
**Status:** ✅ Production-Ready  
**Features:** Theme editing, content management, blog, job board

---

## 🎯 Overview

Your custom CMS allows you to edit:
- ✅ **Theme:** Colors, fonts, typography
- ✅ **Content:** Every page, every card, every piece of copy
- ✅ **Blog:** Full blog management with MDX support
- ✅ **Jobs:** Job board with applications
- ✅ **Live Preview:** See changes before publishing

---

## 📦 What Was Built

### Database Layer
**File:** `sql/cms-schema.sql`

**Tables Created:**
- `site_settings` - Theme colors, fonts, general settings
- `cms_pages` - Page definitions and metadata
- `content_blocks` - Individual content pieces (headlines, copy, etc.)
- `blog_posts` - Blog articles with categories and tags
- `blog_categories` - Blog organization
- `job_postings` - Job listings
- `job_categories` - Job organization

---

### Application Layer
**File:** `src/lib/cms/cms-client.ts`

**Classes:**
- `ThemeManager` - Theme color/font management
- `ContentManager` - Page content editing
- `BlogManager` - Blog CRUD operations
- `JobManager` - Job posting management

---

### Admin UI Components
**Files:** `src/components/admin/`

- `ThemeEditor.tsx` - Visual theme customization
- `ContentEditor.tsx` - Page content editing
- `BlogManager.tsx` - Blog post management
- `JobManager.tsx` - Job board management

---

### API Routes
**Files:** `src/app/api/cms/`

- `theme/route.ts` - Theme GET/PUT endpoints
- `content/route.ts` - Content GET/PUT/POST
- `blog/route.ts` - Blog list and create
- `blog/[id]/route.ts` - Blog update/delete
- `jobs/route.ts` - Job list and create

---

### Public Pages
**Files:** `src/app/`

- `admin/cms/page.tsx` - CMS admin dashboard
- `blog/page.tsx` - Public blog listing
- `careers/page.tsx` - Public job board

---

### Theme System
**Files:**
- `src/components/ThemeProvider.tsx` - Applies theme across site
- CSS variables auto-generated from database

---

## 🚀 Installation Steps

### Step 1: Run Database Migration (5 minutes)

```bash
# Run the CMS schema
psql $DATABASE_URL -f sql/cms-schema.sql

# Or if using a migration tool:
npm run db:migrate
```

**What this does:**
- Creates all CMS tables
- Inserts default theme settings
- Creates default homepage
- Adds blog/job categories

---

### Step 2: Add ThemeProvider to Layout (2 minutes)

**Edit:** `src/app/layout.tsx`

```typescript
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### Step 3: Add Link to Navigation (2 minutes)

**Add admin CMS link to your navigation:**

```typescript
// In your navigation component
{user?.role === 'admin' && (
  <Link href="/admin/cms">
    <Settings className="h-4 w-4 mr-2" />
    CMS Admin
  </Link>
)}
```

---

### Step 4: Test the CMS (10 minutes)

**Visit:** `http://localhost:3005/admin/cms`

**Test:**
1. Theme Editor - Change colors, see preview
2. Content Editor - Edit homepage content
3. Blog Manager - Create a test post
4. Job Manager - Create a test job

---

## 🎨 Using the Theme Editor

### Access
Navigate to `/admin/cms` → Click "Theme Editor"

### Features

**1. Brand Colors**
- Primary (main brand color)
- Secondary (highlights)
- Accent (success states)

**2. UI Colors**
- Background
- Foreground (text)
- Muted (disabled states)
- Border

**3. Semantic Colors**
- Success (green)
- Warning (orange)
- Error (red)
- Info (blue)

**4. Typography**
- Heading font
- Body font
- Monospace font

**5. Live Preview**
- See changes before saving
- Color palette preview
- Sample text rendering

---

## 📝 Using the Content Editor

### Access
Navigate to `/admin/cms` → Click "Page Content" → Select page

### How It Works

**1. Each page has content blocks:**
- Homepage: `hero_headline`, `hero_subhead`, `cta_primary`, etc.
- About: `mission_statement`, `team_section`, etc.
- Pricing: `tier_1_title`, `tier_1_price`, `tier_1_features`, etc.

**2. Edit any block:**
- Click "Edit" button
- Modify content (text, rich text, or JSON)
- Toggle visibility
- Save changes

**3. Block Types:**
- **Text:** Simple string (headlines, labels)
- **Rich Text:** HTML/Markdown (descriptions, content)
- **JSON:** Structured data (lists, objects)
- **Image:** URL to image file

---

## 📰 Using the Blog Manager

### Access
Navigate to `/admin/cms` → Click "Blog Posts"

### Creating a Post

**1. Click "New Post"**

**2. Fill in details:**
- Title (auto-generates slug)
- Excerpt (preview text)
- Content (Markdown/MDX)
- Cover image (optional)
- Category
- Tags (comma-separated)

**3. SEO Settings:**
- Meta title
- Meta description

**4. Options:**
- Featured post (appears at top)
- Status (draft/published)

**5. Publish or Save as Draft**

### Managing Posts
- View all posts with status indicators
- Edit existing posts
- Delete posts
- Track view counts
- Filter by status/category

---

## 💼 Using the Job Board Manager

### Access
Navigate to `/admin/cms` → Click "Job Board"

### Creating a Job

**1. Click "New Job"**

**2. Fill in details:**
- Job title
- Department
- Location (Remote, NYC, etc.)
- Employment type (Full-time, Part-time, etc.)
- Experience level (Entry, Mid, Senior, etc.)
- Salary range (optional)

**3. Description:**
- Full job description (Markdown supported)
- Requirements (one per line)
- Nice-to-have skills (one per line)

**4. Application Info:**
- Apply URL (external form)
- Apply email (direct email)

**5. Publish or Save as Draft**

---

## 🎨 How Theme System Works

### CSS Variables
Theme settings automatically generate CSS variables:

```css
:root {
  --color-primary: #2563EB;
  --color-secondary: #7C3AED;
  --font-heading: Inter, sans-serif;
  --font-body: Inter, sans-serif;
  /* ...etc */
}
```

### Using in Components
```tsx
// Automatically uses theme colors
<div className="bg-primary text-white">
  <h1 className="font-heading">Headline</h1>
  <p className="font-body">Body text</p>
</div>

// Or use CSS variables directly
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Content
</div>
```

### Live Updates
When you change theme in CMS:
1. Settings saved to database
2. CSS variables regenerated
3. Site automatically reflects changes (on next page load)
4. No code deployment needed!

---

## 📊 Content Block Examples

### Homepage Hero
```json
{
  "page": "homepage",
  "blocks": [
    {
      "key": "hero_headline",
      "type": "text",
      "content": { "text": "The Benchmark Standard for AEO Intelligence" }
    },
    {
      "key": "hero_subhead",
      "type": "text",
      "content": { "text": "Scientifically rigorous. Statistically validated." }
    },
    {
      "key": "hero_description",
      "type": "richtext",
      "content": {
        "html": "<p>While monitoring tools provide quick feedback...</p>"
      }
    },
    {
      "key": "trust_badges",
      "type": "json",
      "content": {
        "badges": [
          "Peer-Reviewed Methodology",
          "Industry Benchmarked",
          "Statistical Confidence Intervals"
        ]
      }
    }
  ]
}
```

### Pricing Tier
```json
{
  "page": "pricing",
  "blocks": [
    {
      "key": "tier_full_audit_title",
      "type": "text",
      "content": { "text": "Full Audit" }
    },
    {
      "key": "tier_full_audit_price",
      "type": "text",
      "content": { "text": "$2,500" }
    },
    {
      "key": "tier_full_audit_features",
      "type": "json",
      "content": {
        "features": [
          "12-dimension evaluation",
          "Industry percentile ranking",
          "Statistical confidence intervals",
          "Competitive benchmarking"
        ]
      }
    }
  ]
}
```

---

## 🔒 Security & Permissions

### Admin Access
Only users with `role = 'admin'` can access CMS.

**Check in components:**
```typescript
import { useSession } from 'next-auth/react';

const { data: session } = useSession();

if (session?.user?.role !== 'admin') {
  return <div>Access denied</div>;
}
```

### Audit Trail
All changes tracked with:
- User ID (who made the change)
- Timestamp (when)
- Previous value (optional, for rollback)

---

## 🚀 Advanced Features

### Custom CSS Injection
Add custom CSS directly in theme settings:

```sql
INSERT INTO site_settings (key, value, category) VALUES
('custom_css', '{"css": ".custom-class { color: red; }"}', 'theme');
```

### Dynamic Content Loading
Use content blocks in any component:

```typescript
import { contentManager } from '@/lib/cms/cms-client';

// In your component
const heroText = await contentManager.getBlockByKey('homepage', 'hero_headline');
```

### Blog with MDX
Write rich blog posts with:
- Markdown syntax
- React components embedded
- Code syntax highlighting
- Custom shortcodes

Example MDX:
```mdx
# My Blog Post

Regular markdown text...

<CustomComponent prop="value" />

```code
// Syntax highlighted code
```

More content...
```

---

## 📋 Content Management Workflow

### Daily Content Updates
1. Login to `/admin/cms`
2. Navigate to Content Editor
3. Select page (Homepage, About, Pricing)
4. Click "Edit" on any block
5. Update content
6. Save
7. Changes live immediately

### Monthly Blog Posts
1. Navigate to Blog Manager
2. Click "New Post"
3. Write content in Markdown
4. Add cover image, category, tags
5. Save as draft or publish
6. View at `/blog`

### Quarterly Theme Updates
1. Navigate to Theme Editor
2. Adjust colors for seasonal campaigns
3. Preview changes
4. Save
5. Entire site updates automatically

---

## 🎯 Common Use Cases

### Use Case 1: Update Homepage Tagline
```
1. Go to /admin/cms
2. Click "Page Content"
3. Select "Homepage"
4. Find "hero_headline" block
5. Click "Edit"
6. Change text to new tagline
7. Save
8. Done! Homepage updated.
```

### Use Case 2: Change Brand Colors
```
1. Go to /admin/cms
2. Click "Theme Editor"
3. Update "Primary" color picker
4. Click "Preview" to see changes
5. Save when satisfied
6. Done! Entire site now uses new color.
```

### Use Case 3: Publish Blog Post
```
1. Go to /admin/cms
2. Click "Blog Posts"
3. Click "New Post"
4. Fill in title, content (Markdown)
5. Add cover image URL
6. Select category
7. Click "Publish"
8. Done! Live at /blog/your-post-slug
```

### Use Case 4: Post Job Opening
```
1. Go to /admin/cms
2. Click "Job Board"
3. Click "New Job"
4. Fill in all details
5. Add requirements (one per line)
6. Set apply URL or email
7. Click "Publish Job"
8. Done! Live at /careers
```

---

## 🔧 Troubleshooting

### Theme Not Applying
**Issue:** Colors not updating on site  
**Solution:** 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors

### Content Not Saving
**Issue:** Edit button doesn't work  
**Solution:**
1. Check you're logged in as admin
2. Verify database connection
3. Check browser console for API errors

### Blog Images Not Loading
**Issue:** Cover images show broken  
**Solution:**
1. Use absolute URLs (https://...)
2. Or upload to `/public/blog/` and use relative path
3. Check image URL is valid

---

## 📚 Next Steps

### Week 1: Content Migration
- [ ] Move all homepage copy to CMS
- [ ] Create content blocks for pricing page
- [ ] Add About page content
- [ ] Test all pages

### Week 2: Blog Setup
- [ ] Write 3 initial blog posts
- [ ] Set up categories
- [ ] Add cover images
- [ ] Test blog functionality

### Week 3: Jobs & Polish
- [ ] Create job postings
- [ ] Test application flow
- [ ] Fine-tune theme colors
- [ ] Train team on CMS

---

## ✅ Success Metrics

After setup, you should be able to:

- [ ] Change site colors without code
- [ ] Update homepage copy without deployment
- [ ] Publish blog posts in <5 minutes
- [ ] Post jobs in <10 minutes
- [ ] Preview changes before saving
- [ ] Track content change history

---

## 🎯 CMS Features Summary

| Feature | Status | Time to Use |
|---------|--------|-------------|
| Theme colors | ✅ Ready | 2 minutes |
| Typography | ✅ Ready | 5 minutes |
| Page content | ✅ Ready | 1 minute per block |
| Blog posts | ✅ Ready | 10 minutes per post |
| Job postings | ✅ Ready | 15 minutes per job |
| Live preview | ✅ Ready | Instant |

---

**Access your CMS at:** `http://localhost:3005/admin/cms`

**Public blog at:** `http://localhost:3005/blog`

**Public jobs at:** `http://localhost:3005/careers`

---

**Status:** ✅ CMS Complete and Production-Ready!

