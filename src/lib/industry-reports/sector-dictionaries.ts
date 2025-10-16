// Locked Variable Dictionaries for All Sectors
// Version controlled - DO NOT MODIFY mid-cycle

import { SectorDictionary } from './prompt-framework';

export const ALL_SECTOR_DICTIONARIES: Record<string, SectorDictionary> = {
  // 1. FASHION & APPAREL
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
        'durability and longevity',
        'sustainable materials',
        'fit and sizing accuracy',
        'style versatility',
      ],
    },
  },

  // 2. BEAUTY & PERSONAL CARE
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
        'dermatologist-tested formulas',
        'cruelty-free certification',
        'clinical results and efficacy',
      ],
    },
  },

  // 3. CONSUMER ELECTRONICS & TECH
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
        'professional work and productivity',
        'gaming and entertainment',
        'content creation',
        'home automation',
      ],
      COMMON_PROBLEM: [
        'finding reliable tech under £1000',
        'choosing between similar models',
        'compatibility with existing devices',
        'long-term value and support',
      ],
      QUALITY_ATTRIBUTES: [
        'performance and speed',
        'build quality and durability',
        'customer support',
        'ecosystem integration',
      ],
    },
  },

  // 4. HEALTH & WELLNESS
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
        'general health and wellness',
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
        'ingredient quality and purity',
        'scientific backing',
        'safety certifications',
      ],
    },
  },

  // 5. HOME & LIFESTYLE
  home: {
    sectorSlug: 'home',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'home decor brands',
        'kitchen appliances',
        'smart home products',
        'furniture brands',
      ],
      SPECIFIC_USE_CASE: [
        'small apartment living',
        'kitchen renovation',
        'home office setup',
        'smart home automation',
      ],
      COMMON_PROBLEM: [
        'finding affordable furniture',
        'space-saving solutions',
        'durable kitchen tools',
        'integrating smart devices',
      ],
      QUALITY_ATTRIBUTES: [
        'durability',
        'design aesthetics',
        'value for money',
        'ease of assembly',
      ],
    },
  },

  // 6. iGAMING
  igaming: {
    sectorSlug: 'igaming',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'online casinos',
        'sports betting sites',
        'poker platforms',
        'fantasy sports platforms',
      ],
      SPECIFIC_USE_CASE: [
        'casual entertainment',
        'professional sports betting',
        'tournament poker',
        'daily fantasy sports',
      ],
      COMMON_PROBLEM: [
        'finding trustworthy licensed sites',
        'fast payout times',
        'good welcome bonuses',
        'fair odds and terms',
      ],
      QUALITY_ATTRIBUTES: [
        'licensing and regulation',
        'payout speed',
        'game variety',
        'customer service',
      ],
    },
  },

  // 7. BANKING & FINTECH
  fintech: {
    sectorSlug: 'fintech',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'digital banking apps',
        'payment platforms',
        'investment apps',
        'lending services',
      ],
      SPECIFIC_USE_CASE: [
        'everyday banking',
        'international transfers',
        'beginner investing',
        'business payments',
      ],
      COMMON_PROBLEM: [
        'high banking fees',
        'limited international support',
        'complex investment options',
        'slow transfers',
      ],
      QUALITY_ATTRIBUTES: [
        'security and trust',
        'low fees',
        'ease of use',
        'customer support quality',
      ],
    },
  },

  // 8. CPG & FMCG
  cpg: {
    sectorSlug: 'cpg',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'food brands',
        'beverage brands',
        'household products',
        'cleaning products',
      ],
      SPECIFIC_USE_CASE: [
        'family meals',
        'healthy snacking',
        'home cleaning',
        'personal care',
      ],
      COMMON_PROBLEM: [
        'finding healthy options',
        'budget-friendly choices',
        'eco-friendly products',
        'allergen-free alternatives',
      ],
      QUALITY_ATTRIBUTES: [
        'ingredient quality',
        'value for money',
        'sustainability',
        'brand trust',
      ],
    },
  },

  // 9. POLITICS & ADVOCACY
  politics: {
    sectorSlug: 'politics',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'political organizations',
        'advocacy groups',
        'think tanks',
        'policy institutes',
      ],
      SPECIFIC_USE_CASE: [
        'policy research',
        'advocacy campaigns',
        'voter education',
        'legislative analysis',
      ],
      COMMON_PROBLEM: [
        'finding nonpartisan analysis',
        'understanding policy positions',
        'identifying credible sources',
        'tracking legislative impacts',
      ],
      QUALITY_ATTRIBUTES: [
        'nonpartisan credibility',
        'research rigor',
        'policy expertise',
        'transparency',
      ],
    },
  },

  // 10. MOBILITY & AUTOMOTIVE
  automotive: {
    sectorSlug: 'automotive',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'electric vehicles',
        'car brands',
        'ride-sharing services',
        'micro-mobility options',
      ],
      SPECIFIC_USE_CASE: [
        'family transportation',
        'urban commuting',
        'long-distance travel',
        'eco-friendly transport',
      ],
      COMMON_PROBLEM: [
        'high vehicle costs',
        'charging infrastructure concerns',
        'reliability and maintenance',
        'resale value',
      ],
      QUALITY_ATTRIBUTES: [
        'reliability and safety',
        'total cost of ownership',
        'environmental impact',
        'technology features',
      ],
    },
  },

  // 11. HOSPITALITY & TRAVEL
  travel: {
    sectorSlug: 'travel',
    version: 'v1.0',
    lockedAt: new Date('2025-01-15'),
    variables: {
      SECTOR_CATEGORY: [
        'hotel chains',
        'airlines',
        'travel booking platforms',
        'vacation rental services',
      ],
      SPECIFIC_USE_CASE: [
        'business travel',
        'family vacations',
        'luxury getaways',
        'budget backpacking',
      ],
      COMMON_PROBLEM: [
        'finding best deals',
        'reliable cancellation policies',
        'family-friendly options',
        'last-minute bookings',
      ],
      QUALITY_ATTRIBUTES: [
        'customer service',
        'value for money',
        'loyalty programs',
        'booking flexibility',
      ],
    },
  },
};

// Export helper
export function getDictionary(sectorSlug: string): SectorDictionary {
  const dict = ALL_SECTOR_DICTIONARIES[sectorSlug];
  if (!dict) {
    throw new Error(`No dictionary found for sector: ${sectorSlug}`);
  }
  return dict;
}

