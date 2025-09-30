/**
 * Bulletproof Score Aggregator Tests
 * 
 * Tests the bulletproof score aggregator in various failure scenarios
 * to ensure it NEVER fails completely.
 */

import { BulletproofScoreAggregatorAgent } from '../bulletproof-score-aggregator-agent'
import type { ADIAgentInput, ADIAgentOutput } from '../../../../types/adi'

describe('BulletproofScoreAggregatorAgent', () => {
  let aggregator: BulletproofScoreAggregatorAgent

  beforeEach(() => {
    aggregator = new BulletproofScoreAggregatorAgent()
  })

  describe('Emergency Fallback Scenarios', () => {
    test('should handle completely empty input', async () => {
      const input: ADIAgentInput = {
        context: {
          evaluationId: 'test-empty',
          websiteUrl: 'https://example.com',
          brandName: 'Test Brand'
        },
        previousResults: [],
        config: {}
      }

      const result = await aggregator.execute(input)

      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBe(25) // Emergency fallback score
      expect(result.results[0].confidenceLevel).toBe(0.1)
      expect(result.results[0].evidence.aggregationType).toBe('emergency_fallback')
    })

    test('should handle corrupted agent results', async () => {
      const input: ADIAgentInput = {
        context: {
          evaluationId: 'test-corrupted',
          websiteUrl: 'https://example.com',
          brandName: 'Test Brand'
        },
        previousResults: [
          { id: '1', normalized_score: NaN, evidence: null },
          { id: '2', normalized_score: -50, evidence: undefined },
          { id: '3', normalized_score: 150, evidence: {} }
        ],
        config: {}
      }

      const result = await aggregator.execute(input)

      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBe(25) // Should fallback to emergency
      expect(result.results[0].evidence.aggregationType).toBe('emergency_fallback')
    })
  })

  describe('Partial Aggregation Scenarios', () => {
    test('should handle partial valid data', async () => {
      const input: ADIAgentInput = {
        context: {
          evaluationId: 'test-partial',
          websiteUrl: 'https://example.com',
          brandName: 'Test Brand'
        },
        previousResults: [
          { 
            id: '1', 
            agent_id: 'crawl_agent',
            result_type: 'crawl_agent',
            normalized_score: 75, 
            confidence_level: 0.9,
            evidence: { url: 'https://example.com' } 
          },
          { 
            id: '2', 
            agent_id: 'schema_agent',
            result_type: 'schema_agent',
            normalized_score: 60, 
            confidence_level: 0.8,
            evidence: { hasSchema: true } 
          },
          { 
            id: '3', 
            normalized_score: NaN, // Invalid data
            evidence: null 
          }
        ],
        config: {}
      }

      const result = await aggregator.execute(input)

      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBeGreaterThan(25) // Should be better than emergency
      expect(result.results[0].normalizedScore).toBeLessThan(85) // But adjusted for partial data
      expect(result.results[0].evidence.aggregationType).toBe('partial')
      expect(result.results[0].evidence.dataCompleteness).toContain('2/')
    })

    test('should handle single agent success', async () => {
      const input: ADIAgentInput = {
        context: {
          evaluationId: 'test-single',
          websiteUrl: 'https://example.com',
          brandName: 'Test Brand'
        },
        previousResults: [
          { 
            id: '1', 
            agent_id: 'crawl_agent',
            result_type: 'crawl_agent',
            normalized_score: 80, 
            confidence_level: 0.9,
            evidence: { url: 'https://example.com' } 
          }
        ],
        config: {}
      }

      const result = await aggregator.execute(input)

      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBeGreaterThan(15)
      expect(result.results[0].normalizedScore).toBeLessThan(85)
      expect(result.results[0].evidence.aggregationType).toBe('partial')
    })
  })

  describe('Error Handling', () => {
    test('should never throw errors', async () => {
      const input: any = {
        context: null, // Invalid context
        previousResults: undefined,
        config: null
      }

      // This should not throw
      const result = await aggregator.execute(input)

      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBe(25)
      expect(result.results[0].evidence.aggregationType).toBe('emergency_fallback')
    })

    test('should handle execution errors gracefully', async () => {
      // Mock the full aggregation to throw an error
      const originalAttemptFull = (aggregator as any).attemptFullAggregation
      ;(aggregator as any).attemptFullAggregation = jest.fn().mockRejectedValue(new Error('Test error'))
      
      const input: ADIAgentInput = {
        context: {
          evaluationId: 'test-error',
          websiteUrl: 'https://example.com',
          brandName: 'Test Brand'
        },
        previousResults: [
          { 
            id: '1', 
            normalized_score: 70, 
            evidence: { test: true } 
          }
        ],
        config: {}
      }

      const result = await aggregator.execute(input)

      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      
      // Restore original method
      ;(aggregator as any).attemptFullAggregation = originalAttemptFull
    })
  })

  describe('Progressive Integration', () => {
    test('should provide metadata for progressive tracking', async () => {
      const input: ADIAgentInput = {
        context: {
          evaluationId: 'test-progressive',
          websiteUrl: 'https://example.com',
          brandName: 'Test Brand'
        },
        previousResults: [
          { 
            id: '1', 
            agent_id: 'crawl_agent',
            result_type: 'crawl_agent',
            normalized_score: 75, 
            confidence_level: 0.9,
            evidence: { url: 'https://example.com' } 
          }
        ],
        config: {}
      }

      const result = await aggregator.execute(input)

      expect(result.status).toBe('completed')
      expect(result.metadata).toBeDefined()
      expect(result.metadata?.aggregationType).toBeDefined()
      expect(result.metadata?.confidence).toBeDefined()
      expect(result.metadata?.dataQuality).toBeDefined()
    })
  })
})
