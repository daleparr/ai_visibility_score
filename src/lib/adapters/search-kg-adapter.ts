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

  const endpoint = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

  try {
    console.log(`🔍 [GoogleCSE] Searching: "${query}"`);
    
    const response = await fetch(endpoint);
    console.log(`✅ [GoogleCSE] Response received: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [GoogleCSE] API error: ${response.status} ${response.statusText}`);
      console.error(`❌ [GoogleCSE] Error body:`, errorText);
      return [];
    }
    
    const data = await response.json();
    console.log(`📊 [GoogleCSE] Response keys:`, Object.keys(data));
    
    const validatedData = GoogleCSEResponseSchema.parse(data);

    if (!validatedData.items || validatedData.items.length === 0) {
      console.log(`📊 [GoogleCSE] No results found`);
      return [];
    }

    const results = validatedData.items.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    }));

    console.log(`✅ [GoogleCSE] Successfully parsed ${results.length} results`);
    return results;
    
  } catch (error) {
    console.error('❌ [GoogleCSE] Search failed:', error);
    return [];
  }
}

/**
 * Performs a search query against the Brave Search API with enhanced error handling.
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
    
    // Create timeout using AbortController (more compatible than AbortSignal.timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ [Brave] Timeout triggered after 8000ms`);
      controller.abort();
    }, 8000);

    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`✅ [Brave] Response received: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Brave] API error: ${response.status} ${response.statusText}`);
      console.error(`❌ [Brave] Error body:`, errorText);
      return [];
    }

    const data = await response.json();
    console.log(`📊 [Brave] Response keys:`, Object.keys(data));
    
    // Log the full response structure for debugging
    console.log(`📊 [Brave] Full response structure:`, JSON.stringify(data, null, 2));
    
    // Defensive parsing without Zod validation (in case schema is wrong)
    if (!data.web) {
      console.warn(`⚠️ [Brave] No 'web' property in response. Available keys:`, Object.keys(data));
      return [];
    }
    
    if (!data.web.results) {
      console.warn(`⚠️ [Brave] No 'results' property in web. Available keys:`, Object.keys(data.web));
      return [];
    }
    
    if (!Array.isArray(data.web.results)) {
      console.warn(`⚠️ [Brave] Results is not an array:`, typeof data.web.results);
      return [];
    }

    console.log(`📊 [Brave] Found ${data.web.results.length} raw results`);

    const results = data.web.results.map((item: any, index: number) => {
      console.log(`📄 [Brave] Processing result ${index + 1}:`, {
        title: item.title,
        url: item.url,
        description: item.description
      });
      
      return {
        rank: index + 1,
        title: item.title || 'No title',
        url: item.url || '',
        snippet: item.description || item.snippet || '',
      };
    }).filter((item: any) => {
      const hasUrl = !!item.url;
      if (!hasUrl) {
        console.warn(`⚠️ [Brave] Filtering out result without URL:`, item.title);
      }
      return hasUrl;
    });

    console.log(`✅ [Brave] Successfully parsed ${results.length} valid results`);
    results.forEach((r: any, i: number) => {
      console.log(`   ${i + 1}. ${r.title} - ${r.url}`);
    });
    
    return results;
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏰ [Brave] Request timed out after 8000ms');
    } else {
      console.error('❌ [Brave] Search failed:', error);
      if (error instanceof Error) {
        console.error('❌ [Brave] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
        });
      }
    }
    return [];
  }
}