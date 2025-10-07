import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createLogger } from './utils/logger'
import { healthRouter } from './routes/health'
import { queueRouter } from './routes/queue'
import { webhookRouter } from './routes/webhook'
import { setupQueue } from './queue/setup'
import { errorHandler } from './middleware/error-handler'
import { authMiddleware } from './middleware/auth'

// Load environment variables
dotenv.config()

const app = express()
const logger = createLogger('app')

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://ai-visibility-score.netlify.app',
  'http://localhost:3000'
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  req.requestId = requestId as string
  
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  })
  
  next()
})

// Health check route (no auth required)
app.use('/health', healthRouter)

// Protected routes
app.use('/queue', authMiddleware, queueRouter)
app.use('/webhook', webhookRouter) // Webhook has its own auth

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AIDI Railway Workers',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Initialize queue system
async function initializeServices() {
  try {
    logger.info('Initializing services...')
    
    // Setup queue processing
    await setupQueue()
    logger.info('Queue system initialized')
    
    logger.info('All services initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize services', { error: error.message })
    process.exit(1)
  }
}

// Start server
const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    await initializeServices()
    
    app.listen(PORT, () => {
      logger.info(`🚀 Railway worker server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version
      })
    })
  } catch (error) {
    logger.error('Failed to start server', { error: error.message })
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise })
  process.exit(1)
})

// Start the application
startServer()

export default app
