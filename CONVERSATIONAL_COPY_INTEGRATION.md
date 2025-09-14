# Conversational Copy Dimension Integration

## Overview

This document outlines the integration of **Conversational Copy** as the new **Dimension 1.6** in the AI Visibility Score platform. This dimension evaluates how well brands teach AI systems why they matter through natural, conversational language.

## Dimension Specification

### **Dimension 1.6: Conversational Copy**
- **Tagline**: "Do your words teach AI why you matter?"
- **Weight**: 5% of total score
- **Pillar**: Infrastructure & Machine Readability (40% total)
- **Position**: 6th dimension in Infrastructure pillar

### **Evaluation Framework**

The Conversational Copy dimension uses a 100-point scoring system across four key criteria:

#### **1. Coverage (0-25 points)**
- **25 pts**: Rich conversational copy across most products + editorial content
- **10 pts**: Some PDPs with conversational tone
- **0 pts**: Minimal/flat descriptions ("100% cotton T-shirt")

#### **2. Quality & Use-Case Framing (0-25 points)**
- **25 pts**: Distinct, use-case-driven language ("Perfect under a blazer", "Designed for festivals")
- **10 pts**: Functional but bland descriptions
- **0 pts**: Generic, repetitive phrasing

#### **3. Query Alignment (0-25 points)**
- **25 pts**: Consistently mirrors natural queries ("Best T-shirt for layering")
- **15 pts**: Some "how/why/when" phrasing
- **0 pts**: No natural language Q&A style

#### **4. Semantic Enrichment (0-25 points)**
- **25 pts**: Copy integrates key attributes (material, fit, price), values (heritage, sustainability), and links to ontologies
- **15 pts**: Some integration but inconsistent
- **0 pts**: No integration of brand values or attributes

## Technical Implementation

### **Database Changes**

#### **Migration: 002_add_conversational_copy_dimension.sql**
- Added documentation for the new dimension
- Created performance index on `dimension_name`
- Updated table comments to reflect 12 dimensions

#### **Schema Support**
The existing schema already supports the new dimension since:
- `dimension_scores.dimension_name` is `VARCHAR(100)`
- No structural changes required to existing tables

### **Code Updates**

#### **Scoring Algorithm (`src/lib/scoring.ts`)**
```typescript
export const DIMENSION_WEIGHTS = {
  // Infrastructure & Machine Readability (40% total)
  'schema_structured_data': 0.10,
  'semantic_clarity': 0.10,
  'ontologies_taxonomy': 0.10,
  'knowledge_graphs': 0.05,
  'llm_readability': 0.05,
  'conversational_copy': 0.05, // NEW
  
  // ... other dimensions
}

export const DIMENSION_NAMES = {
  // ... existing dimensions
  'conversational_copy': 'Conversational Copy',
  // ... other dimensions
}
```

#### **AI Provider Prompts (`src/lib/ai-providers.ts`)**
```typescript
conversational_copy: (brandName: string, websiteUrl: string) => 
  `Analyze the conversational copy quality of ${brandName} (${websiteUrl}). 
   Evaluate how well their content teaches AI why the brand matters through natural language.
   Assess: 1) Coverage - Rich conversational copy across products vs flat descriptions (0-25 pts),
   2) Quality & Use-Case Framing - Distinct, application-driven language (0-25 pts),
   3) Query Alignment - Content that mirrors natural queries (0-25 pts),
   4) Semantic Enrichment - Integration of brand values and attributes (0-25 pts).
   Provide detailed scoring breakdown and overall 0-100 score with specific examples.`
```

#### **TypeScript Types (`src/types/supabase.ts`)**
```typescript
export type DimensionName = 
  | 'schema_structured_data'
  | 'semantic_clarity'
  | 'ontologies_taxonomy'
  | 'knowledge_graphs'
  | 'llm_readability'
  | 'conversational_copy' // NEW
  | 'geo_visibility'
  | 'citation_strength'
  | 'answer_quality'
  | 'sentiment_trust'
  | 'hero_products'
  | 'shipping_freight'
```

### **UI Updates**

#### **Landing Page (`src/app/page.tsx`)**
- Updated Infrastructure pillar to include "Conversational Copy Analysis"
- Changed dimension count from "8 key dimensions" to "12 key dimensions"

#### **Dashboard Components**
- All existing dashboard components will automatically support the new dimension
- Progress indicators updated to reflect 12 total dimensions
- Scoring cards will display the new dimension alongside existing ones

## Multi-Agent Testing Strategy

### **AI Provider Testing**
Each AI provider tests conversational copy differently:

1. **OpenAI GPT-4**: Analyzes conversational tone and use-case clarity
2. **Anthropic Claude**: Evaluates semantic richness and brand integration
3. **Google Bard**: Tests query alignment and natural language matching
4. **LLaMA**: Assesses content structure and reasoning hooks
5. **Mistral**: Evaluates overall conversational effectiveness

### **Content Analysis Process**
1. **Extract Content**: Product descriptions, editorial content, FAQ sections
2. **Detect Use-Cases**: Identify conversational phrases explaining applications
3. **Simulate Queries**: Test how well content answers natural language questions
4. **Assess Integration**: Evaluate brand value connection in copy

## Why Conversational Copy Matters

### **AI Reasoning Enhancement**
- Conversational copy provides cause-effect framing that LLMs use for recommendations
- Example: "These shoes are perfect for marathon training" gives AI reasoning context

### **Natural Query Alignment**
- Customers ask AI questions in natural language ("Which sneakers are best for rainy weather?")
- Brands with conversational copy have better retrieval chances

### **Brand Storytelling**
- Editorial content becomes knowledge context for AI reasoning chains
- Example: "Levi's invented the 501 in 1873" → embedded in LLM heritage responses

## Report Output Examples

### **Conversational Copy Score: 62/100 – Grade C**

**✅ Strength**: PDPs use clear, relatable language ("easy to layer under an overshirt")

**❌ Gap**: Editorial content lacks structured Q&A style that aligns with customer queries

**💡 Opportunity**: Introduce modular copy blocks focused on use-cases and sustainability values to reduce repetition and improve AI parsing

### **Detailed Breakdown**
- **Coverage**: 15/25 - Some conversational elements but inconsistent across product lines
- **Use-Case Framing**: 18/25 - Good application-driven language in key categories
- **Query Alignment**: 12/25 - Limited natural Q&A style content
- **Semantic Enrichment**: 17/25 - Moderate brand value integration

## Integration Status

### **✅ Completed**
- [x] Updated scoring methodology documentation
- [x] Modified scoring algorithm weights and calculations
- [x] Added TypeScript type definitions
- [x] Created database migration
- [x] Added AI provider evaluation prompts
- [x] Updated landing page UI
- [x] Created comprehensive documentation

### **🔄 Automatic Support**
- [x] Database schema (already flexible)
- [x] Dashboard components (dimension-agnostic)
- [x] Evaluation engine (prompt-driven)
- [x] Report generation (data-driven)

## Testing & Validation

### **Local Testing**
1. Run the development server: `npm run dev:visibility`
2. Navigate to evaluation flow
3. Verify new dimension appears in UI
4. Test evaluation with conversational copy analysis

### **Database Migration**
```sql
-- Apply the migration
psql -d your_database -f supabase/migrations/002_add_conversational_copy_dimension.sql
```

### **Verification Queries**
```sql
-- Verify dimension support
SELECT DISTINCT dimension_name FROM dimension_scores;

-- Should include 'conversational_copy' in results
```

## Future Enhancements

### **Advanced Analysis**
- Sentiment analysis of conversational tone
- Brand voice consistency scoring
- Competitive conversational copy benchmarking

### **AI Training Data**
- Use conversational copy scores to train better content recommendations
- Build industry-specific conversational copy templates

### **Integration Opportunities**
- Connect with content management systems
- Provide real-time copy optimization suggestions
- A/B testing for conversational copy effectiveness

---

**Implementation Complete**: The Conversational Copy dimension is now fully integrated into the AI Visibility Score platform, providing brands with insights into how well their content teaches AI systems about their value proposition through natural, conversational language.