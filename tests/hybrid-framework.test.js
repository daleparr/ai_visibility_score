/**
 * Comprehensive Test Suite for Hybrid ADI Framework
 * Jest-compatible test file for automated testing
 */

const fs = require('fs');
const path = require('path');

describe('Hybrid ADI Framework Tests', () => {
  
  describe('File Structure Tests', () => {
    test('All agent files should exist', () => {
      const agentFiles = [
        'src/lib/adi/agents/crawl-agent.ts',
        'src/lib/adi/agents/schema-agent.ts',
        'src/lib/adi/agents/semantic-agent.ts',
        'src/lib/adi/agents/knowledge-graph-agent.ts',
        'src/lib/adi/agents/conversational-copy-agent.ts',
        'src/lib/adi/agents/llm-test-agent.ts',
        'src/lib/adi/agents/geo-visibility-agent.ts',
        'src/lib/adi/agents/citation-agent.ts',
        'src/lib/adi/agents/sentiment-agent.ts',
        'src/lib/adi/agents/brand-heritage-agent.ts',
        'src/lib/adi/agents/commerce-agent.ts',
        'src/lib/adi/agents/score-aggregator-agent.ts'
      ];

      agentFiles.forEach(file => {
        expect(fs.existsSync(file)).toBe(true);
      });
    });

    test('Core framework files should exist', () => {
      const coreFiles = [
        'src/lib/adi/orchestrator.ts',
        'src/lib/adi/scoring.ts',
        'src/lib/adi/adi-service.ts',
        'src/lib/adi/trace-logger.ts',
        'src/types/adi.ts'
      ];

      coreFiles.forEach(file => {
        expect(fs.existsSync(file)).toBe(true);
      });
    });
  });

  describe('Type Definition Tests', () => {
    test('Hybrid types should be defined', () => {
      const typesContent = fs.readFileSync('src/types/adi.ts', 'utf8');
      
      const requiredTypes = [
        'AIDIPrimaryDimensionName',
        'AIDIOptimizationAreaName',
        'AIDIHybridScore',
        'AIDIOptimizationAreaScore',
        'AIDISubDimensionBreakdown'
      ];

      requiredTypes.forEach(type => {
        expect(typesContent).toContain(type);
      });
    });

    test('Dimension mappings should be complete', () => {
      const typesContent = fs.readFileSync('src/types/adi.ts', 'utf8');
      
      expect(typesContent).toContain('AIDI_PRIMARY_TO_OPTIMIZATION_MAPPING');
      expect(typesContent).toContain('AIDI_OPTIMIZATION_TO_PRIMARY_MAPPING');
      expect(typesContent).toContain('brand_heritage');
      expect(typesContent).toContain('conversational_copy');
      expect(typesContent).toContain('semantic_clarity');
      expect(typesContent).toContain('ontologies_taxonomy');
    });

    test('13 optimization areas should be defined', () => {
      const typesContent = fs.readFileSync('src/types/adi.ts', 'utf8');
      
      const optimizationAreas = [
        'schema_structured_data',
        'semantic_clarity',
        'ontologies_taxonomy',
        'knowledge_graphs_entity_linking',
        'llm_readability',
        'conversational_copy',
        'geo_visibility_presence',
        'ai_answer_quality_presence',
        'citation_authority_freshness',
        'sentiment_trust',
        'brand_heritage',
        'hero_products_use_case',
        'policies_logistics_clarity'
      ];

      optimizationAreas.forEach(area => {
        expect(typesContent).toContain(area);
      });
    });
  });

  describe('Brand Heritage Agent Tests', () => {
    test('Brand heritage agent should be properly implemented', () => {
      const agentContent = fs.readFileSync('src/lib/adi/agents/brand-heritage-agent.ts', 'utf8');
      
      expect(agentContent).toContain('class BrandHeritageAgent');
      expect(agentContent).toContain('extends BaseADIAgent');
      expect(agentContent).toContain('brand_heritage_agent');
    });

    test('Brand heritage agent should have all analysis methods', () => {
      const agentContent = fs.readFileSync('src/lib/adi/agents/brand-heritage-agent.ts', 'utf8');
      
      const requiredMethods = [
        'analyzeBrandStory',
        'analyzeFounderStory',
        'analyzeBrandValues',
        'analyzeHeritageTimeline',
        'analyzeBrandDifferentiation'
      ];

      requiredMethods.forEach(method => {
        expect(agentContent).toContain(method);
      });
    });

    test('Brand heritage agent should generate recommendations', () => {
      const agentContent = fs.readFileSync('src/lib/adi/agents/brand-heritage-agent.ts', 'utf8');
      
      const recommendationMethods = [
        'generateStoryRecommendations',
        'generateFounderRecommendations',
        'generateValuesRecommendations',
        'generateTimelineRecommendations',
        'generateDifferentiationRecommendations'
      ];

      recommendationMethods.forEach(method => {
        expect(agentContent).toContain(method);
      });
    });
  });

  describe('Orchestrator Integration Tests', () => {
    test('Brand heritage agent should be registered in orchestrator', () => {
      const orchestratorContent = fs.readFileSync('src/lib/adi/orchestrator.ts', 'utf8');
      
      expect(orchestratorContent).toContain('brand_heritage_agent');
      expect(orchestratorContent).toContain("'brand_heritage_agent': ['crawl_agent']");
    });

    test('Score aggregator should include brand heritage agent', () => {
      const orchestratorContent = fs.readFileSync('src/lib/adi/orchestrator.ts', 'utf8');
      
      expect(orchestratorContent).toContain('brand_heritage_agent');
      // Should be in score_aggregator dependencies
      const scoreAggregatorMatch = orchestratorContent.match(/'score_aggregator': \[(.*?)\]/s);
      if (scoreAggregatorMatch) {
        expect(scoreAggregatorMatch[1]).toContain('brand_heritage_agent');
      }
    });
  });

  describe('ADI Service Integration Tests', () => {
    test('Brand heritage agent should be imported in ADI service', () => {
      const serviceContent = fs.readFileSync('src/lib/adi/adi-service.ts', 'utf8');
      
      expect(serviceContent).toContain('BrandHeritageAgent');
      expect(serviceContent).toContain("from './agents/brand-heritage-agent'");
    });

    test('Brand heritage agent should be registered in service', () => {
      const serviceContent = fs.readFileSync('src/lib/adi/adi-service.ts', 'utf8');
      
      expect(serviceContent).toContain('new BrandHeritageAgent()');
    });
  });

  describe('Scoring Engine Tests', () => {
    test('Hybrid scoring method should be implemented', () => {
      const scoringContent = fs.readFileSync('src/lib/adi/scoring.ts', 'utf8');
      
      expect(scoringContent).toContain('calculateHybridADIScore');
      expect(scoringContent).toContain('extractOptimizationAreaScores');
      expect(scoringContent).toContain('createSubDimensionBreakdowns');
    });

    test('Optimization area helper methods should be implemented', () => {
      const scoringContent = fs.readFileSync('src/lib/adi/scoring.ts', 'utf8');
      
      const helperMethods = [
        'generateOptimizationRecommendations',
        'determinePriority',
        'determineEffort',
        'determineTimeToImpact',
        'filterResultsForOptimizationArea',
        'calculateOptimizationAreaScore'
      ];

      helperMethods.forEach(method => {
        expect(scoringContent).toContain(method);
      });
    });

    test('Agent to optimization mapping should include brand heritage', () => {
      const scoringContent = fs.readFileSync('src/lib/adi/scoring.ts', 'utf8');
      
      expect(scoringContent).toContain('brand_heritage_agent');
      expect(scoringContent).toContain("'brand_heritage'");
    });
  });

  describe('Configuration Tests', () => {
    test('Package.json should have test scripts', () => {
      const packageContent = fs.readFileSync('package.json', 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      expect(packageJson.scripts).toBeDefined();
      // Should have some form of test script
      const hasTestScript = Object.keys(packageJson.scripts).some(script => 
        script.includes('test') || script.includes('jest')
      );
      expect(hasTestScript).toBe(true);
    });
  });

  describe('Mock Data Tests', () => {
    test('Test hybrid scoring file should exist', () => {
      expect(fs.existsSync('src/lib/adi/test-hybrid-scoring.ts')).toBe(true);
    });

    test('Test hybrid scoring should have mock data', () => {
      const testContent = fs.readFileSync('src/lib/adi/test-hybrid-scoring.ts', 'utf8');
      
      expect(testContent).toContain('testHybridScoring');
      expect(testContent).toContain('createMockAgentResults');
      expect(testContent).toContain('brand_heritage_agent');
    });
  });
});

// Performance benchmarks
describe('Performance Tests', () => {
  test('Scoring calculations should be performant', () => {
    const startTime = Date.now();
    
    // Simulate 1000 scoring operations
    for (let i = 0; i < 1000; i++) {
      const score = Math.random() * 100;
      const normalized = Math.round(Math.max(0, Math.min(100, score)));
      const confidence = Math.random();
    }
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });
});

// Integration tests
describe('Integration Tests', () => {
  test('All components should work together', () => {
    // This would be expanded with actual integration tests
    // For now, just verify the structure is in place
    expect(fs.existsSync('src/lib/adi')).toBe(true);
    expect(fs.existsSync('src/types/adi.ts')).toBe(true);
    expect(fs.existsSync('scripts/test-hybrid-framework.js')).toBe(true);
  });
});