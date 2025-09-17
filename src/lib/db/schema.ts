import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum, jsonb, serial } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const evaluationStatusEnum = pgEnum('evaluation_status', ['pending', 'running', 'completed', 'failed'])
export const gradeTypeEnum = pgEnum('grade_type', ['A', 'B', 'C', 'D', 'F'])
export const recommendationPriorityEnum = pgEnum('recommendation_priority', ['1', '2', '3'])
export const adiSubscriptionTierEnum = pgEnum('adi_subscription_tier', ['free', 'professional', 'enterprise'])
export const adiIndustryCategoryEnum = pgEnum('adi_industry_category', [
  'apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics',
  'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors',
  'luxury', 'mass_market', 'b2b', 'services'
])
export const agentStatusEnum = pgEnum('agent_status', ['pending', 'running', 'completed', 'failed', 'skipped'])

// Core tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  name: varchar('name', { length: 255 }),
  image: varchar('image', { length: 500 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  idToken: text('id_token'),
  sessionState: varchar('session_state', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }),
  companyName: varchar('company_name', { length: 255 }),
  role: varchar('role', { length: 100 }),
  industry: varchar('industry', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  websiteUrl: varchar('website_url', { length: 500 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  description: text('description'),
  competitors: jsonb('competitors').$type<string[]>(),
  adiIndustryId: uuid('adi_industry_id'),
  adiEnabled: boolean('adi_enabled').default(false),
  annualRevenueRange: varchar('annual_revenue_range', { length: 50 }),
  employeeCountRange: varchar('employee_count_range', { length: 50 }),
  primaryMarketRegions: jsonb('primary_market_regions').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const evaluations = pgTable('evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  status: evaluationStatusEnum('status').default('pending'),
  overallScore: integer('overall_score'),
  grade: gradeTypeEnum('grade'),
  verdict: text('verdict'),
  strongestDimension: varchar('strongest_dimension', { length: 100 }),
  weakestDimension: varchar('weakest_dimension', { length: 100 }),
  biggestOpportunity: varchar('biggest_opportunity', { length: 100 }),
  adiScore: integer('adi_score'),
  adiGrade: gradeTypeEnum('adi_grade'),
  confidenceInterval: integer('confidence_interval'),
  reliabilityScore: integer('reliability_score'),
  industryPercentile: integer('industry_percentile'),
  globalRank: integer('global_rank'),
  methodologyVersion: varchar('methodology_version', { length: 20 }).default('ADI-v1.0'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const dimensionScores = pgTable('dimension_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  dimensionName: varchar('dimension_name', { length: 100 }).notNull(),
  score: integer('score').notNull(),
  explanation: text('explanation'),
  recommendations: jsonb('recommendations').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow()
})

export const aiProviders = pgTable('ai_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerName: varchar('provider_name', { length: 50 }).notNull(),
  apiKeyEncrypted: text('api_key_encrypted'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const evaluationResults = pgTable('evaluation_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  providerName: varchar('provider_name', { length: 50 }).notNull(),
  testType: varchar('test_type', { length: 100 }).notNull(),
  promptUsed: text('prompt_used'),
  responseReceived: text('response_received'),
  scoreContribution: integer('score_contribution'),
  createdAt: timestamp('created_at').defaultNow()
})

export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  priority: recommendationPriorityEnum('priority').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  impactLevel: varchar('impact_level', { length: 20 }),
  effortLevel: varchar('effort_level', { length: 20 }),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow()
})

export const competitorBenchmarks = pgTable('competitor_benchmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  competitorUrl: varchar('competitor_url', { length: 500 }).notNull(),
  competitorName: varchar('competitor_name', { length: 255 }),
  overallScore: integer('overall_score'),
  dimensionScores: jsonb('dimension_scores'),
  createdAt: timestamp('created_at').defaultNow()
})

// AIDI Subscription Management
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id),
  stripeCustomerId: varchar('stripe_customer_id').unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id').unique(),
  tier: varchar('tier', { enum: ['free', 'professional', 'enterprise'] }).default('free'),
  status: varchar('status', { enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete'] }).default('active'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id),
  stripePaymentIntentId: varchar('stripe_payment_intent_id').unique(),
  stripeInvoiceId: varchar('stripe_invoice_id'),
  amount: integer('amount'), // in pence
  currency: varchar('currency').default('gbp'),
  status: varchar('status'),
  tier: varchar('tier'),
  createdAt: timestamp('created_at').defaultNow()
})

// AIDI Premium tables (legacy - keeping for compatibility)
export const adiSubscriptions = pgTable('adi_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tier: adiSubscriptionTierEnum('tier').notNull().default('free'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  isActive: boolean('is_active').default(true),
  monthlyEvaluationLimit: integer('monthly_evaluation_limit').default(3),
  apiAccessEnabled: boolean('api_access_enabled').default(false),
  benchmarkingEnabled: boolean('benchmarking_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const adiIndustries = pgTable('adi_industries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  category: adiIndustryCategoryEnum('category').notNull(),
  description: text('description'),
  queryCanon: jsonb('query_canon'),
  benchmarkCriteria: jsonb('benchmark_criteria'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const adiAgents = pgTable('adi_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  agentName: varchar('agent_name', { length: 100 }).notNull(),
  agentVersion: varchar('agent_version', { length: 20 }).default('v1.0'),
  status: agentStatusEnum('status').default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  executionTimeMs: integer('execution_time_ms'),
  inputData: jsonb('input_data'),
  outputData: jsonb('output_data'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at').defaultNow()
})

export const adiAgentResults = pgTable('adi_agent_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => adiAgents.id, { onDelete: 'cascade' }),
  resultType: varchar('result_type', { length: 100 }).notNull(),
  rawValue: integer('raw_value'),
  normalizedScore: integer('normalized_score'),
  confidenceLevel: integer('confidence_level'),
  evidence: jsonb('evidence'),
  createdAt: timestamp('created_at').defaultNow()
})

export const adiBenchmarks = pgTable('adi_benchmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  industryId: uuid('industry_id').references(() => adiIndustries.id),
  benchmarkDate: timestamp('benchmark_date').notNull(),
  totalBrandsEvaluated: integer('total_brands_evaluated'),
  medianScore: integer('median_score'),
  p25Score: integer('p25_score'),
  p75Score: integer('p75_score'),
  p90Score: integer('p90_score'),
  topPerformerScore: integer('top_performer_score'),
  dimensionMedians: jsonb('dimension_medians'),
  methodologyVersion: varchar('methodology_version', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow()
})

export const adiLeaderboards = pgTable('adi_leaderboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  industryId: uuid('industry_id').references(() => adiIndustries.id),
  rankGlobal: integer('rank_global'),
  rankIndustry: integer('rank_industry'),
  rankCategory: integer('rank_category'),
  adiScore: integer('adi_score'),
  scoreChange30d: integer('score_change_30d'),
  scoreChange90d: integer('score_change_90d'),
  isPublic: boolean('is_public').default(false),
  featuredBadge: varchar('featured_badge', { length: 100 }),
  leaderboardDate: timestamp('leaderboard_date').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  brands: many(brands),
  aiProviders: many(aiProviders),
  adiSubscriptions: many(adiSubscriptions)
}))

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, {
    fields: [brands.userId],
    references: [users.id]
  }),
  evaluations: many(evaluations),
  adiIndustry: one(adiIndustries, {
    fields: [brands.adiIndustryId],
    references: [adiIndustries.id]
  })
}))

export const evaluationsRelations = relations(evaluations, ({ one, many }) => ({
  brand: one(brands, {
    fields: [evaluations.brandId],
    references: [brands.id]
  }),
  dimensionScores: many(dimensionScores),
  evaluationResults: many(evaluationResults),
  recommendations: many(recommendations),
  competitorBenchmarks: many(competitorBenchmarks),
  adiAgents: many(adiAgents)
}))

export const dimensionScoresRelations = relations(dimensionScores, ({ one }) => ({
  evaluation: one(evaluations, {
    fields: [dimensionScores.evaluationId],
    references: [evaluations.id]
  })
}))

export const aiProvidersRelations = relations(aiProviders, ({ one }) => ({
  user: one(users, {
    fields: [aiProviders.userId],
    references: [users.id]
  })
}))

export const evaluationResultsRelations = relations(evaluationResults, ({ one }) => ({
  evaluation: one(evaluations, {
    fields: [evaluationResults.evaluationId],
    references: [evaluations.id]
  })
}))

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  evaluation: one(evaluations, {
    fields: [recommendations.evaluationId],
    references: [evaluations.id]
  })
}))

export const competitorBenchmarksRelations = relations(competitorBenchmarks, ({ one }) => ({
  evaluation: one(evaluations, {
    fields: [competitorBenchmarks.evaluationId],
    references: [evaluations.id]
  })
}))

export const adiAgentsRelations = relations(adiAgents, ({ one, many }) => ({
  evaluation: one(evaluations, {
    fields: [adiAgents.evaluationId],
    references: [evaluations.id]
  }),
  results: many(adiAgentResults)
}))

export const adiAgentResultsRelations = relations(adiAgentResults, ({ one }) => ({
  agent: one(adiAgents, {
    fields: [adiAgentResults.agentId],
    references: [adiAgents.id]
  })
}))

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Brand = typeof brands.$inferSelect
export type NewBrand = typeof brands.$inferInsert
export type Evaluation = typeof evaluations.$inferSelect
export type NewEvaluation = typeof evaluations.$inferInsert
export type DimensionScore = typeof dimensionScores.$inferSelect
export type NewDimensionScore = typeof dimensionScores.$inferInsert
export type AIProvider = typeof aiProviders.$inferSelect
export type NewAIProvider = typeof aiProviders.$inferInsert
export type EvaluationResult = typeof evaluationResults.$inferSelect
export type NewEvaluationResult = typeof evaluationResults.$inferInsert
export type Recommendation = typeof recommendations.$inferSelect
export type NewRecommendation = typeof recommendations.$inferInsert