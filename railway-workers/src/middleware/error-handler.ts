import { Request, Response, NextFunction } from 'express'
import { createLogger } from '../utils/logger'
import { BridgeError, AgentExecutionError, AuthenticationError } from '../types'

const logger = createLogger('error-handler')

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.requestId || 'unknown'
  
  logger.error('Request error', {
    requestId,
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.headers['user-agent']
  })

  // Handle specific error types
  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
      requestId
    })
  }

  if (error instanceof BridgeError) {
    return res.status(error.statusCode || 400).json({
      success: false,
      error: 'Bridge communication error',
      message: error.message,
      code: error.code,
      requestId
    })
  }

  if (error instanceof AgentExecutionError) {
    return res.status(500).json({
      success: false,
      error: 'Agent execution failed',
      message: error.message,
      agentName: error.agentName,
      context: error.context,
      requestId
    })
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.message,
      requestId
    })
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON',
      requestId
    })
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
    requestId
  })
}
