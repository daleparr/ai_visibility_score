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
        const urlsToFetch = new Map<PageType, string>();

        // 1. Determine URLs for About and FAQ/policy pages
        if (seedUrls?.about) {
            urlsToFetch.set('about', seedUrls.about);
        } else {
            const aboutUrl = await this.findPageUrl('about');
            if(aboutUrl) urlsToFetch.set('about', aboutUrl);
        }

        if (seedUrls?.faq) {
            urlsToFetch.set('faq', seedUrls.faq);
        } else {
            const faqUrl = await this.findPageUrl('faq');
            if(faqUrl) urlsToFetch.set('faq', faqUrl);
        }

        // 2. Determine URL for a representative Product Detail Page (PDP)
        if (seedUrls?.pdp) {
            urlsToFetch.set('product', seedUrls.pdp);
        } else {
            // In a real implementation, this would be a more sophisticated discovery method.
            // For now, we'll try a simple search to find a product page.
             const pdpUrl = await this.findPageUrl('product');
             if(pdpUrl) urlsToFetch.set('product', pdpUrl);
        }

        // 3. Fetch all determined URLs in parallel
        const fetchPromises = Array.from(urlsToFetch.entries()).map(([pageType, url]) =>
            this.fetchPage(url, pageType)
        );
        
        const results = await Promise.all(fetchPromises);
        return results.filter(result => result.status === 200); // Only return successful fetches
    }

    /**
     * Finds a a specific page type using a site-restricted search query.
     * @param pageType The type of page to find ('about', 'faq', 'product').
     * @returns A promise that resolves to the URL string or null.
     */
    private async findPageUrl(pageType: PageType): Promise<string | null> {
        let query = '';
        switch(pageType){
            case 'about':
                query = `site:${this.domain} about us`;
                break;
            case 'faq':
                query = `site:${this.domain} faq OR returns policy OR shipping`;
                break;
            case 'product':
                query = `site:${this.domain} product`; // This is a naive approach
                break;
        }

        try {
           // Prefer Brave Search if the API key is available, otherwise fall back to Bing
           // Prioritize Brave Search, fall back to Google Custom Search Engine
           const searchFunction = process.env.BRAVE_API_KEY ? searchWithBrave : searchWithGoogleCSE;
           const searchResults = await searchFunction(query);
           
            // Find the first result that is on the same domain
            const firstResultOnDomain = searchResults.find((r: { url: string; }) => new URL(r.url).hostname.includes(this.domain));
            return firstResultOnDomain ? firstResultOnDomain.url : null;
        } catch (error) {
            console.error(`Error finding ${pageType} page for ${this.domain}:`, error);
            return null;
        }
    }

    /**
     * Fetches the HTML content of a single page.
     * @param url The URL to fetch.
     * @param pageType The type of the page being fetched.
     * @returns A promise that resolves to a PageFetchResult.
     */
    private async fetchPage(url: string, pageType: PageType): Promise<PageFetchResult> {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'AIDI-Selective-Fetcher/1.0',
                    'Accept': 'text/html',
                },
            });

            if (!response.ok) {
                 return { url, pageType, html: '', contentHash: '', status: response.status };
            }

            const html = await response.text();
            const contentHash = crypto.createHash('sha256').update(html).digest('hex');

            return { url, pageType, html, contentHash, status: response.status};
        } catch (error) {
            console.error(`Failed to fetch ${url}:`, error);
            return { url, pageType, html: '', contentHash: '', status: 500 };
        }
    }
}