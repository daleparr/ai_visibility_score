# CMS Troubleshooting Guide
## Fix "localhost refused to connect"

**Issue:** Server not starting or build errors  
**Solution:** Follow these steps

---

## 🔧 Quick Fixes

### Fix 1: Check if Server is Actually Running

```powershell
# Check if Next.js is running
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

**If no node process:** Server didn't start, check for build errors.

---

### Fix 2: Check Build Errors

```powershell
# Try building first to see errors
npm run build
```

**Look for errors related to:**
- Missing imports
- Type errors
- Module not found

---

### Fix 3: Check for Type Errors in CMS Files

The issue might be with the CMS imports. Let me fix the most likely issues:

**Run this to check:**
```powershell
npx tsc --noEmit
```

---

### Fix 4: Start with Simple Build

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Rebuild
npm run build

# Start
npm run start
```

---

## 🚨 Most Likely Issue: Import Errors

The CMS files might have import issues. Let me create a simplified version:

### Quick Fix: Comment Out CMS Routes Temporarily

**1. Rename API routes to disable them:**
```powershell
# Temporarily disable CMS API routes
Rename-Item src\app\api\cms cms_disabled -ErrorAction SilentlyContinue
```

**2. Try starting server:**
```powershell
npm run build
npm run start
```

**3. If that works, we'll fix CMS imports properly**

---

## 🎯 Alternative: Test Without CMS First

**Let's verify your base app works:**

```powershell
# Start server
npm run start
```

**Then visit:** http://localhost:3005

**If base app works:**
- ✅ Server is fine
- ❌ CMS has import/type errors
- 👉 We fix CMS files

**If base app doesn't work:**
- ❌ Bigger issue with app
- 👉 Check .env.local, database connection

---

## 🔍 Diagnostic Steps

### Step 1: Check Environment
```powershell
# Verify .env.local exists
Test-Path .env.local

# Check DATABASE_URL is set
Get-Content .env.local | Select-String "DATABASE"
```

### Step 2: Check Node Version
```powershell
node --version
# Should be 18.x or higher
```

### Step 3: Check Port
```powershell
# Check if port 3005 is in use
netstat -ano | findstr :3005
```

---

## 🚀 Fastest Path to Working CMS

### Option A: Start Fresh (Recommended)
```powershell
# 1. Stop all processes
taskkill /F /IM node.exe /T

# 2. Clear cache
Remove-Item -Recurse -Force .next

# 3. Reinstall
npm install

# 4. Build
npm run build

# 5. Start
npm run start
```

### Option B: Skip CMS for Now, Test Base App
```powershell
# Just verify your app works first
npm run build
npm run start

# Visit: http://localhost:3005
# If that works, we add CMS incrementally
```

---

## 💡 What to Try Now

**Immediate Action:**

1. **Stop any running process:**
   ```powershell
   taskkill /F /IM node.exe /T
   ```

2. **Try simple start:**
   ```powershell
   npm run build
   ```

3. **Look for build errors in output**

4. **Report back:** 
   - What errors do you see?
   - Does build complete?
   - Any red error messages?

---

**I'll help you fix whatever errors appear. Share the build output!**


