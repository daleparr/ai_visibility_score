/**
 * Data Integrity Checker
 * 
 * Ensures data consistency, referential integrity, and logical coherence
 * across the ADI system. Validates relationships between data elements
 * and maintains data quality standards.
 * 
 * Features:
 * - Referential integrity validation
 * - Cross-field consistency checks
 * - Temporal consistency validation
 * - Business rule compliance
 * - Data relationship verification
 * - Integrity violation reporting
 */

export interface IntegrityRule {
  id: string
  name: string
  description: string
  type: 'referential' | 'consistency' | 'temporal' | 'business' | 'relationship'
  scope: 'field' | 'record' | 'dataset' | 'cross_dataset'
  fields: string[]
  condition: IntegrityCondition
  severity: 'error' | 'warning' | 'info'
  autoFix?: boolean
  fixAction?: (data: any, violation: IntegrityViolation) => any
}

export interface IntegrityCondition {
  type: 'required_relationship' | 'mutual_exclusion' | 'dependency' | 'range_consistency' | 'format_consistency' | 'temporal_order' | 'custom'
  parameters?: Record<string, any>
  customValidator?: (data: any, context?: any) => IntegrityValidationResult
}

export interface IntegrityValidationResult {
  isValid: boolean
  violations: IntegrityViolation[]
  warnings: IntegrityWarning[]
  score: number // 0-100 integrity score
  confidence: number // 0-1 confidence in validation
  metadata: {
    rulesChecked: number
    violationsFound: number
    warningsFound: number
    validationTime: number
  }
}

export interface IntegrityViolation {
  ruleId: string
  severity: 'error' | 'warning' | 'info'
  field: string
  message: string
  currentValue: any
  expectedValue?: any
  relatedFields?: string[]
  suggestion?: string
  autoFixable: boolean
}

export interface IntegrityWarning {
  ruleId: string
  field: string
  message: string
  impact: 'low' | 'medium' | 'high'
  recommendation: string
}

export interface IntegrityReport {
  timestamp: number
  dataType: string
  totalRecords: number
  validRecords: number
  integrityScore: number
  violationsByType: Record<string, number>
  violationsBySeverity: Record<string, number>
  topViolations: Array<{
    rule: string
    frequency: number
    impact: 'low' | 'medium' | 'high'
  }>
  trends: {
    scoreChange: number
    violationChange: number
    trend: 'improving' | 'stable' | 'degrading'
  }
}

export interface DataRelationship {
  sourceField: string
  targetField: string
  relationshipType: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many'
  required: boolean
  cascadeDelete?: boolean
  validationRules?: string[]
}

export class DataIntegrityChecker {
  private rules: Map<string, IntegrityRule[]> = new Map()
  private relationships: Map<string, DataRelationship[]> = new Map()
  private validationHistory: Map<string, IntegrityValidationResult[]> = new Map()
  private integrityReports: Map<string, IntegrityReport[]> = new Map()
  
  private readonly maxHistorySize = 1000

  constructor() {
    this.initializeDefaultRules()
    this.initializeDefaultRelationships()
  }

  /**
   * Register integrity rules for a data type
   */
  registerRules(dataType: string, rules: IntegrityRule[]): void {
    this.rules.set(dataType, rules)
    console.log(`🔒 Registered ${rules.length} integrity rules for ${dataType}`)
  }

  /**
   * Register data relationships
   */
  registerRelationships(dataType: string, relationships: DataRelationship[]): void {
    this.relationships.set(dataType, relationships)
    console.log(`🔗 Registered ${relationships.length} relationships for ${dataType}`)
  }

  /**
   * Validate data integrity
   */
  async validateIntegrity(
    dataType: string, 
    data: any, 
    context?: any
  ): Promise<IntegrityValidationResult> {
    const startTime = Date.now()
    const rules = this.rules.get(dataType) || []
    
    if (rules.length === 0) {
      console.warn(`No integrity rules found for data type: ${dataType}`)
      return this.createDefaultValidationResult(startTime)
    }

    const violations: IntegrityViolation[] = []
    const warnings: IntegrityWarning[] = []
    let rulesChecked = 0

    // Validate each integrity rule
    for (const rule of rules) {
      try {
        rulesChecked++
        const ruleResult = await this.validateRule(rule, data, context)
        
        if (!ruleResult.isValid) {
          if (rule.severity === 'error') {
            violations.push({
              ruleId: rule.id,
              severity: rule.severity,
              field: rule.fields[0] || 'unknown',
              message: ruleResult.message,
              currentValue: ruleResult.currentValue,
              expectedValue: ruleResult.expectedValue,
              relatedFields: rule.fields.slice(1),
              suggestion: ruleResult.suggestion,
              autoFixable: rule.autoFix || false
            })
          } else {
            warnings.push({
              ruleId: rule.id,
              field: rule.fields[0] || 'unknown',
              message: ruleResult.message,
              impact: this.mapSeverityToImpact(rule.severity),
              recommendation: ruleResult.suggestion || 'Review and correct this issue'
            })
          }
        }
      } catch (error) {
        console.error(`Error validating integrity rule ${rule.id}:`, error)
        violations.push({
          ruleId: rule.id,
          severity: 'error',
          field: 'system',
          message: `Integrity rule validation failed: ${error}`,
          currentValue: undefined,
          autoFixable: false
        })
      }
    }

    // Calculate integrity score
    const integrityScore = this.calculateIntegrityScore(rulesChecked, violations, warnings)
    const confidence = this.calculateConfidence(integrityScore, violations.length, warnings.length)

    const result: IntegrityValidationResult = {
      isValid: violations.length === 0,
      violations,
      warnings,
      score: integrityScore,
      confidence,
      metadata: {
        rulesChecked,
        violationsFound: violations.length,
        warningsFound: warnings.length,
        validationTime: Date.now() - startTime
      }
    }

    // Store validation result
    this.storeValidationResult(dataType, result)

    return result
  }

  /**
   * Validate cross-dataset integrity
   */
  async validateCrossDatasetIntegrity(
    datasets: Array<{ type: string, data: any }>,
    context?: any
  ): Promise<IntegrityValidationResult> {
    const startTime = Date.now()
    const violations: IntegrityViolation[] = []
    const warnings: IntegrityWarning[] = []
    let rulesChecked = 0

    // Check relationships between datasets
    for (const dataset of datasets) {
      const relationships = this.relationships.get(dataset.type) || []
      
      for (const relationship of relationships) {
        rulesChecked++
        const relationshipResult = this.validateRelationship(
          relationship, 
          dataset.data, 
          datasets, 
          context
        )
        
        if (!relationshipResult.isValid) {
          violations.push({
            ruleId: `relationship_${relationship.sourceField}_${relationship.targetField}`,
            severity: relationship.required ? 'error' : 'warning',
            field: relationship.sourceField,
            message: relationshipResult.message,
            currentValue: relationshipResult.currentValue,
            expectedValue: relationshipResult.expectedValue,
            relatedFields: [relationship.targetField],
            suggestion: relationshipResult.suggestion,
            autoFixable: false
          })
        }
      }
    }

    const integrityScore = this.calculateIntegrityScore(rulesChecked, violations, warnings)
    const confidence = this.calculateConfidence(integrityScore, violations.length, warnings.length)

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      score: integrityScore,
      confidence,
      metadata: {
        rulesChecked,
        violationsFound: violations.length,
        warningsFound: warnings.length,
        validationTime: Date.now() - startTime
      }
    }
  }

  /**
   * Generate integrity report
   */
  generateIntegrityReport(dataType: string, timeWindow: number = 24 * 60 * 60 * 1000): IntegrityReport {
    const history = this.getValidationHistory(dataType, timeWindow)
    
    if (history.length === 0) {
      return this.createEmptyReport(dataType)
    }

    const latest = history[history.length - 1]
    const totalRecords = history.length
    const validRecords = history.filter(h => h.isValid).length
    const integrityScore = Math.round(
      history.reduce((sum, h) => sum + h.score, 0) / history.length
    )

    // Aggregate violations by type and severity
    const violationsByType: Record<string, number> = {}
    const violationsBySeverity: Record<string, number> = { error: 0, warning: 0, info: 0 }
    const violationFrequency = new Map<string, number>()

    for (const result of history) {
      for (const violation of result.violations) {
        violationsBySeverity[violation.severity]++
        
        // Count by rule type (simplified)
        const ruleType = violation.ruleId.split('_')[0] || 'unknown'
        violationsByType[ruleType] = (violationsByType[ruleType] || 0) + 1
        
        // Track frequency
        violationFrequency.set(violation.ruleId, (violationFrequency.get(violation.ruleId) || 0) + 1)
      }
    }

    // Top violations
    const topViolations = Array.from(violationFrequency.entries())
      .map(([rule, frequency]) => ({
        rule,
        frequency,
        impact: this.calculateViolationImpact(rule, frequency)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    // Calculate trends
    const trends = this.calculateIntegrityTrends(history)

    const report: IntegrityReport = {
      timestamp: Date.now(),
      dataType,
      totalRecords,
      validRecords,
      integrityScore,
      violationsByType,
      violationsBySeverity,
      topViolations,
      trends
    }

    // Store report
    this.storeIntegrityReport(dataType, report)

    return report
  }

  /**
   * Get integrity statistics
   */
  getIntegrityStatistics(): {
    overallScore: number
    totalValidations: number
    violationRate: number
    topIssues: Array<{ issue: string, frequency: number }>
    dataTypeScores: Record<string, number>
  } {
    const allHistory = Array.from(this.validationHistory.values()).flat()
    
    if (allHistory.length === 0) {
      return {
        overallScore: 100,
        totalValidations: 0,
        violationRate: 0,
        topIssues: [],
        dataTypeScores: {}
      }
    }

    const overallScore = Math.round(
      allHistory.reduce((sum, h) => sum + h.score, 0) / allHistory.length
    )

    const totalViolations = allHistory.reduce((sum, h) => sum + h.violations.length, 0)
    const violationRate = (totalViolations / allHistory.length) * 100

    // Aggregate top issues
    const issueFrequency = new Map<string, number>()
    for (const result of allHistory) {
      for (const violation of result.violations) {
        issueFrequency.set(violation.message, (issueFrequency.get(violation.message) || 0) + 1)
      }
    }

    const topIssues = Array.from(issueFrequency.entries())
      .map(([issue, frequency]) => ({ issue, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    // Data type scores
    const dataTypeScores: Record<string, number> = {}
    for (const [dataType, history] of this.validationHistory.entries()) {
      if (history.length > 0) {
        dataTypeScores[dataType] = Math.round(
          history.reduce((sum, h) => sum + h.score, 0) / history.length
        )
      }
    }

    return {
      overallScore,
      totalValidations: allHistory.length,
      violationRate: Math.round(violationRate * 100) / 100,
      topIssues,
      dataTypeScores
    }
  }

  /**
   * Validate a single integrity rule
   */
  private async validateRule(
    rule: IntegrityRule, 
    data: any, 
    context?: any
  ): Promise<{
    isValid: boolean
    message: string
    currentValue?: any
    expectedValue?: any
    suggestion?: string
  }> {
    const condition = rule.condition

    switch (condition.type) {
      case 'required_relationship':
        return this.validateRequiredRelationship(rule, data, context)
      
      case 'mutual_exclusion':
        return this.validateMutualExclusion(rule, data, context)
      
      case 'dependency':
        return this.validateDependency(rule, data, context)
      
      case 'range_consistency':
        return this.validateRangeConsistency(rule, data, context)
      
      case 'format_consistency':
        return this.validateFormatConsistency(rule, data, context)
      
      case 'temporal_order':
        return this.validateTemporalOrder(rule, data, context)
      
      case 'custom':
        if (condition.customValidator) {
          const result = condition.customValidator(data, context)
          return {
            isValid: result.isValid,
            message: result.violations[0]?.message || 'Custom validation failed',
            suggestion: 'Review custom validation requirements'
          }
        }
        break
    }

    return {
      isValid: true,
      message: 'Rule validation passed'
    }
  }

  /**
   * Specific validation methods
   */
  private validateRequiredRelationship(rule: IntegrityRule, data: any, context?: any): {
    isValid: boolean
    message: string
    currentValue?: any
    expectedValue?: any
    suggestion?: string
  } {
    const sourceField = rule.fields[0]
    const targetField = rule.fields[1]
    
    const sourceValue = this.getFieldValue(data, sourceField)
    const targetValue = this.getFieldValue(data, targetField)
    
    if (sourceValue && !targetValue) {
      return {
        isValid: false,
        message: `Required relationship violated: ${sourceField} requires ${targetField}`,
        currentValue: { [sourceField]: sourceValue, [targetField]: targetValue },
        suggestion: `Provide value for ${targetField} when ${sourceField} is present`
      }
    }
    
    return { isValid: true, message: 'Required relationship satisfied' }
  }

  private validateMutualExclusion(rule: IntegrityRule, data: any, context?: any): {
    isValid: boolean
    message: string
    currentValue?: any
    suggestion?: string
  } {
    const fields = rule.fields
    const presentFields = fields.filter(field => {
      const value = this.getFieldValue(data, field)
      return value !== undefined && value !== null && value !== ''
    })
    
    if (presentFields.length > 1) {
      return {
        isValid: false,
        message: `Mutual exclusion violated: only one of [${fields.join(', ')}] should be present`,
        currentValue: presentFields.reduce((obj, field) => {
          obj[field] = this.getFieldValue(data, field)
          return obj
        }, {} as any),
        suggestion: `Remove all but one of: ${presentFields.join(', ')}`
      }
    }
    
    return { isValid: true, message: 'Mutual exclusion satisfied' }
  }

  private validateDependency(rule: IntegrityRule, data: any, context?: any): {
    isValid: boolean
    message: string
    currentValue?: any
    suggestion?: string
  } {
    const dependentField = rule.fields[0]
    const requiredField = rule.fields[1]
    
    const dependentValue = this.getFieldValue(data, dependentField)
    const requiredValue = this.getFieldValue(data, requiredField)
    
    if (dependentValue && (!requiredValue || requiredValue === '')) {
      return {
        isValid: false,
        message: `Dependency violated: ${dependentField} depends on ${requiredField}`,
        currentValue: { [dependentField]: dependentValue, [requiredField]: requiredValue },
        suggestion: `Provide value for ${requiredField} when ${dependentField} is present`
      }
    }
    
    return { isValid: true, message: 'Dependency satisfied' }
  }

  private validateRangeConsistency(rule: IntegrityRule, data: any, context?: any): {
    isValid: boolean
    message: string
    currentValue?: any
    suggestion?: string
  } {
    const minField = rule.fields[0]
    const maxField = rule.fields[1]
    
    const minValue = this.getFieldValue(data, minField)
    const maxValue = this.getFieldValue(data, maxField)
    
    if (typeof minValue === 'number' && typeof maxValue === 'number' && minValue > maxValue) {
      return {
        isValid: false,
        message: `Range consistency violated: ${minField} (${minValue}) > ${maxField} (${maxValue})`,
        currentValue: { [minField]: minValue, [maxField]: maxValue },
        suggestion: `Ensure ${minField} <= ${maxField}`
      }
    }
    
    return { isValid: true, message: 'Range consistency satisfied' }
  }

  private validateFormatConsistency(rule: IntegrityRule, data: any, context?: any): {
    isValid: boolean
    message: string
    currentValue?: any
    suggestion?: string
  } {
    const fields = rule.fields
    const formats = fields.map(field => this.detectFormat(this.getFieldValue(data, field)))
    const uniqueFormats = new Set(formats)
    
    if (uniqueFormats.size > 1) {
      return {
        isValid: false,
        message: `Format consistency violated: fields have different formats`,
        currentValue: fields.reduce((obj, field, index) => {
          obj[field] = { value: this.getFieldValue(data, field), format: formats[index] }
          return obj
        }, {} as any),
        suggestion: 'Ensure all related fields use consistent formats'
      }
    }
    
    return { isValid: true, message: 'Format consistency satisfied' }
  }

  private validateTemporalOrder(rule: IntegrityRule, data: any, context?: any): {
    isValid: boolean
    message: string
    currentValue?: any
    suggestion?: string
  } {
    const startField = rule.fields[0]
    const endField = rule.fields[1]
    
    const startValue = this.getFieldValue(data, startField)
    const endValue = this.getFieldValue(data, endField)
    
    if (startValue && endValue) {
      const startTime = new Date(startValue).getTime()
      const endTime = new Date(endValue).getTime()
      
      if (!isNaN(startTime) && !isNaN(endTime) && startTime > endTime) {
        return {
          isValid: false,
          message: `Temporal order violated: ${startField} occurs after ${endField}`,
          currentValue: { [startField]: startValue, [endField]: endValue },
          suggestion: `Ensure ${startField} occurs before ${endField}`
        }
      }
    }
    
    return { isValid: true, message: 'Temporal order satisfied' }
  }

  /**
   * Validate relationship between datasets
   */
  private validateRelationship(
    relationship: DataRelationship,
    sourceData: any,
    allDatasets: Array<{ type: string, data: any }>,
    context?: any
  ): {
    isValid: boolean
    message: string
    currentValue?: any
    expectedValue?: any
    suggestion?: string
  } {
    const sourceValue = this.getFieldValue(sourceData, relationship.sourceField)
    
    if (!sourceValue && relationship.required) {
      return {
        isValid: false,
        message: `Required relationship field ${relationship.sourceField} is missing`,
        currentValue: sourceValue,
        suggestion: `Provide value for ${relationship.sourceField}`
      }
    }
    
    if (sourceValue) {
      // Find target dataset and validate relationship
      const targetDataset = allDatasets.find(ds => 
        this.getFieldValue(ds.data, relationship.targetField) === sourceValue
      )
      
      if (!targetDataset && relationship.required) {
        return {
          isValid: false,
          message: `Referential integrity violated: ${relationship.sourceField} references non-existent ${relationship.targetField}`,
          currentValue: sourceValue,
          suggestion: `Ensure referenced ${relationship.targetField} exists`
        }
      }
    }
    
    return { isValid: true, message: 'Relationship satisfied' }
  }

  /**
   * Utility methods
   */
  private getFieldValue(data: any, fieldPath: string): any {
    const parts = fieldPath.split('.')
    let current = data

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[part]
    }

    return current
  }

  private detectFormat(value: any): string {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date'
      if (/^https?:\/\//.test(value)) return 'url'
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email'
      return 'string'
    }
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    return 'unknown'
  }

  private calculateIntegrityScore(rulesChecked: number, violations: IntegrityViolation[], warnings: IntegrityWarning[]): number {
    if (rulesChecked === 0) return 100

    const errorPenalty = violations.filter(v => v.severity === 'error').length * 15
    const warningPenalty = violations.filter(v => v.severity === 'warning').length * 5
    const infoPenalty = violations.filter(v => v.severity === 'info').length * 2

    return Math.max(0, 100 - errorPenalty - warningPenalty - infoPenalty)
  }

  private calculateConfidence(score: number, violationCount: number, warningCount: number): number {
    let confidence = score / 100

    if (violationCount > 0) {
      confidence *= Math.max(0.3, 1 - (violationCount * 0.1))
    }
    if (warningCount > 0) {
      confidence *= Math.max(0.7, 1 - (warningCount * 0.05))
    }

    return Math.max(0, Math.min(1, confidence))
  }

  private mapSeverityToImpact(severity: string): 'low' | 'medium' | 'high' {
    switch (severity) {
      case 'error': return 'high'
      case 'warning': return 'medium'
      case 'info': return 'low'
      default: return 'medium'
    }
  }

  private calculateViolationImpact(rule: string, frequency: number): 'low' | 'medium' | 'high' {
    if (frequency > 10) return 'high'
    if (frequency > 5) return 'medium'
    return 'low'
  }

  private calculateIntegrityTrends(history: IntegrityValidationResult[]): {
    scoreChange: number
    violationChange: number
    trend: 'improving' | 'stable' | 'degrading'
  } {
    if (history.length < 2) {
      return { scoreChange: 0, violationChange: 0, trend: 'stable' }
    }

    const recent = history.slice(-5)
    const older = history.slice(-10, -5)

    if (older.length === 0) {
      return { scoreChange: 0, violationChange: 0, trend: 'stable' }
    }

    const recentAvgScore = recent.reduce((sum, h) => sum + h.score, 0) / recent.length
    const olderAvgScore = older.reduce((sum, h) => sum + h.score, 0) / older.length
    const scoreChange = recentAvgScore - olderAvgScore

    const recentAvgViolations = recent.reduce((sum, h) => sum + h.violations.length, 0) / recent.length
    const olderAvgViolations = older.reduce((sum, h) => sum + h.violations.length, 0) / older.length
    const violationChange = recentAvgViolations - olderAvgViolations

    let trend: 'improving' | 'stable' | 'degrading' = 'stable'
    if (Math.abs(scoreChange) > 5) {
      trend = scoreChange > 0 ? 'improving' : 'degrading'
    }

    return {
      scoreChange: Math.round(scoreChange * 100) / 100,
      violationChange: Math.round(violationChange * 100) / 100,
      trend
    }
  }

  private getValidationHistory(dataType: string, timeWindow: number): IntegrityValidationResult[] {
    const history = this.validationHistory.get(dataType) || []
    const cutoff = Date.now() - timeWindow
    
    return history.filter(result => 
      result.metadata && Date.now() - result.metadata.validationTime < timeWindow
    )
  }

  private storeValidationResult(dataType: string, result: IntegrityValidationResult): void {
    if (!this.validationHistory.has(dataType)) {
      this.validationHistory.set(dataType, [])
    }
    
    const history = this.validationHistory.get(dataType)!
    history.push(result)
    
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize)
    }
  }

  private storeIntegrityReport(dataType: string, report: IntegrityReport): void {
    if (!this.integrityReports.has(dataType)) {
      this.integrityReports.set(dataType, [])
    }
    
    const reports = this.integrityReports.get(dataType)!
    reports.push(report)
    
    if (reports.length > 100) { // Keep last 100 reports
      reports.splice(0, reports.length - 100)
    }
  }

  private createDefaultValidationResult(startTime: number): IntegrityValidationResult {
    return {
      isValid: true,
      violations: [],
      warnings: [{
        ruleId: 'no_rules',
        field: 'system',
        message: 'No integrity rules configured',
        impact: 'medium',
        recommendation: 'Configure integrity rules for this data type'
      }],
      score: 100,
      confidence: 0.5,
      metadata: {
        rulesChecked: 0,
        violationsFound: 0,
        warningsFound: 1,
        validationTime: Date.now() - startTime
      }
    }
  }

  private createEmptyReport(dataType: string): IntegrityReport {
    return {
      timestamp: Date.now(),
      dataType,
      totalRecords: 0,
      validRecords: 0,
      integrityScore: 100,
      violationsByType: {},
      violationsBySeverity: { error: 0, warning: 0, info: 0 },
      topViolations: [],
      trends: {
        scoreChange: 0,
        violationChange: 0,
        trend: 'stable'
      }
    }
  }

  /**
   * Initialize default integrity rules
   */
  private initializeDefaultRules(): void {
    // Agent output integrity rules
    this.registerRules('agent_output', [
      {
        id: 'status_results_consistency',
        name: 'Status-Results Consistency',
        description: 'Completed status should have results',
        type: 'consistency',
        scope: 'record',
        fields: ['status', 'results'],
        condition: {
          type: 'dependency',
          parameters: { dependent: 'results', required: 'status' }
        },
        severity: 'error'
      },
      {
        id: 'execution_time_positive',
        name: 'Positive Execution Time',
        description: 'Execution time should be positive',
        type: 'business',
        scope: 'field',
        fields: ['executionTime'],
        condition: {
          type: 'range_consistency',
          parameters: { min: 0 }
        },
        severity: 'warning'
      }
    ])

    // Evaluation data integrity rules
    this.registerRules('evaluation_data', [
      {
        id: 'evaluation_timestamps',
        name: 'Evaluation Timestamp Order',
        description: 'Start time should be before end time',
        type: 'temporal',
        scope: 'record',
        fields: ['startTime', 'endTime'],
        condition: {
          type: 'temporal_order'
        },
        severity: 'error'
      }
    ])

    console.log('🔒 Initialized default integrity rules')
  }

  /**
   * Initialize default relationships
   */
  private initializeDefaultRelationships(): void {
    // Agent output relationships
    this.registerRelationships('agent_output', [
      {
        sourceField: 'evaluationId',
        targetField: 'id',
        relationshipType: 'many_to_one',
        required: true
      }
    ])

    console.log('🔗 Initialized default relationships')
  }
}

// Global data integrity checker instance
export const dataIntegrityChecker = new DataIntegrityChecker()

/**
 * Utility function to validate integrity
 */
export async function validateDataIntegrity(
  dataType: string, 
  data: any, 
  context?: any
): Promise<IntegrityValidationResult> {
  return dataIntegrityChecker.validateIntegrity(dataType, data, context)
}

/**
 * Decorator for automatic integrity validation
 */
export function validateIntegrity(dataType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)
      
      // Validate integrity
      const integrityResult = await dataIntegrityChecker.validateIntegrity(
        dataType, 
        result, 
        { method: propertyName }
      )
      
      if (!integrityResult.isValid) {
        console.warn(`Data integrity violations found in ${propertyName}:`, integrityResult.violations)
      }
      
      // Attach integrity metadata
      if (result && typeof result === 'object') {
        result._integrity = {
          isValid: integrityResult.isValid,
          score: integrityResult.score,
          violations: integrityResult.violations.length,
          confidence: integrityResult.confidence
        }
      }
      
      return result
    }

    return descriptor
  }
}
