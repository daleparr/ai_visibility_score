# CMS Implementation: Complete Step-by-Step Guide
## End-to-End Transition to Authoritative Copy

**Date:** October 16, 2025  
**Owner:** AI Assistant (Complete Oversight)  
**Estimated Time:** 2-3 hours for technical implementation

---

## Pre-Flight Checklist

### ✅ Planning Complete
- [x] Copy audit complete (`AIDI_COPY_TONE_AUDIT.md`)
- [x] All copy documents created (4 files in `cms-content/`)
- [x] SQL migration script ready
- [x] Frontend integration guide complete
- [x] Master tracker established

### 🔴 Before You Begin
- [ ] Review all copy documents in `cms-content/` folder
- [ ] Get leadership approval for new authoritative tone
- [ ] Approve pricing changes (£119 → $2,500-10,000)
- [ ] Backup production database
- [ ] Block 2-3 hours for focused implementation

---

## STEP 1: Run SQL Migration (Database Setup)

### Option A: Via Netlify CLI (Recommended)

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Get database URL from Netlify
netlify env:get NETLIFY_DATABASE_URL_UNPOOLED

# Copy the URL and set it locally
export DATABASE_URL="<paste-url-here>"

# Run migration
psql "$DATABASE_URL" -f sql/cms-content-authoritative-tone-migration.sql

# Verify
psql "$DATABASE_URL" -c "SELECT slug, COUNT(*) as blocks FROM cms_pages p LEFT JOIN content_blocks cb ON cb.page_id = p.id GROUP BY slug;"
```

### Option B: Via Neon Console

1. **Go to Neon Dashboard:**
   - Visit: https://console.neon.tech
   - Select your project
   - Click "SQL Editor"

2. **Run CMS Schema (if not already done):**
   - Open `sql/cms-schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"
   - Verify success

3. **Run Content Migration:**
   - Open `sql/cms-content-authoritative-tone-migration.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"
   - Verify success (should see "✅ CMS Content Migration Complete!")

4. **Verify Content Created:**
   ```sql
   -- Run this query
   SELECT 
     p.slug AS page,
     COUNT(cb.id) AS block_count
   FROM cms_pages p
   LEFT JOIN content_blocks cb ON cb.page_id = p.id
   GROUP BY p.slug
   ORDER BY p.slug;
   ```
   
   **Expected Results:**
   - `homepage`: ~15 blocks
   - `methodology`: ~5 blocks
   - `reports-landing`: ~5 blocks
   - `faq`: ~2 blocks

### Option C: Via TypeScript Script (Automated)

```bash
# Run the migration script
npx tsx scripts/run-cms-migration.ts
```

**✅ CHECKPOINT 1:** Database contains CMS content blocks

---

## STEP 2: Create New Frontend Components

### 2.1 Create FAQ Accordion Component

**New File:** `src/components/faq/Accordion.tsx`

```bash
mkdir -p src/components/faq
```

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
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-all"
      >
        <h3 className="text-lg font-semibold text-left pr-4">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div 
          className="p-6 pt-0 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      )}
    </div>
  )
}
```

### 2.2 Create Homepage Interactive Component

**New File:** `src/components/homepage/Interactive.tsx`

```bash
mkdir -p src/components/homepage
```

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, ArrowRight, CheckCircle } from 'lucide-react'
import { safeHref } from '@/lib/url'

export function HomePageInteractive() {
  const [url, setUrl] = useState('')
  const [tier, setTier] = useState<'free' | 'index-pro' | 'enterprise'>('free')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!url) return
    
    try {
      const safeUrl = safeHref(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      alert('Please enter a valid URL')
      return
    }

    setIsAnalyzing(true)
    const encodedUrl = encodeURIComponent(url)
    router.push(`/evaluate?url=${encodedUrl}&tier=${tier}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <Card className="p-6 shadow-lg border-2">
        {/* Tier Selection */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <button
              onClick={() => setTier('free')}
              className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                tier === 'free'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              🆓 Quick Scan
              <div className="text-xs mt-1">$499 • 4 dimensions</div>
            </button>
            <button
              onClick={() => setTier('index-pro')}
              className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                tier === 'index-pro'
                  ? 'bg-brand-100 text-brand-700 border-2 border-brand-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              💎 Full Audit
              <div className="text-xs mt-1">$2,500 • 12 dimensions</div>
            </button>
            <button
              onClick={() => setTier('enterprise')}
              className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                tier === 'enterprise'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              🏢 Enterprise
              <div className="text-xs mt-1">$10,000 • M&A/Protected Sites</div>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="url"
              placeholder="Enter your website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-12 text-lg"
              disabled={isAnalyzing}
            />
          </div>
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!url || isAnalyzing}
            className="h-12 px-8 text-lg"
          >
            {isAnalyzing ? 'Analyzing...' : 'Get Benchmark Score'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          {tier === 'index-pro'
            ? 'Full audit • Statistical validation • Board-ready reporting'
            : tier === 'enterprise'
            ? 'Enterprise package • M&A support • Protected sites'
            : 'Quick scan • 2-day turnaround • Baseline assessment'
          }
        </div>
      </Card>
    </div>
  )
}
```

**✅ CHECKPOINT 2:** Client components created

---

## STEP 3: Create New CMS-Driven Pages

### 3.1 Methodology Page

**New File:** `src/app/methodology/page.tsx`

```bash
mkdir -p src/app/methodology
```

[See FRONTEND_CMS_INTEGRATION_GUIDE.md for complete code - lines 200-280]

### 3.2 FAQ Page

**New File:** `src/app/faq/page.tsx`

```bash
mkdir -p src/app/faq
```

[See FRONTEND_CMS_INTEGRATION_GUIDE.md for complete code - lines 285-340]

### 3.3 Searchable Positioning Page

**New File:** `src/app/aidi-vs-monitoring-tools/page.tsx`

```tsx
import { contentManager } from '@/lib/cms/cms-client'
import { Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function PositioningPage() {
  // Fetch CMS content
  const page = await contentManager.getPage('aidi-vs-monitoring-tools')
  const intro = await contentManager.getBlockByKey('aidi-vs-monitoring-tools', 'positioning_intro')
  const comparison = await contentManager.getBlockByKey('aidi-vs-monitoring-tools', 'comparison_table')
  
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-brand-600" />
            <span className="text-2xl font-bold">AIDI</span>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">{page?.title}</h1>
          
          {/* Intro */}
          <div 
            className="prose prose-xl mb-12"
            dangerouslySetInnerHTML={{ __html: intro?.html || '' }}
          />
          
          {/* Two-Column Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Monitoring Tools Column */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="text-4xl mb-2">{comparison?.monitoring?.icon}</div>
                <CardTitle className="text-2xl">{comparison?.monitoring?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{comparison?.monitoring?.description}</p>
                
                <div className="space-y-3 mb-6">
                  {comparison?.monitoring?.strengths?.map((strength: string, idx: number) => (
                    <div key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2">✓</span>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Perfect For:</div>
                  <div className="text-sm text-gray-700">{comparison?.monitoring?.perfect_for}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    <strong>Audience:</strong> {comparison?.monitoring?.audience}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Pricing:</strong> {comparison?.monitoring?.pricing}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Benchmarking Column */}
            <Card className="border-2 border-brand-200 bg-brand-50/20">
              <CardHeader>
                <div className="text-4xl mb-2">{comparison?.benchmarking?.icon}</div>
                <CardTitle className="text-2xl">{comparison?.benchmarking?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{comparison?.benchmarking?.description}</p>
                
                <div className="space-y-3 mb-6">
                  {comparison?.benchmarking?.strengths?.map((strength: string, idx: number) => (
                    <div key={idx} className="flex items-start">
                      <span className="text-brand-500 mr-2">✓</span>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-brand-50 p-4 rounded-lg border border-brand-200">
                  <div className="text-sm font-semibold mb-2">Perfect For:</div>
                  <div className="text-sm text-gray-700">{comparison?.benchmarking?.perfect_for}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    <strong>Audience:</strong> {comparison?.benchmarking?.audience}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Pricing:</strong> {comparison?.benchmarking?.pricing}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Conclusion */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-12">
            <div className="text-lg font-semibold mb-2 text-green-900">Both Are Valuable</div>
            <div className="prose prose-green" dangerouslySetInnerHTML={{ __html: comparison?.conclusion || '' }} />
          </div>
          
          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/evaluate">
                Get Your Benchmark Score
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
```

**✅ CHECKPOINT 3:** New page components created

---

## STEP 4: Update Existing Pages to Fetch from CMS

This is the most complex step. I'll create the updated homepage as a reference.

### 4.1 Update Homepage (Phased Approach)

**Phase A: Keep Interactive, Make Hero CMS-Driven**

We won't convert the entire page at once. Start with just the hero section to minimize risk.

**Current:** `src/app/page.tsx` (lines 154-168)
**Updated:** See below

---

## STEP 5: Build, Test, Deploy

### 5.1 Local Testing

```bash
# Build the project
npm run build

# If build succeeds, test locally
npm run dev

# Visit pages to verify:
# - http://localhost:3005/ (homepage)
# - http://localhost:3005/methodology (new)
# - http://localhost:3005/faq (new)
# - http://localhost:3005/aidi-vs-monitoring-tools (new)
# - http://localhost:3005/admin/cms (CMS admin)
```

### 5.2 CMS Admin Testing

```bash
# 1. Access CMS
http://localhost:3005/admin/cms

# 2. Test editing
# - Click "Page Content" → "Homepage"
# - Find "hero_headline" block
# - Click "Edit"
# - Change text to "TEST HEADLINE"
# - Click "Save"

# 3. Verify on frontend
# - Refresh homepage
# - Should show "TEST HEADLINE"
# - Change back and save
```

### 5.3 Deploy to Production

```bash
# Commit changes
git add .
git commit -m "feat: Implement CMS-driven authoritative copy"
git push origin main

# Netlify auto-deploys from main branch
# Monitor deployment at: https://app.netlify.com
```

**✅ CHECKPOINT 5:** Production deployed successfully

---

## Critical Decision Point

### Should We Update Entire Homepage Now or Incrementally?

#### Option A: Incremental (Lower Risk) ⭐ RECOMMENDED
- **Week 1:** Hero section only
- **Week 2:** Pricing section
- **Week 3:** Features section
- **Week 4:** Footer and remaining sections

**Pros:** Lower risk, easier rollback, team can adapt gradually  
**Cons:** Slower to 100% CMS coverage

#### Option B: All at Once (Higher Impact)
- **Week 1:** Convert entire homepage + create all new pages

**Pros:** Faster to full CMS coverage, complete tone shift  
**Cons:** Higher risk, harder rollback, more testing needed

**Recommendation:** Start with Option A (incremental)

---

## What Happens Next

### Immediate (Today)
1. I'll create the updated homepage with just hero section CMS-driven
2. You review and approve
3. I'll create the new page components
4. We test everything locally

### Tomorrow
5. Run SQL migration on production database
6. Deploy updated frontend
7. Verify CMS admin works
8. Train team on CMS usage

### This Week
9. Monitor metrics and user feedback
10. Iterate on copy via CMS (no code changes!)
11. Complete remaining homepage sections
12. Launch methodology and FAQ pages

---

**Next:** I'll create the updated homepage component (incremental approach)


