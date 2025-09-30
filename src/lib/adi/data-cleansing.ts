/**
 * Automated Data Cleansing Pipeline
 * 
 * Automatically cleans, normalizes, and enhances data quality across
 * the ADI system. Provides configurable cleansing rules, data transformation,
 * and quality improvement workflows.
 * 
 * Features:
 * - Automated data cleaning rules
 * - Data normalization and standardization
 * - Missing value imputation
 * - Outlier detection and handling
 * - Data enrichment and enhancement
 * - Quality improvement tracking
 */

export interface CleansingRule {
  id: string
  name: string
  description: string
  type: 'normalize' | 'validate' | 'transform' | 'enrich' | 'repair'
  field: string
  condition?: CleansingCondition
  action: CleansingAction
  priority: number // 1-10, higher = more important
  enabled: boolean
}

export interface CleansingCondition {
  operator: 'exists' | 'empty' | 'invalid' | 'outlier' | 'duplicate' | 'custom'
  threshold?: number
  pattern?: string
  customCheck?: (value: any, context?: any) => boolean
}

export interface CleansingAction {
  type: 'remove' | 'replace' | 'normalize' | 'impute' | 'enrich' | 'flag'
  replacement?: any
  normalizer?: (value: any) => any
  imputer?: (field: string, context: any) => any
  enricher?: (value: any, context: any) => any
  flag?: string
}

export interface CleansingResult {
  success: boolean
  originalData: any
  cleanedData: any
  appliedRules: string[]
  changes: CleansingChange[]
  qualityImprovement: {
    before: number
    after: number
    improvement: number
  }
  metadata: {
    processingTime: number
    rulesApplied: number
    changesCount: number
    confidenceScore: number
  }
}

export interface CleansingChange {
  ruleId: string
  field: string
  changeType: 'removed' | 'replaced' | 'normalized' | 'imputed' | 'enriched' | 'flagged'
  originalValue: any
  newValue: any
  confidence: number
  reason: string
}

export interface DataEnrichment {
  field: string
  enrichmentType: 'lookup' | 'calculation' | 'inference' | 'external_api'
  source: string
  confidence: number
  value: any
  metadata: Record<string, any>
}

export interface CleansingProfile {
  dataType: string
  totalRecords: number
  cleanedRecords: number
  cleaningRate: number
  commonIssues: Array<{
    issue: string
    frequency: number
    autoFixed: number
    manualReview: number
  }>
  qualityTrends: {
    beforeCleaning: number
    afterCleaning: number
    averageImprovement: number
  }
}

export class DataCleansingPipeline {
  private rules: Map<string, CleansingRule[]> = new Map()
  private cleansingHistory: Map<string, CleansingResult[]> = new Map()
  private enrichmentSources: Map<string, any> = new Map()
  private profiles: Map<string, CleansingProfile> = new Map()
  
  private readonly maxHistorySize = 1000

  constructor() {
    this.initializeDefaultRules()
    this.initializeEnrichmentSources()
  }

  /**
   * Register cleansing rules for a data type
   */
  registerRules(dataType: string, rules: CleansingRule[]): void {
    this.rules.set(dataType, rules.sort((a, b) => b.priority - a.priority))
    console.log(`🧹 Registered ${rules.length} cleansing rules for ${dataType}`)
  }

  /**
   * Clean and enhance data
   */
  async cleanseData(dataType: string, data: any, context?: any): Promise<CleansingResult> {
    const startTime = Date.now()
    const rules = this.rules.get(dataType) || []
    
    if (rules.length === 0) {
      console.warn(`No cleansing rules found for data type: ${dataType}`)
      return this.createNoOpResult(data, startTime)
    }

    // Calculate initial quality score
    const initialQuality = this.calculateDataQuality(data)
    
    let cleanedData = JSON.parse(JSON.stringify(data)) // Deep clone
    const appliedRules: string[] = []
    const changes: CleansingChange[] = []

    // Apply cleansing rules in priority order
    for (const rule of rules.filter(r => r.enabled)) {
      try {
        const ruleResult = await this.applyCleansingRule(rule, cleanedData, context)
        
        if (ruleResult.applied) {
          appliedRules.push(rule.id)
          changes.push(...ruleResult.changes)
          cleanedData = ruleResult.data
        }
      } catch (error) {
        console.error(`Error applying cleansing rule ${rule.id}:`, error)
      }
    }

    // Calculate final quality score
    const finalQuality = this.calculateDataQuality(cleanedData)
    const qualityImprovement = finalQuality - initialQuality

    const result: CleansingResult = {
      success: true,
      originalData: data,
      cleanedData,
      appliedRules,
      changes,
      qualityImprovement: {
        before: initialQuality,
        after: finalQuality,
        improvement: qualityImprovement
      },
      metadata: {
        processingTime: Date.now() - startTime,
        rulesApplied: appliedRules.length,
        changesCount: changes.length,
        confidenceScore: this.calculateConfidenceScore(changes)
      }
    }

    // Store result and update profile
    this.storeCleansingResult(dataType, result)
    this.updateCleansingProfile(dataType, result)

    return result
  }

  /**
   * Batch cleanse multiple data items
   */
  async batchCleanse(dataType: string, dataItems: any[], context?: any): Promise<CleansingResult[]> {
    const results: CleansingResult[] = []
    
    for (const item of dataItems) {
      const result = await this.cleanseData(dataType, item, context)
      results.push(result)
    }
    
    return results
  }

  /**
   * Get cleansing profile for a data type
   */
  getCleansingProfile(dataType: string): CleansingProfile | null {
    return this.profiles.get(dataType) || null
  }

  /**
   * Get all cleansing profiles
   */
  getAllCleansingProfiles(): CleansingProfile[] {
    return Array.from(this.profiles.values())
  }

  /**
   * Get cleansing statistics
   */
  getCleansingStatistics(): {
    totalRecords: number
    cleanedRecords: number
    averageQualityImprovement: number
    topIssuesFixed: Array<{ issue: string, frequency: number }>
    cleansingEfficiency: number
  } {
    const profiles = this.getAllCleansingProfiles()
    
    if (profiles.length === 0) {
      return {
        totalRecords: 0,
        cleanedRecords: 0,
        averageQualityImprovement: 0,
        topIssuesFixed: [],
        cleansingEfficiency: 0
      }
    }

    const totalRecords = profiles.reduce((sum, p) => sum + p.totalRecords, 0)
    const cleanedRecords = profiles.reduce((sum, p) => sum + p.cleanedRecords, 0)
    const avgImprovement = profiles.reduce((sum, p) => sum + p.qualityTrends.averageImprovement, 0) / profiles.length

    // Aggregate top issues
    const issueMap = new Map<string, number>()
    for (const profile of profiles) {
      for (const issue of profile.commonIssues) {
        issueMap.set(issue.issue, (issueMap.get(issue.issue) || 0) + issue.autoFixed)
      }
    }

    const topIssuesFixed = Array.from(issueMap.entries())
      .map(([issue, frequency]) => ({ issue, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    const cleansingEfficiency = totalRecords > 0 ? (cleanedRecords / totalRecords) * 100 : 0

    return {
      totalRecords,
      cleanedRecords,
      averageQualityImprovement: Math.round(avgImprovement * 100) / 100,
      topIssuesFixed,
      cleansingEfficiency: Math.round(cleansingEfficiency * 100) / 100
    }
  }

  /**
   * Apply a single cleansing rule
   */
  private async applyCleansingRule(
    rule: CleansingRule, 
    data: any, 
    context?: any
  ): Promise<{
    applied: boolean
    data: any
    changes: CleansingChange[]
  }> {
    const fieldValue = this.getFieldValue(data, rule.field)
    const changes: CleansingChange[] = []
    
    // Check if rule condition is met
    if (rule.condition && !this.checkCondition(rule.condition, fieldValue, context)) {
      return { applied: false, data, changes }
    }

    // Apply the cleansing action
    const actionResult = await this.applyAction(rule, fieldValue, data, context)
    
    if (actionResult.changed) {
      // Update the data
      this.setFieldValue(data, rule.field, actionResult.newValue)
      
      changes.push({
        ruleId: rule.id,
        field: rule.field,
        changeType: this.mapActionToChangeType(rule.action.type),
        originalValue: fieldValue,
        newValue: actionResult.newValue,
        confidence: actionResult.confidence,
        reason: actionResult.reason
      })
    }

    return {
      applied: actionResult.changed,
      data,
      changes
    }
  }

  /**
   * Check if a condition is met
   */
  private checkCondition(condition: CleansingCondition, value: any, context?: any): boolean {
    switch (condition.operator) {
      case 'exists':
        return value !== undefined && value !== null
      
      case 'empty':
        return value === undefined || value === null || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0)
      
      case 'invalid':
        return this.isInvalidValue(value)
      
      case 'outlier':
        return this.isOutlier(value, condition.threshold || 2)
      
      case 'duplicate':
        return this.isDuplicate(value, context)
      
      case 'custom':
        return condition.customCheck ? condition.customCheck(value, context) : false
      
      default:
        return false
    }
  }

  /**
   * Apply a cleansing action
   */
  private async applyAction(
    rule: CleansingRule, 
    value: any, 
    data: any, 
    context?: any
  ): Promise<{
    changed: boolean
    newValue: any
    confidence: number
    reason: string
  }> {
    const action = rule.action

    switch (action.type) {
      case 'remove':
        return {
          changed: true,
          newValue: undefined,
          confidence: 0.9,
          reason: `Removed invalid value: ${value}`
        }

      case 'replace':
        return {
          changed: true,
          newValue: action.replacement,
          confidence: 0.8,
          reason: `Replaced ${value} with ${action.replacement}`
        }

      case 'normalize':
        if (action.normalizer) {
          const normalized = action.normalizer(value)
          return {
            changed: normalized !== value,
            newValue: normalized,
            confidence: 0.9,
            reason: `Normalized value from ${value} to ${normalized}`
          }
        }
        break

      case 'impute':
        if (action.imputer) {
          const imputed = action.imputer(rule.field, { data, context })
          return {
            changed: true,
            newValue: imputed,
            confidence: 0.7,
            reason: `Imputed missing value: ${imputed}`
          }
        }
        break

      case 'enrich':
        if (action.enricher) {
          const enriched = await action.enricher(value, { data, context })
          return {
            changed: enriched !== value,
            newValue: enriched,
            confidence: 0.8,
            reason: `Enriched value from ${value} to ${enriched}`
          }
        }
        break

      case 'flag':
        // Add a flag to the data without changing the original value
        if (!data._flags) data._flags = []
        data._flags.push({
          field: rule.field,
          flag: action.flag || 'quality_issue',
          value,
          reason: rule.description
        })
        return {
          changed: false,
          newValue: value,
          confidence: 1.0,
          reason: `Flagged value for review: ${action.flag}`
        }
    }

    return {
      changed: false,
      newValue: value,
      confidence: 0,
      reason: 'No action applied'
    }
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

  private setFieldValue(data: any, fieldPath: string, value: any): void {
    const parts = fieldPath.split('.')
    let current = data

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (current[part] === undefined || current[part] === null) {
        current[part] = {}
      }
      current = current[part]
    }

    if (value === undefined) {
      delete current[parts[parts.length - 1]]
    } else {
      current[parts[parts.length - 1]] = value
    }
  }

  private isInvalidValue(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string' && value.trim() === '') return true
    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) return true
    return false
  }

  private isOutlier(value: any, threshold: number): boolean {
    // Simplified outlier detection - would use statistical methods in production
    if (typeof value !== 'number') return false
    return Math.abs(value) > threshold * 100 // Simple threshold check
  }

  private isDuplicate(value: any, context?: any): boolean {
    // Simplified duplicate detection
    return false
  }

  private mapActionToChangeType(actionType: string): CleansingChange['changeType'] {
    switch (actionType) {
      case 'remove': return 'removed'
      case 'replace': return 'replaced'
      case 'normalize': return 'normalized'
      case 'impute': return 'imputed'
      case 'enrich': return 'enriched'
      case 'flag': return 'flagged'
      default: return 'replaced'
    }
  }

  private calculateDataQuality(data: any): number {
    // Simplified quality calculation - would integrate with actual quality scorer
    if (!data || typeof data !== 'object') return 0
    
    const fields = Object.keys(data)
    const validFields = fields.filter(key => {
      const value = data[key]
      return value !== null && value !== undefined && value !== ''
    })
    
    return fields.length > 0 ? (validFields.length / fields.length) * 100 : 0
  }

  private calculateConfidenceScore(changes: CleansingChange[]): number {
    if (changes.length === 0) return 1.0
    
    const totalConfidence = changes.reduce((sum, change) => sum + change.confidence, 0)
    return totalConfidence / changes.length
  }

  private createNoOpResult(data: any, startTime: number): CleansingResult {
    return {
      success: true,
      originalData: data,
      cleanedData: data,
      appliedRules: [],
      changes: [],
      qualityImprovement: {
        before: 100,
        after: 100,
        improvement: 0
      },
      metadata: {
        processingTime: Date.now() - startTime,
        rulesApplied: 0,
        changesCount: 0,
        confidenceScore: 1.0
      }
    }
  }

  private storeCleansingResult(dataType: string, result: CleansingResult): void {
    if (!this.cleansingHistory.has(dataType)) {
      this.cleansingHistory.set(dataType, [])
    }
    
    const history = this.cleansingHistory.get(dataType)!
    history.push(result)
    
    // Keep only recent results
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize)
    }
  }

  private updateCleansingProfile(dataType: string, result: CleansingResult): void {
    const existing = this.profiles.get(dataType)
    
    if (!existing) {
      this.profiles.set(dataType, {
        dataType,
        totalRecords: 1,
        cleanedRecords: result.changes.length > 0 ? 1 : 0,
        cleaningRate: result.changes.length > 0 ? 100 : 0,
        commonIssues: this.extractIssuesFromResult(result),
        qualityTrends: {
          beforeCleaning: result.qualityImprovement.before,
          afterCleaning: result.qualityImprovement.after,
          averageImprovement: result.qualityImprovement.improvement
        }
      })
    } else {
      existing.totalRecords++
      if (result.changes.length > 0) existing.cleanedRecords++
      existing.cleaningRate = (existing.cleanedRecords / existing.totalRecords) * 100
      
      // Update quality trends (rolling average)
      existing.qualityTrends.averageImprovement = 
        (existing.qualityTrends.averageImprovement * 0.9) + 
        (result.qualityImprovement.improvement * 0.1)
      
      // Update common issues
      const newIssues = this.extractIssuesFromResult(result)
      this.mergeIssues(existing.commonIssues, newIssues)
    }
  }

  private extractIssuesFromResult(result: CleansingResult): Array<{
    issue: string
    frequency: number
    autoFixed: number
    manualReview: number
  }> {
    const issueMap = new Map<string, { frequency: number, autoFixed: number, manualReview: number }>()
    
    for (const change of result.changes) {
      const issue = change.reason
      if (!issueMap.has(issue)) {
        issueMap.set(issue, { frequency: 0, autoFixed: 0, manualReview: 0 })
      }
      
      const issueData = issueMap.get(issue)!
      issueData.frequency++
      
      if (change.confidence > 0.8) {
        issueData.autoFixed++
      } else {
        issueData.manualReview++
      }
    }
    
    return Array.from(issueMap.entries()).map(([issue, data]) => ({
      issue,
      ...data
    }))
  }

  private mergeIssues(
    existing: Array<{ issue: string, frequency: number, autoFixed: number, manualReview: number }>,
    newIssues: Array<{ issue: string, frequency: number, autoFixed: number, manualReview: number }>
  ): void {
    for (const newIssue of newIssues) {
      const existingIssue = existing.find(i => i.issue === newIssue.issue)
      if (existingIssue) {
        existingIssue.frequency += newIssue.frequency
        existingIssue.autoFixed += newIssue.autoFixed
        existingIssue.manualReview += newIssue.manualReview
      } else {
        existing.push(newIssue)
      }
    }
    
    // Keep only top 10 issues
    existing.sort((a, b) => b.frequency - a.frequency)
    existing.splice(10)
  }

  /**
   * Initialize default cleansing rules
   */
  private initializeDefaultRules(): void {
    // URL normalization rules
    this.registerRules('url_data', [
      {
        id: 'normalize_url',
        name: 'Normalize URL',
        description: 'Normalize URL format',
        type: 'normalize',
        field: 'url',
        action: {
          type: 'normalize',
          normalizer: (url: string) => {
            if (typeof url !== 'string') return url
            // Remove trailing slash, convert to lowercase
            return url.toLowerCase().replace(/\/$/, '')
          }
        },
        priority: 8,
        enabled: true
      },
      {
        id: 'fix_protocol',
        name: 'Fix Missing Protocol',
        description: 'Add https:// to URLs missing protocol',
        type: 'repair',
        field: 'url',
        condition: {
          operator: 'custom',
          customCheck: (url) => typeof url === 'string' && !url.startsWith('http')
        },
        action: {
          type: 'normalize',
          normalizer: (url: string) => `https://${url}`
        },
        priority: 9,
        enabled: true
      }
    ])

    // Text content cleansing rules
    this.registerRules('text_content', [
      {
        id: 'trim_whitespace',
        name: 'Trim Whitespace',
        description: 'Remove leading and trailing whitespace',
        type: 'normalize',
        field: 'content',
        action: {
          type: 'normalize',
          normalizer: (text: string) => typeof text === 'string' ? text.trim() : text
        },
        priority: 7,
        enabled: true
      },
      {
        id: 'remove_empty_content',
        name: 'Remove Empty Content',
        description: 'Remove empty or whitespace-only content',
        type: 'validate',
        field: 'content',
        condition: {
          operator: 'custom',
          customCheck: (content) => typeof content === 'string' && content.trim() === ''
        },
        action: {
          type: 'remove'
        },
        priority: 6,
        enabled: true
      }
    ])

    // Numeric data cleansing rules
    this.registerRules('numeric_data', [
      {
        id: 'fix_invalid_numbers',
        name: 'Fix Invalid Numbers',
        description: 'Replace invalid numbers with 0',
        type: 'repair',
        field: 'score',
        condition: {
          operator: 'custom',
          customCheck: (value) => typeof value === 'number' && (isNaN(value) || !isFinite(value))
        },
        action: {
          type: 'replace',
          replacement: 0
        },
        priority: 8,
        enabled: true
      },
      {
        id: 'clamp_scores',
        name: 'Clamp Scores to Valid Range',
        description: 'Ensure scores are between 0 and 100',
        type: 'normalize',
        field: 'score',
        condition: {
          operator: 'custom',
          customCheck: (value) => typeof value === 'number' && (value < 0 || value > 100)
        },
        action: {
          type: 'normalize',
          normalizer: (score: number) => Math.max(0, Math.min(100, score))
        },
        priority: 7,
        enabled: true
      }
    ])

    console.log('🧹 Initialized default cleansing rules')
  }

  /**
   * Initialize enrichment sources
   */
  private initializeEnrichmentSources(): void {
    // Domain information enrichment
    this.enrichmentSources.set('domain_info', {
      type: 'lookup',
      source: 'internal',
      lookup: (domain: string) => {
        // Simplified domain enrichment
        return {
          tld: domain.split('.').pop(),
          isCommercial: domain.includes('.com'),
          estimatedAge: 'unknown'
        }
      }
    })

    // Content type detection
    this.enrichmentSources.set('content_type', {
      type: 'inference',
      source: 'internal',
      infer: (content: string) => {
        if (content.includes('<html')) return 'html'
        if (content.startsWith('{') || content.startsWith('[')) return 'json'
        return 'text'
      }
    })

    console.log('🔍 Initialized enrichment sources')
  }
}

// Global data cleansing pipeline instance
export const dataCleansingPipeline = new DataCleansingPipeline()

/**
 * Utility function to cleanse data
 */
export async function cleanseData(dataType: string, data: any, context?: any): Promise<CleansingResult> {
  return dataCleansingPipeline.cleanseData(dataType, data, context)
}

/**
 * Decorator for automatic data cleansing
 */
export function cleanseOutput(dataType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)
      
      // Cleanse the output
      const cleansingResult = await dataCleansingPipeline.cleanseData(
        dataType, 
        result, 
        { method: propertyName }
      )
      
      // Return the cleaned data with cleansing metadata
      const cleanedResult = cleansingResult.cleanedData
      if (cleanedResult && typeof cleanedResult === 'object') {
        cleanedResult._cleansing = {
          applied: cleansingResult.appliedRules.length > 0,
          changes: cleansingResult.changes.length,
          qualityImprovement: cleansingResult.qualityImprovement.improvement,
          confidence: cleansingResult.metadata.confidenceScore
        }
      }
      
      return cleanedResult
    }

    return descriptor
  }
}
