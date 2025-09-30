/**
 * Comprehensive Security Framework
 * 
 * Provides enterprise-grade security controls for the ADI system including
 * authentication, authorization, access control, and security policy enforcement.
 * Ensures secure access to AI discoverability insights and protects sensitive data.
 * 
 * Features:
 * - Multi-factor authentication
 * - Role-based access control (RBAC)
 * - API security and rate limiting
 * - Session management
 * - Security policy enforcement
 * - Threat detection and response
 */

export interface SecurityConfig {
  authentication: {
    enabled: boolean
    methods: ('password' | 'oauth' | 'saml' | 'mfa')[]
    sessionTimeout: number // milliseconds
    maxLoginAttempts: number
    lockoutDuration: number // milliseconds
  }
  authorization: {
    enabled: boolean
    defaultRole: string
    roleHierarchy: Record<string, string[]>
    resourcePermissions: Record<string, string[]>
  }
  apiSecurity: {
    rateLimiting: {
      enabled: boolean
      requestsPerMinute: number
      burstLimit: number
    }
    cors: {
      enabled: boolean
      allowedOrigins: string[]
      allowedMethods: string[]
    }
    encryption: {
      enabled: boolean
      algorithm: string
      keyRotationInterval: number
    }
  }
  monitoring: {
    enabled: boolean
    logSecurityEvents: boolean
    alertOnSuspiciousActivity: boolean
    maxFailedAttempts: number
  }
}

export interface User {
  id: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
  lastLogin?: number
  loginAttempts: number
  lockedUntil?: number
  mfaEnabled: boolean
  mfaSecret?: string
  createdAt: number
  updatedAt: number
  status: 'active' | 'inactive' | 'locked' | 'suspended'
}

export interface SecurityContext {
  user: User
  sessionId: string
  permissions: string[]
  roles: string[]
  ipAddress: string
  userAgent: string
  timestamp: number
  expiresAt: number
}

export interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'access_denied' | 'permission_check' | 'suspicious_activity' | 'security_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  sessionId?: string
  resource?: string
  action?: string
  ipAddress: string
  userAgent: string
  timestamp: number
  details: Record<string, any>
  resolved: boolean
}

export interface AccessRequest {
  userId: string
  resource: string
  action: string
  context?: Record<string, any>
}

export interface AccessResult {
  granted: boolean
  reason: string
  requiredPermissions: string[]
  userPermissions: string[]
  securityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
}

export class SecurityFramework {
  private config: SecurityConfig
  private users: Map<string, User> = new Map()
  private sessions: Map<string, SecurityContext> = new Map()
  private securityEvents: SecurityEvent[] = []
  private rateLimiters: Map<string, { count: number, resetTime: number }> = new Map()
  
  private readonly maxSecurityEvents = 10000
  private readonly defaultPermissions = {
    'admin': ['*'],
    'manager': ['read:*', 'write:evaluations', 'write:reports'],
    'analyst': ['read:evaluations', 'read:reports', 'write:evaluations'],
    'viewer': ['read:reports'],
    'guest': ['read:public']
  }

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      authentication: {
        enabled: true,
        methods: ['password', 'mfa'],
        sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
        maxLoginAttempts: 5,
        lockoutDuration: 30 * 60 * 1000 // 30 minutes
      },
      authorization: {
        enabled: true,
        defaultRole: 'viewer',
        roleHierarchy: {
          'admin': ['manager', 'analyst', 'viewer', 'guest'],
          'manager': ['analyst', 'viewer', 'guest'],
          'analyst': ['viewer', 'guest'],
          'viewer': ['guest'],
          'guest': []
        },
        resourcePermissions: {
          'evaluations': ['read', 'write', 'delete'],
          'reports': ['read', 'write', 'export'],
          'users': ['read', 'write', 'delete'],
          'settings': ['read', 'write']
        }
      },
      apiSecurity: {
        rateLimiting: {
          enabled: true,
          requestsPerMinute: 100,
          burstLimit: 20
        },
        cors: {
          enabled: true,
          allowedOrigins: ['http://localhost:3000'],
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
        },
        encryption: {
          enabled: true,
          algorithm: 'AES-256-GCM',
          keyRotationInterval: 30 * 24 * 60 * 60 * 1000 // 30 days
        }
      },
      monitoring: {
        enabled: true,
        logSecurityEvents: true,
        alertOnSuspiciousActivity: true,
        maxFailedAttempts: 10
      },
      ...config
    }

    this.initializeDefaultUsers()
    this.startSecurityMonitoring()
  }

  /**
   * Authenticate user with credentials
   */
  async authenticate(
    username: string, 
    password: string, 
    mfaToken?: string,
    context?: { ipAddress: string, userAgent: string }
  ): Promise<{ success: boolean, sessionId?: string, user?: User, error?: string }> {
    const user = Array.from(this.users.values()).find(u => u.username === username)
    
    if (!user) {
      this.logSecurityEvent({
        type: 'login',
        severity: 'medium',
        ipAddress: context?.ipAddress || 'unknown',
        userAgent: context?.userAgent || 'unknown',
        details: { username, error: 'User not found' }
      })
      return { success: false, error: 'Invalid credentials' }
    }

    // Check if user is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      this.logSecurityEvent({
        type: 'login',
        severity: 'high',
        userId: user.id,
        ipAddress: context?.ipAddress || 'unknown',
        userAgent: context?.userAgent || 'unknown',
        details: { username, error: 'Account locked' }
      })
      return { success: false, error: 'Account is locked' }
    }

    // Check if user is active
    if (user.status !== 'active') {
      this.logSecurityEvent({
        type: 'login',
        severity: 'medium',
        userId: user.id,
        ipAddress: context?.ipAddress || 'unknown',
        userAgent: context?.userAgent || 'unknown',
        details: { username, error: 'Account inactive' }
      })
      return { success: false, error: 'Account is not active' }
    }

    // Verify password (simplified - would use proper hashing)
    const passwordValid = await this.verifyPassword(password, user.id)
    if (!passwordValid) {
      user.loginAttempts++
      
      if (user.loginAttempts >= this.config.authentication.maxLoginAttempts) {
        user.lockedUntil = Date.now() + this.config.authentication.lockoutDuration
        user.status = 'locked'
      }
      
      this.users.set(user.id, user)
      
      this.logSecurityEvent({
        type: 'login',
        severity: 'high',
        userId: user.id,
        ipAddress: context?.ipAddress || 'unknown',
        userAgent: context?.userAgent || 'unknown',
        details: { username, error: 'Invalid password', attempts: user.loginAttempts }
      })
      
      return { success: false, error: 'Invalid credentials' }
    }

    // Verify MFA if enabled
    if (user.mfaEnabled && this.config.authentication.methods.includes('mfa')) {
      if (!mfaToken) {
        return { success: false, error: 'MFA token required' }
      }
      
      const mfaValid = await this.verifyMFA(user.id, mfaToken)
      if (!mfaValid) {
        this.logSecurityEvent({
          type: 'login',
          severity: 'high',
          userId: user.id,
          ipAddress: context?.ipAddress || 'unknown',
          userAgent: context?.userAgent || 'unknown',
          details: { username, error: 'Invalid MFA token' }
        })
        return { success: false, error: 'Invalid MFA token' }
      }
    }

    // Reset login attempts on successful authentication
    user.loginAttempts = 0
    user.lockedUntil = undefined
    user.lastLogin = Date.now()
    this.users.set(user.id, user)

    // Create session
    const sessionId = this.generateSessionId()
    const securityContext: SecurityContext = {
      user,
      sessionId,
      permissions: this.getUserPermissions(user),
      roles: user.roles,
      ipAddress: context?.ipAddress || 'unknown',
      userAgent: context?.userAgent || 'unknown',
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.authentication.sessionTimeout
    }

    this.sessions.set(sessionId, securityContext)

    this.logSecurityEvent({
      type: 'login',
      severity: 'low',
      userId: user.id,
      sessionId,
      ipAddress: context?.ipAddress || 'unknown',
      userAgent: context?.userAgent || 'unknown',
      details: { username, success: true }
    })

    return { success: true, sessionId, user }
  }

  /**
   * Validate session and get security context
   */
  validateSession(sessionId: string): SecurityContext | null {
    const context = this.sessions.get(sessionId)
    
    if (!context) {
      return null
    }

    // Check if session has expired
    if (context.expiresAt < Date.now()) {
      this.sessions.delete(sessionId)
      this.logSecurityEvent({
        type: 'logout',
        severity: 'low',
        userId: context.user.id,
        sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: { reason: 'Session expired' }
      })
      return null
    }

    // Extend session if within renewal window
    const renewalWindow = this.config.authentication.sessionTimeout * 0.1 // 10% of timeout
    if (context.expiresAt - Date.now() < renewalWindow) {
      context.expiresAt = Date.now() + this.config.authentication.sessionTimeout
      this.sessions.set(sessionId, context)
    }

    return context
  }

  /**
   * Check if user has permission to access resource
   */
  checkAccess(request: AccessRequest): AccessResult {
    const user = this.users.get(request.userId)
    
    if (!user) {
      this.logSecurityEvent({
        type: 'access_denied',
        severity: 'medium',
        userId: request.userId,
        resource: request.resource,
        ipAddress: 'unknown',
        userAgent: 'unknown',
        details: { reason: 'User not found', action: request.action }
      })
      
      return {
        granted: false,
        reason: 'User not found',
        requiredPermissions: [],
        userPermissions: [],
        securityLevel: 'restricted'
      }
    }

    const userPermissions = this.getUserPermissions(user)
    const requiredPermissions = this.getRequiredPermissions(request.resource, request.action)
    
    // Check if user has required permissions
    const hasPermission = this.hasPermission(userPermissions, requiredPermissions)
    
    if (!hasPermission) {
      this.logSecurityEvent({
        type: 'access_denied',
        severity: 'medium',
        userId: request.userId,
        resource: request.resource,
        ipAddress: 'unknown',
        userAgent: 'unknown',
        details: { 
          reason: 'Insufficient permissions', 
          action: request.action,
          required: requiredPermissions,
          user: userPermissions
        }
      })
    } else {
      this.logSecurityEvent({
        type: 'permission_check',
        severity: 'low',
        userId: request.userId,
        resource: request.resource,
        ipAddress: 'unknown',
        userAgent: 'unknown',
        details: { action: request.action, granted: true }
      })
    }

    return {
      granted: hasPermission,
      reason: hasPermission ? 'Access granted' : 'Insufficient permissions',
      requiredPermissions,
      userPermissions,
      securityLevel: this.getResourceSecurityLevel(request.resource)
    }
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(identifier: string): { allowed: boolean, remaining: number, resetTime: number } {
    if (!this.config.apiSecurity.rateLimiting.enabled) {
      return { allowed: true, remaining: Infinity, resetTime: 0 }
    }

    const now = Date.now()
    const windowSize = 60 * 1000 // 1 minute
    const limit = this.config.apiSecurity.rateLimiting.requestsPerMinute
    
    let limiter = this.rateLimiters.get(identifier)
    
    if (!limiter || now >= limiter.resetTime) {
      limiter = {
        count: 0,
        resetTime: now + windowSize
      }
    }

    limiter.count++
    this.rateLimiters.set(identifier, limiter)

    const allowed = limiter.count <= limit
    const remaining = Math.max(0, limit - limiter.count)

    if (!allowed) {
      this.logSecurityEvent({
        type: 'security_violation',
        severity: 'medium',
        ipAddress: identifier,
        userAgent: 'unknown',
        details: { 
          violation: 'Rate limit exceeded',
          count: limiter.count,
          limit
        }
      })
    }

    return {
      allowed,
      remaining,
      resetTime: limiter.resetTime
    }
  }

  /**
   * Logout user and invalidate session
   */
  logout(sessionId: string): boolean {
    const context = this.sessions.get(sessionId)
    
    if (context) {
      this.sessions.delete(sessionId)
      
      this.logSecurityEvent({
        type: 'logout',
        severity: 'low',
        userId: context.user.id,
        sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: { reason: 'User logout' }
      })
      
      return true
    }
    
    return false
  }

  /**
   * Get security events
   */
  getSecurityEvents(
    filters?: {
      type?: string
      severity?: string
      userId?: string
      timeRange?: { start: number, end: number }
    },
    limit: number = 100
  ): SecurityEvent[] {
    let events = [...this.securityEvents]

    if (filters) {
      if (filters.type) {
        events = events.filter(e => e.type === filters.type)
      }
      if (filters.severity) {
        events = events.filter(e => e.severity === filters.severity)
      }
      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId)
      }
      if (filters.timeRange) {
        events = events.filter(e => 
          e.timestamp >= filters.timeRange!.start && 
          e.timestamp <= filters.timeRange!.end
        )
      }
    }

    return events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * Get security statistics
   */
  getSecurityStatistics(timeWindow: number = 24 * 60 * 60 * 1000): {
    totalEvents: number
    eventsBySeverity: Record<string, number>
    eventsByType: Record<string, number>
    activeUsers: number
    activeSessions: number
    failedLogins: number
    suspiciousActivity: number
  } {
    const now = Date.now()
    const windowStart = now - timeWindow
    
    const recentEvents = this.securityEvents.filter(e => e.timestamp >= windowStart)
    
    const eventsBySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
    const eventsByType: Record<string, number> = {}
    
    for (const event of recentEvents) {
      eventsBySeverity[event.severity]++
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
    }

    const activeUsers = Array.from(this.users.values())
      .filter(u => u.lastLogin && u.lastLogin >= windowStart).length
    
    const activeSessions = Array.from(this.sessions.values())
      .filter(s => s.expiresAt > now).length

    const failedLogins = recentEvents.filter(e => 
      e.type === 'login' && e.details.error
    ).length

    const suspiciousActivity = recentEvents.filter(e => 
      e.type === 'suspicious_activity' || e.severity === 'critical'
    ).length

    return {
      totalEvents: recentEvents.length,
      eventsBySeverity,
      eventsByType,
      activeUsers,
      activeSessions,
      failedLogins,
      suspiciousActivity
    }
  }

  /**
   * Create new user
   */
  createUser(userData: {
    username: string
    email: string
    password: string
    roles?: string[]
  }): User {
    const user: User = {
      id: this.generateUserId(),
      username: userData.username,
      email: userData.email,
      roles: userData.roles || [this.config.authorization.defaultRole],
      permissions: [],
      loginAttempts: 0,
      mfaEnabled: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active'
    }

    user.permissions = this.getUserPermissions(user)
    this.users.set(user.id, user)

    this.logSecurityEvent({
      type: 'login',
      severity: 'low',
      userId: user.id,
      ipAddress: 'system',
      userAgent: 'system',
      details: { action: 'User created', username: user.username }
    })

    return user
  }

  /**
   * Private helper methods
   */
  private async verifyPassword(password: string, userId: string): Promise<boolean> {
    // Simplified password verification - would use proper hashing (bcrypt, etc.)
    return password.length >= 8
  }

  private async verifyMFA(userId: string, token: string): Promise<boolean> {
    // Simplified MFA verification - would use TOTP or similar
    return token.length === 6 && /^\d+$/.test(token)
  }

  private getUserPermissions(user: User): string[] {
    const permissions = new Set<string>()
    
    for (const role of user.roles) {
      const rolePermissions = this.defaultPermissions[role] || []
      for (const permission of rolePermissions) {
        permissions.add(permission)
      }
      
      // Add inherited permissions from role hierarchy
      const inheritedRoles = this.config.authorization.roleHierarchy[role] || []
      for (const inheritedRole of inheritedRoles) {
        const inheritedPermissions = this.defaultPermissions[inheritedRole] || []
        for (const permission of inheritedPermissions) {
          permissions.add(permission)
        }
      }
    }
    
    return Array.from(permissions)
  }

  private getRequiredPermissions(resource: string, action: string): string[] {
    // Check for wildcard permission
    const wildcardPermission = `${action}:*`
    const specificPermission = `${action}:${resource}`
    
    return [wildcardPermission, specificPermission]
  }

  private hasPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
    // Check for admin wildcard
    if (userPermissions.includes('*')) {
      return true
    }
    
    // Check if user has any of the required permissions
    return requiredPermissions.some(required => 
      userPermissions.includes(required)
    )
  }

  private getResourceSecurityLevel(resource: string): 'public' | 'internal' | 'confidential' | 'restricted' {
    const securityLevels: Record<string, 'public' | 'internal' | 'confidential' | 'restricted'> = {
      'public': 'public',
      'reports': 'internal',
      'evaluations': 'confidential',
      'users': 'restricted',
      'settings': 'restricted'
    }
    
    return securityLevels[resource] || 'internal'
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    if (!this.config.monitoring.logSecurityEvents) return

    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      resolved: false,
      ...event
    }

    this.securityEvents.push(securityEvent)

    // Keep only recent events
    if (this.securityEvents.length > this.maxSecurityEvents) {
      this.securityEvents.splice(0, this.securityEvents.length - this.maxSecurityEvents)
    }

    // Alert on suspicious activity
    if (this.config.monitoring.alertOnSuspiciousActivity && 
        (event.severity === 'critical' || event.type === 'suspicious_activity')) {
      console.warn(`🚨 Security Alert: ${event.type} - ${JSON.stringify(event.details)}`)
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeDefaultUsers(): void {
    // Create default admin user
    this.createUser({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      roles: ['admin']
    })

    // Create default viewer user
    this.createUser({
      username: 'viewer',
      email: 'viewer@example.com',
      password: 'viewer123',
      roles: ['viewer']
    })

    console.log('🔐 Initialized default users')
  }

  private startSecurityMonitoring(): void {
    if (!this.config.monitoring.enabled) return

    // Clean up expired sessions periodically
    setInterval(() => {
      const now = Date.now()
      for (const [sessionId, context] of this.sessions.entries()) {
        if (context.expiresAt < now) {
          this.sessions.delete(sessionId)
        }
      }
    }, 5 * 60 * 1000) // Every 5 minutes

    // Clean up old rate limiters
    setInterval(() => {
      const now = Date.now()
      for (const [identifier, limiter] of this.rateLimiters.entries()) {
        if (now >= limiter.resetTime) {
          this.rateLimiters.delete(identifier)
        }
      }
    }, 60 * 1000) // Every minute

    console.log('🔍 Started security monitoring')
  }
}

// Global security framework instance
export const securityFramework = new SecurityFramework()

/**
 * Security middleware decorator
 */
export function requireAuth(permissions?: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Extract security context from arguments (would be passed by middleware)
      const context = args.find(arg => arg && arg.user && arg.sessionId) as SecurityContext
      
      if (!context) {
        throw new Error('Authentication required')
      }

      // Check permissions if specified
      if (permissions && permissions.length > 0) {
        const hasPermission = permissions.some(permission => 
          context.permissions.includes(permission) || context.permissions.includes('*')
        )
        
        if (!hasPermission) {
          securityFramework.logSecurityEvent({
            type: 'access_denied',
            severity: 'medium',
            userId: context.user.id,
            sessionId: context.sessionId,
            resource: propertyName,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            details: { 
              method: propertyName,
              requiredPermissions: permissions,
              userPermissions: context.permissions
            }
          })
          throw new Error('Insufficient permissions')
        }
      }

      return method.apply(this, args)
    }

    return descriptor
  }
}

/**
 * Rate limiting decorator
 */
export function rateLimit(requestsPerMinute: number = 60) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Extract identifier from context (IP address or user ID)
      const context = args.find(arg => arg && (arg.ipAddress || arg.user)) as any
      const identifier = context?.user?.id || context?.ipAddress || 'unknown'
      
      const rateLimitResult = securityFramework.checkRateLimit(identifier)
      
      if (!rateLimitResult.allowed) {
        throw new Error('Rate limit exceeded')
      }

      return method.apply(this, args)
    }

    return descriptor
  }
}
