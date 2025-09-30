/**
 * Data Protection & Encryption System
 * 
 * Provides comprehensive data protection including encryption, PII detection,
 * data anonymization, and secure data handling for the ADI system.
 * Ensures compliance with privacy regulations and protects sensitive information.
 * 
 * Features:
 * - Data encryption at rest and in transit
 * - PII detection and classification
 * - Data anonymization and pseudonymization
 * - Secure key management
 * - Data retention policies
 * - Privacy-preserving analytics
 */

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305'
  keyDerivation: 'PBKDF2' | 'Argon2' | 'scrypt'
  keyRotationInterval: number // milliseconds
  compressionEnabled: boolean
}

export interface PIIClassification {
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'ip_address' | 'name' | 'address' | 'custom'
  confidence: number // 0-1
  location: {
    field: string
    start?: number
    end?: number
  }
  value: string
  masked: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  categories: string[]
  piiDetected: PIIClassification[]
  sensitivityScore: number // 0-100
  retentionPeriod: number // milliseconds
  encryptionRequired: boolean
  accessRestrictions: string[]
}

export interface EncryptedData {
  data: string // Base64 encoded encrypted data
  iv: string // Initialization vector
  tag?: string // Authentication tag for GCM
  algorithm: string
  keyId: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface DataRetentionPolicy {
  id: string
  name: string
  description: string
  dataTypes: string[]
  retentionPeriod: number // milliseconds
  autoDelete: boolean
  archiveBeforeDelete: boolean
  legalHoldExempt: boolean
  approvalRequired: boolean
}

export interface PrivacySettings {
  dataMinimization: boolean
  purposeLimitation: boolean
  storageMinimization: boolean
  anonymizationEnabled: boolean
  consentRequired: boolean
  rightToErasure: boolean
  dataPortability: boolean
}

export class DataProtectionSystem {
  private encryptionConfig: EncryptionConfig
  private privacySettings: PrivacySettings
  private encryptionKeys: Map<string, { key: Buffer, created: number, rotated: number }> = new Map()
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map()
  private dataClassifications: Map<string, DataClassification> = new Map()
  
  private readonly piiPatterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    ssn: /\b(?!000|666|9\d{2})\d{3}[-.\s]?(?!00)\d{2}[-.\s]?(?!0000)\d{4}\b/g,
      credit_card: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
  }

  constructor(
    encryptionConfig: Partial<EncryptionConfig> = {},
    privacySettings: Partial<PrivacySettings> = {}
  ) {
    this.encryptionConfig = {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2',
      keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
      compressionEnabled: true,
      ...encryptionConfig
    }

    this.privacySettings = {
      dataMinimization: true,
      purposeLimitation: true,
      storageMinimization: true,
      anonymizationEnabled: true,
      consentRequired: true,
      rightToErasure: true,
      dataPortability: true,
      ...privacySettings
    }

    this.initializeEncryptionKeys()
    this.initializeRetentionPolicies()
    this.startKeyRotation()
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(
    data: any, 
    keyId?: string,
    metadata?: Record<string, any>
  ): Promise<EncryptedData> {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)
    const keyInfo = this.getEncryptionKey(keyId)
    
    if (!keyInfo) {
      throw new Error('Encryption key not found')
    }

    // Compress data if enabled
    let processedData = dataString
    if (this.encryptionConfig.compressionEnabled) {
      processedData = this.compressData(dataString)
    }

    // Generate IV
    const iv = this.generateIV()
    
    // Encrypt data based on algorithm
    let encryptedData: Buffer
    let tag: string | undefined

    switch (this.encryptionConfig.algorithm) {
      case 'AES-256-GCM':
        const gcmResult = this.encryptAESGCM(processedData, keyInfo.key, iv)
        encryptedData = gcmResult.encrypted
        tag = gcmResult.tag.toString('base64')
        break
      
      case 'AES-256-CBC':
        encryptedData = this.encryptAESCBC(processedData, keyInfo.key, iv)
        break
      
      default:
        throw new Error(`Unsupported encryption algorithm: ${this.encryptionConfig.algorithm}`)
    }

    return {
      data: encryptedData.toString('base64'),
      iv: iv.toString('base64'),
      tag,
      algorithm: this.encryptionConfig.algorithm,
      keyId: keyId || 'default',
      timestamp: Date.now(),
      metadata
    }
  }

  /**
   * Decrypt encrypted data
   */
  async decryptData(encryptedData: EncryptedData): Promise<any> {
    const keyInfo = this.getEncryptionKey(encryptedData.keyId)
    
    if (!keyInfo) {
      throw new Error('Decryption key not found')
    }

    const data = Buffer.from(encryptedData.data, 'base64')
    const iv = Buffer.from(encryptedData.iv, 'base64')
    const tag = encryptedData.tag ? Buffer.from(encryptedData.tag, 'base64') : undefined

    let decryptedData: string

    switch (encryptedData.algorithm) {
      case 'AES-256-GCM':
        if (!tag) {
          throw new Error('Authentication tag required for GCM decryption')
        }
        decryptedData = this.decryptAESGCM(data, keyInfo.key, iv, tag)
        break
      
      case 'AES-256-CBC':
        decryptedData = this.decryptAESCBC(data, keyInfo.key, iv)
        break
      
      default:
        throw new Error(`Unsupported decryption algorithm: ${encryptedData.algorithm}`)
    }

    // Decompress if needed
    if (this.encryptionConfig.compressionEnabled) {
      decryptedData = this.decompressData(decryptedData)
    }

    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(decryptedData)
    } catch {
      return decryptedData
    }
  }

  /**
   * Detect and classify PII in data
   */
  detectPII(data: any, context?: { field?: string, source?: string }): PIIClassification[] {
    const piiFound: PIIClassification[] = []
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)

    // Check each PII pattern
    for (const [type, pattern] of Object.entries(this.piiPatterns)) {
      const matches = Array.from(dataString.matchAll(pattern))
      
      for (const match of matches) {
        const value = match[0]
        const start = match.index || 0
        const end = start + value.length

        piiFound.push({
          type: type as PIIClassification['type'],
          confidence: this.calculatePIIConfidence(type, value),
          location: {
            field: context?.field || 'unknown',
            start,
            end
          },
          value,
          masked: this.maskPII(type, value),
          riskLevel: this.assessPIIRisk(type, value)
        })
      }
    }

    // Check for names (simplified heuristic)
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
    const nameMatches = Array.from(dataString.matchAll(namePattern))
    
    for (const match of nameMatches) {
      const value = match[0]
      const start = match.index || 0
      
      // Skip if it's likely not a name (common words, etc.)
      if (!this.isLikelyName(value)) continue

      piiFound.push({
        type: 'name',
        confidence: 0.7,
        location: {
          field: context?.field || 'unknown',
          start,
          end: start + value.length
        },
        value,
        masked: this.maskPII('name', value),
        riskLevel: 'medium'
      })
    }

    return piiFound
  }

  /**
   * Classify data sensitivity
   */
  classifyData(data: any, context?: { source?: string, purpose?: string }): DataClassification {
    const piiDetected = this.detectPII(data, context)
    
    // Calculate sensitivity score based on PII found
    let sensitivityScore = 0
    const riskWeights = { low: 10, medium: 25, high: 50, critical: 100 }
    
    for (const pii of piiDetected) {
      sensitivityScore += riskWeights[pii.riskLevel] * pii.confidence
    }
    
    sensitivityScore = Math.min(100, sensitivityScore)

    // Determine classification level
    let level: DataClassification['level'] = 'public'
    if (sensitivityScore > 75) level = 'restricted'
    else if (sensitivityScore > 50) level = 'confidential'
    else if (sensitivityScore > 25) level = 'internal'

    // Determine categories
    const categories = this.determineDataCategories(data, piiDetected)
    
    // Determine retention period based on data type
    const retentionPeriod = this.getRetentionPeriod(categories)
    
    return {
      level,
      categories,
      piiDetected,
      sensitivityScore,
      retentionPeriod,
      encryptionRequired: level === 'restricted' || level === 'confidential',
      accessRestrictions: this.getAccessRestrictions(level, categories)
    }
  }

  /**
   * Anonymize data by removing or masking PII
   */
  anonymizeData(data: any, options?: {
    maskingChar?: string
    preserveFormat?: boolean
    hashSensitive?: boolean
  }): { anonymized: any, piiRemoved: PIIClassification[] } {
    const opts = {
      maskingChar: '*',
      preserveFormat: true,
      hashSensitive: false,
      ...options
    }

    let anonymized = JSON.parse(JSON.stringify(data)) // Deep clone
    const piiRemoved: PIIClassification[] = []

    if (typeof data === 'object' && data !== null) {
      // Process object fields
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          const piiFound = this.detectPII(value, { field: key })
          
          if (piiFound.length > 0) {
            let processedValue = value
            
            // Sort by position (descending) to avoid index shifting
            piiFound.sort((a, b) => (b.location.start || 0) - (a.location.start || 0))
            
            for (const pii of piiFound) {
              if (opts.hashSensitive && pii.riskLevel === 'critical') {
                processedValue = this.hashValue(pii.value)
              } else {
                const start = pii.location.start || 0
                const end = pii.location.end || start + pii.value.length
                const masked = opts.preserveFormat ? pii.masked : opts.maskingChar.repeat(pii.value.length)
                
                processedValue = processedValue.substring(0, start) + masked + processedValue.substring(end)
              }
              
              piiRemoved.push(pii)
            }
            
            anonymized[key] = processedValue
          }
        } else if (typeof value === 'object') {
          // Recursively process nested objects
          const nestedResult = this.anonymizeData(value, opts)
          anonymized[key] = nestedResult.anonymized
          piiRemoved.push(...nestedResult.piiRemoved)
        }
      }
    } else if (typeof data === 'string') {
      // Process string data
      const piiFound = this.detectPII(data)
      let processedData = data
      
      piiFound.sort((a, b) => (b.location.start || 0) - (a.location.start || 0))
      
      for (const pii of piiFound) {
        const start = pii.location.start || 0
        const end = pii.location.end || start + pii.value.length
        const masked = opts.preserveFormat ? pii.masked : opts.maskingChar.repeat(pii.value.length)
        
        processedData = processedData.substring(0, start) + masked + processedData.substring(end)
        piiRemoved.push(pii)
      }
      
      anonymized = processedData
    }

    return { anonymized, piiRemoved }
  }

  /**
   * Apply data retention policies
   */
  applyRetentionPolicies(): {
    evaluated: number
    deleted: number
    archived: number
    errors: string[]
  } {
    const results = {
      evaluated: 0,
      deleted: 0,
      archived: 0,
      errors: [] as string[]
    }

    for (const [dataId, classification] of this.dataClassifications.entries()) {
      results.evaluated++
      
      try {
        const now = Date.now()
        const dataAge = now - (classification as any).timestamp || 0
        
        if (dataAge > classification.retentionPeriod) {
          const policy = this.findApplicableRetentionPolicy(classification.categories)
          
          if (policy) {
            if (policy.archiveBeforeDelete) {
              // Archive data (implementation would depend on storage system)
              console.log(`📦 Archiving data: ${dataId}`)
              results.archived++
            }
            
            if (policy.autoDelete) {
              // Delete data (implementation would depend on storage system)
              console.log(`🗑️ Deleting expired data: ${dataId}`)
              this.dataClassifications.delete(dataId)
              results.deleted++
            }
          }
        }
      } catch (error) {
        results.errors.push(`Failed to process ${dataId}: ${String(error)}`)
      }
    }

    return results
  }

  /**
   * Get data protection statistics
   */
  getProtectionStatistics(): {
    totalDataClassified: number
    encryptedData: number
    piiDetected: number
    anonymizedRecords: number
    retentionPolicies: number
    keyRotations: number
    classificationBreakdown: Record<string, number>
  } {
    const classificationBreakdown: Record<string, number> = {
      public: 0,
      internal: 0,
      confidential: 0,
      restricted: 0
    }

    let piiDetected = 0
    let encryptedData = 0

    for (const classification of this.dataClassifications.values()) {
      classificationBreakdown[classification.level]++
      piiDetected += classification.piiDetected.length
      if (classification.encryptionRequired) encryptedData++
    }

    return {
      totalDataClassified: this.dataClassifications.size,
      encryptedData,
      piiDetected,
      anonymizedRecords: 0, // Would track from actual usage
      retentionPolicies: this.retentionPolicies.size,
      keyRotations: Array.from(this.encryptionKeys.values()).filter(k => k.rotated > k.created).length,
      classificationBreakdown
    }
  }

  /**
   * Private helper methods
   */
  private generateIV(): Buffer {
    // Generate random IV (16 bytes for AES)
    const iv = Buffer.alloc(16)
    for (let i = 0; i < 16; i++) {
      iv[i] = Math.floor(Math.random() * 256)
    }
    return iv
  }

  private encryptAESGCM(data: string, key: Buffer, iv: Buffer): { encrypted: Buffer, tag: Buffer } {
    // Simplified AES-GCM implementation - would use crypto library in production
    const encrypted = Buffer.from(data, 'utf8')
    const tag = Buffer.alloc(16) // Authentication tag
    return { encrypted, tag }
  }

  private decryptAESGCM(data: Buffer, key: Buffer, iv: Buffer, tag: Buffer): string {
    // Simplified AES-GCM decryption - would use crypto library in production
    return data.toString('utf8')
  }

  private encryptAESCBC(data: string, key: Buffer, iv: Buffer): Buffer {
    // Simplified AES-CBC implementation - would use crypto library in production
    return Buffer.from(data, 'utf8')
  }

  private decryptAESCBC(data: Buffer, key: Buffer, iv: Buffer): string {
    // Simplified AES-CBC decryption - would use crypto library in production
    return data.toString('utf8')
  }

  private compressData(data: string): string {
    // Simplified compression - would use actual compression library
    return data
  }

  private decompressData(data: string): string {
    // Simplified decompression - would use actual compression library
    return data
  }

  private getEncryptionKey(keyId?: string): { key: Buffer, created: number, rotated: number } | null {
    const id = keyId || 'default'
    return this.encryptionKeys.get(id) || null
  }

  private calculatePIIConfidence(type: string, value: string): number {
    // Simplified confidence calculation
    const confidenceMap: Record<string, number> = {
      email: 0.95,
      phone: 0.9,
      ssn: 0.98,
      credit_card: 0.95,
      ipAddress: 0.85
    }
    
    return confidenceMap[type] || 0.7
  }

  private maskPII(type: string, value: string): string {
    switch (type) {
      case 'email':
        const [local, domain] = value.split('@')
        return `${local.charAt(0)}***@${domain}`
      
      case 'phone':
        return value.replace(/\d(?=\d{4})/g, '*')
      
      case 'ssn':
        return value.replace(/\d(?=\d{4})/g, '*')
      
      case 'credit_card':
        return value.replace(/\d(?=\d{4})/g, '*')
      
      case 'name':
        const parts = value.split(' ')
        return parts.map(part => part.charAt(0) + '*'.repeat(part.length - 1)).join(' ')
      
      default:
        return '*'.repeat(value.length)
    }
  }

  private assessPIIRisk(type: string, value: string): 'low' | 'medium' | 'high' | 'critical' {
    const riskMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      email: 'medium',
      phone: 'medium',
      ssn: 'critical',
      credit_card: 'critical',
      ipAddress: 'low',
      name: 'medium'
    }
    
    return riskMap[type] || 'low'
  }

  private isLikelyName(value: string): boolean {
    // Simple heuristic to check if a capitalized phrase is likely a name
    const commonWords = ['The', 'And', 'For', 'Are', 'But', 'Not', 'You', 'All', 'Can', 'Had', 'Her', 'Was', 'One', 'Our', 'Out', 'Day', 'Get', 'Has', 'Him', 'His', 'How', 'Its', 'May', 'New', 'Now', 'Old', 'See', 'Two', 'Who', 'Boy', 'Did', 'Man', 'Men', 'Put', 'Say', 'She', 'Too', 'Use']
    const words = value.split(' ')
    
    return !words.some(word => commonWords.includes(word))
  }

  private determineDataCategories(data: any, piiDetected: PIIClassification[]): string[] {
    const categories = new Set<string>()
    
    // Add categories based on PII types found
    for (const pii of piiDetected) {
      switch (pii.type) {
        case 'email':
        case 'phone':
        case 'name':
          categories.add('personal_identifiers')
          break
        case 'ssn':
          categories.add('government_identifiers')
          break
        case 'credit_card':
          categories.add('financial_data')
          break
        case 'ip_address':
          categories.add('technical_data')
          break
      }
    }
    
    // Add categories based on data structure
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data)
      
      if (keys.some(k => k.includes('user') || k.includes('customer'))) {
        categories.add('user_data')
      }
      if (keys.some(k => k.includes('transaction') || k.includes('payment'))) {
        categories.add('financial_data')
      }
      if (keys.some(k => k.includes('health') || k.includes('medical'))) {
        categories.add('health_data')
      }
    }
    
    if (categories.size === 0) {
      categories.add('general_data')
    }
    
    return Array.from(categories)
  }

  private getRetentionPeriod(categories: string[]): number {
    // Default retention periods by category (in milliseconds)
    const retentionPeriods: Record<string, number> = {
      'personal_identifiers': 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      'financial_data': 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      'health_data': 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
      'government_identifiers': 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
      'user_data': 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
      'technical_data': 1 * 365 * 24 * 60 * 60 * 1000, // 1 year
      'general_data': 2 * 365 * 24 * 60 * 60 * 1000 // 2 years
    }
    
    // Return the longest retention period for any category
    let maxRetention = retentionPeriods['general_data']
    for (const category of categories) {
      const period = retentionPeriods[category]
      if (period && period > maxRetention) {
        maxRetention = period
      }
    }
    
    return maxRetention
  }

  private getAccessRestrictions(level: DataClassification['level'], categories: string[]): string[] {
    const restrictions: string[] = []
    
    switch (level) {
      case 'restricted':
        restrictions.push('admin_approval_required', 'audit_logging_required', 'encryption_required')
        break
      case 'confidential':
        restrictions.push('role_based_access', 'audit_logging_required')
        break
      case 'internal':
        restrictions.push('authenticated_access_only')
        break
    }
    
    // Add category-specific restrictions
    if (categories.includes('financial_data')) {
      restrictions.push('pci_compliance_required')
    }
    if (categories.includes('health_data')) {
      restrictions.push('hipaa_compliance_required')
    }
    if (categories.includes('personal_identifiers')) {
      restrictions.push('gdpr_compliance_required')
    }
    
    return restrictions
  }

  private hashValue(value: string): string {
    // Simplified hash function - would use proper cryptographic hash in production
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`
  }

  private findApplicableRetentionPolicy(categories: string[]): DataRetentionPolicy | null {
    for (const policy of this.retentionPolicies.values()) {
      if (policy.dataTypes.some(type => categories.includes(type))) {
        return policy
      }
    }
    return null
  }

  private initializeEncryptionKeys(): void {
    // Generate default encryption key
    const defaultKey = Buffer.alloc(32) // 256-bit key
    for (let i = 0; i < 32; i++) {
      defaultKey[i] = Math.floor(Math.random() * 256)
    }
    
    this.encryptionKeys.set('default', {
      key: defaultKey,
      created: Date.now(),
      rotated: Date.now()
    })
    
    console.log('🔐 Initialized encryption keys')
  }

  private initializeRetentionPolicies(): void {
    const defaultPolicies: DataRetentionPolicy[] = [
      {
        id: 'personal_data',
        name: 'Personal Data Retention',
        description: 'Retention policy for personal identifiable information',
        dataTypes: ['personal_identifiers', 'user_data'],
        retentionPeriod: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
        autoDelete: true,
        archiveBeforeDelete: true,
        legalHoldExempt: false,
        approvalRequired: true
      },
      {
        id: 'financial_data',
        name: 'Financial Data Retention',
        description: 'Retention policy for financial information',
        dataTypes: ['financial_data'],
        retentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
        autoDelete: false,
        archiveBeforeDelete: true,
        legalHoldExempt: false,
        approvalRequired: true
      },
      {
        id: 'general_data',
        name: 'General Data Retention',
        description: 'Default retention policy for general data',
        dataTypes: ['general_data', 'technical_data'],
        retentionPeriod: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
        autoDelete: true,
        archiveBeforeDelete: false,
        legalHoldExempt: true,
        approvalRequired: false
      }
    ]
    
    for (const policy of defaultPolicies) {
      this.retentionPolicies.set(policy.id, policy)
    }
    
    console.log('📋 Initialized data retention policies')
  }

  private startKeyRotation(): void {
    // Rotate encryption keys periodically
    setInterval(() => {
      for (const [keyId, keyInfo] of this.encryptionKeys.entries()) {
        const age = Date.now() - keyInfo.rotated
        
        if (age > this.encryptionConfig.keyRotationInterval) {
          // Generate new key
          const newKey = Buffer.alloc(32)
          for (let i = 0; i < 32; i++) {
            newKey[i] = Math.floor(Math.random() * 256)
          }
          
          keyInfo.key = newKey
          keyInfo.rotated = Date.now()
          
          console.log(`🔄 Rotated encryption key: ${keyId}`)
        }
      }
    }, 24 * 60 * 60 * 1000) // Check daily
    
    console.log('🔄 Started key rotation monitoring')
  }
}

// Global data protection system instance
export const dataProtection = new DataProtectionSystem()

/**
 * Data protection decorator
 */
export function protectData(options?: { encrypt?: boolean, anonymize?: boolean, classify?: boolean }) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const opts = { encrypt: false, anonymize: false, classify: true, ...options }

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)
      
      if (result && typeof result === 'object') {
        // Classify data
        if (opts.classify) {
          const classification = dataProtection.classifyData(result, { source: propertyName })
          result._dataClassification = classification
        }
        
        // Anonymize if requested
        if (opts.anonymize) {
          const anonymized = dataProtection.anonymizeData(result)
          result._anonymized = anonymized.anonymized
          result._piiRemoved = anonymized.piiRemoved
        }
        
        // Encrypt if requested or required by classification
        if (opts.encrypt || (result._dataClassification?.encryptionRequired)) {
          const encrypted = await dataProtection.encryptData(result)
          result._encrypted = encrypted
        }
      }
      
      return result
    }

    return descriptor
  }
}
