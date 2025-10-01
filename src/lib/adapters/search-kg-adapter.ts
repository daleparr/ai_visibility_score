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
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    console.error('❌ [GoogleCSE] GOOGLE_API_KEY or GOOGLE_CSE_ID is not set');
    return [];
  }

  // Temporarily disable Google CSE due to 400 errors - focus on light crawl first
  console.log('⚠️ [GoogleCSE] Temporarily disabled due to API configuration issues');
  return [];

  const endpoint = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

  try {
    console.log(`🔍 [GoogleCSE] Searching: "${query}"`);
    
    const response = await fetch(endpoint);
    console.log(`✅ [GoogleCSE] Response received: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [GoogleCSE] API error: ${response.status} ${response.statusText}`);
      console.error(`❌ [GoogleCSE] Error body:`, JSON.parse(errorText));
      console.error(`❌ [GoogleCSE] Query that failed: "${query}"`);
      console.error(`❌ [GoogleCSE] Full endpoint: ${endpoint}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`📊 [GoogleCSE] Response keys:`, Object.keys(data));
    
    const validatedData = GoogleCSEResponseSchema.parse(data);

    // Check if items exists and has content
    if (!validatedData.items || !Array.isArray(validatedData.items) || validatedData.items!.length === 0) {
      console.log(`📊 [GoogleCSE] No results found`);
      return [];
    }

    // At this point, validatedData.items is guaranteed to be a non-empty array
    const results = validatedData.items!.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    }));

    console.log(`✅ [GoogleCSE] Successfully parsed ${results.length} results`);
    return results;
    
  } catch (error) {
    console.error('❌ [GoogleCSE] Search failed:', error);
    if (error instanceof Error) {
      console.error('❌ [GoogleCSE] Error details:', {
        message: error.message,
        query: query,
        endpoint: endpoint.replace(apiKey, 'REDACTED'),
        apiKeyLength: apiKey?.length || 0,
        cseIdLength: cx?.length || 0
      });
      
      // If it's a 400 error, may indicate configuration issue
      if (error.message.includes('400')) {
        console.warn('⚠️ [GoogleCSE] 400 error detected - may indicate configuration issue');
        console.warn('⚠️ [GoogleCSE] Continuing with Brave API only for this request');
      }
    }
    return [];
  }
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