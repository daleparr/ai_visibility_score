# Frontend CMS Integration Guide
## Step-by-Step Implementation for CMS-Driven Copy

**Date:** October 16, 2025  
**Purpose:** Update frontend React components to fetch copy from CMS  
**Owner:** AI Assistant (End-to-End Oversight)

---

## Overview

### Current State
Frontend components have hardcoded copy directly in TSX files.

### Target State
Frontend components fetch copy from CMS via `contentManager` API.

### Benefits
- Update copy without code deployment
- A/B test variations easily
- Multi-language support ready
- Non-technical team can edit

---

## STEP 1: Update Homepage (`src/app/page.tsx`)

### 1.1 Add CMS Imports

**Add at top of file:**
```tsx
import { contentManager } from '@/lib/cms/cms-client'
```

### 1.2 Convert to Server Component & Fetch Data

**Before:**
```tsx
'use client'  // Client component

export default function HomePage() {
  const [url, setUrl] = useState('')
  // ... state management
  
  return (
    <div>
      <h1>How Visible Is Your Brand to AI Models?</h1>
    </div>
  )
}
```

**After:**
```tsx
// Remove 'use client' for parent component
// Create separate client component for interactive parts

import { Suspense } from 'react'
import { contentManager } from '@/lib/cms/cms-client'
import { HomePageInteractive } from '@/components/homepage/Interactive'

export default async function HomePage() {
  // Fetch CMS content
  const heroHeadline = await contentManager.getBlockByKey('homepage', 'hero_headline')
  const heroSubhead = await contentManager.getBlockByKey('homepage', 'hero_subhead')
  const heroDescription = await contentManager.getBlockByKey('homepage', 'hero_description')
  const trustIndicators = await contentManager.getBlockByKey('homepage', 'trust_indicators')
  const pricingTiers = await contentManager.getBlockByKey('homepage', 'pricing_tiers')
  const footerAbout = await contentManager.getBlockByKey('homepage', 'footer_about')
  
  return (
    <div>
      {/* Static CMS-driven content */}
      <section className="hero">
        <h1>{heroHeadline?.text || 'The Benchmark Standard for AEO Intelligence'}</h1>
        <p>{heroSubhead?.text}</p>
        <div dangerouslySetInnerHTML={{ __html: heroDescription?.html || '' }} />
        
        <div className="trust-indicators">
          {trustIndicators?.items?.map((item, idx) => (
            <div key={idx}>{item}</div>
          ))}
        </div>
      </section>
      
      {/* Interactive parts moved to client component */}
      <Suspense fallback={<div>Loading...</div>}>
        <HomePageInteractive />
      </Suspense>
      
      {/* More CMS-driven sections */}
      <section className="pricing">
        {pricingTiers?.tiers?.map(tier => (
          <PricingCard key={tier.id} {...tier} />
        ))}
      </section>
      
      <footer>
        <div dangerouslySetInnerHTML={{ __html: footerAbout?.html || '' }} />
      </footer>
    </div>
  )
}
```

### 1.3 Create Interactive Client Component

**New File:** `src/components/homepage/Interactive.tsx`
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function HomePageInteractive() {
  const [url, setUrl] = useState('')
  const [tier, setTier] = useState<'free' | 'index-pro' | 'enterprise'>('free')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!url) return
    setIsAnalyzing(true)
    const encodedUrl = encodeURIComponent(url)
    router.push(`/evaluate?url=${encodedUrl}&tier=${tier}`)
  }

  return (
    <div className="url-input-section">
      {/* Tier selection buttons */}
      <div className="tier-selection">
        <button 
          onClick={() => setTier('free')}
          className={tier === 'free' ? 'active' : ''}
        >
          🆓 Free Tier
        </button>
        {/* ... other tier buttons */}
      </div>
      
      {/* URL input */}
      <Input
        type="url"
        placeholder="Enter your website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      
      <Button onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
      </Button>
    </div>
  )
}
```

### 1.4 Update Pricing Section

**Before (Lines 502-629):**
```tsx
<Card>
  <CardTitle>AIDI Score</CardTitle>
  <div className="text-4xl font-bold">£0</div>
  <CardDescription>Get your AI discoverability score</CardDescription>
</Card>
```

**After:**
```tsx
{pricingTiers?.tiers?.map(tier => (
  <Card key={tier.id} className={tier.highlight ? 'highlighted' : ''}>
    {tier.badge && <Badge>{tier.badge}</Badge>}
    <CardTitle>{tier.name}</CardTitle>
    <div className="text-4xl font-bold">{tier.price}</div>
    <CardDescription>{tier.description}</CardDescription>
    <ul>
      {tier.features.map((feature, idx) => (
        <li key={idx}>{feature}</li>
      ))}
    </ul>
    <Button>{tier.cta}</Button>
  </Card>
))}
```

---

## STEP 2: Update Reports Landing Page

### 2.1 Convert to CMS-Driven

**File:** `src/app/reports/page.tsx`

**Add at top:**
```tsx
import { contentManager } from '@/lib/cms/cms-client'
```

**Update page function:**
```tsx
export default async function IndustryReportsPage() {
  // Fetch sectors from database (existing)
  let sectors: any[] = []
  try {
    sectors = await industryReportsDB.getSectors(true)
  } catch (err) {
    console.error('Error loading sectors:', err)
  }
  
  // NEW: Fetch CMS content
  const heroHeadline = await contentManager.getBlockByKey('reports-landing', 'reports_hero_headline')
  const heroDescription = await contentManager.getBlockByKey('reports-landing', 'reports_hero_description')
  const heroBadges = await contentManager.getBlockByKey('reports-landing', 'reports_hero_badges')
  const valueProps = await contentManager.getBlockByKey('reports-landing', 'reports_value_props')
  
  return (
    <div>
      {/* Hero Section - NOW CMS-DRIVEN */}
      <section className="hero">
        <h1>{heroHeadline?.text || 'Monthly AI Brand Visibility Reports'}</h1>
        <div dangerouslySetInnerHTML={{ __html: heroDescription?.html || '' }} />
        
        <div className="badges">
          {heroBadges?.badges?.map((badge, idx) => (
            <Badge key={idx}>{badge}</Badge>
          ))}
        </div>
      </section>
      
      {/* Value Props - NOW CMS-DRIVEN */}
      <section className="value-props">
        <div className="grid md:grid-cols-3 gap-8">
          {valueProps?.props?.map((prop, idx) => (
            <ValueProp key={idx} {...prop} />
          ))}
        </div>
      </section>
      
      {/* Sectors Grid - UNCHANGED (from database) */}
      <section className="sectors">
        {sectors.map(sector => (
          <SectorCard key={sector.id} sector={sector} />
        ))}
      </section>
    </div>
  )
}
```

---

## STEP 3: Create New CMS-Driven Pages

### 3.1 Methodology Page

**New File:** `src/app/methodology/page.tsx`

```tsx
import { contentManager } from '@/lib/cms/cms-client'
import { Brain } from 'lucide-react'
import Link from 'next/link'

export default async function MethodologyPage() {
  // Fetch all methodology content
  const page = await contentManager.getPage('methodology')
  const intro = await contentManager.getBlockByKey('methodology', 'methodology_intro')
  const version = await contentManager.getBlockByKey('methodology', 'methodology_version')
  const principles = await contentManager.getBlockByKey('methodology', 'core_principles')
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold">AI Discoverability Index</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/">Home</Link>
              <Link href="/methodology" className="text-brand-600 font-medium">Methodology</Link>
              <Link href="/faq">FAQ</Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Page Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-5xl font-bold mb-4">{page?.title}</h1>
          
          {/* Version Badge */}
          {version && (
            <div className="mb-8 text-sm text-gray-600">
              Version {version.version} | Published: {version.published} | 
              Last Updated: {version.last_updated}
            </div>
          )}
          
          {/* Introduction */}
          <div 
            className="prose prose-lg mb-12"
            dangerouslySetInnerHTML={{ __html: intro?.html || '' }} 
          />
          
          {/* Core Principles */}
          {principles?.principles && (
            <section className="space-y-12">
              <h2 className="text-3xl font-bold mb-8">{principles.headline}</h2>
              
              {principles.principles.map((principle: any) => (
                <div key={principle.id} className="border-l-4 border-brand-500 pl-6">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{principle.icon}</span>
                    <h3 className="text-2xl font-semibold">{principle.title}</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{principle.description}</p>
                  
                  {principle.why_matters && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">Why It Matters:</h4>
                      <p className="text-gray-700">{principle.why_matters}</p>
                    </div>
                  )}
                  
                  {principle.implementation && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Implementation:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {principle.implementation.map((item: string, idx: number) => (
                          <li key={idx} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {principle.stat_rigor && (
                    <div className="bg-green-50 p-4 rounded-lg font-mono text-sm">
                      <h4 className="font-semibold mb-2">Statistical Rigor:</h4>
                      <pre className="whitespace-pre-wrap">{principle.stat_rigor}</pre>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
```

### 3.2 FAQ Page

**New File:** `src/app/faq/page.tsx`

```tsx
import { contentManager } from '@/lib/cms/cms-client'
import { Brain, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

// This will need client component for accordion functionality
import { FAQAccordion } from '@/components/faq/Accordion'

export default async function FAQPage() {
  const page = await contentManager.getPage('faq')
  const categories = await contentManager.getBlockByKey('faq', 'faq_categories')
  
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold">AI Discoverability Index</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">{page?.title}</h1>
          <p className="text-xl text-gray-600 mb-12">{page?.meta_description}</p>
          
          {/* FAQ Categories */}
          {categories?.categories?.map((category: any, catIdx: number) => (
            <div key={catIdx} className="mb-12">
              <h2 className="text-3xl font-bold mb-6">{category.name}</h2>
              
              <div className="space-y-4">
                {category.questions.map((q: any) => (
                  <FAQAccordion 
                    key={q.id}
                    question={q.question}
                    answer={q.answer}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
```

**New File:** `src/components/faq/Accordion.tsx`

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQAccordionProps {
  question: string
  answer: string // HTML string
}

export function FAQAccordion({ question, answer }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition"
      >
        <h3 className="text-lg font-semibold text-left">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div 
          className="p-6 pt-0 prose prose-lg"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      )}
    </div>
  )
}
```

---

## STEP 4: Update Navigation

### 4.1 Add New Pages to Navigation

**In all page headers, update navigation:**

```tsx
<nav className="flex items-center space-x-6">
  <Link href="/">Home</Link>
  <Link href="/reports">Industry Reports</Link>
  <Link href="/methodology">Methodology</Link>  {/* NEW */}
  <Link href="/faq">FAQ</Link>  {/* NEW */}
  <Link href="/aidi-vs-monitoring-tools">AIDI vs. Monitoring Tools</Link>  {/* NEW */}
  <Link href="/evaluate">Get Your Score</Link>
</nav>
```

---

## STEP 5: Testing Checklist

### 5.1 Local Testing

- [ ] Run `npm run dev`
- [ ] Homepage loads without errors
- [ ] CMS content displays correctly
- [ ] Interactive URL input works
- [ ] Navigate to `/methodology` - renders
- [ ] Navigate to `/faq` - renders
- [ ] Accordion on FAQ works
- [ ] All links in navigation work

### 5.2 CMS Admin Testing

- [ ] Access `/admin/cms`
- [ ] Edit "hero_headline" block
- [ ] Change text to "TEST HEADLINE"
- [ ] Save
- [ ] Refresh homepage
- [ ] Verify "TEST HEADLINE" appears
- [ ] Change back to original
- [ ] Save
- [ ] Verify original appears

### 5.3 Error Handling

- [ ] Test with missing CMS blocks (graceful fallback)
- [ ] Test with malformed JSON in CMS
- [ ] Test with empty content blocks
- [ ] Verify error boundaries catch issues

---

## STEP 6: Deployment

### 6.1 Pre-Deployment

- [ ] Run `npm run build` - verify no errors
- [ ] Run SQL migration on staging database
- [ ] Deploy code to staging
- [ ] Full QA on staging environment
- [ ] Get approval from team

### 6.2 Production Deployment

- [ ] Run SQL migration on production database
- [ ] Deploy code to production (Netlify)
- [ ] Verify homepage loads
- [ ] Verify new pages load
- [ ] Verify CMS admin accessible
- [ ] Monitor for errors

### 6.3 Post-Deployment

- [ ] Update team on CMS access
- [ ] Train non-technical team on editing
- [ ] Document any issues
- [ ] Monitor analytics for impact

---

## STEP 7: Performance Optimization

### 7.1 Caching Strategy

**Add caching to CMS client:**

```tsx
// src/lib/cms/cms-client.ts

export class ContentManager {
  private cache: Map<string, any> = new Map()
  private cacheTTL = 60 * 1000 // 1 minute
  
  async getBlockByKey(pageSlug: string, blockKey: string): Promise<any> {
    const cacheKey = `${pageSlug}:${blockKey}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }
    
    const data = await this.fetchFromDB(pageSlug, blockKey)
    this.cache.set(cacheKey, { data, timestamp: Date.now() })
    
    return data
  }
  
  clearCache() {
    this.cache.clear()
  }
}
```

### 7.2 Revalidation

**Add to page components:**

```tsx
export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  // ... fetch CMS content
}
```

---

## STEP 8: Rollback Plan

### If Issues Occur:

#### Option A: Quick Content Fix (CMS)
1. Access `/admin/cms`
2. Edit problematic block
3. Fix content
4. Save
5. Refresh page - fixed immediately

#### Option B: Code Rollback (Git)
```bash
# If code changes cause issues
git log --oneline  # Find last good commit
git revert <commit-hash>
git push
# Trigger Netlify redeploy
```

#### Option C: Database Rollback (SQL)
```sql
-- Restore previous content
BEGIN;
DELETE FROM content_blocks WHERE created_at > '2025-10-16 00:00:00';
-- Restore from backup if needed
ROLLBACK; -- or COMMIT if confirmed
```

---

## STEP 9: Success Metrics

### Immediate (Day 1)
- [ ] Zero errors on homepage
- [ ] All CMS content displays
- [ ] New pages accessible
- [ ] Navigation working

### Week 1
- [ ] CMS edits take < 5 minutes
- [ ] Zero code deployments for copy
- [ ] Team trained on CMS
- [ ] Framework alignment: 90%+

### Week 4
- [ ] 20+ CMS edits completed
- [ ] Zero content-related code deployments
- [ ] Page load time < 2s
- [ ] SEO scores maintained

---

## APPENDIX: Code Snippets

### A. Error Boundary for CMS Content

```tsx
// src/components/cms/ContentBlock.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class CMSContentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('CMS Content Error:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Content temporarily unavailable</div>
    }
    
    return this.props.children
  }
}
```

### B. Loading Skeleton

```tsx
// src/components/cms/ContentSkeleton.tsx
export function ContentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4 w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded mb-2 w-full"></div>
      <div className="h-6 bg-gray-200 rounded mb-2 w-5/6"></div>
    </div>
  )
}
```

---

**Status:** ✅ Frontend Integration Guide Complete  
**Next:** Run SQL migration → Update frontend → Test → Deploy  
**Owner:** AI Assistant (End-to-End Oversight)


