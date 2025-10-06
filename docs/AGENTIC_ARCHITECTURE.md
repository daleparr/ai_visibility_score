# ADI Agentic Architecture

## Overview

The AI Discoverability Index (ADI) system employs a sophisticated **agentic architecture** where specialized AI agents work collaboratively to evaluate website visibility across multiple dimensions. This document provides a comprehensive overview of the architecture, agent interactions, and system design principles.

---

## Core Architecture Principles

### **1. Agent Specialization**
Each agent is designed for a specific evaluation domain:
- **Crawl Agent**: Website content extraction and sitemap processing
- **LLM Test Agent**: AI model visibility testing
- **Sentiment Agent**: Brand sentiment analysis
- **Geo Visibility Agent**: Location-based visibility testing
- **Commerce Agent**: E-commerce and product analysis
- **Citation Agent**: Media mention and citation analysis

### **2. Hybrid Execution Model**
The system operates in two execution tiers:
- **Fast Agents**: Execute in Netlify functions (8-second limit) for immediate results
- **Slow Agents**: Execute in background functions (15-minute limit) for complex processing

### **3. Intelligent Orchestration**
The orchestrator manages agent execution with:
- **Priority-based scheduling** ensuring critical agents run first
- **Progressive timeout handling** with intelligent fallback strategies
- **Resource management** preventing system overload
- **Dependency tracking** ensuring proper execution order

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADI Agentic System                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────┐ │
│  │   Frontend Client   │    │   API Gateway       │    │   Database      │ │
│  │   - React UI        │◄──►│   - Next.js API     │◄──►│   - PostgreSQL  │ │
│  │   - Real-time       │    │   - Status polling  │    │   - Neon Cloud  │ │
│  │     progress        │    │   - CORS handling   │    │   - Drizzle ORM │ │
│  └─────────────────────┘    └─────────────────────┘    └─────────────────┘ │
│                                        │                                    │
│                                        ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Intelligent Hybrid Orchestrator                     │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │ │
│  │  │   Fast Agent    │  │   Slow Agent    │  │   Intelligent Queue     │ │ │
│  │  │   Executor      │  │   Queue Manager │  │   Manager               │ │ │
│  │  │                 │  │                 │  │   - Priority scheduling │ │ │
│  │  │ - Schema Agent  │  │ - Crawl Agent   │  │   - Progressive timeout │ │ │
│  │  │ - Semantic      │  │ - LLM Test      │  │   - Fallback strategies │ │ │
│  │  │ - Brand Heritage│  │ - Sentiment     │  │   - Resource management │ │ │
│  │  │ - Score Agg.    │  │ - Geo Visibility│  │   - Circuit breakers    │ │ │
│  │  │                 │  │ - Commerce      │  │                         │ │ │
│  │  │                 │  │ - Citation      │  │                         │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                        │                                    │
│                                        ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        Agent Execution Layer                           │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ CRITICAL    │  │    HIGH     │  │   MEDIUM    │  │    LOW      │   │ │
│  │  │             │  │             │  │             │  │             │   │ │
│  │  │ Crawl Agent │  │ LLM Test    │  │ Sentiment   │  │ Citation    │   │ │
│  │  │             │  │ Geo Vis.    │  │ Commerce    │  │             │   │ │
│  │  │ 3→15min     │  │ 2→5min      │  │ 1.5→3min    │  │ 1→2min      │   │ │
│  │  │ Must        │  │ Important   │  │ Valuable    │  │ Optional    │   │ │
│  │  │ Complete    │  │ for Quality │  │ but Skip.   │  │ Nice-to-have│   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                        │                                    │
│                                        ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     Serverless Execution Environment                   │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                         │ │
│  │  ┌─────────────────────┐              ┌─────────────────────────────┐   │ │
│  │  │  Netlify Functions  │              │  Netlify Background Funcs   │   │ │
│  │  │  (8-second limit)   │              │  (15-minute limit)          │   │ │
│  │  │                     │              │                             │   │ │
│  │  │ ┌─────────────────┐ │              │ ┌─────────────────────────┐ │   │ │
│  │  │ │ Fast Agents     │ │              │ │ Intelligent Queue       │ │   │ │
│  │  │ │ - Schema        │ │              │ │ - Progressive timeouts  │ │   │ │
│  │  │ │ - Semantic      │ │              │ │ - Priority scheduling   │ │   │ │
│  │  │ │ - Brand Heritage│ │              │ │ - Fallback strategies   │ │   │ │
│  │  │ │ - Score Agg.    │ │              │ │ - Resource management   │ │   │ │
│  │  │ └─────────────────┘ │              │ └─────────────────────────┘ │   │ │
│  │  └─────────────────────┘              └─────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Classification & Execution Strategy

### **Fast Agents (Netlify Functions - 8s limit)**

#### **Schema Agent**
- **Purpose**: Extract and analyze structured data (JSON-LD, microdata, RDFa)
- **Execution Time**: 2-4 seconds
- **Dependencies**: None (foundation agent)
- **Output**: Structured data quality score, schema completeness

#### **Semantic Agent**
- **Purpose**: Analyze content semantics and topical relevance
- **Execution Time**: 3-5 seconds
- **Dependencies**: Schema Agent (for enhanced context)
- **Output**: Semantic relevance score, topic classification

#### **Brand Heritage Agent**
- **Purpose**: Analyze brand consistency and heritage signals
- **Execution Time**: 2-3 seconds
- **Dependencies**: Schema Agent
- **Output**: Brand consistency score, heritage indicators

#### **Score Aggregator**
- **Purpose**: Combine all agent results into final ADI score
- **Execution Time**: 1-2 seconds
- **Dependencies**: All other agents
- **Output**: Final ADI score, confidence metrics

### **Slow Agents (Background Functions - 15min limit)**

#### **Crawl Agent (CRITICAL Priority)**
```typescript
Priority: CRITICAL
Timeout Strategy: 3min → 5min → 10min → 15min
Fallback: Minimal homepage crawl
Dependencies: None (foundation agent)
```

**Capabilities:**
- **Sitemap Discovery & Processing**: BFS traversal of sitemap structures
- **Content Extraction**: HTML parsing with anti-bot evasion
- **URL Discovery**: Intelligent page discovery and prioritization
- **Robots.txt Analysis**: Crawling permission analysis

**Fallback Strategies:**
1. **Minimal Mode**: Skip sitemap processing, crawl homepage only
2. **Graceful Degradation**: Return partial results with lower confidence
3. **Never Skip**: Critical agent - must provide some result

#### **LLM Test Agent (HIGH Priority)**
```typescript
Priority: HIGH
Timeout Strategy: 2min → 3min → 5min
Fallback: Reduced query count, single model
Dependencies: Crawl Agent
```

**Capabilities:**
- **Multi-Model Testing**: Test visibility across different AI models
- **Query Variation**: Test different query formulations
- **Response Analysis**: Analyze AI model responses for brand mentions
- **Confidence Scoring**: Provide confidence metrics for visibility

**Fallback Strategies:**
1. **Minimal Mode**: Reduce to 2 queries, 1 model
2. **Graceful Degradation**: Return partial visibility results
3. **Skip if Failed**: Can be skipped if consistently failing

#### **Geo Visibility Agent (HIGH Priority)**
```typescript
Priority: HIGH
Timeout Strategy: 2min → 3min → 4min
Fallback: Single location testing
Dependencies: Crawl Agent
```

**Capabilities:**
- **Location-Based Testing**: Test visibility from different geographic locations
- **Regional Analysis**: Analyze regional search patterns
- **Localization Detection**: Detect geo-specific content variations
- **Market Penetration**: Assess global vs local visibility

#### **Sentiment Agent (MEDIUM Priority)**
```typescript
Priority: MEDIUM
Timeout Strategy: 1.5min → 2min → 3min
Fallback: Fast sentiment analysis, can skip
Dependencies: Crawl Agent
```

**Capabilities:**
- **Content Sentiment Analysis**: Analyze sentiment of website content
- **Brand Perception**: Assess how brand is presented
- **Emotional Tone**: Detect emotional indicators in content
- **Sentiment Scoring**: Provide quantitative sentiment metrics

#### **Commerce Agent (MEDIUM Priority)**
```typescript
Priority: MEDIUM
Timeout Strategy: 1.5min → 2min → 3min
Fallback: Basic product detection, can skip
Dependencies: Crawl Agent
```

**Capabilities:**
- **E-commerce Detection**: Identify e-commerce functionality
- **Product Analysis**: Analyze product pages and catalogs
- **Shopping Experience**: Evaluate user shopping journey
- **Conversion Optimization**: Assess conversion-focused elements

#### **Citation Agent (LOW Priority)**
```typescript
Priority: LOW
Timeout Strategy: 1min → 1.5min → 2min
Fallback: Can be skipped entirely
Dependencies: Crawl Agent
```

**Capabilities:**
- **Media Mention Detection**: Find references to the brand in media
- **Citation Analysis**: Analyze quality and context of citations
- **Authority Assessment**: Evaluate citing source authority
- **Mention Sentiment**: Assess sentiment of brand mentions

---

## Agent Interaction Patterns

### **1. Foundation Pattern**
```
Crawl Agent (CRITICAL)
    ↓ (provides content)
All Other Agents
```
The Crawl Agent serves as the foundation, providing essential content that all other agents depend on.

### **2. Parallel Processing Pattern**
```
Fast Agents (Parallel Execution)
├── Schema Agent
├── Semantic Agent  
├── Brand Heritage Agent
└── Score Aggregator (waits for all)
```

### **3. Priority Queue Pattern**
```
Slow Agent Queue (Priority-based)
1. Crawl Agent (CRITICAL) - Must complete first
2. LLM Test + Geo Visibility (HIGH) - Parallel execution
3. Sentiment + Commerce (MEDIUM) - Parallel execution  
4. Citation (LOW) - Executes if resources available
```

### **4. Dependency Chain Pattern**
```
Crawl Agent → Content Available
    ├── LLM Test Agent (uses content for queries)
    ├── Sentiment Agent (analyzes content sentiment)
    ├── Commerce Agent (analyzes e-commerce features)
    └── Citation Agent (searches for brand mentions)
```

---

## Intelligent Queue Management

### **Priority Scheduling Algorithm**

```typescript
class IntelligentQueueManager {
  processQueue(): void {
    // 1. Get ready-to-run agents (dependencies satisfied)
    const readyAgents = this.queue.values()
      .filter(agent => agent.status === 'pending')
      .filter(agent => this.areDependenciesSatisfied(agent))
      
    // 2. Sort by priority, then by queue time (FIFO within priority)
    readyAgents.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority // Lower number = higher priority
      }
      return a.queuedAt - b.queuedAt // FIFO within same priority
    })
    
    // 3. Start agents up to concurrency limit
    const availableSlots = this.MAX_CONCURRENT_AGENTS - this.runningAgents.size
    const agentsToStart = readyAgents.slice(0, availableSlots)
    
    agentsToStart.forEach(agent => this.startAgentExecution(agent))
  }
}
```

### **Progressive Timeout Strategy**

```typescript
interface TimeoutStrategy {
  initial: number           // Conservative first attempt
  progressive: number[]     // Increasing timeouts for retries
  maxTotal: number         // Maximum total time across attempts
  circuitBreaker: number   // Hard stop time
}

// Example: Crawl Agent timeout progression
{
  initial: 180000,      // 3 minutes - conservative start
  progressive: [        // Progressive increases
    300000,            // 5 minutes - first retry
    600000,            // 10 minutes - second retry  
    900000             // 15 minutes - final attempt
  ],
  maxTotal: 900000,     // 15 minutes total
  circuitBreaker: 900000 // Hard stop at 15 minutes
}
```

### **Fallback Strategy Implementation**

```typescript
interface FallbackStrategy {
  enabled: boolean
  fallbackAgent?: string      // Alternative simpler agent
  minimalMode: boolean        // Reduce processing scope
  gracefulDegradation: boolean // Return partial results
  skipIfFailed: boolean       // Skip if not critical
}

// Example: Crawl Agent fallback progression
async handleAgentFailure(agent: QueuedAgent, error: any): Promise<void> {
  if (agent.attempts < agent.maxAttempts) {
    // Retry with minimal mode
    agent.input.config.skipSitemapProcessing = true
    agent.input.config.maxUrlsToCrawl = 1
    this.retryAgent(agent)
    
  } else if (agent.fallbackStrategy.gracefulDegradation) {
    // Return minimal results
    const fallbackResult = {
      agentName: agent.agentName,
      status: 'completed',
      results: [{
        resultType: `${agent.agentName}_fallback`,
        normalizedScore: 25, // Minimal score
        confidenceLevel: 0.1,
        evidence: { fallback: true, reason: error.message }
      }]
    }
    await this.handleAgentSuccess(agent, fallbackResult)
    
  } else {
    // Mark as failed
    await this.handlePermanentFailure(agent)
  }
}
```

---

## Data Flow Architecture

### **1. Evaluation Initiation**
```
User Request → API Gateway → Orchestrator
    ↓
Database: Create evaluation record
    ↓
Fast Agents: Execute immediately (parallel)
    ↓
Slow Agents: Enqueue with priorities
```

### **2. Agent Execution Flow**
```
Agent Dequeue → Dependency Check → Resource Check
    ↓
Execute with Timeout → Success/Failure Handling
    ↓
Database Update → Queue Processing → Status Update
```

### **3. Result Aggregation**
```
Individual Agent Results → Score Aggregator
    ↓
Weighted Scoring → Confidence Calculation
    ↓
Final ADI Score → Database Storage → User Response
```

### **4. Real-time Status Updates**
```
Frontend Polling → Status API → Database Query
    ↓
Queue Metrics → Agent Status → Progress Calculation
    ↓
JSON Response → UI Update → User Feedback
```

---

## Error Handling & Resilience

### **1. Agent-Level Error Handling**
```typescript
abstract class BaseADIAgent {
  async executeWithTimeout(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new AIDIAgentError(
          this.config.name,
          `Agent execution timed out after ${this.config.timeout}ms`,
          this.config
        ))
      }, this.config.timeout)
    })

    try {
      const result = await Promise.race([
        this.execute(input),
        timeoutPromise
      ])
      
      if (!this.validate(result)) {
        throw new AIDIAgentError(
          this.config.name,
          'Agent output failed validation',
          this.config
        )
      }
      
      return result
    } catch (error) {
      // Implement retry logic or fallback
      throw new AIDIAgentError(
        this.config.name,
        `Execution failed: ${error.message}`,
        this.config
      )
    }
  }
}
```

### **2. System-Level Resilience**
- **Circuit Breakers**: Prevent cascading failures
- **Bulkhead Pattern**: Isolate agent failures
- **Retry with Backoff**: Exponential backoff for transient failures
- **Graceful Degradation**: Return partial results when possible

### **3. Database Resilience**
- **Connection Pooling**: Manage database connections efficiently
- **Transaction Management**: Ensure data consistency
- **Write Verification**: Confirm database writes are visible
- **Schema Isolation**: Prevent schema-related issues

---

## Performance Characteristics

### **Scalability Metrics**

| Component | Concurrent Limit | Timeout | Fallback Strategy |
|-----------|------------------|---------|-------------------|
| Fast Agents | 6 (parallel) | 8 seconds | Immediate failure |
| Slow Agents | 3 (queue) | 15 minutes | Progressive timeout |
| Database Connections | 10 (pool) | 30 seconds | Fresh connection |
| Queue Size | 50 agents | N/A | Reject new requests |

### **Performance Targets**

| Metric | Target | Current Achievement |
|--------|--------|-------------------|
| Success Rate | >95% | ~95% |
| Fast Agent Completion | <8 seconds | 2-6 seconds |
| Slow Agent Completion | <10 minutes | 3-8 minutes |
| Overall Evaluation | <12 minutes | 8-12 minutes |
| Timeout Rate | <5% | <5% |

### **Resource Utilization**

```typescript
interface SystemMetrics {
  queueUtilization: number      // 0-1 (queue fullness)
  resourceUtilization: number   // 0-1 (concurrent agents / max)
  averageWaitTime: number       // ms in queue
  averageExecutionTime: number  // ms execution time
  successRate: number           // 0-1 success percentage
  errorRate: number            // 0-1 error percentage
}
```

---

## Configuration & Customization

### **Agent Configuration**
```typescript
interface ADIAgentConfig {
  name: string
  version: string
  description: string
  dependencies: string[]        // Required predecessor agents
  timeout: number              // Execution timeout (ms)
  retryLimit: number           // Maximum retry attempts
  parallelizable: boolean      // Can run in parallel with others
  priority: AgentPriority      // Queue priority level
  fallbackStrategy: FallbackStrategy
}
```

### **System Configuration**
```typescript
interface SystemConfig {
  maxConcurrentAgents: number   // Background function limit
  maxQueueSize: number         // Queue capacity
  defaultTimeout: number       // Default agent timeout
  circuitBreakerTimeout: number // System-wide timeout
  retryBackoffMultiplier: number // Retry delay multiplier
  enableFallbacks: boolean     // Enable fallback strategies
}
```

### **Environment-Based Configuration**
```bash
# Queue System
QUEUE_SYSTEM=intelligent
QUEUE_MAX_CONCURRENT=3
QUEUE_MAX_SIZE=50

# Agent Timeouts
CRAWL_AGENT_TIMEOUT=900000
LLM_TEST_AGENT_TIMEOUT=300000

# Feature Flags
ENABLE_PROGRESSIVE_TIMEOUTS=true
ENABLE_FALLBACK_STRATEGIES=true
ENABLE_CIRCUIT_BREAKERS=true
```

---

## Monitoring & Observability

### **Real-time Metrics**
- **Queue Depth**: Number of agents waiting
- **Execution Time**: Average and percentile execution times
- **Success Rate**: Percentage of successful completions
- **Error Rate**: Frequency and types of errors
- **Resource Utilization**: CPU, memory, and connection usage

### **Agent-Specific Metrics**
- **Completion Rate**: Per-agent success statistics
- **Timeout Frequency**: Which agents timeout most often
- **Fallback Usage**: How often fallback strategies are used
- **Dependency Impact**: How agent failures affect dependents

### **System Health Indicators**
- **Database Performance**: Query times and connection health
- **Queue Performance**: Processing speed and backlog
- **Network Performance**: External API response times
- **Error Patterns**: Trending error types and frequencies

---

## Future Architecture Evolution

### **Planned Enhancements**

#### **1. Machine Learning Integration**
- **Predictive Timeouts**: Learn optimal timeouts from historical data
- **Intelligent Scheduling**: ML-based agent scheduling optimization
- **Adaptive Priorities**: Dynamic priority adjustment based on success patterns
- **Anomaly Detection**: Automatic detection of system performance issues

#### **2. Advanced Agent Capabilities**
- **Agent Composition**: Combine multiple agents for complex tasks
- **Dynamic Agent Selection**: Choose agents based on website characteristics
- **Agent Learning**: Agents that improve performance over time
- **Custom Agent Development**: Framework for creating domain-specific agents

#### **3. Enhanced Resilience**
- **Multi-Region Deployment**: Geographic distribution for reliability
- **Auto-Scaling**: Dynamic resource allocation based on load
- **Disaster Recovery**: Automated failover and recovery procedures
- **Chaos Engineering**: Systematic resilience testing

#### **4. Performance Optimization**
- **Caching Strategies**: Intelligent caching of agent results
- **Parallel Optimization**: Advanced parallel execution patterns
- **Resource Prediction**: Predictive resource allocation
- **Load Balancing**: Intelligent distribution of agent workloads

This agentic architecture represents a sophisticated, resilient system designed to handle the complexities of modern web evaluation while providing excellent user experience and system reliability. The combination of specialized agents, intelligent orchestration, and robust error handling creates a system that can adapt to various challenges while maintaining high performance and accuracy.
