// Sector definitions and management

import { Sector } from './types';

export const SECTOR_DEFINITIONS: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'igaming',
    name: 'iGaming & Online Gambling',
    description: 'Online casinos, sports betting, poker platforms, and gaming operators. Track how AI assistants recommend gambling sites and brands.',
    iconUrl: '/icons/sectors/igaming.svg',
    targetAudience: 'Casino Operators, Affiliate Managers, Platform Managers',
    marketSizeNotes: '$100B+ global market, highly competitive, significant brand switching',
    active: true,
    metadata: {
      promptCount: 25,
      competitiveIntensity: 'very-high',
      regulatoryComplexity: 'high',
      expectedBrands: 50,
    },
  },
  {
    slug: 'fashion',
    name: 'Fashion & Apparel',
    description: 'Clothing brands, footwear, accessories, and fashion retail. Understand AI-driven style recommendations and brand positioning.',
    iconUrl: '/icons/sectors/fashion.svg',
    targetAudience: 'Brand Managers, CMOs, Retail Executives',
    marketSizeNotes: '$1.5T global market, strong DTC movement, influencer-driven',
    active: true,
    metadata: {
      promptCount: 30,
      competitiveIntensity: 'high',
      seasonality: 'significant',
      expectedBrands: 80,
    },
  },
  {
    slug: 'politics',
    name: 'Politics & Advocacy',
    description: 'Political campaigns, advocacy groups, think tanks, and policy organizations. Monitor AI presentation of political entities.',
    iconUrl: '/icons/sectors/politics.svg',
    targetAudience: 'Campaign Managers, Communications Directors, Policy Advisors',
    marketSizeNotes: '$10B+ campaign spending, critical for reputation management',
    active: true,
    metadata: {
      promptCount: 20,
      competitiveIntensity: 'extreme',
      biasRisk: 'very-high',
      expectedBrands: 30,
    },
  },
  {
    slug: 'cpg',
    name: 'CPG & FMCG',
    description: 'Consumer packaged goods, food & beverage, household products. Track AI recommendations for everyday consumer choices.',
    iconUrl: '/icons/sectors/cpg.svg',
    targetAudience: 'Brand Managers, Marketing VPs, Category Leads',
    marketSizeNotes: '$3T+ global market, high brand loyalty, omnichannel distribution',
    active: true,
    metadata: {
      promptCount: 28,
      competitiveIntensity: 'high',
      purchaseFrequency: 'high',
      expectedBrands: 100,
    },
  },
  {
    slug: 'dtc',
    name: 'DTC Retail',
    description: 'Direct-to-consumer brands across categories. Monitor how emerging DTC brands compete in AI recommendations.',
    iconUrl: '/icons/sectors/dtc.svg',
    targetAudience: 'Founders, Growth Leads, CMOs',
    marketSizeNotes: '$150B+ market, fast-growing, digital-first brands',
    active: true,
    metadata: {
      promptCount: 25,
      competitiveIntensity: 'very-high',
      innovation: 'rapid',
      expectedBrands: 60,
    },
  },
  {
    slug: 'fintech',
    name: 'Banking & Fintech',
    description: 'Digital banks, payment platforms, lending services, investing apps. Track financial service recommendations in AI.',
    iconUrl: '/icons/sectors/fintech.svg',
    targetAudience: 'Product Managers, Marketing Heads, Growth Executives',
    marketSizeNotes: '$300B+ market valuation, high trust requirements',
    active: true,
    metadata: {
      promptCount: 22,
      competitiveIntensity: 'high',
      trustFactor: 'critical',
      regulatoryComplexity: 'high',
      expectedBrands: 40,
    },
  },
  {
    slug: 'wellness',
    name: 'Health & Wellness',
    description: 'Fitness, nutrition, mental health, supplements, wellness apps. Monitor health-related brand recommendations.',
    iconUrl: '/icons/sectors/wellness.svg',
    targetAudience: 'Brand Managers, Growth Marketers, Product Leads',
    marketSizeNotes: '$1.5T+ wellness economy, growing consumer focus',
    active: true,
    metadata: {
      promptCount: 27,
      competitiveIntensity: 'high',
      contentSensitivity: 'high',
      expectedBrands: 70,
    },
  },
  {
    slug: 'automotive',
    name: 'Mobility & Automotive',
    description: 'Auto brands, EV manufacturers, ride-sharing, micro-mobility. Track vehicle and mobility recommendations.',
    iconUrl: '/icons/sectors/automotive.svg',
    targetAudience: 'Marketing Directors, Brand Strategists, Product Managers',
    marketSizeNotes: '$3T+ global auto market, EV transition accelerating',
    active: true,
    metadata: {
      promptCount: 24,
      competitiveIntensity: 'high',
      considerationCycle: 'long',
      expectedBrands: 35,
    },
  },
  {
    slug: 'tech',
    name: 'Consumer Electronics',
    description: 'Smartphones, laptops, wearables, smart home devices. Monitor tech product recommendations in AI.',
    iconUrl: '/icons/sectors/tech.svg',
    targetAudience: 'Product Marketing, Brand Managers, Category Leads',
    marketSizeNotes: '$1T+ consumer electronics market, rapid innovation',
    active: true,
    metadata: {
      promptCount: 26,
      competitiveIntensity: 'very-high',
      productLifecycle: 'short',
      expectedBrands: 45,
    },
  },
  {
    slug: 'travel',
    name: 'Hospitality & Travel',
    description: 'Hotels, airlines, booking platforms, travel experiences. Track travel and hospitality brand visibility.',
    iconUrl: '/icons/sectors/travel.svg',
    targetAudience: 'Marketing Executives, Revenue Managers, Brand Directors',
    marketSizeNotes: '$1.5T+ travel market, strong seasonal patterns',
    active: true,
    metadata: {
      promptCount: 23,
      competitiveIntensity: 'high',
      seasonality: 'extreme',
      reviewImpact: 'critical',
      expectedBrands: 55,
    },
  },
];

// Helper functions
export function getSectorBySlug(slug: string): (Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>) | undefined {
  return SECTOR_DEFINITIONS.find(s => s.slug === slug);
}

export function getActiveSectors(): (Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>)[] {
  return SECTOR_DEFINITIONS.filter(s => s.active);
}

export function getSectorMetadata(slug: string): Record<string, any> | undefined {
  return getSectorBySlug(slug)?.metadata;
}

// Sector-specific configuration
export interface SectorConfig {
  slug: string;
  promptBatchSize: number; // How many prompts to run in one batch
  modelsToProbe: string[]; // Which models to include
  runFrequency: 'weekly' | 'monthly';
  specialConsiderations: string[];
}

export const SECTOR_CONFIGS: Record<string, SectorConfig> = {
  igaming: {
    slug: 'igaming',
    promptBatchSize: 5,
    modelsToProbe: ['gpt-4-turbo', 'claude-3-5-sonnet', 'gemini-pro', 'perplexity'],
    runFrequency: 'monthly',
    specialConsiderations: [
      'Regulatory compliance in prompts',
      'Age verification context',
      'Responsible gambling mentions',
    ],
  },
  fashion: {
    slug: 'fashion',
    promptBatchSize: 6,
    modelsToProbe: ['gpt-4-turbo', 'claude-3-5-sonnet', 'gemini-pro', 'perplexity'],
    runFrequency: 'monthly',
    specialConsiderations: [
      'Seasonal trend awareness',
      'Price point diversity',
      'Sustainability focus',
    ],
  },
  politics: {
    slug: 'politics',
    promptBatchSize: 4,
    modelsToProbe: ['gpt-4-turbo', 'claude-3-5-sonnet', 'gemini-pro', 'perplexity'],
    runFrequency: 'weekly', // More frequent due to fast-moving landscape
    specialConsiderations: [
      'Political bias detection',
      'Factual accuracy critical',
      'Source verification essential',
    ],
  },
  // ... add configs for other sectors
};

