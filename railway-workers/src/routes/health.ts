import { Router, Request, Response } from 'express'
import { createLogger } from '../utils/logger'
import { getQueueMetrics } from '../queue/metrics'

const router = Router()
const logger = createLogger('health-route')

// Basic health check
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AIDI Railway Workers',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    }

    res.json(health)
  } catch (error) {
    logger.error('Health check failed', { error: error.message })
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

// Detailed health check with dependencies
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const checks = {
      service: 'healthy',
      redis: 'unknown',
      queue: 'unknown',
      memory: 'healthy',
      disk: 'healthy'
    }

    let overallStatus = 'healthy'

    // Check Redis connection
    try {
      const queueMetrics = await getQueueMetrics()
      checks.redis = 'healthy'
      checks.queue = 'healthy'
    } catch (error) {
      checks.redis = 'unhealthy'
      checks.queue = 'unhealthy'
      overallStatus = 'degraded'
      logger.warn('Redis/Queue health check failed', { error: error.message })
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
    if (memoryUsagePercent > 90) {
      checks.memory = 'critical'
      overallStatus = 'unhealthy'
    } else if (memoryUsagePercent > 80) {
      checks.memory = 'warning'
      if (overallStatus === 'healthy') overallStatus = 'degraded'
    }

    const health = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      metrics: {
        uptime: process.uptime(),
        memory: memoryUsage,
        memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
        pid: process.pid,
        nodeVersion: process.version
      }
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503

    res.status(statusCode).json(health)
  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message })
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

// Readiness probe (for Railway deployment)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    await getQueueMetrics() // This will throw if Redis/Queue is not ready
    
    res.json({
      ready: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message })
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

// Liveness probe (for Railway deployment)
router.get('/live', (req: Request, res: Response) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    pid: process.pid
  })
})

export { router as healthRouter }
