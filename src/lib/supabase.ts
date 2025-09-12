import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Auth helpers
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Database helpers
export const getBrands = async (userId: string) => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getBrand = async (brandId: string) => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single()
  
  if (error) throw error
  return data
}

export const createBrand = async (brand: Database['public']['Tables']['brands']['Insert']) => {
  const { data, error } = await supabase
    .from('brands')
    .insert(brand)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateBrand = async (
  brandId: string, 
  updates: Database['public']['Tables']['brands']['Update']
) => {
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', brandId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteBrand = async (brandId: string) => {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', brandId)
  
  if (error) throw error
}

export const getEvaluations = async (brandId: string) => {
  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      *,
      brand:brands(*)
    `)
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getEvaluation = async (evaluationId: string) => {
  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      *,
      brand:brands(*),
      dimension_scores(*),
      recommendations(*),
      competitor_benchmarks(*)
    `)
    .eq('id', evaluationId)
    .single()
  
  if (error) throw error
  return data
}

export const createEvaluation = async (
  evaluation: Database['public']['Tables']['evaluations']['Insert']
) => {
  const { data, error } = await supabase
    .from('evaluations')
    .insert(evaluation)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateEvaluation = async (
  evaluationId: string,
  updates: Database['public']['Tables']['evaluations']['Update']
) => {
  const { data, error } = await supabase
    .from('evaluations')
    .update(updates)
    .eq('id', evaluationId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getDimensionScores = async (evaluationId: string) => {
  const { data, error } = await supabase
    .from('dimension_scores')
    .select('*')
    .eq('evaluation_id', evaluationId)
    .order('dimension_name')
  
  if (error) throw error
  return data
}

export const createDimensionScore = async (
  dimensionScore: Database['public']['Tables']['dimension_scores']['Insert']
) => {
  const { data, error } = await supabase
    .from('dimension_scores')
    .insert(dimensionScore)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getRecommendations = async (evaluationId: string) => {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('evaluation_id', evaluationId)
    .order('priority', { ascending: true })
  
  if (error) throw error
  return data
}

export const createRecommendation = async (
  recommendation: Database['public']['Tables']['recommendations']['Insert']
) => {
  const { data, error } = await supabase
    .from('recommendations')
    .insert(recommendation)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getAIProviders = async (userId: string) => {
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('user_id', userId)
    .order('provider_name')
  
  if (error) throw error
  return data
}

export const createAIProvider = async (
  provider: Database['public']['Tables']['ai_providers']['Insert']
) => {
  const { data, error } = await supabase
    .from('ai_providers')
    .insert(provider)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateAIProvider = async (
  providerId: string,
  updates: Database['public']['Tables']['ai_providers']['Update']
) => {
  const { data, error } = await supabase
    .from('ai_providers')
    .update(updates)
    .eq('id', providerId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteAIProvider = async (providerId: string) => {
  const { error } = await supabase
    .from('ai_providers')
    .delete()
    .eq('id', providerId)
  
  if (error) throw error
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export const createUserProfile = async (
  profile: Database['public']['Tables']['user_profiles']['Insert']
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateUserProfile = async (
  userId: string,
  updates: Database['public']['Tables']['user_profiles']['Update']
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Real-time subscriptions
export const subscribeToEvaluation = (
  evaluationId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`evaluation:${evaluationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'evaluations',
        filter: `id=eq.${evaluationId}`
      },
      callback
    )
    .subscribe()
}

export const createEvaluationResult = async (
  result: Database['public']['Tables']['evaluation_results']['Insert']
) => {
  const { data, error } = await supabase
    .from('evaluation_results')
    .insert(result)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const subscribeToEvaluationResults = (
  evaluationId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`evaluation_results:${evaluationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'evaluation_results',
        filter: `evaluation_id=eq.${evaluationId}`
      },
      callback
    )
    .subscribe()
}