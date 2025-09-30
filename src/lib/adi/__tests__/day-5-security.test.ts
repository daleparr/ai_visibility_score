/**
 * Day 5 Security & Compliance Tests
 * 
 * Tests the comprehensive security framework including authentication,
 * authorization, data protection, compliance, threat detection, and audit logging.
 */

import { SecurityFramework, securityFramework } from '../security-framework'
import { DataProtectionSystem, dataProtection } from '../data-protection'
import { ComplianceFramework, complianceFramework } from '../compliance-framework'
import { ThreatDetectionSystem, threatDetection } from '../threat-detection'
import { AuditLoggingSystem, auditLogging } from '../audit-logging'

describe('Day 5: Security & Compliance Systems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after tests
    // securityFramework doesn't have a stop method
    threatDetection.stop()
    auditLogging.stop()
  })

  describe('Security Framework', () => {
    test('should authenticate users with valid credentials', async () => {
      const security = new SecurityFramework()
      
      const result = await security.authenticate(
        'admin',
        'admin123',
        undefined,
        { ipAddress: '127.0.0.1', userAgent: 'test-agent' }
      )
      
      expect(result.success).toBe(true)
      expect(result.sessionId).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.user?.username).toBe('admin')
    })

    test('should reject invalid credentials', async () => {
      const security = new SecurityFramework()
      
      const result = await security.authenticate(
        'admin',
        'wrongpassword',
        undefined,
        { ipAddress: '127.0.0.1', userAgent: 'test-agent' }
      )
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.sessionId).toBeUndefined()
    })

    test('should validate sessions', async () => {
      const security = new SecurityFramework()
      
      const authResult = await security.authenticate(
        'admin',
        'admin123',
        undefined,
        { ipAddress: '127.0.0.1', userAgent: 'test-agent' }
      )
      
      expect(authResult.success).toBe(true)
      
      const context = security.validateSession(authResult.sessionId!)
      expect(context).toBeDefined()
      expect(context?.user.username).toBe('admin')
      expect(context?.permissions).toContain('*')
    })

    test('should check access permissions', () => {
      const security = new SecurityFramework()
      
      // Create a test user
      const user = security.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roles: ['viewer']
      })
      
      const accessResult = security.checkAccess({
        userId: user.id,
        resource: 'reports',
        action: 'read'
      })
      
      expect(accessResult.granted).toBe(true)
      expect(accessResult.userPermissions).toContain('read:reports')
    })

    test('should enforce rate limiting', () => {
      const security = new SecurityFramework()
      
      // Make multiple requests
      const results = []
      for (let i = 0; i < 5; i++) {
        results.push(security.checkRateLimit('test-ip'))
      }
      
      // All should be allowed initially
      expect(results.every(r => r.allowed)).toBe(true)
      
      // Check remaining counts
      expect(results[0].remaining).toBeGreaterThan(results[4].remaining)
    })

    test('should track security events', () => {
      const security = new SecurityFramework()
      
      const events = security.getSecurityEvents()
      expect(Array.isArray(events)).toBe(true)
      
      const stats = security.getSecurityStatistics()
      expect(stats.totalEvents).toBeGreaterThanOrEqual(0)
      expect(stats.eventsBySeverity).toBeDefined()
      expect(stats.eventsByType).toBeDefined()
    })
  })

  describe('Data Protection System', () => {
    test('should encrypt and decrypt data', async () => {
      const protection = new DataProtectionSystem()
      
      const originalData = { sensitive: 'information', user: 'john@example.com' }
      
      const encrypted = await protection.encryptData(originalData)
      expect(encrypted.data).toBeDefined()
      expect(encrypted.iv).toBeDefined()
      expect(encrypted.algorithm).toBeDefined()
      
      const decrypted = await protection.decryptData(encrypted)
      expect(decrypted).toEqual(originalData)
    })

    test('should detect PII in data', () => {
      const protection = new DataProtectionSystem()
      
      const testData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        ssn: '123-45-6789',
        content: 'Please contact me at john.doe@example.com or call 555-123-4567'
      }
      
      const piiDetected = protection.detectPII(testData)
      
      expect(piiDetected.length).toBeGreaterThan(0)
      
      const emailPII = piiDetected.find(pii => pii.type === 'email')
      expect(emailPII).toBeDefined()
      expect(emailPII?.value).toBe('john.doe@example.com')
      expect(emailPII?.masked).toContain('j***@example.com')
      
      const phonePII = piiDetected.find(pii => pii.type === 'phone')
      expect(phonePII).toBeDefined()
      expect(phonePII?.riskLevel).toBe('medium')
    })

    test('should classify data sensitivity', () => {
      const protection = new DataProtectionSystem()
      
      const sensitiveData = {
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        medicalRecord: 'Patient has diabetes'
      }
      
      const classification = protection.classifyData(sensitiveData)
      
      expect(classification.level).toBe('restricted')
      expect(classification.encryptionRequired).toBe(true)
      expect(classification.piiDetected.length).toBeGreaterThan(0)
      expect(classification.sensitivityScore).toBeGreaterThan(50)
    })

    test('should anonymize data', () => {
      const protection = new DataProtectionSystem()
      
      const originalData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
        publicInfo: 'This is public information'
      }
      
      const result = protection.anonymizeData(originalData)
      
      expect(result.anonymized.name).not.toBe('John Doe')
      expect(result.anonymized.email).toContain('***')
      expect(result.anonymized.phone).toContain('*')
      expect(result.anonymized.publicInfo).toBe('This is public information') // Unchanged
      expect(result.piiRemoved.length).toBeGreaterThan(0)
    })

    test('should provide protection statistics', () => {
      const protection = new DataProtectionSystem()
      
      const stats = protection.getProtectionStatistics()
      
      expect(stats).toBeDefined()
      expect(stats.totalDataClassified).toBeGreaterThanOrEqual(0)
      expect(stats.classificationBreakdown).toBeDefined()
      expect(stats.classificationBreakdown.public).toBeGreaterThanOrEqual(0)
      expect(stats.retentionPolicies).toBeGreaterThan(0)
    })
  })

  describe('Compliance Framework', () => {
    test('should check GDPR compliance', () => {
      const compliance = new ComplianceFramework()
      
      const gdprCompliance = compliance.checkCompliance('gdpr')
      
      expect(gdprCompliance).toBeDefined()
      expect(gdprCompliance.overallScore).toBeGreaterThanOrEqual(0)
      expect(gdprCompliance.overallScore).toBeLessThanOrEqual(100)
      expect(gdprCompliance.requirementResults.length).toBeGreaterThan(0)
      expect(Array.isArray(gdprCompliance.violations)).toBe(true)
      expect(Array.isArray(gdprCompliance.recommendations)).toBe(true)
    })

    test('should record and manage consent', () => {
      const compliance = new ComplianceFramework()
      
      const consent = compliance.recordConsent({
        dataSubjectId: 'user123',
        purposes: ['marketing', 'analytics'],
        dataTypes: ['email', 'usage_data'],
        consentGiven: true,
        consentDate: Date.now(),
        consentMethod: 'explicit',
        legalBasis: 'consent',
        retentionPeriod: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
        thirdPartySharing: false
      })
      
      expect(consent.id).toBeDefined()
      expect(consent.dataSubjectId).toBe('user123')
      expect(consent.consentGiven).toBe(true)
      
      // Withdraw consent
      const withdrawn = compliance.withdrawConsent('user123', ['marketing'])
      expect(withdrawn.length).toBe(1)
      expect(withdrawn[0].consentGiven).toBe(false)
      expect(withdrawn[0].withdrawalDate).toBeDefined()
    })

    test('should process data subject requests', async () => {
      const compliance = new ComplianceFramework()
      
      const request = await compliance.processDataSubjectRequest({
        dataSubjectId: 'user123',
        requestType: 'access',
        requestDate: Date.now(),
        requestDetails: 'Please provide all my personal data',
        verificationMethod: 'email_verification'
      })
      
      expect(request.id).toBeDefined()
      expect(request.status).toBe('completed')
      expect(request.responseDate).toBeDefined()
      expect(request.fulfillmentActions.length).toBeGreaterThan(0)
    })

    test('should check lawful basis for processing', () => {
      const compliance = new ComplianceFramework()
      
      // Record consent first
      compliance.recordConsent({
        dataSubjectId: 'user123',
        purposes: ['analytics'],
        dataTypes: ['usage_data'],
        consentGiven: true,
        consentDate: Date.now(),
        consentMethod: 'explicit',
        legalBasis: 'consent',
        retentionPeriod: 365 * 24 * 60 * 60 * 1000,
        thirdPartySharing: false
      })
      
      const lawfulBasis = compliance.checkLawfulBasis(
        'user123',
        ['analytics'],
        ['usage_data']
      )
      
      expect(lawfulBasis.lawful).toBe(true)
      expect(lawfulBasis.basis).toContain('consent')
      expect(lawfulBasis.consentStatus).toBe('given')
      expect(lawfulBasis.issues.length).toBe(0)
    })

    test('should generate compliance reports', () => {
      const compliance = new ComplianceFramework()
      
      const report = compliance.generateComplianceReport(
        'assessment',
        ['gdpr', 'ccpa'],
        { start: Date.now() - (30 * 24 * 60 * 60 * 1000), end: Date.now() }
      )
      
      expect(report.id).toBeDefined()
      expect(report.reportType).toBe('assessment')
      expect(report.overallCompliance).toBeGreaterThanOrEqual(0)
      expect(report.complianceByRegulation.gdpr).toBeDefined()
      expect(report.complianceByRegulation.ccpa).toBeDefined()
      expect(Array.isArray(report.recommendations)).toBe(true)
    })
  })

  describe('Threat Detection System', () => {
    test('should analyze security events for threats', () => {
      const detection = new ThreatDetectionSystem()
      
      const securityEvent = {
        type: 'login_attempt',
        source: {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          userId: 'user123'
        },
        target: {
          resource: 'authentication',
          action: 'login',
          data: { username: 'admin' }
        },
        timestamp: Date.now(),
        details: { attempts: 1, success: false }
      }
      
      const threats = detection.analyzeSecurityEvent(securityEvent)
      
      expect(Array.isArray(threats)).toBe(true)
      // Threats may or may not be detected depending on patterns
    })

    test('should update behavioral profiles', () => {
      const detection = new ThreatDetectionSystem()
      
      detection.updateBehavioralProfile('user123', {
        type: 'login',
        timestamp: Date.now(),
        ipAddress: '192.168.1.100'
      })
      
      detection.updateBehavioralProfile('user123', {
        type: 'action',
        timestamp: Date.now(),
        resource: 'reports',
        action: 'view'
      })
      
      // Profile should be created and updated
      // This is internal state, so we test through other methods
      const stats = detection.getThreatStatistics()
      expect(stats).toBeDefined()
    })

    test('should block IPs and suspend users', () => {
      const detection = new ThreatDetectionSystem()
      
      detection.blockIP('192.168.1.100', 'Suspicious activity')
      expect(detection.isIPBlocked('192.168.1.100')).toBe(true)
      expect(detection.isIPBlocked('192.168.1.101')).toBe(false)
      
      detection.suspendUser('user123', 'Multiple failed attempts')
      expect(detection.isUserSuspended('user123')).toBe(true)
      expect(detection.isUserSuspended('user456')).toBe(false)
    })

    test('should provide threat statistics', () => {
      const detection = new ThreatDetectionSystem()
      
      const stats = detection.getThreatStatistics()
      
      expect(stats).toBeDefined()
      expect(stats.timestamp).toBeGreaterThan(0)
      expect(stats.threatsDetected).toBeGreaterThanOrEqual(0)
      expect(stats.threatsBySeverity).toBeDefined()
      expect(stats.threatsByCategory).toBeDefined()
      expect(Array.isArray(stats.topAttackers)).toBe(true)
      expect(Array.isArray(stats.topTargets)).toBe(true)
    })

    test('should get active threats', () => {
      const detection = new ThreatDetectionSystem()
      
      const activeThreats = detection.getActiveThreats()
      
      expect(Array.isArray(activeThreats)).toBe(true)
      // May be empty if no threats detected
    })
  })

  describe('Audit Logging System', () => {
    test('should log audit events', () => {
      const audit = new AuditLoggingSystem()
      
      const event = audit.logEvent({
        eventType: 'authentication',
        category: 'user_login',
        action: 'login_attempt',
        actor: {
          userId: 'user123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0'
        },
        target: {
          resourceType: 'authentication_system',
          resourceName: 'login'
        },
        outcome: 'success',
        details: {
          description: 'User successfully logged in',
          metadata: { loginMethod: 'password' }
        },
        riskLevel: 'low',
        complianceRelevant: true,
        retentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000 // 7 years
      })
      
      expect(event.id).toBeDefined()
      expect(event.timestamp).toBeGreaterThan(0)
      expect(event.integrity.hash).toBeDefined()
      expect(event.eventType).toBe('authentication')
    })

    test('should query audit logs', () => {
      const audit = new AuditLoggingSystem()
      
      // Log some events first
      audit.logEvent({
        eventType: 'data_access',
        category: 'report_view',
        action: 'view_report',
        actor: { ipAddress: '192.168.1.100' },
        target: { resourceType: 'report', resourceId: 'report123' },
        outcome: 'success',
        details: { description: 'User viewed report' },
        riskLevel: 'low',
        complianceRelevant: false,
        retentionPeriod: 365 * 24 * 60 * 60 * 1000
      })
      
      const results = audit.queryLogs({
        eventTypes: ['data_access'],
        outcomes: ['success'],
        limit: 10
      })
      
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0].eventType).toBe('data_access')
    })

    test('should generate audit reports', () => {
      const audit = new AuditLoggingSystem()
      
      const report = audit.generateReport(
        'security',
        'Security Audit Report',
        'Monthly security event analysis',
        {
          eventTypes: ['security_event', 'authentication'],
          timeRange: { start: Date.now() - (30 * 24 * 60 * 60 * 1000), end: Date.now() }
        },
        'system'
      )
      
      expect(report.id).toBeDefined()
      expect(report.reportType).toBe('security')
      expect(report.title).toBe('Security Audit Report')
      expect(report.summary).toBeDefined()
      expect(report.summary.totalEvents).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(report.events)).toBe(true)
      expect(Array.isArray(report.insights)).toBe(true)
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    test('should verify log integrity', () => {
      const audit = new AuditLoggingSystem()
      
      // Log some events
      for (let i = 0; i < 5; i++) {
        audit.logEvent({
          eventType: 'data_access',
          category: 'test',
          action: `test_action_${i}`,
          actor: { ipAddress: '127.0.0.1' },
          target: { resourceType: 'test', resourceId: `test_${i}` },
          outcome: 'success',
          details: { description: `Test event ${i}` },
          riskLevel: 'low',
          complianceRelevant: false,
          retentionPeriod: 365 * 24 * 60 * 60 * 1000
        })
      }
      
      const integrityCheck = audit.verifyIntegrity()
      
      expect(integrityCheck).toBeDefined()
      expect(integrityCheck.totalLogs).toBeGreaterThanOrEqual(5)
      expect(integrityCheck.verifiedLogs).toBeGreaterThanOrEqual(5)
      expect(integrityCheck.integrityScore).toBe(100) // Should be perfect for new logs
      expect(integrityCheck.issues.length).toBe(0)
    })

    test('should provide audit statistics', () => {
      const audit = new AuditLoggingSystem()
      
      const stats = audit.getAuditStatistics()
      
      expect(stats).toBeDefined()
      expect(stats.totalEvents).toBeGreaterThanOrEqual(0)
      expect(stats.eventsByType).toBeDefined()
      expect(stats.eventsByOutcome).toBeDefined()
      expect(stats.eventsByRisk).toBeDefined()
      expect(Array.isArray(stats.topActors)).toBe(true)
      expect(Array.isArray(stats.topResources)).toBe(true)
      expect(stats.integrityScore).toBeGreaterThanOrEqual(0)
      expect(stats.integrityScore).toBeLessThanOrEqual(100)
    })
  })

  describe('Integration Tests', () => {
    test('should integrate all security systems', async () => {
      // Test complete security workflow
      const security = new SecurityFramework()
      const protection = new DataProtectionSystem()
      const compliance = new ComplianceFramework()
      const detection = new ThreatDetectionSystem()
      const audit = new AuditLoggingSystem()

      // 1. Authenticate user
      const authResult = await security.authenticate(
        'admin',
        'admin123',
        undefined,
        { ipAddress: '127.0.0.1', userAgent: 'test-integration' }
      )
      expect(authResult.success).toBe(true)

      // 2. Check access permissions
      const accessResult = security.checkAccess({
        userId: authResult.user!.id,
        resource: 'sensitive_data',
        action: 'read'
      })
      expect(accessResult.granted).toBe(true)

      // 3. Process sensitive data
      const sensitiveData = { email: 'user@example.com', ssn: '123-45-6789' }
      const classification = protection.classifyData(sensitiveData)
      expect(classification.encryptionRequired).toBe(true)

      // 4. Encrypt data
      const encrypted = await protection.encryptData(sensitiveData)
      expect(encrypted.data).toBeDefined()

      // 5. Record consent
      const consent = compliance.recordConsent({
        dataSubjectId: authResult.user!.id,
        purposes: ['data_processing'],
        dataTypes: ['personal_data'],
        consentGiven: true,
        consentDate: Date.now(),
        consentMethod: 'explicit',
        legalBasis: 'consent',
        retentionPeriod: 365 * 24 * 60 * 60 * 1000,
        thirdPartySharing: false
      })
      expect(consent.consentGiven).toBe(true)

      // 6. Analyze for threats
      const securityEvent = {
        type: 'data_access',
        source: {
          ipAddress: '127.0.0.1',
          userId: authResult.user!.id
        },
        target: {
          resource: 'sensitive_data',
          action: 'read'
        },
        timestamp: Date.now(),
        details: { classification: classification.level }
      }
      const threats = detection.analyzeSecurityEvent(securityEvent)
      expect(Array.isArray(threats)).toBe(true)

      // 7. Log audit event
      const auditEvent = audit.logEvent({
        eventType: 'data_access',
        category: 'sensitive_data_access',
        action: 'read_encrypted_data',
        actor: {
          userId: authResult.user!.id,
          ipAddress: '127.0.0.1',
          userAgent: 'test-integration'
        },
        target: {
          resourceType: 'sensitive_data',
          resourceName: 'user_pii'
        },
        outcome: 'success',
        details: {
          description: 'Successfully accessed encrypted sensitive data',
          metadata: { 
            classification: classification.level,
            encrypted: true,
            consentVerified: true
          }
        },
        riskLevel: 'medium',
        complianceRelevant: true,
        retentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000
      })
      expect(auditEvent.id).toBeDefined()

      console.log('✅ Security integration test completed successfully')
    })

    test('should handle security violations properly', async () => {
      const security = new SecurityFramework()
      const detection = new ThreatDetectionSystem()
      const audit = new AuditLoggingSystem()

      // Simulate multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        const result = await security.authenticate(
          'admin',
          'wrongpassword',
          undefined,
          { ipAddress: '192.168.1.100', userAgent: 'attacker-agent' }
        )
        expect(result.success).toBe(false)

        // Analyze as potential threat
        const threatEvent = {
          type: 'login_failure',
          source: {
            ipAddress: '192.168.1.100',
            userAgent: 'attacker-agent'
          },
          target: {
            resource: 'authentication',
            action: 'login'
          },
          timestamp: Date.now(),
          details: { attempt: i + 1, username: 'admin' }
        }
        detection.analyzeSecurityEvent(threatEvent)
      }

      // Check if IP was blocked (depends on threat detection rules)
      const stats = detection.getThreatStatistics()
      expect(stats.threatsDetected).toBeGreaterThanOrEqual(0)

      // Verify audit logs captured the attempts
      const auditStats = audit.getAuditStatistics()
      expect(auditStats.totalEvents).toBeGreaterThan(0)

      console.log('✅ Security violation handling test completed')
    })

    test('should maintain compliance during data processing', async () => {
      const protection = new DataProtectionSystem()
      const compliance = new ComplianceFramework()
      const audit = new AuditLoggingSystem()

      // Process personal data
      const personalData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
        preferences: { marketing: true, analytics: false }
      }

      // 1. Classify data
      const classification = protection.classifyData(personalData)
      expect(classification.piiDetected.length).toBeGreaterThan(0)

      // 2. Check lawful basis (should fail without consent)
      let lawfulBasis = compliance.checkLawfulBasis(
        'john_doe',
        ['marketing'],
        ['email', 'phone']
      )
      expect(lawfulBasis.lawful).toBe(false)
      expect(lawfulBasis.issues.length).toBeGreaterThan(0)

      // 3. Record consent
      compliance.recordConsent({
        dataSubjectId: 'john_doe',
        purposes: ['marketing', 'analytics'],
        dataTypes: ['email', 'phone', 'preferences'],
        consentGiven: true,
        consentDate: Date.now(),
        consentMethod: 'explicit',
        legalBasis: 'consent',
        retentionPeriod: 2 * 365 * 24 * 60 * 60 * 1000,
        thirdPartySharing: false
      })

      // 4. Re-check lawful basis (should pass now)
      lawfulBasis = compliance.checkLawfulBasis(
        'john_doe',
        ['marketing'],
        ['email', 'phone']
      )
      expect(lawfulBasis.lawful).toBe(true)
      expect(lawfulBasis.consentStatus).toBe('given')

      // 5. Anonymize data for analytics
      const anonymized = protection.anonymizeData(personalData)
      expect(anonymized.piiRemoved.length).toBeGreaterThan(0)

      // 6. Log compliance-relevant processing
      audit.logEvent({
        eventType: 'data_modification',
        category: 'data_anonymization',
        action: 'anonymize_personal_data',
        actor: { ipAddress: 'system' },
        target: {
          resourceType: 'personal_data',
          resourceId: 'john_doe'
        },
        outcome: 'success',
        details: {
          description: 'Personal data anonymized for analytics',
          beforeState: personalData,
          afterState: anonymized.anonymized,
          changes: anonymized.piiRemoved.map(pii => ({
            field: pii.location.field,
            oldValue: pii.value,
            newValue: pii.masked
          }))
        },
        riskLevel: 'low',
        complianceRelevant: true,
        retentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000
      })

      console.log('✅ Compliance during data processing test completed')
    })
  })
})
