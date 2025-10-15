# UX Variation Implementation Guide

## 🎯 Quick Start Guide

This guide walks you through implementing and testing the two UX variations for AIDI.

---

## 📁 Files Created

### Core System Files
- ✅ `src/lib/feature-flags.ts` - Feature flag system with A/B testing support
- ✅ `src/lib/adi/ux-adapters.ts` - Data transformation layer for both UX variations
- ✅ `UX_VARIATION_STRATEGY.md` - Complete strategy document

### Variation B (Playbook-First) Components
- ✅ `src/components/adi/variations/playbook/CoreAEOPractices.tsx`
- ✅ `src/components/adi/variations/playbook/QuickWinsPanel.tsx`
- ✅ `src/components/adi/variations/playbook/StepByStepPlaybook.tsx`
- ✅ `src/components/adi/variations/playbook/CitationTracker.tsx`
- ✅ `src/components/adi/variations/playbook/CompactScoreCard.tsx`
- ✅ `src/components/adi/variations/playbook/PlaybookDashboard.tsx`

### Shared Components
- ✅ `src/components/adi/shared/UXVariationToggle.tsx` - QA testing toggle

---

## 🚀 Next Steps for Implementation

### Step 1: Environment Setup

Add to your `.env.local`:

```bash
# UX Variation Settings (for QA testing)
NEXT_PUBLIC_UX_VARIATION=executive-first
# Or: NEXT_PUBLIC_UX_VARIATION=playbook-first

# A/B Testing Settings (when ready for production)
NEXT_PUBLIC_ENABLE_AB_TEST=false
NEXT_PUBLIC_AB_TEST_START_DATE=2025-01-01
```

### Step 2: Create Router Page

Create `src/app/dashboard/adi/page.tsx`:

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useFeatureFlags } from '@/lib/feature-flags';
import { UXVariation } from '@/lib/feature-flags';
import { UXVariationToggle } from '@/components/adi/shared/UXVariationToggle';
import { PlaybookDashboard } from '@/components/adi/variations/playbook/PlaybookDashboard';

// Import your existing executive dashboard
import ExecutiveDashboard from './executive/page';

export default function AIDIDashboardRouter() {
  const { data: session } = useSession();
  const { uxVariation, showVariationToggle } = useFeatureFlags(session?.user?.id);

  return (
    <div className="relative">
      {/* QA Toggle - Only shown in development or for specific users */}
      {showVariationToggle && (
        <UXVariationToggle 
          currentVariation={uxVariation}
          userId={session?.user?.id}
        />
      )}

      {/* Render appropriate variation */}
      {uxVariation === UXVariation.EXECUTIVE_FIRST ? (
        <ExecutiveDashboard />
      ) : (
        <PlaybookDashboard />
      )}
    </div>
  );
}
```

### Step 3: Update Navigation

Update your main dashboard navigation to point to the new router:

```typescript
// In your navigation component
<Link href="/dashboard/adi">
  AI Discoverability Dashboard
</Link>
```

### Step 4: Test Both Variations

#### Testing Variation A (Executive-First - Current):

1. Set in `.env.local`:
   ```bash
   NEXT_PUBLIC_UX_VARIATION=executive-first
   ```

2. Restart your dev server:
   ```bash
   npm run dev
   ```

3. Navigate to `/dashboard/adi`

4. Verify:
   - ✅ Score gauge displays prominently
   - ✅ Pillar breakdown shows three pillars
   - ✅ Dimension radar chart appears
   - ✅ Benchmarking table loads
   - ✅ Priority actions display

#### Testing Variation B (Playbook-First - New):

1. **Method 1: Environment Variable**
   ```bash
   # In .env.local
   NEXT_PUBLIC_UX_VARIATION=playbook-first
   ```
   Restart dev server.

2. **Method 2: QA Toggle** (Recommended for quick testing)
   - Leave environment at `executive-first`
   - Click the floating Settings icon (bottom right)
   - Select "Playbook-First"
   - Page will reload with new variation

3. Verify:
   - ✅ Hero message displays citation-focused messaging
   - ✅ Core AEO Practices show 6 numbered practices
   - ✅ Quick Wins panel displays actionable items
   - ✅ Step-by-Step Playbook shows 6 steps
   - ✅ Citation Tracker displays mock data
   - ✅ Compact Score Card shows score summary

### Step 5: Integration with Real Data

Update `PlaybookDashboard.tsx` to fetch real evaluation data:

```typescript
const loadEvaluationData = async () => {
  try {
    // Fetch from your actual API endpoint
    const response = await fetch('/api/evaluation/latest');
    const evaluation = await response.json();
    
    const transformed = transformForPlaybookUX(evaluation);
    setData(transformed);
  } catch (error) {
    console.error('Failed to load evaluation data:', error);
  } finally {
    setLoading(false);
  }
};
```

### Step 6: Add Analytics Tracking

Install analytics if not already present:

```bash
npm install @segment/analytics-next
# or
npm install mixpanel-browser
```

Update your analytics setup to track variation views:

```typescript
// In _app.tsx or layout.tsx
import { trackVariationView } from '@/lib/feature-flags';

// Track when user views a variation
useEffect(() => {
  if (session?.user?.id && uxVariation) {
    trackVariationView(uxVariation, session.user.id);
  }
}, [uxVariation, session]);
```

---

## 🧪 QA Testing Checklist

### Functional Testing

#### Both Variations
- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] No console errors
- [ ] All buttons are clickable
- [ ] Navigation works
- [ ] Loading states display properly

#### Variation A (Executive-First)
- [ ] Score gauge animates smoothly
- [ ] Pillar breakdown shows correct data
- [ ] Radar chart renders
- [ ] Leaderboard table displays
- [ ] Action cards are interactive

#### Variation B (Playbook-First)
- [ ] Hero message displays
- [ ] AEO practices load with status
- [ ] Quick wins are clickable
- [ ] Playbook steps render
- [ ] Citation tracker shows data
- [ ] Compact score card displays

### UX Toggle Testing
- [ ] Toggle button appears (development mode)
- [ ] Can switch between variations
- [ ] Page reloads after switch
- [ ] Selection persists after reload
- [ ] Analytics events fire

### Responsive Testing
- [ ] Mobile (375px): All components stack properly
- [ ] Tablet (768px): Layout adapts appropriately
- [ ] Desktop (1440px): Full layout displays

### Performance Testing
- [ ] Initial load < 2 seconds
- [ ] No layout shifts (CLS)
- [ ] Smooth animations (60fps)
- [ ] No memory leaks

---

## 📊 Data Mapping Reference

### How Dimensions Map to AEO Practices

| AIDI Dimension | AEO Practice | Icon |
|---------------|--------------|------|
| `semantic_clarity` | Structure for extraction | 1️⃣ |
| `llm_readability` | Direct answers up front | 2️⃣ |
| `citation_authority` | Build trust signals | 3️⃣ |
| `schema_structured_data` | Schema markup | 4️⃣ |
| `reputation_signals` | Allow AI bots | 5️⃣ |
| `ai_answer_quality` | Track citations | 6️⃣ |

### Quick Win Triggers

| Condition | Quick Win Generated |
|-----------|-------------------|
| Schema score < 80 | "Add FAQ schema today" |
| Bot access score < 90 | "Check robots.txt for GPTBot access" |
| Readability < 75 | "Turn headlines into questions" |
| Readability < 70 | "Place answers at top of page" |
| Always | "Set up brand mention tracking" |

---

## 🎨 Styling Customization

### Color Scheme Override

To customize colors for Variation B, update these variables:

```css
/* In your global CSS or Tailwind config */
:root {
  --aeo-primary: #2563EB;    /* Blue for practices */
  --aeo-success: #059669;    /* Green for quick wins */
  --aeo-warning: #D97706;    /* Orange for in-progress */
  --aeo-danger: #DC2626;     /* Red for needs attention */
}
```

### Custom Practice Icons

To use custom icons instead of emojis:

```typescript
// In ux-adapters.ts, update practiceMap
const practiceMap = [
  {
    id: 'aeo-structure',
    icon: <StructureIcon />,  // Your custom component
    title: 'Structure for extraction',
    // ...
  }
];
```

---

## 🐛 Troubleshooting

### Issue: "Toggle doesn't appear"

**Solution**: 
1. Check that `showVariationToggle` is true
2. Verify you're in development mode: `NODE_ENV=development`
3. Check browser console for errors

### Issue: "Page doesn't reload after toggle"

**Solution**:
1. Check that localStorage is enabled in browser
2. Verify no content security policy blocking reload
3. Check browser console for errors

### Issue: "Data doesn't transform correctly"

**Solution**:
1. Check evaluation data structure matches expected format
2. Verify dimension keys match exactly (case-sensitive)
3. Add console.logs in `transformForPlaybookUX()`

### Issue: "Quick wins not generating"

**Solution**:
1. Verify dimension scores exist in evaluation data
2. Check score thresholds in `extractQuickWins()`
3. Ensure dimension names match exactly

---

## 📈 Next Steps After Implementation

### Phase 1: Internal Testing (Week 1-2)
- [ ] Full team review of both variations
- [ ] Gather feedback on usability
- [ ] Fix any bugs or issues
- [ ] Refine quick wins generation

### Phase 2: Beta Testing (Week 3-4)
- [ ] Select 10-20 beta users
- [ ] Manually assign variations (50/50 split)
- [ ] Weekly feedback calls
- [ ] Track metrics

### Phase 3: A/B Test (Week 5-8)
- [ ] Enable `NEXT_PUBLIC_ENABLE_AB_TEST=true`
- [ ] Set start date
- [ ] Monitor metrics daily
- [ ] Collect user feedback

### Phase 4: Analysis (Week 9-12)
- [ ] Statistical significance testing
- [ ] User interviews
- [ ] Decision on default variation
- [ ] Plan iteration

---

## 🎯 Success Metrics Dashboard

Create a simple dashboard to track:

```typescript
// Example analytics query
{
  variation: 'playbook-first',
  metrics: {
    timeToFirstAction: 18, // seconds
    completionRate: 42,    // percent
    returnRate: 58,        // percent  
    sessionDuration: 6.2,  // minutes
    nps: 65               // score
  }
}
```

---

## 📚 Additional Resources

### Documentation to Create
- [ ] User guide for Variation B
- [ ] Video walkthrough
- [ ] FAQ: "Which view is right for me?"
- [ ] Implementation checklist for practitioners
- [ ] Citation tracking guide

### Team Training
- [ ] Product team: Both variations overview
- [ ] Support team: How to help users switch
- [ ] Sales team: Positioning both options
- [ ] Engineering: Technical architecture

---

## ✅ Pre-Launch Checklist

Before enabling A/B testing in production:

- [ ] Both variations fully functional
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility compliance verified
- [ ] Analytics tracking working
- [ ] User documentation published
- [ ] Support team trained
- [ ] Rollback plan documented
- [ ] Executive approval obtained

---

## 🆘 Getting Help

If you need assistance:

1. **Technical Issues**: Check browser console, verify API responses
2. **Design Questions**: Reference `UX_VARIATION_STRATEGY.md`
3. **Data Mapping**: Check `ux-adapters.ts` transformation logic
4. **Analytics**: Verify tracking events in network tab

---

**Status**: ✅ Implementation Ready  
**Last Updated**: {{current_date}}  
**Version**: 1.0  
**Next Review**: After Phase 1 completion

