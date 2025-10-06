# ADI System Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting information for the AI Discoverability Index (ADI) system, covering common issues, diagnostic procedures, and resolution strategies based on extensive debugging experience.

---

## Quick Diagnostic Checklist

### **🚨 Emergency Checklist (Evaluation Stuck/Failed)**
1. **Check Database Connectivity**: `/api/debug/db-status`
2. **Verify Queue Status**: `GET /.netlify/functions/intelligent-background-agents`
3. **Check Agent Execution Status**: `/api/evaluation/{id}/intelligent-status`
4. **Review Recent Logs**: Netlify function logs for errors
5. **Validate Environment Variables**: Database URLs, API keys

### **⚡ Quick Fixes**
- **Stuck Evaluation**: Cancel and restart with `DELETE /.netlify/functions/intelligent-background-agents?evaluationId={id}`
- **Database Issues**: Check schema path and connection parameters
- **Agent Timeouts**: Verify intelligent queue system is enabled
- **Missing Results**: Check for foreign key constraint violations

---

## Common Issues & Solutions

### **1. Evaluations Stuck at 50% Progress**

#### **Symptoms**
- Evaluation shows 50% completion indefinitely
- Frontend shows "slow agents pending"
- Background functions report success but database shows no updates

#### **Root Causes**
```typescript
// Common causes in order of frequency:
1. Foreign key constraint violations
2. Database schema path issues  
3. Connection pooling problems
4. Write visibility issues across serverless functions
5. Agent timeout without proper fallback
```

#### **Diagnostic Steps**
```bash
# 1. Check database connectivity
curl https://your-app.netlify.app/api/debug/db-status

# 2. Check evaluation executions
curl https://your-app.netlify.app/api/evaluation/{id}/intelligent-status

# 3. Check queue status
curl https://your-app.netlify.app/.netlify/functions/intelligent-background-agents

# 4. Review Netlify function logs
netlify logs:functions
```

#### **Solutions**

**A. Foreign Key Constraint Fix**
```sql
-- Ensure evaluation record exists before agent executions
SELECT * FROM evaluations WHERE id = '{evaluation_id}';

-- If missing, check orchestrator ensureEvaluationRecord() method
-- Verify brand and user records exist
```

**B. Database Schema Path Fix**
```typescript
// Ensure all database operations use withSchema()
await withSchema(async () => {
  // Database operations here
})

// Check current schema
const result = await sql`SELECT current_schema()`
console.log('Current schema:', result[0].current_schema)
```

**C. Write Visibility Fix**
```typescript
// Use verifyWriteVisibility for critical operations
await verifyWriteVisibility(
  // Write operation
  async () => await updateExecution(executionId, data),
  // Verification query  
  async () => await getExecution(executionId),
  5, // maxRetries
  1000 // baseDelay
)
```

---

### **2. Crawl Agent 504 Gateway Timeouts**

#### **Symptoms**
- `crawl_agent` consistently times out after 15 minutes
- "504 Gateway Timeout" errors in logs
- Large enterprise sites (Nike.com, Amazon.com) fail consistently

#### **Root Causes**
```typescript
// Timeout progression analysis:
1. Sitemap processing taking too long (BFS not optimized)
2. Anti-bot evasion delays accumulating
3. Large sitemap structures (100+ index files)
4. Network latency to external sites
5. Memory exhaustion from large content
```

#### **Diagnostic Steps**
```typescript
// Check sitemap processing limits
const config = {
  MAX_SITEMAP_INDEXES_TO_PROCESS: 1,    // Should be very conservative
  MAX_CONTENT_SITEMAPS_TO_PROCESS: 2,   // Should be very conservative  
  MAX_TOTAL_URLS_DISCOVERED: 1500,     // Should prevent runaway processing
  MAX_SITEMAP_PROCESSING_TIME: 180000  // 3 minutes max
}

// Review BFS processing logs
console.log('Phase 1: Sitemap index processing...')
console.log('Phase 2: Content sitemap processing...')
console.log('Early exit conditions triggered...')
```

#### **Solutions**

**A. Ultra-Conservative Limits**
```typescript
// In sitemap-enhanced-crawl-agent.ts
private readonly MAX_SITEMAP_INDEXES_TO_PROCESS = 1     // Extremely conservative
private readonly MAX_CONTENT_SITEMAPS_TO_PROCESS = 2    // Extremely conservative
private readonly MAX_TOTAL_URLS_DISCOVERED = 1500       // Conservative limit
private readonly MAX_SITEMAP_PROCESSING_TIME = 180000   // 3 minutes max
```

**B. Intelligent Queue Progressive Timeouts**
```typescript
// Enable intelligent queue system
QUEUE_SYSTEM=intelligent

// Crawl agent gets progressive timeouts:
// Attempt 1: 3 minutes
// Attempt 2: 5 minutes  
// Attempt 3: 10 minutes
// Attempt 4: 15 minutes (with minimal mode)
```

**C. Fallback Strategy Implementation**
```typescript
// Minimal mode fallback for crawl agent
if (attempt > 1) {
  input.config = {
    skipSitemapProcessing: true,
    maxUrlsToCrawl: 1,
    timeout: 30000 // 30 seconds for homepage only
  }
}
```

---

### **3. Database Connection Issues**

#### **Symptoms**
- "Database connection not available" errors
- Intermittent connection failures
- Schema path not set correctly
- Connection pooling conflicts

#### **Root Causes**
```typescript
// Database connection issues:
1. Environment variables not set correctly
2. Connection string format issues
3. Schema path race conditions
4. Connection pooling in serverless environment
5. Transaction isolation problems
```

#### **Diagnostic Steps**
```bash
# 1. Check environment variables
echo $DATABASE_URL
echo $NEON_DATABASE_URL

# 2. Test database connectivity
curl https://your-app.netlify.app/api/debug/db-status

# 3. Check schema path
SELECT current_schema(), current_database(), pg_backend_pid();

# 4. Verify connection parameters
SELECT current_setting('application_name');
SELECT current_setting('statement_timeout');
```

#### **Solutions**

**A. Environment Variable Setup**
```bash
# Ensure correct database URL format
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Add connection parameters for reliability
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require&target_session_attrs=read-write&connect_timeout=10"
```

**B. Fresh Connection Strategy**
```typescript
// Use withSchema() for all critical operations
export async function withSchema<T>(queryFn: () => Promise<T>): Promise<T> {
  // Force fresh connection with explicit parameters
  const connectionParams = [
    'target_session_attrs=read-write',
    'connect_timeout=10',
    'application_name=adi-hybrid-system',
    'statement_timeout=30000',
    'idle_in_transaction_session_timeout=60000'
  ].join('&')
  
  const freshSql = neon(DB_URL.includes('?') 
    ? `${DB_URL}&${connectionParams}`
    : `${DB_URL}?${connectionParams}`)
  
  await freshSql`SET search_path TO production, public`
  
  // Execute query with fresh connection
  const result = await queryFn()
  
  // Ensure transaction commit
  await freshSql`COMMIT`
  
  return result
}
```

**C. Connection Health Monitoring**
```typescript
// Add connection health checks
const healthCheck = await sql`
  SELECT 
    current_schema() as schema,
    current_database() as db,
    pg_backend_pid() as pid,
    current_setting('transaction_isolation') as isolation_level,
    now() as connection_time
`
console.log('Database health:', healthCheck[0])
```

---

### **4. Agent Priority & Queue Issues**

#### **Symptoms**
- Low priority agents running before high priority
- Queue not processing agents in correct order
- Resource limits not being respected
- Agents stuck in pending state

#### **Root Causes**
```typescript
// Queue management issues:
1. Priority enum values incorrect (lower number = higher priority)
2. Dependency checking not working correctly
3. Resource limits too restrictive
4. Queue processing not triggered
5. Agent classification incorrect
```

#### **Diagnostic Steps**
```typescript
// Check queue metrics
const metrics = await queueManager.getMetrics()
console.log('Queue metrics:', {
  totalQueued: metrics.totalQueued,
  totalRunning: metrics.totalRunning,
  resourceUtilization: metrics.resourceUtilization
})

// Check agent priorities
const agentConfig = queueManager.getAgentConfiguration('crawl_agent')
console.log('Agent config:', {
  priority: agentConfig.priority,
  maxAttempts: agentConfig.maxAttempts,
  timeout: agentConfig.currentTimeout
})

// Check dependencies
const dependenciesSatisfied = queueManager.areDependenciesSatisfied(agent)
console.log('Dependencies satisfied:', dependenciesSatisfied)
```

#### **Solutions**

**A. Correct Priority Configuration**
```typescript
enum AgentPriority {
  CRITICAL = 1,    // crawl_agent - MUST complete
  HIGH = 2,        // llm_test_agent, geo_visibility_agent
  MEDIUM = 3,      // sentiment_agent, commerce_agent  
  LOW = 4,         // citation_agent
  OPTIONAL = 5     // future agents
}

// Verify agent classification
const AGENT_PRIORITIES = {
  'crawl_agent': AgentPriority.CRITICAL,
  'llm_test_agent': AgentPriority.HIGH,
  'geo_visibility_agent': AgentPriority.HIGH,
  'sentiment_agent': AgentPriority.MEDIUM,
  'commerce_agent': AgentPriority.MEDIUM,
  'citation_agent': AgentPriority.LOW
}
```

**B. Resource Limit Tuning**
```typescript
// Adjust resource limits based on system capacity
private readonly MAX_CONCURRENT_AGENTS = 3  // Conservative for stability
private readonly MAX_QUEUE_SIZE = 50        // Prevent memory issues
private readonly QUEUE_CLEANUP_INTERVAL = 300000 // 5 minutes
```

**C. Dependency Chain Verification**
```typescript
// Ensure correct dependency setup
const AGENT_DEPENDENCIES = {
  'crawl_agent': [],                    // No dependencies (foundation)
  'llm_test_agent': ['crawl_agent'],    // Needs content from crawl
  'sentiment_agent': ['crawl_agent'],   // Needs content from crawl
  'geo_visibility_agent': ['crawl_agent'], // Needs brand info
  'commerce_agent': ['crawl_agent'],    // Needs content from crawl
  'citation_agent': ['crawl_agent']     // Needs brand info
}
```

---

### **5. Frontend Status Polling Issues**

#### **Symptoms**
- Progress bar stuck at same percentage
- Status updates not reflecting actual progress
- Evaluation appears complete but shows as running
- Inconsistent status between refreshes

#### **Root Causes**
```typescript
// Frontend polling issues:
1. Polling wrong endpoint (hybrid-status vs intelligent-status)
2. Caching issues preventing fresh data
3. Status calculation logic errors
4. Database read consistency issues
5. Queue metrics not updating
```

#### **Diagnostic Steps**
```typescript
// Check status endpoint response
const response = await fetch('/api/evaluation/{id}/intelligent-status')
const status = await response.json()

console.log('Status response:', {
  overallStatus: status.overallStatus,
  progress: status.progress,
  agentDetails: status.agentDetails,
  queueMetrics: status.queueMetrics
})

// Verify database state
const executions = await tracker.getEvaluationExecutions(evaluationId)
console.log('Database executions:', executions.map(e => ({
  agentName: e.agentName,
  status: e.status,
  createdAt: e.createdAt,
  completedAt: e.completedAt
})))
```

#### **Solutions**

**A. Use Correct Status Endpoint**
```typescript
// For intelligent queue system
const statusUrl = `/api/evaluation/${evaluationId}/intelligent-status`

// For traditional system  
const statusUrl = `/api/evaluation/${evaluationId}/hybrid-status`

// Auto-detect based on configuration
import { getStatusEndpoint } from '@/lib/adi/queue-config'
const statusUrl = getStatusEndpoint(evaluationId)
```

**B. Enhanced Retry Logic**
```typescript
// Implement robust polling with retries
const pollStatus = async () => {
  const maxRetries = 3
  let retryCount = 0
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(statusUrl, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const status = await response.json()
      return status
      
    } catch (error) {
      retryCount++
      if (retryCount >= maxRetries) throw error
      
      // Exponential backoff
      const delay = 1000 * Math.pow(2, retryCount - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

**C. Status Consistency Verification**
```typescript
// Add status consistency checks
const verifyStatusConsistency = async (status) => {
  // Check for logical inconsistencies
  if (status.progress.percentage === 100 && status.overallStatus !== 'completed') {
    console.warn('Status inconsistency detected:', status)
    // Trigger status refresh
  }
  
  // Verify agent count consistency
  const expectedAgents = 6 // Total slow agents
  if (status.progress.totalAgents !== expectedAgents) {
    console.warn('Agent count mismatch:', {
      expected: expectedAgents,
      actual: status.progress.totalAgents
    })
  }
}
```

---

## Advanced Debugging Techniques

### **1. Database State Analysis**

#### **SQL Debugging Queries**
```sql
-- Check evaluation and execution state
SELECT 
  e.id as evaluation_id,
  e.status as eval_status,
  e.created_at as eval_created,
  COUNT(bae.id) as execution_count,
  COUNT(CASE WHEN bae.status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN bae.status = 'running' THEN 1 END) as running_count,
  COUNT(CASE WHEN bae.status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN bae.status = 'failed' THEN 1 END) as failed_count
FROM evaluations e
LEFT JOIN backend_agent_executions bae ON e.id = bae.evaluation_id
WHERE e.id = '{evaluation_id}'
GROUP BY e.id, e.status, e.created_at;

-- Check agent execution details
SELECT 
  agent_name,
  status,
  created_at,
  started_at,
  completed_at,
  execution_time,
  error_message
FROM backend_agent_executions 
WHERE evaluation_id = '{evaluation_id}'
ORDER BY created_at;

-- Check for foreign key violations
SELECT 
  bae.id,
  bae.evaluation_id,
  e.id as eval_exists
FROM backend_agent_executions bae
LEFT JOIN evaluations e ON bae.evaluation_id = e.id
WHERE e.id IS NULL;
```

#### **Connection Diagnostics**
```sql
-- Check current connection state
SELECT 
  current_schema() as schema,
  current_database() as database,
  current_user as user,
  pg_backend_pid() as process_id,
  current_setting('application_name') as app_name,
  current_setting('transaction_isolation') as isolation_level,
  now() as connection_time;

-- Check active connections
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change
FROM pg_stat_activity 
WHERE application_name LIKE '%adi%';
```

### **2. Queue State Debugging**

#### **Queue Metrics Analysis**
```typescript
// Comprehensive queue diagnostics
const diagnostics = {
  queueMetrics: await queueManager.getMetrics(),
  evaluationStatus: await queueManager.getEvaluationStatus(evaluationId),
  systemHealth: {
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    nodeVersion: process.version
  },
  environmentCheck: {
    queueSystem: process.env.QUEUE_SYSTEM,
    databaseUrl: !!process.env.DATABASE_URL,
    netlifyContext: process.env.CONTEXT
  }
}

console.log('Queue diagnostics:', JSON.stringify(diagnostics, null, 2))
```

#### **Agent State Tracking**
```typescript
// Track agent state transitions
class AgentStateTracker {
  private stateHistory: Map<string, StateTransition[]> = new Map()
  
  logStateTransition(agentId: string, fromState: string, toState: string) {
    const transitions = this.stateHistory.get(agentId) || []
    transitions.push({
      timestamp: Date.now(),
      fromState,
      toState,
      duration: this.calculateDuration(transitions)
    })
    this.stateHistory.set(agentId, transitions)
  }
  
  getAgentHistory(agentId: string): StateTransition[] {
    return this.stateHistory.get(agentId) || []
  }
}
```

### **3. Performance Monitoring**

#### **Execution Time Analysis**
```typescript
// Performance monitoring wrapper
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  
  async measureExecution<T>(
    operationName: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    const startMemory = process.memoryUsage()
    
    try {
      const result = await operation()
      
      this.recordMetric(operationName, {
        duration: Date.now() - startTime,
        memoryDelta: process.memoryUsage().heapUsed - startMemory.heapUsed,
        success: true
      })
      
      return result
    } catch (error) {
      this.recordMetric(operationName, {
        duration: Date.now() - startTime,
        memoryDelta: process.memoryUsage().heapUsed - startMemory.heapUsed,
        success: false,
        error: error.message
      })
      throw error
    }
  }
}
```

#### **Resource Usage Tracking**
```typescript
// Monitor system resources
const monitorResources = () => {
  const usage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  
  console.log('Resource usage:', {
    memory: {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(usage.external / 1024 / 1024) + 'MB'
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: Math.round(process.uptime()) + 's'
  })
}
```

---

## Error Code Reference

### **Database Errors**
```typescript
const DATABASE_ERRORS = {
  'CONNECTION_FAILED': {
    code: 'DB_001',
    message: 'Database connection failed',
    solution: 'Check DATABASE_URL and network connectivity'
  },
  'SCHEMA_PATH_ERROR': {
    code: 'DB_002', 
    message: 'Schema path not set correctly',
    solution: 'Use withSchema() wrapper for all database operations'
  },
  'FOREIGN_KEY_VIOLATION': {
    code: 'DB_003',
    message: 'Foreign key constraint violation',
    solution: 'Ensure parent records exist before creating child records'
  },
  'WRITE_VISIBILITY_TIMEOUT': {
    code: 'DB_004',
    message: 'Write not visible across connections',
    solution: 'Use verifyWriteVisibility() for critical operations'
  }
}
```

### **Queue Errors**
```typescript
const QUEUE_ERRORS = {
  'QUEUE_FULL': {
    code: 'Q_001',
    message: 'Queue at maximum capacity',
    solution: 'Increase MAX_QUEUE_SIZE or wait for queue to drain'
  },
  'DEPENDENCY_TIMEOUT': {
    code: 'Q_002',
    message: 'Agent dependency not satisfied',
    solution: 'Check if prerequisite agents completed successfully'
  },
  'RESOURCE_EXHAUSTED': {
    code: 'Q_003',
    message: 'Maximum concurrent agents reached',
    solution: 'Wait for running agents to complete or increase limits'
  },
  'CIRCUIT_BREAKER_OPEN': {
    code: 'Q_004',
    message: 'Circuit breaker activated',
    solution: 'Agent exceeded maximum total execution time'
  }
}
```

### **Agent Errors**
```typescript
const AGENT_ERRORS = {
  'TIMEOUT_EXCEEDED': {
    code: 'A_001',
    message: 'Agent execution timeout',
    solution: 'Enable progressive timeouts or reduce processing scope'
  },
  'VALIDATION_FAILED': {
    code: 'A_002',
    message: 'Agent output validation failed',
    solution: 'Check agent output format and required fields'
  },
  'DEPENDENCY_FAILED': {
    code: 'A_003',
    message: 'Required dependency agent failed',
    solution: 'Fix dependency agent or enable fallback strategies'
  },
  'RESOURCE_UNAVAILABLE': {
    code: 'A_004',
    message: 'Required external resource unavailable',
    solution: 'Check network connectivity and API endpoints'
  }
}
```

---

## Monitoring & Alerting Setup

### **Health Check Endpoints**
```typescript
// System health monitoring
const healthChecks = {
  database: '/api/debug/db-status',
  queue: '/.netlify/functions/intelligent-background-agents',
  agents: '/api/debug/agent-health',
  system: '/api/debug/system-health'
}

// Automated health monitoring
const monitorHealth = async () => {
  for (const [service, endpoint] of Object.entries(healthChecks)) {
    try {
      const response = await fetch(endpoint, { timeout: 5000 })
      const health = await response.json()
      
      if (!health.ok) {
        console.error(`${service} health check failed:`, health)
        // Trigger alert
      }
    } catch (error) {
      console.error(`${service} health check error:`, error)
      // Trigger alert
    }
  }
}
```

### **Performance Thresholds**
```typescript
const PERFORMANCE_THRESHOLDS = {
  evaluationTimeout: 15 * 60 * 1000,    // 15 minutes max
  agentTimeout: 10 * 60 * 1000,         // 10 minutes max per agent
  databaseResponseTime: 5000,            // 5 seconds max
  queueProcessingDelay: 30000,           // 30 seconds max queue delay
  memoryUsage: 512 * 1024 * 1024,       // 512MB max memory
  errorRate: 0.05                        // 5% max error rate
}
```

### **Automated Recovery Procedures**
```typescript
// Automated recovery for common issues
const recoveryProcedures = {
  stuckEvaluation: async (evaluationId: string) => {
    console.log(`Attempting recovery for stuck evaluation: ${evaluationId}`)
    
    // 1. Cancel current evaluation
    await cancelEvaluation(evaluationId)
    
    // 2. Clean up queue state
    await queueManager.cancelEvaluation(evaluationId)
    
    // 3. Reset database state
    await resetEvaluationState(evaluationId)
    
    // 4. Restart with conservative settings
    await restartEvaluationWithFallbacks(evaluationId)
  },
  
  databaseConnectionIssue: async () => {
    console.log('Attempting database connection recovery')
    
    // 1. Test connection
    const isHealthy = await testDatabaseConnection()
    
    if (!isHealthy) {
      // 2. Reinitialize connection pool
      await reinitializeDatabaseConnection()
      
      // 3. Verify schema path
      await ensureSchemaPath()
    }
  }
}
```

This troubleshooting guide provides comprehensive coverage of the most common issues encountered in the ADI system, along with proven diagnostic and resolution strategies developed through extensive debugging experience.
