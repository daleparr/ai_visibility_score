# 🚀 CMS Expansion Quick Start Guide
## Industry Reports, Leaderboard & Evaluation Reports

**Date:** October 17, 2025  
**Status:** Ready to Deploy ✅

---

## 📋 What This Does

This CMS expansion adds content management for:

1. **Leaderboard Page** - All terminal UI, alerts, insights cards, market overview
2. **Industry Reports** - Template-based reports for sectors with brand rankings
3. **Evaluation Reports** - Individual brand evaluation report templates

**Total:** 32 new content blocks across 3 template pages

---

## 🎯 Step-by-Step Deployment

### STEP 1: Run Database Migration (5 minutes)

1. **Open Neon SQL Editor**
   ```
   https://console.neon.tech/app/projects/[your-project]
   ```

2. **Copy/Paste SQL File**
   - Open: `sql/cms-expand-reports-leaderboard-evaluations.sql`
   - Copy entire contents
   - Paste into Neon SQL editor
   - Click "Run"

3. **Verify Success**
   You should see output like:
   ```
   ✅ CMS Expansion Complete!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 Leaderboard Page: 7 blocks
   📈 Industry Report Template: 8 blocks
   📋 Evaluation Report Template: 9 blocks
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🎯 You can now manage ALL copy through /admin/cms
   ```

---

### STEP 2: Verify in CMS Admin (2 minutes)

1. **Access CMS Admin**
   ```
   https://ai-discoverability-index.netlify.app/admin/cms
   ```

2. **Check Pages Created**
   - Select "Page Content" from sidebar
   - Verify you see these pages:
     - ✅ Leaderboards
     - ✅ Industry Report Template
     - ✅ Evaluation Report Template

3. **Check Content Blocks**
   - Click on "Leaderboards" page
   - Verify you see blocks like:
     - `leaderboard_terminal_title`
     - `leaderboard_alert_bar`
     - `leaderboard_intelligence_cards`
     - etc.

---

### STEP 3: Update Frontend Components (20 minutes)

#### 3A: Add Template Helper to CMS Client

**File:** `src/lib/cms/cms-client.ts`

Add this function:

```typescript
/**
 * Get template content with variable replacements
 * Example: getTemplateContent('industry-report-template', 'industry_report_hero', { sector_name: 'Fashion' })
 */
export async function getTemplateContent(
  templateSlug: string,
  blockKey: string,
  replacements: Record<string, string> = {}
): Promise<any> {
  const block = await contentManager.getBlockByKey(templateSlug, blockKey)
  
  if (!block || !block.content) return null
  
  // Handle template replacements
  let content = JSON.stringify(block.content)
  Object.entries(replacements).forEach(([key, value]) => {
    content = content.replaceAll(`{${key}}`, value)
  })
  
  return JSON.parse(content)
}
```

#### 3B: Update Leaderboards Page (Optional - Already Works)

The leaderboard page currently has hardcoded text. To make it CMS-driven:

**File:** `src/app/leaderboards/page.tsx`

Replace hardcoded text with CMS fetches:

```typescript
// At top of file
import { contentManager } from '@/lib/cms/cms-client'

// Inside component (add this to fetch on mount or use server component)
const terminalTitle = await contentManager.getBlockByKey('leaderboards', 'leaderboard_terminal_title')
const alertBar = await contentManager.getBlockByKey('leaderboards', 'leaderboard_alert_bar')
const intelligenceCards = await contentManager.getBlockByKey('leaderboards', 'leaderboard_intelligence_cards')

// Then use in JSX:
<span className="font-bold">{terminalTitle?.text || 'AI DISCOVERABILITY TERMINAL'}</span>
```

#### 3C: Create/Update Industry Report Page

**File:** `src/app/reports/[sector]/page.tsx`

If this file doesn't exist, create it. Otherwise update to fetch CMS content:

```typescript
import { contentManager, getTemplateContent } from '@/lib/cms/cms-client'
import { notFound } from 'next/navigation'

export default async function IndustryReportPage({ 
  params 
}: { 
  params: { sector: string } 
}) {
  // Fetch report data from database
  const reportData = await fetchIndustryReportData(params.sector)
  if (!reportData) notFound()
  
  // Fetch CMS content with template replacements
  const hero = await getTemplateContent('industry-report-template', 'industry_report_hero', {
    sector_name: reportData.sectorName,
    month: reportData.month,
    year: reportData.year,
    brand_count: reportData.brandCount.toString()
  })
  
  const betaBanner = await contentManager.getBlockByKey('industry-report-template', 'industry_report_beta_banner')
  const methodologyNote = await contentManager.getBlockByKey('industry-report-template', 'industry_report_methodology_note')
  const pricing = await contentManager.getBlockByKey('industry-report-template', 'industry_report_pricing')
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <Badge>{hero?.badge?.text}</Badge>
      <h1 className="text-4xl font-bold">{hero?.headline_template}</h1>
      <h2 className="text-2xl text-gray-600">{hero?.subheadline_template}</h2>
      
      {/* Beta Banner (if enabled) */}
      {betaBanner?.enabled && (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-lg my-8">
          <h3 className="text-xl font-bold mb-2">{betaBanner.title}</h3>
          <p className="mb-4">{betaBanner.message}</p>
          <Button asChild>
            <Link href={betaBanner.cta.url}>{betaBanner.cta.text}</Link>
          </Button>
        </div>
      )}
      
      {/* Methodology Note */}
      {methodologyNote?.html && (
        <div dangerouslySetInnerHTML={{ __html: methodologyNote.html }} />
      )}
      
      {/* Leaderboard data here */}
      <div className="my-8">
        {/* Render your leaderboard table */}
      </div>
      
      {/* Pricing Section */}
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">{pricing?.headline}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {pricing?.tiers.map(tier => (
            <PricingCard key={tier.id} {...tier} />
          ))}
        </div>
      </section>
    </div>
  )
}
```

#### 3D: Create/Update Evaluation Report Page

**File:** `src/app/dashboard/evaluation/[id]/page.tsx`

```typescript
import { contentManager, getTemplateContent } from '@/lib/cms/cms-client'
import { notFound } from 'next/navigation'

export default async function EvaluationReportPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Fetch evaluation data
  const evaluation = await fetchEvaluationData(params.id)
  if (!evaluation) notFound()
  
  // Fetch CMS content
  const header = await getTemplateContent('evaluation-report-template', 'eval_report_header', {
    brand_name: evaluation.brandName,
    dimension_count: '12'
  })
  
  const executiveSummary = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_executive_summary')
  const competitiveContext = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_competitive_context')
  const strengthsGaps = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_strengths_gaps')
  const actionPlan = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_action_plan')
  const methodology = await contentManager.getBlockByKey('evaluation-report-template', 'eval_report_methodology')
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Badge>{header?.badge?.text}</Badge>
      <h1 className="text-4xl font-bold">{header?.title_template}</h1>
      <p className="text-xl text-gray-600">{header?.subtitle_template}</p>
      
      {/* Executive Summary */}
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">{executiveSummary?.headline}</h2>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {evaluation.overallScore}
          </div>
          <div className="text-2xl text-gray-700">
            {executiveSummary?.score_card.grade_labels[evaluation.grade]}
          </div>
        </div>
        
        {/* Pillar Performance */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {executiveSummary?.pillars_section.pillars.map(pillar => (
            <PillarCard 
              key={pillar.key}
              icon={pillar.icon}
              name={pillar.name}
              description={pillar.description}
              score={evaluation.pillarScores[pillar.key]}
            />
          ))}
        </div>
      </section>
      
      {/* Competitive Context */}
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">{competitiveContext?.headline}</h2>
        <p className="text-gray-600 mb-6">{competitiveContext?.description}</p>
        <div className="grid md:grid-cols-4 gap-4">
          {competitiveContext?.metrics.map(metric => (
            <MetricCard 
              key={metric.key}
              label={metric.label}
              value={evaluation[metric.key]}
              format={metric.format}
            />
          ))}
        </div>
      </section>
      
      {/* Strengths & Gaps */}
      <div className="grid md:grid-cols-2 gap-8 my-12">
        {strengthsGaps?.sections.map(section => (
          <div key={section.type} className={`border-2 rounded-lg p-6 ${section.card_style}`}>
            <h3 className="text-2xl font-bold mb-4">{section.headline}</h3>
            <p className="text-gray-600 mb-6">{section.description}</p>
            {/* Render items */}
          </div>
        ))}
      </div>
      
      {/* Action Plan */}
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">{actionPlan?.headline}</h2>
        <p className="text-gray-600 mb-8">{actionPlan?.description}</p>
        {/* Render phases */}
      </section>
      
      {/* Methodology */}
      <div dangerouslySetInnerHTML={{ __html: methodology?.html }} />
    </div>
  )
}
```

---

### STEP 4: Test Everything (10 minutes)

#### Test Leaderboard Page
1. Visit: `https://ai-discoverability-index.netlify.app/leaderboards`
2. Verify page renders correctly
3. Check that alert bar shows CMS content

#### Test Industry Report
1. Visit: `https://ai-discoverability-index.netlify.app/reports/fashion` (or any sector)
2. Verify hero section, beta banner, pricing display correctly
3. Check that content is from CMS

#### Test Evaluation Report
1. Visit an evaluation report URL (from dashboard)
2. Verify all sections render
3. Check grade labels, pillar names are correct

#### Test CMS Editing
1. Go to CMS admin
2. Edit `leaderboard_alert_bar` → Change message
3. Save
4. Visit leaderboard page → Verify message updated
5. Revert change

---

## 📊 What You Can Now Manage

### Leaderboard Page (7 blocks)
- Terminal title and status badge
- FOMO alert bar (message, CTA)
- Intelligence cards (metrics, colors)
- Market overview (sectors, trends)
- Executive summary insights
- Bottom CTA section

### Industry Reports (8 blocks per report)
- Hero section (badge, headlines, description)
- Beta banner (on/off toggle, pricing message)
- Methodology note (full HTML)
- Key insights templates
- Leaderboard table headers
- Statistical summary metrics
- Pricing tiers
- Lock screen for free users

### Evaluation Reports (9 blocks per report)
- Report header (badge, titles, metadata)
- Executive summary (grade labels, pillar names)
- Competitive context (metric labels, descriptions)
- Strengths & gaps section headers
- Dimension detail card template
- Action plan phases (90-day roadmap)
- Methodology transparency section
- Next steps CTAs

---

## 🎯 Common CMS Updates

### Update Alert Bar Message
```
1. Admin → Page Content → Leaderboards
2. Find: leaderboard_alert_bar
3. Edit JSON → "message" field
4. Save
```

### Update Beta Pricing
```
1. Admin → Page Content → Industry Report Template
2. Find: industry_report_pricing
3. Edit tier prices/features
4. Save
```

### Toggle Beta Banner On/Off
```
1. Admin → Page Content → Industry Report Template
2. Find: industry_report_beta_banner
3. Set "enabled": true or false
4. Save
```

### Update Grade Labels
```
1. Admin → Page Content → Evaluation Report Template
2. Find: eval_report_executive_summary
3. Edit "grade_labels" object
4. Save
```

---

## 🚨 Important Notes

### Template Variables
Some content blocks use template variables (e.g., `{sector_name}`, `{brand_name}`):
- These are replaced dynamically by frontend code
- Don't remove the curly braces when editing
- You can change text around them

Example:
```
✅ GOOD: "{brand_name} Leads the Industry"
❌ BAD: "Nike Leads the Industry" (loses dynamic replacement)
```

### JSON Editing
When editing JSON blocks in CMS:
- Maintain proper JSON syntax (commas, quotes)
- Use JSON validator if unsure
- CMS should show validation errors

### HTML Editing
Rich text blocks allow HTML:
- Use HTML preview before saving
- Maintain class names for styling
- Test responsive display

---

## 📈 Success Metrics

After deployment, you should have:

✅ **3 new template pages** in CMS  
✅ **32 content blocks** manageable via admin  
✅ **Zero hardcoded copy** in reports/leaderboard sections  
✅ **Instant updates** without code deployment  
✅ **Template-based** flexibility for all sectors  

---

## 🔧 Troubleshooting

### CMS Pages Not Showing
- **Check:** Did SQL migration run successfully?
- **Fix:** Re-run `sql/cms-expand-reports-leaderboard-evaluations.sql`

### Content Blocks Empty
- **Check:** Are there INSERT errors in SQL output?
- **Fix:** Check for slug conflicts, re-run migration

### Frontend Not Fetching CMS Content
- **Check:** Is `getTemplateContent` function added to `cms-client.ts`?
- **Fix:** Add the helper function from Step 3A

### Template Variables Not Replacing
- **Check:** Are you calling `getTemplateContent` with replacements object?
- **Fix:** Use correct syntax: `getTemplateContent('slug', 'key', {var: 'value'})`

---

## 🎉 You're Done!

You now have full CMS control over:
- ✅ Leaderboard page copy
- ✅ Industry report templates
- ✅ Evaluation report templates
- ✅ All titles, descriptions, CTAs
- ✅ Pricing tiers and features
- ✅ Alert messages and banners

**Update copy instantly without touching code!** 🚀

---

**Questions?**
- Check: `CMS_FRONTEND_COMPLETE_MAPPING.md` for detailed mapping
- Review: `sql/cms-expand-reports-leaderboard-evaluations.sql` for schema

