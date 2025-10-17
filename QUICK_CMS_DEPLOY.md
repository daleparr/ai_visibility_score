# Quick CMS Deploy - Windows
## Get CMS Running in 5 Minutes

**For:** Windows with PowerShell  
**Time:** 5 minutes  
**Goal:** CMS live for testing

---

## 🚀 Option 1: Automated (Recommended)

### Run the deployment script:

```powershell
.\deploy-cms.ps1
```

**This script will:**
1. Check database connection
2. Run CMS migration
3. Install dependencies
4. Check build
5. Start dev server

**Then visit:** `http://localhost:3005/admin/cms`

---

## 🔧 Option 2: Manual Steps

### Step 1: Set Database URL (if not already set)

```powershell
# Check if set
$env:DATABASE_URL

# If empty, set it (get from .env.local):
$env:DATABASE_URL = "your_neon_database_url_here"
```

### Step 2: Run Migration

```powershell
Get-Content sql\cms-schema.sql | psql $env:DATABASE_URL
```

**Verify it worked:**
```powershell
psql $env:DATABASE_URL -c "SELECT key FROM site_settings;"
```

Should show: `theme_colors`, `theme_fonts`, etc.

### Step 3: Start Dev Server

```powershell
npm run dev
```

### Step 4: Test CMS

Visit: `http://localhost:3005/admin/cms`

---

## ✅ Quick Test

Once server is running:

1. **Navigate to:** `http://localhost:3005/admin/cms`

2. **Test Theme Editor:**
   - Click "Theme Editor" (should be selected by default)
   - Change Primary color
   - Click "Preview"
   - Click "Save Changes"

3. **Test Blog:**
   - Click "Blog Posts" in sidebar
   - Click "New Post"
   - Fill in title: "Test Post"
   - Fill in content: "This is a test"
   - Click "Save as Draft"

4. **Test Jobs:**
   - Click "Job Board" in sidebar
   - Click "New Job"
   - Fill in title: "Test Role"
   - Click "Save as Draft"

**If all 3 work: ✅ CMS is working!**

---

## 🚨 Troubleshooting

### Error: "psql command not found"
**Fix:**
```powershell
# Install PostgreSQL client or use Neon web interface
# Alternative: Run migration through Neon dashboard SQL editor
```

### Error: "Permission denied on table"
**Fix:**
```powershell
# Your database user needs permissions. Check Neon dashboard.
# Or use the service role connection string
```

### Error: "Cannot find module ThemeProvider"
**Fix:**
```powershell
# Restart dev server:
npm run dev
```

### Error: "Port 3005 already in use"
**Fix:**
```powershell
# Kill existing process or use different port:
$env:PORT = 3006
npm run dev
```

---

## 📝 Post-Deployment Test Checklist

- [ ] CMS dashboard loads at `/admin/cms`
- [ ] Theme Editor shows color pickers
- [ ] Can change a color and preview it
- [ ] Can save theme changes
- [ ] Blog Manager loads
- [ ] Can create a draft post
- [ ] Job Manager loads
- [ ] Can create a draft job
- [ ] No console errors in browser

---

## 🎯 Next Steps After CMS Works

1. **Customize theme:**
   - Set your brand colors
   - Choose preferred fonts
   - Save changes

2. **Test content editing:**
   - Go to "Page Content"
   - Select "Homepage"
   - Try editing a block

3. **Create real content:**
   - Write first blog post
   - Add job posting if hiring

---

**Run:** `.\deploy-cms.ps1` **and you're done!** 🚀

**Time:** 5 minutes  
**Result:** CMS live and testable


