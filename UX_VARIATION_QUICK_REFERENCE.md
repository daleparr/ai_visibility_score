# AIDI UX Variations - Quick Reference Card

## 🚀 Quick Start

### Test Playbook-First Variation

**Method 1: QA Toggle** (Easiest)
1. Navigate to `/dashboard/adi`
2. Click Settings icon (bottom right)
3. Select "Playbook-First"
4. Page reloads

**Method 2: Environment Variable**
```bash
# In .env.local
NEXT_PUBLIC_UX_VARIATION=playbook-first
```
Restart dev server

---

## 📊 At a Glance

| | Executive-First (A) | Playbook-First (B) |
|-|-------------------|-------------------|
| **Philosophy** | "Where do I stand?" | "What should I do?" |
| **Hero** | Score Gauge | Citation Message |
| **Layout** | Top-down (Score → Details) | Left-right (Actions + Score) |
| **Complexity** | High (9 dimensions) | Low (6 practices) |
| **Best For** | Executives, Analysts | Marketers, Practitioners |

---

## 🎯 Key Components

### Variation A (Executive-First)
```
┌─ ScoreGauge (200px, animated)
├─ PillarBreakdown (3 pillars)
├─ RadarChart (9 dimensions)
├─ LeaderboardTable (benchmarking)
└─ PriorityActions (traffic light)
```

### Variation B (Playbook-First)
```
┌─ HeroMessage ("Fighting for citations")
├─ CoreAEOPractices (6 numbered items)
├─ QuickWinsPanel (sorted by impact)
├─ StepByStepPlaybook (6 steps)
├─ CitationTracker (AI engines)
└─ CompactScoreCard (sidebar)
```

---

## 💾 File Locations

### Core System
- `src/lib/feature-flags.ts` - Feature flag logic
- `src/lib/adi/ux-adapters.ts` - Data transformation
- `src/app/dashboard/adi/page.tsx` - Router (TO CREATE)

### Components
- `src/components/adi/variations/executive/` - Variation A
- `src/components/adi/variations/playbook/` - Variation B
- `src/components/adi/shared/` - Shared (e.g., Toggle)

---

## 🔧 Environment Variables

```bash
# Development/QA
NEXT_PUBLIC_UX_VARIATION=playbook-first  # or executive-first
NODE_ENV=development                      # Shows QA toggle

# Production A/B Testing
NEXT_PUBLIC_ENABLE_AB_TEST=true
NEXT_PUBLIC_AB_TEST_START_DATE=2025-01-15
```

---

## 📈 Metrics to Track

### Primary KPIs
- Time to First Action (target: <30s)
- Completion Rate (target: >30%)
- Return Rate (target: >50%)
- NPS Score (target: >50)

### Secondary Metrics
- Session Duration
- Feature Adoption
- Variation Switches
- User Feedback Score

---

## 🧪 Testing Checklist

**Both Variations**
- [ ] Loads without errors
- [ ] Data displays correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors
- [ ] Loading states work

**Playbook-First Specific**
- [ ] Hero message displays
- [ ] 6 AEO practices render
- [ ] Quick wins load
- [ ] Playbook steps show
- [ ] Citation tracker appears
- [ ] Compact score in sidebar

**Toggle Functionality**
- [ ] Settings icon appears
- [ ] Can switch variations
- [ ] Selection persists
- [ ] Page reloads correctly

---

## 🎨 Design Tokens

### Colors
```typescript
Executive-First:
  Primary: #2563EB (Blue)
  Secondary: #7C3AED (Purple)
  Success: #10B981 (Green)

Playbook-First:
  Primary: #2563EB (Blue)
  Quick Wins: #059669 (Green)
  Warning: #D97706 (Orange)
  Alert: #DC2626 (Red)
```

### Typography
- Headers: Inter, 600 weight
- Body: Inter, 400 weight
- Scores: Inter, 700 weight, tabular-nums

---

## 🐛 Common Issues

### Toggle doesn't appear
✅ Check `NODE_ENV=development`  
✅ Verify `showVariationToggle` is true

### Data doesn't transform
✅ Check dimension keys match exactly  
✅ Verify evaluation data structure  
✅ Add console.logs in adapters

### Quick wins not generating
✅ Check score thresholds  
✅ Verify dimension scores exist  
✅ Check `extractQuickWins()` logic

---

## 📞 Quick Contacts

- **Technical Issues**: Check browser console first
- **Design Questions**: Reference UX_VARIATION_STRATEGY.md
- **Data Issues**: Check ux-adapters.ts
- **Analytics**: Verify tracking in network tab

---

## ✅ Pre-Launch Checklist

- [ ] Both variations tested
- [ ] No TypeScript errors
- [ ] Analytics tracking works
- [ ] Documentation complete
- [ ] Team trained
- [ ] Beta users identified

---

## 🎯 Decision Timeline

- **Week 1-2**: Internal QA (NOW)
- **Week 3-4**: Beta testing
- **Week 5-8**: A/B test
- **Week 9-12**: Analysis & decision
- **Week 13+**: Rollout winner

---

*Keep this handy during testing!*

