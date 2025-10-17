# CMS Diagnostic Steps

**Issue:** Internal server error  
**Action:** Run diagnostics

---

## 🔍 Step 1: Check Status API

**Open in browser:** http://localhost:3000/api/cms-test/status

**You should see JSON like:**
```json
{
  "server": "running",
  "timestamp": "2025-10-16...",
  "checks": {
    "basicResponse": "OK",
    "dbImport": "OK",
    "cmsClientImport": "OK",  
    "dbQuery": "OK",
    "cmsTablesExist": "OK - 4 settings"
  }
}
```

**If all say "OK":** Database and CMS setup is good, issue is elsewhere

**If any say "FAILED":** That tells us what to fix

---

## 📊 Interpret Results

### All Checks "OK"
✅ CMS is ready, just need to fix auth or use test page

### "dbImport" FAILED
❌ Database connection issue  
Fix: Check DATABASE_URL in .env.local

### "cmsClientImport" FAILED
❌ CMS code has errors  
Fix: Check TypeScript/import errors

### "cmsTablesExist" FAILED
❌ Migration didn't run or tables missing  
Fix: Re-run `sql/cms-schema.sql`

---

## 🚀 Next Steps

1. **Visit:** http://localhost:3000/api/cms-test/status
2. **Screenshot** the JSON response
3. **Share it** so I can see what's failing
4. **I'll fix** the specific issue

---

**This will tell us exactly what's wrong!**


