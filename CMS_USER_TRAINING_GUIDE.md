# CMS User Training Guide
## How to Edit AIDI Website Copy (No Code Required!)

**Audience:** Content Team, Marketing Team, Non-Technical Staff  
**Time to Learn:** 15 minutes  
**Time to Edit:** 2-5 minutes per change

---

## 🎯 What You Can Do

After this training, you'll be able to:
- ✅ Update homepage headlines
- ✅ Change pricing tiers and prices
- ✅ Edit methodology content
- ✅ Modify FAQ questions and answers
- ✅ Update all copy across the site
- ✅ **WITHOUT any code knowledge**
- ✅ **WITHOUT waiting for deployments**

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Access the CMS
1. Visit: `https://ai-discoverability-index.netlify.app/admin/cms`
2. Sign in with your admin account
3. You'll see the CMS dashboard

### Step 2: Edit Your First Block
1. Click **"Page Content"** in the sidebar
2. Click **"Homepage"** from the list
3. Find **"hero_headline"** in the blocks list
4. Click the **"Edit"** button
5. Change the text
6. Click **"Save"**
7. **DONE!** Refresh the homepage to see changes

**Congratulations!** You just edited the website without touching code.

---

## 📝 CMS Dashboard Overview

### Sidebar Navigation
```
CMS Admin
├── 🎨 Theme Editor          ← Change colors & fonts
├── 📄 Page Content          ← Edit copy on pages
├── 📝 Blog Posts            ← Manage blog
└── 💼 Job Board             ← Manage careers page
```

### Page Content Structure
```
Page Content
├── Homepage
│   ├── hero_headline        [Edit]
│   ├── hero_subhead         [Edit]
│   ├── hero_description     [Edit]
│   ├── trust_indicators     [Edit]
│   ├── pricing_tiers        [Edit]
│   └── footer_about         [Edit]
│
├── Methodology
│   ├── methodology_intro    [Edit]
│   ├── core_principles      [Edit]
│   └── downloads            [Edit]
│
├── FAQ
│   └── faq_categories       [Edit]
│
└── Reports Landing
    ├── reports_hero_headline    [Edit]
    ├── reports_value_props      [Edit]
    └── reports_pricing_tiers    [Edit]
```

---

## 🎓 Common Tasks

### Task 1: Update Homepage Headline

**Time:** 2 minutes

1. Go to `/admin/cms`
2. Click **Page Content** → **Homepage**
3. Find **"hero_headline"**
4. Click **[Edit]**
5. Text field appears
6. Change to: "Your New Headline Here"
7. Click **[Save]**
8. Refresh homepage → See changes!

---

### Task 2: Change Pricing Tier

**Time:** 3 minutes

1. Go to `/admin/cms`
2. Click **Page Content** → **Homepage**
3. Find **"pricing_tiers"** (type: JSON)
4. Click **[Edit]**
5. JSON editor appears
6. Find the tier you want to edit:
   ```json
   {
     "name": "Full Audit",
     "price": "$2,500",  ← Change this
     "features": ["..."]
   }
   ```
7. Change price to: `"$2,999"`
8. Click **[Save]**
9. Homepage pricing updates instantly!

---

### Task 3: Add a New FAQ Question

**Time:** 5 minutes

1. Go to `/admin/cms`
2. Click **Page Content** → **FAQ**
3. Find **"faq_categories"** (type: JSON)
4. Click **[Edit]**
5. JSON editor appears
6. Find the category you want to add to
7. Add new question object:
   ```json
   {
     "id": "new-question",
     "question": "What is your new question?",
     "answer": "<p>The answer goes here. You can use HTML.</p>"
   }
   ```
8. Click **[Save]**
9. FAQ page updates instantly!

---

### Task 4: Update Footer About Section

**Time:** 2 minutes

1. Go to `/admin/cms`
2. Click **Page Content** → **Homepage**
3. Find **"footer_about"** (type: Rich Text)
4. Click **[Edit]**
5. Rich text editor appears (like Word)
6. Edit the HTML or use visual editor
7. Click **[Save]**
8. Footer updates across entire site!

---

## 🎨 Editing Different Block Types

### Text Blocks (Simple)
**Example:** `hero_headline`

```
┌─────────────────────────────────┐
│ Edit: hero_headline             │
├─────────────────────────────────┤
│ Text:                           │
│ [                               │
│   The Benchmark Standard for    │
│   AEO Intelligence              │
│ ]                               │
│                                 │
│ [Save] [Cancel]                 │
└─────────────────────────────────┘
```

**Just type!** Simple as editing a Word document.

---

### Rich Text Blocks (HTML/Markdown)
**Example:** `hero_description`

```
┌─────────────────────────────────┐
│ Edit: hero_description          │
├─────────────────────────────────┤
│ HTML:                           │
│ [                               │
│   <p>While monitoring tools     │
│   provide <strong>quick         │
│   feedback</strong>, AIDI...    │
│   </p>                          │
│ ]                               │
│                                 │
│ [Save] [Cancel]                 │
└─────────────────────────────────┘
```

**You can use:**
- `<p>` for paragraphs
- `<strong>` for bold
- `<em>` for italics
- `<ul><li>` for bullet lists

---

### JSON Blocks (Structured)
**Example:** `pricing_tiers`

```
┌─────────────────────────────────┐
│ Edit: pricing_tiers             │
├─────────────────────────────────┤
│ JSON:                           │
│ {                               │
│   "tiers": [                    │
│     {                           │
│       "name": "Full Audit",     │
│       "price": "$2,500",        │
│       "features": [             │
│         "Industry percentiles", │
│         "Statistical CI"        │
│       ]                         │
│     }                           │
│   ]                             │
│ }                               │
│                                 │
│ [Save] [Cancel]                 │
└─────────────────────────────────┘
```

**Be careful with:**
- Commas (every item needs one, except last)
- Quotes (use `"` not `'`)
- Brackets ( `{...}` and `[...]` )
- Ask developer if unsure!

---

## ⚠️ Important Rules

### DO:
- ✅ Edit text freely
- ✅ Fix typos immediately
- ✅ Update prices when needed
- ✅ Add new features to lists
- ✅ Preview before saving (when available)

### DON'T:
- ❌ Delete block_key fields (breaks site)
- ❌ Change block_type (text → json, etc.)
- ❌ Remove commas in JSON (syntax error)
- ❌ Delete entire blocks without checking
- ❌ Edit during peak traffic (3-5pm GMT)

### ASK DEVELOPER IF:
- 🤔 JSON looks wrong
- 🤔 Save button doesn't work
- 🤔 Changes don't appear on site
- 🤔 Error messages appear
- 🤔 Want to add completely new sections

---

## 🐛 Troubleshooting

### Problem: Changes don't appear on site
**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Wait 30 seconds (caching delay)
3. Check if block is set to "Visible" ✓
4. Verify you clicked "Save" not "Cancel"

### Problem: Save button doesn't work
**Solutions:**
1. Check for JSON syntax errors (red text)
2. Try canceling and editing again
3. Refresh CMS admin page
4. Ask developer if persists

### Problem: Site looks broken after edit
**Solutions:**
1. Go back to CMS admin
2. Find the block you just edited
3. Click "Edit"
4. Revert to previous text
5. Save
6. Ask developer for help

---

## 📊 Framework Guidelines

When editing copy, remember the **AIDI Authoritative Accessibility** framework:

### ✅ DO Use This Language:
- "Our data shows..."
- "Statistical confidence interval..."
- "Industry percentile ranking..."
- "Peer-reviewed methodology..."
- "Thanks to category leaders like Searchable..."

### ❌ DON'T Use This Language:
- "Get your free audit!"
- "Revolutionary tool!"
- "Better than competitors..."
- "Game-changing insights!"
- "Easy to use!"

### Think: Bloomberg, Not Buzzfeed
- **Bloomberg:** "Our October analysis of 2,400 responses shows Nike gained 12 percentage points (p<0.01)"
- **Buzzfeed:** "Nike is CRUSHING it in AI! Get your free scan now!"

**We're Bloomberg.** Data-driven, confident, accessible.

---

## 🎯 Your First Assignment

### Practice Exercise (10 Minutes)

1. **Access CMS:** `/admin/cms`
2. **Edit a test block:**
   - Navigate to Homepage
   - Find "hero_headline"
   - Click Edit
   - Change to: "TEST HEADLINE - [Your Name]"
   - Save

3. **Verify change:**
   - Refresh homepage
   - See "TEST HEADLINE - [Your Name]"
   - Success! ✅

4. **Revert change:**
   - Go back to CMS
   - Edit same block
   - Change back to: "The Benchmark Standard for AEO Intelligence"
   - Save
   - Refresh homepage
   - Verify original is back

**Congratulations!** You've completed CMS training.

---

## 📞 Support & Help

### Quick Questions
- **Slack:** #cms-help channel
- **Email:** cms-support@aidi.com

### Training Sessions
- **Weekly Office Hours:** Thursdays 2-3pm GMT
- **One-on-One Training:** Book via calendar link

### Resources
- **This Guide:** Bookmark for reference
- **Video Tutorial:** [To be recorded]
- **FAQ:** [To be created]

---

## ✅ Certification

After completing this training and the practice exercise, you're certified to:
- ✅ Edit text blocks independently
- ✅ Update rich text with basic HTML
- ✅ Fix typos and update copy
- ⚠️ Edit JSON (with developer review)
- ⚠️ Add new blocks (developer assistance needed)

**Welcome to the CMS team!** 🎉

---

**Status:** ✅ Training Guide Complete  
**Next:** Schedule team training session  
**Duration:** 30 minutes (presentation + practice)


