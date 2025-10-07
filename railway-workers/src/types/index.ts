// Express Request extension
declare global {
  namespace Express {
    interface Request {
      requestId?: string
      user?: {
        evaluationId: string
        allowedAgents: string[]
      }
    }
  }
}

// Bridge Communication Types
export interface BridgeRequest {
  evaluationId: string
  websiteUrl: string
  tier: string
  agents: string[]
  callbackUrl: string
  authToken: string
  priority: 'high' | 'normal' | 'low'
  metadata?: Record<string, any>
}

export interface BridgeResponse {
  success: boolean
  jobId?: string
  queuePosition?: number
  estimatedStartTime?: string
  error?: string
}

export interface AgentJob {
  evaluationId: string
  websiteUrl: string
  tier: string
  agents: string[]
  callbackUrl: string
  authToken: string
  priority: 'high' | 'normal' | 'low'
  metadata?: Record<string, any>
}

export interface AgentContext {
  evaluationId: string
  websiteUrl: string
  tier: string
  metadata?: Record<string, any>
}

export interface AgentResult {
  agentName: string
  status: 'completed' | 'failed'
  result?: any
  error?: string
  executionTime: number
  memoryUsage?: number
  metadata?: Record<string, any>
}

export interface CallbackPayload {
  evaluationId: string
  agentName?: string
  status: 'running' | 'completed' | 'failed'
  result?: any
  error?: string
  progress?: number
  metadata?: Record<string, any>
}

export interface QueueMetrics {
  totalJobs: number
  activeJobs: number
  waitingJobs: number
  completedJobs: number
  failedJobs: number
  delayedJobs: number
  processingRate: number
  averageProcessingTime: number
}

// Error Types
export class BridgeError extends Error {
  constructor(message: string, public code?: string, public statusCode?: number) {
    super(message)
    this.name = 'BridgeError'
  }
}

export class AgentExecutionError extends Error {
  constructor(
    public agentName: string,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AgentExecutionError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}
