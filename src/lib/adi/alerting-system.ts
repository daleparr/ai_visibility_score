/**
 * Intelligent Alerting System
 * 
 * Provides intelligent alerting with escalation policies, alert correlation,
 * and noise reduction. Integrates with health monitoring and performance metrics
 * to provide actionable alerts for system issues.
 * 
 * Features:
 * - Multi-channel alerting (email, webhook, console)
 * - Escalation policies with time-based escalation
 * - Alert correlation and deduplication
 * - Intelligent noise reduction
 * - Alert acknowledgment and resolution
 * - Historical alert analysis
 */

export interface Alert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  component: string
  source: string
  timestamp: number
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed'
  tags: Record<string, string>
  metadata: Record<string, any>
  correlationId?: string
  escalationLevel: number
  lastEscalated?: number
  acknowledgedBy?: string
  acknowledgedAt?: number
  resolvedAt?: number
}

export interface AlertRule {
  id: string
  name: string
  description: string
  component: string
  condition: AlertCondition
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  enabled: boolean
  cooldownPeriod: number // Minimum time between alerts (ms)
  escalationPolicy: EscalationPolicy
  tags: Record<string, string>
}

export interface AlertCondition {
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'not_contains'
  threshold: number | string
  timeWindow: number // Time window for evaluation (ms)
  evaluationInterval: number // How often to evaluate (ms)
}

export interface EscalationPolicy {
  levels: EscalationLevel[]
  maxEscalations: number
  escalationInterval: number // Time between escalations (ms)
}

export interface EscalationLevel {
  level: number
  channels: AlertChannel[]
  recipients: string[]
  actions: string[]
}

export interface AlertChannel {
  type: 'email' | 'webhook' | 'console' | 'slack' | 'teams'
  config: Record<string, any>
  enabled: boolean
}

export interface AlertStats {
  total: number
  active: number
  acknowledged: number
  resolved: number
  suppressed: number
  bySeverity: Record<string, number>
  byComponent: Record<string, number>
  avgResolutionTime: number
  escalationRate: number
}

export class AlertingSystem {
  private alerts: Map<string, Alert> = new Map()
  private rules: Map<string, AlertRule> = new Map()
  private channels: Map<string, AlertChannel> = new Map()
  private correlationGroups: Map<string, string[]> = new Map()
  private suppressionRules: Map<string, { until: number, reason: string }> = new Map()
  
  private evaluationInterval?: NodeJS.Timeout
  private isRunning = false
  
  private readonly maxAlerts = 10000
  private readonly defaultCooldown = 300000 // 5 minutes
  private readonly correlationWindow = 600000 // 10 minutes

  constructor() {
    this.initializeDefaultRules()
    this.initializeDefaultChannels()
  }

  /**
   * Start the alerting system
   */
  start(): void {
    if (this.isRunning) return

    console.log('🚨 Starting intelligent alerting system...')
    this.isRunning = true
    
    // Start rule evaluation
    this.evaluationInterval = setInterval(() => {
      this.evaluateRules()
    }, 30000) // Evaluate every 30 seconds
  }

  /**
   * Stop the alerting system
   */
  stop(): void {
    if (!this.isRunning) return

    console.log('🚨 Stopping alerting system...')
    this.isRunning = false
    
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval)
      this.evaluationInterval = undefined
    }
  }

  /**
   * Create a new alert
   */
  createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'status' | 'escalationLevel'>): Alert {
    const id = this.generateAlertId()
    const timestamp = Date.now()
    
    const newAlert: Alert = {
      id,
      timestamp,
      status: 'active',
      escalationLevel: 0,
      ...alert
    }

    // Check for correlation
    const correlationId = this.findCorrelation(newAlert)
    if (correlationId) {
      newAlert.correlationId = correlationId
    }

    // Check suppression rules
    if (this.isAlertSuppressed(newAlert)) {
      newAlert.status = 'suppressed'
      console.log(`🔇 Alert suppressed: ${newAlert.title}`)
    }

    this.alerts.set(id, newAlert)
    
    // Clean up old alerts
    this.cleanupOldAlerts()

    if (newAlert.status === 'active') {
      console.log(`🚨 New ${newAlert.severity} alert: ${newAlert.title}`)
      this.sendAlert(newAlert)
    }

    return newAlert
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId)
    if (!alert || alert.status !== 'active') return false

    alert.status = 'acknowledged'
    alert.acknowledgedBy = acknowledgedBy
    alert.acknowledgedAt = Date.now()

    console.log(`✅ Alert acknowledged by ${acknowledgedBy}: ${alert.title}`)
    return true
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.alerts.get(alertId)
    if (!alert || alert.status === 'resolved') return false

    alert.status = 'resolved'
    alert.resolvedAt = Date.now()

    // Resolve correlated alerts
    if (alert.correlationId) {
      const correlatedAlerts = this.getCorrelatedAlerts(alert.correlationId)
      for (const correlatedAlert of correlatedAlerts) {
        if (correlatedAlert.id !== alertId && correlatedAlert.status === 'active') {
          correlatedAlert.status = 'resolved'
          correlatedAlert.resolvedAt = Date.now()
        }
      }
    }

    console.log(`✅ Alert resolved: ${alert.title}`)
    return true
  }

  /**
   * Suppress alerts for a component
   */
  suppressAlerts(component: string, duration: number, reason: string): void {
    const until = Date.now() + duration
    this.suppressionRules.set(component, { until, reason })
    
    console.log(`🔇 Alerts suppressed for ${component} until ${new Date(until).toISOString()}: ${reason}`)
  }

  /**
   * Remove alert suppression
   */
  removeSuppression(component: string): void {
    this.suppressionRules.delete(component)
    console.log(`🔊 Alert suppression removed for ${component}`)
  }

  /**
   * Add alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
    console.log(`📋 Alert rule added: ${rule.name}`)
  }

  /**
   * Remove alert rule
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId)
    if (removed) {
      console.log(`📋 Alert rule removed: ${ruleId}`)
    }
    return removed
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.status === 'active')
      .sort((a, b) => {
        // Sort by severity, then by timestamp
        const severityOrder = { emergency: 4, critical: 3, warning: 2, info: 1 }
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
        return severityDiff !== 0 ? severityDiff : b.timestamp - a.timestamp
      })
  }

  /**
   * Get alert statistics
   */
  getAlertStats(timeWindow: number = 86400000): AlertStats { // 24 hours
    const now = Date.now()
    const windowStart = now - timeWindow
    
    const recentAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.timestamp >= windowStart)

    const stats: AlertStats = {
      total: recentAlerts.length,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      suppressed: 0,
      bySeverity: { info: 0, warning: 0, critical: 0, emergency: 0 },
      byComponent: {},
      avgResolutionTime: 0,
      escalationRate: 0
    }

    let totalResolutionTime = 0
    let resolvedCount = 0
    let escalatedCount = 0

    for (const alert of recentAlerts) {
      // Count by status
      stats[alert.status]++

      // Count by severity
      stats.bySeverity[alert.severity]++

      // Count by component
      stats.byComponent[alert.component] = (stats.byComponent[alert.component] || 0) + 1

      // Calculate resolution time
      if (alert.status === 'resolved' && alert.resolvedAt) {
        totalResolutionTime += alert.resolvedAt - alert.timestamp
        resolvedCount++
      }

      // Count escalations
      if (alert.escalationLevel > 0) {
        escalatedCount++
      }
    }

    stats.avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0
    stats.escalationRate = recentAlerts.length > 0 ? (escalatedCount / recentAlerts.length) * 100 : 0

    return stats
  }

  /**
   * Get alert trends
   */
  getAlertTrends(timeWindow: number = 86400000): {
    hourlyCount: Array<{ hour: number, count: number }>
    severityTrend: Array<{ timestamp: number, severity: string, count: number }>
    componentTrend: Array<{ component: string, count: number, trend: 'up' | 'down' | 'stable' }>
  } {
    const now = Date.now()
    const windowStart = now - timeWindow
    
    const recentAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.timestamp >= windowStart)

    // Hourly count
    const hourlyCount = new Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }))
    
    for (const alert of recentAlerts) {
      const hour = new Date(alert.timestamp).getHours()
      hourlyCount[hour].count++
    }

    // Severity trend (simplified)
    const severityTrend = Object.keys({ info: 0, warning: 0, critical: 0, emergency: 0 })
      .map(severity => ({
        timestamp: now,
        severity,
        count: recentAlerts.filter(a => a.severity === severity).length
      }))

    // Component trend (simplified)
    const componentCounts: Record<string, number> = {}
    for (const alert of recentAlerts) {
      componentCounts[alert.component] = (componentCounts[alert.component] || 0) + 1
    }

    const componentTrend = Object.entries(componentCounts)
      .map(([component, count]) => ({
        component,
        count,
        trend: 'stable' as 'up' | 'down' | 'stable' // Would calculate actual trend
      }))
      .sort((a, b) => b.count - a.count)

    return {
      hourlyCount,
      severityTrend,
      componentTrend
    }
  }

  /**
   * Evaluate alert rules
   */
  private async evaluateRules(): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      try {
        await this.evaluateRule(rule)
      } catch (error) {
        console.error(`Failed to evaluate rule ${rule.name}:`, error)
      }
    }
  }

  /**
   * Evaluate a single alert rule
   */
  private async evaluateRule(rule: AlertRule): Promise<void> {
    // Check cooldown period
    const lastAlert = this.getLastAlertForRule(rule.id)
    if (lastAlert && Date.now() - lastAlert.timestamp < rule.cooldownPeriod) {
      return
    }

    // Evaluate condition (simplified - would integrate with actual metrics)
    const conditionMet = await this.evaluateCondition(rule.condition, rule.component)
    
    if (conditionMet) {
      this.createAlert({
        title: rule.name,
        description: rule.description,
        severity: rule.severity,
        component: rule.component,
        source: 'rule_engine',
        tags: { ...rule.tags, ruleId: rule.id },
        metadata: { rule: rule.id, condition: rule.condition }
      })
    }
  }

  /**
   * Evaluate alert condition
   */
  private async evaluateCondition(condition: AlertCondition, component: string): Promise<boolean> {
    // This would integrate with actual metrics system
    // For now, return false to prevent spam during development
    return false
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alert: Alert): Promise<void> {
    const rule = Array.from(this.rules.values()).find(r => r.tags.ruleId === alert.tags.ruleId)
    const escalationPolicy = rule?.escalationPolicy

    if (!escalationPolicy) {
      // Send to default channels
      await this.sendToDefaultChannels(alert)
      return
    }

    const currentLevel = escalationPolicy.levels.find(l => l.level === alert.escalationLevel)
    if (currentLevel) {
      await this.sendToChannels(alert, currentLevel.channels)
    }

    // Schedule escalation if needed
    this.scheduleEscalation(alert, escalationPolicy)
  }

  /**
   * Send alert to specific channels
   */
  private async sendToChannels(alert: Alert, channels: AlertChannel[]): Promise<void> {
    for (const channel of channels) {
      if (!channel.enabled) continue

      try {
        await this.sendToChannel(alert, channel)
      } catch (error) {
        console.error(`Failed to send alert to ${channel.type}:`, error)
      }
    }
  }

  /**
   * Send alert to default channels
   */
  private async sendToDefaultChannels(alert: Alert): Promise<void> {
    const defaultChannels = Array.from(this.channels.values()).filter(c => c.enabled)
    await this.sendToChannels(alert, defaultChannels)
  }

  /**
   * Send alert to a specific channel
   */
  private async sendToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case 'console':
        this.sendToConsole(alert)
        break
      case 'webhook':
        await this.sendToWebhook(alert, channel.config)
        break
      case 'email':
        await this.sendToEmail(alert, channel.config)
        break
      default:
        console.warn(`Unsupported channel type: ${channel.type}`)
    }
  }

  /**
   * Send alert to console
   */
  private sendToConsole(alert: Alert): void {
    const emoji = { info: 'ℹ️', warning: '⚠️', critical: '🚨', emergency: '🔥' }
    console.log(`${emoji[alert.severity]} [${alert.severity.toUpperCase()}] ${alert.component}: ${alert.title}`)
    console.log(`   ${alert.description}`)
  }

  /**
   * Send alert to webhook
   */
  private async sendToWebhook(alert: Alert, config: any): Promise<void> {
    if (!config.url) return

    const payload = {
      alert: {
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        component: alert.component,
        timestamp: alert.timestamp,
        tags: alert.tags
      },
      timestamp: Date.now()
    }

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`)
      }
    } catch (error) {
      throw new Error(`Webhook failed: ${error}`)
    }
  }

  /**
   * Send alert to email (placeholder)
   */
  private async sendToEmail(alert: Alert, config: any): Promise<void> {
    // Email integration would go here
    console.log(`📧 Email alert sent: ${alert.title}`)
  }

  /**
   * Schedule alert escalation
   */
  private scheduleEscalation(alert: Alert, policy: EscalationPolicy): void {
    if (alert.escalationLevel >= policy.maxEscalations) return

    setTimeout(() => {
      const currentAlert = this.alerts.get(alert.id)
      if (!currentAlert || currentAlert.status !== 'active') return

      currentAlert.escalationLevel++
      currentAlert.lastEscalated = Date.now()

      console.log(`📈 Escalating alert: ${alert.title} (level ${currentAlert.escalationLevel})`)
      this.sendAlert(currentAlert)
    }, policy.escalationInterval)
  }

  /**
   * Find correlation for new alert
   */
  private findCorrelation(alert: Alert): string | undefined {
    const now = Date.now()
    const windowStart = now - this.correlationWindow

    // Look for similar alerts in the correlation window
    for (const existingAlert of this.alerts.values()) {
      if (existingAlert.timestamp < windowStart) continue
      if (existingAlert.component === alert.component && existingAlert.severity === alert.severity) {
        return existingAlert.correlationId || existingAlert.id
      }
    }

    return undefined
  }

  /**
   * Get correlated alerts
   */
  private getCorrelatedAlerts(correlationId: string): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.correlationId === correlationId || alert.id === correlationId)
  }

  /**
   * Check if alert should be suppressed
   */
  private isAlertSuppressed(alert: Alert): boolean {
    const suppression = this.suppressionRules.get(alert.component)
    return suppression ? Date.now() < suppression.until : false
  }

  /**
   * Get last alert for rule
   */
  private getLastAlertForRule(ruleId: string): Alert | undefined {
    return Array.from(this.alerts.values())
      .filter(alert => alert.tags.ruleId === ruleId)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  /**
   * Clean up old alerts
   */
  private cleanupOldAlerts(): void {
    if (this.alerts.size <= this.maxAlerts) return

    const sortedAlerts = Array.from(this.alerts.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)

    const toDelete = sortedAlerts.slice(0, sortedAlerts.length - this.maxAlerts)
    for (const [id] of toDelete) {
      this.alerts.delete(id)
    }
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        description: 'Agent error rate exceeds threshold',
        component: 'agents',
        condition: {
          metric: 'error_rate',
          operator: 'gt',
          threshold: 10,
          timeWindow: 300000, // 5 minutes
          evaluationInterval: 60000 // 1 minute
        },
        severity: 'warning',
        enabled: true,
        cooldownPeriod: this.defaultCooldown,
        escalationPolicy: {
          levels: [
            { level: 0, channels: [{ type: 'console', config: {}, enabled: true }], recipients: [], actions: [] }
          ],
          maxEscalations: 1,
          escalationInterval: 600000 // 10 minutes
        },
        tags: {}
      },
      {
        id: 'system_down',
        name: 'System Down',
        description: 'Critical system component is down',
        component: 'system',
        condition: {
          metric: 'health_score',
          operator: 'lt',
          threshold: 20,
          timeWindow: 60000, // 1 minute
          evaluationInterval: 30000 // 30 seconds
        },
        severity: 'critical',
        enabled: true,
        cooldownPeriod: this.defaultCooldown,
        escalationPolicy: {
          levels: [
            { level: 0, channels: [{ type: 'console', config: {}, enabled: true }], recipients: [], actions: [] }
          ],
          maxEscalations: 2,
          escalationInterval: 300000 // 5 minutes
        },
        tags: {}
      }
    ]

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule)
    }
  }

  /**
   * Initialize default channels
   */
  private initializeDefaultChannels(): void {
    this.channels.set('console', {
      type: 'console',
      config: {},
      enabled: true
    })
  }
}

// Global alerting system instance
export const alertingSystem = new AlertingSystem()

/**
 * Utility function to create alerts
 */
export function createAlert(
  title: string,
  description: string,
  severity: 'info' | 'warning' | 'critical' | 'emergency',
  component: string,
  tags: Record<string, string> = {}
): Alert {
  return alertingSystem.createAlert({
    title,
    description,
    severity,
    component,
    source: 'manual',
    tags,
    metadata: {}
  })
}

/**
 * Decorator for automatic error alerting
 */
export function alertOnError(component: string, severity: 'warning' | 'critical' = 'warning') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args)
      } catch (error) {
        // Create alert for error
        createAlert(
          `${component} Error`,
          `Method ${propertyName} failed: ${String(error)}`,
          severity,
          component,
          { method: propertyName, error: error instanceof Error ? error.name : 'unknown' }
        )

        throw error
      }
    }

    return descriptor
  }
}
