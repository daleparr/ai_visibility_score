# AIDI UX Variation Strategy & A/B Testing Framework

## 🎯 Executive Summary

This document outlines the strategy for implementing two distinct UX variations for AIDI:
- **Variation A (Current)**: Executive-First Dashboard - Score-centric, comprehensive analytics
- **Variation B (New)**: Playbook-First Dashboard - Action-centric, quick wins, modular checklists

Both variations share the same data layer and backend, with a feature flag system enabling seamless switching for QA testing and eventual A/B testing with users.

---

## 🔀 UX Variation Comparison

### Variation A: Executive-First (Current)
**Philosophy**: "Show me where I stand, then tell me what to do"

**Key Characteristics**:
- **Score-centric**: Large gauge/speedometer dominates the view
- **Analytical depth**: Radar charts, dimension breakdowns, benchmarking tables
- **Top-down hierarchy**: Overall score → Pillar scores → Dimension scores → Evidence
- **Data-rich**: Comprehensive metrics, trends, competitive analysis
- **Target persona**: C-suite executives, data analysts, enterprise decision-makers

**Mental Model**: "Investment dashboard" - Monitor performance, identify trends, make strategic decisions

---

### Variation B: Playbook-First (New)
**Philosophy**: "Tell me what to do first, show me why, then track my progress"

**Key Characteristics**:
- **Action-centric**: Playbook steps and quick wins front and center
- **Citation-focused**: "Fighting for citations, not clicks" messaging
- **Modular checklists**: Clear, checkable tasks organized by impact
- **Quick wins sidebar**: Immediate value, instant gratification
- **Target persona**: Marketing managers, SEO practitioners, hands-on implementers

**Mental Model**: "Implementation guide" - Get started fast, see immediate results, build momentum

---

## 📊 Detailed UX Variation Specifications

### Variation A: Executive Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ AIDI Executive Dashboard                    [Switch to B]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │   SCORE GAUGE        │  │  PILLAR BREAKDOWN        │    │
│  │                      │  │  Infrastructure: 82% ↑   │    │
│  │      [78/100]        │  │  Perception: 75% ↓       │    │
│  │      Grade B+        │  │  Commerce: 77% →         │    │
│  │                      │  │                          │    │
│  │  "Visible but not    │  └──────────────────────────┘    │
│  │  competitive in AI   │                                   │
│  │  recommendations"    │  ┌──────────────────────────┐    │
│  └──────────────────────┘  │  QUICK STATS             │    │
│                             │  Industry Rank: #12      │    │
│                             │  Percentile: 67th        │    │
│                             │  Trend: ↑ +3 pts        │    │
│                             └──────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  DIMENSION ANALYSIS (Radar Chart)                           │
│  [9-dimension spider chart with competitive overlays]       │
├─────────────────────────────────────────────────────────────┤
│  INDUSTRY BENCHMARKING                                      │
│  [Full leaderboard table with filtering]                    │
├─────────────────────────────────────────────────────────────┤
│  PRIORITY ACTIONS                                           │
│  [Traffic light system with detailed action cards]          │
└─────────────────────────────────────────────────────────────┘
```

### Variation B: Playbook Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ AIDI Playbook Dashboard                     [Switch to A]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────┐            │
│  │ "You're no longer fighting for clicks...    │            │
│  │  you're fighting for CITATIONS."            │            │
│  │                                             │            │
│  │  [Gemini][ChatGPT][Perplexity][Bing] logos │            │
│  └─────────────────────────────────────────────┘            │
│                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────┐    │
│  │ CORE AEO PRACTICES           │  │ QUICK WINS       │    │
│  │                              │  │                  │    │
│  │ 1️⃣ Structure for extraction  │  │ ✅ Turn headlines│    │
│  │    Use Q&A, H2/H3 questions  │  │    into questions│    │
│  │    Status: ⚠️ Needs work     │  │                  │    │
│  │                              │  │ ✅ Place answers │    │
│  │ 2️⃣ Direct answers up front   │  │    at top of page│    │
│  │    40-60 word concise first  │  │                  │    │
│  │    Status: ❌ Not implemented│  │ ✅ Add FAQ schema│    │
│  │                              │  │    today         │    │
│  │ 3️⃣ Build trust signals       │  │                  │    │
│  │    Authorship, credentials   │  │ ✅ Check robots  │    │
│  │    Status: ✅ Good           │  │    .txt access   │    │
│  │                              │  │                  │    │
│  │ 4️⃣ Schema markup             │  │ ✅ Set up brand  │    │
│  │    FAQ, HowTo, Product       │  │    monitoring    │    │
│  │    Status: ⚠️ Partial        │  │                  │    │
│  │                              │  └──────────────────┘    │
│  │ 5️⃣ Allow AI bots             │                          │
│  │    Check robots.txt access   │  ┌──────────────────┐    │
│  │    Status: ✅ Good           │  │ YOUR SCORE       │    │
│  │                              │  │      78/100      │    │
│  │ 6️⃣ Track citations           │  │    Grade: B+     │    │
│  │    Monitor answer engines    │  │                  │    │
│  │    Status: ❌ Not tracking   │  │ Industry: #12    │    │
│  └──────────────────────────────┘  └──────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  STEP-BY-STEP PLAYBOOK                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Match real search intent                        │    │
│  │    Tools: AnswerThePublic, Perplexity, PAA        │    │
│  │    [Start Now] [Learn More]                       │    │
│  │                                                    │    │
│  │ 2. Lead with clear, snippable answers            │    │
│  │    FAQ style, ≤80 words/para, answer first 100    │    │
│  │    [View Examples] [Audit Content]                │    │
│  │                                                    │    │
│  │ 3. Add schema markup                              │    │
│  │    FAQ, HowTo, Product, Article                   │    │
│  │    [Check Schema] [Implementation Guide]          │    │
│  │                                                    │    │
│  │ 4. Build authority & trust                        │    │
│  │    Author bios, sources, data, updates            │    │
│  │    [Authority Checklist]                          │    │
│  │                                                    │    │
│  │ 5. Optimize multimedia                            │    │
│  │    Images (alt text), charts, YouTube embeds      │    │
│  │    [Media Audit]                                  │    │
│  │                                                    │    │
│  │ 6. Monitor citations                              │    │
│  │    Track when you're "the answer"                 │    │
│  │    [Setup Tracking] [View Reports]                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Data Layer Architecture (Shared)

Both UX variations consume the same data structures, ensuring consistency:

```typescript
// Core Data Interface (shared by both UX variations)
interface AIDIScore {
  overall: number;
  grade: string;
  verdict: string;
  
  pillars: {
    infrastructure: PillarScore;
    perception: PillarScore;
    commerce: PillarScore;
  };
  
  dimensions: DimensionScore[];
  
  actions: ActionItem[];
  
  benchmarking: {
    industryRank: number;
    percentile: number;
    competitors: CompetitorData[];
  };
  
  trends: TrendData[];
  
  // New for Variation B
  playbookStatus: PlaybookItem[];
  quickWins: QuickWinItem[];
  citationTracking: CitationData;
}

// Playbook-specific data (Variation B)
interface PlaybookItem {
  id: string;
  title: string;
  description: string;
  category: 'structure' | 'content' | 'technical' | 'authority' | 'monitoring';
  status: 'completed' | 'in-progress' | 'not-started' | 'needs-attention';
  priority: number;
  checklistItems: ChecklistItem[];
  estimatedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuickWinItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  estimatedMinutes: number;
  impactScore: number;
  category: string;
}

interface CitationData {
  totalCitations: number;
  citationSources: {
    perplexity: number;
    chatgpt: number;
    gemini: number;
    bing: number;
  };
  recentCitations: Citation[];
  trendDirection: 'up' | 'down' | 'stable';
}
```

---

## 🔧 Technical Implementation Plan

### 1. Feature Flag System

```typescript
// lib/feature-flags.ts
export enum UXVariation {
  EXECUTIVE_FIRST = 'executive-first',
  PLAYBOOK_FIRST = 'playbook-first'
}

interface FeatureFlags {
  uxVariation: UXVariation;
  enableABTesting: boolean;
  showVariationToggle: boolean; // For QA only
}

// Initialize with environment variable or user preference
export function getFeatureFlags(userId?: string): FeatureFlags {
  // Check environment override (for QA testing)
  if (process.env.NEXT_PUBLIC_UX_VARIATION) {
    return {
      uxVariation: process.env.NEXT_PUBLIC_UX_VARIATION as UXVariation,
      enableABTesting: false,
      showVariationToggle: true
    };
  }

  // Check user preference (stored in DB or localStorage)
  const userPreference = getUserUXPreference(userId);
  if (userPreference) {
    return {
      uxVariation: userPreference,
      enableABTesting: false,
      showVariationToggle: true
    };
  }

  // A/B testing assignment (50/50 split for new users)
  if (userId && shouldAssignABTest(userId)) {
    return {
      uxVariation: assignABTestVariation(userId),
      enableABTesting: true,
      showVariationToggle: false
    };
  }

  // Default to Executive First
  return {
    uxVariation: UXVariation.EXECUTIVE_FIRST,
    enableABTesting: false,
    showVariationToggle: false
  };
}
```

### 2. Data Transformation Layer

```typescript
// lib/adi/ux-adapters.ts

/**
 * Transform AIDI evaluation data for Executive-First UX
 */
export function transformForExecutiveUX(evaluation: Evaluation): ExecutiveUXData {
  return {
    scoreGauge: {
      score: evaluation.overallScore,
      grade: evaluation.grade,
      verdict: generateVerdict(evaluation)
    },
    pillarBreakdown: extractPillarScores(evaluation),
    dimensionAnalysis: extractDimensionScores(evaluation),
    benchmarking: extractBenchmarkData(evaluation),
    priorityActions: extractPriorityActions(evaluation)
  };
}

/**
 * Transform AIDI evaluation data for Playbook-First UX
 */
export function transformForPlaybookUX(evaluation: Evaluation): PlaybookUXData {
  return {
    playbookStatus: generatePlaybookStatus(evaluation),
    quickWins: extractQuickWins(evaluation),
    citationTracking: extractCitationData(evaluation),
    coreAEOPractices: mapDimensionsToAEOPractices(evaluation),
    stepByStepGuide: generateStepByStepGuide(evaluation),
    compactScore: {
      score: evaluation.overallScore,
      grade: evaluation.grade,
      rank: evaluation.industryRank
    }
  };
}

/**
 * Map AIDI dimensions to AEO practices
 */
function mapDimensionsToAEOPractices(evaluation: Evaluation): AEOPractice[] {
  const dimensionMap = {
    'schema_structured_data': {
      practice: 'Schema markup',
      icon: '4️⃣',
      description: 'FAQ, HowTo, Product, Article',
      checklistItems: [
        'Product schema on all PDPs',
        'Review schema with ratings',
        'FAQ schema on key pages',
        'Organization schema',
        'Breadcrumb schema'
      ]
    },
    'semantic_clarity': {
      practice: 'Structure for extraction',
      icon: '1️⃣',
      description: 'Use Q&A, H2/H3 as questions',
      checklistItems: [
        'H2/H3 headers as questions',
        'Clear topic hierarchy',
        'Logical content flow',
        'Semantic HTML5 elements',
        'Descriptive section headings'
      ]
    },
    'llm_readability': {
      practice: 'Direct answers up front',
      icon: '2️⃣',
      description: '40-60 word concise response first',
      checklistItems: [
        'Answer in first paragraph',
        'Concise 40-60 word summaries',
        'No fluff or preamble',
        'Direct factual statements',
        'Key information first'
      ]
    },
    'citation_authority': {
      practice: 'Build trust signals',
      icon: '3️⃣',
      description: 'Authorship, credentials, fresh updates',
      checklistItems: [
        'Author bios with credentials',
        'Citation of sources',
        'Data and statistics',
        'Regular content updates',
        'Expert quotes and testimonials'
      ]
    },
    'reputation_signals': {
      practice: 'Allow AI bots',
      icon: '5️⃣',
      description: 'Check robots.txt for GPTBot, PerplexityBot',
      checklistItems: [
        'robots.txt allows GPTBot',
        'PerplexityBot access enabled',
        'Claude-Web not blocked',
        'Gemini crawler allowed',
        'AI crawl budget managed'
      ]
    },
    'ai_answer_quality': {
      practice: 'Track citations',
      icon: '6️⃣',
      description: 'Measure how often you\'re "the answer"',
      checklistItems: [
        'Monitor Perplexity citations',
        'Track ChatGPT mentions',
        'Google AI Overviews tracking',
        'Bing Chat references',
        'Citation trend analysis'
      ]
    }
  };

  return Object.entries(dimensionMap).map(([dimensionKey, config]) => {
    const dimensionScore = evaluation.dimensionScores?.find(d => d.dimension === dimensionKey);
    const score = dimensionScore?.score || 0;
    
    return {
      icon: config.icon,
      title: config.practice,
      description: config.description,
      status: getStatusFromScore(score),
      score,
      checklistItems: config.checklistItems.map(item => ({
        text: item,
        completed: score > 70, // Simplified - would be more granular in real implementation
        impact: 'medium'
      }))
    };
  });
}

/**
 * Extract quick wins from evaluation data
 */
function extractQuickWins(evaluation: Evaluation): QuickWinItem[] {
  const quickWins: QuickWinItem[] = [];

  // Analyze dimension scores and generate quick wins
  const dimensions = evaluation.dimensionScores || [];

  // Schema quick win
  const schemaScore = dimensions.find(d => d.dimension === 'schema_structured_data')?.score || 0;
  if (schemaScore < 80) {
    quickWins.push({
      id: 'qw-schema-faq',
      title: 'Add FAQ schema today',
      description: 'Easy schema.org markup for your FAQ pages',
      completed: false,
      estimatedMinutes: 30,
      impactScore: 15,
      category: 'technical'
    });
  }

  // Robots.txt quick win
  const botAccessScore = dimensions.find(d => d.dimension === 'reputation_signals')?.score || 0;
  if (botAccessScore < 90) {
    quickWins.push({
      id: 'qw-robots-check',
      title: 'Check robots.txt for GPTBot access',
      description: 'Ensure AI crawlers can access your site',
      completed: false,
      estimatedMinutes: 10,
      impactScore: 12,
      category: 'technical'
    });
  }

  // Content quick win
  const readabilityScore = dimensions.find(d => d.dimension === 'llm_readability')?.score || 0;
  if (readabilityScore < 75) {
    quickWins.push({
      id: 'qw-headlines-questions',
      title: 'Turn headlines into questions',
      description: 'Optimize H2/H3 tags for answer extraction',
      completed: false,
      estimatedMinutes: 45,
      impactScore: 10,
      category: 'content'
    });
  }

  // Place answers at top
  if (readabilityScore < 70) {
    quickWins.push({
      id: 'qw-answers-top',
      title: 'Place answers at the top of the page',
      description: 'First 100 words should contain key answer',
      completed: false,
      estimatedMinutes: 60,
      impactScore: 18,
      category: 'content'
    });
  }

  // Citation tracking
  quickWins.push({
    id: 'qw-citation-monitoring',
    title: 'Set up brand mention tracking',
    description: 'Monitor when AI engines cite your brand',
    completed: false,
    estimatedMinutes: 20,
    impactScore: 8,
    category: 'monitoring'
  });

  return quickWins.sort((a, b) => b.impactScore - a.impactScore);
}
```

### 3. Component Structure

```
src/
├── components/
│   ├── adi/
│   │   ├── variations/
│   │   │   ├── executive/              # Variation A components
│   │   │   │   ├── ExecutiveDashboard.tsx
│   │   │   │   ├── ScoreGauge.tsx     (existing)
│   │   │   │   ├── PillarBreakdown.tsx (existing)
│   │   │   │   ├── RadarChart.tsx      (existing)
│   │   │   │   └── BenchmarkingTable.tsx
│   │   │   │
│   │   │   └── playbook/              # Variation B components (NEW)
│   │   │       ├── PlaybookDashboard.tsx
│   │   │       ├── CoreAEOPractices.tsx
│   │   │       ├── QuickWinsPanel.tsx
│   │   │       ├── StepByStepPlaybook.tsx
│   │   │       ├── CitationTracker.tsx
│   │   │       └── CompactScoreCard.tsx
│   │   │
│   │   └── shared/                    # Shared components
│   │       ├── UXVariationToggle.tsx  (QA only)
│   │       ├── ActionCard.tsx         (used by both)
│   │       └── TrendChart.tsx         (used by both)
│   │
│   └── ui/                            # Shared UI primitives
│
├── lib/
│   ├── adi/
│   │   ├── ux-adapters.ts            # Data transformation layer
│   │   └── playbook-mapper.ts         # Maps dimensions to playbook items
│   │
│   └── feature-flags.ts               # Feature flag system
│
└── app/
    └── dashboard/
        └── adi/
            ├── executive/             # Variation A routes
            │   └── page.tsx
            │
            ├── playbook/              # Variation B routes
            │   └── page.tsx
            │
            └── page.tsx               # Router that picks variation
```

### 4. UX Variation Router

```typescript
// app/dashboard/adi/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useFeatureFlags } from '@/lib/feature-flags';
import { ExecutiveDashboard } from '@/components/adi/variations/executive/ExecutiveDashboard';
import { PlaybookDashboard } from '@/components/adi/variations/playbook/PlaybookDashboard';
import { UXVariationToggle } from '@/components/adi/shared/UXVariationToggle';
import { UXVariation } from '@/lib/feature-flags';

export default function AIDIDashboardRouter() {
  const { data: session } = useSession();
  const { uxVariation, showVariationToggle } = useFeatureFlags(session?.user?.id);

  return (
    <div className="relative">
      {/* QA Toggle - Only shown in development or for specific users */}
      {showVariationToggle && (
        <UXVariationToggle currentVariation={uxVariation} />
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

---

## 🎨 New Components for Variation B

### 1. CoreAEOPractices Component

```typescript
// components/adi/variations/playbook/CoreAEOPractices.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Circle } from 'lucide-react';
import type { AEOPractice } from '@/lib/adi/ux-adapters';

interface CoreAEOPracticesProps {
  practices: AEOPractice[];
  onPracticeClick?: (practice: AEOPractice) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
    case 'good':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'in-progress':
    case 'partial':
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case 'not-started':
    case 'needs-attention':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusText = (status: string) => {
  const statusMap = {
    'completed': 'Good',
    'good': 'Good',
    'in-progress': 'Partial',
    'partial': 'Partial',
    'needs-attention': 'Needs work',
    'not-started': 'Not implemented'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

export function CoreAEOPractices({ practices, onPracticeClick }: CoreAEOPracticesProps) {
  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Core AEO Practices</CardTitle>
        <p className="text-sm text-gray-600">
          Answer Engine Optimisation = SEO reimagined for AI
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {practices.map((practice, index) => (
          <button
            key={practice.id || index}
            onClick={() => onPracticeClick?.(practice)}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{practice.icon}</span>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {practice.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(practice.status)}
                    <Badge
                      variant={
                        practice.status === 'completed' || practice.status === 'good'
                          ? 'default'
                          : practice.status === 'partial' || practice.status === 'in-progress'
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {getStatusText(practice.status)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{practice.description}</p>
                
                {/* Progress bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      practice.score >= 80
                        ? 'bg-green-600'
                        : practice.score >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${practice.score}%` }}
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
```

### 2. QuickWinsPanel Component

```typescript
// components/adi/variations/playbook/QuickWinsPanel.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import type { QuickWinItem } from '@/lib/adi/ux-adapters';

interface QuickWinsPanelProps {
  quickWins: QuickWinItem[];
  onCompleteWin?: (winId: string) => void;
  onLearnMore?: (winId: string) => void;
}

export function QuickWinsPanel({ quickWins, onCompleteWin, onLearnMore }: QuickWinsPanelProps) {
  const completedCount = quickWins.filter(w => w.completed).length;
  
  return (
    <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Quick Wins
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {completedCount} of {quickWins.length} completed
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Fast Results
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickWins.map((win) => (
          <div
            key={win.id}
            className={`p-3 rounded-lg border-2 ${
              win.completed
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-2">
              {win.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="h-5 w-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-grow">
                <h5 className={`font-medium ${win.completed ? 'text-green-900' : 'text-gray-900'}`}>
                  {win.title}
                </h5>
                <p className="text-sm text-gray-600 mt-1">{win.description}</p>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {win.estimatedMinutes}min
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +{win.impactScore} points
                  </Badge>
                </div>

                {!win.completed && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onCompleteWin?.(win.id)}
                      className="text-xs"
                    >
                      Start Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onLearnMore?.(win.id)}
                      className="text-xs"
                    >
                      Learn More
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### 3. StepByStepPlaybook Component

```typescript
// components/adi/variations/playbook/StepByStepPlaybook.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface PlaybookStep {
  number: number;
  title: string;
  description: string;
  tools: string[];
  actions: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
}

interface StepByStepPlaybookProps {
  steps: PlaybookStep[];
}

export function StepByStepPlaybook({ steps }: StepByStepPlaybookProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Step-by-Step Playbook</CardTitle>
        <p className="text-sm text-gray-600">
          Follow these steps to improve your AI discoverability
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {step.number}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                
                {step.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs text-gray-500 mr-1">Tools:</span>
                    {step.tools.map((tool, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {step.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={idx === 0 ? 'default' : 'outline'}
                      onClick={action.onClick}
                      asChild={!!action.href}
                    >
                      {action.href ? (
                        <a href={action.href} target="_blank" rel="noopener noreferrer">
                          {action.label}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <>
                          {action.label}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### 4. CitationTracker Component

```typescript
// components/adi/variations/playbook/CitationTracker.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CitationData } from '@/lib/adi/ux-adapters';

interface CitationTrackerProps {
  data: CitationData;
}

export function CitationTracker({ data }: CitationTrackerProps) {
  const getTrendIcon = () => {
    switch (data.trendDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const sources = [
    { name: 'Perplexity', count: data.citationSources.perplexity, color: 'bg-purple-500' },
    { name: 'ChatGPT', count: data.citationSources.chatgpt, color: 'bg-green-500' },
    { name: 'Gemini', count: data.citationSources.gemini, color: 'bg-blue-500' },
    { name: 'Bing', count: data.citationSources.bing, color: 'bg-orange-500' }
  ];

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <span>Citation Tracking</span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge
              variant={data.trendDirection === 'up' ? 'default' : 'secondary'}
              className={
                data.trendDirection === 'up'
                  ? 'bg-green-100 text-green-700'
                  : data.trendDirection === 'down'
                  ? 'bg-red-100 text-red-700'
                  : ''
              }
            >
              {data.trendDirection === 'up' && '↑'} 
              {data.trendDirection === 'down' && '↓'}
              {data.trendDirection === 'stable' && '→'}
            </Badge>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Times your brand was cited by AI engines
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-gray-900">{data.totalCitations}</div>
          <div className="text-sm text-gray-600">Total Citations</div>
        </div>

        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${source.color}`} />
              <span className="text-sm font-medium text-gray-900 w-24">{source.name}</span>
              <div className="flex-grow bg-gray-200 rounded-full h-2">
                <div
                  className={`${source.color} h-2 rounded-full transition-all`}
                  style={{
                    width: `${(source.count / data.totalCitations) * 100}%`
                  }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 w-8 text-right">
                {source.count}
              </span>
            </div>
          ))}
        </div>

        {data.recentCitations && data.recentCitations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Recent Citations</h5>
            <div className="space-y-2">
              {data.recentCitations.slice(0, 3).map((citation, idx) => (
                <div key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{citation.source}:</span> {citation.context}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 📊 A/B Testing Metrics & Success Criteria

### Key Metrics to Track

| Metric | Definition | Target | Variation A Baseline | Variation B Goal |
|--------|------------|--------|---------------------|------------------|
| **Time to First Action** | Seconds until user clicks first actionable item | <30s | ~45s | <20s |
| **Feature Adoption** | % of users who engage with core features | >60% | 45% | >70% |
| **Session Duration** | Average time spent in dashboard | 5+ min | 6.2 min | 5+ min |
| **Return Rate** | % of users returning within 7 days | >50% | 42% | >60% |
| **Completion Rate** | % of users who complete at least one action | >30% | 18% | >40% |
| **NPS Score** | Net Promoter Score | >50 | 32 | >60 |
| **Upgrade Conversion** | % of free users upgrading to paid | >15% | 8% | >20% |

### Success Criteria

**Variation B (Playbook-First) is considered successful if**:
1. Time to First Action improves by >40% (from 45s to <27s)
2. Completion Rate doubles (from 18% to >36%)
3. Return Rate improves by >25% (from 42% to >52.5%)
4. NPS improves by >15 points (from 32 to >47)

**If both criteria are met**: Consider making Variation B the default for new users
**If mixed results**: Offer both as user preference options
**If Variation B underperforms**: Keep Variation A as default, but maintain Variation B for specific user segments

---

## 🚀 Implementation Roadmap

### Phase 1: Infrastructure (Week 1-2)
- [ ] Set up feature flag system
- [ ] Create data transformation layer
- [ ] Build UX variation router
- [ ] Implement UX toggle for QA
- [ ] Set up analytics tracking

### Phase 2: Variation B Core Components (Week 3-4)
- [ ] CoreAEOPractices component
- [ ] QuickWinsPanel component
- [ ] CompactScoreCard component
- [ ] PlaybookDashboard layout
- [ ] Mobile responsive design

### Phase 3: Variation B Advanced Features (Week 5-6)
- [ ] StepByStepPlaybook component
- [ ] CitationTracker component
- [ ] Playbook progress persistence
- [ ] Quick win completion flow
- [ ] Action implementation guides

### Phase 4: Testing & Refinement (Week 7-8)
- [ ] Internal QA testing with toggle
- [ ] User feedback sessions (5-10 users per variation)
- [ ] Performance optimization
- [ ] Accessibility compliance
- [ ] Analytics integration

### Phase 5: A/B Test Launch (Week 9-10)
- [ ] Deploy both variations to production
- [ ] Enable A/B testing for new users (50/50 split)
- [ ] Monitor metrics daily
- [ ] Gather user feedback
- [ ] Prepare iteration plan

### Phase 6: Analysis & Iteration (Week 11-12)
- [ ] Analyze A/B test results (minimum 2 weeks data)
- [ ] Statistical significance testing
- [ ] User interview follow-ups
- [ ] Iteration based on feedback
- [ ] Decision on default variation

---

## 🎯 User Segments & Variation Mapping

### Recommended Default Variation by Persona

| User Persona | Default Variation | Rationale |
|--------------|-------------------|-----------|
| **C-Suite Executive** | A: Executive-First | Prefers high-level overview, benchmarking, strategic view |
| **Marketing Manager** | B: Playbook-First | Needs actionable steps, quick wins, implementation focus |
| **SEO Specialist** | B: Playbook-First | Technical practitioner, wants checklists and guides |
| **Agency Account Manager** | A: Executive-First | Needs competitive analysis for client reporting |
| **Product Manager** | A: Executive-First | Strategic overview with deep-dive options |
| **Content Creator** | B: Playbook-First | Needs specific content optimization guidance |

### Allow User to Override
- Provide "Switch View" option after initial assignment
- Save preference in user profile
- Allow toggling at any time
- Track switching behavior as a metric

---

## 🔒 QA Testing Plan

### QA Toggle Implementation

```typescript
// components/adi/shared/UXVariationToggle.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UXVariation } from '@/lib/feature-flags';
import { LayoutDashboard, ListChecks } from 'lucide-react';

export function UXVariationToggle({ currentVariation }: { currentVariation: UXVariation }) {
  const [variation, setVariation] = useState(currentVariation);

  const handleToggle = () => {
    const newVariation =
      variation === UXVariation.EXECUTIVE_FIRST
        ? UXVariation.PLAYBOOK_FIRST
        : UXVariation.EXECUTIVE_FIRST;
    
    setVariation(newVariation);
    
    // Save to localStorage
    localStorage.setItem('ux_variation_override', newVariation);
    
    // Reload page to apply new variation
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">QA Mode:</span>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-gray-600" />
          <span className="text-xs text-gray-600">Executive</span>
        </div>
        <Switch checked={variation === UXVariation.PLAYBOOK_FIRST} onCheckedChange={handleToggle} />
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-gray-600" />
          <span className="text-xs text-gray-600">Playbook</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Current: <strong>{variation}</strong>
      </div>
    </div>
  );
}
```

### QA Testing Checklist

#### Functional Testing
- [ ] Both variations load without errors
- [ ] Data displays correctly in both variations
- [ ] UX toggle switches between variations
- [ ] User preferences persist across sessions
- [ ] All interactive elements work in both variations
- [ ] API calls function identically
- [ ] Error states display properly

#### Visual Testing
- [ ] Responsive design on mobile (320px-767px)
- [ ] Responsive design on tablet (768px-1023px)
- [ ] Responsive design on desktop (1024px+)
- [ ] Dark mode compatibility (if applicable)
- [ ] Print styles (for reports)

#### Performance Testing
- [ ] Initial load time <2s on 3G
- [ ] Time to Interactive <3s
- [ ] No layout shifts (CLS <0.1)
- [ ] Smooth animations (60fps)
- [ ] Bundle size within target

#### Accessibility Testing
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Focus indicators visible
- [ ] Color contrast ratios pass

---

## 📈 Analytics Implementation

### Event Tracking Schema

```typescript
// Track UX variation exposure
analytics.track('ux_variation_viewed', {
  variation: 'playbook-first' | 'executive-first',
  userId: string,
  timestamp: Date,
  userSegment: string,
  isABTest: boolean
});

// Track feature usage
analytics.track('feature_engaged', {
  feature: string,
  variation: string,
  timeToEngagement: number,
  userId: string
});

// Track action completion
analytics.track('action_completed', {
  actionType: 'quick_win' | 'playbook_step' | 'priority_action',
  actionId: string,
  variation: string,
  timeToComplete: number,
  userId: string
});

// Track variation switching
analytics.track('ux_variation_switched', {
  fromVariation: string,
  toVariation: string,
  switchMethod: 'toggle' | 'preference' | 'system',
  userId: string
});
```

---

## 🎓 User Education & Onboarding

### First-Time User Experience

#### Variation A (Executive-First)
```
Step 1: Welcome Modal
  → "Welcome to AIDI: Your AI Discoverability Command Center"
  → Brief tour of gauge, pillars, benchmarking
  → "Let's see how your brand performs..."

Step 2: Score Reveal
  → Animated gauge showing score
  → Contextual verdict
  → Industry positioning

Step 3: Quick Win Highlight
  → "Here are 3 actions you can take today"
  → Call-to-action buttons

Step 4: Next Steps
  → Tour of other sections
  → Link to documentation
  → Contact support
```

#### Variation B (Playbook-First)
```
Step 1: Welcome Modal
  → "Welcome to AIDI: Your Answer Engine Optimization Playbook"
  → Brief explanation of AEO vs SEO
  → "You're fighting for citations, not just clicks"

Step 2: Quick Wins Introduction
  → "Start here: 5 quick wins you can implement today"
  → Highlight estimated time and impact
  → "These take less than 2 hours total"

Step 3: Playbook Overview
  → "Follow our step-by-step playbook"
  → Show progress tracking
  → "Check off tasks as you complete them"

Step 4: Citation Tracking
  → "Monitor when AI engines cite your brand"
  → Show sample citations
  → "This is your new success metric"
```

---

## 🔄 Continuous Improvement Plan

### Iteration Schedule

**Week 1-2**: Soft launch with QA toggle
- Internal team testing
- Fix critical bugs
- Gather initial feedback

**Week 3-4**: Beta launch with select users
- Invite 20-30 power users
- 50/50 split between variations
- Weekly feedback calls

**Week 5-8**: Full A/B test
- New users randomly assigned
- Existing users keep current variation
- Daily metric monitoring

**Week 9-12**: Analysis & decision
- Statistical significance testing
- User interviews (10+ per variation)
- Decision on default variation

**Ongoing**: Continuous optimization
- Monthly user feedback sessions
- Quarterly feature additions
- Biannual major UX updates

---

## 📝 Documentation & Training

### Internal Documentation
- [ ] Component API documentation
- [ ] Data transformation flow diagrams
- [ ] Feature flag system guide
- [ ] QA testing procedures
- [ ] Troubleshooting guide

### User Documentation
- [ ] "What's New" announcement
- [ ] Video walkthrough of each variation
- [ ] FAQ: "Which view is right for me?"
- [ ] Migration guide for existing users
- [ ] Best practices guide

### Support Team Training
- [ ] Overview of both variations
- [ ] How to help users switch
- [ ] Common questions and answers
- [ ] Escalation procedures
- [ ] Feedback collection process

---

## ✅ Success Checklist

Before launching A/B test:
- [ ] Both variations fully functional
- [ ] Feature flags system operational
- [ ] Analytics tracking implemented
- [ ] QA testing completed (all tests pass)
- [ ] Performance benchmarks met
- [ ] Accessibility compliance verified
- [ ] User documentation published
- [ ] Support team trained
- [ ] Rollback plan prepared
- [ ] Executive stakeholder approval

---

## 🎉 Conclusion

This UX variation strategy provides:

1. **Two distinct, well-designed experiences** optimized for different user needs
2. **Shared data layer** ensuring consistency and reducing technical debt
3. **Robust testing framework** with QA toggle and A/B testing infrastructure
4. **Clear success metrics** to make data-driven decisions
5. **Comprehensive implementation plan** with realistic timeline
6. **Continuous improvement process** for ongoing optimization

The Playbook-First variation (B) addresses the complexity concerns by providing a more action-oriented, immediately useful experience, while the Executive-First variation (A) serves users who prefer comprehensive analytics and strategic overview.

With both variations available and user preference options, AIDI can serve its diverse user base more effectively and learn which approach drives better engagement, satisfaction, and business outcomes.

**Next Steps**: 
1. Review this strategy with stakeholders
2. Get approval on timeline and resources
3. Begin Phase 1 implementation
4. Schedule weekly check-ins during development
5. Plan beta user recruitment

---

*Document Version*: 1.0  
*Last Updated*: {{current_date}}  
*Owner*: Product & Engineering Teams  
*Status*: Ready for Implementation

