# ADI Agent Catalog

## Overview

This catalog provides detailed documentation for all agents in the AI Discoverability Index (ADI) system. Each agent is specialized for specific evaluation tasks and contributes unique insights to the overall visibility assessment.

---

## Agent Classification System

### **Execution Tiers**
- **Fast Agents**: Execute in Netlify functions (8-second limit) for immediate results
- **Slow Agents**: Execute in background functions (15-minute limit) with intelligent queuing

### **Priority Levels**
- **CRITICAL**: Must complete successfully (evaluation fails without them)
- **HIGH**: Important for quality results (significant impact on score)
- **MEDIUM**: Valuable but can be skipped if necessary
- **LOW**: Optional, nice-to-have insights
- **OPTIONAL**: Future agents, experimental features

---

## Fast Agents (Immediate Execution)

### 🔍 **Schema Agent**
```typescript
Classification: Fast Agent
Priority: N/A (Fast agents don't use priority system)
Timeout: 8 seconds (Netlify function limit)
Dependencies: None
Parallelizable: Yes
```

#### **Purpose**
Extracts and analyzes structured data markup (JSON-LD, microdata, RDFa) to assess how well a website presents machine-readable information to search engines and AI systems.

#### **Key Capabilities**
- **JSON-LD Parsing**: Extract and validate JSON-LD structured data
- **Microdata Analysis**: Parse HTML microdata attributes
- **RDFa Processing**: Process RDFa markup in HTML
- **Schema Validation**: Validate against Schema.org standards
- **Completeness Assessment**: Evaluate structured data coverage

#### **Output Metrics**
```typescript
interface SchemaAgentOutput {
  structuredDataScore: number        // 0-100 quality score
  schemaTypes: string[]             // Detected schema types
  completenessRatio: number         // Coverage percentage
  validationErrors: string[]        // Schema validation issues
  richSnippetPotential: number      // Rich snippet eligibility
}
```

#### **Evaluation Criteria**
- **Presence**: Does structured data exist?
- **Validity**: Is it properly formatted and valid?
- **Completeness**: How comprehensive is the coverage?
- **Relevance**: Does it match the content and business type?
- **Rich Snippet Potential**: Likelihood of generating rich snippets

#### **Common Issues Detected**
- Missing or incomplete structured data
- Invalid JSON-LD syntax
- Mismatched schema types
- Missing required properties
- Deprecated schema usage

---

### 🧠 **Semantic Agent**
```typescript
Classification: Fast Agent
Priority: N/A
Timeout: 8 seconds
Dependencies: Schema Agent (for enhanced context)
Parallelizable: Yes
```

#### **Purpose**
Analyzes content semantics, topical relevance, and natural language patterns to assess how well AI systems can understand and categorize the website's content.

#### **Key Capabilities**
- **Topic Classification**: Identify main topics and themes
- **Semantic Density**: Measure topic focus and depth
- **Entity Recognition**: Extract and classify named entities
- **Content Coherence**: Assess logical flow and structure
- **Language Quality**: Evaluate readability and clarity

#### **Output Metrics**
```typescript
interface SemanticAgentOutput {
  topicRelevanceScore: number       // 0-100 topic focus score
  semanticDensity: number          // Content depth measure
  entityCount: number              // Named entities found
  coherenceScore: number           // Content flow quality
  readabilityScore: number         // Text readability
  primaryTopics: string[]          // Main topic categories
}
```

#### **Analysis Techniques**
- **TF-IDF Analysis**: Term frequency-inverse document frequency
- **Named Entity Recognition**: Person, organization, location extraction
- **Sentiment Analysis**: Overall content sentiment
- **Topic Modeling**: Latent topic discovery
- **Readability Metrics**: Flesch-Kincaid, SMOG index

#### **Scoring Factors**
- **Topic Consistency**: How well content stays on topic
- **Semantic Richness**: Depth and variety of semantic information
- **Entity Density**: Appropriate use of named entities
- **Content Quality**: Professional writing and structure
- **AI Comprehension**: How easily AI can parse the content

---

### 🏛️ **Brand Heritage Agent**
```typescript
Classification: Fast Agent
Priority: N/A
Timeout: 8 seconds
Dependencies: Schema Agent
Parallelizable: Yes
```

#### **Purpose**
Analyzes brand consistency, heritage signals, and authority indicators to assess how well a website establishes and maintains brand credibility.

#### **Key Capabilities**
- **Brand Consistency**: Logo, colors, messaging alignment
- **Heritage Signals**: About pages, history, timeline content
- **Authority Indicators**: Awards, certifications, testimonials
- **Trust Signals**: Contact information, policies, guarantees
- **Social Proof**: Customer reviews, case studies, partnerships

#### **Output Metrics**
```typescript
interface BrandHeritageOutput {
  brandConsistencyScore: number     // 0-100 consistency rating
  heritageSignalStrength: number    // Historical depth indicator
  authorityScore: number           // Credibility assessment
  trustSignalCount: number         // Trust elements found
  socialProofStrength: number      // Social validation level
}
```

#### **Heritage Indicators**
- **Company History**: Founding date, milestones, evolution
- **Leadership Information**: Team pages, executive bios
- **Awards & Recognition**: Industry awards, certifications
- **Media Coverage**: Press mentions, news articles
- **Customer Testimonials**: Reviews, case studies, success stories

#### **Trust Signals Evaluated**
- Contact information completeness
- Privacy policy and terms of service
- Security certificates and badges
- Return/refund policies
- Customer service accessibility

---

### 📊 **Score Aggregator**
```typescript
Classification: Fast Agent
Priority: N/A
Timeout: 8 seconds
Dependencies: All other agents
Parallelizable: No (must wait for all inputs)
```

#### **Purpose**
Combines results from all other agents into a comprehensive ADI score using weighted algorithms and confidence metrics.

#### **Key Capabilities**
- **Weighted Scoring**: Apply importance weights to different metrics
- **Confidence Calculation**: Assess reliability of overall score
- **Normalization**: Standardize scores across different scales
- **Trend Analysis**: Compare against historical baselines
- **Recommendation Generation**: Suggest improvement areas

#### **Scoring Algorithm**
```typescript
interface ScoringWeights {
  crawlAgent: 0.25        // 25% - Foundation data quality
  llmTestAgent: 0.20      // 20% - AI visibility
  schemaAgent: 0.15       // 15% - Structured data
  semanticAgent: 0.15     // 15% - Content quality
  geoVisibilityAgent: 0.10 // 10% - Geographic reach
  sentimentAgent: 0.05    // 5% - Brand sentiment
  commerceAgent: 0.05     // 5% - E-commerce optimization
  citationAgent: 0.03     // 3% - Media mentions
  brandHeritageAgent: 0.02 // 2% - Brand authority
}
```

#### **Output Metrics**
```typescript
interface FinalADIScore {
  overallScore: number              // 0-100 final ADI score
  confidenceLevel: number           // 0-1 confidence in score
  categoryBreakdown: {              // Score by category
    technicalOptimization: number
    contentQuality: number
    aiVisibility: number
    brandAuthority: number
    userExperience: number
  }
  improvementAreas: string[]        // Recommended focus areas
  benchmarkComparison: {            // Industry comparison
    industryAverage: number
    percentileRank: number
  }
}
```

---

## Slow Agents (Background Execution)

### 🕷️ **Crawl Agent** (CRITICAL Priority)
```typescript
Classification: Slow Agent
Priority: CRITICAL
Timeout Strategy: 3min → 5min → 10min → 15min
Dependencies: None (foundation agent)
Parallelizable: No
Fallback: Minimal homepage crawl
```

#### **Purpose**
Serves as the foundation agent, extracting website content, processing sitemaps, and discovering URLs to provide essential data for all other agents.

#### **Key Capabilities**
- **Sitemap Discovery**: Find and parse sitemap.xml files
- **BFS Sitemap Processing**: Breadth-first search through sitemap hierarchies
- **Content Extraction**: HTML parsing with anti-bot evasion
- **URL Discovery**: Intelligent page discovery and prioritization
- **Robots.txt Analysis**: Crawling permission assessment
- **Performance Monitoring**: Page load times and technical metrics

#### **Advanced Features**
```typescript
interface CrawlAgentConfig {
  // Sitemap Processing (BFS Algorithm)
  maxSitemapIndexes: 1              // Sitemap index files to process
  maxContentSitemaps: 2             // Content sitemaps to process
  maxUrlsPerSitemap: 20            // URLs to extract per sitemap
  maxTotalUrls: 1500               // Total URL discovery limit
  
  // Anti-Bot Evasion
  userAgentRotation: true          // Rotate user agents
  requestDelays: [800, 1500]       // Random delays (ms)
  sessionPersistence: true         // Maintain session cookies
  referrerSpoofing: true          // Use realistic referrers
  
  // Content Processing
  htmlTimeout: 30000              // HTML extraction timeout
  maxContentLength: 5000000       // 5MB content limit
  enableJavaScript: false         // Serverless-compatible mode
}
```

#### **Sitemap Processing Algorithm**
```typescript
// Two-phase BFS processing
Phase 1: Sitemap Index Discovery
├── Process up to 1 sitemap index file
├── Extract sub-sitemap URLs
├── Classify as index vs content sitemaps
└── Add to appropriate queues

Phase 2: Content Sitemap Processing  
├── Process up to 2 content sitemaps
├── Extract actual page URLs
├── Apply priority scoring
└── Return prioritized URL list
```

#### **Output Data Structure**
```typescript
interface CrawlAgentOutput {
  discoveredUrls: SitemapUrl[]      // Prioritized URL list
  sitemapData: {
    indexesProcessed: number
    contentSitemapsProcessed: number
    totalUrlsDiscovered: number
    processingTime: number
  }
  contentData: {
    htmlContent: string             // Main page HTML
    extractedText: string          // Clean text content
    metaData: PageMetadata         // Title, description, etc.
    structuredData: any[]          // JSON-LD, microdata
  }
  technicalMetrics: {
    loadTime: number               // Page load time
    contentSize: number            // Content size in bytes
    httpStatus: number             // HTTP response code
    redirectChain: string[]        // Redirect sequence
  }
}
```

#### **Fallback Strategies**
1. **Minimal Mode**: Skip sitemap processing, crawl homepage only (30s timeout)
2. **Graceful Degradation**: Return partial results with lower confidence
3. **Never Skip**: Critical agent - must provide some result for evaluation to continue

#### **Common Challenges Handled**
- Large enterprise sitemaps (Nike.com: 100+ sitemap indexes)
- Anti-bot protection (Cloudflare, custom solutions)
- Dynamic content loading (JavaScript-heavy sites)
- Rate limiting and IP blocking
- Malformed or nested sitemap structures

---

### 🤖 **LLM Test Agent** (HIGH Priority)
```typescript
Classification: Slow Agent
Priority: HIGH
Timeout Strategy: 2min → 3min → 5min
Dependencies: Crawl Agent
Parallelizable: Yes
Fallback: Reduced queries, single model
```

#### **Purpose**
Tests website visibility across multiple AI models by querying them with brand-related questions and analyzing responses for accurate brand representation.

#### **Key Capabilities**
- **Multi-Model Testing**: Test across different AI models (GPT, Claude, etc.)
- **Query Generation**: Create relevant brand-specific queries
- **Response Analysis**: Parse AI responses for brand mentions
- **Accuracy Assessment**: Evaluate correctness of AI-provided information
- **Visibility Scoring**: Quantify brand visibility in AI systems

#### **Testing Framework**
```typescript
interface LLMTestConfig {
  models: AIModel[]               // AI models to test
  queryTypes: QueryType[]         // Types of queries to generate
  maxQueries: 10                 // Maximum queries per model
  responseTimeout: 30000         // Response timeout per query
  accuracyThreshold: 0.8         // Minimum accuracy for positive score
}

interface AIModel {
  name: string                   // Model identifier
  endpoint: string              // API endpoint
  apiKey: string               // Authentication
  maxTokens: number            // Response length limit
  temperature: number          // Response creativity
}

enum QueryType {
  DIRECT_BRAND = "What is [brand]?",
  PRODUCT_INQUIRY = "Tell me about [brand] products",
  COMPARISON = "Compare [brand] to competitors",
  LOCATION = "Where can I find [brand]?",
  HISTORY = "What is the history of [brand]?"
}
```

#### **Analysis Methodology**
```typescript
interface ResponseAnalysis {
  brandMentioned: boolean        // Was brand mentioned?
  accuracyScore: number         // 0-1 information accuracy
  sentimentScore: number        // Response sentiment toward brand
  completenessScore: number     // How complete was the response?
  relevanceScore: number        // How relevant to the query?
  competitorMentions: string[]  // Other brands mentioned
}
```

#### **Scoring Algorithm**
```typescript
calculateLLMVisibilityScore(responses: ResponseAnalysis[]): number {
  const weights = {
    mentionRate: 0.4,           // How often brand is mentioned
    accuracy: 0.3,              // Accuracy of information
    sentiment: 0.15,            // Positive sentiment
    completeness: 0.15          // Response completeness
  }
  
  const mentionRate = responses.filter(r => r.brandMentioned).length / responses.length
  const avgAccuracy = responses.reduce((sum, r) => sum + r.accuracyScore, 0) / responses.length
  const avgSentiment = responses.reduce((sum, r) => sum + r.sentimentScore, 0) / responses.length
  const avgCompleteness = responses.reduce((sum, r) => sum + r.completenessScore, 0) / responses.length
  
  return (
    mentionRate * weights.mentionRate +
    avgAccuracy * weights.accuracy +
    avgSentiment * weights.sentiment +
    avgCompleteness * weights.completeness
  ) * 100
}
```

#### **Fallback Strategies**
1. **Minimal Mode**: Reduce to 2 queries, 1 model (60s timeout)
2. **Graceful Degradation**: Return results from successful queries only
3. **Skip if Failed**: Can be skipped if consistently failing (affects score significantly)

---

### 🌍 **Geo Visibility Agent** (HIGH Priority)
```typescript
Classification: Slow Agent
Priority: HIGH
Timeout Strategy: 2min → 3min → 4min
Dependencies: Crawl Agent
Parallelizable: Yes
Fallback: Single location testing
```

#### **Purpose**
Tests brand visibility from different geographic locations to assess global reach and regional optimization.

#### **Key Capabilities**
- **Multi-Location Testing**: Test from various geographic regions
- **Search Result Analysis**: Analyze search results by location
- **Localization Detection**: Identify geo-specific content variations
- **Market Penetration Assessment**: Evaluate regional visibility strength
- **CDN Performance**: Test content delivery across regions

#### **Geographic Testing Framework**
```typescript
interface GeoTestConfig {
  testLocations: GeoLocation[]    // Locations to test from
  searchEngines: SearchEngine[]  // Search engines to query
  queryVariations: string[]      // Location-specific queries
  maxResultsPerLocation: 10      // Search results to analyze
}

interface GeoLocation {
  country: string               // Country code (US, UK, JP, etc.)
  region: string               // State/province
  city: string                 // City name
  coordinates: [number, number] // Lat/lng
  language: string             // Primary language
  currency: string             // Local currency
}
```

#### **Testing Methodology**
```typescript
interface GeoTestResult {
  location: GeoLocation
  searchResults: SearchResult[]
  brandVisibility: {
    rankPosition: number        // Position in search results (1-10+)
    snippetQuality: number     // Quality of search snippet
    localizedContent: boolean  // Content adapted for region
    languageMatch: boolean     // Content in local language
    currencyMatch: boolean     // Prices in local currency
  }
  performanceMetrics: {
    loadTime: number           // Page load time from location
    cdnEffectiveness: number   // CDN performance score
    serverResponse: number     // Server response time
  }
}
```

#### **Regional Analysis**
- **North America**: US, Canada, Mexico testing
- **Europe**: UK, Germany, France, Netherlands testing  
- **Asia-Pacific**: Japan, Australia, Singapore testing
- **Emerging Markets**: Brazil, India, South Africa testing

#### **Scoring Factors**
```typescript
interface GeoVisibilityScore {
  globalReach: number           // 0-100 global visibility
  regionalOptimization: number  // Localization quality
  performanceConsistency: number // Cross-region performance
  marketPenetration: {          // By region
    northAmerica: number
    europe: number
    asiaPacific: number
    emergingMarkets: number
  }
}
```

#### **Fallback Strategies**
1. **Minimal Mode**: Test from 1-2 primary markets only
2. **Graceful Degradation**: Return results from successful locations
3. **Skip if Failed**: Can be skipped but significantly impacts global score

---

### 💭 **Sentiment Agent** (MEDIUM Priority)
```typescript
Classification: Slow Agent
Priority: MEDIUM
Timeout Strategy: 1.5min → 2min → 3min
Dependencies: Crawl Agent
Parallelizable: Yes
Fallback: Fast sentiment analysis, can skip
```

#### **Purpose**
Analyzes sentiment and emotional tone of website content to assess how the brand presents itself and how users might perceive it.

#### **Key Capabilities**
- **Content Sentiment Analysis**: Analyze overall content sentiment
- **Brand Tone Assessment**: Evaluate brand voice and personality
- **Emotional Indicators**: Detect emotional triggers and responses
- **Customer Experience Sentiment**: Assess user journey emotional impact
- **Competitive Sentiment**: Compare sentiment to industry standards

#### **Analysis Framework**
```typescript
interface SentimentAnalysisConfig {
  contentSections: ContentSection[] // Sections to analyze
  sentimentModels: SentimentModel[] // Analysis models to use
  emotionCategories: EmotionType[]  // Emotions to detect
  confidenceThreshold: 0.7          // Minimum confidence for results
}

enum ContentSection {
  HOMEPAGE = "homepage",
  ABOUT_PAGE = "about",
  PRODUCT_PAGES = "products", 
  CUSTOMER_SERVICE = "support",
  BLOG_CONTENT = "blog"
}

enum EmotionType {
  JOY = "joy",
  TRUST = "trust",
  FEAR = "fear",
  SURPRISE = "surprise",
  SADNESS = "sadness",
  DISGUST = "disgust",
  ANGER = "anger",
  ANTICIPATION = "anticipation"
}
```

#### **Sentiment Metrics**
```typescript
interface SentimentAnalysisResult {
  overallSentiment: {
    polarity: number            // -1 (negative) to +1 (positive)
    subjectivity: number        // 0 (objective) to 1 (subjective)
    confidence: number          // 0-1 confidence in analysis
  }
  emotionalProfile: {
    primaryEmotion: EmotionType
    emotionScores: Record<EmotionType, number>
    emotionalRange: number      // Variety of emotions expressed
  }
  brandTone: {
    personality: BrandPersonality
    consistency: number         // Tone consistency across content
    appropriateness: number     // Tone-audience fit
  }
  userExperienceImpact: {
    trustBuilding: number       // Trust-building language
    persuasiveness: number      // Persuasive elements
    clarity: number            // Clear communication
    engagement: number         // Engaging content
  }
}

enum BrandPersonality {
  PROFESSIONAL = "professional",
  FRIENDLY = "friendly", 
  AUTHORITATIVE = "authoritative",
  INNOVATIVE = "innovative",
  TRUSTWORTHY = "trustworthy",
  PLAYFUL = "playful"
}
```

#### **Scoring Algorithm**
- **Positive Sentiment**: Higher scores for positive, appropriate tone
- **Consistency**: Reward consistent brand voice across content
- **Emotional Intelligence**: Appropriate emotional responses to content type
- **User Impact**: Sentiment that enhances user experience

#### **Fallback Strategies**
1. **Fast Mode**: Basic polarity analysis only (30s timeout)
2. **Graceful Degradation**: Return partial sentiment analysis
3. **Skip if Failed**: Can be skipped entirely (minimal impact on overall score)

---

### 🛒 **Commerce Agent** (MEDIUM Priority)
```typescript
Classification: Slow Agent
Priority: MEDIUM
Timeout Strategy: 1.5min → 2min → 3min
Dependencies: Crawl Agent
Parallelizable: Yes
Fallback: Basic e-commerce detection, can skip
```

#### **Purpose**
Analyzes e-commerce functionality, product presentation, and shopping experience optimization for commercial websites.

#### **Key Capabilities**
- **E-commerce Platform Detection**: Identify shopping cart systems
- **Product Catalog Analysis**: Evaluate product presentation quality
- **Checkout Process Assessment**: Analyze purchase flow optimization
- **Payment Method Analysis**: Review payment options and security
- **Mobile Commerce Evaluation**: Mobile shopping experience quality

#### **E-commerce Detection Framework**
```typescript
interface CommerceAnalysisConfig {
  platformDetection: boolean     // Detect e-commerce platform
  productAnalysis: boolean       // Analyze product pages
  checkoutAnalysis: boolean      // Evaluate checkout flow
  paymentAnalysis: boolean       // Review payment methods
  mobileCommerceCheck: boolean   // Mobile optimization
}

interface EcommercePlatform {
  platform: string              // Shopify, WooCommerce, Magento, etc.
  version: string               // Platform version
  customizations: string[]      // Custom modifications detected
  thirdPartyIntegrations: string[] // Payment, shipping, analytics
}
```

#### **Product Analysis**
```typescript
interface ProductAnalysis {
  catalogStructure: {
    categoryDepth: number        // Category hierarchy depth
    productCount: number         // Total products detected
    categoryCount: number        // Total categories
    navigationQuality: number    // Ease of product discovery
  }
  productPageQuality: {
    imageQuality: number         // Product image assessment
    descriptionCompleteness: number // Product description quality
    pricingClarity: number       // Price presentation clarity
    availabilityInfo: number     // Stock/availability information
    reviewsPresent: boolean      // Customer reviews available
  }
  searchFunctionality: {
    searchPresent: boolean       // Search functionality exists
    filterOptions: string[]      // Available filter options
    sortOptions: string[]        // Available sort options
    searchQuality: number        // Search result relevance
  }
}
```

#### **Checkout Flow Analysis**
```typescript
interface CheckoutAnalysis {
  processSteps: number           // Number of checkout steps
  guestCheckoutAvailable: boolean // Guest checkout option
  accountCreationRequired: boolean // Forced account creation
  formComplexity: number         // Checkout form complexity
  progressIndicator: boolean     // Checkout progress shown
  securityIndicators: number     // Security badges/SSL indicators
  abandonmentRisk: number        // Calculated abandonment risk
}
```

#### **Payment & Security Assessment**
```typescript
interface PaymentAnalysis {
  paymentMethods: PaymentMethod[] // Available payment options
  securityCertificates: string[] // SSL, security badges
  trustSignals: TrustSignal[]    // Trust-building elements
  mobilePaymentSupport: boolean  // Mobile payment options
  internationalSupport: boolean  // Multi-currency/region support
}

enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  PAYPAL = "paypal",
  APPLE_PAY = "apple_pay",
  GOOGLE_PAY = "google_pay",
  STRIPE = "stripe",
  SQUARE = "square",
  CRYPTOCURRENCY = "crypto"
}
```

#### **Scoring Methodology**
```typescript
calculateCommerceScore(analysis: CommerceAnalysis): number {
  const weights = {
    platformOptimization: 0.25,  // Platform setup quality
    productPresentation: 0.30,   // Product catalog quality
    checkoutExperience: 0.25,    // Purchase flow optimization
    trustAndSecurity: 0.20       // Security and trust signals
  }
  
  // Calculate weighted score based on detected e-commerce features
  // Non-e-commerce sites receive neutral score
}
```

#### **Fallback Strategies**
1. **Basic Mode**: Simple e-commerce detection only (30s timeout)
2. **Graceful Degradation**: Return partial commerce analysis
3. **Skip if Failed**: Can be skipped (only affects e-commerce sites significantly)

---

### 📰 **Citation Agent** (LOW Priority)
```typescript
Classification: Slow Agent
Priority: LOW
Timeout Strategy: 1min → 1.5min → 2min
Dependencies: Crawl Agent
Parallelizable: Yes
Fallback: Can be skipped entirely
```

#### **Purpose**
Searches for brand mentions, citations, and references across the web to assess external brand visibility and reputation.

#### **Key Capabilities**
- **Media Mention Detection**: Find brand references in news and media
- **Citation Quality Analysis**: Evaluate source authority and context
- **Sentiment of Mentions**: Analyze sentiment of external references
- **Authority Source Identification**: Identify high-authority citing sources
- **Mention Volume Tracking**: Quantify brand mention frequency

#### **Citation Search Framework**
```typescript
interface CitationSearchConfig {
  searchSources: SearchSource[]   // Sources to search
  brandVariations: string[]       // Brand name variations
  searchDepth: number            // Pages of results to analyze
  authorityThreshold: number     // Minimum source authority score
  timeRange: TimeRange           // Recency of mentions
}

enum SearchSource {
  NEWS_SITES = "news",
  SOCIAL_MEDIA = "social",
  INDUSTRY_PUBLICATIONS = "industry",
  ACADEMIC_SOURCES = "academic",
  REVIEW_SITES = "reviews",
  FORUMS = "forums"
}

interface TimeRange {
  start: Date                    // Search start date
  end: Date                     // Search end date
  priority: "recent" | "all"    // Prioritize recent mentions
}
```

#### **Citation Analysis**
```typescript
interface CitationAnalysis {
  mentionVolume: {
    totalMentions: number        // Total mentions found
    recentMentions: number       // Mentions in last 30 days
    trendDirection: "up" | "down" | "stable" // Mention trend
  }
  sourceAuthority: {
    highAuthorityMentions: number // Mentions from authoritative sources
    averageAuthorityScore: number // Average source authority
    topSources: AuthoritySource[] // Highest authority sources
  }
  mentionSentiment: {
    positiveMentions: number     // Positive sentiment mentions
    neutralMentions: number      // Neutral sentiment mentions
    negativeMentions: number     // Negative sentiment mentions
    overallSentiment: number     // -1 to +1 overall sentiment
  }
  contextAnalysis: {
    industryMentions: number     // Industry-relevant mentions
    competitorComparisons: number // Mentions comparing to competitors
    thoughtLeadership: number    // Mentions as industry leader
  }
}

interface AuthoritySource {
  domain: string                 // Source domain
  authorityScore: number         // Domain authority (0-100)
  sourceType: SearchSource       // Type of source
  mentionCount: number          // Number of mentions from this source
}
```

#### **Authority Scoring**
```typescript
calculateSourceAuthority(domain: string): number {
  const factors = {
    domainAge: getDomainAge(domain),
    backlinks: getBacklinkCount(domain),
    trafficRank: getTrafficRank(domain),
    socialSignals: getSocialSignals(domain),
    industryRelevance: getIndustryRelevance(domain)
  }
  
  // Combine factors into 0-100 authority score
  return calculateWeightedScore(factors)
}
```

#### **Scoring Impact**
- **High Authority Mentions**: Significantly boost citation score
- **Positive Sentiment**: Improve overall brand perception score
- **Mention Volume**: Higher volume indicates greater visibility
- **Recency**: Recent mentions weighted more heavily
- **Context Relevance**: Industry-relevant mentions valued higher

#### **Fallback Strategies**
1. **Quick Search**: Basic brand name search only (30s timeout)
2. **Graceful Degradation**: Return partial citation analysis
3. **Skip Entirely**: Lowest priority - can be completely skipped with minimal impact

---

## Agent Interaction Matrix

### **Dependency Relationships**
```
Foundation Layer:
├── Crawl Agent (CRITICAL) - Provides content for all others
│
Parallel Processing Layer:
├── Fast Agents (Execute immediately in parallel)
│   ├── Schema Agent (uses crawled content)
│   ├── Semantic Agent (uses crawled content + schema context)
│   ├── Brand Heritage Agent (uses crawled content + schema data)
│   └── Score Aggregator (waits for all agent results)
│
Background Processing Layer:
├── LLM Test Agent (HIGH) - uses crawled content for queries
├── Geo Visibility Agent (HIGH) - uses brand info for location testing
├── Sentiment Agent (MEDIUM) - uses crawled content for analysis
├── Commerce Agent (MEDIUM) - uses crawled content for e-commerce analysis
└── Citation Agent (LOW) - uses brand info for external search
```

### **Data Flow Patterns**
```typescript
// Primary data flow
CrawlAgent.content → AllOtherAgents.input

// Enhanced context flow  
SchemaAgent.structuredData → SemanticAgent.enhancedContext
SchemaAgent.structuredData → BrandHeritageAgent.brandContext

// Final aggregation flow
AllAgents.results → ScoreAggregator.input → FinalADIScore
```

### **Failure Impact Analysis**
```typescript
interface FailureImpact {
  crawlAgent: "CRITICAL - Evaluation cannot proceed",
  llmTestAgent: "HIGH - Significantly impacts AI visibility score",
  geoVisibilityAgent: "HIGH - Impacts global reach assessment", 
  schemaAgent: "MEDIUM - Affects technical optimization score",
  semanticAgent: "MEDIUM - Affects content quality score",
  sentimentAgent: "LOW - Minimal impact on overall score",
  commerceAgent: "LOW - Only affects e-commerce sites",
  citationAgent: "MINIMAL - Graceful degradation possible",
  brandHeritageAgent: "MINIMAL - Affects brand authority slightly"
}
```

---

## Performance Characteristics

### **Execution Time Targets**
| Agent | Target Time | Typical Range | Timeout Strategy |
|-------|-------------|---------------|------------------|
| **Fast Agents** | | | |
| Schema Agent | 2-4s | 1-6s | 8s (function limit) |
| Semantic Agent | 3-5s | 2-7s | 8s (function limit) |
| Brand Heritage Agent | 2-3s | 1-5s | 8s (function limit) |
| Score Aggregator | 1-2s | 1-3s | 8s (function limit) |
| **Slow Agents** | | | |
| Crawl Agent | 3-8min | 2-15min | 3→5→10→15min |
| LLM Test Agent | 2-4min | 1-5min | 2→3→5min |
| Geo Visibility Agent | 2-3min | 1-4min | 2→3→4min |
| Sentiment Agent | 1-2min | 30s-3min | 1.5→2→3min |
| Commerce Agent | 1-2min | 30s-3min | 1.5→2→3min |
| Citation Agent | 1min | 30s-2min | 1→1.5→2min |

### **Resource Requirements**
```typescript
interface ResourceProfile {
  memoryUsage: {
    crawlAgent: "100-200MB",      // Large content processing
    llmTestAgent: "50-100MB",     // API calls and response processing
    geoVisibilityAgent: "30-80MB", // Multiple location testing
    otherAgents: "20-50MB"        // Standard processing
  }
  networkIntensive: {
    crawlAgent: "HIGH",           // Multiple page requests
    llmTestAgent: "HIGH",         // Multiple API calls
    geoVisibilityAgent: "HIGH",   // Multi-location requests
    citationAgent: "MEDIUM",      // External searches
    otherAgents: "LOW"           // Minimal external requests
  }
  cpuIntensive: {
    semanticAgent: "HIGH",        // NLP processing
    sentimentAgent: "HIGH",       // Sentiment analysis
    crawlAgent: "MEDIUM",         // HTML parsing
    otherAgents: "LOW"           // Simple analysis
  }
}
```

---

## Configuration & Customization

### **Agent-Specific Configuration**
Each agent can be customized through environment variables and configuration objects:

```bash
# Crawl Agent Configuration
CRAWL_AGENT_TIMEOUT=900000
CRAWL_AGENT_MAX_SITEMAP_INDEXES=1
CRAWL_AGENT_MAX_CONTENT_SITEMAPS=2
CRAWL_AGENT_ENABLE_ANTI_BOT=true

# LLM Test Agent Configuration  
LLM_TEST_AGENT_MAX_QUERIES=10
LLM_TEST_AGENT_MAX_MODELS=3
LLM_TEST_AGENT_TIMEOUT=300000

# Geo Visibility Agent Configuration
GEO_AGENT_TEST_LOCATIONS=US,UK,JP,AU
GEO_AGENT_MAX_RESULTS_PER_LOCATION=10

# Feature Flags
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_COMMERCE_ANALYSIS=true
ENABLE_CITATION_ANALYSIS=true
```

### **Runtime Configuration**
```typescript
interface AgentRuntimeConfig {
  enabledAgents: string[]        // Which agents to run
  timeoutOverrides: Record<string, number> // Custom timeouts
  fallbackStrategies: Record<string, FallbackStrategy>
  priorityOverrides: Record<string, AgentPriority>
  customWeights: Record<string, number> // Scoring weights
}
```

This comprehensive agent catalog provides the foundation for understanding how each component contributes to the overall ADI evaluation system. Each agent is designed to be specialized, resilient, and capable of graceful degradation when faced with challenging scenarios.
