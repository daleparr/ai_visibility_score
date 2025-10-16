// Core Prompt Framework - Version Controlled, Statistically Rigorous
// Based on experimental design principles for longitudinal brand tracking

export interface PromptTemplate {
  id: string; // e.g., "DISC_001_v1.2"
  version: string;
  category: 'discovery' | 'comparative' | 'problem-solution' | 'trend-innovation' | 'trust-authority';
  template: string; // With placeholders
  lockedVariables: string[]; // Variables that must never change
  createdAt: Date;
  lockedAt: Date; // When this version was finalized
}

export interface SectorDictionary {
  sectorSlug: string;
  variables: {
    SECTOR_CATEGORY: string[]; // Primary category terms (locked)
    SPECIFIC_USE_CASE: string[]; // Common use cases
    COMMON_PROBLEM: string[]; // Pain points
    QUALITY_ATTRIBUTES: string[]; // What defines quality
  };
  version: string; // Dictionary version
  lockedAt: Date;
}

// === FRAMEWORK: 5 Categories × 4 Prompts = 20 Per Sector ===

export const PROMPT_CATEGORIES = {
  discovery: {
    name: 'Discovery & Recommendation',
    description: 'Unbranded consumer intent queries',
    templates: [
      {
        id: 'DISC_001',
        template: 'What are the best [SECTOR_CATEGORY] options in 2025?',
        purpose: 'Broad category recommendation query',
      },
      {
        id: 'DISC_002',
        template: 'Can you recommend trusted [SECTOR_CATEGORY] brands?',
        purpose: 'Trust-focused brand discovery',
      },
      {
        id: 'DISC_003',
        template: 'I\'m looking for [SECTOR_CATEGORY] - what should I consider?',
        purpose: 'Guidance-seeking query',
      },
      {
        id: 'DISC_004',
        template: 'Which [SECTOR_CATEGORY] companies are most popular right now?',
        purpose: 'Popularity/momentum query',
      },
    ],
  },
  
  comparative: {
    name: 'Comparative Analysis',
    description: 'Head-to-head competitive landscape',
    templates: [
      {
        id: 'COMP_001',
        template: 'Compare the leading [SECTOR_CATEGORY] brands and their strengths.',
        purpose: 'Competitive landscape mapping',
      },
      {
        id: 'COMP_002',
        template: 'Which [SECTOR_CATEGORY] brand offers the best value?',
        purpose: 'Value proposition comparison',
      },
      {
        id: 'COMP_003',
        template: 'What are the main differences between top [SECTOR_CATEGORY] companies?',
        purpose: 'Differentiation analysis',
      },
      {
        id: 'COMP_004',
        template: 'Who are the market leaders in [SECTOR_CATEGORY] and why?',
        purpose: 'Leadership positioning',
      },
    ],
  },
  
  problemSolution: {
    name: 'Problem-Solution Matching',
    description: 'Buyer journey and use-case scenarios',
    templates: [
      {
        id: 'PROB_001',
        template: 'I need [SPECIFIC_USE_CASE] - which [SECTOR_CATEGORY] brands can help?',
        purpose: 'Use case to brand matching',
      },
      {
        id: 'PROB_002',
        template: 'What\'s the best [SECTOR_CATEGORY] solution for [COMMON_PROBLEM]?',
        purpose: 'Problem-specific recommendations',
      },
      {
        id: 'PROB_003',
        template: 'Which [SECTOR_CATEGORY] companies are best for beginners?',
        purpose: 'Entry-level buyer guidance',
      },
      {
        id: 'PROB_004',
        template: 'I\'m looking for premium [SECTOR_CATEGORY] - what are my options?',
        purpose: 'Premium segment mapping',
      },
    ],
  },
  
  trendInnovation: {
    name: 'Trend & Innovation',
    description: 'Emerging players and market dynamics',
    templates: [
      {
        id: 'TREND_001',
        template: 'What are the newest trends in [SECTOR_CATEGORY]?',
        purpose: 'Trend identification',
      },
      {
        id: 'TREND_002',
        template: 'Which [SECTOR_CATEGORY] companies are innovating the most?',
        purpose: 'Innovation leaders',
      },
      {
        id: 'TREND_003',
        template: 'What emerging [SECTOR_CATEGORY] brands should I watch?',
        purpose: 'Threat detection',
      },
      {
        id: 'TREND_004',
        template: 'How is the [SECTOR_CATEGORY] industry changing in 2025?',
        purpose: 'Market evolution',
      },
    ],
  },
  
  trustAuthority: {
    name: 'Trust & Authority',
    description: 'Credibility and reputation signals',
    templates: [
      {
        id: 'TRUST_001',
        template: 'Which [SECTOR_CATEGORY] brands are most trusted?',
        purpose: 'Trust positioning',
      },
      {
        id: 'TRUST_002',
        template: 'What [SECTOR_CATEGORY] companies have the best reputation?',
        purpose: 'Reputation ranking',
      },
      {
        id: 'TRUST_003',
        template: 'Who are the experts in [SECTOR_CATEGORY] that people recommend?',
        purpose: 'Expert endorsement',
      },
      {
        id: 'TRUST_004',
        template: 'Which [SECTOR_CATEGORY] brands do professionals use?',
        purpose: 'Professional adoption',
      },
    ],
  },
} as const;

// === SECTOR DICTIONARIES (Locked Variables) ===

export const SECTOR_DICTIONARIES: Record<string, SectorDictionary> = {
  fashion: {
    sectorSlug: 'fashion',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'sustainable fashion brands',
        'luxury fashion brands',
        'affordable clothing brands',
        'athletic wear brands',
      ],
      SPECIFIC_USE_CASE: [
        'work clothes',
        'formal wear',
        'casual weekend outfits',
        'athletic and gym wear',
      ],
      COMMON_PROBLEM: [
        'finding professional attire',
        'budget-friendly options under £100',
        'ethically made clothing',
        'plus-size fashion options',
      ],
      QUALITY_ATTRIBUTES: [
        'durability',
        'sustainable materials',
        'fit and sizing',
        'style versatility',
      ],
    },
  },
  
  beauty: {
    sectorSlug: 'beauty',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'skincare brands',
        'makeup brands',
        'natural beauty products',
        'anti-aging products',
      ],
      SPECIFIC_USE_CASE: [
        'anti-aging routine',
        'acne treatment',
        'sensitive skin care',
        'daily makeup routine',
      ],
      COMMON_PROBLEM: [
        'dry skin',
        'acne and breakouts',
        'fine lines and wrinkles',
        'uneven skin tone',
      ],
      QUALITY_ATTRIBUTES: [
        'ingredient transparency',
        'dermatologist-tested',
        'cruelty-free',
        'clinical results',
      ],
    },
  },
  
  tech: {
    sectorSlug: 'tech',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'smartphones',
        'laptops',
        'gaming headsets',
        'smart home devices',
      ],
      SPECIFIC_USE_CASE: [
        'professional work',
        'gaming and entertainment',
        'content creation',
        'home automation',
      ],
      COMMON_PROBLEM: [
        'finding reliable tech under £1000',
        'choosing between brands',
        'compatibility with existing devices',
        'long-term value and support',
      ],
      QUALITY_ATTRIBUTES: [
        'performance',
        'build quality',
        'customer support',
        'ecosystem integration',
      ],
    },
  },
  
  wellness: {
    sectorSlug: 'wellness',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'supplement brands',
        'fitness equipment',
        'wellness products',
        'organic health foods',
      ],
      SPECIFIC_USE_CASE: [
        'muscle building',
        'weight loss',
        'general health',
        'athletic performance',
      ],
      COMMON_PROBLEM: [
        'choosing safe supplements',
        'finding science-backed products',
        'home gym setup on budget',
        'nutrition for specific goals',
      ],
      QUALITY_ATTRIBUTES: [
        'third-party testing',
        'ingredient quality',
        'scientific backing',
        'safety certifications',
      ],
    },
  },
  
  // Add remaining 7 sectors...
};

// === PROMPT GENERATION ENGINE ===

export function generateSectorPrompts(sectorSlug: string, version: string = 'v1.0'): Array<{
  id: string;
  promptText: string;
  category: string;
  version: string;
}> {
  const dictionary = SECTOR_DICTIONARIES[sectorSlug];
  if (!dictionary) {
    throw new Error(`No dictionary found for sector: ${sectorSlug}`);
  }
  
  const prompts: Array<any> = [];
  
  // Generate all 20 prompts systematically
  for (const [categoryKey, categoryData] of Object.entries(PROMPT_CATEGORIES)) {
    for (const template of categoryData.templates) {
      // For each template, generate 1 prompt using primary SECTOR_CATEGORY
      const primaryCategory = dictionary.variables.SECTOR_CATEGORY[0];
      
      let promptText = template.template.replace('[SECTOR_CATEGORY]', primaryCategory);
      
      // Replace use case if present
      if (promptText.includes('[SPECIFIC_USE_CASE]')) {
        const useCase = dictionary.variables.SPECIFIC_USE_CASE[0];
        promptText = promptText.replace('[SPECIFIC_USE_CASE]', useCase);
      }
      
      // Replace problem if present
      if (promptText.includes('[COMMON_PROBLEM]')) {
        const problem = dictionary.variables.COMMON_PROBLEM[0];
        promptText = promptText.replace('[COMMON_PROBLEM]', problem);
      }
      
      prompts.push({
        id: `${template.id}_${sectorSlug}_${version}`,
        promptText,
        category: categoryKey,
        version,
        templateId: template.id,
        purpose: template.purpose,
      });
    }
  }
  
  return prompts;
}

// === STATISTICAL VALIDATION ===

export interface StatisticalComparison {
  metric: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercent: number;
  confidenceInterval: { lower: number; upper: number };
  pValue: number;
  cohensD: number;
  isSignificant: boolean;
  interpretation: string;
}

export function calculateStatisticalSignificance(
  currentValue: number,
  previousValue: number,
  currentSampleSize: number,
  previousSampleSize: number
): StatisticalComparison {
  // Two-proportion z-test
  const p1 = currentValue / 100; // Convert to proportion
  const p2 = previousValue / 100;
  const n1 = currentSampleSize;
  const n2 = previousSampleSize;
  
  // Pooled proportion
  const pPool = (p1 * n1 + p2 * n2) / (n1 + n2);
  
  // Standard error
  const se = Math.sqrt(pPool * (1 - pPool) * (1/n1 + 1/n2));
  
  // Z-score
  const z = (p1 - p2) / se;
  
  // P-value (two-tailed)
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));
  
  // Cohen's d (effect size)
  const pooledSD = Math.sqrt((pPool * (1 - pPool)));
  const cohensD = (p1 - p2) / pooledSD;
  
  // 95% Confidence interval
  const ci = 1.96 * se;
  const diff = currentValue - previousValue;
  
  return {
    metric: 'Mention Share',
    currentMonth: currentValue,
    previousMonth: previousValue,
    change: diff,
    changePercent: (diff / previousValue) * 100,
    confidenceInterval: {
      lower: diff - ci * 100,
      upper: diff + ci * 100,
    },
    pValue,
    cohensD,
    isSignificant: pValue < 0.05,
    interpretation: getInterpretation(pValue, cohensD),
  };
}

function normalCDF(z: number): number {
  // Approximation of standard normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

function getInterpretation(pValue: number, cohensD: number): string {
  if (pValue >= 0.05) {
    return 'No statistically significant change';
  }
  
  const absD = Math.abs(cohensD);
  if (absD < 0.2) return 'Statistically significant but trivial effect';
  if (absD < 0.5) return 'Statistically significant with small effect';
  if (absD < 0.8) return 'Statistically significant with moderate effect';
  return 'Statistically significant with large effect';
}

// === QUALITY GATES ===

export interface QualityGate {
  passed: boolean;
  gate: string;
  reason?: string;
}

export function validateResponse(responseText: string, brandsMentioned: number): QualityGate[] {
  const gates: QualityGate[] = [];
  
  // Gate 1: Word count
  const wordCount = responseText.split(/\s+/).length;
  gates.push({
    passed: wordCount >= 50 && wordCount <= 500,
    gate: 'Word Count (50-500)',
    reason: wordCount < 50 ? 'Too short' : wordCount > 500 ? 'Too long' : undefined,
  });
  
  // Gate 2: Brand mentions
  gates.push({
    passed: brandsMentioned >= 3 && brandsMentioned <= 15,
    gate: 'Brand Mentions (3-15)',
    reason: brandsMentioned < 3 ? 'Too few brands' : brandsMentioned > 15 ? 'Too many brands' : undefined,
  });
  
  // Gate 3: No promotional language
  const promotionalWords = /\b(buy now|click here|limited time|special offer|discount code)\b/i;
  gates.push({
    passed: !promotionalWords.test(responseText),
    gate: 'No Promotional Language',
    reason: promotionalWords.test(responseText) ? 'Contains promotional content' : undefined,
  });
  
  // Gate 4: Substantive content
  const hasSubstance = responseText.length > 200 && /\b(because|since|due to|known for|offers|provides)\b/i.test(responseText);
  gates.push({
    passed: hasSubstance,
    gate: 'Substantive Content',
    reason: !hasSubstance ? 'Lacks reasoning/justification' : undefined,
  });
  
  return gates;
}

// === EXPERIMENTAL CONTROLS ===

export const EXPERIMENTAL_CONTROLS = {
  timing: {
    windowHours: 48,
    description: 'All sector tests within 48-hour window',
  },
  models: {
    versions: {
      'gpt-4': 'gpt-4-turbo-2024-10-01',
      'claude': 'claude-3-5-sonnet-20241022',
      'gemini': 'gemini-1.5-pro-001',
      'perplexity': 'sonar-pro-2024-09',
    },
    updateFrequency: 'quarterly',
  },
  parameters: {
    temperature: 0.7, // Fixed for all runs
    maxTokens: 1000, // Fixed for all runs
    systemPrompt: 'You are a helpful assistant providing factual brand recommendations.',
  },
  runs: {
    perPrompt: 2, // 2 runs for statistical stability
    randomizeOrder: true, // Shuffle to avoid position bias
  },
};

// === COST CALCULATOR ===

export function calculateFrameworkCost(sectorsCount: number = 1): {
  apiCalls: number;
  estimatedCost: number;
  breakdown: {
    prompts: number;
    models: number;
    runs: number;
    totalCalls: number;
  };
} {
  const prompts = 20;
  const models = 4;
  const runs = 2;
  const totalCalls = prompts * models * runs * sectorsCount;
  
  // Average cost per call: ~£0.50
  const estimatedCost = totalCalls * 0.50;
  
  return {
    apiCalls: totalCalls,
    estimatedCost,
    breakdown: {
      prompts,
      models,
      runs,
      totalCalls,
    },
  };
}

