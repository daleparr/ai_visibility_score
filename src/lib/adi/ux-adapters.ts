/**
 * UX Data Transformation Layer
 * 
 * Transforms AIDI evaluation data for different UX variations:
 * - Executive-First: Score-centric, analytical depth
 * - Playbook-First: Action-centric, quick wins
 */

import type { Evaluation } from '@/lib/db/schema';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ExecutiveUXData {
  scoreGauge: {
    score: number;
    grade: string;
    verdict: string;
  };
  pillarBreakdown: PillarScore[];
  dimensionAnalysis: DimensionScore[];
  benchmarking: BenchmarkData;
  priorityActions: PriorityAction[];
}

export interface PlaybookUXData {
  heroMessage: {
    title: string;
    subtitle: string;
    engines: string[];
  };
  coreAEOPractices: AEOPractice[];
  quickWins: QuickWinItem[];
  stepByStepGuide: PlaybookStep[];
  citationTracking: CitationData;
  compactScore: {
    score: number;
    grade: string;
    rank: number;
    percentile: number;
  };
}

export interface PillarScore {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  color: string;
}

export interface DimensionScore {
  dimension: string;
  displayName: string;
  score: number;
  category: string;
  maxScore: number;
}

export interface BenchmarkData {
  industryRank: number;
  totalCompetitors: number;
  percentile: number;
  topPerformers: CompetitorData[];
  nearbyCompetitors: CompetitorData[];
}

export interface CompetitorData {
  rank: number;
  name: string;
  score: number;
  gap: number;
}

export interface PriorityAction {
  id: string;
  priority: 'immediate' | 'short-term' | 'strategic';
  title: string;
  description: string;
  why: string;
  steps: string[];
  expectedLift: {
    overall: number;
    dimension?: string;
    dimensionLift: number;
  };
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  category: string;
}

export interface AEOPractice {
  id: string;
  icon: string;
  title: string;
  description: string;
  status: 'completed' | 'good' | 'partial' | 'in-progress' | 'needs-attention' | 'not-started';
  score: number;
  checklistItems: ChecklistItem[];
  dimension: string;
}

export interface ChecklistItem {
  text: string;
  completed: boolean;
  impact: 'low' | 'medium' | 'high';
}

export interface QuickWinItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  estimatedMinutes: number;
  impactScore: number;
  category: string;
  actionUrl?: string;
}

export interface PlaybookStep {
  number: number;
  title: string;
  description: string;
  tools: string[];
  actions: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface CitationData {
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

export interface Citation {
  source: string;
  context: string;
  url?: string;
  date: Date;
}

// ============================================================================
// Executive-First Transformation
// ============================================================================

export function transformForExecutiveUX(evaluation: Evaluation): ExecutiveUXData {
  return {
    scoreGauge: {
      score: evaluation.overallScore || 0,
      grade: evaluation.grade || 'F',
      verdict: generateVerdict(evaluation)
    },
    pillarBreakdown: extractPillarScores(evaluation),
    dimensionAnalysis: extractDimensionScores(evaluation),
    benchmarking: extractBenchmarkData(evaluation),
    priorityActions: extractPriorityActions(evaluation)
  };
}

function generateVerdict(evaluation: Evaluation): string {
  const score = evaluation.overallScore || 0;
  
  if (score >= 90) return "AI discoverability leader in your industry";
  if (score >= 80) return "Strong AI presence with room for optimization";
  if (score >= 70) return "Visible but not competitive in AI recommendations";
  if (score >= 60) return "Moderate visibility with significant gaps";
  if (score >= 40) return "Limited AI presence - urgent action needed";
  return "Invisible to AI engines - critical intervention required";
}

function extractPillarScores(evaluation: Evaluation | any): PillarScore[] {
  const scores = evaluation.dimensionScores || [];
  
  // Calculate pillar scores
  const infrastructure = calculatePillarScore(scores, [
    'schema_structured_data',
    'semantic_clarity',
    'knowledge_graphs',
    'llm_readability'
  ]);
  
  const perception = calculatePillarScore(scores, [
    'geographic_visibility',
    'ai_answer_quality',
    'citation_authority',
    'reputation_signals'
  ]);
  
  const commerce = calculatePillarScore(scores, [
    'hero_products',
    'policies_logistics'
  ]);

  return [
    {
      name: 'Infrastructure',
      score: infrastructure,
      trend: 'up', // Would come from historical data
      change: 2,
      color: '#2563EB'
    },
    {
      name: 'Perception',
      score: perception,
      trend: 'down',
      change: -1,
      color: '#7C3AED'
    },
    {
      name: 'Commerce',
      score: commerce,
      trend: 'stable',
      change: 0,
      color: '#059669'
    }
  ];
}

function calculatePillarScore(scores: any[], dimensions: string[]): number {
  const relevantScores = scores.filter((s: any) => dimensions.includes(s.dimension));
  if (relevantScores.length === 0) return 0;
  
  const sum = relevantScores.reduce((acc: number, s: any) => acc + (s.score || 0), 0);
  return Math.round(sum / relevantScores.length);
}

function extractDimensionScores(evaluation: Evaluation | any): DimensionScore[] {
  const scores = evaluation.dimensionScores || [];
  
  const dimensionMap: Record<string, string> = {
    'schema_structured_data': 'Schema & Structured Data',
    'semantic_clarity': 'Semantic Clarity',
    'knowledge_graphs': 'Knowledge Graphs',
    'llm_readability': 'LLM Readability',
    'geographic_visibility': 'Geographic Visibility',
    'ai_answer_quality': 'AI Answer Quality',
    'citation_authority': 'Citation Authority',
    'reputation_signals': 'Reputation Signals',
    'hero_products': 'Hero Products',
    'policies_logistics': 'Policies & Logistics'
  };

  return scores.map((s: any) => ({
    dimension: s.dimension,
    displayName: dimensionMap[s.dimension] || s.dimension,
    score: s.score || 0,
    category: getCategoryForDimension(s.dimension),
    maxScore: 100
  }));
}

function getCategoryForDimension(dimension: string): string {
  const infraDimensions = ['schema_structured_data', 'semantic_clarity', 'knowledge_graphs', 'llm_readability'];
  const perceptionDimensions = ['geographic_visibility', 'ai_answer_quality', 'citation_authority', 'reputation_signals'];
  const commerceDimensions = ['hero_products', 'policies_logistics'];
  
  if (infraDimensions.includes(dimension)) return 'infrastructure';
  if (perceptionDimensions.includes(dimension)) return 'perception';
  if (commerceDimensions.includes(dimension)) return 'commerce';
  return 'other';
}

function extractBenchmarkData(evaluation: Evaluation): BenchmarkData {
  // Mock data - would come from actual benchmarking service
  return {
    industryRank: 12,
    totalCompetitors: 47,
    percentile: 74,
    topPerformers: [
      { rank: 1, name: 'Industry Leader A', score: 94, gap: -16 },
      { rank: 2, name: 'Industry Leader B', score: 91, gap: -13 },
      { rank: 3, name: 'Industry Leader C', score: 88, gap: -10 }
    ],
    nearbyCompetitors: [
      { rank: 11, name: 'Competitor Above', score: 80, gap: -2 },
      { rank: 13, name: 'Competitor Below', score: 76, gap: 2 }
    ]
  };
}

function extractPriorityActions(evaluation: Evaluation | any): PriorityAction[] {
  const scores = evaluation.dimensionScores || [];
  const actions: PriorityAction[] = [];

  // Schema action
  const schemaScore = scores.find((s: any) => s.dimension === 'schema_structured_data')?.score || 0;
  if (schemaScore < 80) {
    actions.push({
      id: 'action-schema-reviews',
      priority: 'immediate',
      title: 'Add Review Schema to Product Pages',
      description: 'Missing on 68% of PDPs, hurting AI answer quality',
      why: 'AI systems rely heavily on structured review data for product recommendations',
      steps: [
        'Audit current schema implementation (2 days)',
        'Implement Review markup on top 50 products (1 week)',
        'Test with Google Rich Results and validate (3 days)'
      ],
      expectedLift: {
        overall: 8,
        dimension: 'Schema & Structured Data',
        dimensionLift: 15
      },
      effort: 'low',
      timeline: '2 weeks',
      category: 'technical'
    });
  }

  // Readability action
  const readabilityScore = scores.find((s: any) => s.dimension === 'llm_readability')?.score || 0;
  if (readabilityScore < 75) {
    actions.push({
      id: 'action-answer-first',
      priority: 'short-term',
      title: 'Implement Answer-First Content Structure',
      description: 'Current content buries key information in paragraph 3-4',
      why: 'LLMs extract answers from first 100 words - delayed answers hurt discoverability',
      steps: [
        'Audit top 20 content pages (1 week)',
        'Rewrite openings with direct answers (2 weeks)',
        'A/B test with AI query monitoring (1 week)'
      ],
      expectedLift: {
        overall: 6,
        dimension: 'LLM Readability',
        dimensionLift: 18
      },
      effort: 'medium',
      timeline: '30 days',
      category: 'content'
    });
  }

  // Knowledge graph action
  const kgScore = scores.find((s: any) => s.dimension === 'knowledge_graphs')?.score || 0;
  if (kgScore < 70) {
    actions.push({
      id: 'action-knowledge-graph',
      priority: 'strategic',
      title: 'Build Knowledge Graph Presence',
      description: 'Competitors have 3x more entity connections in major KGs',
      why: 'Knowledge graphs power AI understanding of brand relationships and authority',
      steps: [
        'Establish Wikipedia presence (6 weeks)',
        'Create Wikidata entries for key products (4 weeks)',
        'Submit to industry databases (2 weeks)'
      ],
      expectedLift: {
        overall: 12,
        dimension: 'Knowledge Graphs',
        dimensionLift: 25
      },
      effort: 'high',
      timeline: '90 days',
      category: 'authority'
    });
  }

  return actions;
}

// ============================================================================
// Playbook-First Transformation
// ============================================================================

export function transformForPlaybookUX(evaluation: Evaluation): PlaybookUXData {
  return {
    heroMessage: {
      title: "You're no longer fighting for clicks...",
      subtitle: "you're fighting for CITATIONS.",
      engines: ['Gemini', 'ChatGPT', 'Perplexity', 'Bing Copilot']
    },
    coreAEOPractices: mapDimensionsToAEOPractices(evaluation),
    quickWins: extractQuickWins(evaluation),
    stepByStepGuide: generateStepByStepGuide(evaluation),
    citationTracking: extractCitationData(evaluation),
    compactScore: {
      score: evaluation.overallScore || 0,
      grade: evaluation.grade || 'F',
      rank: 12, // Mock - would come from benchmarking
      percentile: 74 // Mock
    }
  };
}

function mapDimensionsToAEOPractices(evaluation: Evaluation | any): AEOPractice[] {
  const scores = evaluation.dimensionScores || [];
  
  const practiceMap = [
    {
      id: 'aeo-structure',
      icon: '1️⃣',
      title: 'Structure for extraction',
      description: 'Use Q&A, H2/H3 as questions',
      dimension: 'semantic_clarity',
      checklistItems: [
        'H2/H3 headers formatted as questions',
        'Clear topic hierarchy established',
        'Logical content flow maintained',
        'Semantic HTML5 elements used',
        'Descriptive section headings'
      ]
    },
    {
      id: 'aeo-answers',
      icon: '2️⃣',
      title: 'Direct answers up front',
      description: '40-60 word concise response first',
      dimension: 'llm_readability',
      checklistItems: [
        'Answer in first paragraph',
        'Concise 40-60 word summaries',
        'No fluff or preamble',
        'Direct factual statements',
        'Key information first'
      ]
    },
    {
      id: 'aeo-trust',
      icon: '3️⃣',
      title: 'Build trust signals',
      description: 'Authorship, credentials, fresh updates',
      dimension: 'citation_authority',
      checklistItems: [
        'Author bios with credentials',
        'Citation of sources',
        'Data and statistics',
        'Regular content updates',
        'Expert quotes and testimonials'
      ]
    },
    {
      id: 'aeo-schema',
      icon: '4️⃣',
      title: 'Schema markup',
      description: 'FAQ, HowTo, Product, Article',
      dimension: 'schema_structured_data',
      checklistItems: [
        'Product schema on all PDPs',
        'Review schema with ratings',
        'FAQ schema on key pages',
        'Organization schema',
        'Breadcrumb schema'
      ]
    },
    {
      id: 'aeo-bots',
      icon: '5️⃣',
      title: 'Allow AI bots',
      description: 'Check robots.txt for GPTBot, PerplexityBot',
      dimension: 'reputation_signals',
      checklistItems: [
        'robots.txt allows GPTBot',
        'PerplexityBot access enabled',
        'Claude-Web not blocked',
        'Gemini crawler allowed',
        'AI crawl budget managed'
      ]
    },
    {
      id: 'aeo-citations',
      icon: '6️⃣',
      title: 'Track citations',
      description: 'Measure how often you\'re "the answer"',
      dimension: 'ai_answer_quality',
      checklistItems: [
        'Monitor Perplexity citations',
        'Track ChatGPT mentions',
        'Google AI Overviews tracking',
        'Bing Chat references',
        'Citation trend analysis'
      ]
    }
  ];

  return practiceMap.map(practice => {
    const dimensionScore = scores.find((s: any) => s.dimension === practice.dimension);
    const score = dimensionScore?.score || 0;
    
    return {
      id: practice.id,
      icon: practice.icon,
      title: practice.title,
      description: practice.description,
      status: getStatusFromScore(score),
      score,
      checklistItems: practice.checklistItems.map((item, idx) => ({
        text: item,
        completed: score > 70 + (idx * 5), // Progressive completion based on score
        impact: idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low'
      })),
      dimension: practice.dimension
    };
  });
}

function getStatusFromScore(score: number): AEOPractice['status'] {
  if (score >= 85) return 'completed';
  if (score >= 75) return 'good';
  if (score >= 60) return 'partial';
  if (score >= 40) return 'needs-attention';
  return 'not-started';
}

function extractQuickWins(evaluation: Evaluation | any): QuickWinItem[] {
  const scores = evaluation.dimensionScores || [];
  const quickWins: QuickWinItem[] = [];

  // Schema quick win
  const schemaScore = scores.find((s: any) => s.dimension === 'schema_structured_data')?.score || 0;
  if (schemaScore < 80) {
    quickWins.push({
      id: 'qw-schema-faq',
      title: 'Add FAQ schema today',
      description: 'Easy schema.org markup for your FAQ pages',
      completed: false,
      estimatedMinutes: 30,
      impactScore: 15,
      category: 'technical',
      actionUrl: '/docs/schema-implementation'
    });
  }

  // Robots.txt quick win
  const botAccessScore = scores.find((s: any) => s.dimension === 'reputation_signals')?.score || 0;
  if (botAccessScore < 90) {
    quickWins.push({
      id: 'qw-robots-check',
      title: 'Check robots.txt for GPTBot access',
      description: 'Ensure AI crawlers can access your site',
      completed: false,
      estimatedMinutes: 10,
      impactScore: 12,
      category: 'technical',
      actionUrl: '/docs/ai-bot-access'
    });
  }

  // Headlines quick win
  const readabilityScore = scores.find((s: any) => s.dimension === 'llm_readability')?.score || 0;
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

  // Answer placement quick win
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

  // Citation tracking quick win
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

function generateStepByStepGuide(evaluation: Evaluation): PlaybookStep[] {
  return [
    {
      number: 1,
      title: 'Match real search intent',
      description: 'Use tools to find what questions people actually ask AI engines',
      tools: ['AnswerThePublic', 'Perplexity', 'People Also Ask', 'Searchable'],
      actions: [
        { label: 'Start Now', onClick: () => {} },
        { label: 'Learn More', href: '/docs/search-intent' }
      ],
      status: 'not-started'
    },
    {
      number: 2,
      title: 'Lead with clear, snippable answers',
      description: 'FAQ style, ≤80 words/para, answer in first 100 words',
      tools: ['Hemingway Editor', 'ChatGPT', 'Content Audit'],
      actions: [
        { label: 'View Examples', href: '/docs/answer-first-content' },
        { label: 'Audit Content', onClick: () => {} }
      ],
      status: 'not-started'
    },
    {
      number: 3,
      title: 'Add schema markup',
      description: 'FAQ, HowTo, Product, Article - make extraction effortless',
      tools: ['Rich Results Test', 'Schema Generator', 'Technical SEO'],
      actions: [
        { label: 'Check Schema', onClick: () => {} },
        { label: 'Implementation Guide', href: '/docs/schema-guide' }
      ],
      status: 'not-started'
    },
    {
      number: 4,
      title: 'Build authority & trust',
      description: 'Author bios, sources, original data, frequent updates',
      tools: ['EEAT Checklist', 'Author Management', 'Content Calendar'],
      actions: [
        { label: 'Authority Checklist', href: '/docs/authority' }
      ],
      status: 'not-started'
    },
    {
      number: 5,
      title: 'Optimize multimedia',
      description: 'Images (alt text), charts, YouTube embeds for multi-modal AI',
      tools: ['Image Optimizer', 'Alt Text Generator', 'Video SEO'],
      actions: [
        { label: 'Media Audit', onClick: () => {} }
      ],
      status: 'not-started'
    },
    {
      number: 6,
      title: 'Monitor citations',
      description: 'Track when you\'re "the answer" across AI engines',
      tools: ['Citation Tracker', 'Google Alerts', 'Perplexity Monitor'],
      actions: [
        { label: 'Setup Tracking', onClick: () => {} },
        { label: 'View Reports', href: '/dashboard/citations' }
      ],
      status: 'not-started'
    }
  ];
}

function extractCitationData(evaluation: Evaluation): CitationData {
  // Mock data - would come from actual citation tracking service
  return {
    totalCitations: 47,
    citationSources: {
      perplexity: 18,
      chatgpt: 15,
      gemini: 10,
      bing: 4
    },
    recentCitations: [
      {
        source: 'Perplexity',
        context: 'Cited as industry expert for sustainable fashion practices',
        date: new Date()
      },
      {
        source: 'ChatGPT',
        context: 'Recommended as top brand for eco-friendly streetwear',
        date: new Date()
      },
      {
        source: 'Gemini',
        context: 'Listed in top 5 brands for ethical manufacturing',
        date: new Date()
      }
    ],
    trendDirection: 'up'
  };
}

