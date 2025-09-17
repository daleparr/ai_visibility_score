import { eq, desc, and } from 'drizzle-orm'
import { db, brands, evaluations, dimensionScores, aiProviders, evaluationResults, recommendations, competitorBenchmarks, users, userProfiles } from './db'
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

// Brand operations
export const getBrands = async (userId: string): Promise<Brand[]> => {
  return await db.select().from(brands).where(eq(brands.userId, userId)).orderBy(desc(brands.createdAt))
}

export const getBrand = async (brandId: string): Promise<Brand | undefined> => {
  const result = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1)
  return result[0]
}

export const createBrand = async (brand: NewBrand): Promise<Brand> => {
  const result = await db.insert(brands).values(brand).returning()
  return result[0]
}

export const updateBrand = async (brandId: string, updates: Partial<NewBrand>): Promise<Brand | undefined> => {
  const result = await db.update(brands).set(updates).where(eq(brands.id, brandId)).returning()
  return result[0]
}

export const deleteBrand = async (brandId: string): Promise<void> => {
  await db.delete(brands).where(eq(brands.id, brandId))
}

// Evaluation operations
export const getEvaluations = async (brandId: string): Promise<Evaluation[]> => {
  return await db.select().from(evaluations).where(eq(evaluations.brandId, brandId)).orderBy(desc(evaluations.createdAt))
}

export const getEvaluation = async (evaluationId: string): Promise<Evaluation | undefined> => {
  const result = await db.select().from(evaluations).where(eq(evaluations.id, evaluationId)).limit(1)
  return result[0]
}

export const getEvaluationWithDetails = async (evaluationId: string) => {
  const evaluation = await getEvaluation(evaluationId)
  if (!evaluation) return null

  const [dimensionScoresData, recommendationsData] = await Promise.all([
    getDimensionScores(evaluationId),
    getRecommendations(evaluationId)
  ])

  return {
    evaluation,
    dimensionScores: dimensionScoresData,
    recommendations: recommendationsData,
  }
}

export const createEvaluation = async (evaluation: NewEvaluation): Promise<Evaluation> => {
  const result = await db.insert(evaluations).values(evaluation).returning()
  return result[0]
}

export const updateEvaluation = async (evaluationId: string, updates: Partial<NewEvaluation>): Promise<Evaluation | undefined> => {
  const result = await db.update(evaluations).set(updates).where(eq(evaluations.id, evaluationId)).returning()
  return result[0]
}

export const deleteEvaluation = async (evaluationId: string): Promise<void> => {
  await db.delete(evaluations).where(eq(evaluations.id, evaluationId))
}

// Dimension scores operations
export const getDimensionScores = async (evaluationId: string): Promise<DimensionScore[]> => {
  return await db.select().from(dimensionScores).where(eq(dimensionScores.evaluationId, evaluationId))
}

export const createDimensionScore = async (score: NewDimensionScore): Promise<DimensionScore> => {
  const result = await db.insert(dimensionScores).values(score).returning()
  return result[0]
}

// Recommendations operations
export const getRecommendations = async (evaluationId: string): Promise<Recommendation[]> => {
  return await db.select().from(recommendations).where(eq(recommendations.evaluationId, evaluationId))
}

export const createRecommendation = async (recommendation: NewRecommendation): Promise<Recommendation> => {
  const result = await db.insert(recommendations).values(recommendation).returning()
  return result[0]
}

// AI Provider operations
export const getAIProviders = async (userId: string): Promise<AIProvider[]> => {
  return await db.select().from(aiProviders).where(eq(aiProviders.userId, userId))
}

export const createAIProvider = async (provider: NewAIProvider): Promise<AIProvider> => {
  const result = await db.insert(aiProviders).values(provider).returning()
  return result[0]
}

export const updateAIProvider = async (providerId: string, updates: Partial<NewAIProvider>): Promise<AIProvider | undefined> => {
  const result = await db.update(aiProviders).set(updates).where(eq(aiProviders.id, providerId)).returning()
  return result[0]
}

export const deleteAIProvider = async (providerId: string): Promise<void> => {
  await db.delete(aiProviders).where(eq(aiProviders.id, providerId))
}

// Evaluation results operations
export const createEvaluationResult = async (result: NewEvaluationResult): Promise<EvaluationResult> => {
  const insertResult = await db.insert(evaluationResults).values(result).returning()
  return insertResult[0]
}

export const getEvaluationResults = async (evaluationId: string): Promise<EvaluationResult[]> => {
  return await db.select().from(evaluationResults).where(eq(evaluationResults.evaluationId, evaluationId))
}

// User operations
export const getUser = async (userId: string): Promise<User | undefined> => {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  return result[0]
}

export const getUserProfile = async (userId: string) => {
  const result = await db.select().from(userProfiles).where(eq(userProfiles.id, userId)).limit(1)
  return result[0]
}

export const createUserProfile = async (profile: any) => {
  const result = await db.insert(userProfiles).values(profile).returning()
  return result[0]
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const result = await db.update(userProfiles).set(updates).where(eq(userProfiles.id, userId)).returning()
  return result[0]
}