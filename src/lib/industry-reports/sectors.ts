// Sector definitions and management

import { Sector } from './types';

export const SECTOR_DEFINITIONS: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'ecommerce',
    name: 'E-commerce & Consumer Brands',
    description: 'Direct-to-consumer brands, fashion retailers, consumer packaged goods, wellness products. Covers clothing, beauty, fitness, home goods, food & beverage, and lifestyle brands.',
    iconUrl: '/icons/sectors/ecommerce.svg',
    targetAudience: 'Brand Managers, CMOs, E-commerce Directors, DTC Founders',
    marketSizeNotes: '$2T+ global market, high competition, rapid DTC growth',
    active: true,
    metadata: {
      subsectors: ['fashion', 'beauty', 'wellness', 'cpg', 'dtc', 'home-goods'],
      promptCount: 30,
      competitiveIntensity: 'very-high',
      expectedBrands: 100,
      marketSize: '$2T+',
    },
  },
  {
    slug: 'financial',
    name: 'Financial Services & Fintech',
    description: 'Digital banks, payment platforms, investment apps, lending services, insurance tech, and cryptocurrency. Modern financial services and banking.',
    iconUrl: '/icons/sectors/financial.svg',
    targetAudience: 'Product Managers, Marketing Heads, Fintech Founders',
    marketSizeNotes: '$300B+ market valuation, high trust requirements, strict regulation',
    active: true,
    metadata: {
      subsectors: ['banking', 'payments', 'investing', 'lending', 'crypto', 'insurance'],
      promptCount: 25,
      competitiveIntensity: 'high',
      trustFactor: 'critical',
      regulatoryComplexity: 'high',
      expectedBrands: 50,
      marketSize: '$300B+',
    },
  },
  {
    slug: 'technology',
    name: 'Technology & Software',
    description: 'Consumer electronics, smartphones, laptops, SaaS platforms, productivity tools, smart devices, and tech services.',
    iconUrl: '/icons/sectors/technology.svg',
    targetAudience: 'Product Marketing Managers, Tech CMOs, Growth Leads',
    marketSizeNotes: '$1.5T+ market, rapid innovation cycles, strong brand loyalty',
    active: true,
    metadata: {
      subsectors: ['consumer-electronics', 'saas', 'productivity', 'smart-home', 'gaming'],
      promptCount: 28,
      competitiveIntensity: 'very-high',
      productLifecycle: 'short',
      expectedBrands: 70,
      marketSize: '$1.5T+',
    },
  },
  {
    slug: 'travel',
    name: 'Travel & Hospitality',
    description: 'Hotels, airlines, booking platforms, vacation rentals, travel experiences, and tourism services.',
    iconUrl: '/icons/sectors/travel.svg',
    targetAudience: 'Marketing Executives, Revenue Managers, Hotel Brand Directors',
    marketSizeNotes: '$1.5T+ travel market, strong seasonal patterns, review-driven',
    active: true,
    metadata: {
      subsectors: ['hotels', 'airlines', 'booking-platforms', 'experiences', 'vacation-rentals'],
      promptCount: 25,
      competitiveIntensity: 'high',
      seasonality: 'extreme',
      reviewImpact: 'critical',
      expectedBrands: 60,
      marketSize: '$1.5T+',
    },
  },
  {
    slug: 'igaming',
    name: 'iGaming & Online Entertainment',
    description: 'Online casinos, sports betting, poker platforms, gaming sites, and entertainment betting services.',
    iconUrl: '/icons/sectors/igaming.svg',
    targetAudience: 'Casino Operators, Affiliate Managers, Platform Directors',
    marketSizeNotes: '$100B+ global market, highly competitive, strict regulatory environment',
    active: true,
    metadata: {
      subsectors: ['casinos', 'sports-betting', 'poker', 'daily-fantasy'],
      promptCount: 22,
      competitiveIntensity: 'extreme',
      regulatoryComplexity: 'very-high',
      expectedBrands: 40,
      marketSize: '$100B+',
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

