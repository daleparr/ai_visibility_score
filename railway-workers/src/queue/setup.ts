import Queue from 'bull'
import Redis from 'ioredis'
import { createLogger } from '../utils/logger'

const logger = createLogger('queue-setup')

let redis: Redis
let agentQueue: Queue.Queue

export async function setupQueue(): Promise<void> {
  try {
    // Initialize Redis connection
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required')
    }

    logger.info('Connecting to Redis...', { redisUrl: redisUrl.substring(0, 20) + '...' })
    
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000
    })

    // Test Redis connection
    await redis.ping()
    logger.info('Redis connection established')

    // Initialize Bull queue
    agentQueue = new Queue('agent-processing', {
      redis: {
        port: redis.options.port,
        host: redis.options.host,
        password: redis.options.password,
        db: redis.options.db || 0
      },
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50,      // Keep last 50 failed jobs
        attempts: 3,           // Retry failed jobs up to 3 times
        backoff: {
          type: 'exponential',
          delay: 2000          // Start with 2 second delay, exponentially increase
        },
        delay: 0,              // No initial delay
        timeout: parseInt(process.env.JOB_TIMEOUT || '600000') // 10 minutes default
      }
    })

    // Set up queue event handlers
    setupQueueEventHandlers()

    // Start processing jobs
    const concurrency = parseInt(process.env.QUEUE_CONCURRENCY || '4')
    logger.info(`Starting queue processing with concurrency: ${concurrency}`)
    
    // Import and set up the processor (we'll create this next)
    const { processAgentJob } = await import('./processor')
    agentQueue.process('execute-agents', concurrency, processAgentJob)

    logger.info('Queue setup completed successfully')

  } catch (error) {
    logger.error('Failed to setup queue', { error: error.message })
    throw error
  }
}

function setupQueueEventHandlers(): void {
  if (!agentQueue) return

  agentQueue.on('ready', () => {
    logger.info('Queue is ready and connected')
  })

  agentQueue.on('error', (error) => {
    logger.error('Queue error', { error: error.message })
  })

  agentQueue.on('waiting', (jobId) => {
    logger.debug('Job waiting', { jobId })
  })

  agentQueue.on('active', (job) => {
    logger.info('Job started', {
      jobId: job.id,
      evaluationId: job.data.evaluationId,
      agents: job.data.agents
    })
  })

  agentQueue.on('completed', (job, result) => {
    logger.info('Job completed', {
      jobId: job.id,
      evaluationId: job.data.evaluationId,
      duration: Date.now() - job.timestamp,
      resultSummary: {
        evaluationId: result.evaluationId,
        completedAgents: result.results?.filter(r => r.status === 'completed').length || 0,
        failedAgents: result.results?.filter(r => r.status === 'failed').length || 0
      }
    })
  })

  agentQueue.on('failed', (job, error) => {
    logger.error('Job failed', {
      jobId: job.id,
      evaluationId: job.data?.evaluationId,
      error: error.message,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts
    })
  })

  agentQueue.on('stalled', (job) => {
    logger.warn('Job stalled', {
      jobId: job.id,
      evaluationId: job.data?.evaluationId,
      stalledAt: new Date().toISOString()
    })
  })

  agentQueue.on('progress', (job, progress) => {
    logger.debug('Job progress', {
      jobId: job.id,
      evaluationId: job.data?.evaluationId,
      progress
    })
  })
}

export function getQueue(): Queue.Queue {
  if (!agentQueue) {
    throw new Error('Queue not initialized. Call setupQueue() first.')
  }
  return agentQueue
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis not initialized. Call setupQueue() first.')
  }
  return redis
}

// Graceful shutdown
export async function closeQueue(): Promise<void> {
  if (agentQueue) {
    logger.info('Closing queue...')
    await agentQueue.close()
  }
  
  if (redis) {
    logger.info('Closing Redis connection...')
    redis.disconnect()
  }
}
