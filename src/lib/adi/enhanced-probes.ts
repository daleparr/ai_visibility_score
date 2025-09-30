// src/lib/adi/enhanced-probes.ts
// Enhanced probe prompts that leverage Hybrid Crawl Agent data for superior AI analysis

import { z } from 'zod';
import { Probe } from './probe-harness';

// Enhanced Schema & Structured Data Probe
const EnhancedSchemaProbeSchema = z.object({
    gtin: z.string().optional().describe("The GTIN-13 or UPC for the product."),
    price: z.number().optional().describe("The primary price of the product."),
    currency: z.string().optional().describe("The currency of the price (e.g., USD, GBP)."),
    availability: z.boolean().optional().describe("True if the product is in stock or available for order."),
    variant_count: z.number().optional().describe("The number of different variants (e.g., size, color) available."),
    schema_completeness: z.number().min(0).max(100).describe("Percentage completeness of structured data implementation."),
    missing_critical_fields: z.array(z.string()).describe("List of critical schema.org fields that are missing."),
    ai_comprehension_score: z.number().min(0).max(100).describe("How well can AI systems understand this product data?"),
    competitive_analysis: z.string().describe("How does this structured data compare to industry standards?"),
    business_impact: z.string().describe("What business opportunities are being missed due to poor structured data?"),
    citations: z.array(z.string().url()).optional().describe("Source URLs for the extracted data."),
});

const enhanced_schema_probe: Probe = {
    name: 'enhanced_schema_probe',
    promptTemplate: (context) => `
        You are an expert AI consultant analyzing structured data implementation for ${context.brand.name}.
        
        CONTEXT: You have access to comprehensive brand intelligence from multiple sources:
        - Website crawl data: ${context.hybridCrawlData?.lightCrawl ? 'Available' : 'Limited'}
        - Search engine mentions: ${context.hybridCrawlData?.braveResults?.length || 0} Brave API results, ${context.hybridCrawlData?.googleResults?.length || 0} Google CSE results
        - Business intelligence: ${JSON.stringify(context.hybridCrawlData?.businessInfo || {})}
        - Reputation signals: ${JSON.stringify(context.hybridCrawlData?.reputationAnalysis || {})}
        
        TASK: Analyze the structured data implementation with deep business reasoning:
        
        1. COMPREHENSION ASSESSMENT: How well can AI systems (ChatGPT, Claude, Perplexity, Google Bard) understand and extract information about this brand's products?
        
        2. CUSTOMER SCENARIO SIMULATION: 
           - "Hey Siri, find me products like [brand's hero product]" - Will this work?
           - "Alexa, what's the return policy for [brand]?" - Can AI answer this?
           - "ChatGPT, compare [brand] pricing to competitors" - Is the data accessible?
        
        3. COMPETITIVE BENCHMARKING: Based on the search results and business intelligence, how does this brand's structured data compare to what you'd expect from:
           - Direct competitors in their industry
           - Market leaders in e-commerce
           - Best-in-class structured data implementations
        
        4. BUSINESS IMPACT ANALYSIS: What specific revenue opportunities is this brand missing due to poor structured data?
           - Voice commerce readiness
           - AI shopping assistant compatibility  
           - Search engine rich snippets
           - Price comparison engine inclusion
        
        AVAILABLE DATA:
        Website Content: ${context.fetchedPages.find(p => p.pageType === 'product')?.html?.substring(0, 2000) || 'Limited crawl data available'}
        
        Hybrid Crawl Intelligence:
        ${JSON.stringify(context.hybridCrawlData, null, 2)}
        
        Provide a comprehensive analysis that a merchant can act on immediately.
    `,
    schema: {},
    zodSchema: EnhancedSchemaProbeSchema,
};

// Enhanced Policy & Logistics Probe
const EnhancedPolicyProbeSchema = z.object({
    has_returns: z.boolean().describe("True if a returns policy is mentioned."),
    window_days: z.number().optional().describe("The number of days customers have to return a product."),
    restocking_fee_pct: z.number().optional().describe("The restocking fee as a percentage, if any."),
    ai_accessibility_score: z.number().min(0).max(100).describe("How easily can AI systems find and understand these policies?"),
    customer_friction_analysis: z.string().describe("What friction points exist for customers trying to understand policies?"),
    competitive_policy_gap: z.string().describe("How do these policies compare to industry standards and competitors?"),
    voice_assistant_readiness: z.boolean().describe("Can voice assistants accurately answer policy questions?"),
    missing_policy_areas: z.array(z.string()).describe("Critical policy areas that are missing or unclear."),
    business_risk_assessment: z.string().describe("What business risks exist due to unclear or missing policies?"),
    citations: z.array(z.string().url()).describe("The URL of the policy page."),
});

const enhanced_policy_probe: Probe = {
    name: 'enhanced_policy_probe',
    promptTemplate: (context) => `
        You are a customer experience consultant analyzing policy clarity for ${context.brand.name}.
        
        BUSINESS CONTEXT: This brand operates in the ${context.hybridCrawlData?.businessInfo?.businessType || 'unknown'} industry, 
        founded in ${context.hybridCrawlData?.businessInfo?.foundedYear || 'unknown'}, 
        with reputation signals showing: ${context.hybridCrawlData?.reputationAnalysis?.category || 'mixed sentiment'}.
        
        CUSTOMER JOURNEY ANALYSIS: Simulate these real customer scenarios:
        
        1. PRE-PURCHASE ANXIETY: "I want to buy from this brand but I'm worried about returns"
           - Can customers easily find return policies?
           - Are the terms clear and confidence-building?
           - How does this compare to Amazon's clarity?
        
        2. AI ASSISTANT QUERIES: Test these voice/chat scenarios:
           - "What's [brand]'s return policy?"
           - "How long do I have to return items to [brand]?"
           - "Does [brand] charge restocking fees?"
           - "What's [brand]'s shipping policy?"
        
        3. COMPETITIVE INTELLIGENCE: Based on search results, how do this brand's policies compare to:
           - Industry leaders mentioned in search results: ${context.hybridCrawlData?.braveResults?.slice(0, 3).map(r => r.title).join(', ') || 'None found'}
           - Customer expectations in this market segment
           - Best practices for policy transparency
        
        4. BUSINESS IMPACT ASSESSMENT:
           - Cart abandonment risk due to unclear policies
           - Customer service burden from policy confusion  
           - Competitive disadvantage vs. clearer competitors
           - AI discoverability gaps affecting voice commerce
        
        AVAILABLE INTELLIGENCE:
        Website Policy Data: ${context.fetchedPages.find(p => p.pageType === 'faq')?.html?.substring(0, 2000) || 'Limited policy data available'}
        
        Search Intelligence: ${context.hybridCrawlData?.braveResults?.filter(r => r.snippet.toLowerCase().includes('policy') || r.snippet.toLowerCase().includes('return')).map(r => r.snippet).join(' ') || 'No policy mentions found in search results'}
        
        Business Profile: ${JSON.stringify(context.hybridCrawlData?.businessInfo || {})}
        
        Provide actionable insights that directly impact customer conversion and satisfaction.
    `,
    schema: {},
    zodSchema: EnhancedPolicyProbeSchema,
};

// Enhanced Knowledge Graph & Entity Linking Probe
const EnhancedKGProbeSchema = z.object({
    wikidata_id: z.string().optional().describe("The Wikidata Q-ID for the brand."),
    google_kg_id: z.string().optional().describe("The Google Knowledge Graph Machine ID for the brand."),
    entity_strength: z.number().min(0).max(100).describe("How well-established is this brand as a recognized entity?"),
    knowledge_gaps: z.array(z.string()).describe("What key information about this brand is missing from knowledge graphs?"),
    ai_recognition_analysis: z.string().describe("How well do AI systems recognize and understand this brand?"),
    authority_building_opportunities: z.array(z.string()).describe("Specific actions to improve knowledge graph presence."),
    competitive_entity_analysis: z.string().describe("How does this brand's entity presence compare to competitors?"),
    business_discoverability_impact: z.string().describe("How does weak entity linking affect business discoverability?"),
    confidence: z.number().min(0).max(1).describe("Your confidence (0-1) that the identified entities are correct."),
});

const enhanced_kg_probe: Probe = {
    name: 'enhanced_kg_probe',
    promptTemplate: (context) => `
        You are a digital authority consultant analyzing knowledge graph presence for ${context.brand.name}.
        
        BRAND INTELLIGENCE SUMMARY:
        - Business Type: ${context.hybridCrawlData?.businessInfo?.businessType || 'Unknown'}
        - Founded: ${context.hybridCrawlData?.businessInfo?.foundedYear || 'Unknown'}
        - Leadership: ${context.hybridCrawlData?.businessInfo?.leadership || 'Unknown'}
        - Key Products: ${context.hybridCrawlData?.businessInfo?.keyProducts?.join(', ') || 'Unknown'}
        - Market Presence: ${context.hybridCrawlData?.reputationAnalysis?.signalStrength || 'Unknown'} reputation signals
        
        COMPREHENSIVE ENTITY ANALYSIS:
        
        1. AI RECOGNITION TEST: Based on your training data and the provided intelligence:
           - Is ${context.brand.name} a recognized entity in major knowledge graphs?
           - What specific information do AI systems "know" about this brand?
           - What critical gaps exist in AI understanding?
        
        2. DISCOVERABILITY SIMULATION: Test these AI-powered discovery scenarios:
           - "Tell me about ${context.brand.name}" - What would ChatGPT/Claude say?
           - "Who are the competitors of ${context.brand.name}?" - Can AI answer accurately?
           - "What products does ${context.brand.name} make?" - Is the response complete?
        
        3. COMPETITIVE ENTITY BENCHMARKING: 
           - Compare entity strength vs. competitors mentioned in search results
           - Analyze knowledge graph completeness vs. industry leaders
           - Identify entity-building opportunities competitors are missing
        
        4. BUSINESS IMPACT OF WEAK ENTITIES:
           - Voice search discoverability ("Hey Google, tell me about [brand]")
           - AI recommendation inclusion ("ChatGPT, suggest brands like...")
           - Knowledge panel appearance in search results
           - Third-party AI tool integration potential
        
        SEARCH INTELLIGENCE ANALYSIS:
        External Mentions: ${context.hybridCrawlData?.braveResults?.length || 0} Brave results, ${context.hybridCrawlData?.googleResults?.length || 0} Google results
        Authority Signals: ${JSON.stringify(context.hybridCrawlData?.reputationAnalysis || {})}
        
        Key External References:
        ${context.hybridCrawlData?.braveResults?.slice(0, 5).map(r => `- ${r.title}: ${r.snippet}`).join('\n') || 'Limited external references found'}
        
        Provide a strategic roadmap for building authoritative entity presence that directly impacts AI discoverability.
    `,
    schema: {},
    zodSchema: EnhancedKGProbeSchema,
};

// Enhanced Semantic Clarity Probe
const EnhancedSemanticsProbeSchema = z.object({
    ambiguous_terms: z.array(z.string()).describe("Terms that could confuse AI systems without context."),
    semantic_clarity_score: z.number().min(0).max(100).describe("Overall semantic clarity for AI comprehension."),
    ai_confusion_risks: z.array(z.object({
        term: z.string(),
        confusion_risk: z.string(),
        business_impact: z.string(),
        solution: z.string()
    })).describe("Specific terms that could confuse AI systems and their business impact."),
    industry_vocabulary_alignment: z.number().min(0).max(100).describe("How well does the brand use standard industry terminology?"),
    voice_search_optimization: z.string().describe("How well-optimized is the content for voice search queries?"),
    competitive_semantic_advantage: z.string().describe("Semantic advantages or disadvantages vs. competitors."),
    ai_training_data_analysis: z.string().describe("How likely is this brand's content to be well-represented in AI training data?"),
    disambiguations: z.array(z.object({
        term: z.string(),
        meaning: z.string().describe("The specific meaning of the term in the brand's context."),
        url: z.string().url().describe("A URL that provides context or clarifies the meaning."),
    })).optional(),
});

const enhanced_semantics_probe: Probe = {
    name: 'enhanced_semantics_probe',
    promptTemplate: (context) => `
        You are a semantic AI consultant analyzing vocabulary clarity for ${context.brand.name}.
        
        BRAND SEMANTIC PROFILE:
        - Industry: ${context.hybridCrawlData?.businessInfo?.businessType || 'Unknown'}
        - Key Products: ${context.hybridCrawlData?.businessInfo?.keyProducts?.join(', ') || 'Unknown'}
        - Market Position: ${context.hybridCrawlData?.reputationAnalysis?.category || 'Unknown'}
        - External Perception: Based on ${context.hybridCrawlData?.braveResults?.length || 0} external mentions
        
        SEMANTIC INTELLIGENCE ANALYSIS:
        
        1. AI COMPREHENSION TESTING: Analyze how well AI systems understand this brand's vocabulary:
           - Are product names clear and unambiguous?
           - Does the brand use industry-standard terminology?
           - Are there confusing acronyms or jargon that could mislead AI?
        
        2. VOICE SEARCH READINESS: Test natural language query scenarios:
           - "Find me a [brand's product category] like [brand] makes"
           - "What's the difference between [brand's product A] and [brand's product B]?"
           - "Show me alternatives to [brand's hero product]"
        
        3. SEMANTIC COMPETITIVE ANALYSIS: Based on search intelligence:
           - How do competitors describe similar products/services?
           - What vocabulary gaps exist vs. market leaders?
           - Are there semantic opportunities competitors are missing?
        
        4. AI TRAINING DATA REPRESENTATION: 
           - How likely is this brand's vocabulary to be well-represented in AI training data?
           - What semantic patterns might cause AI systems to misunderstand the brand?
           - How can vocabulary be optimized for better AI comprehension?
        
        5. BUSINESS IMPACT OF SEMANTIC CONFUSION:
           - Lost voice search traffic due to unclear terminology
           - AI recommendation mismatches due to vocabulary gaps
           - Customer confusion from inconsistent product naming
           - Competitive disadvantage in AI-powered discovery
        
        CONTENT ANALYSIS:
        Brand Website Content: ${context.fetchedPages.find(p => p.pageType === 'about')?.html?.substring(0, 2000) || 'Limited content available'}
        
        External Semantic Context:
        ${context.hybridCrawlData?.braveResults?.slice(0, 3).map(r => `External Reference: ${r.title} - ${r.snippet}`).join('\n') || 'Limited external context'}
        
        Search Query Intelligence: ${JSON.stringify(context.hybridCrawlData?.searchQueries || {})}
        
        Provide specific vocabulary recommendations that will improve AI comprehension and business discoverability.
    `,
    schema: {},
    zodSchema: EnhancedSemanticsProbeSchema,
};

export const enhancedProbes: Probe[] = [
    enhanced_schema_probe,
    enhanced_policy_probe,
    enhanced_kg_probe,
    enhanced_semantics_probe,
];

// Export individual probes for selective use
export {
    enhanced_schema_probe,
    enhanced_policy_probe,
    enhanced_kg_probe,
    enhanced_semantics_probe,
};