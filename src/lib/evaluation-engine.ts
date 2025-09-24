// CACHE BUSTER: 2025-09-23T14:23:00Z
import { AIProviderClient, EVALUATION_PROMPTS, BRAND_RECOGNITION_PROMPTS, extractScoreFromResponse, fetchWebsiteContent } from './ai-providers'
import {
  calculateOverallScore,
  calculatePillarScores,
  getGradeFromScore,
  generateVerdict,
  identifyDimensionExtremes,
  generateRecommendations
} from './scoring'
import {
  getBrand,
  createEvaluation,
  updateEvaluation,
  createDimensionScore,
  createEvaluationResult,
  createRecommendation,
  getSubscriptionByUserId
} from './database'
import type { Brand, Evaluation, DimensionScore } from '@/lib/db/schema'
import type { EvaluationResult, AIProviderName } from '@/lib/ai-providers'
import { SelectiveFetchAgent } from './adapters/selective-fetch-agent'
import { ProbeHarness } from './adi/probe-harness'
import { coreProbes } from './adi/probes'
import { mapProbesToDimensionScores } from './adi/score-adapter'
import { createPageBlob, createProbeRun } from './database'
export const DEBUG_VERSION = "v1.0.0-final-fix";

export interface EvaluationConfig {
  brandId: string
  userId: string
  enabledProviders: AIProviderName[]
  testCompetitors: boolean
  competitorUrls?: string[]
  infraMode?: 'legacy_crawl' | 'hybrid'
  forceFullEvaluation?: boolean
}

export interface EvaluationProgress {
  currentStep: string
  completedSteps: number
  totalSteps: number
  percentage: number
  currentProvider?: string
  currentDimension?: string
}

export class EvaluationEngine {
  private config: EvaluationConfig
  private progressCallback?: (progress: EvaluationProgress) => void
  private aiClients: Map<AIProviderName, AIProviderClient> = new Map()

  constructor(config: EvaluationConfig, progressCallback?: (progress: EvaluationProgress) => void) {
    // Force hybrid mode to bypass broken legacy crawl path
    this.config = { ...config, infraMode: 'hybrid' };
    this.progressCallback = progressCallback
  }

  async initialize(): Promise<void> {
    // Load AI provider configurations for the user from database
    const providers: any[] = []
    
    for (const provider of providers) {
      if (provider.is_active && provider.api_key_encrypted && 
          this.config.enabledProviders.includes(provider.provider_name as AIProviderName)) {
        
        // In a real implementation, you would decrypt the API key here
        const decryptedApiKey = this.decryptApiKey(provider.api_key_encrypted)
        
        const client = new AIProviderClient(
          provider.provider_name as AIProviderName, 
          decryptedApiKey
        )
        
        this.aiClients.set(provider.provider_name as AIProviderName, client)
      }
    }

    // Use available API keys - prioritize Anthropic if OpenAI not available
    if (this.aiClients.size === 0) {
      if (process.env.OPENAI_API_KEY) {
        this.aiClients.set('openai', new AIProviderClient('openai', process.env.OPENAI_API_KEY))
      } else if (process.env.ANTHROPIC_API_KEY) {
        this.aiClients.set('anthropic', new AIProviderClient('anthropic', process.env.ANTHROPIC_API_KEY))
        console.log('🤖 [AI] Using Anthropic as primary provider (OpenAI key not found)')
      } else if (process.env.GOOGLE_AI_API_KEY) {
        this.aiClients.set('google', new AIProviderClient('google', process.env.GOOGLE_AI_API_KEY))
        console.log('🤖 [AI] Using Google AI as primary provider (OpenAI/Anthropic keys not found)')
      } else {
        console.error('🚨 [AI] No API keys available for any AI provider!')
        throw new Error('No AI provider API keys configured')
      }
    }
  }

  async runEvaluation(brand: Brand): Promise<Evaluation> {
    // Create initial evaluation record
    const evaluation = await createEvaluation({
      brandId: brand.id,
      status: 'running',
      startedAt: new Date()
    })

    try {
      this.updateProgress('Initializing evaluation...', 0, 100)

      const subscription = await getSubscriptionByUserId(brand.userId);
      let brandPlaybook = null;
      if (subscription && subscription.tier === 'enterprise') {
        // We still want to proceed even if this fails, so we wrap it
        try {
          brandPlaybook = await this.runBrandPlaybookAnalysis(brand);
        } catch (playbookError) {
          console.warn(`[Enterprise Playbook] Failed to process playbook for ${brand.name}, but continuing evaluation.`, playbookError);
        }
      }

      // Calculate total steps for progress tracking
      const totalDimensions = Object.keys(EVALUATION_PROMPTS.infrastructure).length +
                             Object.keys(EVALUATION_PROMPTS.perception).length +
                             Object.keys(EVALUATION_PROMPTS.commerce).length
      const providerStepMultiplier = Math.max(1, this.aiClients.size)
      const totalSteps = totalDimensions * providerStepMultiplier

      let completedSteps = 0
      const dimensionResults: DimensionScore[] = []
      const evaluationResults: EvaluationResult[] = []

      // Run infrastructure tests
      console.log('[DEBUG] Forcing hybrid infrastructure evaluation path...');
      const hybridDimResults = await this.evaluateInfrastructureHybrid(evaluation.id, brand);
      dimensionResults.push(...hybridDimResults);
      completedSteps += Object.keys(EVALUATION_PROMPTS.infrastructure).length * providerStepMultiplier;
      this.updateProgress('Completed Infrastructure Pillar (Hybrid)', completedSteps, totalSteps);

      // [PRODUCTION OPTIMIZATION] Enable full three-pillar evaluation by default
      console.log('[OPTIMIZATION] Enabling full three-pillar evaluation for production');
      
      const perceptionResults = await this.evaluatePromptPillar(
        evaluation.id,
        brand,
        'perception',
        brandPlaybook,
        (dimensionName) => {
          completedSteps += providerStepMultiplier;
          this.updateProgress(
            `Completed Perception dimension: ${dimensionName.replace(/_/g, ' ')}`,
            completedSteps,
            totalSteps
          );
        }
      );
      dimensionResults.push(...perceptionResults);

      const commerceResults = await this.evaluatePromptPillar(
        evaluation.id,
        brand,
        'commerce',
        brandPlaybook,
        (dimensionName) => {
          completedSteps += providerStepMultiplier;
          this.updateProgress(
            `Completed Commerce dimension: ${dimensionName.replace(/_/g, ' ')}`,
            completedSteps,
            totalSteps
          );
        }
      );
      dimensionResults.push(...commerceResults);
      
      // Only skip perception/commerce if explicitly requested for testing
      if (this.config.infraMode === 'legacy_crawl' && !this.config.forceFullEvaluation) {
        console.log('[DEBUG] Legacy mode - running infrastructure only for compatibility');
      }

      // Calculate final scores
      this.updateProgress('Calculating final scores...', completedSteps, totalSteps)
      
      const overallScore = calculateOverallScore(dimensionResults, brandPlaybook)
      const grade = getGradeFromScore(overallScore)
      const verdict = generateVerdict(overallScore, brand.name)
      const { strongest, weakest, biggestOpportunity } = identifyDimensionExtremes(dimensionResults)

      // Generate recommendations
      this.updateProgress('Generating recommendations...', completedSteps, totalSteps)
      const recommendations = generateRecommendations(dimensionResults, brand.name)
      
      // [OPTIMIZATION] Re-enable recommendations with error handling
      console.log('[OPTIMIZATION] Attempting to save recommendations with enhanced error handling...');
      for (const rec of recommendations) {
        try {
          await createRecommendation({
            evaluationId: evaluation.id,
            priority: rec.priority,
            title: rec.title,
            description: rec.description,
            impactLevel: rec.impact,
            effortLevel: rec.effort,
            category: rec.category
          })
        } catch (error) {
          console.warn(`[DB_WARNING] Failed to save recommendation: ${rec.title}. Error:`, error);
          // Continue with other recommendations even if one fails
        }
      }

      // Update evaluation with final results
      const completedEvaluation = await updateEvaluation(evaluation.id, {
        status: 'completed',
        overallScore: overallScore,
        grade,
        verdict,
        strongestDimension: strongest,
        weakestDimension: weakest,
        biggestOpportunity: biggestOpportunity,
        completedAt: new Date()
      })

      this.updateProgress('Evaluation completed!', totalSteps, totalSteps)
      
      return completedEvaluation as any

    } catch (error) {
      // Mark evaluation as failed
      await updateEvaluation(evaluation.id, {
        status: 'failed',
        completedAt: new Date()
      })
      
      throw error
    }
  }

  private async evaluatePromptPillar(
    evaluationId: string,
    brand: Brand,
    pillar: keyof typeof EVALUATION_PROMPTS,
    playbook: any,
    onDimensionEvaluated: (dimensionName: string) => void
  ): Promise<DimensionScore[]> {
    const prompts = EVALUATION_PROMPTS[pillar];
    const results: DimensionScore[] = [];

    for (const [dimensionName, promptTemplate] of Object.entries(prompts)) {
      const dimensionScore = await this.evaluateDimension(
        evaluationId,
        dimensionName,
        promptTemplate,
        brand,
        pillar,
        playbook
      );
      results.push(dimensionScore);
      onDimensionEvaluated(dimensionName);
    }

    return results;
  }

  private async evaluateDimension(
    evaluationId: string,
    dimensionName: string,
    promptTemplate: (
      brandName: string,
      websiteUrl: string,
      playbook: any
    ) => string,
    brand: Brand,
    pillar: string,
    playbook: any
  ): Promise<DimensionScore> {
    const prompt = promptTemplate(brand.name, brand.websiteUrl, playbook)
    const providerScores: number[] = []
    const providerResponses: string[] = []

    // Test across all configured AI providers
    for (const [providerName, client] of this.aiClients) {
      this.updateProgress(
        `Testing ${dimensionName.replace(/_/g, ' ')} with ${providerName}`,
        0, 0, providerName, dimensionName
      )

      try {
        const response = await client.query(prompt);
        const responseContentString = typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content);

        const score = extractScoreFromResponse(responseContentString)
       
        providerScores.push(score)
        providerResponses.push(responseContentString)

        // Save individual evaluation result
        await createEvaluationResult({
          evaluationId: evaluationId,
          providerName: providerName,
          testType: `${pillar}_${dimensionName}`,
          promptUsed: prompt,
          responseReceived: responseContentString,
          scoreContribution: score
        })

      } catch (error) {
        console.error(`Error testing ${dimensionName} with ${providerName}:`, error)
        
        // Save failed result
        await createEvaluationResult({
          evaluationId: evaluationId,
          providerName: providerName,
          testType: `${pillar}_${dimensionName}`,
          promptUsed: prompt,
          responseReceived: `Error: ${error}`,
          scoreContribution: 0
        })
      }
    }

    // Calculate average score across providers
    const averageScore = providerScores.length > 0 
      ? Math.round(providerScores.reduce((sum, score) => sum + score, 0) / providerScores.length)
      : 0

    // Generate explanation based on responses
    const explanation = this.generateDimensionExplanation(dimensionName, averageScore, providerResponses)
    
    // Generate dimension-specific recommendations
    const recommendations = this.generateDimensionRecommendations(dimensionName, averageScore)

    // Save dimension score
    const dimensionScore = await createDimensionScore({
      evaluationId: evaluationId,
      dimensionName: dimensionName,
      score: averageScore,
      explanation,
      recommendations
    })

    return dimensionScore as any
  }

  private async evaluateInfrastructureHybrid(evaluationId: string, brand: Brand): Promise<DimensionScore[]> {
      this.updateProgress('Running Infrastructure Pillar (Hybrid Mode)...', 0, 0);
      console.log(`[Hybrid Mode] Starting infrastructure evaluation for ${brand.name}`);

      // 1. Run the SelectiveFetchAgent
      this.updateProgress('Fetching canonical pages...', 1, 4);
      const fetchAgent = new SelectiveFetchAgent(brand.websiteUrl);
      const fetchedPages = await fetchAgent.run();

      console.log(`✅ [SelectiveFetch] Fetched ${fetchedPages.length} pages successfully`);

      // Save fetched pages to the database
      for (const page of fetchedPages) {
          await createPageBlob({
              evaluationId,
              url: page.url,
              pageType: page.pageType,
              contentHash: page.contentHash,
              // In a real implementation, you'd gzip the HTML before storing
              htmlGzip: page.html,
          });
      }

      // 2. Prepare context and run the ProbeHarness
      this.updateProgress('Executing LLM probes...', 2, 4);
      const probeContext = { brand, fetchedPages };
      
      // Convert Map to Record for ProbeHarness
      const aiClientsRecord: Record<AIProviderName, AIProviderClient> = {};
      for (const [providerName, client] of this.aiClients.entries()) {
          aiClientsRecord[providerName] = client;
      }
      
      console.log(`🤖 [ProbeHarness] Initializing with ${Object.keys(aiClientsRecord).length} AI providers: ${Object.keys(aiClientsRecord).join(', ')}`);
      
      const probeHarness = new ProbeHarness(coreProbes, aiClientsRecord);
      
      console.log(`🔍 [ProbeHarness] Running ${coreProbes.length} probes...`);
      const probeResults = await probeHarness.run(probeContext);
      
      console.log(`✅ [ProbeHarness] Completed ${probeResults.length} probe results`);

      // 3. Save probe results to the database
      this.updateProgress('Saving probe evidence...', 3, 4);
      for (const result of probeResults) {
          await createProbeRun({
              evaluationId,
              probeName: result.probeName as any,
              model: result.model as any, // The harness now guarantees a model
              outputJson: result.output,
              isValid: result.wasValid,
              citationsOk: result.isTrusted,
              confidence: Number.isFinite(result.confidence) ? result.confidence : 0,
          });
      }

      // 4. Map probe results to DimensionScore objects and save them
      const dimensionScores = mapProbesToDimensionScores(probeResults, evaluationId);
      
      console.log(`📊 [ScoreAdapter] Generated ${dimensionScores.length} dimension scores`);
      
      for (const dimScore of dimensionScores) {
          await createDimensionScore(dimScore);
      }

      console.log(`✅ [Hybrid Mode] Infrastructure evaluation completed for ${brand.name}`);
      return dimensionScores;
  }

  private generateDimensionExplanation(
    dimensionName: string, 
    score: number, 
    responses: string[]
  ): string {
    const scoreLevel = score >= 80 ? 'excellent' : 
                     score >= 60 ? 'good' : 
                     score >= 40 ? 'fair' : 'poor'

    const dimensionDisplayName = dimensionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    let explanation = `\${dimensionDisplayName} scored \${score}/100, indicating \${scoreLevel} performance. `

    // Add insights based on common patterns in responses
    if (responses.length > 0) {
      const combinedResponse = responses.join(' ').toLowerCase()
      
      if (combinedResponse.includes('missing') || combinedResponse.includes('absent')) {
        explanation += 'Key elements appear to be missing or incomplete. '
      }
      
      if (combinedResponse.includes('well-structured') || combinedResponse.includes('comprehensive')) {
        explanation += 'The implementation shows good structure and coverage. '
      }
      
      if (combinedResponse.includes('inconsistent')) {
        explanation += 'There are consistency issues that need attention. '
      }
    }

    return explanation
  }

  private generateDimensionRecommendations(dimensionName: string, score: number): string[] {
    const recommendations: string[] = []

    if (score < 70) {
      switch (dimensionName) {
        case 'schema_structured_data':
          recommendations.push('Implement comprehensive Schema.org markup across all page types')
          recommendations.push('Add product schema with pricing, availability, and review data')
          recommendations.push('Validate markup using Google\'s Structured Data Testing Tool')
          break
          
        case 'semantic_clarity':
          recommendations.push('Standardize terminology and vocabulary across all content')
          recommendations.push('Improve content hierarchy with clear headings and structure')
          recommendations.push('Ensure consistent brand and product naming conventions')
          break
          
        case 'citation_strength':
          recommendations.push('Develop relationships with industry publications and journalists')
          recommendations.push('Create newsworthy content and press releases')
          recommendations.push('Participate in industry events and thought leadership opportunities')
          break
          
        case 'hero_products':
          recommendations.push('Enhance product descriptions with clear value propositions')
          recommendations.push('Highlight best-selling products prominently on the website')
          recommendations.push('Include detailed product specifications and benefits')
          break
          
        default:
          recommendations.push(`Improve \${dimensionName.replace(/_/g, ' ')} implementation`)
          recommendations.push('Review industry best practices for this dimension')
          recommendations.push('Consider consulting with specialists in this area')
      }
    }

    return recommendations
  }

  private updateProgress(
    step: string, 
    completed: number, 
    total: number, 
    provider?: string, 
    dimension?: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        currentStep: step,
        completedSteps: completed,
        totalSteps: total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        currentProvider: provider,
        currentDimension: dimension
      })
    }
  }

  private decryptApiKey(encryptedKey: string): string {
    // In a real implementation, this would decrypt the API key using the ENCRYPTION_KEY
    // For now, we'll assume the key is stored in a reversible format
    try {
      // This is a placeholder - implement actual decryption
      return Buffer.from(encryptedKey, 'base64').toString('utf-8')
    } catch (error) {
      throw new Error('Failed to decrypt API key')
    }
  }

  // Utility method to test a single AI provider
  async testProvider(providerName: AIProviderName, apiKey: string): Promise<boolean> {
    try {
      const client = new AIProviderClient(providerName, apiKey)
      const response = await client.query('Hello, please respond with "OK" if you can understand this message.')
      
      return response.content.toLowerCase().includes('ok') && !response.error
    } catch (error) {
      return false
    }
  }

  // Method to run competitor analysis
  async runCompetitorAnalysis(
    evaluation: Evaluation, 
    competitorUrls: string[]
  ): Promise<void> {
    // This would run similar evaluations for competitor brands
    // and store results in the competitor_benchmarks table
    // Implementation would be similar to runEvaluation but for competitor data
  }

  private async runBrandPlaybookAnalysis(brand: Brand): Promise<any> {
    this.updateProgress('Analyzing Brand Playbook...', 0, 0);
    const playbookUrl = new URL('/.well-known/aidi-brand.json', brand.websiteUrl).toString();
    try {
        const response = await fetch(playbookUrl, {
            headers: { 'User-Agent': 'AIDI-Evaluation-Bot/1.0' },
        });

        if (!response.ok) {
            console.warn(`[Playbook] Not found for \${brand.name} (status: \${response.status}). Proceeding without it.`);
            return null;
        }

        const text = await response.text();
        // The text is likely HTML for a 404 page, not JSON.
        if (text.trim().startsWith('<')) {
            console.warn(`[Playbook] Expected JSON but received HTML for \${brand.name}.`);
            return null;
        }
        
        return JSON.parse(text);

    } catch (error: any) {
        if (error instanceof SyntaxError) {
            console.warn(`[Playbook] Failed to parse JSON for \${brand.name}. Content is likely not a valid playbook.`);
        } else {
            console.error(`[Playbook] Unexpected error fetching for \${brand.name}:`, error);
        }
        // Do not throw, allow evaluation to continue without the playbook.
        return null;
    }
  }
}

// Utility function to encrypt API keys
export function encryptApiKey(apiKey: string): string {
  // In a real implementation, this would use proper encryption
  // For now, we'll use base64 encoding as a placeholder
  return Buffer.from(apiKey, 'utf-8').toString('base64')
}

// Factory function to create evaluation engine
export function createEvaluationEngine(
  config: EvaluationConfig,
  progressCallback?: (progress: EvaluationProgress) => void
): EvaluationEngine {
  return new EvaluationEngine(config, progressCallback)
}
/**
 * Triggers a new evaluation for a given brand ID.
 * This function will fetch the brand, initialize the evaluation engine,
 * and run the evaluation asynchronously.
 *
 * @param brandId The ID of the brand to evaluate.
 * @returns The initial evaluation record.
 */
export async function triggerEvaluation(brandId: string): Promise<Evaluation> {
  // 1. Fetch the brand details from the database
  // This is a placeholder for your actual database logic
  const brand = await getBrand(brandId);

  if (!brand) {
    throw new Error(`Brand with ID \${brandId} not found.`);
  }

  // 2. Define the evaluation configuration
  const evaluationConfig: EvaluationConfig = {
    brandId: brand.id,
    userId: brand.userId, // Assuming brand has a userId
    enabledProviders: ['openai'], // Example providers
    testCompetitors: false,
  };

  // 3. Create and initialize the engine
  const engine = createEvaluationEngine(evaluationConfig);
  await engine.initialize();

  // 4. Run the evaluation
  const evaluation = await engine.runEvaluation(brand);

  // 5. Return the completed evaluation
  return evaluation;
}
