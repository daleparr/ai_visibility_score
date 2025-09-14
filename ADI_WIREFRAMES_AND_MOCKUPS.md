
# ADI Dashboard - Wireframes & Component Mockups

## 🎨 Visual Design Mockups

### 1. Executive Snapshot Panel - Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ AI Discoverability Index - Executive Dashboard                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────┐    ┌─────────────────────────────────────────────────────┐ │
│  │                     │    │ PILLAR BREAKDOWN                                    │ │
│  │        ╭─────╮       │    │                                                     │ │
│  │      ╭─╯  78 ╰─╮     │    │ Infrastructure (40%)                               │ │
│  │    ╭─╯   ───   ╰─╮   │    │ ████████████████████████████████████████░░░░░░░░░░ │ │
│  │  ╭─╯    Grade    ╰─╮ │    │ 82% ↗ (+3 vs Q3)                                  │ │
│  │ ╱        B+        ╲│    │                                                     │ │
│  │╱                    ╲│    │ Perception (40%)                                   │ │
│  │╲                    ╱│    │ ████████████████████████████████████░░░░░░░░░░░░░░░ │ │
│  │ ╲                  ╱ │    │ 75% ↘ (-2 vs Q3)                                  │ │
│  │  ╲________________╱  │    │                                                     │ │
│  │                     │    │ Commerce (20%)                                     │ │
│  │ "Visible but not    │    │ ████████████████████████████████████████░░░░░░░░░░ │ │
│  │ competitive in AI   │    │ 77% → (±0 vs Q3)                                  │ │
│  │ recommendations"    │    │                                                     │ │
│  └─────────────────────┘    └─────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │ QUICK STATS                                                                     │ │
│  │ Industry Rank: #12 of 47  │  Percentile: 67th  │  30-day Trend: ↗ +2 pts     │ │
│  │ Category: Streetwear      │  Grade: B+         │  Next Review: Jan 15         │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │ 🚨 ALERTS & OPPORTUNITIES                                                      │ │
│  │ ⚠️  Answer Quality dropped -8pts (likely Gemini update)                        │ │
│  │ 💡 Quick win: Add review schema (+8pts, 2 weeks effort)                       │ │
│  │ 📈 Competitor "Brand X" gained +12pts this month                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Dimension Breakdown - Radar Chart View

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Dimension Analysis - Detailed Breakdown                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────────────────┐ │
│  │                                 │  │ DIMENSION SCORES                            │ │
│  │         Schema (85)             │  │                                             │ │
│  │              ╱│╲                │  │ Schema & Structured Data                    │ │
│  │    Semantic ╱ │ ╲ Knowledge     │  │ ⭐⭐⭐⭐☆ 85/100 [Avg: 72] ✅ Strong        │ │
│  │    Clarity ╱  │  ╲ Graphs       │  │                                             │ │
│  │      (72) ╱   │   ╲ (68)        │  │ Semantic Clarity & Ontology                 │ │
│  │          ╱    │    ╲            │  │ ⭐⭐⭐⭐☆ 72/100 [Avg: 68] ⚠️ Above Avg      │ │
│  │         ╱     │     ╲           │  │                                             │ │
│  │ LLM ────────────────────── AI   │  │ Knowledge Graphs & Entity Linking          │ │
│  │ Read.              Answer       │  │ ⭐⭐⭐☆☆ 68/100 [Avg: 71] ❌ Below Avg      │ │
│  │ (79)               Quality      │  │                                             │ │
│  │         ╲     │     ╱ (82)      │  │ LLM Readability & Conv. Copy               │ │
│  │          ╲    │    ╱            │  │ ⭐⭐⭐⭐☆ 79/100 [Avg: 74] ✅ Strong        │ │
│  │      (71) ╲   │   ╱ (75)        │  │                                             │ │
│  │  Citation  ╲  │  ╱ Reputation   │  │ AI Answer Quality & Presence               │ │
│  │  Authority  ╲ │ ╱  Signals      │  │ ⭐⭐⭐⭐☆ 82/100 [Avg: 69] ✅ Strong        │ │
│  │              ╲│╱                │  │                                             │ │
│  │         Commerce (77)           │  │ Citation Authority & Freshness             │ │
│  │                                 │  │ ⭐⭐⭐⭐☆ 71/100 [Avg: 73] ⚠️ Slight Gap    │ │
│  │ ━━━ Your Brand                  │  │                                             │ │
│  │ ┅┅┅ Category Average            │  │ Reputation Signals                         │ │
│  └─────────────────────────────────┘  │ ⭐⭐⭐⭐☆ 75/100 [Avg: 70] ✅ Above Avg     │ │
│                                       │                                             │ │
│                                       │ Hero Products & Use-Case Retrieval        │ │
│                                       │ ⭐⭐⭐⭐☆ 77/100 [Avg: 65] ✅ Strong        │ │
│                                       │                                             │ │
│                                       │ Policies & Logistics Clarity               │ │
│                                       │ ⭐⭐⭐⭐☆ 74/100 [Avg: 67] ✅ Above Avg     │ │
│                                       └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3. Benchmarking Leaderboard Interface

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Industry Benchmarking & Competitive Analysis                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ┌─ FILTERS ────────────────────────────────────────────────────────────────────────┐ │
│ │ Industry: [Streetwear ▼] Region: [Global ▼] Size: [All ▼] Period: [Current ▼] │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─ YOUR POSITION ──────────────────────────────────────────────────────────────────┐ │
│ │ You're in the TOP 18% of streetwear brands for AI discoverability              │ │
│ │ ████████████████████████████████████████████████████████████████████░░░░░░░░░░░ │ │
│ │ 0%         25%         50%         75%        YOU (82nd %ile)        100%      │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─ LEADERBOARD ────────────────────────────────────────────────────────────────────┐ │
│ │Rank│Brand           │Score│Infra│Perc│Comm│Strength      │Gap           │Badge │ │
│ ├────┼────────────────┼─────┼─────┼────┼────┼──────────────┼──────────────┼──────┤ │
│ │ 1  │Supreme         │ 94  │ 96  │ 93 │ 92 │AI Answers    │-             │🏆    │ │
│ │ 2  │Nike            │ 91  │ 89  │ 94 │ 90 │Authority     │-             │🥇    │ │
│ │ 3  │Adidas          │ 88  │ 92  │ 86 │ 87 │Schema        │-             │🥈    │ │
│ │ 4  │Off-White       │ 86  │ 84  │ 89 │ 85 │Reputation    │-             │🥉    │ │
│ │ 5  │Stone Island    │ 84  │ 87  │ 82 │ 83 │Infrastructure│-             │⭐    │ │
│ │... │...             │ ... │ ... │... │... │...           │...           │...   │ │
│ │11  │Competitor A    │ 79  │ 76  │ 82 │ 78 │Authority     │Schema        │      │ │
│ │12  │🔵 YOUR BRAND   │ 78  │ 82  │ 75 │ 77 │Schema        │Reviews       │      │ │
│ │13  │Competitor B    │ 76  │ 74  │ 79 │ 75 │Authority     │Schema        │      │ │
│ │14  │Competitor C    │ 74  │ 71  │ 78 │ 73 │Reputation    │Commerce      │      │ │
│ └────┴────────────────┴─────┴─────┴────┴────┴──────────────┴──────────────┴──────┘ │
│                                                                                     │
│ ┌─ COMPETITIVE INSIGHTS ───────────────────────────────────────────────────────────┐ │
│ │ 📊 vs Direct Competitors: +2 pts ahead of average                              │ │
│ │ 🎯 Biggest Opportunity: Reviews schema (+8 pts to match leaders)               │ │
│ │ ⚠️  Threat: Competitor A gained +12 pts this quarter                           │ │
│ │ 💡 Quick Win: Hero product optimization (low effort, +5 pts)                   │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4. Quick Actions Panel - Traffic Light System

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Priority Action Plan - Roadmap to Excellence                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ 🔴 IMMEDIATE ACTIONS (2 weeks) - Critical Impact                                   │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 1. Add Review Schema to Product Pages                                          │ │
│ │    ┌─ WHY ──────────────────────────────────────────────────────────────────┐  │ │
│ │    │ Missing on 68% of PDPs, hurting AI answer quality and trust signals   │  │ │
│ │    │ Competitors with reviews score 15+ points higher in AI Answer Quality │  │ │
│ │    └─────────────────────────────────────────────────────────────────────────┘  │ │
│ │    ┌─ STEPS ─────────────────────────────────────────────────────────────────┐  │ │
│ │    │ 1. Audit current schema implementation (2 days)                        │  │ │
│ │    │ 2. Implement Review markup on top 50 products (1 week)                 │  │ │
│ │    │ 3. Test with Google Rich Results and validate (3 days)                 │  │ │
│ │    └─────────────────────────────────────────────────────────────────────────┘  │ │
│ │    📈 Expected Lift: +8 points overall, +15 points AI Answer Quality          │ │
│ │    💰 Revenue Impact: +$180K ARR (3% conversion lift)                         │ │
│ │    ⏱️  Effort: Low (existing review system, just markup needed)                │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ 🟡 SHORT-TERM ACTIONS (30 days) - High Impact                                     │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 2. Optimize Hero Product Descriptions for AI                                   │ │
│ │    ┌─ WHY ──────────────────────────────────────────────────────────────────┐  │ │
│ │    │ AI systems struggle to identify your key products and use cases        │  │ │
│ │    │ Current descriptions are SEO-focused, not AI conversation-optimized    │  │ │
│ │    └─────────────────────────────────────────────────────────────────────────┘  │ │
│ │    ┌─ STEPS ─────────────────────────────────────────────────────────────────┐  │ │
│ │    │ 1. Identify top 10 hero products by revenue and traffic (3 days)       │  │ │
│ │    │ 2. Rewrite descriptions with natural language and use cases (2 weeks)  │  │ │
│ │    │ 3. A/B test new descriptions vs current (1 week)                       │  │ │
│ │    │ 4. Roll out to full catalog based on results (1 week)                  │  │ │
│ │    └─────────────────────────────────────────────────────────────────────────┘  │ │
│ │    📈 Expected Lift: +5 points overall, +12 points Hero Products              │ │
│ │    💰 Revenue Impact: +$120K ARR (2% conversion lift)                         │ │
│ │    ⏱️  Effort: Medium (copywriting and testing required)                       │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ 🟢 STRATEGIC ACTIONS (90 days) - Foundation Building                              │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 3. Build Knowledge Graph Presence                                              │ │
│ │    ┌─ WHY ──────────────────────────────────────────────────────────────────┐  │ │
│ │    │ Competitors have 3x more entity connections in knowledge graphs        │  │ │
│ │    │ Missing from Wikipedia, Wikidata, and industry databases               │  │ │
│ │    └─────────────────────────────────────────────────────────────────────────┘  │ │
│ │    ┌─ STEPS ─────────────────────────────────────────────────────────────────┐  │ │
│ │    │ 1. Create comprehensive Wikipedia presence (4 weeks)                   │  │ │
│ │    │ 2. Add structured data to Wikidata (2 weeks)                           │  │ │
│ │    │ 3. Register with industry databases and directories (4 weeks)          │  │ │
│ │    │ 4. Build relationships with fashion/streetwear entities (ongoing)      │  │ │
│ │    └─────────────────────────────────────────────────────────────────────────┘  │ │
│ │    📈 Expected Lift: +12 points overall, +25 points Knowledge Graphs          │ │
│ │    💰 Revenue Impact: +$300K ARR (5% brand recognition lift)                  │ │
│ │    ⏱️  Effort: High (content creation, relationship building)                   │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─ PROJECTED IMPACT ───────────────────────────────────────────────────────────────┐ │
│ │ Current Score: 78/100 (Grade B+)                                               │ │
│ │ Potential Score: 103/100 → Capped at 95/100 (Grade A)                         │ │
│ │ Total Revenue Impact: +$600K ARR over 12 months                                │ │
│ │ Industry Ranking: #12 → #3-5 (Top 10% territory)                              │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5. Trends & Alerts Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Performance Trends & Alert System                                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ┌─ SCORE TREND (12 MONTHS) ────────────────────────────────────────────────────────┐ │
│ │ ADI Score                                                                       │ │
│ │ 100 ┤                                                                           │ │
│ │  90 ┤     ╭─╮                                                                   │ │
│ │  80 ┤   ╭─╯ ╰─╮     ╭─╮                                                         │ │
│ │  70 ┤ ╭─╯     ╰─╮ ╭─╯ ╰─╮ ← Current: 78                                         │ │
│ │  60 ┤─╯         ╰─╯     ╰─                                                      │ │
│ │  50 ┤                                                                           │ │
│ │     └─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬                                                   │ │
│ │      J F M A M J J A S O N D                                                   │ │
│ │                                                                                 │ │
│ │ Key Events: ▲ Schema update (Mar) ▼ Algorithm change (Oct) ▲ Review launch (Dec)│ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─ ACTIVE ALERTS ──────────────────────────────────────────────────────────────────┐ │
│ │ 🚨 CRITICAL ALERTS                                                              │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ ⚠️  Answer Quality dropped -8pts in 7 days                                  │ │ │
│ │ │    Detected: Dec 15, 2024                                                  │ │ │
│ │ │    Likely Cause: Gemini algorithm update on Dec 12                         │ │ │
│ │ │    Impact: Affecting 23% of brand queries                                  │ │ │
│ │ │    Action: Review top 20 queries and optimize content                      │ │ │
│ │ │    [View Details] [Mark Resolved] [Snooze 7 days]                          │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                                 │ │
│ │ 📈 OPPORTUNITY ALERTS                                                           │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 💡 Quick Win Identified: Review Schema Implementation                       │ │ │
│ │ │    Potential Gain: +8 points overall score                                 │ │ │
│ │ │    Effort Required: Low (2 weeks development)                              │ │ │
│ │ │    Success Rate: 94% (based on similar implementations)                    │ │ │
│ │ │    Revenue Impact: +$180K ARR estimated                                    │ │ │
│ │ │    [Start Implementation] [Learn More] [Dismiss]                            │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                                 │ │
│ │ 🔍 COMPETITIVE ALERTS                                                           │ │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 📊 Competitor "Brand X" gained +12pts this month                           │ │ │
│ │ │    Previous Score: 74 → Current Score: 86                                  │ │ │
│ │ │    Key Improvements: Schema (+8), Authority (+4)                           │ │ │
│ │ │    Threat Level: Medium (now ranks #8 vs your #12)                         │ │ │
│ │ │    Recommendation: Investigate their recent changes                         │ │ │
│ │ │    [Analyze Competitor] [Track Changes] [Dismiss]                           │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─ NOTIFICATION SETTINGS ──────────────────────────────────────────────────────────┐ │
│ │ Email Alerts: [✓] Critical drops (>10 pts)  [✓] Opportunities  [✓] Competitors │ │
│ │ Push Notifications: [✓] Urgent only  [ ] All alerts  [ ] Disabled              │ │
│ │ Frequency: [Daily digest ▼]  Recipients: [admin@yourbrand.com ▼]               │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 📱 Mobile Wireframes

### Mobile Executive Dashboard (375px width)

```
┌─────────────────────────────────────┐
│ ☰ ADI Dashboard            🔔 ⚙️   │
├─────────────────────────────────────┤
│                                     │
│           ╭─────╮                   │
│         ╭─╯  78 ╰─╮                 │
│       ╭─╯   ───   ╰─╮               │
│     ╭─╯    Grade    ╰─╮             │
│    ╱        B+        ╲            │
│   ╱                    ╲           │
│   ╲                    ╱           │
│    ╲                  ╱            │
│     ╲________________╱             │
│                                     │
│ "Visible but not competitive        │
│ in AI recommendations"              │
│                                     │
├─────────────────────────────────────┤
│ PILLARS                             │
│ Infrastructure    82% ↗             │
│ ████████████████████████████░░░░░░░ │
│                                     │
│ Perception       75% ↘              │
│ ████████████████████████░░░░░░░░░░░ │
│                                     │
│ Commerce         77% →              │
│ ████████████████████████████░░░░░░░ │
├─────────────────────────────────────┤
│ QUICK STATS                         │
│ Industry Rank    #12 of 47          │
│ Percentile       67th               │
│ 30-day Trend     ↗ +2 pts           │
├─────────────────────────────────────┤
│ 🚨 TOP ALERT                        │
│ Answer Quality dropped -8pts        │
│ [View Details]                      │
├─────────────────────────────────────┤
│ 💡 QUICK WIN                        │
│ Add review schema (+8pts)           │
│ [Start Now]                         │
├─────────────────────────────────────┤
│ [View Full Analysis]                │
│ [Benchmark Report]                  │
│ [Export PDF]                        │
└─────────────────────────────────────┘
```

### Mobile Dimension Breakdown

```
┌─────────────────────────────────────┐
│ ← Dimension Analysis                │
├─────────────────────────────────────┤
│                                     │
│ Schema & Structured Data            │
│ ⭐⭐⭐⭐☆ 85/100                      │
│ ████████████████████████████████░░░ │
│ Category Avg: 72  [+13 vs avg]     │
│ ✅ Strong performance               │
│ [View Details]                      │
│                                     │
├─────────────────────────────────────┤
│ Semantic Clarity & Ontology         │
│ ⭐⭐⭐⭐☆ 72/100                      │
│ ████████████████████████░░░░░░░░░░░ │
│ Category Avg: 68  [+4 vs avg]      │
│ ⚠️ Above average                    │
│ [View Details]                      │
│                                     │
├─────────────────────────────────────┤
│ Knowledge Graphs & Entity Linking   │
│ ⭐⭐⭐☆☆ 68/100                      │
│ ████████████████████░░░░░░░░░░░░░░░ │
│ Category Avg: 71  [-3 vs avg]      │
│ ❌ Below average                    │
│ [View Details]                      │
│                                     │
├─────────────────────────────────────┤
│ [Continue to next dimensions...]    │
│                                     │
│ ● ● ● ○ ○ ○ ○ ○ ○                  │
│ (3 of 9 dimensions shown)          │
└─────────────────────────────────────┘
```

## 🎨 Component Design System

### Color Specifications

```css
/* ADI Brand Colors */
:root {
  /* Primary Palette */
  --adi-blue: #2563EB;
  --adi-purple: #7C3AED;
  --adi-green: #059669;
  
  /* Score Colors */
  --score-excellent: #10B981;  /* 81-100 */
  --score-good: #F59E0B;       /* 61-80 */
  --score-poor: #EF4444;       /* 0-60 */
  
  /* Pillar Colors */
  --infrastructure: #2563EB;
  --perception: #7C3AED;
  --commerce: #059669;
  
  /* Alert Colors */
  --alert-critical: #DC2626;
  --alert-warning: #D97706;
  --alert-info: #2563EB;
  --alert-success: #059669;
}
```

### Typography Scale

```css
/* ADI Typography System */
.adi-display {
  font-size: 48px;
  line-height: 52px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.adi-h1 {
  font-size: 36px;
  line-height: 40px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.adi-h2 {
  font-size: 24px;
  line-height: 28px;
  font-weight: 600;
}

.adi-h3 {
  font-size