import { Router, Request, Response, NextFunction } from 'express'
import { createLogger } from '../utils/logger'
import { enqueueAgentJob } from '../queue/processor'
import { getQueueMetrics } from '../queue/metrics'
import { BridgeRequest, BridgeError } from '../types'

const router = Router()
const logger = createLogger('queue-route')

// Enqueue agents for processing
router.post('/enqueue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      evaluationId,
      websiteUrl,
      tier,
      agents,
      callbackUrl,
      priority = 'normal',
      metadata = {}
    } = req.body as BridgeRequest

    // Validate required fields
    if (!evaluationId || !websiteUrl || !agents || !Array.isArray(agents) || agents.length === 0) {
      throw new BridgeError('Missing required fields: evaluationId, websiteUrl, agents', 'VALIDATION_ERROR', 400)
    }

    if (!callbackUrl || !callbackUrl.startsWith('https://')) {
      throw new BridgeError('Invalid callbackUrl: must be HTTPS URL', 'VALIDATION_ERROR', 400)
    }

    // Validate agents against allowed agents from JWT
    const allowedAgents = req.user?.allowedAgents || []
    const invalidAgents = agents.filter(agent => !allowedAgents.includes(agent))
    
    if (invalidAgents.length > 0) {
      throw new BridgeError(
        `Agents not allowed: ${invalidAgents.join(', ')}`,
        'UNAUTHORIZED_AGENTS',
        403
      )
    }

    // Validate evaluation ID matches JWT
    if (req.user?.evaluationId !== evaluationId) {
      throw new BridgeError(
        'Evaluation ID mismatch with authentication token',
        'EVALUATION_ID_MISMATCH',
        403
      )
    }

    logger.info('Enqueueing agent job', {
      requestId: req.requestId,
      evaluationId,
      websiteUrl,
      tier,
      agents,
      priority
    })

    // Enqueue the job
    const job = await enqueueAgentJob({
      evaluationId,
      websiteUrl,
      tier,
      agents,
      callbackUrl,
      authToken: req.headers.authorization!.substring(7), // Remove 'Bearer '
      priority,
      metadata
    })

    res.json({
      success: true,
      jobId: job.id,
      evaluationId,
      queuePosition: await (job as any).getPosition?.() || 0,
      estimatedStartTime: new Date(Date.now() + ((await (job as any).getPosition?.()) || 0) * 30000).toISOString(), // Rough estimate
      agents,
      priority,
      requestId: req.requestId
    })

  } catch (error) {
    next(error)
  }
})

// Get queue status and metrics
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await getQueueMetrics()
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      requestId: req.requestId
    })
  } catch (error) {
    next(error)
  }
})

// Get specific job status
router.get('/job/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params
    
    if (!jobId) {
      throw new BridgeError('Job ID is required', 'MISSING_JOB_ID', 400)
    }

    // TODO: Implement job status lookup
    // This would require storing job references and implementing job lookup
    
    res.json({
      success: true,
      jobId,
      status: 'not_implemented',
      message: 'Job status lookup not yet implemented',
      requestId: req.requestId
    })
  } catch (error) {
    next(error)
  }
})

// Cancel a job (if possible)
router.delete('/job/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params
    
    if (!jobId) {
      throw new BridgeError('Job ID is required', 'MISSING_JOB_ID', 400)
    }

    // TODO: Implement job cancellation
    // This would require job lookup and cancellation logic
    
    res.json({
      success: true,
      jobId,
      status: 'not_implemented',
      message: 'Job cancellation not yet implemented',
      requestId: req.requestId
    })
  } catch (error) {
    next(error)
  }
})

export { router as queueRouter }
