import { v4 as uuidv4 } from 'uuid'

// Session-based user management for OAuth-free operation
export interface SessionUser {
  id: string
  sessionId: string
  email?: string
  name?: string
  createdAt: Date
  isGuest: boolean
}

// In-memory session store (for demo/testing - would use Redis in production)
const sessionStore = new Map<string, SessionUser>()

export const getOrCreateSessionUser = (sessionId?: string): SessionUser => {
  // If no session ID provided, create a new one
  const finalSessionId = sessionId || uuidv4()

  // Check if session exists
  let user = sessionStore.get(finalSessionId)
  
  if (!user) {
    // Create new guest user session
    user = {
      id: uuidv4(),
      sessionId: finalSessionId,
      name: `Guest User ${finalSessionId.slice(0, 8)}`,
      createdAt: new Date(),
      isGuest: true
    }
    sessionStore.set(finalSessionId, user)
  }

  return user
}

export const updateSessionUser = (sessionId: string, updates: Partial<SessionUser>): SessionUser | null => {
  const user = sessionStore.get(sessionId)
  if (!user) return null

  const updatedUser = { ...user, ...updates }
  sessionStore.set(sessionId, updatedUser)
  return updatedUser
}

export const getSessionUser = (sessionId: string): SessionUser | null => {
  return sessionStore.get(sessionId) || null
}

export const clearSession = (sessionId: string): void => {
  sessionStore.delete(sessionId)
}

// Helper to get session ID from request headers or generate new one
export const getSessionId = (request?: Request): string => {
  if (request) {
    const sessionId = request.headers.get('x-session-id') || 
                     request.headers.get('cookie')?.match(/session-id=([^;]+)/)?.[1]
    if (sessionId) return sessionId
  }
  
  return uuidv4()
}

// Session middleware for API routes
export const withSession = (handler: (req: Request, user: SessionUser) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    const sessionId = getSessionId(req)
    const user = getOrCreateSessionUser(sessionId)
    
    const response = await handler(req, user)
    
    // Add session ID to response headers
    response.headers.set('x-session-id', user.sessionId)
    response.headers.set('set-cookie', `session-id=${user.sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
    
    return response
  }
}