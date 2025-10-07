import { getQueue } from './setup'
import { QueueMetrics } from '../types'
import { createLogger } from '../utils/logger'

const logger = createLogger('queue-metrics')

export async function getQueueMetrics(): Promise<QueueMetrics> {
  try {
    const queue = getQueue()
    
    // Get queue counts
    const [
      activeJobs,
      waitingJobs,
      completedJobs,
      failedJobs,
      delayedJobs
    ] = await Promise.all([
      queue.getActive(),
      queue.getWaiting(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed()
    ])

    const totalJobs = activeJobs.length + waitingJobs.length + completedJobs.length + failedJobs.length + delayedJobs.length

    // Calculate processing rate (jobs per minute over last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    const recentCompletedJobs = completedJobs.filter(job => job.finishedOn && job.finishedOn > oneHourAgo)
    const processingRate = recentCompletedJobs.length // Jobs completed in last hour

    // Calculate average processing time
    let averageProcessingTime = 0
    if (recentCompletedJobs.length > 0) {
      const totalProcessingTime = recentCompletedJobs.reduce((sum, job) => {
        if (job.finishedOn && job.processedOn) {
          return sum + (job.finishedOn - job.processedOn)
        }
        return sum
      }, 0)
      averageProcessingTime = totalProcessingTime / recentCompletedJobs.length
    }

    const metrics: QueueMetrics = {
      totalJobs,
      activeJobs: activeJobs.length,
      waitingJobs: waitingJobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      delayedJobs: delayedJobs.length,
      processingRate,
      averageProcessingTime: Math.round(averageProcessingTime)
    }

    logger.debug('Queue metrics collected', metrics)
    return metrics

  } catch (error) {
    logger.error('Failed to get queue metrics', { error: error.message })
    throw error
  }
}

export async function getDetailedJobInfo(jobId: string) {
  try {
    const queue = getQueue()
    const job = await queue.getJob(jobId)
    
    if (!job) {
      return null
    }

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      opts: job.opts,
      progress: job.progress(),
      delay: job.opts.delay || 0,
      timestamp: job.timestamp,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      returnvalue: job.returnvalue,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn
    }
  } catch (error) {
    logger.error('Failed to get job info', { jobId, error: error.message })
    throw error
  }
}

export async function cleanupOldJobs(): Promise<void> {
  try {
    const queue = getQueue()
    
    // Clean up completed jobs older than 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    await queue.clean(oneDayAgo, 'completed')
    
    // Clean up failed jobs older than 7 days
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    await queue.clean(oneWeekAgo, 'failed')
    
    logger.info('Old jobs cleaned up successfully')
  } catch (error) {
    logger.error('Failed to cleanup old jobs', { error: error.message })
    throw error
  }
}
