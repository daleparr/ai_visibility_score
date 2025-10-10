import axios, { AxiosInstance } from 'axios'
import { createLogger } from '../utils/logger'
import { CallbackPayload, AgentResult } from '../types'

const logger = createLogger('callback-client')

export class CallbackClient {
  private client: AxiosInstance
  private callbackUrl: string
  private authToken: string

  constructor(callbackUrl: string, authToken: string) {
    this.callbackUrl = callbackUrl
    this.authToken = authToken

    this.client = axios.create({
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'AIDI-Railway-Worker/1.0.0'
      }
    })

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Callback request', {
          url: config.url,
          method: config.method,
          headers: { ...config.headers, Authorization: '[REDACTED]' }
        })
        return config
      },
      (error) => {
        logger.error('Callback request error', { error: error.message })
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Callback response', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        })
        return response
      },
      (error) => {
        logger.error('Callback response error', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })
        return Promise.reject(error)
      }
    )
  }

  async updateAgentStatus(
    evaluationId: string,
    agentName: string,
    status: 'running' | 'completed' | 'failed',
    result?: any,
    error?: string
  ): Promise<void> {
    try {
      const payload: CallbackPayload = {
        evaluationId,
        agentName,
        status,
        result,
        error,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'railway-worker'
        }
      }

      const response = await this.client.post(`${this.callbackUrl}/progress`, payload)

      logger.info('Agent status updated', {
        evaluationId,
        agentName,
        status,
        responseStatus: response.status
      })

    } catch (error) {
      logger.error('Failed to update agent status', {
        evaluationId,
        agentName,
        status,
        error: error.message,
        response: error.response?.data
      })

      // Don't throw error - callback failures shouldn't stop agent processing
      // But we should track these failures for monitoring
    }
  }

  async notifyCompletion(evaluationId: string, results: AgentResult[]): Promise<void> {
    try {
      const payload = {
        evaluationId,
        status: 'completed',
        results,
        summary: {
          totalAgents: results.length,
          completedAgents: results.filter(r => r.status === 'completed').length,
          failedAgents: results.filter(r => r.status === 'failed').length,
          totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'railway-worker',
          completedAt: new Date().toISOString()
        }
      }

      const fullCallbackUrl = `${this.callbackUrl}/complete`
      logger.info('🔔 SENDING COMPLETION CALLBACK', {
        evaluationId,
        fullUrl: fullCallbackUrl,
        callbackUrl: this.callbackUrl,
        completedAgents: payload.summary.completedAgents
      })

      const response = await this.client.post(fullCallbackUrl, payload)

      logger.info('Completion notification sent', {
        evaluationId,
        totalAgents: results.length,
        responseStatus: response.status
      })

    } catch (error) {
      logger.error('Failed to send completion notification', {
        evaluationId,
        error: error.message,
        response: error.response?.data
      })

      // This is more critical - we should retry completion notifications
      // TODO: Implement retry logic for completion notifications
      throw error
    }
  }

  async notifyFailure(evaluationId: string, errorMessage: string): Promise<void> {
    try {
      const payload = {
        evaluationId,
        status: 'failed',
        error: errorMessage,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'railway-worker',
          failedAt: new Date().toISOString()
        }
      }

      const response = await this.client.post(`${this.callbackUrl}/complete`, payload)

      logger.info('Failure notification sent', {
        evaluationId,
        errorMessage,
        responseStatus: response.status
      })

    } catch (error) {
      logger.error('Failed to send failure notification', {
        evaluationId,
        errorMessage,
        error: error.message,
        response: error.response?.data
      })

      // Don't throw - we've already failed, don't make it worse
    }
  }

  async sendProgress(evaluationId: string, progress: number, message?: string): Promise<void> {
    try {
      const payload: CallbackPayload = {
        evaluationId,
        status: 'running',
        progress,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'railway-worker',
          message
        }
      }

      await this.client.post(`${this.callbackUrl}/progress`, payload)

      logger.debug('Progress update sent', {
        evaluationId,
        progress,
        message
      })

    } catch (error) {
      logger.error('Failed to send progress update', {
        evaluationId,
        progress,
        error: error.message
      })

      // Don't throw - progress updates are nice-to-have
    }
  }
}
