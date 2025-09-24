// src/lib/adapters/selective-fetch-agent.ts

import { searchWithBrave, searchWithGoogleCSE } from './search-kg-adapter';
import { pageTypeEnum } from '../db/schema';
import crypto from 'crypto';
import { z } from 'zod';

// Manually create an enum-like object for Zod from the Drizzle enum array
const pageTypeZodEnum = {
  ...pageTypeEnum.enumValues.reduce((acc, val) => {
    acc[val] = val;
    return acc;
  }, {} as {[key: string]: string}),
};
export type PageType = (typeof pageTypeEnum.enumValues)[number];

const PageFetchResultSchema = z.object({
    url: z.string(),
    pageType: z.enum(pageTypeEnum.enumValues),
    html: z.string(),
    contentHash: z.string(),
    status: z.number(),
});

export type PageFetchResult = z.infer<typeof PageFetchResultSchema>;

/**
 * A selective-fetch agent that retrieves a few canonical pages from a brand's website.
 *
 * This agent avoids a full crawl by fetching only high-value pages like 'About Us',
 * 'FAQ/Returns', and a representative Product Detail Page (PDP).
 */
export class SelectiveFetchAgent {
    private domain: string;

    constructor(domain: string) {
        this.domain = domain;
    }

    /**
     * Executes the selective fetch process.
     * @param seedUrls Optional seed URLs for specific pages.
     * @returns A promise that resolves to an array of fetched page results.
     */
    public async run(seedUrls?: { about?: string; faq?: string; pdp?: string }): Promise<PageFetchResult[]> {
        console.log(`🔍 [SelectiveFetch] Starting page discovery for ${this.domain}`)
        const startTime = Date.now()
        const urlsToFetch = new Map<PageType, string>();

        try {
            // 1. Determine URLs for About and FAQ/policy pages with timeout
            if (seedUrls?.about) {
                urlsToFetch.set('about', seedUrls.about);
                console.log(`📋 [SelectiveFetch] Using provided about URL: ${seedUrls.about}`)
            } else {
                console.log(`🔍 [SelectiveFetch] Searching for about page...`)
                try {
                    const aboutUrl = await this.findPageUrlWithTimeout('about', 5000); // 5 second timeout
                    if(aboutUrl) {
                        urlsToFetch.set('about', aboutUrl);
                        console.log(`✅ [SelectiveFetch] Found about page: ${aboutUrl}`)
                    } else {
                        console.log(`❌ [SelectiveFetch] No about page found`)
                    }
                } catch (error) {
                    console.error(`❌ [SelectiveFetch] About page search failed:`, error);
                }
            }

            if (seedUrls?.faq) {
                urlsToFetch.set('faq', seedUrls.faq);
                console.log(`📋 [SelectiveFetch] Using provided FAQ URL: ${seedUrls.faq}`)
            } else {
                console.log(`🔍 [SelectiveFetch] Searching for FAQ page...`)
                try {
                    const faqUrl = await this.findPageUrlWithTimeout('faq', 5000); // 5 second timeout
                    if(faqUrl) {
                        urlsToFetch.set('faq', faqUrl);
                        console.log(`✅ [SelectiveFetch] Found FAQ page: ${faqUrl}`)
                    } else {
                        console.log(`❌ [SelectiveFetch] No FAQ page found`)
                    }
                } catch (error) {
                    console.error(`❌ [SelectiveFetch] FAQ page search failed:`, error);
                }
            }

            // 2. Skip product page search to avoid delays
            if (seedUrls?.pdp) {
                urlsToFetch.set('product', seedUrls.pdp);
                console.log(`📋 [SelectiveFetch] Using provided product URL: ${seedUrls.pdp}`)
            }
            // Skip automatic product discovery to avoid search delays

            console.log(`📊 [SelectiveFetch] Found ${urlsToFetch.size} pages to fetch`)

            // 3. Fetch all determined URLs in parallel with timeout
            const fetchPromises = Array.from(urlsToFetch.entries()).map(([pageType, url]) =>
                this.fetchPageWithTimeout(url, pageType, 10000) // 10 second fetch timeout
            );
            
            const results = await Promise.all(fetchPromises);
            const successfulResults = results.filter(result => result.status === 200);
            
            const totalTime = Date.now() - startTime
            console.log(`✅ [SelectiveFetch] Completed in ${totalTime}ms: ${successfulResults.length}/${results.length} pages fetched successfully`)
            
            return successfulResults;
            
        } catch (error) {
            const totalTime = Date.now() - startTime
            console.error(`❌ [SelectiveFetch] Fatal error after ${totalTime}ms:`, error);
            return []; // Return empty array instead of throwing
        }
    }

    /**
     * Finds a specific page type using a site-restricted search query with timeout protection.
     * @param pageType The type of page to find ('about', 'faq', 'product').
     * @param timeoutMs Timeout in milliseconds for the search operation.
     * @returns A promise that resolves to the URL string or null.
     */
    private async findPageUrlWithTimeout(pageType: PageType, timeoutMs: number = 10000): Promise<string | null> {
        let query = '';
        // Extract clean domain without protocol for site: queries
        const cleanDomain = this.domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
        
        switch(pageType){
            case 'about':
                // Try multiple query formats for better results
                query = `site:${cleanDomain} about us`;
                break;
            case 'faq':
                query = `site:${cleanDomain} faq OR returns policy OR shipping`;
                break;
            case 'product':
                query = `site:${cleanDomain} product`;
                break;
        }

        console.log(`🔍 [SelectiveFetch] Searching for ${pageType} with query: "${query}"`);
        console.log(`⏱️ [SelectiveFetch] Using ${timeoutMs}ms timeout`);

        try {
            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Search timeout after ${timeoutMs}ms`)), timeoutMs)
            })

            // Determine which search function to use
            const hasApiKey = !!process.env.BRAVE_API_KEY;
            console.log(`🔑 [SelectiveFetch] Using ${hasApiKey ? 'Brave' : 'Google CSE'} search API`);
            
            const searchFunction = hasApiKey ? searchWithBrave : searchWithGoogleCSE;
            
            console.log(`🚀 [SelectiveFetch] Starting search for ${pageType}...`);
            const searchResults = await Promise.race([
                searchFunction(query),
                timeoutPromise
            ])
            
            console.log(`📊 [SelectiveFetch] Search returned ${searchResults.length} results`);
            
            // Find the first result that is on the same domain
            const firstResultOnDomain = searchResults.find((r: { url: string; }) => {
                try {
                    const resultDomain = new URL(r.url).hostname;
                    const matches = resultDomain.includes(this.domain.replace(/^https?:\/\//, ''));
                    console.log(`🔗 [SelectiveFetch] Checking result: ${r.url} (${resultDomain}) - matches: ${matches}`);
                    return matches;
                } catch (error) {
                    console.warn(`⚠️ [SelectiveFetch] Invalid URL in search result: ${r.url}`);
                    return false;
                }
            })
            
            if (firstResultOnDomain) {
                console.log(`✅ [SelectiveFetch] Found ${pageType} page: ${firstResultOnDomain.url}`);
                return firstResultOnDomain.url;
            } else {
                console.log(`❌ [SelectiveFetch] No matching ${pageType} page found in search results`);
                return this.getFallbackUrl(pageType);
            }
            
        } catch (error) {
            console.error(`❌ [SelectiveFetch] Search failed for ${pageType} page on ${this.domain}:`, error);
            console.log(`🔄 [SelectiveFetch] Using fallback URL for ${pageType}`);
            
            // FALLBACK: Use common URL patterns instead of search
            return this.getFallbackUrl(pageType);
        }
    }

    private getFallbackUrl(pageType: PageType): string | null {
        const baseUrl = this.domain.startsWith('http') ? this.domain : `https://${this.domain}`;
        
        let fallbackUrl: string | null = null;
        switch(pageType) {
            case 'about':
                fallbackUrl = `${baseUrl}/about`;
                break;
            case 'faq':
                fallbackUrl = `${baseUrl}/faq`;
                break;
            case 'product':
                // Skip product page if we can't find it via search
                fallbackUrl = null;
                break;
            default:
                fallbackUrl = null;
        }
        
        if (fallbackUrl) {
            console.log(`🔄 [SelectiveFetch] Using fallback URL for ${pageType}: ${fallbackUrl}`);
        } else {
            console.log(`⏭️ [SelectiveFetch] No fallback available for ${pageType}, skipping`);
        }
        
        return fallbackUrl;
    }

    /**
     * Fetches the HTML content of a single page with timeout protection.
     * @param url The URL to fetch.
     * @param pageType The type of the page being fetched.
     * @param timeoutMs Timeout in milliseconds for the fetch operation.
     * @returns A promise that resolves to a PageFetchResult.
     */
    private async fetchPageWithTimeout(url: string, pageType: string, timeoutMs: number = 5000): Promise<any> {
        console.log(`🌐 [SelectiveFetch] Fetching ${pageType}: ${url}`);
        
        try {
            // BULLETPROOF 5-second timeout for page fetching
            const response = await Promise.race([
                fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; AI-Visibility-Bot/1.0)',
                    },
                }),
                new Promise<never>((_, reject) => {
                    setTimeout(() => {
                        console.log(`⏰ [SelectiveFetch] HARD TIMEOUT fetching ${url} after ${timeoutMs}ms`);
                        reject(new Error('FETCH_TIMEOUT'));
                    }, timeoutMs);
                })
            ]);

            if (!response.ok) {
                console.warn(`⚠️ [SelectiveFetch] HTTP ${response.status} for ${url}`);
                return { status: response.status, content: '', url, pageType };
            }

            const content = await response.text();
            console.log(`✅ [SelectiveFetch] Successfully fetched ${url} (${content.length} chars)`);
            
            return {
                status: 200,
                content,
                url,
                pageType,
                contentLength: content.length
            };
            
        } catch (error) {
            if (error instanceof Error && error.message === 'FETCH_TIMEOUT') {
                console.log(`⏰ [SelectiveFetch] Fetch timeout for ${url} - continuing with empty content`);
            } else {
                console.warn(`⚠️ [SelectiveFetch] Failed to fetch ${url}:`, error);
            }
            
            return { status: 0, content: '', url, pageType };
        }
    }
}