// Add these table definitions to src/lib/db/schema.ts
// These match the COMPREHENSIVE_PRODUCTION_SCHEMA.sql tables

// Federated Learning Sessions
export const federatedLearningSessions = productionSchema.table('federated_learning_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionType: federatedSessionTypeEnum('session_type').notNull(),
  interactionData: jsonb('interaction_data').notNull(),
  modelVersion: varchar('model_version', { length: 20 }).default('v1.0'),
  privacyLevel: privacyLevelEnum('privacy_level').default('anonymized'),
  contributionScore: integer('contribution_score').default(0),
  createdAt: timestamp('created_at').defaultNow()
})

// Model Improvements Tracking
export const modelImprovements = productionSchema.table('model_improvements', {
  id: uuid('id').primaryKey().defaultRandom(),
  improvementType: improvementTypeEnum('improvement_type').notNull(),
  currentVersion: varchar('current_version', { length: 20 }).notNull(),
  targetVersion: varchar('target_version', { length: 20 }).notNull(),
  improvementData: jsonb('improvement_data').notNull(),
  performanceMetrics: jsonb('performance_metrics'),
  validationStatus: validationStatusEnum('validation_status').default('pending'),
  deployedAt: timestamp('deployed_at'),
  createdAt: timestamp('created_at').defaultNow()
})

// Predictive Insights
export const predictiveInsights = productionSchema.table('predictive_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id),
  insightType: insightTypeEnum('insight_type').notNull(),
  predictionHorizon: predictionHorizonEnum('prediction_horizon').notNull(),
  predictedValue: integer('predicted_value'), // Changed from DECIMAL to integer for Drizzle compatibility
  confidenceInterval: jsonb('confidence_interval'),
  probabilityScore: integer('probability_score').notNull(), // 0-100 instead of DECIMAL(5,2)
  supportingEvidence: jsonb('supporting_evidence'),
  modelVersion: varchar('model_version', { length: 20 }).notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull()
})

// Competitive Analysis
export const competitiveAnalysis = productionSchema.table('competitive_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  primaryBrandId: uuid('primary_brand_id').references(() => brands.id),
  competitorBrandId: uuid('competitor_brand_id').references(() => brands.id),
  analysisType: analysisTypeEnum('analysis_type').notNull(),
  comparisonData: jsonb('comparison_data').notNull(),
  strengthsGaps: jsonb('strengths_gaps'),
  actionableInsights: jsonb('actionable_insights'),
  threatLevel: threatLevelEnum('threat_level'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
})

// User Engagement Metrics
export const userEngagementMetrics = productionSchema.table('user_engagement_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: varchar('session_id', { length: 255 }),
  engagementType: engagementTypeEnum('engagement_type').notNull(),
  interactionData: jsonb('interaction_data'),
  duration: integer('duration'), // seconds
  valueGenerated: integer('value_generated'), // business value score 0-100
  timestamp: timestamp('timestamp').defaultNow()
})

// Add relations for new tables
export const federatedLearningSessionsRelations = relations(federatedLearningSessions, ({ one }) => ({
  user: one(users, {
    fields: [federatedLearningSessions.userId],
    references: [users.id]
  })
}))

export const predictiveInsightsRelations = relations(predictiveInsights, ({ one }) => ({
  brand: one(brands, {
    fields: [predictiveInsights.brandId],
    references: [brands.id]
  })
}))

export const competitiveAnalysisRelations = relations(competitiveAnalysis, ({ one }) => ({
  primaryBrand: one(brands, {
    fields: [competitiveAnalysis.primaryBrandId],
    references: [brands.id]
  }),
  competitorBrand: one(brands, {
    fields: [competitiveAnalysis.competitorBrandId],
    references: [brands.id]
  })
}))

export const userEngagementMetricsRelations = relations(userEngagementMetrics, ({ one }) => ({
  user: one(users, {
    fields: [userEngagementMetrics.userId],
    references: [users.id]
  })
}))