# Probe Results Quality Improvement Plan

## Current Status (Oct 11, 2025)

### ✅ What's Working
- LLM Test Agent: Showing real scores (95/100, 95/100) with AI responses
- Sentiment Agent: Showing real scores (82/100, 87/100) with emotions/insights
- Rich feedback display in UI (emotions badges, products lists, summaries)
- JSON parsing fixes deployed (markdown stripping, response_format: json_object)

### ❌ What's Still Broken
- Crawl Agent: Still 50/100 (using old result structure)
- Citation Agent: Still 50/100 (using old result structure)
- Commerce Agent: Likely still using old structure
- Geo Visibility Agent: Likely still using old structure

## Root Cause

**Inconsistent result structures across agents:**

### New Format (✅ Working):
```typescript
{
  type: 'brand_recognition',
  score: 95,
  confidence: 0.99,
  evidence: {
    llmResponse: '{"score": 95, ...}',
    parsedSuccessfully: true,
    model: 'gpt-4-turbo',
    ...details
  }
}
```

### Old Format (❌ Causing 50/100 scores):
```typescript
{
  resultType: 'homepage_crawl',
  rawValue: 50,
  normalizedScore: 50,
  confidenceLevel: 0.8,
  evidence: { ... }
}
```

## Required Fixes

### 1. Update Remaining Railway Agents

**Files to update:**
- `railway-workers/src/agents/real-geo-visibility-agent.ts`
- `railway-workers/src/agents/real-citation-agent.ts`
- `railway-workers/src/agents/real-commerce-agent.ts`
- `railway-workers/src/agents/advanced-crawl-agent.ts`

**Changes needed for each:**
```typescript
// OLD:
return {
  resultType: 'test_name',
  rawValue: score,
  normalizedScore: score,
  confidenceLevel: confidence,
  evidence: { ... }
}

// NEW:
return {
  type: 'test_name',
  score: score,
  confidence: confidence,
  evidence: {
    ...existing evidence,
    llmResponse: rawApiResponse?.substring(0, 500), // If LLM call
    parsedSuccessfully: true,
    model: 'gpt-4-turbo'
  }
}
```

### 2. Enhance Evidence Quality

**Current issue:** Some probes show scores but lack actionable insights.

**Solution:** Add rich evidence fields for each test type:

#### For Citation Agent:
```typescript
evidence: {
  keyIndicators: ['industry authority', 'media recognition', 'expert endorsements'],
  citationCount: 15,
  authoritySources: ['Forbes', 'TechCrunch'],
  llmProvider: 'openai',
  model: 'gpt-4-turbo'
}
```

#### For Crawl Agent:
```typescript
evidence: {
  pagesAnalyzed: 5,
  schemaFound: ['Product', 'Organization', 'BreadcrumbList'],
  technicalIssues: [],
  recommendations: ['Add FAQ schema', 'Improve meta descriptions'],
  crawlTimestamp: '2025-10-11...'
}
```

#### For Commerce Agent:
```typescript
evidence: {
  signals: ['online store', 'shopping cart', 'payment options'],
  offerings: ['footwear', 'apparel', 'equipment'],
  purchaseClarity: 'high',
  discoveryScore: 85
}
```

### 3. Add LLM Response Logging

For agents that make LLM API calls, always include:
```typescript
llmResponse: content.substring(0, 500),
parsedSuccessfully: !parseError,
model: 'gpt-4-turbo',
llmProvider: 'openai'
```

This provides transparency and debugging capability.

## Implementation Priority

### High Priority (Fixes trust issues):
1. ✅ ~~LLM Test Agent~~ (DONE)
2. ✅ ~~Sentiment Agent~~ (DONE)
3. 🔴 Geo Visibility Agent (uses LLM, shows 50/100)
4. 🔴 Citation Agent (uses Brave Search + LLM, shows 50/100)
5. 🔴 Commerce Agent (uses LLM, critical for sales)

### Medium Priority (Quality improvements):
6. 🟡 Crawl Agent (technical, but shows 50/100)
7. 🟡 Add richer evidence to all agents
8. 🟡 Better error messages

### Low Priority (Future):
9. Multi-model support for Index Pro
10. Model-by-model comparison UI

## Next Steps

**Immediate (Next 30 min):**
1. Update geo_visibility, citation, and commerce agents to new structure
2. Add rich evidence fields (insights, key findings, recommendations)
3. Deploy to Railway
4. Run test evaluation

**Short Term (Next session):**
5. Update crawl agent structure
6. Add comprehensive error handling
7. Implement multi-model support for Index Pro tier

## Success Criteria

✅ All probe cards show real scores (no 50/100 defaults)
✅ Every probe has actionable insights visible
✅ LLM responses are transparent
✅ Error messages are clear and helpful
✅ Products, emotions, signals displayed as badges/lists

