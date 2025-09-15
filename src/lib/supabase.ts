import { isDemoMode, mockUser, mockBrands, mockEvaluations, mockDimensionScores, mockRecommendations } from './demo-mode'

// Mock Supabase client for demo mode
export const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
    signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null })
      })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  })
}

// Server-side client with service role key (mock)
export const supabaseAdmin = supabase

// Demo mode functions that were previously in this file
export const getUser = async () => {
  if (isDemoMode()) {
    return mockUser
  }
  return null
}

export const getBrands = async (userId: string) => {
  if (isDemoMode()) {
    return mockBrands.filter(brand => brand.userId === userId)
  }
  return []
}

export const getEvaluations = async (brandId: string) => {
  if (isDemoMode()) {
    return mockEvaluations.filter(evaluation => evaluation.brandId === brandId)
  }
  return []
}

export const getEvaluation = async (evaluationId: string) => {
  if (isDemoMode()) {
    const evaluation = mockEvaluations.find(e => e.id === evaluationId)
    if (!evaluation) return null
    
    const brand = mockBrands.find(b => b.id === evaluation.brandId)
    return {
      ...evaluation,
      brand
    }
  }
  return null
}

export const getDimensionScores = async (evaluationId: string) => {
  if (isDemoMode()) {
    return mockDimensionScores.filter(score => score.evaluationId === evaluationId)
  }
  return []
}

export const getRecommendations = async (evaluationId: string) => {
  if (isDemoMode()) {
    return mockRecommendations.filter(rec => rec.evaluationId === evaluationId)
  }
  return []
}