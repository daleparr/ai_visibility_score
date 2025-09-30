/**
 * Threat Detection & Security Monitoring System
 * 
 * Provides real-time threat detection, security monitoring, and incident response
 * for the ADI system. Uses behavioral analysis, anomaly detection, and threat
 * intelligence to identify and respond to security threats.
 * 
 * Features:
 * - Real-time threat detection
 * - Behavioral anomaly analysis
 * - Attack pattern recognition
 * - Automated incident response
 * - Threat intelligence integration
 * - Security event correlation
 */

export interface ThreatSignature {
  id: string
  name: string
  description: string
  category: 'malware' | 'intrusion' | 'data_exfiltration' | 'brute_force' | 'injection' | 'dos' | 'insider_threat'
  severity: 'low' | 'medium' | 'high' | 'critical'
  patterns: ThreatPattern[]
  indicators: string[]
  mitigations: string[]
  lastUpdated: number
}

export interface ThreatPattern {
  type: 'regex' | 'behavioral' | 'statistical' | 'ml_model'
  pattern: string
  threshold?: number
  timeWindow?: number // milliseconds
  confidence: number // 0-1
}

export interface SecurityThreat {
  id: string
  signatureId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-1
  detectedAt: number
  source: {
    ipAddress: string
    userAgent?: string
    userId?: string
    sessionId?: string
  }
  target: {
    resource: string
    action: string
    data?: any
  }
  evidence: ThreatEvidence[]
  status: 'detected' | 'investigating' | 'confirmed' | 'false_positive' | 'mitigated'
  responseActions: ResponseAction[]
  assignedTo?: string
  resolvedAt?: number
  notes: string[]
}

export interface ThreatEvidence {
  type: 'log_entry' | 'network_traffic' | 'file_hash' | 'behavior_pattern' | 'user_action'
  timestamp: number
  data: any
  relevance: number // 0-1
  source: string
}

export interface ResponseAction {
  id: string
  type: 'block_ip' | 'suspend_user' | 'quarantine_data' | 'alert_admin' | 'log_incident' | 'custom'
  description: string
  automated: boolean
  executedAt?: number
  executedBy?: string
  result?: 'success' | 'failed' | 'partial'
  details?: string
}

export interface BehavioralProfile {
  userId: string
  baseline: {
    loginTimes: number[] // Hours of day
    locations: string[] // IP addresses or regions
    resources: string[] // Accessed resources
    actions: string[] // Common actions
    sessionDuration: { avg: number, stdDev: number }
    requestRate: { avg: number, stdDev: number }
  }
  recentActivity: {
    logins: Array<{ timestamp: number, ipAddress: string }>
    actions: Array<{ timestamp: number, resource: string, action: string }>
    anomalies: Array<{ timestamp: number, type: string, score: number }>
  }
  riskScore: number // 0-100
  lastUpdated: number
}

export interface SecurityMetrics {
  timestamp: number
  threatsDetected: number
  threatsBySeverity: Record<string, number>
  threatsByCategory: Record<string, number>
  falsePositiveRate: number
  responseTime: { avg: number, p95: number }
  blockedAttacks: number
  activeThreats: number
  topAttackers: Array<{ ip: string, attempts: number }>
  topTargets: Array<{ resource: string, attempts: number }>
}

export class ThreatDetectionSystem {
  private signatures: Map<string, ThreatSignature> = new Map()
  private threats: Map<string, SecurityThreat> = new Map()
  private behavioralProfiles: Map<string, BehavioralProfile> = new Map()
  private blockedIPs: Set<string> = new Set()
  private suspendedUsers: Set<string> = new Set()
  
  private detectionInterval?: NodeJS.Timeout
  private isMonitoring = false
  
  private readonly maxThreats = 10000
  private readonly maxProfiles = 50000
  private readonly detectionIntervalMs = 5000 // 5 seconds

  constructor() {
    this.initializeThreatSignatures()
    // Initialize threat detection
  }

  /**
   * Start threat detection monitoring
   */
  start(): void {
    if (this.isMonitoring) return

    console.log('🛡️ Starting threat detection system...')
    this.isMonitoring = true
    
    this.detectionInterval = setInterval(() => {
      this.performThreatDetection()
    }, this.detectionIntervalMs)
  }

  /**
   * Stop threat detection monitoring
   */
  stop(): void {
    if (!this.isMonitoring) return

    console.log('🛡️ Stopping threat detection system...')
    this.isMonitoring = false
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = undefined
    }
  }

  /**
   * Analyze security event for threats
   */
  analyzeSecurityEvent(event: {
    type: string
    source: { ipAddress: string, userAgent?: string, userId?: string, sessionId?: string }
    target: { resource: string, action: string, data?: any }
    timestamp: number
    details: any
  }): SecurityThreat[] {
    const detectedThreats: SecurityThreat[] = []

    // Check against all threat signatures
    for (const signature of this.signatures.values()) {
      const threat = this.checkThreatSignature(signature, event)
      if (threat) {
        detectedThreats.push(threat)
      }
    }

    // Behavioral analysis
    if (event.source.userId) {
      const behavioralThreat = this.analyzeBehavioralAnomaly(event)
      if (behavioralThreat) {
        detectedThreats.push(behavioralThreat)
      }
    }

    // Store detected threats
    for (const threat of detectedThreats) {
      this.threats.set(threat.id, threat)
      this.respondToThreat(threat)
    }

    return detectedThreats
  }

  /**
   * Update behavioral profile for user
   */
  updateBehavioralProfile(userId: string, activity: {
    type: 'login' | 'action'
    timestamp: number
    ipAddress?: string
    resource?: string
    action?: string
    sessionDuration?: number
  }): void {
    let profile = this.behavioralProfiles.get(userId)
    
    if (!profile) {
      profile = this.createBehavioralProfile(userId)
      this.behavioralProfiles.set(userId, profile)
    }

    // Update recent activity
    if (activity.type === 'login' && activity.ipAddress) {
      profile.recentActivity.logins.push({
        timestamp: activity.timestamp,
        ipAddress: activity.ipAddress
      })
      
      // Keep only recent logins (last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      profile.recentActivity.logins = profile.recentActivity.logins
        .filter(login => login.timestamp > thirtyDaysAgo)
    }

    if (activity.type === 'action' && activity.resource && activity.action) {
      profile.recentActivity.actions.push({
        timestamp: activity.timestamp,
        resource: activity.resource,
        action: activity.action
      })
      
      // Keep only recent actions (last 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      profile.recentActivity.actions = profile.recentActivity.actions
        .filter(action => action.timestamp > sevenDaysAgo)
    }

    // Update baseline periodically
    if (Date.now() - profile.lastUpdated > 24 * 60 * 60 * 1000) { // Daily
      this.updateBaseline(profile)
    }

    // Calculate risk score
    profile.riskScore = this.calculateRiskScore(profile)
    profile.lastUpdated = Date.now()
  }

  /**
   * Get active threats
   */
  getActiveThreats(): SecurityThreat[] {
    return Array.from(this.threats.values())
      .filter(threat => threat.status === 'detected' || threat.status === 'investigating' || threat.status === 'confirmed')
      .sort((a, b) => {
        // Sort by severity, then by detection time
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
        return severityDiff !== 0 ? severityDiff : b.detectedAt - a.detectedAt
      })
  }

  /**
   * Get threat statistics
   */
  getThreatStatistics(timeWindow: number = 24 * 60 * 60 * 1000): SecurityMetrics {
    const now = Date.now()
    const windowStart = now - timeWindow
    
    const recentThreats = Array.from(this.threats.values())
      .filter(threat => threat.detectedAt >= windowStart)

    const threatsBySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
    const threatsByCategory: Record<string, number> = {}
    const attackerCounts = new Map<string, number>()
    const targetCounts = new Map<string, number>()

    for (const threat of recentThreats) {
      threatsBySeverity[threat.severity]++
      
      const signature = this.signatures.get(threat.signatureId)
      if (signature) {
        threatsByCategory[signature.category] = (threatsByCategory[signature.category] || 0) + 1
      }
      
      // Count attackers
      const attackerKey = threat.source.ipAddress
      attackerCounts.set(attackerKey, (attackerCounts.get(attackerKey) || 0) + 1)
      
      // Count targets
      const targetKey = threat.target.resource
      targetCounts.set(targetKey, (targetCounts.get(targetKey) || 0) + 1)
    }

    // Calculate response times
    const resolvedThreats = recentThreats.filter(t => t.resolvedAt)
    const responseTimes = resolvedThreats.map(t => t.resolvedAt! - t.detectedAt)
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0
    const p95ResponseTime = responseTimes.length > 0 
      ? this.calculatePercentile(responseTimes.sort((a, b) => a - b), 95)
      : 0

    // Calculate false positive rate
    const falsePositives = recentThreats.filter(t => t.status === 'false_positive').length
    const falsePositiveRate = recentThreats.length > 0 
      ? (falsePositives / recentThreats.length) * 100
      : 0

    // Top attackers and targets
    const topAttackers = Array.from(attackerCounts.entries())
      .map(([ip, attempts]) => ({ ip, attempts }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10)

    const topTargets = Array.from(targetCounts.entries())
      .map(([resource, attempts]) => ({ resource, attempts }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10)

    return {
      timestamp: now,
      threatsDetected: recentThreats.length,
      threatsBySeverity,
      threatsByCategory,
      falsePositiveRate,
      responseTime: { avg: avgResponseTime, p95: p95ResponseTime },
      blockedAttacks: this.blockedIPs.size,
      activeThreats: this.getActiveThreats().length,
      topAttackers,
      topTargets
    }
  }

  /**
   * Block IP address
   */
  blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress)
    console.log(`🚫 Blocked IP address: ${ipAddress} (${reason})`)
  }

  /**
   * Suspend user account
   */
  suspendUser(userId: string, reason: string): void {
    this.suspendedUsers.add(userId)
    console.log(`⛔ Suspended user: ${userId} (${reason})`)
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress)
  }

  /**
   * Check if user is suspended
   */
  isUserSuspended(userId: string): boolean {
    return this.suspendedUsers.has(userId)
  }

  /**
   * Private helper methods
   */
  private checkThreatSignature(signature: ThreatSignature, event: any): SecurityThreat | null {
    let matchCount = 0
    let totalConfidence = 0
    const evidence: ThreatEvidence[] = []

    for (const pattern of signature.patterns) {
      const match = this.checkPattern(pattern, event)
      if (match.matched) {
        matchCount++
        totalConfidence += match.confidence
        evidence.push({
          type: 'behavior_pattern',
          timestamp: event.timestamp,
          data: { pattern: pattern.pattern, match: match.details },
          relevance: match.confidence,
          source: 'threat_signature'
        })
      }
    }

    // Require at least one pattern match
    if (matchCount === 0) return null

    const confidence = totalConfidence / signature.patterns.length
    
    // Apply confidence threshold
    if (confidence < 0.5) return null

    return {
      id: this.generateThreatId(),
      signatureId: signature.id,
      severity: signature.severity,
      confidence,
      detectedAt: event.timestamp,
      source: event.source,
      target: event.target,
      evidence,
      status: 'detected',
      responseActions: [],
      notes: []
    }
  }

  private checkPattern(pattern: ThreatPattern, event: any): { matched: boolean, confidence: number, details?: any } {
    switch (pattern.type) {
      case 'regex':
        return this.checkRegexPattern(pattern, event)
      case 'behavioral':
        return this.checkBehavioralPattern(pattern, event)
      case 'statistical':
        return this.checkStatisticalPattern(pattern, event)
      default:
        return { matched: false, confidence: 0 }
    }
  }

  private checkRegexPattern(pattern: ThreatPattern, event: any): { matched: boolean, confidence: number, details?: any } {
    try {
      const regex = new RegExp(pattern.pattern, 'i')
      const eventString = JSON.stringify(event)
      const match = regex.test(eventString)
      
      return {
        matched: match,
        confidence: match ? pattern.confidence : 0,
        details: match ? { pattern: pattern.pattern, matched: eventString } : undefined
      }
    } catch (error) {
      return { matched: false, confidence: 0 }
    }
  }

  private checkBehavioralPattern(pattern: ThreatPattern, event: any): { matched: boolean, confidence: number, details?: any } {
    // Simplified behavioral pattern checking
    const behaviorChecks = {
      'rapid_requests': () => this.checkRapidRequests(event),
      'unusual_time': () => this.checkUnusualTime(event),
      'new_location': () => this.checkNewLocation(event),
      'privilege_escalation': () => this.checkPrivilegeEscalation(event)
    }

    const check = behaviorChecks[pattern.pattern as keyof typeof behaviorChecks]
    if (check) {
      const result = check()
      return {
        matched: result.anomalous,
        confidence: result.anomalous ? pattern.confidence : 0,
        details: result.details
      }
    }

    return { matched: false, confidence: 0 }
  }

  private checkStatisticalPattern(pattern: ThreatPattern, event: any): { matched: boolean, confidence: number, details?: any } {
    // Simplified statistical anomaly detection
    if (pattern.threshold && event.details?.value !== undefined) {
      const value = parseFloat(event.details.value)
      const threshold = pattern.threshold
      
      const anomalous = value > threshold
      return {
        matched: anomalous,
        confidence: anomalous ? pattern.confidence : 0,
        details: { value, threshold, exceeded: anomalous }
      }
    }

    return { matched: false, confidence: 0 }
  }

  private analyzeBehavioralAnomaly(event: any): SecurityThreat | null {
    const userId = event.source.userId
    if (!userId) return null

    const profile = this.behavioralProfiles.get(userId)
    if (!profile) return null

    const anomalies = this.detectBehavioralAnomalies(profile, event)
    
    if (anomalies.length === 0) return null

    // Calculate overall anomaly score
    const anomalyScore = anomalies.reduce((sum, anomaly) => sum + anomaly.score, 0) / anomalies.length

    if (anomalyScore < 0.7) return null // Threshold for threat detection

    return {
      id: this.generateThreatId(),
      signatureId: 'behavioral_anomaly',
      severity: anomalyScore > 0.9 ? 'high' : 'medium',
      confidence: anomalyScore,
      detectedAt: event.timestamp,
      source: event.source,
      target: event.target,
      evidence: [{
        type: 'behavior_pattern',
        timestamp: event.timestamp,
        data: { anomalies, profile: profile.baseline },
        relevance: anomalyScore,
        source: 'behavioral_analysis'
      }],
      status: 'detected',
      responseActions: [],
      notes: [`Behavioral anomalies detected: ${anomalies.map(a => a.type).join(', ')}`]
    }
  }

  private detectBehavioralAnomalies(profile: BehavioralProfile, event: any): Array<{ type: string, score: number, details: any }> {
    const anomalies: Array<{ type: string, score: number, details: any }> = []

    // Check login time anomaly
    if (event.type === 'login') {
      const hour = new Date(event.timestamp).getHours()
      const normalHours = profile.baseline.loginTimes
      
      if (normalHours.length > 0 && !normalHours.includes(hour)) {
        const minDistance = Math.min(...normalHours.map(h => Math.abs(h - hour)))
        const score = Math.min(1, minDistance / 12) // Normalize to 0-1
        
        if (score > 0.5) {
          anomalies.push({
            type: 'unusual_login_time',
            score,
            details: { hour, normalHours, distance: minDistance }
          })
        }
      }
    }

    // Check location anomaly
    if (event.source.ipAddress) {
      const normalLocations = profile.baseline.locations
      
      if (normalLocations.length > 0 && !normalLocations.includes(event.source.ipAddress)) {
        anomalies.push({
          type: 'new_location',
          score: 0.8,
          details: { ipAddress: event.source.ipAddress, normalLocations }
        })
      }
    }

    // Check resource access anomaly
    if (event.target.resource) {
      const normalResources = profile.baseline.resources
      
      if (normalResources.length > 0 && !normalResources.includes(event.target.resource)) {
        anomalies.push({
          type: 'unusual_resource_access',
          score: 0.6,
          details: { resource: event.target.resource, normalResources }
        })
      }
    }

    return anomalies
  }

  private respondToThreat(threat: SecurityThreat): void {
    const signature = this.signatures.get(threat.signatureId)
    if (!signature) return

    // Determine response actions based on threat severity and type
    const actions: ResponseAction[] = []

    if (threat.severity === 'critical' || threat.severity === 'high') {
      // Block IP for high-severity threats
      actions.push({
        id: this.generateActionId(),
        type: 'block_ip',
        description: `Block IP ${threat.source.ipAddress} due to ${threat.severity} threat`,
        automated: true
      })

      // Alert administrators
      actions.push({
        id: this.generateActionId(),
        type: 'alert_admin',
        description: `Alert administrators about ${threat.severity} threat`,
        automated: true
      })
    }

    if (threat.source.userId && threat.confidence > 0.8) {
      // Suspend user for high-confidence threats
      actions.push({
        id: this.generateActionId(),
        type: 'suspend_user',
        description: `Suspend user ${threat.source.userId} due to suspicious activity`,
        automated: false // Require manual approval
      })
    }

    // Always log the incident
    actions.push({
      id: this.generateActionId(),
      type: 'log_incident',
      description: `Log security incident for threat ${threat.id}`,
      automated: true
    })

    threat.responseActions = actions

    // Execute automated actions
    for (const action of actions.filter(a => a.automated)) {
      this.executeResponseAction(action, threat)
    }
  }

  private executeResponseAction(action: ResponseAction, threat: SecurityThreat): void {
    action.executedAt = Date.now()
    action.executedBy = 'system'

    try {
      switch (action.type) {
        case 'block_ip':
          this.blockIP(threat.source.ipAddress, `Threat ${threat.id}`)
          action.result = 'success'
          break

        case 'suspend_user':
          if (threat.source.userId) {
            this.suspendUser(threat.source.userId, `Threat ${threat.id}`)
            action.result = 'success'
          }
          break

        case 'alert_admin':
          console.warn(`🚨 SECURITY ALERT: ${threat.severity} threat detected - ${threat.id}`)
          action.result = 'success'
          break

        case 'log_incident':
          console.log(`📝 Security incident logged: ${threat.id}`)
          action.result = 'success'
          break

        default:
          action.result = 'failed'
          action.details = 'Unknown action type'
      }
    } catch (error) {
      action.result = 'failed'
      action.details = `Execution failed: ${error}`
    }
  }

  private createBehavioralProfile(userId: string): BehavioralProfile {
    return {
      userId,
      baseline: {
        loginTimes: [],
        locations: [],
        resources: [],
        actions: [],
        sessionDuration: { avg: 0, stdDev: 0 },
        requestRate: { avg: 0, stdDev: 0 }
      },
      recentActivity: {
        logins: [],
        actions: [],
        anomalies: []
      },
      riskScore: 0,
      lastUpdated: Date.now()
    }
  }

  private updateBaseline(profile: BehavioralProfile): void {
    // Update login times baseline
    const loginHours = profile.recentActivity.logins.map(login => 
      new Date(login.timestamp).getHours()
    )
    profile.baseline.loginTimes = [...new Set(loginHours)]

    // Update locations baseline
    const locations = profile.recentActivity.logins.map(login => login.ipAddress)
    profile.baseline.locations = [...new Set(locations)]

    // Update resources baseline
    const resources = profile.recentActivity.actions.map(action => action.resource)
    profile.baseline.resources = [...new Set(resources)]

    // Update actions baseline
    const actions = profile.recentActivity.actions.map(action => action.action)
    profile.baseline.actions = [...new Set(actions)]
  }

  private calculateRiskScore(profile: BehavioralProfile): number {
    let riskScore = 0

    // Recent anomalies increase risk
    const recentAnomalies = profile.recentActivity.anomalies.filter(
      anomaly => Date.now() - anomaly.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    )
    riskScore += recentAnomalies.length * 10

    // Unusual activity patterns
    if (profile.recentActivity.logins.length > profile.baseline.loginTimes.length * 2) {
      riskScore += 20 // Excessive login attempts
    }

    // New locations
    const newLocations = profile.recentActivity.logins
      .filter(login => !profile.baseline.locations.includes(login.ipAddress))
    riskScore += newLocations.length * 15

    return Math.min(100, riskScore)
  }

  private checkRapidRequests(event: any): { anomalous: boolean, details: any } {
    // Simplified rapid request detection
    const threshold = 10 // requests per minute
    const timeWindow = 60 * 1000 // 1 minute
    
    // This would check actual request rates in a real implementation
    return { anomalous: false, details: { threshold, timeWindow } }
  }

  private checkUnusualTime(event: any): { anomalous: boolean, details: any } {
    const hour = new Date(event.timestamp).getHours()
    const unusualHours = [0, 1, 2, 3, 4, 5] // Late night/early morning
    
    return {
      anomalous: unusualHours.includes(hour),
      details: { hour, unusualHours }
    }
  }

  private checkNewLocation(event: any): { anomalous: boolean, details: any } {
    // This would check against known good locations
    return { anomalous: false, details: { ipAddress: event.source.ipAddress } }
  }

  private checkPrivilegeEscalation(event: any): { anomalous: boolean, details: any } {
    // Check for privilege escalation attempts
    const escalationKeywords = ['admin', 'root', 'sudo', 'elevate']
    const eventString = JSON.stringify(event).toLowerCase()
    
    const hasEscalationKeywords = escalationKeywords.some(keyword => 
      eventString.includes(keyword)
    )
    
    return {
      anomalous: hasEscalationKeywords,
      details: { keywords: escalationKeywords, detected: hasEscalationKeywords }
    }
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1]
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
  }

  private performThreatDetection(): void {
    // This would be called periodically to perform active threat detection
    // For now, just clean up old data
    this.cleanupOldData()
  }

  private cleanupOldData(): void {
    const now = Date.now()
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

    // Clean up old threats
    if (this.threats.size > this.maxThreats) {
      const sortedThreats = Array.from(this.threats.entries())
        .sort(([, a], [, b]) => a.detectedAt - b.detectedAt)
      
      const toDelete = sortedThreats.slice(0, sortedThreats.length - this.maxThreats)
      for (const [id] of toDelete) {
        this.threats.delete(id)
      }
    }

    // Clean up old behavioral profiles
    if (this.behavioralProfiles.size > this.maxProfiles) {
      const sortedProfiles = Array.from(this.behavioralProfiles.entries())
        .sort(([, a], [, b]) => a.lastUpdated - b.lastUpdated)
      
      const toDelete = sortedProfiles.slice(0, sortedProfiles.length - this.maxProfiles)
      for (const [id] of toDelete) {
        this.behavioralProfiles.delete(id)
      }
    }
  }

  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeThreatSignatures(): void {
    const signatures: ThreatSignature[] = [
      {
        id: 'brute_force_login',
        name: 'Brute Force Login Attack',
        description: 'Multiple failed login attempts from same source',
        category: 'brute_force',
        severity: 'high',
        patterns: [
          {
            type: 'behavioral',
            pattern: 'rapid_requests',
            threshold: 5,
            timeWindow: 60000, // 1 minute
            confidence: 0.8
          }
        ],
        indicators: ['Multiple failed logins', 'Same IP address', 'Short time window'],
        mitigations: ['Block IP address', 'Implement CAPTCHA', 'Account lockout'],
        lastUpdated: Date.now()
      },
      {
        id: 'sql_injection',
        name: 'SQL Injection Attack',
        description: 'Attempt to inject SQL code into application',
        category: 'injection',
        severity: 'critical',
        patterns: [
          {
            type: 'regex',
            pattern: '(union|select|insert|update|delete|drop|create|alter)\\s+',
            confidence: 0.9
          }
        ],
        indicators: ['SQL keywords in input', 'Special characters', 'Database errors'],
        mitigations: ['Input validation', 'Parameterized queries', 'WAF rules'],
        lastUpdated: Date.now()
      },
      {
        id: 'unusual_data_access',
        name: 'Unusual Data Access Pattern',
        description: 'Access to sensitive data outside normal patterns',
        category: 'data_exfiltration',
        severity: 'medium',
        patterns: [
          {
            type: 'behavioral',
            pattern: 'unusual_time',
            confidence: 0.7
          },
          {
            type: 'behavioral',
            pattern: 'new_location',
            confidence: 0.8
          }
        ],
        indicators: ['Off-hours access', 'New location', 'Large data volumes'],
        mitigations: ['Access controls', 'Data loss prevention', 'Monitoring'],
        lastUpdated: Date.now()
      }
    ]

    for (const signature of signatures) {
      this.signatures.set(signature.id, signature)
    }

    console.log('🛡️ Initialized threat signatures')
  }
}

// Global threat detection system instance
export const threatDetection = new ThreatDetectionSystem()

/**
 * Threat monitoring decorator
 */
export function monitorThreats(options?: { sensitivity?: 'low' | 'medium' | 'high' }) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const sensitivity = options?.sensitivity || 'medium'

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      
      try {
        const result = await method.apply(this, args)
        
        // Analyze the method execution for threats
        const context = args.find(arg => arg && (arg.user || arg.ipAddress)) as any
        if (context) {
          const event = {
            type: 'method_execution',
            source: {
              ipAddress: context.ipAddress || 'unknown',
              userAgent: context.userAgent,
              userId: context.user?.id,
              sessionId: context.sessionId
            },
            target: {
              resource: propertyName,
              action: 'execute',
              data: result
            },
            timestamp: Date.now(),
            details: {
              executionTime: Date.now() - startTime,
              success: true,
              sensitivity
            }
          }
          
          threatDetection.analyzeSecurityEvent(event)
          
          // Update behavioral profile if user context available
          if (context.user?.id) {
            threatDetection.updateBehavioralProfile(context.user.id, {
              type: 'action',
              timestamp: Date.now(),
              resource: propertyName,
              action: 'execute'
            })
          }
        }
        
        return result
      } catch (error) {
        // Analyze failed executions for potential attacks
        const context = args.find(arg => arg && (arg.user || arg.ipAddress)) as any
        if (context) {
          const event = {
            type: 'method_execution_failed',
            source: {
              ipAddress: context.ipAddress || 'unknown',
              userAgent: context.userAgent,
              userId: context.user?.id,
              sessionId: context.sessionId
            },
            target: {
              resource: propertyName,
              action: 'execute',
              data: null
            },
            timestamp: Date.now(),
            details: {
              executionTime: Date.now() - startTime,
              success: false,
              error: String(error),
              sensitivity
            }
          }
          
          threatDetection.analyzeSecurityEvent(event)
        }
        
        throw error
      }
    }

    return descriptor
  }
}
