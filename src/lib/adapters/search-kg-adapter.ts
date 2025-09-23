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

const WikidataEntitySchema = z.object({
    id: z.string(),
    label: z.object({ value: z.string() }).optional(),
    description: z.object({ value: z.string() }).optional(),
});

const WikidataSearchResponseSchema = z.object({
    results: z.object({
        bindings: z.array(WikidataEntitySchema),
    }),
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

const GoogleKGSearchResponseSchema = z.object({
  itemListElement: z.array(z.object({
    result: z.object({
      '@id': z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  })).optional(),
});


// Normalized output types

export type NormalizedSearchResult = {
  rank: number;
  title: string;
  url: string;
  snippet: string;
};

export type KnowledgeGraphResult = {
  provider: 'wikidata' | 'google_kg';
  id: string;
  name?: string;
  description?: string;
};

/**
 * Performs a search query against the Bing Search API.
 * @param query The search query string.
 * @returns A promise that resolves to an array of normalized search results.
 */
export async function searchWithGoogleCSE(query: string): Promise<NormalizedSearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID; // Custom Search Engine ID

  if (!apiKey || !cx) {
    throw new Error('GOOGLE_API_KEY or GOOGLE_CSE_ID is not set for Custom Search.');
  }

  const endpoint = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Google CSE request failed with status ${response.status}`);
    }
    const data = await response.json();
    const validatedData = GoogleCSEResponseSchema.parse(data);

    if (!validatedData.items) return [];

    return validatedData.items.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    }));
  } catch (error) {
    console.error('Error fetching from Google Custom Search API:', error);
    return [];
  }
}

/**
 * Searches for a Wikidata entity.
 * @param entityLabel The label of the entity to search for (e.g., "Fortnum & Mason").
 * @returns A promise that resolves to a KnowledgeGraphResult or null if not found.
 */
export async function findWikidataEntity(entityLabel: string): Promise<KnowledgeGraphResult | null> {
    const endpoint = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(entityLabel)}&language=en&format=json&origin=*`;

    try {
        const response = await fetch(endpoint);
        if(!response.ok) {
            throw new Error(`Wikidata API request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        // Basic validation, more robust would use Zod
        if (data.search && data.search.length > 0) {
            const topResult = data.search[0];
            return {
                provider: 'wikidata',
                id: topResult.id,
                name: topResult.label,
                description: topResult.description,
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching from Wikidata API:', error);
        return null;
    }
}


/**
 * Searches for a Google Knowledge Graph entity.
 * @param query The query string to search for.
 * @returns A promise that resolves to a KnowledgeGraphResult or null if not found.
 */
export async function findGoogleKGEntity(query: string): Promise<KnowledgeGraphResult | null> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('GOOGLE_API_KEY for Knowledge Graph search is not set.');
    }

    const endpoint = `https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(query)}&key=${apiKey}&limit=1`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`Google KG API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const validatedData = GoogleKGSearchResponseSchema.parse(data);

        if (validatedData.itemListElement && validatedData.itemListElement.length > 0) {
            const topResult = validatedData.itemListElement[0].result;
            return {
                provider: 'google_kg',
                id: topResult['@id'],
                name: topResult.name,
                description: topResult.description,
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching from Google Knowledge Graph API:', error);
        return null;
    }
}

/**
 * Performs a search query against the Brave Search API.
 * @param query The search query string.
 * @returns A promise that resolves to an array of normalized search results.
 */
export async function searchWithBrave(query: string): Promise<NormalizedSearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    throw new Error('BRAVE_API_KEY is not set.');
  }

  const endpoint = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave Search API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const validatedData = BraveSearchResponseSchema.parse(data);

    return validatedData.web.results.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      url: item.url,
      snippet: item.description || '',
    }));
  } catch (error) {
    console.error('Error fetching from Brave Search API:', error);
    return [];
  }
}