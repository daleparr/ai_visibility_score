import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum, jsonb, serial, pgSchema } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Define production schema for enhanced tables
export const productionSchema = pgSchema('production')

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

// Enhanced Evaluation System Enums
export const federatedSessionTypeEnum = pgEnum('federated_session_type', ['evaluation_feedback', 'ui_interaction', 'search_behavior', 'comparison_analysis'])
export const privacyLevelEnum = pgEnum('privacy_level', ['anonymized', 'pseudonymized', 'aggregated'])
export const improvementTypeEnum = pgEnum('improvement_type', ['scoring_accuracy', 'dimension_weights', 'agent_performance', 'user_satisfaction'])
export const validationStatusEnum = pgEnum('validation_status', ['pending', 'validated', 'deployed', 'rolled_back'])
export const pageTypeEnum = pgEnum('page_type', ['homepage', 'product', 'about', 'contact', 'blog', 'search_results'])
export const changeTypeEnum = pgEnum('change_type', ['content_update', 'structure_change', 'new_feature', 'removal', 'performance_change'])
export const cacheTypeEnum = pgEnum('cache_type', ['evaluation_result', 'dimension_score', 'benchmark_data', 'competitor_analysis'])
export const trendTypeEnum = pgEnum('trend_type', ['score_trajectory', 'dimension_improvement', 'competitive_position', 'market_share'])
export const timePeriodEnum = pgEnum('time_period', ['7d', '30d', '90d', '1y'])
export const trendDirectionEnum = pgEnum('trend_direction', ['up', 'down', 'stable', 'volatile'])
export const insightTypeEnum = pgEnum('insight_type', ['score_forecast', 'risk_assessment', 'opportunity_detection', 'competitive_threat'])
export const predictionHorizonEnum = pgEnum('prediction_horizon', ['1m', '3m', '6m', '1y'])
export const analysisTypeEnum = pgEnum('analysis_type', ['head_to_head', 'gap_analysis', 'strength_comparison', 'market_positioning'])
export const threatLevelEnum = pgEnum('threat_level', ['low', 'medium', 'high', 'critical'])
export const engagementTypeEnum = pgEnum('engagement_type', ['evaluation_request', 'leaderboard_view', 'comparison_analysis', 'report_download', 'dashboard_interaction'])
export const metricTypeEnum = pgEnum('metric_type', ['evaluation_time', 'api_response', 'database_query', 'agent_execution', 'cache_performance'])
export const evaluationQueueStatusEnum = pgEnum('evaluation_queue_status', ['pending', 'running', 'completed', 'failed', 'skipped'])
export const triggerTypeEnum = pgEnum('trigger_type', ['user_added', 'auto_detected', 'leaderboard_gap'])
export const competitiveEvaluationStatusEnum = pgEnum('competitive_evaluation_status', ['pending', 'queued', 'completed', 'failed'])
export const selectionTypeEnum = pgEnum('selection_type', ['market_leader', 'emerging', 'geographic_mix', 'price_coverage'])

// Core tables
export const users = productionSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  name: varchar('name', { length: 255 }),
  image: varchar('image', { length: 500 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const accounts = productionSchema.table('accounts', {
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

export const sessions = productionSchema.table('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const userProfiles = productionSchema.table('user_profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }),
  companyName: varchar('company_name', { length: 255 }),
  role: varchar('role', { length: 100 }),
  industry: varchar('industry', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const brands = productionSchema.table('brands', {
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

export const evaluations = productionSchema.table('evaluations', {
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

export const dimensionScores = productionSchema.table('dimension_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  dimensionName: varchar('dimension_name', { length: 100 }).notNull(),
  score: integer('score').notNull(),
  explanation: text('explanation'),
  recommendations: jsonb('recommendations').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow()
})

export const aiProviders = productionSchema.table('ai_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerName: varchar('provider_name', { length: 50 }).notNull(),
  apiKeyEncrypted: text('api_key_encrypted'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const evaluationResults = productionSchema.table('evaluation_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  providerName: varchar('provider_name', { length: 50 }).notNull(),
  testType: varchar('test_type', { length: 100 }).notNull(),
  promptUsed: text('prompt_used'),
  responseReceived: text('response_received'),
  scoreContribution: integer('score_contribution'),
  createdAt: timestamp('created_at').defaultNow()
})

export const recommendations = productionSchema.table('recommendations', {
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

export const competitorBenchmarks = productionSchema.table('competitor_benchmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  competitorUrl: varchar('competitor_url', { length: 500 }).notNull(),
  competitorName: varchar('competitor_name', { length: 255 }),
  overallScore: integer('overall_score'),
  dimensionScores: jsonb('dimension_scores'),
  createdAt: timestamp('created_at').defaultNow()
})

// AIDI Subscription Management
export const subscriptions = productionSchema.table('subscriptions', {
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

export const payments = productionSchema.table('payments', {
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
export const adiSubscriptions = productionSchema.table('adi_subscriptions', {
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

export const adiIndustries = productionSchema.table('adi_industries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  category: adiIndustryCategoryEnum('category').notNull(),
  description: text('description'),
  queryCanon: jsonb('query_canon'),
  benchmarkCriteria: jsonb('benchmark_criteria'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const adiAgents = productionSchema.table('adi_agents', {
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

export const adiAgentResults = productionSchema.table('adi_agent_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => adiAgents.id, { onDelete: 'cascade' }),
  resultType: varchar('result_type', { length: 100 }).notNull(),
  rawValue: integer('raw_value'),
  normalizedScore: integer('normalized_score'),
  confidenceLevel: integer('confidence_level'),
  evidence: jsonb('evidence'),
  createdAt: timestamp('created_at').defaultNow()
})

export const adiBenchmarks = productionSchema.table('adi_benchmarks', {
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

export const adiLeaderboards = productionSchema.table('adi_leaderboards', {
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

// Leaderboard Data System Tables
export const evaluationQueue = productionSchema.table('evaluation_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandName: varchar('brand_name', { length: 255 }).notNull(),
  websiteUrl: varchar('website_url', { length: 500 }).notNull(),
  nicheCategory: varchar('niche_category', { length: 100 }).notNull(),
  priority: integer('priority').default(5),
  status: evaluationQueueStatusEnum('status').default('pending'),
  scheduledAt: timestamp('scheduled_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  retryCount: integer('retry_count').default(0),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const leaderboardCache = productionSchema.table('leaderboard_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  nicheCategory: varchar('niche_category', { length: 100 }).notNull(),
  brandName: varchar('brand_name', { length: 255 }).notNull(),
  websiteUrl: varchar('website_url', { length: 500 }).notNull(),
  evaluationId: uuid('evaluation_id').references(() => evaluations.id),
  adiScore: integer('adi_score').notNull(),
  grade: varchar('grade', { length: 5 }).notNull(),
  pillarScores: jsonb('pillar_scores').notNull(),
  dimensionScores: jsonb('dimension_scores').notNull(),
  strengthHighlight: jsonb('strength_highlight').notNull(),
  gapHighlight: jsonb('gap_highlight').notNull(),
  rankGlobal: integer('rank_global'),
  rankSector: integer('rank_sector'),
  rankIndustry: integer('rank_industry'),
  rankNiche: integer('rank_niche'),
  trendData: jsonb('trend_data'),
  lastEvaluated: timestamp('last_evaluated').notNull(),
  cacheExpires: timestamp('cache_expires').notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const competitiveTriggers = productionSchema.table('competitive_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  brandId: uuid('brand_id').references(() => brands.id),
  competitorUrl: varchar('competitor_url', { length: 500 }).notNull(),
  competitorName: varchar('competitor_name', { length: 255 }),
  triggerType: triggerTypeEnum('trigger_type').notNull(),
  evaluationStatus: competitiveEvaluationStatusEnum('evaluation_status').default('pending'),
  evaluationId: uuid('evaluation_id').references(() => evaluations.id),
  triggeredAt: timestamp('triggered_at').defaultNow(),
  processedAt: timestamp('processed_at')
})

export const nicheBrandSelection = productionSchema.table('niche_brand_selection', {
  id: uuid('id').primaryKey().defaultRandom(),
  nicheCategory: varchar('niche_category', { length: 100 }).notNull(),
  brandName: varchar('brand_name', { length: 255 }).notNull(),
  websiteUrl: varchar('website_url', { length: 500 }).notNull(),
  selectionType: selectionTypeEnum('selection_type').notNull(),
  priority: integer('priority').default(5),
  evaluationStatus: varchar('evaluation_status', { length: 50 }).default('pending'),
  evaluationId: uuid('evaluation_id').references(() => evaluations.id),
  addedAt: timestamp('added_at').defaultNow(),
  lastEvaluated: timestamp('last_evaluated')
})

export const leaderboardStats = productionSchema.table('leaderboard_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  nicheCategory: varchar('niche_category', { length: 100 }).notNull(),
  totalBrands: integer('total_brands').notNull(),
  evaluatedBrands: integer('evaluated_brands').notNull(),
  averageScore: integer('average_score').notNull(),
  medianScore: integer('median_score').notNull(),
  topPerformer: varchar('top_performer', { length: 255 }),
  topScore: integer('top_score'),
  lastUpdated: timestamp('last_updated').notNull(),
  createdAt: timestamp('created_at').defaultNow()

})

// Website Snapshots for Crawl Data
export const websiteSnapshots = productionSchema.table('website_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id),
  evaluationId: uuid('evaluation_id').references(() => evaluations.id),
  url: varchar('url', { length: 500 }).notNull(),
  pageType: pageTypeEnum('page_type').notNull(),
  contentHash: varchar('content_hash', { length: 64 }).notNull(),
  rawHtml: text('raw_html'),
  structuredContent: jsonb('structured_content'),
  metadata: jsonb('metadata'),
  screenshotUrl: varchar('screenshot_url', { length: 500 }),
  crawlTimestamp: timestamp('crawl_timestamp').defaultNow(),
  contentSizeBytes: integer('content_size_bytes'),
  loadTimeMs: integer('load_time_ms'),
  statusCode: integer('status_code').default(200),

  // Atomic analytics-friendly columns (avoid nested JSON on query paths)
  title: varchar('title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 255 }),
  hasTitle: boolean('has_title'),
  hasMetaDescription: boolean('has_meta_description'),
  hasStructuredData: boolean('has_structured_data'),
  structuredDataTypesCount: integer('structured_data_types_count'),
  qualityScore: integer('quality_score'),

  createdAt: timestamp('created_at').defaultNow()
})

 // Content Changes Detection
 export const contentChanges = productionSchema.table('content_changes', {
   id: uuid('id').primaryKey().defaultRandom(),
   websiteSnapshotId: uuid('website_snapshot_id').references(() => websiteSnapshots.id),
   changeType: changeTypeEnum('change_type').notNull(),
   changeDescription: text('change_description'),
   impactScore: integer('impact_score'),
   detectedAt: timestamp('detected_at').defaultNow(),
   previousSnapshotId: uuid('previous_snapshot_id').references(() => websiteSnapshots.id)
 })

 // Site-level Crawl Signals (one row per evaluation)
 export const crawlSiteSignals = productionSchema.table('crawl_site_signals', {
   id: uuid('id').primaryKey().defaultRandom(),
   evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
   brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
   domain: varchar('domain', { length: 255 }).notNull(),

   // Homepage signals
   homepageTitlePresent: boolean('homepage_title_present'),
   homepageDescriptionPresent: boolean('homepage_description_present'),
   homepageStructuredDataPresent: boolean('homepage_structured_data_present'),
   homepageStructuredDataTypesCount: integer('homepage_structured_data_types_count'),
   homepageQualityScore: integer('homepage_quality_score'),
   homepageContentSizeBytes: integer('homepage_content_size_bytes'),

   // Sitemap/robots signals
   sitemapPresent: boolean('sitemap_present'),
   sitemapUrl: varchar('sitemap_url', { length: 500 }),
   sitemapUrlCount: integer('sitemap_url_count'),
   robotsPresent: boolean('robots_present'),
   robotsUrl: varchar('robots_url', { length: 500 }),
   robotsHasSitemap: boolean('robots_has_sitemap'),

   // Crawl scope
   pagesCrawled: integer('pages_crawled'),
   pagesDiscovered: integer('pages_discovered'),

   crawlTimestamp: timestamp('crawl_timestamp').defaultNow(),
   createdAt: timestamp('created_at').defaultNow()
 })

 // Flat feature vector for federated learning (one row per evaluation)
 export const evaluationFeaturesFlat = productionSchema.table('evaluation_features_flat', {
   id: uuid('id').primaryKey().defaultRandom(),
   evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
   brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }),

   // Stable, curated features
   fHomepageQualityScore: integer('f_homepage_quality_score'),
   fHasStructuredData: boolean('f_has_structured_data'),
   fStructuredDataTypesCount: integer('f_structured_data_types_count'),
   fHasRobotsTxt: boolean('f_has_robots_txt'),
   fHasSitemap: boolean('f_has_sitemap'),
   fSitemapUrlCount: integer('f_sitemap_url_count'),
   fHomepageTitlePresent: boolean('f_homepage_title_present'),
   fHomepageDescriptionPresent: boolean('f_homepage_description_present'),
   fPagesCrawled: integer('f_pages_crawled'),
   fPagesDiscovered: integer('f_pages_discovered'),

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

// Crawl data types
export type WebsiteSnapshot = typeof websiteSnapshots.$inferSelect
export type NewWebsiteSnapshot = typeof websiteSnapshots.$inferInsert
export type CrawlSiteSignals = typeof crawlSiteSignals.$inferSelect
export type NewCrawlSiteSignals = typeof crawlSiteSignals.$inferInsert
export type EvaluationFeaturesFlat = typeof evaluationFeaturesFlat.$inferSelect
export type NewEvaluationFeaturesFlat = typeof evaluationFeaturesFlat.$inferInsert

// Leaderboard Data System Types
export type EvaluationQueue = typeof evaluationQueue.$inferSelect
export type NewEvaluationQueue = typeof evaluationQueue.$inferInsert
export type LeaderboardCache = typeof leaderboardCache.$inferSelect
export type NewLeaderboardCache = typeof leaderboardCache.$inferInsert
export type CompetitiveTrigger = typeof competitiveTriggers.$inferSelect
export type NewCompetitiveTrigger = typeof competitiveTriggers.$inferInsert
export type NicheBrandSelection = typeof nicheBrandSelection.$inferSelect
export type NewNicheBrandSelection = typeof nicheBrandSelection.$inferInsert
export type LeaderboardStats = typeof leaderboardStats.$inferSelect
export type NewLeaderboardStats = typeof leaderboardStats.$inferInsert