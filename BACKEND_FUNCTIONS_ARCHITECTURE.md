# Backend Functions Architecture for LLM-Intensive Agents

## Problem Analysis

**Netlify Constraint**: 10-second function timeout
**Current Agent Timeouts**: 1.5-3 seconds (too aggressive for frontier models)
**LLM Reality**: Frontier models need 5-15 seconds for quality reasoning

## Agent Classification by LLM Intensity

### 🔴 HIGH LLM INTENSITY (Move to Backend Functions)
1. **`llm_test_agent`** - Direct LLM queries, brand recognition tests
2. **`sentiment_agent`** - Sentiment analysis, reputation evaluation  
3. **`citation_agent`** - Media mention analysis, authority domain checks
4. **`geo_visibility_agent`** - Location-based query testing
5. **`commerce_agent`** - Product analysis, use-case articulation

### 🟡 MEDIUM LLM INTENSITY (Keep in Netlify with Increased Timeouts)
6. **`semantic_agent`** - Text analysis, vocabulary consistency
7. **`conversational_copy_agent`** - Content readability analysis
8. **`knowledge_graph_agent`** - Entity linking, markup analysis

### 🟢 LOW LLM INTENSITY (Keep in Netlify)
9. **`crawl_agent`** - Web scraping, HTML extraction
10. **`schema_agent`** - Structured data parsing
11. **`brand_heritage_agent`** - Content pattern matching
12. **`score_aggregator_agent`** - Mathematical calculations

## Proposed Architecture

### Phase 1: Hybrid Orchestration
```
┌─────────────────────────────────────────────────────────────┐
│                    NETLIFY FUNCTION (10s)                   │
├─────────────────────────────────────────────────────────────┤
│  1. Fast Agents (Parallel)                                 │
│     • crawl_agent (4s)                                     │
│     • schema_agent (2s)                                    │
│     • brand_heritage_agent (3s)                            │
│                                                             │
│  2. Medium Agents (Parallel)                               │
│     • semantic_agent (6s)                                  │
│     • conversational_copy_agent (5s)                       │
│     • knowledge_graph_agent (4s)                           │
│                                                             │
│  3. Trigger Backend Functions (Async)                      │
│     • Queue LLM-intensive agents                           │
│     • Return partial results immediately                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND FUNCTIONS (30s+)                   │
├─────────────────────────────────────────────────────────────┤
│  • llm_test_agent (15s)                                    │
│  • sentiment_agent (12s)                                   │
│  • citation_agent (20s)                                    │
│  • geo_visibility_agent (25s)                              │
│  • commerce_agent (18s)                                    │
│                                                             │
│  Results stored in Neon DB                                 │
│  Frontend polls for completion                              │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Backend Function Implementation

#### Option A: Serverless Functions (Recommended)
- **Platform**: Vercel Functions, AWS Lambda, or Railway
- **Timeout**: 30-60 seconds
- **Concurrency**: 5 agents in parallel
- **Cost**: Pay-per-execution

#### Option B: Dedicated Backend Service
- **Platform**: Railway, Render, or DigitalOcean
- **Always-on**: Persistent service
- **Timeout**: Unlimited
- **Cost**: Fixed monthly

## Implementation Strategy

### 1. Database Schema Updates
```sql
-- Add agent execution tracking
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL,
  agent_name VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'queued', -- queued, running, completed, failed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  results JSONB,
  error_message TEXT,
  execution_environment VARCHAR(20) -- 'netlify' or 'backend'
);
```

### 2. Orchestrator Updates
```typescript
// src/lib/adi/hybrid-orchestrator.ts
export class HybridADIOrchestrator {
  async executeEvaluation(context: ADIEvaluationContext) {
    // Phase 1: Fast agents in Netlify (8s)
    const fastResults = await this.executeNetlifyAgents([
      'crawl_agent', 'schema_agent', 'brand_heritage_agent',
      'semantic_agent', 'conversational_copy_agent', 'knowledge_graph_agent'
    ]);
    
    // Phase 2: Queue LLM agents for backend execution
    await this.queueBackendAgents([
      'llm_test_agent', 'sentiment_agent', 'citation_agent',
      'geo_visibility_agent', 'commerce_agent'
    ], context);
    
    // Return partial results immediately
    return {
      status: 'partial',
      netlifyResults: fastResults,
      backendJobId: jobId,
      estimatedCompletion: Date.now() + 30000 // 30s estimate
    };
  }
}
```

### 3. Backend Function Structure
```typescript
// backend-functions/llm-agents/index.ts
export async function executeLLMAgent(request: {
  agentName: string;
  evaluationId: string;
  context: ADIEvaluationContext;
  previousResults: any[];
}) {
  const agent = AgentRegistry.getAgent(request.agentName);
  
  // Extended timeout for quality reasoning
  const result = await Promise.race([
    agent.execute({
      context: request.context,
      previousResults: request.previousResults
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Backend timeout')), 30000)
    )
  ]);
  
  // Store results in Neon DB
  await db.insert(agentExecutions).values({
    evaluationId: request.evaluationId,
    agentName: request.agentName,
    status: 'completed',
    results: result,
    completedAt: new Date(),
    executionEnvironment: 'backend'
  });
  
  return result;
}
```

### 4. Frontend Polling System
```typescript
// src/lib/adi/evaluation-poller.ts
export class EvaluationPoller {
  async pollForCompletion(evaluationId: string): Promise<ADIScore> {
    const pollInterval = 2000; // 2 seconds
    const maxWait = 60000; // 60 seconds max
    
    for (let elapsed = 0; elapsed < maxWait; elapsed += pollInterval) {
      const status = await this.checkBackendStatus(evaluationId);
      
      if (status.allCompleted) {
        return this.aggregateResults(status.results);
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error('Backend evaluation timeout');
  }
}
```

## Migration Plan

### Week 1: Infrastructure Setup
- [ ] Set up backend function platform (Vercel/Railway)
- [ ] Create agent execution tracking tables
- [ ] Implement basic backend function structure

### Week 2: Agent Migration
- [ ] Move `llm_test_agent` to backend functions
- [ ] Update orchestrator for hybrid execution
- [ ] Test with single agent migration

### Week 3: Full Migration
- [ ] Move remaining 4 LLM-intensive agents
- [ ] Implement frontend polling system
- [ ] Update timeout configurations

### Week 4: Optimization
- [ ] Implement result caching
- [ ] Add retry mechanisms
- [ ] Performance monitoring

## Expected Performance Improvements

### Before (Current State)
- **Total Time**: 5-6 seconds
- **LLM Success Rate**: 30% (due to timeouts)
- **Score Quality**: Poor (heuristic fallbacks)

### After (Backend Functions)
- **Netlify Response**: 3-4 seconds (partial results)
- **Full Results**: 15-20 seconds (high quality)
- **LLM Success Rate**: 95% (proper timeouts)
- **Score Quality**: Excellent (real AI analysis)

## Cost Analysis

### Current: Netlify Only
- Function executions: $0.0000025 per 100ms
- Failed LLM calls: Wasted API costs

### Proposed: Hybrid Architecture
- Netlify: Same cost for fast agents
- Backend functions: $0.01-0.05 per evaluation
- **ROI**: Higher quality scores justify cost increase

## Risk Mitigation

1. **Fallback Strategy**: If backend fails, use current heuristic scoring
2. **Timeout Handling**: Progressive timeouts with quality degradation
3. **Cost Controls**: Rate limiting and usage monitoring
4. **Monitoring**: Real-time performance and error tracking

This architecture solves the frontier model reasoning time constraint while maintaining fast initial responses and enabling high-quality AI analysis.