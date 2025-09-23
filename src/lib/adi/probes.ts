// src/lib/adi/probes.ts

import { z } from 'zod';
import { Probe } from './probe-harness';

// --- 1. Schema & Structured Data Probe ---

const SchemaProbeSchema = z.object({
    gtin: z.string().optional().describe("The GTIN-13 or UPC for the product."),
    price: z.number().optional().describe("The primary price of the product."),
    currency: z.string().optional().describe("The currency of the price (e.g., USD, GBP)."),
    availability: z.boolean().optional().describe("True if the product is in stock or available for order."),
    variant_count: z.number().optional().describe("The number of different variants (e.g., size, color) available."),
    citations: z.array(z.string().url()).optional().describe("Source URLs for the extracted data."),
});

const schema_probe: Probe = {
    name: 'schema_probe',
    promptTemplate: (context) => `
        Analyze the following HTML content from a product page for the brand ${context.brand.name}.
        Extract the specified fields into a valid JSON object. If a field is not present, omit it.
        Provide citation URLs from the provided pages.

        HTML Content:
        ${context.fetchedPages.find(p => p.pageType === 'product')?.html || ''}
    `,
    schema: { /* JSON Schema representation of Zod schema would go here */ },
    zodSchema: SchemaProbeSchema,
};

// --- 2. Policy & Logistics Probe ---

const PolicyProbeSchema = z.object({
    has_returns: z.boolean().describe("True if a returns policy is mentioned."),
    window_days: z.number().optional().describe("The number of days customers have to return a product."),
    restocking_fee_pct: z.number().optional().describe("The restocking fee as a percentage, if any."),
    citations: z.array(z.string().url()).describe("The URL of the policy page."),
});

const policy_probe: Probe = {
    name: 'policy_probe',
    promptTemplate: (context) => `
        Analyze the following HTML content from an FAQ or Returns page for ${context.brand.name}.
        Extract the specified policy details into a valid JSON object.
        Provide the URL of the page where you found the information as a citation.

        HTML Content:
        ${context.fetchedPages.find(p => p.pageType === 'faq')?.html || ''}
    `,
    schema: { /* JSON Schema representation */ },
    zodSchema: PolicyProbeSchema,
};

// --- 3. Knowledge Graph & Entity Linking Probe ---

const KGProbeSchema = z.object({
    wikidata_id: z.string().optional().describe("The Wikidata Q-ID for the brand."),
    google_kg_id: z.string().optional().describe("The Google Knowledge Graph Machine ID for the brand (e.g., /g/123xyz)."),
    confidence: z.number().min(0).max(1).describe("Your confidence (0-1) that the identified entities are correct."),
});

const kg_probe: Probe = {
    name: 'kg_probe',
    promptTemplate: (context) => `
        Based on your general knowledge and by searching public knowledge graphs, identify the Wikidata and Google Knowledge Graph IDs for the brand "${context.brand.name}" with the domain ${context.brand.websiteUrl}.
        Return the IDs and your confidence in their accuracy.
    `,
    schema: { /* JSON Schema representation */ },
    zodSchema: KGProbeSchema,
};

// --- 4. Semantic Clarity Probe ---

const SemanticsProbeSchema = z.object({
    ambiguous_terms: z.array(z.string()).describe("A list of terms on the site that could be ambiguous without context."),
    disambiguations: z.array(z.object({
        term: z.string(),
        meaning: z.string().describe("The specific meaning of the term in the context of the brand."),
        url: z.string().url().describe("A URL that provides context or clarifies the meaning."),
    })).optional(),
});

const semantics_probe: Probe = {
    name: 'semantics_probe',
    promptTemplate: (context) => `
        Analyze the content from the 'About Us' page for ${context.brand.name} (${context.brand.websiteUrl}).
        Identify any terms that could be considered ambiguous (e.g., generic words, acronyms, non-unique product names).
        For each ambiguous term, provide a disambiguation that clarifies its meaning in the brand's context, along with a supporting URL.

        HTML Content:
        ${context.fetchedPages.find(p => p.pageType === 'about')?.html || ''}
    `,
    schema: { /* JSON Schema representation */ },
    zodSchema: SemanticsProbeSchema,
};


export const coreProbes: Probe[] = [
    schema_probe,
    policy_probe,
    kg_probe,
    semantics_probe,
];