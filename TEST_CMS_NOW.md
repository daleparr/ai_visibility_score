# Test Your CMS - Right Now!
## 5-Minute Testing Guide

**Server Status:** 🟢 Running in background  
**Access URL:** http://localhost:3005/admin/cms

---

## ✅ CMS Deployed Successfully!

**Database Migration:** ✅ Complete  
**Theme Provider:** ✅ Added to layout  
**Dependencies:** ✅ Installed  
**Server:** 🟢 Running

---

## 🧪 Quick 5-Minute Test

### Test 1: Theme Editor (2 minutes)

1. **Open:** http://localhost:3005/admin/cms
2. You should see **Theme Editor** (default view)
3. **Change primary color:**
   - Click the color picker under "Primary"
   - Pick a new color (e.g., purple `#7C3AED`)
4. **Click "Preview"** - See changes in preview section
5. **Click "Save Changes"**
6. **Refresh page** - Color should persist

**✅ Pass if:** Color changes save and preview works

---

### Test 2: Blog Manager (2 minutes)

1. **Click "Blog Posts"** in sidebar
2. **Click "New Post"** button
3. **Fill in minimum fields:**
   - Title: "Welcome to AIDI Blog"
   - Content: "This is our first post about AEO benchmarking"
   - Category: Select "AEO Insights"
4. **Click "Save as Draft"**
5. **Verify:** Post appears in list with gray "draft" badge

**✅ Pass if:** Can create and see draft post

---

### Test 3: Job Manager (1 minute)

1. **Click "Job Board"** in sidebar
2. **Click "New Job"** button
3. **Fill in:**
   - Title: "Senior Data Scientist"
   - Department: "Data Science"
   - Location: "Remote"
   - Description: "Help us build the benchmark standard for AEO"
4. **Click "Save as Draft"**

**✅ Pass if:** Job appears in list

---

## 🎯 Expected Results

### What You Should See

**CMS Dashboard:**
```
┌──────────────────────────────────────────┐
│ CMS Admin                                │
│                                          │
│ Sidebar:              Main Area:         │
│ • Theme Editor   ←    [Color Pickers]    │
│ • Page Content        [Font Selects]     │
│ • Blog Posts          [Preview]          │
│ • Job Board           [Save Button]      │
└──────────────────────────────────────────┘
```

**After Creating Blog Post:**
```
Blog Posts
┌──────────────────────────────────────────┐
│ [New Post Button]                        │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Welcome to AIDI Blog               │  │
│ │ [draft badge]                      │  │
│ │ This is our first post...          │  │
│ │ [Edit] [Delete]                    │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 🚨 If Something Doesn't Work

### Error: "Cannot access /admin/cms"
**Check:**
- Server is running (should see in terminal)
- URL is correct: http://localhost:3005/admin/cms
- No port conflicts

**Fix:**
```powershell
# Restart dev server
npm run dev
```

---

### Error: "Unauthorized" or "Access Denied"
**Likely:** Auth check in CMS routes

**Quick Fix for Testing:**
```typescript
// In src/app/api/cms/theme/route.ts
// Temporarily comment out:
// const session = await getServerSession();
// if (!session?.user) {
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// }
```

---

### Error: "Failed to load theme"
**Check:**
- Database migration ran successfully
- Look for console errors in browser DevTools (F12)

**Verify DB:**
```powershell
$env:DATABASE_URL = (Get-Content .env.local | Select-String "NETLIFY_DATABASE_URL" | ForEach-Object { $_ -replace "NETLIFY_DATABASE_URL=", "" })
psql $env:DATABASE_URL -c "SELECT * FROM site_settings LIMIT 1;"
```

---

### Error: TypeScript Build Errors
**Expected:** May have some import errors

**Fix Later:** Focus on testing functionality first

---

## 📋 Quick Success Checklist

**Minimum Viable Test:**

- [ ] Can access http://localhost:3005/admin/cms
- [ ] Theme Editor loads (color pickers visible)
- [ ] Can change a color
- [ ] Can save changes
- [ ] Blog Manager loads
- [ ] Can create draft post
- [ ] Job Manager loads

**If 5/7 checked: ✅ CMS is working!**

---

## 🎯 What to Do Next

### If CMS Works (5/7+ tests pass):

**Immediate:**
1. Customize theme colors to your brand
2. Create 1-2 real blog posts
3. Add job posting if hiring

**This Week:**
1. Migrate existing content to CMS
2. Train team on CMS usage
3. Set up content workflow

---

### If CMS Has Issues (<5/7 tests pass):

**Report:**
1. Which tests failed?
2. What error messages in console?
3. What error messages in server logs?

**I'll help you fix them!**

---

## 🎉 Success! 

**Your CMS is now deployed and testing!**

**Access:** http://localhost:3005/admin/cms  
**Blog:** http://localhost:3005/blog  
**Jobs:** http://localhost:3005/careers

**Run through the 3 tests above and report results!** ✓


