# AI Visibility Score - Scoring Methodology

## Overview

The AI Visibility Score is a comprehensive 0-100 point system that evaluates how effectively a brand appears in AI-powered search and recommendation systems. The methodology combines automated testing across multiple AI providers with weighted scoring across three core pillars.

## Scoring Framework

### Overall Score Calculation
```
AI Visibility Score = (Infrastructure × 0.40) + (Perception × 0.35) + (Commerce × 0.25)
```

### Grade Assignment
- **A (90-100)**: Excellent AI visibility, competitive advantage
- **B (80-89)**: Good visibility with minor optimization opportunities
- **C (70-79)**: Average visibility, significant improvement potential
- **D (60-69)**: Poor visibility, major gaps in AI discoverability
- **F (0-59)**: Critical visibility issues, immediate action required

## Pillar 1: Infrastructure & Machine Readability (40% weight)

*"Can AI parse and understand your brand's digital footprint?"*

### 1.1 Schema & Structured Data (10% of total score)
**Evaluation Criteria:**
- Schema.org markup coverage across key pages
- Product schema completeness (name, price, availability, reviews)
- Organization schema implementation
- FAQ schema for common queries
- Review/rating schema accuracy
- GS1 standard alignment for product data

**Testing Method:**
- Automated schema validation using Google's Structured Data Testing Tool API
- Manual verification of schema completeness
- Cross-reference with industry best practices

**Scoring:**
- 90-100: Comprehensive schema across all page types, GS1 compliant
- 70-89: Good schema coverage with minor gaps
- 50-69: Basic schema implementation, missing key elements
- 30-49: Limited schema, major gaps in product/organization data
- 0-29: No or broken schema implementation

### 1.2 Semantic Clarity (10% of total score)
**Evaluation Criteria:**
- Brand name disambiguation and consistency
- Product terminology standardization
- Category and attribute vocabulary alignment
- Content hierarchy and logical structure
- Cross-page semantic consistency

**Testing Method:**
- AI model analysis of brand/product descriptions
- Terminology consistency checks across pages
- Semantic similarity analysis between related content

**Scoring:**
- 90-100: Clear, consistent terminology with strong disambiguation
- 70-89: Good semantic clarity with minor inconsistencies
- 50-69: Moderate clarity, some confusing terminology
- 30-49: Poor semantic structure, significant ambiguity
- 0-29: Highly confusing or inconsistent terminology

### 1.3 Ontologies & Taxonomy (10% of total score)
**Evaluation Criteria:**
- Logical product/service categorization
- Hierarchical navigation structure
- Cross-linking between related concepts
- Taxonomy stability (no concept drift)
- Industry-standard classification alignment

**Testing Method:**
- Site structure analysis and mapping
- Category hierarchy evaluation
- Cross-link analysis for semantic relationships
- Comparison with industry taxonomies

**Scoring:**
- 90-100: Well-structured taxonomy with clear hierarchies
- 70-89: Good organization with minor structural issues
- 50-69: Basic taxonomy, some logical gaps
- 30-49: Poor organization, confusing structure
- 0-29: No clear taxonomy or highly disorganized

### 1.4 Knowledge Graphs (5% of total score)
**Evaluation Criteria:**
- Internal knowledge graph connections
- External knowledge graph presence (Wikidata, Google KG)
- Entity linking and disambiguation
- Relationship mapping between concepts

**Testing Method:**
- Knowledge graph API queries (Google, Wikidata)
- Internal link analysis for entity relationships
- Entity recognition and linking verification

**Scoring:**
- 90-100: Strong presence in external KGs with rich internal connections
- 70-89: Good KG presence with some internal linking
- 50-69: Basic KG presence, limited connections
- 30-49: Minimal KG presence, poor entity linking
- 0-29: No knowledge graph presence

### 1.5 LLM Readability (5% of total score)
**Evaluation Criteria:**
- Content chunking and structure
- Alt text completeness and quality
- Accessibility markup (ARIA labels, headings)
- Narrative flow and coherence
- Machine-readable content formatting

**Testing Method:**
- Content structure analysis
- Accessibility audit using automated tools
- LLM parsing simulation and evaluation

**Scoring:**
- 90-100: Excellent structure with comprehensive accessibility
- 70-89: Good readability with minor accessibility gaps
- 50-69: Basic structure, some readability issues
- 30-49: Poor structure, significant accessibility problems
- 0-29: Unstructured content, major readability barriers

## Pillar 2: Perception & Reputation (35% weight)

*"Can AI explain why your brand matters?"*

### 2.1 Geo Visibility (10% of total score)
**Evaluation Criteria:**
- Presence in location-based AI queries
- Geographic coverage accuracy
- Local business information completeness
- Regional brand recognition

**Testing Method:**
- Location-specific queries across multiple AI models
- Geographic coverage mapping
- Local search result analysis

**Scoring:**
- 90-100: Strong presence across all target geographies
- 70-89: Good coverage with minor geographic gaps
- 50-69: Moderate coverage, some regions missing
- 30-49: Limited geographic presence
- 0-29: Poor or no geographic visibility

### 2.2 Citation Strength (10% of total score)
**Evaluation Criteria:**
- Premium media coverage and mentions
- Industry publication presence
- Academic and research citations
- Authority domain backlinks
- Citation context and sentiment

**Testing Method:**
- Media mention analysis across news sources
- Citation tracking in academic databases
- Authority domain analysis
- AI model citation verification

**Scoring:**
- 90-100: Extensive high-authority citations and media coverage
- 70-89: Good citation presence with quality sources
- 50-69: Moderate citations, mixed authority levels
- 30-49: Limited citations, low authority sources
- 0-29: Few or no quality citations

### 2.3 Answer Quality (10% of total score)
**Evaluation Criteria:**
- Completeness of AI responses about the brand
- Accuracy of factual information
- Relevance of provided details
- Consistency across different AI models

**Testing Method:**
- Standardized brand queries across multiple AI models
- Fact-checking against authoritative sources
- Response completeness analysis
- Cross-model consistency evaluation

**Scoring:**
- 90-100: Complete, accurate, consistent responses
- 70-89: Good responses with minor inaccuracies
- 50-69: Moderate quality, some missing information
- 30-49: Poor responses, significant gaps or errors
- 0-29: Incomplete or highly inaccurate responses

### 2.4 Sentiment & Trust (5% of total score)
**Evaluation Criteria:**
- Overall sentiment in AI responses
- Trust signals and reputation indicators
- Customer review sentiment analysis
- Crisis or negative event handling

**Testing Method:**
- Sentiment analysis of AI-generated content
- Review aggregation and sentiment scoring
- Trust signal identification and verification

**Scoring:**
- 90-100: Consistently positive sentiment with strong trust signals
- 70-89: Generally positive with minor concerns
- 50-69: Mixed sentiment, some trust issues
- 30-49: Negative sentiment, significant trust problems
- 0-29: Highly negative sentiment or major trust issues

## Pillar 3: Commerce & Customer Experience (25% weight)

*"Can AI recommend and transact with confidence?"*

### 3.1 Hero Products (15% of total score)
**Evaluation Criteria:**
- AI ability to identify best-selling products
- Product recommendation accuracy
- Feature and benefit articulation
- Competitive positioning understanding

**Testing Method:**
- Product recommendation queries across AI models
- Best-seller identification accuracy testing
- Feature comparison analysis
- Competitive positioning evaluation

**Scoring:**
- 90-100: Accurate product identification with clear value propositions
- 70-89: Good product recognition with minor gaps
- 50-69: Moderate accuracy, some product confusion
- 30-49: Poor product identification, unclear positioning
- 0-29: Cannot identify or recommend products accurately

### 3.2 Shipping & Freight (10% of total score)
**Evaluation Criteria:**
- Shipping cost transparency and accuracy
- Delivery timeframe clarity
- Geographic shipping coverage
- Return policy accessibility

**Testing Method:**
- Shipping information queries across AI models
- Cost and timeframe accuracy verification
- Policy accessibility analysis

**Scoring:**
- 90-100: Clear, accurate shipping information readily available
- 70-89: Good shipping clarity with minor gaps
- 50-69: Basic shipping info, some unclear elements
- 30-49: Poor shipping transparency, confusing policies
- 0-29: No clear shipping information available

## Multi-Agent Testing Protocol

### AI Provider Coverage
The evaluation tests brand visibility across multiple AI providers to ensure comprehensive coverage:

- **OpenAI Models**: GPT-4, GPT-3.5-turbo
- **Anthropic Models**: Claude-3, Claude-2
- **Google Models**: Gemini Pro, PaLM
- **Open Source**: LLaMA, Mistral (via API providers)

### Standardized Query Sets

#### Infrastructure Queries
- "What is [brand name] and what do they do?"
- "Tell me about [brand name]'s products and services"
- "How is [brand name] organized as a company?"

#### Perception Queries
- "Why should I trust [brand name]?"
- "What do people say about [brand name]?"
- "How does [brand name] compare to [competitor]?"

#### Commerce Queries
- "What are [brand name]'s best products?"
- "How much does shipping cost from [brand name]?"
- "Can I return products to [brand name]?"

### Response Evaluation Criteria

#### Accuracy (40% of response score)
- Factual correctness of information
- Up-to-date data accuracy
- Proper attribution of claims

#### Completeness (30% of response score)
- Coverage of key brand attributes
- Inclusion of relevant details
- Addressing the full query scope

#### Consistency (20% of response score)
- Alignment across different AI models
- Consistency with brand messaging
- Coherent narrative presentation

#### Relevance (10% of response score)
- Appropriateness to query intent
- Focus on most important information
- Contextual understanding

## Competitive Benchmarking

### Benchmark Selection
- Direct competitors (same industry/category)
- Aspirational brands (best-in-class examples)
- Industry leaders (market share/recognition)

### Comparative Metrics
- Relative score positioning
- Dimension-specific comparisons
- Gap analysis and opportunities
- Best practice identification

### Benchmark Scoring
- **Leading**: Top 10% of benchmark set
- **Competitive**: Top 25% of benchmark set
- **Average**: Middle 50% of benchmark set
- **Lagging**: Bottom 25% of benchmark set
- **Critical**: Bottom 10% of benchmark set

## Quality Assurance

### Validation Methods
- Cross-model result verification
- Human expert review of edge cases
- Automated consistency checking
- Regular methodology updates

### Accuracy Standards
- 95% factual accuracy requirement
- 90% cross-model consistency target
- Monthly methodology review and updates
- Quarterly benchmark recalibration

This methodology ensures comprehensive, accurate, and actionable AI visibility scoring that provides clear insights for brand improvement strategies.