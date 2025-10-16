import { Platform } from '@/components/adi/shared/PlatformBadges';

/**
 * Default AI platforms for evaluation
 * Icons should be placed in /public/icons/ai-platforms/
 */
export const AI_PLATFORMS: Platform[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    model: 'gpt-4-turbo',
    icon: '/icons/ai-platforms/openai.svg',
    tested: true
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    model: 'claude-3-opus',
    icon: '/icons/ai-platforms/anthropic.svg',
    tested: true
  },
  {
    id: 'gemini',
    name: 'Gemini Pro',
    model: 'gemini-pro',
    icon: '/icons/ai-platforms/google.svg',
    tested: true
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    model: 'pplx-70b-online',
    icon: '/icons/ai-platforms/perplexity.svg',
    tested: false // Coming soon
  },
  {
    id: 'grok',
    name: 'Grok',
    model: 'grok-1',
    icon: '/icons/ai-platforms/x.svg',
    tested: false // Coming soon
  }
];

/**
 * Get platforms with scores from evaluation data
 */
export function getPlatformsWithScores(evaluationData?: any): Platform[] {
  if (!evaluationData?.platform_scores) {
    return AI_PLATFORMS;
  }

  return AI_PLATFORMS.map(platform => ({
    ...platform,
    score: evaluationData.platform_scores[platform.id]
  }));
}

/**
 * Get tested platforms only
 */
export function getTestedPlatforms(): Platform[] {
  return AI_PLATFORMS.filter(p => p.tested);
}

/**
 * Get coming soon platforms
 */
export function getComingSoonPlatforms(): Platform[] {
  return AI_PLATFORMS.filter(p => !p.tested);
}

/**
 * Get platform by ID
 */
export function getPlatformById(id: string): Platform | undefined {
  return AI_PLATFORMS.find(p => p.id === id);
}

/**
 * Format platform name for display
 */
export function formatPlatformName(platform: Platform): string {
  return platform.model ? `${platform.name} (${platform.model})` : platform.name;
}

