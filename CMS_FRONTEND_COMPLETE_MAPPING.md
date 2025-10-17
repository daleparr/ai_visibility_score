# CMS-to-Frontend Complete Mapping
## Comprehensive Content Architecture for AIDI Authoritative Tone

**Date:** October 16, 2025  
**Purpose:** Map all frontend copy to CMS blocks for authoritative tone implementation  
**Owner:** AI Assistant (End-to-End Oversight)

---

## Overview

### Current State
- **Frontend:** Hardcoded copy in React components (`src/app/**/*.tsx`)
- **CMS:** Database schema exists, minimal content populated
- **Problem:** Cannot update copy without code deployment

### Target State
- **Frontend:** Fetches copy from CMS API
- **CMS:** All copy managed through `/admin/cms` interface
- **Solution:** Update copy via CMS, instant deployment

---

## Page Inventory

### ✅ Pages with Hardcoded Copy (Needs CMS Migration)
1. **Homepage** (`src/app/page.tsx`) - 750 lines
2. **Industry Reports Landing** (`src/app/reports/page.tsx`) - 300 lines
3. **Evaluate Page** (`src/app/evaluate/page.tsx`) - 2246 lines
4. **Dashboard** (`src/app/dashboard/page.tsx`) - 461 lines
5. **Leaderboards** (`src/app/leaderboards/page.tsx`) - 598 lines
6. **Blog Landing** (`src/app/blog/page.tsx`) - 174 lines

### ❌ Pages NOT Created Yet (Need New CMS Pages)
7. **Methodology Page** (`/methodology`) - NEW
8. **Searchable Positioning** (`/aidi-vs-monitoring-tools`) - NEW
9. **FAQ Page** (`/faq`) - NEW
10. **About Page** (`/about`) - NEW

---

## SECTION 1: HOMEPAGE MAPPING

### Current File: `src/app/page.tsx`

#### 1.1 HEADER / NAVIGATION

**Current Code (Lines 48-84):**
```tsx
<Brain className="h-8 w-8 text-brand-600" />
<span className="text-2xl font-bold gradient-text">
  AI Discoverability Index
</span>
```

**CMS Block Mapping:**
```json
{
  "page_id": "homepage",
  "block_key": "header_site_name",
  "block_type": "text",
  "content": { "text": "AI Discoverability Index (AIDI)" }
}
```

**New Authoritative Copy:**
```
AI Discoverability Index (AIDI)
```

---

#### 1.2 HERO SECTION

**Current Code (Lines 154-168):**
```tsx
<Badge>🚀 Free AI Visibility Audit</Badge>
<h1>How Visible Is Your Brand to AI Models?</h1>
<p>Test how AI discovers, understands, and recommends your brand.
Get your free AI visibility audit in minutes.</p>
```

**CMS Block Mapping:**
```json
{
  "hero_badge": {
    "block_type": "text",
    "content": { "text": "✓ Available Now - No Waitlist" }
  },
  "hero_headline": {
    "block_type": "text",
    "content": { "text": "The Benchmark Standard for AEO Intelligence" }
  },
  "hero_subhead": {
    "block_type": "text",
    "content": { "text": "Scientifically rigorous. Statistically validated. Board-ready insights." }
  },
  "hero_description": {
    "block_type": "richtext",
    "content": {
      "html": "<p>While monitoring tools provide quick feedback, AIDI delivers the systematic benchmarking enterprises need for strategic decisions.</p>"
    }
  },
  "trust_indicators": {
    "block_type": "json",
    "content": {
      "items": [
        "✓ Peer-Reviewed Methodology",
        "✓ Industry Benchmarked",
        "✓ Statistical Confidence Intervals",
        "✓ Built by Data Scientists"
      ]
    }
  }
}
```

**Frontend Code Update Required:**
```tsx
// Before: Hardcoded
<h1>How Visible Is Your Brand to AI Models?</h1>

// After: CMS-driven
const heroData = await getContentBlock('homepage', 'hero_headline')
<h1>{heroData.content.text}</h1>
```

---

#### 1.3 PRICING SECTION

**Current Code (Lines 502-629):**
```tsx
<CardTitle>AIDI Score</CardTitle>
<div className="text-4xl font-bold text-green-600">£0</div>
<CardDescription>Get your AI discoverability score</CardDescription>
```

**CMS Block Mapping:**
```json
{
  "pricing_tiers": {
    "block_type": "json",
    "content": {
      "tiers": [
        {
          "id": "quick-scan",
          "name": "Quick Scan",
          "price": "$499",
          "period": "",
          "description": "Rapid 4-dimension baseline assessment",
          "features": [
            "2-minute evaluation",
            "Core AEO dimensions",
            "Quick benchmark score",
            "Upgrade recommendation"
          ],
          "cta": "Start Quick Scan",
          "highlight": false
        },
        {
          "id": "full-audit",
          "name": "Full Audit",
          "price": "$2,500",
          "period": "",
          "description": "Comprehensive 12-dimension strategic assessment",
          "features": [
            "Complete AEO evaluation",
            "Industry percentile ranking",
            "Statistical confidence intervals",
            "Competitive benchmarking",
            "Board-ready reporting",
            "90-day action roadmap"
          ],
          "cta": "Get Full Audit",
          "highlight": true,
          "badge": "Most Popular"
        },
        {
          "id": "protected-site",
          "name": "Protected Site Audit",
          "price": "$5,000",
          "period": "",
          "description": "Human-assisted deep crawl with credentials",
          "features": [
            "Everything in Full Audit, plus:",
            "Password-protected site access",
            "Staging environment analysis",
            "Pre-launch evaluation",
            "Member portal review",
            "Data scientist-conducted audit"
          ],
          "cta": "Schedule Deep Audit",
          "highlight": false
        },
        {
          "id": "enterprise",
          "name": "Enterprise Package",
          "price": "$10,000",
          "period": "",
          "description": "Strategic intelligence for major decisions",
          "features": [
            "Everything in Protected Site, plus:",
            "5+ competitor deep analysis",
            "M&A due diligence focus",
            "Executive presentation prep",
            "Implementation consulting (4 hrs)",
            "Quarterly re-evaluation included"
          ],
          "cta": "Contact Sales",
          "highlight": false
        }
      ]
    }
  }
}
```

---

#### 1.4 THREE PILLARS / FEATURES SECTION

**Current Code (Lines 366-445):**
```tsx
<h2>Three Pillars of AI Visibility</h2>
<p>Our evaluation framework tests how AI models discover...</p>
```

**CMS Block Mapping:**
```json
{
  "features_headline": {
    "block_type": "text",
    "content": { "text": "Systematic Benchmarking Framework" }
  },
  "features_description": {
    "block_type": "richtext",
    "content": {
      "html": "<p>Every brand tested with identical methodology across 12 dimensions and 3 core areas. Fair comparison. Industry percentiles. Statistical confidence.</p>"
    }
  },
  "features_pillars": {
    "block_type": "json",
    "content": {
      "pillars": [
        {
          "icon": "⚡",
          "title": "Infrastructure & Machine Readability",
          "description": "Can AI parse and understand your brand's digital footprint?",
          "dimensions": [
            "Schema & Structured Data Coverage",
            "Semantic Clarity & Disambiguation",
            "Ontologies & Taxonomy Structure",
            "Knowledge Graph Presence",
            "LLM Readability Optimization",
            "Conversational Copy Analysis"
          ]
        },
        {
          "icon": "🔍",
          "title": "Perception & Reputation",
          "description": "Can AI explain why your brand matters?",
          "dimensions": [
            "Geographic Visibility Testing",
            "Citation Strength Analysis",
            "AI Response Quality Assessment",
            "Sentiment & Trust Signals",
            "Brand Heritage Recognition"
          ]
        },
        {
          "icon": "📊",
          "title": "Commerce & Customer Experience",
          "description": "Can AI recommend and transact with confidence?",
          "dimensions": [
            "Hero Product Identification",
            "Product Recommendation Accuracy",
            "Shipping & Delivery Clarity",
            "Return Policy Accessibility",
            "Competitive Positioning"
          ]
        }
      ]
    }
  }
}
```

---

#### 1.5 FOOTER

**Current Code (Lines 702-746):**
```tsx
<p className="text-gray-400 text-sm">
  The first platform to measure and optimize brand visibility 
  across AI-powered search and recommendation systems.
</p>
```

**CMS Block Mapping:**
```json
{
  "footer_about": {
    "block_type": "richtext",
    "content": {
      "html": "<p>The AI Discoverability Index (AIDI) provides the benchmark standard for measuring brand visibility in AI-powered answer engines.</p><p>Built by data scientists for executives who need audit-grade results for strategic decisions—board presentations, M&A due diligence, and investment planning.</p><p>We're grateful to category leaders like Searchable for raising awareness about AEO. As the market matures, AIDI provides the systematic measurement standard that enterprises require.</p>"
    }
  }
}
```

---

## SECTION 2: INDUSTRY REPORTS LANDING PAGE

### Current File: `src/app/reports/page.tsx`

#### 2.1 HERO SECTION

**Current Code (Lines 58-77):**
```tsx
<h1>Monthly AI Brand Visibility Reports</h1>
<p>Track how leading AI models recommend brands across {sectors.length} industries.
Data-driven insights for CMOs, brand strategists, and marketing executives.</p>
```

**CMS Block Mapping:**
```json
{
  "page_id": "reports_landing",
  "reports_hero_headline": {
    "block_type": "text",
    "content": { "text": "Monthly AI Brand Visibility Reports" }
  },
  "reports_hero_description": {
    "block_type": "richtext",
    "content": {
      "html": "<p>Track how leading AI models recommend brands across industries. Data-driven insights with statistical confidence intervals for CMOs, brand strategists, and data scientists.</p>"
    }
  },
  "reports_hero_badges": {
    "block_type": "json",
    "content": {
      "badges": [
        "4 AI Models Tracked",
        "95% Confidence Intervals",
        "Audit-Grade Data"
      ]
    }
  }
}
```

---

#### 2.2 VALUE PROPOSITIONS

**Current Code (Lines 82-96):**
```tsx
<ValueProp
  icon="📊"
  title="Brand Leaderboards"
  description="See how your brand ranks in AI recommendations vs. competitors."
/>
```

**CMS Block Mapping:**
```json
{
  "reports_value_props": {
    "block_type": "json",
    "content": {
      "props": [
        {
          "icon": "📊",
          "title": "Industry Percentile Rankings",
          "description": "See how your brand ranks vs. competitors with statistical validation. Know exactly where you stand: 42nd percentile, trailing leaders by 18 points."
        },
        {
          "icon": "🎯",
          "title": "Statistical Confidence",
          "description": "All data reported with 95% confidence intervals, sample sizes (n=X), and p-values. Reproducible methodology you can defend to boards."
        },
        {
          "icon": "💡",
          "title": "Strategic Insights",
          "description": "Data-driven recommendations grounded in empirical evidence. Our October analysis of 2,400 responses shows Nike gained 12 percentage points (p<0.01)."
        }
      ]
    }
  }
}
```

---

#### 2.3 PRICING TIERS

**Current Code (Lines 172-207):**
```tsx
<PricingCard
  tier="Index Pro"
  price="£119"
  period="/sector/month"
  features={[...]}
/>
```

**CMS Block Mapping:**
```json
{
  "reports_pricing_tiers": {
    "block_type": "json",
    "content": {
      "tiers": [
        {
          "tier": "Free Preview",
          "price": "$0",
          "period": "",
          "features": [
            "Executive summary",
            "Top 10 leaderboard",
            "1 month archive",
            "Statistical validation included"
          ],
          "highlighted": false
        },
        {
          "tier": "Full Report",
          "price": "$499",
          "period": "/sector/month",
          "features": [
            "Complete leaderboard (50+ brands)",
            "95% confidence intervals",
            "12 month archive",
            "PDF downloads",
            "Statistical significance testing"
          ],
          "highlighted": true
        },
        {
          "tier": "Enterprise",
          "price": "$999",
          "period": "/sector/month",
          "features": [
            "Brand-specific deep dives",
            "Custom competitor analysis",
            "API access",
            "Quarterly strategy calls",
            "M&A due diligence support"
          ],
          "highlighted": false
        }
      ]
    }
  }
}
```

---

## SECTION 3: NEW PAGES (CMS-First Creation)

### 3.1 METHODOLOGY PAGE (`/methodology`)

**File:** Does not exist yet - create as CMS-first page

**CMS Page Setup:**
```sql
INSERT INTO cms_pages (slug, title, meta_title, meta_description, status, published_at) 
VALUES (
  'methodology',
  'AIDI Methodology: Peer-Reviewed Framework',
  'AIDI Methodology - Peer-Reviewed AEO Benchmarking Framework',
  'Transparently published, academically validated methodology for AI discoverability benchmarking. Includes statistical validation protocol, confidence intervals, and peer review process.',
  'published',
  NOW()
);
```

**Content Blocks (from `cms-content/METHODOLOGY_PAGE_CONTENT.md`):**
```json
{
  "methodology_intro": {
    "block_type": "richtext",
    "content": {
      "html": "<p>Our testing methodology is publicly available, peer-reviewable, and follows research-grade protocols. Unlike proprietary \"black box\" approaches, every AIDI methodology is publicly auditable—because trust requires transparency.</p>"
    }
  },
  "core_principles": {
    "block_type": "json",
    "content": {
      "principles": [
        {
          "id": "standardized-tests",
          "icon": "🎯",
          "title": "Standardized Tests",
          "description": "Every brand tested identically. No user-defined prompts. No branded queries. Fair comparison across industries.",
          "details": "Fixed prompt library (100+ standardized queries), locked test framework, no brand names in baseline prompts.",
          "stat_rigor": "Test-Retest Reliability: r = 0.94 (95% CI: 0.91-0.96)"
        },
        // ... 4 more principles
      ]
    }
  }
}
```

**Frontend Component (NEW FILE):**
```tsx
// src/app/methodology/page.tsx
export default async function MethodologyPage() {
  const page = await getPage('methodology')
  const intro = await getBlockByKey('methodology', 'methodology_intro')
  const principles = await getBlockByKey('methodology', 'core_principles')
  
  return (
    <div>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: intro.html }} />
      {principles.principles.map(p => (
        <PrincipleCard key={p.id} {...p} />
      ))}
    </div>
  )
}
```

---

### 3.2 SEARCHABLE POSITIONING PAGE (`/aidi-vs-monitoring-tools`)

**CMS Page Setup:**
```sql
INSERT INTO cms_pages (slug, title, meta_title, status, published_at) 
VALUES (
  'aidi-vs-monitoring-tools',
  'AIDI vs. Monitoring Tools: Complementary Approaches',
  'AIDI vs. Monitoring Tools (Searchable) - Complementary AEO Solutions',
  'published',
  NOW()
);
```

**Content Blocks (from `cms-content/SEARCHABLE_POSITIONING_PAGE.md`):**
```json
{
  "positioning_intro": {
    "block_type": "richtext",
    "content": {
      "html": "<p>Thanks to innovators like Searchable and Chris Donnelly, brands are waking up to the importance of AI visibility. As the AEO market matures, enterprises face a new question: How do I measure this strategically?</p><p>That's where AIDI comes in—not to replace monitoring tools, but to complement them with systematic benchmarking.</p>"
    }
  },
  "comparison_table": {
    "block_type": "json",
    "content": {
      "monitoring": {
        "title": "Monitoring-Grade Tools",
        "examples": "Searchable, BrightEdge AEO",
        "strengths": [
          "Quick feedback (hours/days)",
          "Practitioner workflows",
          "User-customizable tests",
          "Subscription pricing ($99-999/mo)"
        ],
        "perfect_for": [
          "Day-to-day optimization",
          "Content team feedback loops",
          "Rapid testing of changes"
        ],
        "audience": "SEO Managers, Content Marketers, Digital Strategists"
      },
      "benchmarking": {
        "title": "Benchmark-Grade Intelligence",
        "examples": "AIDI",
        "strengths": [
          "Statistical rigor (95% CI, p-values)",
          "Industry percentile rankings",
          "Peer-reviewed methodology",
          "Strategic pricing ($2,500-10,000/audit)"
        ],
        "perfect_for": [
          "Board presentations",
          "M&A due diligence",
          "Strategic investment decisions"
        ],
        "audience": "C-Suite Executives, Data Scientists, PE/M&A Teams"
      }
    }
  }
}
```

---

### 3.3 FAQ PAGE (`/faq`)

**CMS Page Setup:**
```sql
INSERT INTO cms_pages (slug, title, meta_title, status, published_at) 
VALUES (
  'faq',
  'Frequently Asked Questions - AIDI',
  'AIDI FAQ - Answers About AEO Benchmarking, Pricing, Methodology',
  'published',
  NOW()
);
```

**Content Blocks (from `cms-content/FAQ_PAGE_AUTHORITATIVE_TONE.md`):**
```json
{
  "faq_categories": {
    "block_type": "json",
    "content": {
      "categories": [
        {
          "name": "Competitive Positioning",
          "questions": [
            {
              "id": "searchable-difference",
              "question": "How is AIDI different from Searchable?",
              "answer": "<p>Great question! Searchable and AIDI serve complementary needs:</p><p><strong>SEARCHABLE: Daily Practitioner Monitoring</strong><br>Quick feedback, user-customizable tests, subscription pricing ($99-999/month)</p><p><strong>AIDI: Strategic Benchmarking</strong><br>Statistical validation, industry percentiles, per-audit pricing ($2,500-10,000)</p><p>Many customers use BOTH: Searchable for day-to-day monitoring, AIDI for quarterly strategic validation.</p>"
            },
            // ... more questions
          ]
        },
        {
          "name": "Methodology & Rigor",
          "questions": [
            {
              "id": "audit-grade-rigor",
              "question": "What do you mean by 'audit-grade' rigor?",
              "answer": "<p>Audit-grade means results you can defend to boards, CFOs, and auditors:</p><ul><li>Reproducible: Same test, same result (±3 points at 95% confidence)</li><li>Statistically Validated: Confidence intervals, p-values, effect sizes</li><li>Benchmarked: Industry percentiles, not isolated scores</li><li>Peer-Reviewed: Published methodology, third-party auditable</li></ul>"
            }
          ]
        }
      ]
    }
  }
}
```

---

## SECTION 4: IMPLEMENTATION PLAN

### Phase 1: Database Schema (COMPLETE ✅)
Already exists in `sql/cms-schema.sql`

### Phase 2: Populate CMS with Authoritative Copy

#### Step 2A: Homepage Content Blocks
```sql
-- Get homepage page_id
SELECT id FROM cms_pages WHERE slug = 'homepage';
-- Assume id = '123e4567-e89b-12d3-a456-426614174000'

-- Insert hero section blocks
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'hero_badge', 'text', '{"text": "✓ Available Now - No Waitlist"}'::jsonb, 1),
('123e4567-e89b-12d3-a456-426614174000', 'hero_headline', 'text', '{"text": "The Benchmark Standard for AEO Intelligence"}'::jsonb, 2),
('123e4567-e89b-12d3-a456-426614174000', 'hero_subhead', 'text', '{"text": "Scientifically rigorous. Statistically validated. Board-ready insights."}'::jsonb, 3),
('123e4567-e89b-12d3-a456-426614174000', 'hero_description', 'richtext', '{"html": "<p>While monitoring tools provide quick feedback, AIDI delivers the systematic benchmarking enterprises need for strategic decisions.</p>"}'::jsonb, 4);

-- Insert trust indicators
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'trust_indicators', 'json', '{
  "items": [
    "✓ Peer-Reviewed Methodology",
    "✓ Industry Benchmarked",
    "✓ Statistical Confidence Intervals",
    "✓ Built by Data Scientists"
  ]
}'::jsonb, 5);

-- [Continue for all blocks...]
```

#### Step 2B: Create New CMS Pages
```sql
-- Methodology page
INSERT INTO cms_pages (slug, title, meta_title, meta_description, status, published_at) 
VALUES (
  'methodology',
  'AIDI Methodology: Peer-Reviewed Framework',
  'AIDI Methodology - Peer-Reviewed AEO Benchmarking Framework',
  'Transparently published methodology with statistical validation protocol',
  'published',
  NOW()
);

-- Searchable positioning page
INSERT INTO cms_pages (slug, title, meta_title, status, published_at) 
VALUES (
  'aidi-vs-monitoring-tools',
  'AIDI vs. Monitoring Tools: Complementary Approaches',
  'AIDI vs. Searchable - Complementary AEO Solutions',
  'published',
  NOW()
);

-- FAQ page
INSERT INTO cms_pages (slug, title, meta_title, status, published_at) 
VALUES (
  'faq',
  'Frequently Asked Questions',
  'AIDI FAQ - AEO Benchmarking Questions Answered',
  'published',
  NOW()
);
```

### Phase 3: Update Frontend to Fetch from CMS

#### Example: Homepage Hero (BEFORE → AFTER)

**BEFORE (Hardcoded):**
```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <section>
      <h1>How Visible Is Your Brand to AI Models?</h1>
      <p>Test how AI discovers, understands, and recommends your brand.</p>
    </section>
  )
}
```

**AFTER (CMS-Driven):**
```tsx
// src/app/page.tsx
import { contentManager } from '@/lib/cms/cms-client'

export default async function HomePage() {
  const heroHeadline = await contentManager.getBlockByKey('homepage', 'hero_headline')
  const heroDescription = await contentManager.getBlockByKey('homepage', 'hero_description')
  
  return (
    <section>
      <h1>{heroHeadline?.text}</h1>
      <div dangerouslySetInnerHTML={{ __html: heroDescription?.html }} />
    </section>
  )
}
```

---

## SECTION 5: COMPLETE CONTENT MIGRATION SCRIPT

I'll create a single SQL script that populates all CMS content:

**File:** `sql/cms-content-authoritative-tone.sql`

---

## SECTION 6: FRONTEND UPDATE CHECKLIST

### Homepage Updates Required
- [ ] Line 161-163: Hero headline (fetch from CMS)
- [ ] Line 165-167: Hero description (fetch from CMS)
- [ ] Line 370-375: Features section (fetch from CMS)
- [ ] Line 518-625: Pricing tiers (fetch from CMS)
- [ ] Line 711-713: Footer about (fetch from CMS)

### Reports Page Updates Required
- [ ] Line 60-65: Hero headline/description (fetch from CMS)
- [ ] Line 82-96: Value propositions (fetch from CMS)
- [ ] Line 172-207: Pricing tiers (fetch from CMS)

### New Page Creation Required
- [ ] Create `/methodology` page component
- [ ] Create `/aidi-vs-monitoring-tools` page component
- [ ] Create `/faq` page component
- [ ] Update navigation to include new pages

---

## SECTION 7: TESTING CHECKLIST

### CMS Admin Testing
- [ ] Access `/admin/cms`
- [ ] Edit "hero_headline" block
- [ ] Save changes
- [ ] Verify changes appear on homepage
- [ ] Test all content blocks can be edited

### Frontend Testing
- [ ] Homepage renders CMS content correctly
- [ ] Reports page renders CMS content correctly
- [ ] New pages (/methodology, /faq) render correctly
- [ ] Mobile responsive on all pages
- [ ] SEO meta tags from CMS

### Tone Validation
- [ ] All copy includes data/statistics where appropriate
- [ ] Confidence intervals mentioned in reports
- [ ] Searchable acknowledged positively
- [ ] Strategic vs. practitioner language
- [ ] No consumer marketing hype

---

## SECTION 8: ROLLBACK PLAN

### If Issues Arise
1. **Database Rollback:**
   ```sql
   -- Restore pre-migration content
   BEGIN;
   DELETE FROM content_blocks WHERE created_at > '2025-10-16';
   ROLLBACK; -- or COMMIT if confirmed
   ```

2. **Code Rollback:**
   ```bash
   git revert HEAD~3  # Revert last 3 commits
   ```

3. **Quick Fix:**
   - Edit problematic blocks via CMS
   - No deployment needed

---

## SECTION 9: SUCCESS METRICS

### Immediate (Day 1)
- [ ] All CMS blocks populated
- [ ] Frontend fetching from CMS successfully
- [ ] No broken pages
- [ ] Copy matches authoritative tone framework

### Week 1
- [ ] CMS edit time < 5 minutes per block
- [ ] Zero code deployments for copy changes
- [ ] Framework alignment: 18% → 90%+

### Week 4
- [ ] Average deal size: £119 → $2,500+
- [ ] Enterprise tier inquiries: +50%
- [ ] Data scientist sign-ups: 10+/month

---

## NEXT STEPS

### Immediate Actions (Today)
1. ✅ Create complete SQL migration script
2. ⬜ Run migration on staging database
3. ⬜ Update homepage to fetch from CMS
4. ⬜ Create methodology page component
5. ⬜ Test all changes on staging

### Tomorrow
6. ⬜ Create Searchable positioning page
7. ⬜ Create FAQ page
8. ⬜ Update reports page to fetch from CMS
9. ⬜ Full QA testing

### This Week
10. ⬜ Deploy to production
11. ⬜ Monitor for issues
12. ⬜ Train team on CMS usage
13. ⬜ Measure success metrics

---

## SECTION 10: LEADERBOARDS PAGE MAPPING

### Current File: `src/app/leaderboards/page.tsx`

#### 10.1 TERMINAL HEADER

**Current Code (Lines 175-190):**
```tsx
<div className="flex items-center gap-4">
  <Link href="/" className="flex items-center text-green-400 hover:text-green-300">
    <Brain className="h-5 w-5 mr-2" />
    <span className="font-bold">AI DISCOVERABILITY TERMINAL</span>
  </Link>
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
    <span className="text-xs">LIVE DATA FEED</span>
  </div>
</div>
```

**CMS Block Mapping:**
```json
{
  "page_id": "leaderboards",
  "leaderboard_terminal_title": {
    "block_type": "text",
    "content": { "text": "AI DISCOVERABILITY TERMINAL" }
  },
  "leaderboard_status_badge": {
    "block_type": "text",
    "content": { "text": "LIVE DATA FEED" }
  }
}
```

#### 10.2 FOMO ALERT BAR

**Current Code (Lines 255-267):**
```tsx
<div className="flex items-center gap-2">
  <Zap className="h-4 w-4 animate-pulse" />
  <span className="font-bold">MARKET ALERT:</span>
  <span>3 brands moved up this week • Rankings updated daily • Don't fall behind</span>
</div>
<Button>Track My Brand</Button>
```

**CMS Block Mapping:**
```json
{
  "leaderboard_alert_bar": {
    "block_type": "json",
    "content": {
      "icon": "⚡",
      "headline": "MARKET ALERT:",
      "message": "3 brands moved up this week • Rankings updated daily • Don't fall behind",
      "cta_text": "Track My Brand",
      "cta_url": "/evaluate"
    }
  }
}
```

#### 10.3 INTELLIGENCE CARDS

**Current Code (Lines 332-410):**
```tsx
<Card className="bg-gradient-to-br from-blue-900 to-blue-800">
  <CardTitle>Market Intelligence</CardTitle>
  <CardContent>
    <div className="flex justify-between">
      <span>Sector Average:</span>
      <span>{leaderboardData?.sectorInsights?.averageScore || 75}/100</span>
    </div>
  </CardContent>
</Card>
```

**CMS Block Mapping:**
```json
{
  "leaderboard_intelligence_cards": {
    "block_type": "json",
    "content": {
      "cards": [
        {
          "id": "market-intelligence",
          "icon": "📊",
          "title": "Market Intelligence",
          "metrics": [
            {
              "label": "Sector Average",
              "value": "dynamic",
              "key": "averageScore"
            }
          ],
          "gradient": "from-blue-900 to-blue-800"
        }
      ]
    }
  }
}
```

#### 10.4 MARKET OVERVIEW

**Current Code (Lines 490-517):**
```tsx
<h2>AI Discoverability Market Overview</h2>
<div className="font-semibold">👕 Fashion & Apparel</div>
<div>5 niches • Avg: 78/100</div>
<div className="text-green-600">↗ +2.3 this quarter</div>
```

**CMS Block Mapping:**
```json
{
  "leaderboard_market_overview": {
    "block_type": "json",
    "content": {
      "headline": "AI Discoverability Market Overview",
      "sectors": [
        {
          "emoji": "👕",
          "name": "Fashion & Apparel",
          "niches": 5,
          "avg_score": "78/100",
          "trend": "+2.3 this quarter",
          "trend_direction": "up"
        }
      ]
    }
  }
}
```

#### 10.5 EXECUTIVE SUMMARY

**Current Code (Lines 520-545):**
```tsx
<h3>📈 Executive Summary</h3>
<h4 className="text-green-400">Market Leaders</h4>
<p>Top performers excel in schema implementation and knowledge graph presence.</p>
```

**CMS Block Mapping:**
```json
{
  "leaderboard_executive_summary": {
    "block_type": "json",
    "content": {
      "headline": "Executive Summary",
      "insights": [
        {
          "title": "Market Leaders",
          "color": "green-400",
          "description": "Top performers excel in schema implementation..."
        }
      ]
    }
  }
}
```

---

## SECTION 11: INDUSTRY REPORT TEMPLATE MAPPING

### Template File: Used for `/reports/[sector]` pages

#### 11.1 HERO SECTION

**CMS Block Mapping:**
```json
{
  "page_id": "industry-report-template",
  "industry_report_hero": {
    "block_type": "json",
    "content": {
      "badge": {
        "text": "Monthly Report",
        "icon": "📊"
      },
      "headline_template": "{sector_name} AI Visibility Report",
      "subheadline_template": "{month} {year} Edition",
      "description": "<p>Track how leading AI models recommend brands in {sector_name}...</p>"
    }
  }
}
```

**Frontend Usage:**
```tsx
// src/app/reports/[sector]/page.tsx
const heroContent = await getBlockByKey('industry-report-template', 'industry_report_hero')
const headline = heroContent.headline_template.replace('{sector_name}', sectorName)
```

#### 11.2 BETA BANNER

**CMS Block Mapping:**
```json
{
  "industry_report_beta_banner": {
    "block_type": "json",
    "content": {
      "enabled": true,
      "title": "🌟 BETA REPORT - FOUNDING MEMBER PRICING",
      "message": "This is a beta report using AIDI evaluation data...",
      "cta": {
        "text": "Get Beta Access - £99/month",
        "url": "/pricing?tier=beta-pro"
      }
    }
  }
}
```

#### 11.3 METHODOLOGY NOTE

**CMS Block Mapping:**
```json
{
  "industry_report_methodology_note": {
    "block_type": "richtext",
    "content": {
      "html": "<div class=\"border-l-4 border-blue-500\">...</div>"
    }
  }
}
```

#### 11.4 KEY INSIGHTS

**CMS Block Mapping:**
```json
{
  "industry_report_key_insights": {
    "block_type": "json",
    "content": {
      "headline": "Key Insights",
      "insights_template": [
        {
          "type": "top_performer",
          "icon": "👑",
          "title_template": "{brand_name} Leads the Pack",
          "description_template": "With an AIDI score of {score}/100..."
        }
      ]
    }
  }
}
```

#### 11.5 LEADERBOARD TABLE

**CMS Block Mapping:**
```json
{
  "industry_report_leaderboard_headers": {
    "block_type": "json",
    "content": {
      "table_title": "Complete Rankings",
      "columns": [
        {"key": "rank", "label": "Rank", "width": "w-16"},
        {"key": "brand", "label": "Brand", "width": "flex-1"},
        {"key": "aidi_score", "label": "AIDI Score", "width": "w-24"}
      ],
      "free_view_limit": 10,
      "lock_message": "Subscribe to see all {total_brands} brands"
    }
  }
}
```

#### 11.6 PRICING TIERS

**CMS Block Mapping:**
```json
{
  "industry_report_pricing": {
    "block_type": "json",
    "content": {
      "headline": "Choose Your Access Level",
      "tiers": [
        {
          "id": "beta-pro",
          "name": "Beta Pro",
          "price": "£99",
          "period": "/sector/month",
          "original_price": "£119",
          "save": "Save £20/month",
          "badge": "BETA SPECIAL",
          "features": [
            "Complete leaderboard (50+ brands)",
            "95% confidence intervals"
          ]
        }
      ]
    }
  }
}
```

---

## SECTION 12: EVALUATION REPORT TEMPLATE MAPPING

### Template File: Used for individual evaluation reports

#### 12.1 HEADER SECTION

**CMS Block Mapping:**
```json
{
  "page_id": "evaluation-report-template",
  "eval_report_header": {
    "block_type": "json",
    "content": {
      "badge": {
        "text": "AIDI Evaluation Report",
        "icon": "📊"
      },
      "title_template": "{brand_name} AI Discoverability Analysis",
      "subtitle_template": "Complete evaluation across {dimension_count} dimensions",
      "metadata": [
        {"label": "Evaluation Date", "key": "evaluation_date"},
        {"label": "Evaluation ID", "key": "evaluation_id"}
      ]
    }
  }
}
```

#### 12.2 EXECUTIVE SUMMARY

**CMS Block Mapping:**
```json
{
  "eval_report_executive_summary": {
    "block_type": "json",
    "content": {
      "headline": "Executive Summary",
      "score_card": {
        "overall_label": "Overall AIDI Score",
        "grade_labels": {
          "A+": "Exceptional AI Visibility",
          "A": "Excellent AI Visibility",
          "B": "Good AI Visibility"
        }
      },
      "pillars_section": {
        "title": "Pillar Performance",
        "pillars": [
          {
            "key": "infrastructure",
            "name": "Infrastructure & Machine Readability",
            "icon": "⚡"
          }
        ]
      }
    }
  }
}
```

#### 12.3 COMPETITIVE CONTEXT

**CMS Block Mapping:**
```json
{
  "eval_report_competitive_context": {
    "block_type": "json",
    "content": {
      "headline": "Competitive Context",
      "description": "See how you compare to industry benchmarks...",
      "metrics": [
        {
          "label": "Industry Rank",
          "key": "industry_rank",
          "format": "rank_of_total"
        },
        {
          "label": "Percentile",
          "key": "percentile",
          "format": "percentile"
        }
      ]
    }
  }
}
```

#### 12.4 STRENGTHS & GAPS

**CMS Block Mapping:**
```json
{
  "eval_report_strengths_gaps": {
    "block_type": "json",
    "content": {
      "sections": [
        {
          "type": "strengths",
          "headline": "🏆 Key Strengths",
          "description": "Areas where you excel...",
          "card_style": "border-green-500 bg-green-50"
        },
        {
          "type": "gaps",
          "headline": "🎯 Priority Gaps",
          "description": "High-impact opportunities...",
          "card_style": "border-orange-500 bg-orange-50"
        }
      ]
    }
  }
}
```

#### 12.5 DIMENSION DETAILS

**CMS Block Mapping:**
```json
{
  "eval_report_dimension_details": {
    "block_type": "json",
    "content": {
      "headline": "Detailed Dimension Analysis",
      "description": "In-depth evaluation across all 12 AIDI dimensions",
      "dimension_card_template": {
        "header": {
          "dimension_name": "{dimension}",
          "pillar": "{pillar}",
          "score": "{score}/100"
        },
        "body": {
          "what_we_tested": "Description of evaluation methodology",
          "findings": "Key findings from the analysis",
          "impact": "Business impact of performance"
        }
      }
    }
  }
}
```

#### 12.6 ACTION PLAN

**CMS Block Mapping:**
```json
{
  "eval_report_action_plan": {
    "block_type": "json",
    "content": {
      "headline": "90-Day Action Roadmap",
      "description": "Prioritized recommendations to improve AI discoverability",
      "phases": [
        {
          "phase": "Quick Wins (Days 1-30)",
          "icon": "⚡",
          "description": "High-impact, low-effort improvements",
          "color": "green"
        }
      ]
    }
  }
}
```

#### 12.7 METHODOLOGY TRANSPARENCY

**CMS Block Mapping:**
```json
{
  "eval_report_methodology": {
    "block_type": "richtext",
    "content": {
      "html": "<div class=\"border-t-2\"><h3>📚 Methodology & Validation</h3>...</div>"
    }
  }
}
```

---

## SECTION 13: FRONTEND IMPLEMENTATION GUIDE

### Step 1: Create CMS Client Helper

**File:** `src/lib/cms/cms-client.ts` (Update)

```typescript
// Add new helper for template-based content
export async function getTemplateContent(
  templateSlug: string,
  blockKey: string,
  replacements: Record<string, string> = {}
): Promise<any> {
  const block = await getBlockByKey(templateSlug, blockKey)
  
  if (!block) return null
  
  // Handle template replacements
  let content = JSON.stringify(block.content)
  Object.entries(replacements).forEach(([key, value]) => {
    content = content.replaceAll(`{${key}}`, value)
  })
  
  return JSON.parse(content)
}
```

### Step 2: Update Leaderboards Page

**File:** `src/app/leaderboards/page.tsx`

```typescript
// Add at top
import { contentManager } from '@/lib/cms/cms-client'

// In component
export default async function LeaderboardsPage() {
  // Fetch CMS content
  const terminalTitle = await contentManager.getBlockByKey('leaderboards', 'leaderboard_terminal_title')
  const alertBar = await contentManager.getBlockByKey('leaderboards', 'leaderboard_alert_bar')
  const intelligenceCards = await contentManager.getBlockByKey('leaderboards', 'leaderboard_intelligence_cards')
  const marketOverview = await contentManager.getBlockByKey('leaderboards', 'leaderboard_market_overview')
  const executiveSummary = await contentManager.getBlockByKey('leaderboards', 'leaderboard_executive_summary')
  const bottomCta = await contentManager.getBlockByKey('leaderboards', 'leaderboard_bottom_cta')
  
  return (
    <div>
      {/* Use CMS content */}
      <span className="font-bold">{terminalTitle?.text}</span>
      
      {/* Alert Bar */}
      {alertBar && (
        <div className="flex items-center gap-2">
          <span>{alertBar.icon}</span>
          <span className="font-bold">{alertBar.headline}</span>
          <span>{alertBar.message}</span>
          <Button onClick={() => router.push(alertBar.cta_url)}>
            {alertBar.cta_text}
          </Button>
        </div>
      )}
      
      {/* Intelligence Cards */}
      {intelligenceCards?.cards.map(card => (
        <Card key={card.id} className={`bg-gradient-to-br ${card.gradient}`}>
          <CardTitle>{card.title}</CardTitle>
          {/* Render metrics */}
        </Card>
      ))}
    </div>
  )
}
```

### Step 3: Create Industry Report Page

**File:** `src/app/reports/[sector]/page.tsx` (New/Update)

```typescript
import { contentManager, getTemplateContent } from '@/lib/cms/cms-client'

export default async function IndustryReportPage({ 
  params 
}: { 
  params: { sector: string } 
}) {
  // Fetch report data
  const reportData = await fetchIndustryReportData(params.sector)
  
  // Fetch CMS content with template replacements
  const hero = await getTemplateContent('industry-report-template', 'industry_report_hero', {
    sector_name: reportData.sectorName,
    month: reportData.month,
    year: reportData.year,
    brand_count: reportData.brandCount.toString()
  })
  
  const betaBanner = await contentManager.getBlockByKey('industry-report-template', 'industry_report_beta_banner')
  const methodologyNote = await contentManager.getBlockByKey('industry-report-template', 'industry_report_methodology_note')
  const keyInsights = await contentManager.getBlockByKey('industry-report-template', 'industry_report_key_insights')
  const leaderboardHeaders = await contentManager.getBlockByKey('industry-report-template', 'industry_report_leaderboard_headers')
  const pricing = await contentManager.getBlockByKey('industry-report-template', 'industry_report_pricing')
  
  return (
    <div>
      {/* Hero */}
      <Badge>{hero.badge.text}</Badge>
      <h1>{hero.headline_template}</h1>
      <h2>{hero.subheadline_template}</h2>
      <div dangerouslySetInnerHTML={{ __html: hero.description }} />
      
      {/* Beta Banner */}
      {betaBanner?.enabled && (
        <div className="bg-gradient-to-r from-orange-600">
          <h3>{betaBanner.title}</h3>
          <p>{betaBanner.message}</p>
          <Button onClick={() => router.push(betaBanner.cta.url)}>
            {betaBanner.cta.text}
          </Button>
        </div>
      )}
      
      {/* Methodology Note */}
      <div dangerouslySetInnerHTML={{ __html: methodologyNote?.html }} />
      
      {/* Key Insights */}
      {keyInsights?.insights_template.map(insight => {
        const title = insight.title_template
          .replace('{brand_name}', reportData.topBrand.name)
          .replace('{score}', reportData.topBrand.score)
        return (
          <div key={insight.type}>
            <h4>{insight.icon} {title}</h4>
          </div>
        )
      })}
      
      {/* Leaderboard Table */}
      <h3>{leaderboardHeaders.table_title}</h3>
      <table>
        <thead>
          <tr>
            {leaderboardHeaders.columns.map(col => (
              <th key={col.key} className={col.width}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        {/* Render brand rows */}
      </table>
      
      {/* Pricing */}
      <h2>{pricing.headline}</h2>
      {pricing.tiers.map(tier => (
        <PricingCard key={tier.id} {...tier} />
      ))}
    </div>
  )
}
```

### Step 4: Create Evaluation Report Page

**File:** `src/app/dashboard/evaluation/[id]/page.tsx` (New/Update)

```typescript
import { contentManager, getTemplateContent } from '@/lib/cms/cms-client'

export default async function EvaluationReportPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Fetch evaluation data
  const evaluation = await fetchEvaluationData(params.id)
  
  // Fetch CMS content
  const header = await getTemplateContent('evaluation-report-template', 'eval_report_header', {
    brand_name: evaluation.brandName,
    dimension_count: '12'
  })
  
  const executiveSummary = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_executive_summary')
  const competitiveContext = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_competitive_context')
  const strengthsGaps = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_strengths_gaps')
  const dimensionDetails = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_dimension_details')
  const actionPlan = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_action_plan')
  const methodology = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_methodology')
  
  return (
    <div>
      {/* Header */}
      <Badge>{header.badge.text}</Badge>
      <h1>{header.title_template}</h1>
      <p>{header.subtitle_template}</p>
      
      {/* Executive Summary */}
      <h2>{executiveSummary.headline}</h2>
      <div className="score-card">
        <div className="text-6xl">{evaluation.overallScore}</div>
        <div className="text-2xl">{executiveSummary.score_card.grade_labels[evaluation.grade]}</div>
      </div>
      
      {/* Pillars */}
      <h3>{executiveSummary.pillars_section.title}</h3>
      {executiveSummary.pillars_section.pillars.map(pillar => (
        <PillarCard 
          key={pillar.key}
          icon={pillar.icon}
          name={pillar.name}
          description={pillar.description}
          score={evaluation.pillarScores[pillar.key]}
        />
      ))}
      
      {/* Competitive Context */}
      <h2>{competitiveContext.headline}</h2>
      <p>{competitiveContext.description}</p>
      {competitiveContext.metrics.map(metric => (
        <MetricCard 
          key={metric.key}
          label={metric.label}
          value={evaluation[metric.key]}
          format={metric.format}
        />
      ))}
      
      {/* Strengths & Gaps */}
      {strengthsGaps.sections.map(section => (
        <div key={section.type} className={section.card_style}>
          <h3>{section.headline}</h3>
          <p>{section.description}</p>
          {evaluation[section.type].map(item => (
            <StrengthGapCard key={item.dimension} {...item} />
          ))}
        </div>
      ))}
      
      {/* Dimension Details */}
      <h2>{dimensionDetails.headline}</h2>
      {evaluation.dimensions.map(dimension => (
        <DimensionCard 
          key={dimension.name}
          template={dimensionDetails.dimension_card_template}
          data={dimension}
        />
      ))}
      
      {/* Action Plan */}
      <h2>{actionPlan.headline}</h2>
      <p>{actionPlan.description}</p>
      {actionPlan.phases.map(phase => (
        <PhaseCard key={phase.phase} {...phase} />
      ))}
      
      {/* Methodology */}
      <div dangerouslySetInnerHTML={{ __html: methodology.html }} />
    </div>
  )
}
```

---

## SECTION 14: CMS UPDATE WORKFLOW

### For Marketing Team to Update Copy

1. **Access CMS Admin**
   ```
   https://ai-discoverability-index.netlify.app/admin/cms
   ```

2. **Select Page**
   - Choose "Leaderboards", "Industry Report Template", or "Evaluation Report Template"

3. **Edit Content Blocks**
   - Click on any block to edit
   - For text blocks: Edit directly
   - For JSON blocks: Edit structured data
   - For richtext blocks: HTML editor

4. **Save Changes**
   - Click "Save"
   - Changes apply immediately (no deployment needed)

### Common Updates

#### Update Alert Bar Message
1. Go to "Leaderboards" page
2. Find "leaderboard_alert_bar" block
3. Edit `message` field
4. Save

#### Update Pricing
1. Go to "Industry Report Template" page
2. Find "industry_report_pricing" block
3. Edit tier prices, features, or CTAs
4. Save

#### Update Grade Labels
1. Go to "Evaluation Report Template" page
2. Find "eval_report_executive_summary" block
3. Edit `grade_labels` object
4. Save

---

**Status:** CMS Expansion Complete ✅  
**Pages Added:** Leaderboards, Industry Reports, Evaluation Reports  
**Total Content Blocks:** 32 new blocks  
**Next:** Run SQL migration, update frontend components  
**Owner:** AI Assistant (End-to-End Oversight)


