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
  User,
  NewUser
} from './db/schema'

// Brand operations
export const getBrands = async (userId: string): Promise<Brand[]> => {
  try {
    return await db.select().from(brands).where(eq(brands.userId, userId)).orderBy(desc(brands.createdAt))
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
  }
}

export const getBrand = async (brandId: string): Promise<Brand | undefined> => {
  try {
    const result = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1)
    return result[0]
  } catch (error) {
    console.error('Error fetching brand:', error)
    return undefined
  }
}

export const createBrand = async (brand: NewBrand): Promise<Brand | null> => {
  try {
    console.log('🔍 [DB] Creating brand with data:', {
      name: brand.name,
      websiteUrl: brand.websiteUrl,
      userId: brand.userId,
      industry: brand.industry
    })
    
    console.log('🔍 [DB] Database connection check:', {
      dbExists: !!db,
      dbType: typeof db,
      isProduction: process.env.NODE_ENV === 'production'
    })
    
    // Verify database connection before attempting insert
    if (!db) {
      throw new Error('No database connection available - cannot create brand')
    }
    
    // First try to insert the brand
    const result = await db.insert(brands).values(brand).returning()
    
    if (result && result.length > 0) {
      console.log('✅ [DB] Brand created successfully:', result[0].id)
      return result[0]
    } else {
      console.log('❌ [DB] Insert returned empty result')
      throw new Error('Brand insert returned empty result')
    }
  } catch (error: any) {
    console.error('❌ [DB] Error creating brand:', error)
    console.error('❌ [DB] Error code:', error.code)
    console.error('❌ [DB] Error message:', error.message)
    console.error('❌ [DB] Brand data:', brand)
    
    // If it's a unique constraint violation, try to find the existing brand
    if (error.code === '23505') { // PostgreSQL unique violation
      console.log('🔄 [DB] Unique constraint violation - checking for existing brand')
      try {
        // Try to find existing brand by name and userId
        const existing = await db.select().from(brands)
          .where(and(eq(brands.name, brand.name), eq(brands.userId, brand.userId)))
          .limit(1)
        
        if (existing.length > 0) {
          console.log('✅ [DB] Found existing brand:', existing[0].id)
          return existing[0]
        }
      } catch (findError) {
        console.error('❌ [DB] Error finding existing brand:', findError)
      }
    }
    
    // Re-throw the error so the API route can handle it properly
    throw error
  }
}

export const updateBrand = async (brandId: string, updates: Partial<NewBrand>): Promise<Brand | undefined> => {
  try {
    const result = await db.update(brands).set(updates).where(eq(brands.id, brandId)).returning()
    return result[0]
  } catch (error) {
    console.error('Error updating brand:', error)
    return undefined
  }
}

export const deleteBrand = async (brandId: string): Promise<void> => {
  try {
    await db.delete(brands).where(eq(brands.id, brandId))
  } catch (error) {
    console.error('Error deleting brand:', error)
  }
}

// Evaluation operations
export const getEvaluations = async (brandId: string): Promise<Evaluation[]> => {
  try {
    return await db.select().from(evaluations).where(eq(evaluations.brandId, brandId)).orderBy(desc(evaluations.createdAt))
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return []
  }
}

export const getEvaluation = async (evaluationId: string): Promise<Evaluation | undefined> => {
  try {
    const result = await db.select().from(evaluations).where(eq(evaluations.id, evaluationId)).limit(1)
    return result[0]
  } catch (error) {
    console.error('Error fetching evaluation:', error)
    return undefined
  }
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
  console.log('🔍 [DB] Creating evaluation with data:', {
    brandId: evaluation.brandId,
    status: evaluation.status,
    overallScore: evaluation.overallScore,
    grade: evaluation.grade
  })
  
  try {
    const result = await db.insert(evaluations).values(evaluation).returning()
    
    if (!result || result.length === 0) {
      throw new Error('Insert returned empty result - database operation failed')
    }
    
    console.log('✅ [DB] Evaluation created successfully:', result[0].id)
    return result[0]
  } catch (error) {
    console.error('❌ [DB] Failed to create evaluation:', error)
    console.error('❌ [DB] Evaluation data:', evaluation)
    console.error('❌ [DB] Database instance type:', typeof db)
    console.error('❌ [DB] Database methods:', db ? Object.keys(db) : 'null')
    throw error
  }
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
  console.log('🔍 [DB] Creating dimension score:', {
    evaluationId: score.evaluationId,
    dimensionName: score.dimensionName,
    score: score.score
  })
  
  try {
    const result = await db.insert(dimensionScores).values(score).returning()
    
    if (!result || result.length === 0) {
      throw new Error('Insert returned empty result - dimension score save failed')
    }
    
    console.log('✅ [DB] Dimension score created:', result[0].id)
    return result[0]
  } catch (error) {
    console.error('❌ [DB] Failed to create dimension score:', error)
    console.error('❌ [DB] Score data:', score)
    throw error
  }
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

/**
 * Ensure a guest user exists for anonymous evaluations.
 * Returns the existing guest user or creates one if missing.
 */
export const ensureGuestUser = async (): Promise<User> => {
  const guestEmail = 'guest@ai-visibility-score.app'
  try {
    const existing = await db.select().from(users).where(eq(users.email as any, guestEmail as any)).limit(1)
    if (existing.length > 0) {
      return existing[0]
    }
    const inserted = await db.insert(users).values({
      email: guestEmail,
      name: 'Guest User'
    } as any).returning()
    return inserted[0]
  } catch (error) {
    console.error('❌ [DB] Failed to ensure guest user exists:', error)
    throw error
  }
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