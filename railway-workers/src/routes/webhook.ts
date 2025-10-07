import { Router, Request, Response, NextFunction } from 'express'
import { createLogger } from '../utils/logger'
import { BridgeError } from '../types'

const router = Router()
const logger = createLogger('webhook-route')

// Simple webhook authentication middleware
function webhookAuth(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-webhook-secret']
  const expectedSecret = process.env.NETLIFY_CALLBACK_SECRET
  
  if (!expectedSecret) {
    logger.error('NETLIFY_CALLBACK_SECRET not configured')
    return next(new BridgeError('Server configuration error', 'CONFIG_ERROR', 500))
  }
  
  if (secret !== expectedSecret) {
    logger.warn('Invalid webhook secret', {
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    })
    return next(new BridgeError('Invalid webhook secret', 'UNAUTHORIZED', 401))
  }
  
  next()
}

// Webhook endpoint for external notifications (if needed)
router.post('/external', webhookAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, payload } = req.body
    
    logger.info('External webhook received', {
      requestId: req.requestId,
      type,
      payload: JSON.stringify(payload).substring(0, 200) // Log first 200 chars
    })
    
    // Handle different webhook types
    switch (type) {
      case 'queue_status':
        // Handle queue status updates
        break
        
      case 'system_alert':
        // Handle system alerts
        break
        
      default:
        logger.warn('Unknown webhook type', { type, requestId: req.requestId })
    }
    
    res.json({
      success: true,
      message: 'Webhook processed',
      type,
      requestId: req.requestId
    })
    
  } catch (error) {
    next(error)
  }
})

// Health check for webhook endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'webhook-handler',
    timestamp: new Date().toISOString()
  })
})

export { router as webhookRouter }
