# UI Mockups: Searchable-Inspired Features
## Visual Design Guide for AIDI Enhancements

---

## 🎨 Overview

This document shows how to integrate Searchable's best UI patterns into AIDI while maintaining our executive positioning and data science rigor.

---

## 📊 Mockup 1: Enhanced Dashboard Header

### Current State (AIDI)
```
┌─────────────────────────────────────────────────────┐
│  AI Discoverability Index Report                    │
│                                                      │
│  Overall Score: 67/100 (Grade: C)                  │
│  Tested: October 15, 2025                          │
└─────────────────────────────────────────────────────┘
```

### New State (Searchable-Inspired)
```
┌─────────────────────────────────────────────────────────────────┐
│  AI Discoverability Index Report                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │         Overall Score: 67/100 (Grade: C)                │   │
│  │         Tested: October 15, 2025                        │   │
│  │                                                           │   │
│  │  Tested with:                                            │   │
│  │  [GPT-4 ✓]  [Claude-3 ✓]  [Gemini Pro ✓]               │   │
│  │  [Perplexity ⏳ Coming Soon]                            │   │
│  │                                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Additions:**
- Platform badges with checkmarks
- Clear "tested with" indication
- Coming soon indicators for roadmap transparency

---

## 📊 Mockup 2: Recommendations with Severity

### Current State (AIDI)
```
Recommendations:
1. Add FAQ schema to product pages
2. Improve semantic clarity in headlines
3. Build citation presence
```

### New State (Searchable-Inspired)
```
┌────────────────────────────────────────────────────────────┐
│  Action Items (56 total)                                   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  🔴 Critical Priority                         4    │   │
│  │  Fix in 2 days                                      │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  🟠 High Priority                             9    │   │
│  │  Fix in 2 weeks                                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  🟡 Medium Priority                          31    │   │
│  │  Fix in 30 days                                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  🟢 Low Priority                             12    │   │
│  │  Fix in 90 days                                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ 4 critical issues require immediate attention         │
└────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Visual severity badges (🔴🟠🟡🟢)
- Clear timeline expectations
- Numerical count (matches Searchable)
- Alert for critical items

---

## 📊 Mockup 3: Individual Recommendation Card

### Current State (AIDI)
```
┌───────────────────────────────────────────────┐
│  Add FAQ Schema to Product Pages             │
│                                                │
│  Your product pages lack FAQ schema markup... │
│                                                │
│  Impact: High                                 │
│  Effort: Low                                  │
└───────────────────────────────────────────────┘
```

### New State (Searchable-Inspired)
```
┌─────────────────────────────────────────────────────────────┐
│  🔴 Critical  │  Fix in 2 days                              │
│  ───────────────────────────────────────────────────────── │
│                                                              │
│  Add FAQ Schema to Product Pages                           │
│                                                              │
│  Why this matters:                                          │
│  AI models rely on FAQ schema to extract Q&A pairs for     │
│  direct answers. Without it, your content is invisible to   │
│  ChatGPT and Perplexity.                                    │
│                                                              │
│  Current state: ❌ No FAQ schema detected                   │
│  Target state:  ✅ FAQ schema on 20+ pages                  │
│                                                              │
│  Expected impact:                                            │
│  • +18-24% increase in AI citations                         │
│  • Better ranking in answer engines                         │
│  • Improved structured data score from 45 → 85             │
│                                                              │
│  Quick start guide:                                         │
│  1. Use Google's Schema Markup Generator                    │
│  2. Add to <head> of product pages                          │
│  3. Test with Rich Results Validator                        │
│                                                              │
│  [❓ What's FAQ Schema?]  [📚 Full Guide]  [✓ Mark Done]   │
└─────────────────────────────────────────────────────────────┘
```

**Key Enhancements:**
- Severity badge at top
- Clear timeline
- "Why this matters" explanation
- Current vs target state
- Expected impact (with numbers)
- Quick start steps
- Action buttons (help, guide, mark done)

---

## 📊 Mockup 4: Citations Tracker Tab

### New Feature (Inspired by Searchable Mentions)
```
┌──────────────────────────────────────────────────────────────┐
│  Citations & Mentions                                        │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  Summary Stats:                                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │    12     │  │     9     │  │    #2     │              │
│  │  mentions │  │  positive │  │  avg pos  │              │
│  │  📈 +15%  │  │   75%     │  │           │              │
│  └───────────┘  └───────────┘  └───────────┘              │
│                                                               │
│  Recent Mentions:                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  💬 GPT-4  •  Position #1  •  Oct 15         👍       │  │
│  │  ───────────────────────────────────────────────────  │  │
│  │  Query: "best AI visibility tools for enterprise"     │  │
│  │                                                         │  │
│  │  "AIDI provides comprehensive evaluation using a      │  │
│  │   12-dimension framework tested across multiple       │  │
│  │   frontier models..."                                  │  │
│  │                                                         │  │
│  │  Sentiment: Positive  •  Category: Product Comparison │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  💬 Claude-3  •  Position #3  •  Oct 14      👍       │  │
│  │  ───────────────────────────────────────────────────  │  │
│  │  Query: "AI SEO audit tools comparison"               │  │
│  │                                                         │  │
│  │  "For enterprise clients, AIDI offers systematic      │  │
│  │   evaluation with competitive benchmarking..."        │  │
│  │                                                         │  │
│  │  Sentiment: Positive  •  Category: Recommendation     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  [🔔 Set up alerts]  [📊 Export data]  [📅 View history]   │
└──────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Summary stats with trends
- Platform-specific mentions (GPT-4, Claude, etc.)
- Position tracking (#1, #2, etc.)
- Sentiment indicators (👍 👎)
- Full quote/snippet
- Query context
- Action buttons

---

## 📊 Mockup 5: Quick Scan vs Full Audit Toggle

### Homepage/Onboarding Enhancement
```
┌────────────────────────────────────────────────────────────┐
│  Evaluate Your AI Visibility                               │
│  ─────────────────────────────────────────────────────────│
│                                                             │
│  Choose your evaluation type:                              │
│                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐    │
│  │  ⚡ Quick Scan        │  │  🔬 Full Audit        │    │
│  │                       │  │                       │    │
│  │  2 minutes            │  │  10 minutes           │    │
│  │  4 core dimensions    │  │  12 dimensions        │    │
│  │  $499                 │  │  $2,500               │    │
│  │                       │  │                       │    │
│  │  Perfect for:         │  │  Perfect for:         │    │
│  │  • Quick check-in     │  │  • Strategic planning │    │
│  │  • Initial assessment │  │  • Board reporting    │    │
│  │  • Budget-conscious   │  │  • Competitive intel  │    │
│  │                       │  │                       │    │
│  │  [Start Quick Scan]   │  │  [Start Full Audit]   │    │
│  └───────────────────────┘  └───────────────────────┘    │
│                                                             │
│  Not sure? Start with Quick Scan, upgrade anytime         │
└────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Side-by-side comparison
- Clear time/scope/price
- Use case guidance
- Low-friction entry point

---

## 📊 Mockup 6: Success Modal (After Evaluation)

### New Feature (Inspired by Searchable "Agent Ready" Modal)
```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                      ✅                              │
│                                                       │
│        Your AI Visibility Report is Ready!          │
│                                                       │
│              ┌─────────────────┐                     │
│              │                 │                     │
│              │       C         │                     │
│              │                 │                     │
│              │     67/100      │                     │
│              │                 │                     │
│              └─────────────────┘                     │
│                                                       │
│  We analyzed your brand across 12 dimensions         │
│  and tested with GPT-4, Claude-3, and Gemini Pro.   │
│                                                       │
│  Your report includes:                               │
│  ✓ Competitive benchmarking vs 5 rivals             │
│  ✓ 56 prioritized recommendations                    │
│  ✓ 90-day implementation roadmap                     │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │       View Full Report →                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  [📥 Download PDF]     [🔗 Share Link]              │
│                                                       │
│  ───────────────────────────────────────────────    │
│                                                       │
│  📈 Track changes over time with monthly monitoring  │
│     Starting at $199/month                           │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Key Features:**
- Big checkmark (immediate gratification)
- Score preview (create curiosity)
- Summary of what's included
- Primary CTA (view report)
- Secondary actions (download, share)
- Upsell (monitoring subscription)

---

## 📊 Mockup 7: Dimension Card with Explainer

### Current State (AIDI)
```
┌────────────────────────────────┐
│  Schema & Structured Data      │
│  Score: 45/100                 │
│  Status: Needs Attention       │
└────────────────────────────────┘
```

### Enhanced State (with "Ask AIDI" tooltip)
```
┌─────────────────────────────────────────────────────┐
│  Schema & Structured Data  [❓ What's this?]       │
│  ─────────────────────────────────────────────────  │
│                                                      │
│              45/100                                 │
│         [██████░░░░] 🔴                            │
│                                                      │
│  Status: Needs Immediate Attention                  │
│                                                      │
│  Why it matters:                                    │
│  AI models rely on Schema.org markup to parse      │
│  your pages. Your score of 45 means critical       │
│  information is being missed.                       │
│                                                      │
│  Your vs Industry Average:                          │
│  You:  45/100  [██████░░░░]                        │
│  Avg:  72/100  [██████████████░░] 🟡              │
│                                                      │
│  Quick Win:                                         │
│  💡 Add FAQ schema to your top 10 pages today      │
│     Expected improvement: 45 → 62 (+17 points)     │
│                                                      │
│  [📋 View 9 recommendations]                        │
└─────────────────────────────────────────────────────┘

[When user clicks "What's this?"]
┌────────────────────────────────────────────┐
│  Schema & Structured Data Explained        │
│  ────────────────────────────────────────  │
│                                             │
│  Think of it as "nutrition labels" for     │
│  your website. Schema markup tells AI      │
│  models exactly what each piece of         │
│  content represents.                        │
│                                             │
│  Without it, AI models have to guess -     │
│  and they often guess wrong or skip        │
│  your content entirely.                     │
│                                             │
│  Example:                                   │
│  ❌ Without schema: "Great shoes, $99"     │
│  ✅ With schema: Product=Shoes,            │
│     Price=$99, InStock=Yes,                │
│     Rating=4.5/5                            │
│                                             │
│  💡 Quick Fix:                             │
│  Add FAQ and Product schema to key pages   │
│  using Google's Schema Generator           │
│                                             │
│  [Got it, thanks] [Full Schema Guide →]   │
└────────────────────────────────────────────┘
```

**Key Features:**
- Visual progress bar
- Severity indicator (🔴)
- Industry comparison
- Quick win with expected impact
- Expandable explanation (tooltip)
- Analogies for non-technical users
- Before/after examples
- Action links

---

## 📊 Mockup 8: Competitive Leaderboard (New Feature)

### Searchable Doesn't Have This (Your Advantage)
```
┌──────────────────────────────────────────────────────────────┐
│  SaaS AI Visibility Leaderboard                              │
│  Last updated: October 15, 2025  •  247 brands evaluated    │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  Filter: [SaaS ▼] [All Regions ▼] [Sort by: Score ▼]       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ #  Brand              Score   Grade  Trend  Compare  │  │
│  │ ─────────────────────────────────────────────────────│  │
│  │ 1  HubSpot              94     A     ↑ +3   [View]   │  │
│  │ 2  Salesforce           92     A     →       [View]   │  │
│  │ 3  Zendesk              89     B     ↑ +5   [View]   │  │
│  │ 4  Intercom             87     B     ↓ -2   [View]   │  │
│  │ 5  Slack                85     B     →       [View]   │  │
│  │ ...                                                    │  │
│  │ 47 YOUR COMPANY         67     C     ↑ +1   [View]   │  │ ← Highlighted
│  │ ...                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 Your Position: #47 of 247                       │   │
│  │  Above average, but trailing top competitors        │   │
│  │                                                       │   │
│  │  Gap to #1 (HubSpot): 27 points                     │   │
│  │  To reach top 10: Improve by 18 points              │   │
│  │                                                       │   │
│  │  [📈 View Improvement Plan]                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Want to see your brand here? [Add Your Brand →]            │
└──────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Public leaderboard (lead generation)
- Industry filtering
- Position tracking
- Trend indicators (↑↓→)
- User's brand highlighted
- Gap analysis
- CTA for non-listed brands

---

## 📊 Mockup 9: Navigation with New Tabs

### Current Navigation
```
Dashboard  |  Reports  |  Settings
```

### Enhanced Navigation (Searchable-Inspired)
```
Dashboard  |  Dimensions  |  Citations  |  Competitors  |  Recommendations  |  Reports
```

### Dashboard Layout with Tabs
```
┌──────────────────────────────────────────────────────────────┐
│  AI Discoverability Index                                    │
│                                                               │
│  [Overview] [Dimensions] [Citations] [Competitors] [Actions] │
│  ───────────────────────────────────────────────────────────│
│                                                               │
│  [Content varies based on selected tab]                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Tab Contents:**

**Overview Tab:**
- Overall score + grade
- Top 3 priority actions
- Recent trend
- Quick stats

**Dimensions Tab:**
- All 12 dimension cards
- Radar chart
- Industry comparison
- Filter by pillar

**Citations Tab:**
- Mention tracking
- Platform breakdown
- Sentiment analysis
- Quote library

**Competitors Tab:**
- Side-by-side comparison
- Leaderboard position
- Gap analysis
- Benchmarking charts

**Actions Tab:**
- Recommendations by severity
- Implementation timeline
- Progress tracking
- Mark as done

---

## 📊 Mockup 10: Mobile-Responsive Design

### Priority Summary on Mobile
```
┌─────────────────────────┐
│  Action Items (56)      │
│  ─────────────────────  │
│                          │
│  🔴 Critical        4   │
│  Fix in 2 days          │
│  ─────────────────────  │
│                          │
│  🟠 High            9   │
│  Fix in 2 weeks         │
│  ─────────────────────  │
│                          │
│  🟡 Medium         31   │
│  Fix in 30 days         │
│  ─────────────────────  │
│                          │
│  🟢 Low            12   │
│  Fix in 90 days         │
│  ─────────────────────  │
│                          │
│  [View Critical Items]  │
└─────────────────────────┘
```

---

## 🎨 Color Palette (Consistent with Searchable Style)

### Severity Colors
```css
Critical (Red):    #DC2626  bg-red-600
High (Orange):     #EA580C  bg-orange-600
Medium (Yellow):   #CA8A04  bg-yellow-600
Low (Green):       #16A34A  bg-green-600
```

### Platform Colors
```css
GPT-4:       #10A37F  (OpenAI green)
Claude:      #191919  (Anthropic black)
Gemini:      #4285F4  (Google blue)
Perplexity:  #1A1A1A  (Perplexity black)
```

### Status Colors
```css
Success:     #16A34A  bg-green-600
Warning:     #EA580C  bg-orange-600
Danger:      #DC2626  bg-red-600
Info:        #2563EB  bg-blue-600
Neutral:     #64748B  bg-gray-500
```

---

## ✅ Implementation Checklist

### Phase 1: Visual Enhancements (Week 1)
- [ ] Add platform badges to header
- [ ] Create severity badge component
- [ ] Update recommendation cards with new layout
- [ ] Add progress bars to dimension cards

### Phase 2: New Features (Week 2)
- [ ] Build Citations tracker tab
- [ ] Create success modal
- [ ] Add Quick Scan option
- [ ] Implement priority summary dashboard

### Phase 3: Advanced Features (Month 1)
- [ ] Launch public leaderboard
- [ ] Add competitor comparison tab
- [ ] Implement "Ask AIDI" tooltips
- [ ] Create modular navigation

---

## 🎯 Design Principles

### Learn from Searchable:
1. **Visual Clarity** - Use colors, icons, and spacing generously
2. **Numerical Transparency** - Show exact counts (4 critical, 9 high, etc.)
3. **Progressive Disclosure** - Summary → Details → Deep dive
4. **Action-Oriented** - Every insight has a clear next step
5. **Status Indicators** - Make it obvious what's good, what's not

### Maintain AIDI's Identity:
1. **Executive Polish** - Clean, professional, board-ready
2. **Data Rigor** - Show methodology, confidence levels
3. **Strategic Focus** - Not just what, but why and so what
4. **Competitive Context** - Always show vs industry/competitors
5. **Quantified Impact** - "Improve by X points" "Increase by Y%"

---

**Ready to implement? Start with the Quick Wins guide and use these mockups as design reference.**

**Remember: Copy Searchable's visual clarity, but maintain your executive positioning and data science rigor.**


