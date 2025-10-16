# CMS Deployment - Do This Now
## Get CMS Live in 15 Minutes

**Goal:** CMS running and testable  
**Time:** 15 minutes  
**Priority:** Testing only (polish later)

---

## ✅ Step-by-Step Deployment

### Step 1: Run Database Migration (2 minutes)

```bash
# Connect to your Neon database and run the schema
psql $DATABASE_URL -f sql/cms-schema.sql
```

**What this does:**
- Creates 7 CMS tables
- Inserts default theme
- Creates default homepage
- Adds blog/job categories

**Verify it worked:**
```bash
psql $DATABASE_URL -c "SELECT * FROM site_settings;"
```

You should see theme settings.

---

### Step 2: Add ThemeProvider to Layout (3 minutes)

**Edit:** `src/app/layout.tsx`

**Find the return statement and wrap children with ThemeProvider:**

```typescript
import { ThemeProvider } from '@/components/ThemeProvider';

// ... existing imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
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

### Step 3: Add Textarea Component (2 minutes)

**Create:** `src/components/ui/textarea.tsx` (if doesn't exist)

```typescript
import * as React from "react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

---

### Step 4: Install Required Dependencies (3 minutes)

```bash
npm install date-fns
```

---

### Step 5: Start Dev Server (1 minute)

```bash
npm run dev
```

---

### Step 6: Test CMS (5 minutes)

**Visit:** `http://localhost:3005/admin/cms`

**Test each section:**

1. **Theme Editor**
   - Change primary color
   - Click "Preview"
   - Click "Save Changes"

2. **Page Content** (if homepage exists)
   - Select a page
   - Try editing a block

3. **Blog Posts**
   - Click "New Post"
   - Fill in basic details
   - Save as draft

4. **Job Board**
   - Click "New Job"
   - Fill in basic details
   - Save as draft

---

## 🚨 Troubleshooting

### Issue: "Cannot find module ThemeProvider"
**Fix:**
```bash
# File might not be created yet. Check:
ls src/components/ThemeProvider.tsx
# If missing, it should be there from earlier creation
```

### Issue: "Database migration fails"
**Fix:**
```bash
# Check your DATABASE_URL is correct:
echo $DATABASE_URL

# Try running migration directly:
cat sql/cms-schema.sql | psql $DATABASE_URL
```

### Issue: "404 on /admin/cms"
**Fix:**
```bash
# Check file exists:
ls src/app/admin/cms/page.tsx

# Restart dev server:
npm run dev
```

### Issue: "Textarea component not found"
**Fix:** Create the file from Step 3 above.

### Issue: "date-fns not found"
**Fix:**
```bash
npm install date-fns
```

---

## 🎯 Minimal Test Checklist

After setup, verify:

- [ ] Can access `/admin/cms`
- [ ] Theme Editor loads
- [ ] Can change a color
- [ ] Can preview theme changes
- [ ] Can save theme changes
- [ ] Blog Manager loads
- [ ] Can create a draft post
- [ ] Job Manager loads
- [ ] Can create a draft job

**If all checked: ✅ CMS is working!**

---

## 📝 Quick Test Script

**Run this to verify everything:**

1. Change theme color:
   - Go to `/admin/cms`
   - Click "Theme Editor"
   - Change Primary color to `#7C3AED`
   - Click "Save Changes"
   - Refresh homepage - buttons should be purple

2. Create blog post:
   - Click "Blog Posts"
   - Click "New Post"
   - Title: "Test Post"
   - Content: "This is a test"
   - Click "Save as Draft"
   - Verify it appears in list

3. Create job:
   - Click "Job Board"
   - Click "New Job"
   - Title: "Test Job"
   - Department: "Engineering"
   - Click "Save as Draft"
   - Verify it appears in list

**If all 3 work: ✅ CMS fully functional!**

---

## 🚀 Next Steps After Testing

### Once CMS Works:
1. Customize theme to your brand colors
2. Add real blog post
3. Update homepage content blocks
4. Add job postings if hiring

### Polish Later:
- Content migration from existing pages
- Custom CSS tweaks
- Image uploads
- Additional pages

---

**Focus: Get it working. Polish later.**

**Start with Step 1 (database migration) and work through the list.**

**Time: 15 minutes. Let's go! 🚀**

