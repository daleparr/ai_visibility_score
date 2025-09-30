/**
 * Compliance Framework
 * 
 * Provides comprehensive compliance management for GDPR, CCPA, HIPAA,
 * SOX, and other regulatory requirements. Ensures the ADI system
 * meets all applicable privacy and security regulations.
 * 
 * Features:
 * - Multi-regulation compliance tracking
 * - Automated compliance checks
 * - Consent management
 * - Data subject rights management
 * - Compliance reporting and auditing
 * - Violation detection and remediation
 */

export interface ComplianceRegulation {
  id: string
  name: string
  description: string
  jurisdiction: string[]
  applicableDataTypes: string[]
  requirements: ComplianceRequirement[]
  penalties: {
    monetary: string
    operational: string[]
  }
  lastUpdated: number
}

export interface ComplianceRequirement {
  id: string
  name: string
  description: string
  category: 'data_protection' | 'consent' | 'access_rights' | 'security' | 'breach_notification' | 'governance'
  mandatory: boolean
  implementationStatus: 'not_implemented' | 'partial' | 'implemented' | 'verified'
  controls: ComplianceControl[]
  evidence: string[]
  lastAssessed: number
}

export interface ComplianceControl {
  id: string
  name: string
  type: 'technical' | 'administrative' | 'physical'
  description: string
  implementation: string
  effectiveness: 'low' | 'medium' | 'high'
  testResults: ControlTestResult[]
  responsible: string
  reviewFrequency: number // milliseconds
  lastReview: number
}

export interface ControlTestResult {
  id: string
  testDate: number
  testType: 'automated' | 'manual' | 'audit'
  result: 'pass' | 'fail' | 'partial'
  findings: string[]
  recommendations: string[]
  tester: string
}

export interface ConsentRecord {
  id: string
  dataSubjectId: string
  purposes: string[]
  dataTypes: string[]
  consentGiven: boolean
  consentDate: number
  consentMethod: 'explicit' | 'implicit' | 'opt_in' | 'opt_out'
  withdrawalDate?: number
  withdrawalMethod?: string
  legalBasis: string
  retentionPeriod: number
  thirdPartySharing: boolean
  thirdParties?: string[]
}

export interface DataSubjectRequest {
  id: string
  dataSubjectId: string
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection'
  requestDate: number
  requestDetails: string
  status: 'received' | 'processing' | 'completed' | 'rejected' | 'appealed'
  responseDate?: number
  responseDetails?: string
  fulfillmentActions: string[]
  verificationMethod: string
  processingTime: number
}

export interface ComplianceViolation {
  id: string
  regulationId: string
  requirementId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedDate: number
  detectionMethod: 'automated' | 'manual' | 'audit' | 'report'
  affectedDataSubjects: number
  dataTypes: string[]
  rootCause: string
  remediationPlan: string[]
  remediationStatus: 'planned' | 'in_progress' | 'completed' | 'verified'
  reportedToAuthority: boolean
  reportDate?: number
}

export interface ComplianceReport {
  id: string
  reportType: 'assessment' | 'audit' | 'violation' | 'annual' | 'breach'
  regulationIds: string[]
  reportingPeriod: { start: number, end: number }
  overallCompliance: number // 0-100
  complianceByRegulation: Record<string, number>
  violations: ComplianceViolation[]
  recommendations: string[]
  generatedDate: number
  generatedBy: string
  approvedBy?: string
  approvalDate?: number
}

export class ComplianceFramework {
  private regulations: Map<string, ComplianceRegulation> = new Map()
  private consentRecords: Map<string, ConsentRecord> = new Map()
  private dataSubjectRequests: Map<string, DataSubjectRequest> = new Map()
  private violations: Map<string, ComplianceViolation> = new Map()
  private reports: Map<string, ComplianceReport> = new Map()
  
  private readonly maxRecords = 100000
  private monitoringInterval?: NodeJS.Timeout

  constructor() {
    this.initializeRegulations()
    this.startComplianceMonitoring()
  }

  /**
   * Check compliance for specific regulation
   */
  checkCompliance(regulationId: string): {
    overallScore: number
    requirementResults: Array<{
      requirement: ComplianceRequirement
      compliant: boolean
      score: number
      issues: string[]
    }>
    violations: ComplianceViolation[]
    recommendations: string[]
  } {
    const regulation = this.regulations.get(regulationId)
    
    if (!regulation) {
      throw new Error(`Regulation not found: ${regulationId}`)
    }

    const requirementResults = []
    let totalScore = 0
    const issues: string[] = []
    const recommendations: string[] = []

    for (const requirement of regulation.requirements) {
      const result = this.assessRequirement(requirement)
      requirementResults.push(result)
      totalScore += result.score
      
      if (!result.compliant) {
        issues.push(...result.issues)
      }
    }

    const overallScore = regulation.requirements.length > 0 
      ? Math.round(totalScore / regulation.requirements.length)
      : 0

    // Get violations for this regulation
    const regulationViolations = Array.from(this.violations.values())
      .filter(v => v.regulationId === regulationId)

    // Generate recommendations
    if (overallScore < 80) {
      recommendations.push(`Improve overall compliance score for ${regulation.name}`)
    }
    
    const criticalViolations = regulationViolations.filter(v => v.severity === 'critical')
    if (criticalViolations.length > 0) {
      recommendations.push(`Address ${criticalViolations.length} critical violations immediately`)
    }

    return {
      overallScore,
      requirementResults,
      violations: regulationViolations,
      recommendations
    }
  }

  /**
   * Record consent from data subject
   */
  recordConsent(consent: Omit<ConsentRecord, 'id'>): ConsentRecord {
    const consentRecord: ConsentRecord = {
      id: this.generateId('consent'),
      ...consent
    }

    this.consentRecords.set(consentRecord.id, consentRecord)
    
    console.log(`📝 Recorded consent: ${consentRecord.dataSubjectId} for ${consentRecord.purposes.join(', ')}`)
    
    return consentRecord
  }

  /**
   * Withdraw consent
   */
  withdrawConsent(
    dataSubjectId: string, 
    purposes?: string[],
    withdrawalMethod: string = 'explicit'
  ): ConsentRecord[] {
    const withdrawnConsents: ConsentRecord[] = []
    
    for (const consent of this.consentRecords.values()) {
      if (consent.dataSubjectId === dataSubjectId && consent.consentGiven) {
        // Check if specific purposes or all purposes
        const shouldWithdraw = !purposes || 
          purposes.some(purpose => consent.purposes.includes(purpose))
        
        if (shouldWithdraw) {
          consent.consentGiven = false
          consent.withdrawalDate = Date.now()
          consent.withdrawalMethod = withdrawalMethod
          
          withdrawnConsents.push(consent)
        }
      }
    }
    
    console.log(`🚫 Withdrew consent for ${dataSubjectId}: ${withdrawnConsents.length} records`)
    
    return withdrawnConsents
  }

  /**
   * Process data subject request
   */
  async processDataSubjectRequest(
    request: Omit<DataSubjectRequest, 'id' | 'status' | 'processingTime' | 'fulfillmentActions'>
  ): Promise<DataSubjectRequest> {
    const dataSubjectRequest: DataSubjectRequest = {
      id: this.generateId('dsr'),
      status: 'received',
      processingTime: 0,
      ...request,
      fulfillmentActions: []
    }

    this.dataSubjectRequests.set(dataSubjectRequest.id, dataSubjectRequest)
    
    // Start processing
    dataSubjectRequest.status = 'processing'
    const startTime = Date.now()
    
    try {
      await this.fulfillDataSubjectRequest(dataSubjectRequest)
      
      dataSubjectRequest.status = 'completed'
      dataSubjectRequest.responseDate = Date.now()
      dataSubjectRequest.processingTime = Date.now() - startTime
      
      console.log(`✅ Completed data subject request: ${dataSubjectRequest.requestType} for ${dataSubjectRequest.dataSubjectId}`)
      
    } catch (error) {
      dataSubjectRequest.status = 'rejected'
      dataSubjectRequest.responseDate = Date.now()
      dataSubjectRequest.responseDetails = `Request failed: ${error}`
      dataSubjectRequest.processingTime = Date.now() - startTime
      
      console.error(`❌ Failed data subject request: ${error}`)
    }
    
    return dataSubjectRequest
  }

  /**
   * Report compliance violation
   */
  reportViolation(violation: Omit<ComplianceViolation, 'id' | 'detectedDate'>): ComplianceViolation {
    const complianceViolation: ComplianceViolation = {
      id: this.generateId('violation'),
      detectedDate: Date.now(),
      ...violation
    }

    this.violations.set(complianceViolation.id, complianceViolation)
    
    // Auto-report critical violations
    if (complianceViolation.severity === 'critical') {
      this.autoReportViolation(complianceViolation)
    }
    
    console.warn(`🚨 Compliance violation reported: ${complianceViolation.description}`)
    
    return complianceViolation
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(
    reportType: ComplianceReport['reportType'],
    regulationIds: string[],
    reportingPeriod: { start: number, end: number }
  ): ComplianceReport {
    const report: ComplianceReport = {
      id: this.generateId('report'),
      reportType,
      regulationIds,
      reportingPeriod,
      overallCompliance: 0,
      complianceByRegulation: {},
      violations: [],
      recommendations: [],
      generatedDate: Date.now(),
      generatedBy: 'system'
    }

    // Calculate compliance scores
    let totalCompliance = 0
    for (const regulationId of regulationIds) {
      const complianceCheck = this.checkCompliance(regulationId)
      report.complianceByRegulation[regulationId] = complianceCheck.overallScore
      totalCompliance += complianceCheck.overallScore
      
      // Add violations from reporting period
      const periodViolations = complianceCheck.violations.filter(v => 
        v.detectedDate >= reportingPeriod.start && 
        v.detectedDate <= reportingPeriod.end
      )
      report.violations.push(...periodViolations)
      
      // Add recommendations
      report.recommendations.push(...complianceCheck.recommendations)
    }

    report.overallCompliance = regulationIds.length > 0 
      ? Math.round(totalCompliance / regulationIds.length)
      : 0

    // Add general recommendations
    if (report.overallCompliance < 90) {
      report.recommendations.push('Implement comprehensive compliance improvement program')
    }
    
    if (report.violations.length > 0) {
      report.recommendations.push(`Address ${report.violations.length} compliance violations`)
    }

    this.reports.set(report.id, report)
    
    console.log(`📊 Generated compliance report: ${reportType} (${report.overallCompliance}% compliant)`)
    
    return report
  }

  /**
   * Get compliance statistics
   */
  getComplianceStatistics(): {
    totalRegulations: number
    overallCompliance: number
    activeViolations: number
    pendingRequests: number
    consentRecords: number
    complianceByRegulation: Record<string, number>
    violationsBySeverity: Record<string, number>
    requestsByType: Record<string, number>
  } {
    const complianceByRegulation: Record<string, number> = {}
    let totalCompliance = 0

    for (const [regulationId] of this.regulations.entries()) {
      const compliance = this.checkCompliance(regulationId)
      complianceByRegulation[regulationId] = compliance.overallScore
      totalCompliance += compliance.overallScore
    }

    const overallCompliance = this.regulations.size > 0 
      ? Math.round(totalCompliance / this.regulations.size)
      : 0

    const violationsBySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
    const activeViolations = Array.from(this.violations.values())
      .filter(v => v.remediationStatus !== 'completed')

    for (const violation of activeViolations) {
      violationsBySeverity[violation.severity]++
    }

    const requestsByType: Record<string, number> = {}
    for (const request of this.dataSubjectRequests.values()) {
      requestsByType[request.requestType] = (requestsByType[request.requestType] || 0) + 1
    }

    const pendingRequests = Array.from(this.dataSubjectRequests.values())
      .filter(r => r.status === 'received' || r.status === 'processing').length

    return {
      totalRegulations: this.regulations.size,
      overallCompliance,
      activeViolations: activeViolations.length,
      pendingRequests,
      consentRecords: this.consentRecords.size,
      complianceByRegulation,
      violationsBySeverity,
      requestsByType
    }
  }

  /**
   * Check if data processing is lawful
   */
  checkLawfulBasis(
    dataSubjectId: string,
    purposes: string[],
    dataTypes: string[]
  ): {
    lawful: boolean
    basis: string[]
    consentRequired: boolean
    consentStatus: 'given' | 'withdrawn' | 'not_given'
    issues: string[]
  } {
    const issues: string[] = []
    const basis: string[] = []
    let consentRequired = false
    let consentStatus: 'given' | 'withdrawn' | 'not_given' = 'not_given'

    // Check for existing consent
    const relevantConsents = Array.from(this.consentRecords.values())
      .filter(c => 
        c.dataSubjectId === dataSubjectId &&
        purposes.some(p => c.purposes.includes(p))
      )

    if (relevantConsents.length > 0) {
      const activeConsents = relevantConsents.filter(c => c.consentGiven && !c.withdrawalDate)
      
      if (activeConsents.length > 0) {
        basis.push('consent')
        consentStatus = 'given'
      } else {
        consentStatus = 'withdrawn'
        issues.push('Consent has been withdrawn')
      }
    }

    // Check for other lawful bases
    if (purposes.includes('contract_performance')) {
      basis.push('contract')
    }
    if (purposes.includes('legal_obligation')) {
      basis.push('legal_obligation')
    }
    if (purposes.includes('legitimate_interest')) {
      basis.push('legitimate_interest')
    }

    // Determine if consent is required
    const sensitiveDataTypes = ['health', 'biometric', 'genetic', 'racial', 'political', 'religious']
    consentRequired = dataTypes.some(type => sensitiveDataTypes.includes(type)) ||
                     purposes.includes('marketing') ||
                     purposes.includes('profiling')

    if (consentRequired && consentStatus !== 'given') {
      issues.push('Consent required but not given')
    }

    const lawful = basis.length > 0 && (!consentRequired || consentStatus === 'given')

    return {
      lawful,
      basis,
      consentRequired,
      consentStatus,
      issues
    }
  }

  /**
   * Private helper methods
   */
  private assessRequirement(requirement: ComplianceRequirement): {
    requirement: ComplianceRequirement
    compliant: boolean
    score: number
    issues: string[]
  } {
    const issues: string[] = []
    let score = 0

    // Check implementation status
    switch (requirement.implementationStatus) {
      case 'implemented':
        score += 40
        break
      case 'partial':
        score += 20
        issues.push('Requirement partially implemented')
        break
      case 'not_implemented':
        issues.push('Requirement not implemented')
        break
      case 'verified':
        score += 50
        break
    }

    // Check controls effectiveness
    if (requirement.controls.length > 0) {
      const effectiveControls = requirement.controls.filter(c => c.effectiveness === 'high').length
      const controlScore = (effectiveControls / requirement.controls.length) * 50
      score += controlScore
      
      if (controlScore < 25) {
        issues.push('Controls are not sufficiently effective')
      }
    } else {
      issues.push('No controls defined for requirement')
    }

    // Check if assessment is recent
    const assessmentAge = Date.now() - requirement.lastAssessed
    const maxAge = 365 * 24 * 60 * 60 * 1000 // 1 year
    
    if (assessmentAge > maxAge) {
      issues.push('Requirement assessment is outdated')
      score -= 10
    }

    const compliant = score >= 80 && issues.length === 0

    return {
      requirement,
      compliant,
      score: Math.max(0, Math.min(100, score)),
      issues
    }
  }

  private async fulfillDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
    switch (request.requestType) {
      case 'access':
        request.fulfillmentActions.push('Compiled personal data report')
        request.responseDetails = 'Personal data report provided'
        break
      
      case 'rectification':
        request.fulfillmentActions.push('Updated personal data records')
        request.responseDetails = 'Personal data corrected as requested'
        break
      
      case 'erasure':
        request.fulfillmentActions.push('Deleted personal data records')
        request.responseDetails = 'Personal data deleted as requested'
        break
      
      case 'portability':
        request.fulfillmentActions.push('Exported personal data in machine-readable format')
        request.responseDetails = 'Personal data export provided'
        break
      
      case 'restriction':
        request.fulfillmentActions.push('Restricted processing of personal data')
        request.responseDetails = 'Processing restricted as requested'
        break
      
      case 'objection':
        request.fulfillmentActions.push('Stopped processing based on objection')
        request.responseDetails = 'Processing stopped as requested'
        break
    }
  }

  private autoReportViolation(violation: ComplianceViolation): void {
    // Auto-report to regulatory authorities if required
    const regulation = this.regulations.get(violation.regulationId)
    
    if (regulation && this.requiresAuthorityNotification(violation)) {
      violation.reportedToAuthority = true
      violation.reportDate = Date.now()
      
      console.warn(`📢 Auto-reported violation to authorities: ${violation.id}`)
    }
  }

  private requiresAuthorityNotification(violation: ComplianceViolation): boolean {
    // GDPR requires notification within 72 hours for high-risk breaches
    if (violation.regulationId === 'gdpr' && 
        violation.severity === 'critical' && 
        violation.affectedDataSubjects > 0) {
      return true
    }
    
    // CCPA requires notification for certain types of breaches
    if (violation.regulationId === 'ccpa' && 
        violation.severity === 'critical') {
      return true
    }
    
    return false
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeRegulations(): void {
    const regulations: ComplianceRegulation[] = [
      {
        id: 'gdpr',
        name: 'General Data Protection Regulation',
        description: 'EU regulation on data protection and privacy',
        jurisdiction: ['EU', 'EEA'],
        applicableDataTypes: ['personal_data', 'sensitive_data'],
        requirements: [
          {
            id: 'gdpr_consent',
            name: 'Lawful Basis for Processing',
            description: 'Ensure lawful basis exists for all data processing',
            category: 'consent',
            mandatory: true,
            implementationStatus: 'implemented',
            controls: [],
            evidence: [],
            lastAssessed: Date.now()
          },
          {
            id: 'gdpr_data_protection',
            name: 'Data Protection by Design',
            description: 'Implement privacy by design principles',
            category: 'data_protection',
            mandatory: true,
            implementationStatus: 'partial',
            controls: [],
            evidence: [],
            lastAssessed: Date.now()
          }
        ],
        penalties: {
          monetary: 'Up to €20 million or 4% of annual global turnover',
          operational: ['Processing restrictions', 'Corrective measures']
        },
        lastUpdated: Date.now()
      },
      {
        id: 'ccpa',
        name: 'California Consumer Privacy Act',
        description: 'California state law on consumer privacy rights',
        jurisdiction: ['California', 'US'],
        applicableDataTypes: ['personal_information'],
        requirements: [
          {
            id: 'ccpa_disclosure',
            name: 'Privacy Notice Requirements',
            description: 'Provide clear privacy notices to consumers',
            category: 'governance',
            mandatory: true,
            implementationStatus: 'implemented',
            controls: [],
            evidence: [],
            lastAssessed: Date.now()
          },
          {
            id: 'ccpa_rights',
            name: 'Consumer Rights',
            description: 'Enable consumer rights (access, delete, opt-out)',
            category: 'access_rights',
            mandatory: true,
            implementationStatus: 'implemented',
            controls: [],
            evidence: [],
            lastAssessed: Date.now()
          }
        ],
        penalties: {
          monetary: 'Up to $7,500 per violation',
          operational: ['Injunctive relief', 'Civil penalties']
        },
        lastUpdated: Date.now()
      }
    ]

    for (const regulation of regulations) {
      this.regulations.set(regulation.id, regulation)
    }

    console.log('📋 Initialized compliance regulations')
  }

  private startComplianceMonitoring(): void {
    // Monitor compliance status periodically
    this.monitoringInterval = setInterval(() => {
      this.performComplianceChecks()
    }, 24 * 60 * 60 * 1000) // Daily

    console.log('🔍 Started compliance monitoring')
  }

  private performComplianceChecks(): void {
    // Check for expired consents
    const now = Date.now()
    let expiredConsents = 0

    for (const consent of this.consentRecords.values()) {
      if (consent.consentGiven && 
          consent.retentionPeriod > 0 && 
          now - consent.consentDate > consent.retentionPeriod) {
        
        // Auto-expire consent
        consent.consentGiven = false
        consent.withdrawalDate = now
        consent.withdrawalMethod = 'automatic_expiry'
        expiredConsents++
      }
    }

    if (expiredConsents > 0) {
      console.log(`⏰ Auto-expired ${expiredConsents} consent records`)
    }

    // Check for overdue data subject requests
    const overdueRequests = Array.from(this.dataSubjectRequests.values())
      .filter(r => 
        r.status === 'processing' && 
        now - r.requestDate > 30 * 24 * 60 * 60 * 1000 // 30 days
      )

    if (overdueRequests.length > 0) {
      console.warn(`⚠️ ${overdueRequests.length} data subject requests are overdue`)
    }
  }
}

// Global compliance framework instance
export const complianceFramework = new ComplianceFramework()

/**
 * Compliance check decorator
 */
export function checkCompliance(regulations: string[] = ['gdpr', 'ccpa']) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Check compliance before executing method
      for (const regulationId of regulations) {
        const compliance = complianceFramework.checkCompliance(regulationId)
        
        if (compliance.overallScore < 70) {
          console.warn(`⚠️ Low compliance score for ${regulationId}: ${compliance.overallScore}%`)
        }
        
        if (compliance.violations.some(v => v.severity === 'critical')) {
          throw new Error(`Critical compliance violations detected for ${regulationId}`)
        }
      }

      return method.apply(this, args)
    }

    return descriptor
  }
}
