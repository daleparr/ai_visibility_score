/**
 * Comprehensive Data Validation Framework
 * 
 * Validates all data flowing through the ADI system to ensure high-quality,
 * reliable insights for brand merchants. Provides multi-layer validation
 * with detailed quality scoring and automated correction suggestions.
 * 
 * Features:
 * - Schema validation for structured data
 * - Content quality assessment
 * - Data consistency checks
 * - Automated data cleansing
 * - Quality confidence scoring
 * - Validation rule engine
 */

export interface ValidationRule {
  id: string
  name: string
  description: string
  type: 'required' | 'format' | 'range' | 'pattern' | 'custom' | 'consistency'
  field: string
  condition: ValidationCondition
  severity: 'error' | 'warning' | 'info'
  autoFix?: boolean
  fixFunction?: (value: any) => any
}

export interface ValidationCondition {
  operator: 'exists' | 'not_empty' | 'matches' | 'between' | 'in' | 'custom'
  value?: any
  pattern?: string
  min?: number
  max?: number
  allowedValues?: any[]
  customValidator?: (value: any, context?: any) => boolean
}

export interface ValidationResult {
  isValid: boolean
  score: number // 0-100 quality score
  confidence: number // 0-1 confidence in the data
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  metadata: {
    rulesApplied: number
    rulesPassed: number
    autoFixesApplied: number
    validationTime: number
  }
}

export interface ValidationError {
  ruleId: string
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
  currentValue: any
  expectedValue?: any
  suggestion?: string
}

export interface ValidationWarning {
  ruleId: string
  field: string
  message: string
  impact: 'low' | 'medium' | 'high'
  recommendation: string
}

export interface ValidationSuggestion {
  field: string
  issue: string
  suggestion: string
  confidence: number
  autoFixable: boolean
}

export interface DataQualityProfile {
  component: string
  dataType: string
  totalRecords: number
  validRecords: number
  qualityScore: number
  commonIssues: Array<{
    issue: string
    frequency: number
    impact: 'low' | 'medium' | 'high'
  }>
  trends: {
    qualityTrend: 'improving' | 'stable' | 'degrading'
    volumeTrend: 'increasing' | 'stable' | 'decreasing'
  }
}

export class DataValidationFramework {
  private rules: Map<string, ValidationRule[]> = new Map()
  private validationHistory: Map<string, ValidationResult[]> = new Map()
  private qualityProfiles: Map<string, DataQualityProfile> = new Map()
  
  private readonly maxHistorySize = 1000

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * Register validation rules for a data type
   */
  registerRules(dataType: string, rules: ValidationRule[]): void {
    this.rules.set(dataType, rules)
    console.log(`📋 Registered ${rules.length} validation rules for ${dataType}`)
  }

  /**
   * Validate data against registered rules
   */
  validateData(dataType: string, data: any, context?: any): ValidationResult {
    const startTime = Date.now()
    const rules = this.rules.get(dataType) || []
    
    if (rules.length === 0) {
      console.warn(`No validation rules found for data type: ${dataType}`)
      return this.createDefaultValidationResult(startTime)
    }

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []
    let autoFixesApplied = 0
    let rulesPassed = 0

    // Apply each validation rule
    for (const rule of rules) {
      try {
        const ruleResult = this.applyValidationRule(rule, data, context)
        
        if (ruleResult.passed) {
          rulesPassed++
        } else {
          if (rule.severity === 'error') {
            errors.push({
              ruleId: rule.id,
              field: rule.field,
              message: ruleResult.message,
              severity: rule.severity,
              currentValue: ruleResult.currentValue,
              expectedValue: ruleResult.expectedValue,
              suggestion: ruleResult.suggestion
            })
          } else {
            warnings.push({
              ruleId: rule.id,
              field: rule.field,
              message: ruleResult.message,
              impact: this.mapSeverityToImpact(rule.severity),
              recommendation: ruleResult.suggestion || 'Review and correct this field'
            })
          }

          // Apply auto-fix if available
          if (rule.autoFix && rule.fixFunction && ruleResult.autoFixable) {
            try {
              const fixedValue = rule.fixFunction(ruleResult.currentValue)
              this.applyAutoFix(data, rule.field, fixedValue)
              autoFixesApplied++
              
              suggestions.push({
                field: rule.field,
                issue: ruleResult.message,
                suggestion: `Auto-fixed: ${ruleResult.currentValue} → ${fixedValue}`,
                confidence: 0.8,
                autoFixable: true
              })
            } catch (fixError) {
              console.warn(`Auto-fix failed for rule ${rule.id}:`, fixError)
            }
          } else if (ruleResult.suggestion) {
            suggestions.push({
              field: rule.field,
              issue: ruleResult.message,
              suggestion: ruleResult.suggestion,
              confidence: 0.7,
              autoFixable: false
            })
          }
        }
      } catch (error) {
        console.error(`Error applying validation rule ${rule.id}:`, error)
        errors.push({
          ruleId: rule.id,
          field: rule.field,
          message: `Validation rule failed: ${error}`,
          severity: 'error',
          currentValue: undefined
        })
      }
    }

    // Calculate quality score and confidence
    const qualityScore = this.calculateQualityScore(rules.length, rulesPassed, errors, warnings)
    const confidence = this.calculateConfidence(qualityScore, errors.length, warnings.length)
    const isValid = errors.length === 0

    const result: ValidationResult = {
      isValid,
      score: qualityScore,
      confidence,
      errors,
      warnings,
      suggestions,
      metadata: {
        rulesApplied: rules.length,
        rulesPassed,
        autoFixesApplied,
        validationTime: Date.now() - startTime
      }
    }

    // Store validation history
    this.storeValidationResult(dataType, result)
    
    // Update quality profile
    this.updateQualityProfile(dataType, result)

    return result
  }

  /**
   * Validate agent output data
   */
  validateAgentOutput(agentName: string, output: any): ValidationResult {
    const dataType = `agent_output_${agentName}`
    return this.validateData(dataType, output, { agent: agentName })
  }

  /**
   * Validate crawled website data
   */
  validateCrawlData(crawlData: any): ValidationResult {
    return this.validateData('crawl_data', crawlData)
  }

  /**
   * Validate schema markup data
   */
  validateSchemaData(schemaData: any): ValidationResult {
    return this.validateData('schema_data', schemaData)
  }

  /**
   * Validate LLM response data
   */
  validateLLMResponse(response: any, context?: any): ValidationResult {
    return this.validateData('llm_response', response, context)
  }

  /**
   * Get data quality profile for a component
   */
  getQualityProfile(component: string): DataQualityProfile | null {
    return this.qualityProfiles.get(component) || null
  }

  /**
   * Get all quality profiles
   */
  getAllQualityProfiles(): DataQualityProfile[] {
    return Array.from(this.qualityProfiles.values())
  }

  /**
   * Get validation history for a data type
   */
  getValidationHistory(dataType: string, limit: number = 100): ValidationResult[] {
    const history = this.validationHistory.get(dataType) || []
    return history.slice(-limit)
  }

  /**
   * Get system-wide data quality metrics
   */
  getSystemQualityMetrics(): {
    overallScore: number
    totalValidations: number
    errorRate: number
    warningRate: number
    autoFixRate: number
    topIssues: Array<{ issue: string, frequency: number }>
  } {
    const allProfiles = this.getAllQualityProfiles()
    
    if (allProfiles.length === 0) {
      return {
        overallScore: 100,
        totalValidations: 0,
        errorRate: 0,
        warningRate: 0,
        autoFixRate: 0,
        topIssues: []
      }
    }

    const totalScore = allProfiles.reduce((sum, profile) => sum + profile.qualityScore, 0)
    const overallScore = totalScore / allProfiles.length

    const totalValidations = allProfiles.reduce((sum, profile) => sum + profile.totalRecords, 0)
    const validRecords = allProfiles.reduce((sum, profile) => sum + profile.validRecords, 0)
    const errorRate = totalValidations > 0 ? ((totalValidations - validRecords) / totalValidations) * 100 : 0

    // Aggregate common issues
    const issueMap = new Map<string, number>()
    for (const profile of allProfiles) {
      for (const issue of profile.commonIssues) {
        issueMap.set(issue.issue, (issueMap.get(issue.issue) || 0) + issue.frequency)
      }
    }

    const topIssues = Array.from(issueMap.entries())
      .map(([issue, frequency]) => ({ issue, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    return {
      overallScore: Math.round(overallScore),
      totalValidations,
      errorRate: Math.round(errorRate * 100) / 100,
      warningRate: 0, // Would calculate from validation history
      autoFixRate: 0, // Would calculate from validation history
      topIssues
    }
  }

  /**
   * Apply a single validation rule
   */
  private applyValidationRule(rule: ValidationRule, data: any, context?: any): {
    passed: boolean
    message: string
    currentValue: any
    expectedValue?: any
    suggestion?: string
    autoFixable: boolean
  } {
    const fieldValue = this.getFieldValue(data, rule.field)
    const condition = rule.condition

    switch (condition.operator) {
      case 'exists':
        return {
          passed: fieldValue !== undefined && fieldValue !== null,
          message: `Field '${rule.field}' is required`,
          currentValue: fieldValue,
          suggestion: 'Provide a value for this field',
          autoFixable: false
        }

      case 'not_empty':
        const isEmpty = fieldValue === undefined || fieldValue === null || 
                       (typeof fieldValue === 'string' && fieldValue.trim() === '') ||
                       (Array.isArray(fieldValue) && fieldValue.length === 0)
        return {
          passed: !isEmpty,
          message: `Field '${rule.field}' cannot be empty`,
          currentValue: fieldValue,
          suggestion: 'Provide a non-empty value',
          autoFixable: false
        }

      case 'matches':
        if (!condition.pattern) {
          throw new Error(`Pattern required for 'matches' operator in rule ${rule.id}`)
        }
        const regex = new RegExp(condition.pattern)
        const matches = typeof fieldValue === 'string' && regex.test(fieldValue)
        return {
          passed: matches,
          message: `Field '${rule.field}' does not match required pattern`,
          currentValue: fieldValue,
          expectedValue: condition.pattern,
          suggestion: `Value should match pattern: ${condition.pattern}`,
          autoFixable: false
        }

      case 'between':
        if (condition.min === undefined || condition.max === undefined) {
          throw new Error(`Min and max required for 'between' operator in rule ${rule.id}`)
        }
        const numValue = typeof fieldValue === 'number' ? fieldValue : parseFloat(fieldValue)
        const inRange = !isNaN(numValue) && numValue >= condition.min && numValue <= condition.max
        return {
          passed: inRange,
          message: `Field '${rule.field}' must be between ${condition.min} and ${condition.max}`,
          currentValue: fieldValue,
          expectedValue: `${condition.min}-${condition.max}`,
          suggestion: `Provide a value between ${condition.min} and ${condition.max}`,
          autoFixable: !isNaN(numValue) && (numValue < condition.min || numValue > condition.max)
        }

      case 'in':
        if (!condition.allowedValues) {
          throw new Error(`Allowed values required for 'in' operator in rule ${rule.id}`)
        }
        const isAllowed = condition.allowedValues.includes(fieldValue)
        return {
          passed: isAllowed,
          message: `Field '${rule.field}' has invalid value`,
          currentValue: fieldValue,
          expectedValue: condition.allowedValues,
          suggestion: `Value must be one of: ${condition.allowedValues.join(', ')}`,
          autoFixable: false
        }

      case 'custom':
        if (!condition.customValidator) {
          throw new Error(`Custom validator required for 'custom' operator in rule ${rule.id}`)
        }
        const customResult = condition.customValidator(fieldValue, context)
        return {
          passed: customResult,
          message: `Field '${rule.field}' failed custom validation`,
          currentValue: fieldValue,
          suggestion: 'Review field value against custom requirements',
          autoFixable: false
        }

      default:
        throw new Error(`Unknown validation operator: ${condition.operator}`)
    }
  }

  /**
   * Get field value from nested object
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

  /**
   * Apply auto-fix to data
   */
  private applyAutoFix(data: any, fieldPath: string, fixedValue: any): void {
    const parts = fieldPath.split('.')
    let current = data

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (current[part] === undefined || current[part] === null) {
        current[part] = {}
      }
      current = current[part]
    }

    current[parts[parts.length - 1]] = fixedValue
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(
    totalRules: number,
    rulesPassed: number,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    if (totalRules === 0) return 100

    const baseScore = (rulesPassed / totalRules) * 100
    const errorPenalty = errors.length * 10 // 10 points per error
    const warningPenalty = warnings.length * 3 // 3 points per warning

    return Math.max(0, Math.round(baseScore - errorPenalty - warningPenalty))
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(qualityScore: number, errorCount: number, warningCount: number): number {
    let confidence = qualityScore / 100

    // Reduce confidence based on issues
    if (errorCount > 0) {
      confidence *= Math.max(0.3, 1 - (errorCount * 0.2))
    }
    if (warningCount > 0) {
      confidence *= Math.max(0.7, 1 - (warningCount * 0.05))
    }

    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * Map severity to impact
   */
  private mapSeverityToImpact(severity: string): 'low' | 'medium' | 'high' {
    switch (severity) {
      case 'error': return 'high'
      case 'warning': return 'medium'
      case 'info': return 'low'
      default: return 'medium'
    }
  }

  /**
   * Store validation result in history
   */
  private storeValidationResult(dataType: string, result: ValidationResult): void {
    if (!this.validationHistory.has(dataType)) {
      this.validationHistory.set(dataType, [])
    }

    const history = this.validationHistory.get(dataType)!
    history.push(result)

    // Keep only recent results
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize)
    }
  }

  /**
   * Update quality profile
   */
  private updateQualityProfile(dataType: string, result: ValidationResult): void {
    const existing = this.qualityProfiles.get(dataType)
    
    if (!existing) {
      this.qualityProfiles.set(dataType, {
        component: dataType,
        dataType,
        totalRecords: 1,
        validRecords: result.isValid ? 1 : 0,
        qualityScore: result.score,
        commonIssues: this.extractIssues(result),
        trends: {
          qualityTrend: 'stable',
          volumeTrend: 'stable'
        }
      })
    } else {
      existing.totalRecords++
      if (result.isValid) existing.validRecords++
      
      // Update rolling average quality score
      existing.qualityScore = Math.round(
        (existing.qualityScore * 0.9) + (result.score * 0.1)
      )
      
      // Update common issues
      const newIssues = this.extractIssues(result)
      this.mergeIssues(existing.commonIssues, newIssues)
      
      // Update trends (simplified)
      existing.trends = this.calculateTrends(dataType)
    }
  }

  /**
   * Extract issues from validation result
   */
  private extractIssues(result: ValidationResult): Array<{ issue: string, frequency: number, impact: 'low' | 'medium' | 'high' }> {
    const issues: Array<{ issue: string, frequency: number, impact: 'low' | 'medium' | 'high' }> = []
    
    for (const error of result.errors) {
      issues.push({
        issue: error.message,
        frequency: 1,
        impact: 'high'
      })
    }
    
    for (const warning of result.warnings) {
      issues.push({
        issue: warning.message,
        frequency: 1,
        impact: warning.impact
      })
    }
    
    return issues
  }

  /**
   * Merge issues into existing list
   */
  private mergeIssues(
    existing: Array<{ issue: string, frequency: number, impact: 'low' | 'medium' | 'high' }>,
    newIssues: Array<{ issue: string, frequency: number, impact: 'low' | 'medium' | 'high' }>
  ): void {
    for (const newIssue of newIssues) {
      const existingIssue = existing.find(i => i.issue === newIssue.issue)
      if (existingIssue) {
        existingIssue.frequency++
      } else {
        existing.push(newIssue)
      }
    }
    
    // Keep only top 10 issues
    existing.sort((a, b) => b.frequency - a.frequency)
    existing.splice(10)
  }

  /**
   * Calculate trends for a data type
   */
  private calculateTrends(dataType: string): {
    qualityTrend: 'improving' | 'stable' | 'degrading'
    volumeTrend: 'increasing' | 'stable' | 'decreasing'
  } {
    const history = this.getValidationHistory(dataType, 20)
    
    if (history.length < 5) {
      return { qualityTrend: 'stable', volumeTrend: 'stable' }
    }
    
    // Simple trend calculation
    const recent = history.slice(-5)
    const older = history.slice(-10, -5)
    
    const recentAvgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length
    const olderAvgScore = older.reduce((sum, r) => sum + r.score, 0) / older.length
    
    const qualityChange = recentAvgScore - olderAvgScore
    const qualityTrend = Math.abs(qualityChange) < 5 ? 'stable' : 
                        qualityChange > 0 ? 'improving' : 'degrading'
    
    return {
      qualityTrend,
      volumeTrend: 'stable' // Would calculate based on validation frequency
    }
  }

  /**
   * Create default validation result
   */
  private createDefaultValidationResult(startTime: number): ValidationResult {
    return {
      isValid: true,
      score: 100,
      confidence: 0.5, // Low confidence due to no validation
      errors: [],
      warnings: [{
        ruleId: 'no_rules',
        field: 'system',
        message: 'No validation rules configured',
        impact: 'medium',
        recommendation: 'Configure validation rules for this data type'
      }],
      suggestions: [],
      metadata: {
        rulesApplied: 0,
        rulesPassed: 0,
        autoFixesApplied: 0,
        validationTime: Date.now() - startTime
      }
    }
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Agent output validation rules
    this.registerRules('agent_output', [
      {
        id: 'agent_name_required',
        name: 'Agent Name Required',
        description: 'Agent output must have an agent name',
        type: 'required',
        field: 'agentName',
        condition: { operator: 'not_empty' },
        severity: 'error'
      },
      {
        id: 'status_valid',
        name: 'Valid Status',
        description: 'Agent status must be valid',
        type: 'format',
        field: 'status',
        condition: { 
          operator: 'in', 
          allowedValues: ['completed', 'failed', 'skipped', 'timeout'] 
        },
        severity: 'error'
      },
      {
        id: 'results_array',
        name: 'Results Array',
        description: 'Agent results must be an array',
        type: 'format',
        field: 'results',
        condition: { 
          operator: 'custom',
          customValidator: (value) => Array.isArray(value)
        },
        severity: 'error'
      }
    ])

    // Crawl data validation rules
    this.registerRules('crawl_data', [
      {
        id: 'url_required',
        name: 'URL Required',
        description: 'Crawl data must have a URL',
        type: 'required',
        field: 'url',
        condition: { operator: 'not_empty' },
        severity: 'error'
      },
      {
        id: 'url_format',
        name: 'Valid URL Format',
        description: 'URL must be properly formatted',
        type: 'format',
        field: 'url',
        condition: { 
          operator: 'matches',
          pattern: '^https?:\\/\\/.+\\..+'
        },
        severity: 'error'
      },
      {
        id: 'content_size',
        name: 'Content Size Check',
        description: 'Content should not be empty',
        type: 'range',
        field: 'content.length',
        condition: { 
          operator: 'between',
          min: 100,
          max: 10000000 // 10MB
        },
        severity: 'warning'
      }
    ])

    // Schema data validation rules
    this.registerRules('schema_data', [
      {
        id: 'schema_type_required',
        name: 'Schema Type Required',
        description: 'Schema data must have a type',
        type: 'required',
        field: '@type',
        condition: { operator: 'not_empty' },
        severity: 'error'
      },
      {
        id: 'schema_context',
        name: 'Schema Context',
        description: 'Schema should have context',
        type: 'required',
        field: '@context',
        condition: { operator: 'exists' },
        severity: 'warning'
      }
    ])

    // LLM response validation rules
    this.registerRules('llm_response', [
      {
        id: 'response_not_empty',
        name: 'Response Not Empty',
        description: 'LLM response cannot be empty',
        type: 'required',
        field: 'response',
        condition: { operator: 'not_empty' },
        severity: 'error'
      },
      {
        id: 'response_length',
        name: 'Response Length Check',
        description: 'Response should be reasonable length',
        type: 'range',
        field: 'response.length',
        condition: { 
          operator: 'between',
          min: 10,
          max: 10000
        },
        severity: 'warning'
      }
    ])

    console.log('📋 Initialized default validation rules')
  }
}

// Global data validation framework instance
export const dataValidation = new DataValidationFramework()

/**
 * Utility function to validate any data
 */
export function validateData(dataType: string, data: any, context?: any): ValidationResult {
  return dataValidation.validateData(dataType, data, context)
}

/**
 * Decorator for automatic data validation
 */
export function validateOutput(dataType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)
      
      // Validate the output
      const validation = dataValidation.validateData(dataType, result, { method: propertyName })
      
      if (!validation.isValid) {
        console.warn(`Data validation failed for ${propertyName}:`, validation.errors)
      }
      
      // Attach validation metadata
      if (result && typeof result === 'object') {
        result._validation = validation
      }
      
      return result
    }

    return descriptor
  }
}
