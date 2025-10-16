# Industry Reports - Evaluation Flow Wireframes

## User Journey: Evaluation with Sector & Competitor Capture

---

## SCREEN 1: Evaluation Page (Current - Unchanged)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [🧠 AI Discoverability Index]  [Home] [Evaluate] [Reports] [Sign In] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                     Get Your AI Visibility Score                      │
│                                                                       │
│              See how AI assistants discover your brand                │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Enter your website URL                                        │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  https://yourbrand.com                           [Clear] │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │                                                                │  │
│  │  Select Your Plan:                                             │  │
│  │  ○ Free        ● Index Pro (£119)       ○ Enterprise (£319)   │  │
│  │                                                                │  │
│  │                    [ Analyze My Brand → ]                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**User Action**: Enters URL, clicks "Analyze My Brand"

---

## SCREEN 2: Sector & Competitor Form (NEW - Intercept)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [🧠 AI Discoverability Index]  [Home] [Evaluate] [Reports] [Sign In] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                                                                 │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │      Help Us Benchmark Your Brand                         │ │ │
│  │  │  To provide accurate competitive insights, we need to     │ │ │
│  │  │  understand your market position                          │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │  🏢 Evaluating                                            │ │ │
│  │  │  yourbrand.com                                            │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  1. Which industry sector best describes your brand? *         │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │  -- Select your industry --                          [▼] │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │                                                                 │ │
│  │  [When selected, shows description below:]                      │ │
│  │  → "Fashion & Apparel: Sustainable fashion, luxury brands..." │ │
│  │                                                                 │ │
│  │  2. Who are your top 3 direct competitors?                      │ │
│  │  This helps us benchmark you against the right peer group.     │ │
│  │  Enter company names or websites.                              │ │
│  │                                                                 │ │
│  │  ① ┌───────────────────────────────────────────────────────┐  │ │
│  │    │ e.g., competitor1.com or Company Name                 │  │ │
│  │    └───────────────────────────────────────────────────────┘  │ │
│  │                                                                 │ │
│  │  ② ┌───────────────────────────────────────────────────────┐  │ │
│  │    │ Optional                                              │  │ │
│  │    └───────────────────────────────────────────────────────┘  │ │
│  │                                                                 │ │
│  │  ③ ┌───────────────────────────────────────────────────────┐  │ │
│  │    │ Optional                                              │  │ │
│  │    └───────────────────────────────────────────────────────┘  │ │
│  │                                                                 │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │ ✓ Why we ask this                                         │ │ │
│  │  │ • Compare you against the right competitive set           │ │ │
│  │  │ • Show your ranking in industry reports                   │ │ │
│  │  │ • Provide competitor-specific recommendations             │ │ │
│  │  │ • Track your market position over time                    │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  [Skip for now]              [Continue to Analysis →]          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**User Actions**: 
- Selects "Fashion & Apparel"
- Enters: "nike.com", "adidas.com", "patagonia.com"
- Clicks "Continue to Analysis"

---

## SCREEN 3: Evaluation Running (Existing - Enhanced)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [🧠 AI Discoverability Index]  [Home] [Evaluate] [Reports] [Sign In] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                   Analyzing yourbrand.com                             │
│                   Fashion & Apparel                                   │  ← NEW
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                                                                 │ │
│  │                    [■■■■■■■░░░░░] 60%                          │ │
│  │                                                                 │ │
│  │  ✓ Crawling your website                                       │ │
│  │  ✓ Extracting brand information                                │ │
│  │  → Probing 4 AI models                                         │ │
│  │    Checking your visibility vs Nike, Adidas, Patagonia...      │  ← NEW
│  │    □ Analyzing competitive positioning                         │ │
│  │    □ Generating recommendations                                │ │
│  │                                                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  This usually takes 2-3 minutes...                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**System Actions**:
- Saves sector and competitors to database
- Runs standard AIDI evaluation
- Also fetches competitor data from industry reports
- Generates competitive benchmark

---

## SCREEN 4: Results Page (Enhanced with Competitive Context)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [🧠 AI Discoverability Index]  [Home] [Evaluate] [Reports] [Sign In] │
├─────────────────────────────────────────────────────────────────────┤
│  ← Back to Evaluate                                                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Your AIDI Score                                                │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │                         67                                │ │ │
│  │  │                         B                                 │ │ │
│  │  │              Good - Needs Improvement                     │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  📊 YOUR POSITION IN FASHION & APPAREL               [NEW!]   │ │  ← NEW SECTION
│  ├─────────────────────────────────────────────────────────────────┤ │
│  │                                                                 │ │
│  │  Industry Rank: #23 out of 78 brands                           │ │
│  │  Mention Share: 2.4% (Sector avg: 3.1%)                        │ │
│  │                                                                 │ │
│  │  vs. Your Competitors:                                          │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │  1. Nike          #1  ↑  18.5% share    (Beating you)    │ │ │
│  │  │  2. Adidas        #2  ↑  15.3% share    (Beating you)    │ │ │
│  │  │  3. Patagonia     #3  ↑  12.1% share    (Beating you)    │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  Key Insights:                                                  │ │
│  │  • You're 20 ranks behind your closest named competitor        │ │
│  │  • Nike captures 7.7x more AI mentions than you                │ │
│  │  • Your sentiment (0.71) matches Patagonia's (0.73)            │ │
│  │    - This is your advantage vs Nike (0.68)                     │ │
│  │                                                                 │ │
│  │  [View Full Fashion & Apparel Industry Report →]               │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  💡 COMPETITIVE RECOMMENDATIONS                       [NEW!]   │ │  ← NEW SECTION
│  ├─────────────────────────────────────────────────────────────────┤ │
│  │                                                                 │ │
│  │  Priority 1: Close the Authority Gap                           │ │
│  │  Nike's source citation rate (87%) vs yours (34%)              │ │
│  │  → Build authoritative backlinks from fashion publications     │ │
│  │                                                                 │ │
│  │  Priority 2: Own a Niche vs Going Head-to-Head                 │ │
│  │  Nike dominates athletic wear (89% coverage)                   │ │
│  │  → Focus on "sustainable athletic wear" where you rank #8      │ │
│  │                                                                 │ │
│  │  Priority 3: Leverage Your Sentiment Advantage                 │ │
│  │  Your sentiment (0.71) beats Nike (0.68)                       │ │
│  │  → Create content highlighting your differentiators            │ │
│  │                                                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  [Rest of existing AIDI score breakdown...]                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Flow Diagram

```
┌──────────────┐
│ User enters  │
│ URL on       │
│ /evaluate    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐         ┌─────────────────────┐
│ User clicks      │   NO    │ Proceed directly    │
│ "Analyze"        ├────────→│ to evaluation       │
│                  │         └─────────┬───────────┘
└──────┬───────────┘                   │
       │ YES (first time                │
       │  or wants to update)           │
       ▼                                 │
┌──────────────────┐                   │
│ SHOW MODAL:      │                   │
│ Sector &         │                   │
│ Competitor Form  │                   │
└──────┬───────────┘                   │
       │                                 │
       │ User selects sector             │
       │ + enters competitors            │
       │                                 │
       ▼                                 │
┌──────────────────┐                   │
│ Save to DB:      │                   │
│ - evaluation row │                   │
│ - competitor     │                   │
│   relationships  │                   │
└──────┬───────────┘                   │
       │                                 │
       └─────────────┬───────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Run standard │
              │ AIDI eval +  │
              │ competitive  │
              │ benchmark    │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │ Show results │
              │ with sector  │
              │ ranking &    │
              │ vs compets   │
              └──────────────┘
```

---

## Detailed Wireframe: Sector & Competitor Modal

```
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                     [MODAL OVERLAY - CENTERED]                        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ ╔═══════════════════════════════════════════════════════════╗ │ │
│  │ ║           Help Us Benchmark Your Brand                    ║ │ │
│  │ ║  To provide accurate competitive insights, we need to     ║ │ │
│  │ ║  understand your market position                          ║ │ │
│  │ ╚═══════════════════════════════════════════════════════════╝ │ │
│  │                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │  🏢 Evaluating                                          │   │ │
│  │  │  yourbrand.com                                          │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │                                                                 │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │                                                                 │ │
│  │  1. Which industry sector best describes your brand? *         │ │
│  │                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │ -- Select your industry --                          [▼] │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │  [Dropdown options:]                                            │ │
│  │    • Fashion & Apparel                                          │ │
│  │    • Beauty & Personal Care                                     │ │
│  │    • Consumer Electronics & Tech                                │ │
│  │    • Health & Wellness                                          │ │
│  │    • Home & Lifestyle                                           │ │
│  │    • iGaming & Online Entertainment                             │ │
│  │    • Banking & Fintech                                          │ │
│  │    • CPG & FMCG                                                 │ │
│  │    • Politics & Advocacy                                        │ │
│  │    • Mobility & Automotive                                      │ │
│  │    • Hospitality & Travel                                       │ │
│  │                                                                 │ │
│  │  [After selection shows:]                                       │ │
│  │  → Sustainable fashion, luxury brands, affordable clothing...  │ │
│  │                                                                 │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │                                                                 │ │
│  │  2. Who are your top 3 direct competitors?                      │ │
│  │  This helps us benchmark you against the right peer group.     │ │
│  │  Enter company names or websites.                              │ │
│  │                                                                 │ │
│  │  ┌─┐ ┌───────────────────────────────────────────────────────┐ │ │
│  │  │1│ │ nike.com                                              │ │ │
│  │  └─┘ └───────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  ┌─┐ ┌───────────────────────────────────────────────────────┐ │ │
│  │  │2│ │ adidas.com                                            │ │ │
│  │  └─┘ └───────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  ┌─┐ ┌───────────────────────────────────────────────────────┐ │ │
│  │  │3│ │ patagonia.com                                         │ │ │
│  │  └─┘ └───────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │ ✓ We'll show you exactly how you rank against          │   │ │
│  │  │   these competitors in AI recommendations               │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │                                                                 │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │                                                                 │ │
│  │  [Skip for now]              [Continue to Analysis →]          │ │
│  │                              [Enabled when sector selected]     │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Validation**:
- Sector required (button disabled until selected)
- Competitors optional (but recommended)
- If 0 competitors: Confirm dialog "Continue without competitors?"

---

## Enhanced Results Display

### Before (Current)
```
┌──────────────────────────┐
│ Your Score: 67 (B)       │
│                          │
│ Dimensions:              │
│ • Content: 72            │
│ • Authority: 58          │
│ • Technical: 71          │
│ • Platform: 66           │
└──────────────────────────┘
```

### After (With Sector Context)
```
┌─────────────────────────────────────────────────────────────┐
│ Your Score: 67 (B)                                          │
│                                                             │
│ Dimensions:                                                 │
│ • Content: 72      [Sector avg: 65  ↑ You're ahead]       │
│ • Authority: 58    [Sector avg: 71  ↓ Below average]      │
│ • Technical: 71    [Sector avg: 68  ↑ You're ahead]       │
│ • Platform: 66     [Sector avg: 63  ↑ You're ahead]       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📊 YOUR POSITION IN FASHION & APPAREL              [NEW!]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Industry Rank: #23 out of 78 brands                       │
│  Mention Share: 2.4% (vs sector avg 3.1%)                  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ vs. Your Named Competitors:                            │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Nike                                             │ │ │
│  │  │ Rank: #1 ↑  |  Share: 18.5%  |  Sentiment: 0.82 │ │ │
│  │  │ ⚠️  Beating you by 22 ranks                      │ │ │
│  │  │ Gap: Authority (Nike: 94 vs You: 58)             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Adidas                                           │ │ │
│  │  │ Rank: #2 ↑  |  Share: 15.3%  |  Sentiment: 0.78 │ │ │
│  │  │ ⚠️  Beating you by 21 ranks                      │ │ │
│  │  │ Gap: Platform coverage (Adidas: 4/4, You: 2/4)   │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Patagonia                                        │ │ │
│  │  │ Rank: #3 ↑  |  Share: 12.1%  |  Sentiment: 0.91 │ │ │
│  │  │ ⚠️  Beating you by 20 ranks                      │ │ │
│  │  │ Opportunity: Match their sustainability story    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  📈 Your Strengths:                                    │ │
│  │  • Sentiment score (0.71) competitive with top brands │ │
│  │  • Technical SEO strong (71 vs avg 68)                │ │
│  │                                                        │ │
│  │  🎯 Close These Gaps to Compete:                       │ │
│  │  1. Authority Score: +36 points needed (#1 priority)  │ │
│  │  2. Platform Coverage: Get on 2 more AI models        │ │
│  │  3. Mention Share: Need +3.7pp to reach top 10        │ │
│  │                                                        │ │
│  │  [See Detailed Competitive Analysis in Fashion Report]│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

[Rest of standard AIDI results: dimension breakdown, probes, etc.]
```

---

## Mobile View - Sector Form

```
┌─────────────────────────┐
│ [≡]  AIDI      [✕ Close]│
├─────────────────────────┤
│                         │
│ Help Us Benchmark       │
│ Your Brand              │
│                         │
│ 🏢 Evaluating           │
│ yourbrand.com           │
│                         │
│ ─────────────────────── │
│                         │
│ 1. Industry Sector *    │
│                         │
│ ┌─────────────────────┐ │
│ │ Fashion & Apparel[▼]│ │
│ └─────────────────────┘ │
│                         │
│ Sustainable fashion,    │
│ luxury brands...        │
│                         │
│ ─────────────────────── │
│                         │
│ 2. Competitors          │
│                         │
│ ① ┌───────────────────┐│
│   │nike.com           ││
│   └───────────────────┘│
│                         │
│ ② ┌───────────────────┐│
│   │adidas.com         ││
│   └───────────────────┘│
│                         │
│ ③ ┌───────────────────┐│
│   │patagonia.com      ││
│   └───────────────────┘│
│                         │
│ ✓ We'll show you how   │
│   you rank vs these    │
│   competitors          │
│                         │
│ ─────────────────────── │
│                         │
│ [Skip]  [Continue →]    │
│                         │
└─────────────────────────┘
```

---

## Alternative: Inline Form (No Modal)

```
┌─────────────────────────────────────────────────────────────┐
│  Get Your AI Visibility Score                              │
│                                                             │
│  Step 1: Enter Your Website                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ https://yourbrand.com                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Step 2: Select Your Industry                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Fashion & Apparel                                 [▼] │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Step 3: Name Your Top Competitors (Optional)              │
│  ① ┌─────────────────────────────────────────────────────┐│
│    │ nike.com                                            ││
│    └─────────────────────────────────────────────────────┘│
│  ② ┌─────────────────────────────────────────────────────┐│
│    │ adidas.com                                          ││
│    └─────────────────────────────────────────────────────┘│
│  ③ ┌─────────────────────────────────────────────────────┐│
│    │ patagonia.com                                       ││
│    └─────────────────────────────────────────────────────┘│
│                                                             │
│  Step 4: Select Your Plan                                  │
│  ○ Free    ● Index Pro (£119)    ○ Enterprise (£319)      │
│                                                             │
│                [ Analyze My Brand → ]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Which Approach Do You Prefer?

### Option A: Modal (What I Built)
**Pros**: 
- ✅ Doesn't clutter main form
- ✅ Can skip easily
- ✅ Focuses attention

**Cons**:
- ❌ Extra click
- ❌ Could be missed

### Option B: Inline (Alternative)
**Pros**:
- ✅ All in one flow
- ✅ Higher completion rate
- ✅ Simpler UX

**Cons**:
- ❌ Longer form
- ❌ More intimidating

### Option C: Progressive Disclosure
**Flow**:
1. Enter URL
2. Click "Analyze"
3. While analyzing (loading screen), show form
4. "While we're analyzing, help us benchmark you..."

**Pros**:
- ✅ Fills dead time
- ✅ Feels faster
- ✅ High completion

**Which do you prefer?** I can implement any of these approaches.
