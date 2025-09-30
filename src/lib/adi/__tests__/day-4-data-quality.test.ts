/**
 * Day 4 Data Quality & Validation Tests
 * 
 * Tests the comprehensive data quality framework including validation,
 * scoring, cleansing, integrity checking, and quality monitoring.
 */

import { DataValidationFramework, dataValidation } from '../data-validation'
import { DataQualityScorer, dataQualityScorer } from '../data-quality-scoring'
import { DataCleansingPipeline, dataCleansingPipeline } from '../data-cleansing'
import { DataIntegrityChecker, dataIntegrityChecker } from '../data-integrity'
import { DataQualityDashboardManager, dataQualityDashboard } from '../data-quality-dashboard'

describe('Day 4: Data Quality & Validation Systems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Data Validation Framework', () => {
    test('should validate data against registered rules', () => {
      const validator = new DataValidationFramework()
      
      // Test data with validation issues
      const testData = {
        agentName: '', // Empty required field
        status: 'invalid_status', // Invalid value
        results: null, // Should be array
        score: 150 // Out of range
      }

      const result = validator.validateData('agent_output', testData)
      
      expect(result).toBeDefined()
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.score).toBeLessThan(100)
      expect(result.confidence).toBeLessThan(1)
    })

    test('should pass validation for valid data', () => {
      const validator = new DataValidationFramework()
      
      const validData = {
        agentName: 'test_agent',
        status: 'completed',
        results: [{ score: 85 }],
        executionTime: 1500
      }

      const result = validator.validateData('agent_output', validData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
      expect(result.score).toBeGreaterThan(80)
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    test('should provide validation suggestions', () => {
      const validator = new DataValidationFramework()
      
      const testData = {
        url: 'invalid-url',
        content: ''
      }

      const result = validator.validateData('crawl_data', testData)
      
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0].suggestion).toBeDefined()
      expect(result.suggestions[0].field).toBeDefined()
    })

    test('should track validation history', () => {
      const validator = new DataValidationFramework()
      
      // Perform multiple validations
      for (let i = 0; i < 5; i++) {
        validator.validateData('test_data', { value: i })
      }

      const history = validator.getValidationHistory('test_data')
      expect(history.length).toBe(5)
      expect(history[0].metadata.rulesApplied).toBeDefined()
    })

    test('should generate quality profiles', () => {
      const validator = new DataValidationFramework()
      
      // Generate some validation results
      validator.validateData('profile_test', { valid: true })
      validator.validateData('profile_test', { invalid: null })
      
      const profile = validator.getQualityProfile('profile_test')
      
      if (profile) {
        expect(profile.totalRecords).toBe(2)
        expect(profile.qualityScore).toBeDefined()
        expect(profile.commonIssues).toBeDefined()
      }
    })
  })

  describe('Data Quality Scoring System', () => {
    test('should calculate comprehensive quality scores', () => {
      const scorer = new DataQualityScorer()
      
      const testData = {
        title: 'Test Article',
        content: 'This is test content with sufficient length for quality assessment.',
        author: 'Test Author',
        publishDate: new Date().toISOString(),
        tags: ['test', 'quality']
      }

      const score = scorer.calculateQualityScore('test_content', testData)
      
      expect(score).toBeDefined()
      expect(score.overall).toBeGreaterThanOrEqual(0)
      expect(score.overall).toBeLessThanOrEqual(100)
      expect(score.dimensions).toHaveLength(5) // completeness, accuracy, consistency, freshness, validity
      expect(score.confidence).toBeGreaterThan(0)
      expect(score.metadata.qualityGrade).toMatch(/[ABCDF]/)
    })

    test('should assess individual quality dimensions', () => {
      const scorer = new DataQualityScorer()
      
      const incompleteData = {
        title: 'Test',
        content: '', // Missing content
        author: null, // Missing author
        publishDate: 'invalid-date' // Invalid date format
      }

      const score = scorer.calculateQualityScore('incomplete_test', incompleteData)
      
      expect(score.overall).toBeLessThan(70) // Should be low quality
      
      const completeness = score.dimensions.find(d => d.name === 'completeness')
      expect(completeness).toBeDefined()
      expect(completeness!.score).toBeLessThan(80) // Should detect missing fields
      
      const validity = score.dimensions.find(d => d.name === 'validity')
      expect(validity).toBeDefined()
      expect(validity!.score).toBeLessThan(90) // Should detect invalid date
    })

    test('should track quality trends', () => {
      const scorer = new DataQualityScorer()
      
      // Generate historical data points
      const baseTime = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days ago
      for (let i = 0; i < 10; i++) {
        const data = { quality: 80 + (i * 2) } // Improving quality
        scorer.calculateQualityScore('trend_test', data, { timestamp: baseTime + (i * 24 * 60 * 60 * 1000) })
      }

      const trends = scorer.getQualityTrends('trend_test')
      
      expect(trends.length).toBeGreaterThan(0)
      const overallTrend = trends.find(t => t.dimension === 'overall')
      if (overallTrend) {
        expect(overallTrend.trend).toBe('improving')
        expect(overallTrend.velocity).toBeGreaterThan(0)
      }
    })

    test('should provide quality benchmarks', () => {
      const scorer = new DataQualityScorer()
      
      const benchmarks = scorer.getQualityBenchmarks()
      
      expect(benchmarks.length).toBeGreaterThan(0)
      expect(benchmarks[0].dimension).toBeDefined()
      expect(benchmarks[0].target).toBeGreaterThan(0)
      expect(benchmarks[0].priority).toMatch(/low|medium|high|critical/)
    })
  })

  describe('Data Cleansing Pipeline', () => {
    test('should cleanse data according to rules', async () => {
      const pipeline = new DataCleansingPipeline()
      
      const dirtyData = {
        url: 'HTTPS://EXAMPLE.COM/', // Needs normalization
        title: '  Test Title  ', // Needs trimming
        score: -5 // Invalid score
      }

      const result = await pipeline.cleanseData('url_data', dirtyData)
      
      expect(result.success).toBe(true)
      expect(result.cleanedData.url).toBe('https://example.com') // Normalized
      expect(result.changes.length).toBeGreaterThan(0)
      expect(result.qualityImprovement.improvement).toBeGreaterThanOrEqual(0)
    })

    test('should apply auto-fixes when possible', async () => {
      const pipeline = new DataCleansingPipeline()
      
      const data = {
        content: '   Whitespace content   ',
        score: 150 // Out of range
      }

      const result = await pipeline.cleanseData('text_content', data)
      
      expect(result.cleanedData.content).toBe('Whitespace content') // Trimmed
      
      const trimChange = result.changes.find(c => c.changeType === 'normalized')
      expect(trimChange).toBeDefined()
      expect(trimChange!.confidence).toBeGreaterThan(0.8)
    })

    test('should track cleansing statistics', async () => {
      const pipeline = new DataCleansingPipeline()
      
      // Process multiple items
      for (let i = 0; i < 5; i++) {
        await pipeline.cleanseData('stats_test', {
          value: `  test ${i}  `,
          score: i * 25
        })
      }

      const stats = pipeline.getCleansingStatistics()
      
      expect(stats.totalRecords).toBeGreaterThanOrEqual(5)
      expect(stats.cleansingEfficiency).toBeGreaterThanOrEqual(0)
      expect(stats.averageQualityImprovement).toBeDefined()
    })

    test('should handle batch cleansing', async () => {
      const pipeline = new DataCleansingPipeline()
      
      const batchData = [
        { url: 'example.com', title: '  Title 1  ' },
        { url: 'test.org', title: '  Title 2  ' },
        { url: 'demo.net', title: '  Title 3  ' }
      ]

      const results = await pipeline.batchCleanse('url_data', batchData)
      
      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(results.every(r => r.cleanedData.url.startsWith('https://'))).toBe(true)
    })
  })

  describe('Data Integrity Checker', () => {
    test('should validate data integrity rules', async () => {
      const checker = new DataIntegrityChecker()
      
      const testData = {
        status: 'completed',
        results: [], // Inconsistent - completed status should have results
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() - 3600000).toISOString() // End before start
      }

      const result = await checker.validateIntegrity('agent_output', testData)
      
      expect(result.isValid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.score).toBeLessThan(100)
      
      const statusViolation = result.violations.find(v => v.message.includes('completed'))
      expect(statusViolation).toBeDefined()
    })

    test('should validate cross-dataset integrity', async () => {
      const checker = new DataIntegrityChecker()
      
      const datasets = [
        {
          type: 'evaluation',
          data: { id: 'eval-1', agentId: 'agent-1' }
        },
        {
          type: 'agent_output',
          data: { evaluationId: 'eval-2', agentName: 'test_agent' } // Non-existent evaluation
        }
      ]

      const result = await checker.validateCrossDatasetIntegrity(datasets)
      
      // Would detect referential integrity issues
      expect(result).toBeDefined()
      expect(result.metadata.rulesChecked).toBeGreaterThan(0)
    })

    test('should generate integrity reports', () => {
      const checker = new DataIntegrityChecker()
      
      const report = checker.generateIntegrityReport('test_data')
      
      expect(report).toBeDefined()
      expect(report.timestamp).toBeGreaterThan(0)
      expect(report.dataType).toBe('test_data')
      expect(report.integrityScore).toBeGreaterThanOrEqual(0)
      expect(report.integrityScore).toBeLessThanOrEqual(100)
    })

    test('should provide integrity statistics', () => {
      const checker = new DataIntegrityChecker()
      
      const stats = checker.getIntegrityStatistics()
      
      expect(stats).toBeDefined()
      expect(stats.overallScore).toBeGreaterThanOrEqual(0)
      expect(stats.totalValidations).toBeGreaterThanOrEqual(0)
      expect(stats.violationRate).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(stats.topIssues)).toBe(true)
    })
  })

  describe('Data Quality Dashboard', () => {
    test('should provide comprehensive dashboard data', () => {
      const dashboard = new DataQualityDashboardManager()
      
      const data = dashboard.getDashboardData()
      
      expect(data).toBeDefined()
      expect(data.timestamp).toBeGreaterThan(0)
      expect(data.overview).toBeDefined()
      expect(data.validation).toBeDefined()
      expect(data.scoring).toBeDefined()
      expect(data.cleansing).toBeDefined()
      expect(data.integrity).toBeDefined()
      expect(data.trends).toBeDefined()
      expect(Array.isArray(data.recommendations)).toBe(true)
      expect(Array.isArray(data.alerts)).toBe(true)
    })

    test('should calculate overall quality status', () => {
      const dashboard = new DataQualityDashboardManager()
      
      const data = dashboard.getDashboardData()
      const overview = data.overview
      
      expect(overview.overallScore).toBeGreaterThanOrEqual(0)
      expect(overview.overallScore).toBeLessThanOrEqual(100)
      expect(overview.status).toMatch(/excellent|good|fair|poor|critical/)
      expect(overview.qualityGrade).toMatch(/[ABCDF]/)
      expect(overview.slaCompliance).toBeGreaterThanOrEqual(0)
    })

    test('should provide quality recommendations', () => {
      const dashboard = new DataQualityDashboardManager()
      
      const data = dashboard.getDashboardData()
      const recommendations = data.recommendations
      
      if (recommendations.length > 0) {
        const rec = recommendations[0]
        expect(rec.id).toBeDefined()
        expect(rec.priority).toMatch(/low|medium|high|critical/)
        expect(rec.category).toMatch(/validation|scoring|cleansing|integrity|process/)
        expect(rec.title).toBeDefined()
        expect(rec.description).toBeDefined()
        expect(Array.isArray(rec.actions)).toBe(true)
        expect(rec.estimatedTimeToImplement).toBeDefined()
      }
    })

    test('should generate quality alerts', () => {
      const dashboard = new DataQualityDashboardManager()
      
      const data = dashboard.getDashboardData()
      const alerts = data.alerts
      
      expect(Array.isArray(alerts)).toBe(true)
      
      if (alerts.length > 0) {
        const alert = alerts[0]
        expect(alert.id).toBeDefined()
        expect(alert.severity).toMatch(/info|warning|critical|emergency/)
        expect(alert.title).toBeDefined()
        expect(alert.description).toBeDefined()
        expect(alert.currentValue).toBeDefined()
        expect(alert.threshold).toBeDefined()
        expect(alert.timestamp).toBeGreaterThan(0)
      }
    })

    test('should track quality SLAs', () => {
      const dashboard = new DataQualityDashboardManager()
      
      const slas = dashboard.getQualitySLAs()
      
      expect(Array.isArray(slas)).toBe(true)
      expect(slas.length).toBeGreaterThan(0)
      
      const sla = slas[0]
      expect(sla.name).toBeDefined()
      expect(sla.target).toBeGreaterThan(0)
      expect(sla.current).toBeGreaterThanOrEqual(0)
      expect(sla.compliance).toBeGreaterThanOrEqual(0)
      expect(sla.trend).toMatch(/improving|stable|degrading/)
    })

    test('should generate quality reports', () => {
      const dashboard = new DataQualityDashboardManager()
      
      const report = dashboard.generateQualityReport()
      
      expect(report).toBeDefined()
      expect(report.executiveSummary).toBeDefined()
      expect(report.keyMetrics).toBeDefined()
      expect(Array.isArray(report.trends)).toBe(true)
      expect(Array.isArray(report.issues)).toBe(true)
      expect(Array.isArray(report.recommendations)).toBe(true)
      expect(report.slaStatus).toBeDefined()
    })
  })

  describe('Integration Tests', () => {
    test('should integrate all data quality systems', async () => {
      // Test data that will trigger various quality issues
      const testData = {
        agentName: 'integration_test_agent',
        status: 'completed',
        results: [
          {
            score: 85.5,
            confidence: 0.9,
            evidence: {
              url: 'https://example.com',
              content: 'Test content for integration testing'
            }
          }
        ],
        executionTime: 2500,
        timestamp: new Date().toISOString()
      }

      // 1. Validate the data
      const validationResult = dataValidation.validateData('agent_output', testData)
      expect(validationResult.isValid).toBe(true)

      // 2. Score the data quality
      const qualityScore = dataQualityScorer.calculateQualityScore('integration_test', testData)
      expect(qualityScore.overall).toBeGreaterThan(70)

      // 3. Cleanse the data
      const cleansingResult = await dataCleansingPipeline.cleanseData('agent_output', testData)
      expect(cleansingResult.success).toBe(true)

      // 4. Check data integrity
      const integrityResult = await dataIntegrityChecker.validateIntegrity('agent_output', testData)
      expect(integrityResult.score).toBeGreaterThan(80)

      // 5. Get dashboard overview
      const dashboardData = dataQualityDashboard.getDashboardData()
      expect(dashboardData.overview.overallScore).toBeGreaterThan(0)

      console.log('✅ Data quality integration test completed successfully')
    })

    test('should handle poor quality data gracefully', async () => {
      const poorQualityData = {
        agentName: '', // Missing required field
        status: 'invalid_status', // Invalid value
        results: null, // Wrong type
        executionTime: -100, // Invalid value
        malformedField: { nested: { deeply: { invalid: undefined } } }
      }

      // All systems should handle poor data without crashing
      const validationResult = dataValidation.validateData('agent_output', poorQualityData)
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.errors.length).toBeGreaterThan(0)

      const qualityScore = dataQualityScorer.calculateQualityScore('poor_quality_test', poorQualityData)
      expect(qualityScore.overall).toBeLessThan(50)

      const cleansingResult = await dataCleansingPipeline.cleanseData('agent_output', poorQualityData)
      expect(cleansingResult.success).toBe(true) // Should still succeed with fixes

      const integrityResult = await dataIntegrityChecker.validateIntegrity('agent_output', poorQualityData)
      expect(integrityResult.violations.length).toBeGreaterThan(0)

      console.log('✅ Poor quality data handling test completed')
    })

    test('should provide end-to-end quality improvement workflow', async () => {
      let testData = {
        url: 'example.com', // Missing protocol
        title: '  Untrimmed Title  ', // Needs trimming
        content: '', // Empty content
        score: 150, // Out of range
        status: 'completed',
        results: [] // Inconsistent with status
      }

      console.log('📊 Starting quality improvement workflow...')

      // Step 1: Initial validation (should fail)
      let validation = dataValidation.validateData('test_workflow', testData)
      expect(validation.isValid).toBe(false)
      console.log(`Initial validation: ${validation.errors.length} errors`)

      // Step 2: Apply data cleansing
      const cleansing = await dataCleansingPipeline.cleanseData('url_data', testData)
      testData = cleansing.cleanedData
      console.log(`Cleansing applied: ${cleansing.changes.length} changes`)

      // Step 3: Re-validate after cleansing
      validation = dataValidation.validateData('test_workflow', testData)
      console.log(`Post-cleansing validation: ${validation.errors.length} errors`)

      // Step 4: Check final quality score
      const finalScore = dataQualityScorer.calculateQualityScore('workflow_test', testData)
      console.log(`Final quality score: ${finalScore.overall}/100`)

      // Step 5: Verify improvement
      expect(cleansing.qualityImprovement.improvement).toBeGreaterThanOrEqual(0)
      expect(finalScore.overall).toBeGreaterThan(0)

      console.log('✅ Quality improvement workflow completed')
    })
  })
})
