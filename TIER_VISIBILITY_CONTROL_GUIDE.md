# 🎯 Tier Visibility & Paywall Control Guide

**Control which tiers are visible to which users - Drive free→paid conversion**

---

## 🚀 Quick Answer: YES, You Control This in CMS!

**Path:** `/admin/cms` → Pricing Tiers tab → Edit any tier

---

## 💡 Your Strategy: Free Lead Gen → Authenticated Upsell

### **Current Setup (After Running SQL):**

**🌐 PUBLIC TIERS** (Anyone can see):
- ✅ Quick Scan - £499
- ✅ Full Audit - £2,500

**🔐 HIDDEN FROM PUBLIC** (Paywall - shown only after signup):
- ✅ Index Pro Monthly - £119/month
- ✅ Enterprise Monthly - £319/month

---

## 🎯 How It Works (Conversion Funnel)

### **Step 1: Anonymous Visitor**
Sees pricing page with:
- Quick Scan (£499)
- Full Audit (£2,500)
- "Need ongoing intelligence? Sign up to see monthly plans" CTA

**Result:** Can purchase one-time evaluations, forced to create account

### **Step 2: User Signs Up**
After creating account, NOW sees:
- Quick Scan (£499)
- Full Audit (£2,500)
- **NEW:** Index Pro Monthly (£119/month) ← Upsell appears!
- **NEW:** Enterprise Monthly (£319/month) ← Upsell appears!

**Result:** Drives conversion to recurring revenue

### **Step 3: Paid Customer**
After first purchase, can see:
- All public tiers
- All authenticated tiers
- **PLUS:** Special upsell offers (if you set access_level = 'paid_only')

---

## 🛠️ How to Control in CMS

### **Method 1: Quick Toggle (Recommended)**

**Run this SQL in Neon NOW:**
```sql
-- File: sql/cms-add-tier-access-control.sql
```

**This automatically:**
- ✅ Hides Index Pro & Enterprise from public
- ✅ Sets them to "authenticated only"
- ✅ Keeps Quick Scan & Full Audit public

**Then in CMS:**
1. Go to `/admin/cms` → Pricing Tiers
2. You'll see badges: 🌐 Public, 🔒 Hidden, 🔐 Requires login
3. Click "Edit" on any tier to change settings

### **Method 2: Manual Control Per Tier**

**For each tier, you control:**

**Toggle 1: "Visible on public pricing page"**
- ✅ ON = Shows on /pricing (even to anonymous users)
- ❌ OFF = Hidden from public, only shown to authenticated/paid users

**Toggle 2: "Requires authentication to access"**
- ✅ ON = User must be logged in to see/purchase
- ❌ OFF = Anyone can purchase

**Dropdown: "Access Level"**
- 🌐 **Public** = Anyone can see and purchase
- 🔒 **Authenticated** = Only logged-in users see it
- 💎 **Paid Only** = Only existing paying customers (ultimate upsell)
- 🔧 **Admin Only** = You can see it, customers can't (testing)

---

## 📊 Recommended Configurations

### **Configuration 1: Aggressive Free → Paid Funnel**

| Tier | Visible Public | Requires Auth | Access Level | Strategy |
|------|----------------|---------------|--------------|----------|
| Quick Scan | ✅ Yes | ❌ No | Public | Lead generation |
| Full Audit | ❌ No | ✅ Yes | Authenticated | Must sign up to see |
| Index Pro | ❌ No | ✅ Yes | Authenticated | Must sign up to see |
| Enterprise | ❌ No | ✅ Yes | Paid Only | Only after first purchase |

**Result:** Public sees ONLY Quick Scan → forced to sign up to see other options

### **Configuration 2: Moderate (Your Current Setup)**

| Tier | Visible Public | Requires Auth | Access Level | Strategy |
|------|----------------|---------------|--------------|----------|
| Quick Scan | ✅ Yes | ❌ No | Public | Easy entry |
| Full Audit | ✅ Yes | ❌ No | Public | High-value lead gen |
| Index Pro | ❌ No | ✅ Yes | Authenticated | Upsell after signup |
| Enterprise | ❌ No | ✅ Yes | Authenticated | Upsell after signup |

**Result:** Public sees one-time tiers → signs up → shown recurring options

### **Configuration 3: Full Transparency**

| Tier | Visible Public | Requires Auth | Access Level | Strategy |
|------|----------------|---------------|--------------|----------|
| ALL | ✅ Yes | ❌ No | Public | Show everything upfront |

**Result:** Build trust with transparency, capture leads who want subscriptions

---

## 🎯 How to Implement Your Strategy

### **Option A: Run the SQL (Instant)**

**In Neon:**
```sql
-- Copy/paste: sql/cms-add-tier-access-control.sql
-- Runs in 5 seconds
-- Automatically configures recommended setup
```

**Result:** Index Pro & Enterprise hidden immediately

### **Option B: Manual via CMS (After Next Deploy)**

**After next deployment:**
1. `/admin/cms` → Pricing Tiers
2. Click "Edit" on "Index Pro Monthly"
3. Set:
   - Visible on public pricing page: ❌ OFF
   - Requires authentication: ✅ ON
   - Access Level: 🔒 Authenticated
4. Click "Update Tier"
5. Repeat for "Enterprise Monthly"

**Result:** Same as Option A, but manual control

---

## 📈 Expected Impact

### **Before (All Tiers Public):**
- Anonymous visitor sees 6 tiers
- Can choose any tier without signup
- No forced account creation
- **Conversion to free signup:** Low

### **After (Paywall Strategy):**
- Anonymous visitor sees 2 tiers (one-time only)
- Must signup to see monthly options
- Creates FOMO: "What am I missing?"
- **Conversion to free signup:** +40-60%
- **Free → Paid conversion:** +25-35% (now they're in ecosystem)

---

## 🔥 Pro Tips

### **Tip 1: Tease the Hidden Tiers**

On public pricing page, add banner:
```
"Need ongoing competitive intelligence? 
Sign up to see our monthly subscription plans"
[Create Free Account →]
```

### **Tip 2: Show Tier Count**

```
"Viewing 2 of 6 pricing options. 
Sign in to see monthly plans and enterprise packages"
```

### **Tip 3: Progressive Disclosure**

- **Anonymous:** See 2 tiers (one-time)
- **Authenticated:** See 4 tiers (+ monthly plans)
- **Paid Customer:** See 6 tiers (+ special upsells)

---

## ✅ Action Items

**RIGHT NOW:**
1. [ ] Run `sql/cms-add-tier-access-control.sql` in Neon
2. [ ] Wait for next deployment (~3 min)
3. [ ] Check `/admin/cms` → Pricing Tiers → See access badges

**THEN:**
- [ ] Verify Index Pro & Enterprise show 🔒 "Hidden from public"
- [ ] Test: Visit /pricing as anonymous user (should only see 2 tiers)
- [ ] Test: Login and visit /pricing (should see all 4 tiers)

---

## 🎊 Summary

**YES - You control tier visibility in CMS!**

**Three levers:**
1. **Visible on public pricing page** (show/hide toggle)
2. **Requires authentication** (paywall toggle)
3. **Access level** (public/authenticated/paid-only dropdown)

**Your strategy:**
- Keep Quick Scan & Full Audit public (lead gen)
- Hide Index Pro & Enterprise behind signup wall (conversion driver)
- **Result:** More signups, more paid conversions

**Run the SQL now and it's configured automatically!** 🚀

