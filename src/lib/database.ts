import { eq, desc, and } from 'drizzle-orm'
import { db, brands, evaluations, dimensionScores, aiProviders, evaluationResults, recommendations, competitorBenchmarks, userProfiles } from './db'
import type { 
  Brand, 
  NewBrand, 
  Evaluation, 
  NewEvaluation, 
  DimensionScore, 
  NewDimensionScore,
  AIProvider,
  NewAIProvider,
  EvaluationResult,
  NewEvaluationResult,
  Recommendation,
  NewRecommendation,
  User
} from './db/schema'
import { isDemoMode, mockBrands, mockEvaluations, mockDimensionScores, mockRecommendations } from './demo-mode'

// Brand operations
export const getBrands = async (userId: string): Promise<Brand[]> => {
  if (isDemoMode()) {
    return mockBrands.filter(brand => brand.user_id === userId)
  }
  
  return await db.select().from(brands).where(eq(brands.userId, userId)).orderBy(desc(brands.createdAt))
}

export const getBrand = async (brandId: string): Promise<Brand | undefined> => {
  if (isDemoMode()) {
    return mockBrands.find(brand => brand.id === brandId) || mockBrands[0]
  }
  
  const result = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1)
  return result[0]
}

export const createBrand = async (brand: NewBrand): Promise<Brand> => {
  if (isDemoMode()) {
    return {
      id: `demo-brand-${Date.now()}`,
      ...brand,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Brand
  }
  
  const result = await db.insert(brands).values(brand).returning()
  return result[0]
}

export const updateBrand = async (brandId: string, updates: Partial<NewBrand>): Promise<Brand> => {
  if (isDemoMode()) {
    const brand = mockBrands.find(b => b.id === brandId)
    return {
      ...brand,
      ...updates,
      updatedAt: new Date()
    } as Brand
  }
  
  const result = await db.update(brands)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(brands.id, brandId))
    .returning()
  return result[0]
}

export const deleteBrand = async (brandId: string): Promise<void> => {
  if (isDemoMode()) {
    return
  }
  
  await db.delete(brands).where(eq(brands.id, brandId))
}

// Evaluation operations
export const getEvaluations = async (brandId: string): Promise<Evaluation[]> => {
  if (isDemoMode()) {
    return mockEvaluations.filter(evaluation => evaluation.brand_id === brandId)
  }
  
  return await db.select().from(evaluations).where(eq(evaluations.brandId, brandId)).orderBy(desc(evaluations.createdAt))
}

export const getEvaluation = async (evaluationId: string): Promise<{
  evaluation: Evaluation
  brand: Brand
  dimensionScores: DimensionScore[]
  recommendations: Recommendation[]
  competitorBenchmarks: any[]
} | null> => {
  if (isDemoMode()) {
    const evaluation = mockEvaluations.find(e => e.id === evaluationId)
    const brand = mockBrands.find(b => b.id === evaluation?.brand_id)
    return {
      evaluation: evaluation as any,
      brand: brand as any,
      dimensionScores: mockDimensionScores as any,
      recommendations: mockRecommendations as any,
      competitorBenchmarks: []
    }
  }
  
  const evaluation = await db.select().from(evaluations).where(eq(evaluations.id, evaluationId)).limit(1)
  if (!evaluation[0]) return null
  
  const brand = await getBrand(evaluation[0].brandId)
  const dimScores = await getDimensionScores(evaluationId)
  const recs = await getRecommendations(evaluationId)
  
  return {
    evaluation: evaluation[0],
    brand: brand!,
    dimensionScores: dimScores,
    recommendations: recs,
    competitorBenchmarks: []
  }
}

export const createEvaluation = async (evaluation: NewEvaluation): Promise<Evaluation> => {
  if (isDemoMode()) {
    return {
      id: `demo-eval-${Date.now()}`,
      ...evaluation,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Evaluation
  }
  
  const result = await db.insert(evaluations).values(evaluation).returning()
  return result[0]
}

export const updateEvaluation = async (evaluationId: string, updates: Partial<NewEvaluation>): Promise<Evaluation> => {
  if (isDemoMode()) {
    const evaluation = mockEvaluations.find(e => e.id === evaluationId)
    return {
      ...evaluation,
      ...updates,
      updated_at: new Date().toISOString()
    } as any
  }
  
  const result = await db.update(evaluations)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(evaluations.id, evaluationId))
    .returning()
  return result[0]
}

// Dimension scores operations
export const getDimensionScores = async (evaluationId: string): Promise<DimensionScore[]> => {
  if (isDemoMode()) {
    return mockDimensionScores.filter(score => score.evaluation_id === evaluationId) as any
  }
  
  return await db.select().from(dimensionScores).where(eq(dimensionScores.evaluationId, evaluationId))
}

export const createDimensionScore = async (dimensionScore: NewDimensionScore): Promise<DimensionScore> => {
  if (isDemoMode()) {
    return {
      id: `demo-dim-${Date.now()}`,
      ...dimensionScore,
      createdAt: new Date()
    } as DimensionScore
  }
  
  const result = await db.insert(dimensionScores).values(dimensionScore).returning()
  return result[0]
}

// Recommendations operations
export const getRecommendations = async (evaluationId: string): Promise<Recommendation[]> => {
  if (isDemoMode()) {
    return mockRecommendations.filter(rec => rec.evaluation_id === evaluationId) as any
  }
  
  return await db.select().from(recommendations).where(eq(recommendations.evaluationId, evaluationId))
}

export const createRecommendation = async (recommendation: NewRecommendation): Promise<Recommendation> => {
  if (isDemoMode()) {
    return {
      id: `demo-rec-${Date.now()}`,
      ...recommendation,
      createdAt: new Date()
    } as Recommendation
  }
  
  const result = await db.insert(recommendations).values(recommendation).returning()
  return result[0]
}

// AI Providers operations
export const getAIProviders = async (userId: string): Promise<AIProvider[]> => {
  if (isDemoMode()) {
    return []
  }
  
  return await db.select().from(aiProviders).where(eq(aiProviders.userId, userId))
}

export const createAIProvider = async (provider: NewAIProvider): Promise<AIProvider> => {
  if (isDemoMode()) {
    return {
      id: `demo-provider-${Date.now()}`,
      ...provider,
      createdAt: new Date(),
      updatedAt: new Date()
    } as AIProvider
  }
  
  const result = await db.insert(aiProviders).values(provider).returning()
  return result[0]
}

export const updateAIProvider = async (providerId: string, updates: Partial<NewAIProvider>): Promise<AIProvider> => {
  if (isDemoMode()) {
    return {
      id: providerId,
      ...updates,
      updatedAt: new Date()
    } as AIProvider
  }
  
  const result = await db.update(aiProviders)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(aiProviders.id, providerId))
    .returning()
  return result[0]
}

export const deleteAIProvider = async (providerId: string): Promise<void> => {
  if (isDemoMode()) {
    return
  }
  
  await db.delete(aiProviders).where(eq(aiProviders.id, providerId))
}

// Evaluation results operations
export const createEvaluationResult = async (result: NewEvaluationResult): Promise<EvaluationResult> => {
  if (isDemoMode()) {
    return {
      id: `demo-result-${Date.now()}`,
      ...result,
      createdAt: new Date()
    } as EvaluationResult
  }
  
  const dbResult = await db.insert(evaluationResults).values(result).returning()
  return dbResult[0]
}

// User profile operations
export const getUserProfile = async (userId: string): Promise<any> => {
  if (isDemoMode()) {
    return {
      id: userId,
      fullName: 'Demo User',
      companyName: 'Demo Company',
      role: 'Marketing Director',
      industry: 'Technology',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const result = await db.select().from(userProfiles).where(eq(userProfiles.id, userId)).limit(1)
  return result[0]
}

export const createUserProfile = async (profile: any): Promise<any> => {
  if (isDemoMode()) {
    return {
      id: `demo-profile-${Date.now()}`,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const result = await db.insert(userProfiles).values(profile).returning()
  return result[0]
}

export const updateUserProfile = async (userId: string, updates: any): Promise<any> => {
  if (isDemoMode()) {
    return {
      id: userId,
      ...updates,
      updatedAt: new Date()
    }
  }
  
  const result = await db.update(userProfiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(userProfiles.id, userId))
    .returning()
  return result[0]
}