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

**Status:** Mapping Complete ✅  
**Next:** Create SQL migration script  
**Owner:** AI Assistant (End-to-End Oversight)


