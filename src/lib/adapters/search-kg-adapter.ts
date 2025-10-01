// src/lib/adapters/search-kg-adapter.ts

import { z } from 'zod';

// Zod schemas for validating API responses
const GoogleCSEResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string(),
});

const GoogleCSEResponseSchema = z.object({
  items: z.array(GoogleCSEResultSchema).optional(),
});

const BraveSearchResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
});

const BraveSearchResponseSchema = z.object({
  web: z.object({
    results: z.array(BraveSearchResultSchema),
  }),
});

// Normalized output type
export type NormalizedSearchResult = {
  rank: number;
  title: string;
  url: string;
  snippet: string;
};

/**
 * Performs a search query against Google Custom Search Engine.
 */
export async function searchWithGoogleCSE(query: string): Promise<NormalizedSearchResult[]> {
  // Temporarily disable Google CSE due to 400 errors - focus on light crawl first
  console.log('⚠️ [GoogleCSE] Temporarily disabled due to API configuration issues');
  return [];
}

/**
 * Performs a search query against the Brave Search API with bulletproof timeout.
 */
export async function searchWithBrave(query: string): Promise<NormalizedSearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    console.error('❌ [Brave] BRAVE_API_KEY is not set');
    return [];
  }

  const endpoint = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;

  try {
    console.log(`🔍 [Brave] Searching: "${query}"`);
    console.log(`🔗 [Brave] Endpoint: ${endpoint}`);
    console.log(`🚀 [Brave] Starting fetch request...`);
    
    // BULLETPROOF 3-second timeout
    const response = await Promise.race([
      fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': apiKey,
        },
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.log(`⏰ [Brave] HARD TIMEOUT after 15000ms`);
          reject(new Error('HARD_TIMEOUT'));
        }, 15000); // Increased timeout to 15 seconds
      })
    ]);

    console.log(`✅ [Brave] Response received: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ [Brave] API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Quick validation and parsing
    if (!data?.web?.results || !Array.isArray(data.web.results)) {
      console.log(`⚠️ [Brave] No results found`);
      return [];
    }

    const results = data.web.results
      .filter((item: any) => item.url && item.title)
      .map((item: any, index: number) => ({
        rank: index + 1,
        title: item.title,
        url: item.url,
        snippet: item.description || '',
      }))
      .slice(0, 5);

    console.log(`✅ [Brave] Found ${results.length} results`);
    return results;
    
  } catch (error) {
    if (error instanceof Error && error.message === 'HARD_TIMEOUT') {
      console.log(`⏰ [Brave] Timed out - using fallback URLs`);
    } else {
      console.error('❌ [Brave] Failed:', error);
    }
    
    return [];
  }
}