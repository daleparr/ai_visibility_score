/* eslint-disable @typescript-eslint/no-explicit-any */
const actualAiProviders = jest.requireActual('@/lib/ai-providers')

jest.mock('@/lib/ai-providers', () => {
  const actual = jest.requireActual('@/lib/ai-providers')
  const mockQuery = jest.fn(async () => ({
    content: 'Score: 85/100',
    model: 'mock-model',
  }))

  const mockExtractScore = jest.fn(() => 85)

  class MockAIProviderClient {
    public provider: string
    constructor(providerName: string) {
      this.provider = providerName
    }

    async query(): Promise<any> {
      return mockQuery()
    }

    async queryWithSchema(): Promise<any> {
      return mockQuery()
    }
  }

  return {
    __esModule: true,
    ...actual,
    AIProviderClient: MockAIProviderClient,
    extractScoreFromResponse: mockExtractScore,
    __mockAiQuery: mockQuery,
  }
})

jest.mock('@/lib/database', () => {
  const evaluationStore = new Map<string, any>()
  const evaluationLogs: any[] = []
  const dimensionScores: any[] = []
  const evaluationResults: any[] = []
  const pageBlobs: any[] = []
  const probeRuns: any[] = []

  const createEvaluation = jest.fn(async (payload: any) => {
    const record = {
      id: payload.id ?? 'eval-1',
      startedAt: payload.startedAt ?? new Date(),
      ...payload,
    }
    evaluationStore.set(record.id, record)
    evaluationLogs.push({ action: 'create', record })
    return record
  })

  const updateEvaluation = jest.fn(async (id: string, updates: any) => {
    const previous = evaluationStore.get(id) ?? { id }
    const updated = { ...previous, ...updates, id }
    evaluationStore.set(id, updated)
    evaluationLogs.push({ action: 'update', record: updated })
    return updated
  })

  const createDimensionScore = jest.fn(async (score: any) => {
    const record = {
      id: `${score.evaluationId}-${score.dimensionName}`,
      ...score,
    }
    dimensionScores.push(record)
    return record
  })

  const createEvaluationResult = jest.fn(async (result: any) => {
    evaluationResults.push(result)
    return result
  })

  const createRecommendation = jest.fn()

  const getSubscriptionByUserId = jest.fn().mockResolvedValue(null)

  const createPageBlob = jest.fn(async (blob: any) => {
    pageBlobs.push(blob)
  })

  const createProbeRun = jest.fn(async (probe: any) => {
    probeRuns.push(probe)
  })

  const __mockDb = {
    evaluationStore,
    evaluationLogs,
    dimensionScores,
    evaluationResults,
    pageBlobs,
    probeRuns,
  }

  return {
    __esModule: true,
    createEvaluation,
    updateEvaluation,
    createDimensionScore,
    createEvaluationResult,
    createRecommendation,
    getSubscriptionByUserId,
    createPageBlob,
    createProbeRun,
    __mockDb,
  }
})

jest.mock('@/lib/adapters/selective-fetch-agent', () => ({
  __esModule: true,
  SelectiveFetchAgent: class {
    domain: string
    constructor(domain: string) {
      this.domain = domain
    }

    async run() {
      return [
        {
          url: `https://${this.domain}/about`,
          pageType: 'about',
          html: '<html><body>About</body></html>',
          contentHash: 'hash-about',
          status: 200,
        },
        {
          url: `https://${this.domain}/faq`,
          pageType: 'faq',
          html: '<html><body>FAQ</body></html>',
          contentHash: 'hash-faq',
          status: 200,
        },
        {
          url: `https://${this.domain}/product`,
          pageType: 'product',
          html: '<html><body>Product</body></html>',
          contentHash: 'hash-product',
          status: 200,
        },
      ]
    }
  },
}))

jest.mock('@/lib/adi/probes', () => ({
  __esModule: true,
  coreProbes: ['mock-probe'],
}))

jest.mock('@/lib/adi/probe-harness', () => {
  const { EVALUATION_PROMPTS } = jest.requireActual('@/lib/ai-providers')
  return {
    __esModule: true,
    ProbeHarness: class {
      constructor() {}
      async run() {
        return Object.keys(EVALUATION_PROMPTS.infrastructure).map((dimensionName, index) => ({
          probeName: dimensionName,
          model: 'mock-model',
          output: { score: 80 + index },
          wasValid: true,
          isTrusted: true,
          confidence: 0.9,
        }))
      }
    },
  }
})

jest.mock('@/lib/adi/score-adapter', () => {
  const { EVALUATION_PROMPTS } = jest.requireActual('@/lib/ai-providers')
  return {
    __esModule: true,
    mapProbesToDimensionScores: jest.fn((_: any, evaluationId: string) =>
      Object.keys(EVALUATION_PROMPTS.infrastructure).map((dimensionName, index) => ({
        evaluationId,
        dimensionName,
        score: 80 + index,
        explanation: 'Mock infrastructure score',
        recommendations: [],
      })),
    ),
  }
})

import { EvaluationEngine } from '@/lib/evaluation-engine'
import { EVALUATION_PROMPTS } from '@/lib/ai-providers'
import {
  calculateOverallScore,
  calculatePillarScores,
  getGradeFromScore,
  identifyDimensionExtremes,
} from '@/lib/scoring'
import {
  createDimensionScore,
  createEvaluation,
  createEvaluationResult,
  updateEvaluation,
  createPageBlob,
  createProbeRun,
} from '@/lib/database'

describe('EvaluationEngine full evaluation coverage', () => {
  const perceptionDimensions = Object.keys(EVALUATION_PROMPTS.perception)
  const commerceDimensions = Object.keys(EVALUATION_PROMPTS.commerce)
  const infrastructureDimensions = Object.keys(EVALUATION_PROMPTS.infrastructure)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('covers all pillars and dimensions when forceFullEvaluation is enabled', async () => {
    const engine = new EvaluationEngine(
      {
        brandId: 'brand-1',
        userId: 'user-1',
        enabledProviders: ['openai'],
        testCompetitors: false,
        forceFullEvaluation: true,
      },
      undefined,
    )

    await engine.initialize()

    const brand = {
      id: 'brand-1',
      userId: 'user-1',
      name: 'Full Coverage Brand',
      websiteUrl: 'example.com',
    } as any

    const completedEvaluation = await engine.runEvaluation(brand)
    expect(completedEvaluation).toBeDefined()

    const dimensionCalls = (createDimensionScore as jest.Mock).mock.calls.map(
      ([payload]: [any]) => payload.dimensionName,
    )
    const uniqueDimensionNames = Array.from(new Set(dimensionCalls))

    expect(uniqueDimensionNames).toEqual(
      expect.arrayContaining([...infrastructureDimensions, ...perceptionDimensions, ...commerceDimensions]),
    )

    expect((createEvaluation as jest.Mock).mock.calls.length).toBe(1)
    const finalUpdateCall = (updateEvaluation as jest.Mock).mock.calls.at(-1)?.[1]
    expect(finalUpdateCall).toMatchObject({
      status: 'completed',
    })
    expect(finalUpdateCall?.overallScore).toBeGreaterThan(0)
    expect(finalUpdateCall?.grade).toBeDefined()
    expect(finalUpdateCall?.strongestDimension).toBeDefined()
    expect(finalUpdateCall?.weakestDimension).toBeDefined()
    expect(finalUpdateCall?.biggestOpportunity).toBeDefined()

    expect((createEvaluationResult as jest.Mock).mock.calls.length).toBe(
      perceptionDimensions.length + commerceDimensions.length,
    )

    expect((createPageBlob as jest.Mock).mock.calls.length).toBe(3)
    expect((createProbeRun as jest.Mock).mock.calls.length).toBe(infrastructureDimensions.length)

    const dbModule = jest.requireMock('@/lib/database') as any
    const mockDb = dbModule.__mockDb
    expect(mockDb.dimensionScores).toHaveLength(
      infrastructureDimensions.length + perceptionDimensions.length + commerceDimensions.length,
    )
    expect(mockDb.pageBlobs).toHaveLength(3)
    expect(mockDb.probeRuns).toHaveLength(infrastructureDimensions.length)

    const recordedDimensionScores = mockDb.dimensionScores.map((record: any) => ({
      dimensionName: record.dimensionName,
      score: record.score,
      explanation: record.explanation ?? '',
      recommendations: record.recommendations ?? [],
    }))

    const expectedOverall = calculateOverallScore(recordedDimensionScores as any)
    const expectedPillars = calculatePillarScores(recordedDimensionScores as any)
    const expectedGrade = getGradeFromScore(expectedOverall)
    const extremes = identifyDimensionExtremes(recordedDimensionScores as any)

    expect(finalUpdateCall?.overallScore).toBe(expectedOverall)
    expect(finalUpdateCall?.grade).toBe(expectedGrade)
    expect(finalUpdateCall?.strongestDimension).toBe(extremes.strongest)
    expect(finalUpdateCall?.weakestDimension).toBe(extremes.weakest)
    expect(finalUpdateCall?.biggestOpportunity).toBe(extremes.biggestOpportunity)

    expect(expectedPillars.infrastructure).toBeGreaterThan(0)
    expect(expectedPillars.perception).toBeGreaterThan(0)
    expect(expectedPillars.commerce).toBeGreaterThan(0)

    const storedEvaluation = mockDb.evaluationStore.get('eval-1')
    expect(storedEvaluation).toMatchObject({
      status: 'completed',
      overallScore: expectedOverall,
      grade: expectedGrade,
    })
  })
})