# Frontend UX Mapping for Agentic Workflow

## Current Architecture

### 1. **Evaluation Flow**
```
User submits URL
  ↓
/api/evaluate → Creates evaluation → Returns evaluationId
  ↓
Frontend starts polling with evaluationId
  ↓
EnhancedProgressDisplay component polls:
  - /api/evaluation/[id]/hybrid-status (for agent progress)
  - /api/evaluation/[id]/status (for final results)
```

### 2. **Progress Display Component**
**File**: `src/components/evaluation/EnhancedProgressDisplay.tsx`

**Current Features**:
- ✅ Polls `/api/evaluation/${evaluationId}/hybrid-status` 
- ✅ Shows individual agent status (pending/running/completed)
- ✅ Displays overall progress percentage
- ✅ Estimates completion time
- ✅ Shows elapsed time
- ✅ Has fallback simulation if no evaluationId

**Agent List Shown**:
1. crawl_agent - "Web Crawler"
2. llm_test_agent - "AI Probe Tests"  
3. schema_agent - "Schema Analysis"
4. semantic_agent - "Semantic Clarity"
5. citation_agent - "Citation Strength"
6. geo_visibility_agent - "Geographic Reach"
7. sentiment_agent - "Brand Sentiment"
8. brand_heritage_agent - "Brand Heritage"
9. commerce_agent - "Commerce Readiness"
10. knowledge_graph_agent - "Knowledge Graph"
11. conversational_copy_agent - "Conversational Clarity"
12. score_aggregator - "Score Calculation"

### 3. **Backend Status Endpoints**

#### `/api/evaluation/[id]/hybrid-status`
**Purpose**: Real-time progress for hybrid (fast + slow) agents

**Data Returned**:
- status: 'running' | 'completed' | 'failed'
- progress: percentage (0-100)
- slowAgentsTotal: number
- slowAgentsCompleted: number
- slowAgentsFailed: number
- fastAgentsCompleted: boolean
- executions: array of agent execution records

**Source**: Reads from `backend_agent_executions` table via `BackendAgentTracker`

#### `/api/evaluation/[id]/intelligent-status`
**Purpose**: Enhanced status with queue metrics and Railway bridge details

**Data Returned**:
- evaluationId
- overallStatus
- progress (detailed)
- agentDetails (per-agent status with attempts, timeouts, errors)
- queueMetrics (Railway queue stats)
- estimatedCompletion
- performance (fast vs slow agent breakdown)

**Source**: Reads from `backend_agent_executions` + Railway queue API

### 4. **Current UX Gaps**

❌ **Gap 1: No Railway Bridge Indicator**
- Users don't see when agents are running on Railway vs. Netlify
- No visual distinction between fast and slow agents

❌ **Gap 2: No Queue Position Info**
- When agents are queued in Railway, no queue position shown
- No estimated wait time for queued jobs

❌ **Gap 3: Limited Agent Detail**
- No execution time shown for completed agents
- No retry attempt tracking
- No timeout/fallback status

❌ **Gap 4: No Crawl Data Handoff Indicator**
- Can't see if downstream agents received crawl data
- No cascading failure detection UI

❌ **Gap 5: Wrong Endpoint Being Polled**
- `EnhancedProgressDisplay` polls `/hybrid-status`
- But we should use `/intelligent-status` for Railway bridge details

## Recommendations for UX Enhancement

### **Priority 1: Switch to Intelligent Status Endpoint**
Update `EnhancedProgressDisplay.tsx` to poll `/intelligent-status` instead of `/hybrid-status`

### **Priority 2: Add Railway Bridge Indicators**
Show visual badges:
- 🚀 "Fast Agent" (Netlify) - sub-second execution
- 🛤️ "Railway Agent" (Background) - longer execution times
- 📊 Queue position when applicable

### **Priority 3: Enhanced Agent Cards**
For each agent, show:
- Current status (pending/queued/running/completed/failed)
- Execution location (Netlify vs Railway)
- Execution time when completed
- Retry attempts (if applicable)
- Error message (if failed)
- Dependency status (waiting for X to complete)

### **Priority 4: Crawl Data Flow Visualization**
- Show when crawl_agent completes
- Highlight when downstream agents receive crawl data
- Alert if cascading failure detected (no HTML data)

### **Priority 5: Real-time Railway Queue Metrics**
- Show total jobs in Railway queue
- Average execution time
- Success rate
- Resource utilization

## Current Status

**What Works**:
- ✅ Backend polling infrastructure exists
- ✅ `intelligent-status` endpoint has all needed data
- ✅ Component structure supports real-time updates
- ✅ Fallback simulation for graceful degradation

**What Needs Update**:
- ⚠️ Frontend polling wrong endpoint (`hybrid-status` vs `intelligent-status`)
- ⚠️ No visual Railway vs Netlify distinction
- ⚠️ Missing queue/retry/error details in UI
- ⚠️ No data handoff visualization

## Implementation Status

**Immediate Fix Needed**:
Change line 179 in `EnhancedProgressDisplay.tsx`:
```typescript
// FROM:
const response = await fetch(`/api/evaluation/${evaluationId}/hybrid-status`)

// TO:
const response = await fetch(`/api/evaluation/${evaluationId}/intelligent-status`)
```

**Then Update State Mapping**:
Map `intelligent-status` response to agent states with enhanced details

