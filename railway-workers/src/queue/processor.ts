import { Job } from 'bull'
import { createLogger } from '../utils/logger'
import { AgentJob, AgentResult, CallbackPayload } from '../types'
import { getQueue } from './setup'
import { CallbackClient } from '../clients/callback'
import { AgentExecutor } from '../agents/executor'

const logger = createLogger('queue-processor')

export async function enqueueAgentJob(jobData: AgentJob): Promise<Job> {
  try {
    const queue = getQueue()
    
    // Set job priority based on tier
    let priority = 0
    switch (jobData.priority) {
      case 'high':
        priority = 10
        break
      case 'normal':
        priority = 5
        break
      case 'low':
        priority = 1
        break
    }

    const job = await queue.add('execute-agents', jobData, {
      priority,
      delay: 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    })

    logger.info('Agent job enqueued', {
      jobId: job.id,
      evaluationId: jobData.evaluationId,
      agents: jobData.agents,
      priority: jobData.priority,
      queuePosition: await (job as any).getPosition?.() || 0
    })

    return job
  } catch (error) {
    logger.error('Failed to enqueue agent job', {
      evaluationId: jobData.evaluationId,
      error: error.message
    })
    throw error
  }
}

export async function processAgentJob(job: Job<AgentJob>): Promise<any> {
  const { evaluationId, websiteUrl, tier, agents, callbackUrl, authToken } = job.data
  
  logger.info('Processing agent job', {
    jobId: job.id,
    evaluationId,
    websiteUrl,
    tier,
    agents,
    startTime: new Date().toISOString()
  })

  const callback = new CallbackClient(callbackUrl, authToken)
  const executor = new AgentExecutor()
  const results: AgentResult[] = []

  try {
    // Update job progress
    await job.progress(0)

    // Execute agents in parallel with controlled concurrency
    const agentPromises = agents.map(async (agentName, index) => {
      try {
        logger.info('Starting agent execution', {
          jobId: job.id,
          evaluationId,
          agentName
        })

        // Notify callback that agent is starting
        await callback.updateAgentStatus(evaluationId, agentName, 'running')

        // Execute the agent
        const startTime = Date.now()
        const result = await executor.executeAgent(agentName, {
          evaluationId,
          websiteUrl,
          tier,
          metadata: job.data.metadata
        })

        const executionTime = Date.now() - startTime
        const agentResult: AgentResult = {
          agentName,
          status: 'completed',
          result,
          executionTime,
          metadata: {
            completedAt: new Date().toISOString(),
            memoryUsage: process.memoryUsage().heapUsed
          }
        }

        // Notify callback of completion
        await callback.updateAgentStatus(evaluationId, agentName, 'completed', result)

        // Update job progress
        const progress = Math.round(((index + 1) / agents.length) * 100)
        await job.progress(progress)

        logger.info('Agent execution completed', {
          jobId: job.id,
          evaluationId,
          agentName,
          executionTime,
          status: 'completed'
        })

        return agentResult

      } catch (error) {
        logger.error('Agent execution failed', {
          jobId: job.id,
          evaluationId,
          agentName,
          error: error.message,
          stack: error.stack
        })

        const agentResult: AgentResult = {
          agentName,
          status: 'failed',
          error: error.message,
          executionTime: 0,
          metadata: {
            failedAt: new Date().toISOString(),
            errorType: error.constructor.name
          }
        }

        // Notify callback of failure
        await callback.updateAgentStatus(evaluationId, agentName, 'failed', null, error.message)

        return agentResult
      }
    })

    // Wait for all agents to complete
    results.push(...await Promise.all(agentPromises))

    // Final progress update
    await job.progress(100)

    // Send completion notification
    await callback.notifyCompletion(evaluationId, results)

    const completedAgents = results.filter(r => r.status === 'completed').length
    const failedAgents = results.filter(r => r.status === 'failed').length
    const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0)

    logger.info('Agent job completed', {
      jobId: job.id,
      evaluationId,
      completedAgents,
      failedAgents,
      totalExecutionTime,
      endTime: new Date().toISOString()
    })

    return {
      evaluationId,
      status: failedAgents === 0 ? 'completed' : 'partial',
      results,
      summary: {
        totalAgents: agents.length,
        completedAgents,
        failedAgents,
        totalExecutionTime
      }
    }

  } catch (error) {
    logger.error('Agent job processing failed', {
      jobId: job.id,
      evaluationId,
      error: error.message,
      stack: error.stack
    })

    // Try to notify callback of overall failure
    try {
      await callback.notifyFailure(evaluationId, error.message)
    } catch (callbackError) {
      logger.error('Failed to notify callback of job failure', {
        jobId: job.id,
        evaluationId,
        callbackError: callbackError.message
      })
    }

    throw error
  }
}
