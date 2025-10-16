# Sector & Competitor Onboarding - Implementation Guide

## Overview

This enhancement collects industry sector and competitor information during the first evaluation, enabling:
- ✅ Accurate peer-group benchmarking
- ✅ Personalized competitive rankings
- ✅ Sector-specific recommendations
- ✅ Proper positioning in industry reports

## What Was Added

### 1. Database Schema Updates
**File**: `sql/add-sector-and-competitors-to-evaluations.sql`

**New columns in `evaluations` table:**
- `industry_sector_id` - Links evaluation to a sector
- `primary_competitors` - JSONB array of competitor names/domains
- `sector_confirmed_at` - Timestamp when user confirmed
- `competitor_data` - Enriched competitor information

**New columns in `users` table:**
- `primary_sector_id` - User's main industry sector
- `tracked_competitors` - All competitors across evaluations
- `sector_set_at` - When sector was first set

**New table: `competitor_relationships`**
- Tracks brand-competitor relationships
- Supports confidence levels (user-confirmed, AI-suggested)
- Relationship types (direct, adjacent, aspirational)

### 2. UI Component
**File**: `src/components/evaluation/SectorAndCompetitorForm.tsx`

Beautiful form that collects:
- Industry sector dropdown (10 options)
- Top 3 competitor inputs
- Clear explanation of why we need this data
- Skip option for users who prefer not to share

### 3. Backend Logic
**File**: `src/lib/industry-reports/competitor-matcher.ts`

Functions for:
- Saving competitor relationships
- Retrieving user's competitors
- Generating competitive benchmarks
- Normalizing competitor input (handles domains or names)
- AI-suggested competitors (future enhancement)

### 4. API Endpoint
**File**: `src/app/api/evaluations/set-sector/route.ts`

- `POST` - Save sector and competitors
- `GET` - Retrieve sector info for evaluation

## Integration Flow

### Current Evaluation Flow
```
User enters URL → Clicks "Analyze" → Evaluation starts → Results shown
```

### Enhanced Evaluation Flow
```
User enters URL 
  ↓
Clicks "Analyze"
  ↓
[NEW] Sector & Competitor Form appears
  ↓
User selects sector + enters 3 competitors
  ↓
Clicks "Continue to Analysis"
  ↓
Evaluation starts (with sector context)
  ↓
Results shown with competitive benchmarking
```

## Where to Insert the Form

### Option A: Modal During First Evaluation (Recommended)

In `src/app/evaluate/page.tsx` or your evaluation component:

```typescript
'use client';

import { useState } from 'react';
import { SectorAndCompetitorForm } from '@/components/evaluation/SectorAndCompetitorForm';

export default function EvaluatePage() {
  const [showSectorForm, setShowSectorForm] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  
  async function handleAnalyzeClick(url: string) {
    // Check if user has set their sector before
    const hasSector = await checkUserHasSector();
    
    if (!hasSector) {
      // Show sector form first
      setPendingUrl(url);
      setShowSectorForm(true);
    } else {
      // Proceed with evaluation
      startEvaluation(url);
    }
  }
  
  async function handleSectorComplete(data: { sectorId: string; competitors: string[] }) {
    // Save sector and competitors
    await fetch('/api/evaluations/set-sector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectorId: data.sectorId,
        competitors: data.competitors,
        brandDomain: extractDomain(pendingUrl),
      }),
    });
    
    // Now start evaluation with context
    setShowSectorForm(false);
    startEvaluation(pendingUrl, data.sectorId, data.competitors);
  }
  
  return (
    <>
      {showSectorForm ? (
        <SectorAndCompetitorForm
          brandUrl={pendingUrl}
          onComplete={handleSectorComplete}
          onSkip={() => {
            setShowSectorForm(false);
            startEvaluation(pendingUrl);
          }}
        />
      ) : (
        // Your existing evaluation UI
        <YourEvaluationForm onAnalyze={handleAnalyzeClick} />
      )}
    </>
  );
}
```

### Option B: Dedicated Step in Multi-Step Flow

Add as step 2 in a wizard:
1. Enter URL
2. **Select Sector & Competitors** ← NEW
3. Choose tier (Free/Pro/Enterprise)
4. Run analysis
5. View results

## Benefits of This Approach

### For Users
- 🎯 **Accurate benchmarking** - Compare against actual competitors, not generic peers
- 📊 **Relevant insights** - See exactly where you stand in your competitive set
- 🏆 **Personalized leaderboard** - "You rank #3 out of 15 in your sector"
- 📈 **Track progress** - Monitor your position vs named competitors over time

### For Industry Reports
- 📊 **Better data quality** - User-confirmed sector classification
- 🎯 **Accurate grouping** - No misclassified brands
- 💡 **Competitive insights** - See which brands are competing directly
- 🔗 **Network analysis** - Understand competitive clusters

### For Product
- 📈 **Higher engagement** - Personalized insights drive retention
- 💰 **Better conversions** - Competitive data increases value
- 🎯 **Targeted marketing** - Know exactly which sector each user cares about
- 📧 **Relevant communications** - Send sector-specific updates

## Enhanced Results Display

After evaluation, show:

### Competitive Positioning Card
```
┌─────────────────────────────────────────────┐
│ Your Position in Fashion & Apparel         │
├─────────────────────────────────────────────┤
│                                             │
│  Your Rank: #12 out of 78 brands           │
│                                             │
│  vs. Your Competitors:                      │
│  • Nike: #1 ↑ (beating you)                │
│  • Adidas: #3 ↑ (beating you)              │
│  • Puma: #15 ↓ (you're ahead)              │
│                                             │
│  Sector Average: 2.3% mention share        │
│  Your Score: 1.8% (-0.5% vs average)       │
│                                             │
│  [View Full Fashion Report]                 │
└─────────────────────────────────────────────┘
```

### Recommendations Enhanced
```
Based on your position in Fashion & Apparel:

Priority Actions:
1. Nike mentions you 0% of the time - they're capturing your audience
2. Optimize for "sustainable athleisure" queries (your gap vs Adidas)
3. You're beating Puma on sentiment (+0.4 score) - lean into this
```

## Database Updates Needed

Run in Neon SQL Editor:

**📄 Copy the entire `sql/add-sector-and-competitors-to-evaluations.sql` file**

This adds:
- New columns to `evaluations` table
- New columns to `users` table  
- New `competitor_relationships` table
- Proper indexes

## Next Steps After Database Update

### 1. Seed the Sectors (if not done)
```sql
-- Run in Neon
sql/seed-industry-sectors.sql
```

### 2. Test the Form
```bash
# Start dev server
npm run dev

# Visit
http://localhost:3000/evaluate
```

### 3. Integrate into Evaluation Flow
Update your evaluation component to show the `SectorAndCompetitorForm` before analysis starts.

### 4. Enhance Results Page
Add competitive benchmarking using the `getCompetitiveBenchmark()` function.

## Example Usage

```typescript
// In your evaluation results component
import { getCompetitiveBenchmark } from '@/lib/industry-reports/competitor-matcher';

const benchmark = await getCompetitiveBenchmark(
  'yourbrand.com',
  sectorId,
  ['competitor1.com', 'competitor2.com', 'competitor3.com'],
  new Date()
);

// Show user their rank vs competitors
console.log(`You rank #${benchmark.userRank}`);
console.log('Your competitors:');
benchmark.competitorRanks.forEach(c => {
  console.log(`  ${c.brand}: #${c.rank} (${c.score}% share)`);
});
```

## Future Enhancements

### AI-Suggested Competitors
- Use LLM to suggest competitors based on brand description
- Show "Is this a competitor?" for brands in same sector
- Learn from co-mention patterns in probe results

### Competitive Intelligence
- Alert users when competitors move up in rankings
- Show competitor content strategies
- Identify competitive gaps/opportunities

### Multi-Sector Brands
- Support brands operating in multiple sectors
- Different competitive sets per sector
- Weighted sector importance

---

## Quick Start Checklist

- [ ] Run `sql/add-sector-and-competitors-to-evaluations.sql` in Neon
- [ ] Run `sql/seed-industry-sectors.sql` in Neon (if not done)
- [ ] Verify: `SELECT COUNT(*) FROM industry_sectors;` returns 10
- [ ] Integrate `SectorAndCompetitorForm` into evaluation flow
- [ ] Test the form submission
- [ ] Add competitive benchmarking to results page
- [ ] Deploy and test on live site

---

**This enhancement makes your product significantly more valuable by providing accurate, peer-relevant competitive intelligence instead of generic industry averages.**

