export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_providers: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          id: string
          is_active: boolean | null
          provider_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          provider_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          provider_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_providers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      brands: {
        Row: {
          competitors: string[] | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string
          user_id: string | null
          website_url: string
        }
        Insert: {
          competitors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          updated_at?: string
          user_id?: string | null
          website_url: string
        }
        Update: {
          competitors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string
          user_id?: string | null
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      competitor_benchmarks: {
        Row: {
          competitor_name: string | null
          competitor_url: string
          created_at: string
          dimension_scores: Json | null
          evaluation_id: string
          id: string
          overall_score: number | null
        }
        Insert: {
          competitor_name?: string | null
          competitor_url: string
          created_at?: string
          dimension_scores?: Json | null
          evaluation_id: string
          id?: string
          overall_score?: number | null
        }
        Update: {
          competitor_name?: string | null
          competitor_url?: string
          created_at?: string
          dimension_scores?: Json | null
          evaluation_id?: string
          id?: string
          overall_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_benchmarks_evaluation_id_fkey"
            columns: ["evaluation_id"]
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          }
        ]
      }
      dimension_scores: {
        Row: {
          created_at: string
          dimension_name: string
          evaluation_id: string
          explanation: string | null
          id: string
          recommendations: string[] | null
          score: number
        }
        Insert: {
          created_at?: string
          dimension_name: string
          evaluation_id: string
          explanation?: string | null
          id?: string
          recommendations?: string[] | null
          score: number
        }
        Update: {
          created_at?: string
          dimension_name?: string
          evaluation_id?: string
          explanation?: string | null
          id?: string
          recommendations?: string[] | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "dimension_scores_evaluation_id_fkey"
            columns: ["evaluation_id"]
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          }
        ]
      }
      evaluation_results: {
        Row: {
          created_at: string
          evaluation_id: string
          id: string
          prompt_used: string | null
          provider_name: string
          response_received: string | null
          score_contribution: number | null
          test_type: string
        }
        Insert: {
          created_at?: string
          evaluation_id: string
          id?: string
          prompt_used?: string | null
          provider_name: string
          response_received?: string | null
          score_contribution?: number | null
          test_type: string
        }
        Update: {
          created_at?: string
          evaluation_id?: string
          id?: string
          prompt_used?: string | null
          provider_name?: string
          response_received?: string | null
          score_contribution?: number | null
          test_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_results_evaluation_id_fkey"
            columns: ["evaluation_id"]
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          }
        ]
      }
      evaluations: {
        Row: {
          biggest_opportunity: string | null
          brand_id: string | null
          completed_at: string | null
          created_at: string
          grade: Database["public"]["Enums"]["grade_type"] | null
          id: string
          overall_score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["evaluation_status"] | null
          strongest_dimension: string | null
          updated_at: string
          verdict: string | null
          weakest_dimension: string | null
        }
        Insert: {
          biggest_opportunity?: string | null
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string
          grade?: Database["public"]["Enums"]["grade_type"] | null
          id?: string
          overall_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["evaluation_status"] | null
          strongest_dimension?: string | null
          updated_at?: string
          verdict?: string | null
          weakest_dimension?: string | null
        }
        Update: {
          biggest_opportunity?: string | null
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string
          grade?: Database["public"]["Enums"]["grade_type"] | null
          id?: string
          overall_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["evaluation_status"] | null
          strongest_dimension?: string | null
          updated_at?: string
          verdict?: string | null
          weakest_dimension?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_brand_id_fkey"
            columns: ["brand_id"]
            referencedRelation: "brands"
            referencedColumns: ["id"]
          }
        ]
      }
      recommendations: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          effort_level: string | null
          evaluation_id: string
          id: string
          impact_level: string | null
          priority: Database["public"]["Enums"]["recommendation_priority"]
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          effort_level?: string | null
          evaluation_id: string
          id?: string
          impact_level?: string | null
          priority: Database["public"]["Enums"]["recommendation_priority"]
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          effort_level?: string | null
          evaluation_id?: string
          id?: string
          impact_level?: string | null
          priority?: Database["public"]["Enums"]["recommendation_priority"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_evaluation_id_fkey"
            columns: ["evaluation_id"]
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          industry: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          industry?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          industry?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      evaluation_status: "pending" | "running" | "completed" | "failed"
      grade_type: "A" | "B" | "C" | "D" | "F"
      recommendation_priority: "1" | "2" | "3"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional types for application use
export type Brand = Database['public']['Tables']['brands']['Row']
export type BrandInsert = Database['public']['Tables']['brands']['Insert']
export type BrandUpdate = Database['public']['Tables']['brands']['Update']

export type Evaluation = Database['public']['Tables']['evaluations']['Row']
export type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert']
export type EvaluationUpdate = Database['public']['Tables']['evaluations']['Update']

export type DimensionScore = Database['public']['Tables']['dimension_scores']['Row']
export type DimensionScoreInsert = Database['public']['Tables']['dimension_scores']['Insert']

export type AIProvider = Database['public']['Tables']['ai_providers']['Row']
export type AIProviderInsert = Database['public']['Tables']['ai_providers']['Insert']
export type AIProviderUpdate = Database['public']['Tables']['ai_providers']['Update']

export type EvaluationResult = Database['public']['Tables']['evaluation_results']['Row']
export type EvaluationResultInsert = Database['public']['Tables']['evaluation_results']['Insert']

export type Recommendation = Database['public']['Tables']['recommendations']['Row']
export type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert']

export type CompetitorBenchmark = Database['public']['Tables']['competitor_benchmarks']['Row']
export type CompetitorBenchmarkInsert = Database['public']['Tables']['competitor_benchmarks']['Insert']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type EvaluationStatus = Database['public']['Enums']['evaluation_status']
export type GradeType = Database['public']['Enums']['grade_type']
export type RecommendationPriority = Database['public']['Enums']['recommendation_priority']

// Extended types with relationships
export interface EvaluationWithBrand extends Evaluation {
  brand: Brand
}

export interface EvaluationWithDetails extends Evaluation {
  brand: Brand
  dimension_scores: DimensionScore[]
  recommendations: Recommendation[]
  competitor_benchmarks: CompetitorBenchmark[]
}

export interface DimensionScoreWithDetails extends DimensionScore {
  evaluation: Evaluation
}

// AI Provider types
export type AIProviderName = 'openai' | 'anthropic' | 'google' | 'mistral' | 'llama'

export interface AIProviderConfig {
  name: AIProviderName
  displayName: string
  models: string[]
  isActive: boolean
  apiKey?: string
}

// Scoring types
export type DimensionName =
  | 'schema_structured_data'
  | 'semantic_clarity'
  | 'ontologies_taxonomy'
  | 'knowledge_graphs'
  | 'llm_readability'
  | 'conversational_copy'
  | 'geo_visibility'
  | 'citation_strength'
  | 'answer_quality'
  | 'sentiment_trust'
  | 'hero_products'
  | 'shipping_freight'

export interface ScoreBreakdown {
  infrastructure: number
  perception: number
  commerce: number
  overall: number
  grade: GradeType
}

export interface DimensionBreakdown {
  name: string
  score: number
  weight: number
  explanation: string
  recommendations: string[]
}

// Report types
export interface LiteDashboard {
  evaluation: Evaluation
  brand: Brand
  scoreBreakdown: ScoreBreakdown
  topRecommendations: Recommendation[]
  competitorComparison?: CompetitorBenchmark[]
}

export interface FullReport extends LiteDashboard {
  dimensionBreakdowns: DimensionBreakdown[]
  allRecommendations: Recommendation[]
  evaluationResults: EvaluationResult[]
}