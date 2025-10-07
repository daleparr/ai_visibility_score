import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createLogger } from '../utils/logger'
import { AuthenticationError } from '../types'

const logger = createLogger('auth-middleware')

interface JWTPayload {
  evaluationId: string
  allowedAgents: string[]
  callbackUrl: string
  iat: number
  exp: number
  iss: string
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      throw new AuthenticationError('Authorization header missing')
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Invalid authorization format. Expected: Bearer <token>')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AuthenticationError('Token missing from authorization header')
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      logger.error('JWT_SECRET environment variable not set')
      throw new AuthenticationError('Server configuration error')
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    
    // Validate token structure
    if (!decoded.evaluationId || !decoded.allowedAgents || !Array.isArray(decoded.allowedAgents)) {
      throw new AuthenticationError('Invalid token payload')
    }

    // Validate issuer
    if (decoded.iss !== 'netlify-bridge') {
      throw new AuthenticationError('Invalid token issuer')
    }

    // Add user info to request
    req.user = {
      evaluationId: decoded.evaluationId,
      allowedAgents: decoded.allowedAgents
    }

    logger.info('Authentication successful', {
      requestId: req.requestId,
      evaluationId: decoded.evaluationId,
      allowedAgents: decoded.allowedAgents.length
    })

    next()
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('JWT verification failed', {
        requestId: req.requestId,
        error: error.message,
        ip: req.ip
      })
      
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AuthenticationError('Token has expired'))
      }
      
      return next(new AuthenticationError('Invalid token'))
    }

    next(error)
  }
}

// Utility function to generate tokens (for testing)
export function generateBridgeToken(
  evaluationId: string,
  allowedAgents: string[],
  callbackUrl: string,
  expiresIn: string = '1h'
): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable not set')
  }

  const payload = {
    evaluationId,
    allowedAgents,
    callbackUrl,
    iss: 'netlify-bridge'
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: expiresIn,
    algorithm: 'HS256'
  } as jwt.SignOptions)
}
