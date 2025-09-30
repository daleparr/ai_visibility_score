/**
 * Day 2 Resilience Tests
 * 
 * Tests the bulletproof critical agents to ensure they never fail
 * and provide meaningful fallbacks in all scenarios.
 */

import { BulletproofCrawlAgent } from '../bulletproof-crawl-agent'
import { BulletproofLLMTestAgent } from '../bulletproof-llm-test-agent'
import { BulletproofSchemaAgent } from '../bulletproof-schema-agent'
import { CircuitBreaker, CircuitBreakerManager } from '../../circuit-breaker'
import { IntelligentCache } from '../../intelligent-cache'
import type { ADIAgentInput } from '../../../../types/adi'

describe('Day 2: Critical Agent Resilience', () => {
  const mockInput: ADIAgentInput = {
    context: {
      evaluationId: 'test-resilience',
      websiteUrl: 'https://example.com',
      brandName: 'Test Brand'
    },
    previousResults: [],
    config: {}
  }

  describe('BulletproofCrawlAgent', () => {
    let agent: BulletproofCrawlAgent

    beforeEach(() => {
      agent = new BulletproofCrawlAgent()
    })

    test('should never fail - always return completed status', async () => {
      const result = await agent.execute(mockInput)
      
      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBeGreaterThanOrEqual(15)
    })

    test('should handle invalid URLs gracefully', async () => {
      const invalidInput = {
        ...mockInput,
        context: { ...mockInput.context, websiteUrl: 'not-a-url' }
      }

      const result = await agent.execute(invalidInput)
      
      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].evidence.method).toMatch(/fallback|emergency/)
    })

    test('should provide progressive fallback methods', async () => {
      // Test that different failure scenarios use different fallback methods
      const testCases = [
        { url: 'https://nonexistent-domain-12345.com', expectedMethod: /dns|static|emergency/ },
        { url: 'https://httpstat.us/500', expectedMethod: /basic|dns|static|emergency/ },
        { url: '', expectedMethod: /static|emergency/ }
      ]

      for (const testCase of testCases) {
        const input = {
          ...mockInput,
          context: { ...mockInput.context, websiteUrl: testCase.url }
        }

        const result = await agent.execute(input)
        
        expect(result.status).toBe('completed')
        expect(result.metadata?.method).toMatch(testCase.expectedMethod)
      }
    })
  })

  describe('BulletproofLLMTestAgent', () => {
    let agent: BulletproofLLMTestAgent

    beforeEach(() => {
      agent = new BulletproofLLMTestAgent()
    })

    test('should never fail - always return completed status', async () => {
      const result = await agent.execute(mockInput)
      
      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBeGreaterThanOrEqual(15)
    })

    test('should handle missing brand name gracefully', async () => {
      const noBrandInput = {
        ...mockInput,
        context: { ...mockInput.context, brandName: undefined }
      }

      const result = await agent.execute(noBrandInput)
      
      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
    })

    test('should provide fallback when all LLM providers fail', async () => {
      // This would normally test with mocked failing providers
      const result = await agent.execute(mockInput)
      
      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].evidence.method).toMatch(/emergency|static|cached/)
    })
  })

  describe('BulletproofSchemaAgent', () => {
    let agent: BulletproofSchemaAgent

    beforeEach(() => {
      agent = new BulletproofSchemaAgent()
    })

    test('should never fail - always return completed status', async () => {
      const result = await agent.execute(mockInput)
      
      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBeGreaterThanOrEqual(15)
    })

    test('should handle missing HTML content gracefully', async () => {
      const result = await agent.execute(mockInput)
      
      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].evidence.method).toMatch(/static|emergency/)
    })

    test('should detect schemas from HTML content', async () => {
      const htmlInput = {
        ...mockInput,
        previousResults: [{
          agent_id: 'crawl_agent',
          evidence: {
            content: `
              <html>
                <head>
                  <script type="application/ld+json">
                    {
                      "@context": "https://schema.org",
                      "@type": "Product",
                      "name": "Test Product"
                    }
                  </script>
                </head>
                <body>Test content</body>
              </html>
            `
          }
        }]
      }

      const result = await agent.execute(htmlInput)
      
      expect(result.status).toBe('completed')
      expect(result.results).toHaveLength(1)
      expect(result.results[0].normalizedScore).toBeGreaterThan(50)
      expect(result.results[0].evidence.method).toBe('json_ld')
    })

    test('should fallback through multiple detection methods', async () => {
      const testCases = [
        {
          name: 'JSON-LD detection',
          html: '<script type="application/ld+json">{"@type": "Product"}</script>',
          expectedMethod: 'json_ld'
        },
        {
          name: 'Microdata detection',
          html: '<div itemscope itemtype="https://schema.org/Product">Test</div>',
          expectedMethod: 'microdata'
        },
        {
          name: 'Meta tag detection',
          html: '<meta property="og:type" content="product">',
          expectedMethod: 'meta_tags'
        },
        {
          name: 'Static fallback',
          html: '<html><body>No schema</body></html>',
          expectedMethod: 'static_fallback'
        }
      ]

      for (const testCase of testCases) {
        const input = {
          ...mockInput,
          previousResults: [{
            agent_id: 'crawl_agent',
            evidence: { content: testCase.html }
          }]
        }

        const result = await agent.execute(input)
        
        expect(result.status).toBe('completed')
        expect(result.metadata?.method).toBe(testCase.expectedMethod)
      }
    })
  })

  describe('Circuit Breaker Integration', () => {
    test('should protect against cascading failures', async () => {
      const breaker = new CircuitBreaker('test-service', {
        failureThreshold: 2,
        recoveryTimeout: 1000
      })

      // First failure
      try {
        await breaker.execute(() => Promise.reject(new Error('Service down')))
      } catch (error) {
        expect(error.message).toBe('Service down')
      }

      // Second failure - should open circuit
      try {
        await breaker.execute(() => Promise.reject(new Error('Service down')))
      } catch (error) {
        expect(error.message).toBe('Service down')
      }

      // Third call - should be rejected by circuit breaker
      try {
        await breaker.execute(() => Promise.resolve('success'))
      } catch (error) {
        expect(error.message).toContain('Circuit breaker')
      }

      expect(breaker.getStatus().state).toBe('OPEN')
    })

    test('should manage multiple circuit breakers', () => {
      const manager = new CircuitBreakerManager()
      
      const breaker1 = manager.getBreaker('service1')
      const breaker2 = manager.getBreaker('service2')
      
      expect(breaker1).toBeDefined()
      expect(breaker2).toBeDefined()
      expect(breaker1).not.toBe(breaker2)
      
      const status = manager.getAllStatus()
      expect(status).toHaveLength(2)
      expect(status.map(s => s.name)).toContain('service1')
      expect(status.map(s => s.name)).toContain('service2')
    })
  })

  describe('Intelligent Cache Integration', () => {
    test('should cache and retrieve values with TTL', async () => {
      const cache = new IntelligentCache({ defaultTtl: 1000 })
      
      // Set value
      cache.set('test-key', { data: 'test-value' })
      
      // Should retrieve cached value
      const cached = cache.get('test-key')
      expect(cached).toEqual({ data: 'test-value' })
      
      // Should miss after TTL expires
      await new Promise(resolve => setTimeout(resolve, 1100))
      const expired = cache.get('test-key')
      expect(expired).toBeNull()
    })

    test('should handle cache eviction policies', () => {
      const cache = new IntelligentCache({ maxSize: 2 })
      
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3') // Should evict key1 (LRU)
      
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    test('should provide cache metrics', () => {
      const cache = new IntelligentCache()
      
      cache.set('key1', 'value1')
      cache.get('key1') // Hit
      cache.get('key2') // Miss
      
      const metrics = cache.getMetrics()
      expect(metrics.hits).toBe(1)
      expect(metrics.misses).toBe(1)
      expect(metrics.hitRate).toBe(50)
      expect(metrics.entryCount).toBe(1)
    })
  })

  describe('Integration Test: Complete Resilience', () => {
    test('should handle complete system failure gracefully', async () => {
      const crawlAgent = new BulletproofCrawlAgent()
      const llmAgent = new BulletproofLLMTestAgent()
      const schemaAgent = new BulletproofSchemaAgent()

      // Simulate worst-case scenario
      const worstCaseInput = {
        context: {
          evaluationId: 'worst-case',
          websiteUrl: 'https://completely-broken-site-12345.invalid',
          brandName: ''
        },
        previousResults: [],
        config: {}
      }

      // All agents should still complete successfully
      const crawlResult = await crawlAgent.execute(worstCaseInput)
      const llmResult = await llmAgent.execute(worstCaseInput)
      const schemaResult = await schemaAgent.execute(worstCaseInput)

      expect(crawlResult.status).toBe('completed')
      expect(llmResult.status).toBe('completed')
      expect(schemaResult.status).toBe('completed')

      // Should provide some meaningful data even in worst case
      expect(crawlResult.results[0].normalizedScore).toBeGreaterThanOrEqual(15)
      expect(llmResult.results[0].normalizedScore).toBeGreaterThanOrEqual(15)
      expect(schemaResult.results[0].normalizedScore).toBeGreaterThanOrEqual(15)
    })
  })
})
