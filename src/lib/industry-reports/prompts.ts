// Sector-specific prompt libraries
// These are carefully crafted to be unbiased, brand-neutral queries that reflect real consumer behavior

import { SectorPrompt } from './types';

type PromptTemplate = Omit<SectorPrompt, 'id' | 'sectorId' | 'createdAt' | 'updatedAt'>;

// iGaming & Online Gambling Prompts
export const IGAMING_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the most reliable online casinos for real money play in 2025?",
    promptType: 'head',
    intentCategory: 'recommendation',
    geographicScope: 'global',
    temporalContext: '2025',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I'm looking for sports betting platforms with the best odds and fast payouts. What should I consider?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    geographicScope: 'us',
    temporalContext: 'current',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which online poker sites have the largest player pools and best tournament schedules?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 5,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What are safe and trustworthy gambling sites for beginners?",
    promptType: 'head',
    intentCategory: 'recommendation',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true, includeContext: 'safety-focused' },
    active: true,
  },
  {
    promptText: "How do I choose a licensed online casino with good customer service?",
    promptType: 'long-tail',
    intentCategory: 'research',
    expectedBrandCount: 4,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 20 more igaming prompts...
];

// Fashion & Apparel Prompts
export const FASHION_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the best minimalist sneaker brands for everyday wear in 2025?",
    promptType: 'head',
    intentCategory: 'recommendation',
    temporalContext: '2025',
    expectedBrandCount: 10,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I'm looking for sustainable athleisure brands. What should I consider?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true, includeContext: 'sustainability' },
    active: true,
  },
  {
    promptText: "Which clothing brands offer the best quality-to-price ratio for workwear?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 9,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What are some emerging fashion brands that focus on ethical manufacturing?",
    promptType: 'long-tail',
    intentCategory: 'research',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Where can I find high-quality denim under $150?",
    promptType: 'mid-tail',
    intentCategory: 'recommendation',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What luxury watch brands offer the best investment value?",
    promptType: 'head',
    intentCategory: 'comparison',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 24 more fashion prompts...
];

// CPG & FMCG Prompts
export const CPG_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the healthiest breakfast cereal brands for families?",
    promptType: 'head',
    intentCategory: 'recommendation',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which laundry detergent brands work best for sensitive skin?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What are eco-friendly alternatives to traditional cleaning products?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    expectedBrandCount: 9,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I'm looking for organic baby food brands. What are my options?",
    promptType: 'mid-tail',
    intentCategory: 'recommendation',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which coffee brands offer the best value for daily brewing?",
    promptType: 'head',
    intentCategory: 'comparison',
    expectedBrandCount: 10,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 23 more CPG prompts...
];

// DTC Retail Prompts
export const DTC_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the best direct-to-consumer mattress brands in 2025?",
    promptType: 'head',
    intentCategory: 'recommendation',
    temporalContext: '2025',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which DTC luggage brands offer the most durable products?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I'm interested in trying meal kit delivery services. What are the popular options?",
    promptType: 'head',
    intentCategory: 'research',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What are innovative DTC pet care brands?",
    promptType: 'long-tail',
    intentCategory: 'recommendation',
    expectedBrandCount: 5,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which online eyewear brands provide the best virtual try-on experience?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 20 more DTC prompts...
];

// Fintech Prompts
export const FINTECH_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the most user-friendly mobile banking apps in 2025?",
    promptType: 'head',
    intentCategory: 'recommendation',
    temporalContext: '2025',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which investment apps are best for beginner investors?",
    promptType: 'head',
    intentCategory: 'recommendation',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I need a business checking account with low fees. What are my options?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What payment platforms work best for international transfers?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which digital banks offer the highest interest rates on savings?",
    promptType: 'head',
    intentCategory: 'comparison',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 17 more fintech prompts...
];

// Wellness Prompts
export const WELLNESS_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are reputable fitness apps with personalized workout plans?",
    promptType: 'head',
    intentCategory: 'recommendation',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which meditation and mindfulness apps are most effective for beginners?",
    promptType: 'head',
    intentCategory: 'recommendation',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I'm looking for science-backed supplement brands. What should I consider?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What are the best meal tracking apps for nutrition goals?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which online therapy platforms have licensed professionals?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    expectedBrandCount: 5,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 22 more wellness prompts...
];

// Automotive Prompts
export const AUTOMOTIVE_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the most reliable electric vehicles for families in 2025?",
    promptType: 'head',
    intentCategory: 'recommendation',
    temporalContext: '2025',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which car brands offer the best warranty and after-sales service?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 9,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I'm looking for affordable electric scooter brands for urban commuting. What are my options?",
    promptType: 'long-tail',
    intentCategory: 'recommendation',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What luxury SUV brands hold their value best?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which ride-sharing services are available in major US cities?",
    promptType: 'head',
    intentCategory: 'research',
    geographicScope: 'us',
    expectedBrandCount: 4,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 19 more automotive prompts...
];

// Tech/Consumer Electronics Prompts
export const TECH_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the best smartphones for photography in 2025?",
    promptType: 'head',
    intentCategory: 'recommendation',
    temporalContext: '2025',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which laptop brands offer the best value for students?",
    promptType: 'head',
    intentCategory: 'comparison',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I'm looking for noise-canceling headphones for travel. What are the top options?",
    promptType: 'mid-tail',
    intentCategory: 'recommendation',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What smart home ecosystems integrate best with each other?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 5,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which fitness tracker brands provide the most accurate health metrics?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 21 more tech prompts...
];

// Travel & Hospitality Prompts
export const TRAVEL_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the best hotel loyalty programs for frequent travelers?",
    promptType: 'head',
    intentCategory: 'comparison',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which airlines offer the most reliable service for international flights?",
    promptType: 'head',
    intentCategory: 'comparison',
    expectedBrandCount: 10,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "I'm planning a vacation. Which travel booking platforms offer the best deals?",
    promptType: 'head',
    intentCategory: 'recommendation',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What are unique boutique hotel brands for experiential travel?",
    promptType: 'long-tail',
    intentCategory: 'recommendation',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which cruise lines are best for families with young children?",
    promptType: 'mid-tail',
    intentCategory: 'comparison',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 18 more travel prompts...
];

// Politics & Advocacy Prompts
export const POLITICS_PROMPTS: PromptTemplate[] = [
  {
    promptText: "What are the major advocacy organizations working on climate change policy?",
    promptType: 'head',
    intentCategory: 'research',
    expectedBrandCount: 8,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which think tanks focus on economic policy research?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What organizations work on voting rights and election integrity?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "Which nonprofit organizations focus on healthcare policy advocacy?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    expectedBrandCount: 6,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  {
    promptText: "What are prominent organizations advocating for education reform?",
    promptType: 'mid-tail',
    intentCategory: 'research',
    expectedBrandCount: 7,
    biasControls: { brandNeutral: true, avoidSuperlatives: true },
    active: true,
  },
  // Add 15 more politics prompts...
];

// Map sector slugs to prompt arrays
export const PROMPT_LIBRARY: Record<string, PromptTemplate[]> = {
  igaming: IGAMING_PROMPTS,
  fashion: FASHION_PROMPTS,
  cpg: CPG_PROMPTS,
  dtc: DTC_PROMPTS,
  fintech: FINTECH_PROMPTS,
  wellness: WELLNESS_PROMPTS,
  automotive: AUTOMOTIVE_PROMPTS,
  tech: TECH_PROMPTS,
  travel: TRAVEL_PROMPTS,
  politics: POLITICS_PROMPTS,
};

// Helper to get prompts for a sector
export function getPromptsForSector(sectorSlug: string): PromptTemplate[] {
  return PROMPT_LIBRARY[sectorSlug] || [];
}

// Helper to categorize prompts
export function categorizePrompts(prompts: PromptTemplate[]) {
  return {
    head: prompts.filter(p => p.promptType === 'head'),
    midTail: prompts.filter(p => p.promptType === 'mid-tail'),
    longTail: prompts.filter(p => p.promptType === 'long-tail'),
    byIntent: {
      recommendation: prompts.filter(p => p.intentCategory === 'recommendation'),
      comparison: prompts.filter(p => p.intentCategory === 'comparison'),
      research: prompts.filter(p => p.intentCategory === 'research'),
      troubleshooting: prompts.filter(p => p.intentCategory === 'troubleshooting'),
    },
  };
}

