import { eq, desc, and } from 'drizzle-orm'
import { db, sql, brands, evaluations, dimensionScores, aiProviders, evaluationResults, recommendations, competitorBenchmarks, users, userProfiles, websiteSnapshots, crawlSiteSignals, evaluationFeaturesFlat } from './db'
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
  NewUser,
  WebsiteSnapshot,
  NewWebsiteSnapshot,
  CrawlSiteSignals,
  NewCrawlSiteSignals,
  EvaluationFeaturesFlat,
  NewEvaluationFeaturesFlat
} from './db/schema'
import { normalizeBrandUrl, canonicalHost } from './brand-normalize'

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
    const normalizedUrl = normalizeBrandUrl(brand.websiteUrl || '')
    console.log('🔍 [DB] Creating brand (canonicalized):', {
      name: brand.name,
      websiteUrl: normalizedUrl,
      userId: brand.userId,
      industry: brand.industry
    })

    if (!db) {
      throw new Error('No database connection available - cannot create brand')
    }

    // Prefer raw SQL UPSERT so we can target the generated column normalized_host
    const competitorsJson = Array.isArray((brand as any).competitors) ? (brand as any).competitors : []
    const rows = await sql<any>`
      INSERT INTO production.brands
        (user_id, name, website_url, industry, description, competitors)
      VALUES
        (${brand.userId}, ${brand.name}, ${normalizedUrl}, ${brand.industry ?? null}, ${ (brand as any).description ?? null }, ${JSON.stringify(competitorsJson)}::jsonb)
      ON CONFLICT (user_id, normalized_host)
      DO UPDATE SET
        name = EXCLUDED.name,
        website_url = EXCLUDED.website_url,
        industry = COALESCE(EXCLUDED.industry, production.brands.industry),
        description = COALESCE(EXCLUDED.description, production.brands.description),
        competitors = COALESCE(EXCLUDED.competitors, production.brands.competitors),
        updated_at = now()
      RETURNING id, user_id, name, website_url, industry, description, competitors, created_at, updated_at
    `
    const row = rows?.[0]
    if (!row) throw new Error('Brand upsert returned empty result')

    console.log('✅ [DB] Brand upsert successful:', row.id)
    return {
      ...(brand as any),
      id: row.id,
      userId: row.user_id,
      name: row.name,
      websiteUrl: row.website_url,
      industry: row.industry,
      description: row.description,
      competitors: row.competitors,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as any
  } catch (error: any) {
    console.error('❌ [DB] Error creating/upserting brand:', error)
    console.error('❌ [DB] Error code:', error?.code)
    console.error('❌ [DB] Error message:', error?.message)

    // Best-effort lookup by (user_id, normalized_host)
    try {
      const host = canonicalHost((brand as any).websiteUrl || '')
      const rows2 = await sql<any>`
        SELECT id, user_id, name, website_url, industry, description, competitors, created_at, updated_at
        FROM production.brands
        WHERE user_id = ${brand.userId} AND normalized_host = ${host}
        LIMIT 1
      `
      const row2 = rows2?.[0]
      if (row2) {
        console.log('ℹ️ [DB] Returned existing brand after conflict:', row2.id)
        return {
          ...(brand as any),
          id: row2.id,
          userId: row2.user_id,
          name: row2.name,
          websiteUrl: row2.website_url,
          industry: row2.industry,
          description: row2.description,
          competitors: row2.competitors,
          createdAt: row2.created_at,
          updatedAt: row2.updated_at
        } as any
      }
    } catch (lookupErr) {
      console.error('⚠️ [DB] Fallback lookup after brand upsert error failed:', lookupErr)
    }

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
    
    console.log('✅ [DB] Evaluation created successfully (ORM):', result[0].id)
    return result[0]
  } catch (error: any) {
    console.error('❌ [DB] Failed to create evaluation via ORM, attempting raw SQL fallback:', error)
    console.error('❌ [DB] Evaluation data:', evaluation)
    console.error('❌ [DB] Database instance type:', typeof db)
    console.error('❌ [DB] Database methods:', db ? Object.keys(db) : 'null')

    // Fallback: raw SQL upsert targeting production schema
    try {
      const ev: any = evaluation || {}
      const rows = await sql<any>`
        INSERT INTO production.evaluations
          (id, brand_id, status, overall_score, grade, verdict,
           strongest_dimension, weakest_dimension, biggest_opportunity,
           adi_score, adi_grade, confidence_interval, reliability_score,
           industry_percentile, global_rank, methodology_version,
           started_at, completed_at)
        VALUES
          (${ev.id ?? null},
           ${ev.brandId},
           ${ev.status ?? 'pending'},
           ${ev.overallScore ?? null},
           ${ev.grade ?? null},
           ${ev.verdict ?? null},
           ${ev.strongestDimension ?? null},
           ${ev.weakestDimension ?? null},
           ${ev.biggestOpportunity ?? null},
           ${ev.adiScore ?? null},
           ${ev.adiGrade ?? null},
           ${ev.confidenceInterval ?? null},
           ${ev.reliabilityScore ?? null},
           ${ev.industryPercentile ?? null},
           ${ev.globalRank ?? null},
           ${ev.methodologyVersion ?? 'ADI-v1.0'},
           ${ev.startedAt ?? new Date()},
           ${ev.completedAt ?? null})
        ON CONFLICT (id)
        DO UPDATE SET
           brand_id = EXCLUDED.brand_id,
           status = EXCLUDED.status,
           overall_score = COALESCE(EXCLUDED.overall_score, production.evaluations.overall_score),
           grade = COALESCE(EXCLUDED.grade, production.evaluations.grade),
           verdict = COALESCE(EXCLUDED.verdict, production.evaluations.verdict),
           strongest_dimension = COALESCE(EXCLUDED.strongest_dimension, production.evaluations.strongest_dimension),
           weakest_dimension = COALESCE(EXCLUDED.weakest_dimension, production.evaluations.weakest_dimension),
           biggest_opportunity = COALESCE(EXCLUDED.biggest_opportunity, production.evaluations.biggest_opportunity),
           adi_score = COALESCE(EXCLUDED.adi_score, production.evaluations.adi_score),
           adi_grade = COALESCE(EXCLUDED.adi_grade, production.evaluations.adi_grade),
           confidence_interval = COALESCE(EXCLUDED.confidence_interval, production.evaluations.confidence_interval),
           reliability_score = COALESCE(EXCLUDED.reliability_score, production.evaluations.reliability_score),
           industry_percentile = COALESCE(EXCLUDED.industry_percentile, production.evaluations.industry_percentile),
           global_rank = COALESCE(EXCLUDED.global_rank, production.evaluations.global_rank),
           methodology_version = COALESCE(EXCLUDED.methodology_version, production.evaluations.methodology_version),
           started_at = COALESCE(EXCLUDED.started_at, production.evaluations.started_at),
           completed_at = COALESCE(EXCLUDED.completed_at, production.evaluations.completed_at),
           updated_at = now()
        RETURNING
           id,
           brand_id       AS "brandId",
           status,
           overall_score  AS "overallScore",
           grade,
           verdict,
           strongest_dimension AS "strongestDimension",
           weakest_dimension   AS "weakestDimension",
           biggest_opportunity AS "biggestOpportunity",
           adi_score           AS "adiScore",
           adi_grade           AS "adiGrade",
           confidence_interval AS "confidenceInterval",
           reliability_score   AS "reliabilityScore",
           industry_percentile AS "industryPercentile",
           global_rank         AS "globalRank",
           methodology_version AS "methodologyVersion",
           started_at          AS "startedAt",
           completed_at        AS "completedAt",
           created_at          AS "createdAt",
           updated_at          AS "updatedAt"
      `
      const row = rows?.[0]
      if (!row) throw new Error('Raw SQL upsert returned no row for evaluations')
      console.log('✅ [DB] Evaluation created via raw SQL fallback:', row.id)
      return row as any
    } catch (fallbackErr) {
      console.error('❌ [DB] Raw SQL fallback for evaluations also failed:', fallbackErr)
      throw fallbackErr
    }
  }
}

export const updateEvaluation = async (evaluationId: string, updates: Partial<NewEvaluation>): Promise<Evaluation | undefined> => {
  try {
    const result = await db.update(evaluations).set(updates).where(eq(evaluations.id, evaluationId)).returning()
    return result[0]
  } catch (error: any) {
    console.error('❌ [DB] Failed to update evaluation via ORM, attempting raw SQL fallback:', error)
    try {
      const u: any = updates || {}
      const rows = await sql<any>`
        UPDATE production.evaluations
        SET
          status = COALESCE(${u.status ?? null}, status),
          overall_score = COALESCE(${u.overallScore ?? null}, overall_score),
          grade = COALESCE(${u.grade ?? null}, grade),
          verdict = COALESCE(${u.verdict ?? null}, verdict),
          strongest_dimension = COALESCE(${u.strongestDimension ?? null}, strongest_dimension),
          weakest_dimension = COALESCE(${u.weakestDimension ?? null}, weakest_dimension),
          biggest_opportunity = COALESCE(${u.biggestOpportunity ?? null}, biggest_opportunity),
          adi_score = COALESCE(${u.adiScore ?? null}, adi_score),
          adi_grade = COALESCE(${u.adiGrade ?? null}, adi_grade),
          confidence_interval = COALESCE(${u.confidenceInterval ?? null}, confidence_interval),
          reliability_score = COALESCE(${u.reliabilityScore ?? null}, reliability_score),
          industry_percentile = COALESCE(${u.industryPercentile ?? null}, industry_percentile),
          global_rank = COALESCE(${u.globalRank ?? null}, global_rank),
          methodology_version = COALESCE(${u.methodologyVersion ?? null}, methodology_version),
          started_at = COALESCE(${u.startedAt ?? null}, started_at),
          completed_at = COALESCE(${u.completedAt ?? null}, completed_at),
          updated_at = now()
        WHERE id = ${evaluationId}
        RETURNING
          id,
          brand_id       AS "brandId",
          status,
          overall_score  AS "overallScore",
          grade,
          verdict,
          strongest_dimension AS "strongestDimension",
          weakest_dimension   AS "weakestDimension",
          biggest_opportunity AS "biggestOpportunity",
          adi_score           AS "adiScore",
          adi_grade           AS "adiGrade",
          confidence_interval AS "confidenceInterval",
          reliability_score   AS "reliabilityScore",
          industry_percentile AS "industryPercentile",
          global_rank         AS "globalRank",
          methodology_version AS "methodologyVersion",
          started_at          AS "startedAt",
          completed_at        AS "completedAt",
          created_at          AS "createdAt",
          updated_at          AS "UpdatedAt"
      `
      const row = rows?.[0]
      return row as any
    } catch (fallbackErr) {
      console.error('❌ [DB] Raw SQL fallback for evaluation update also failed:', fallbackErr)
      throw fallbackErr
    }
  }
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
    
    console.log('✅ [DB] Dimension score created (ORM):', result[0].id)
    return result[0]
  } catch (error: any) {
    console.error('❌ [DB] Failed to create dimension score via ORM, attempting raw SQL fallback:', error)
    console.error('❌ [DB] Score data:', score)

    // Fallback: raw SQL UPSERT on (evaluation_id, dimension_name)
    try {
      const s: any = score || {}
      const recJson = JSON.stringify(s.recommendations ?? {})
      const rows = await sql<any>`
        INSERT INTO production.dimension_scores
          (evaluation_id, dimension_name, score, explanation, recommendations)
        VALUES
          (${s.evaluationId},
           ${s.dimensionName},
           ${Number(s.score ?? 0)},
           ${s.explanation ?? null},
           ${recJson}::jsonb)
        ON CONFLICT (evaluation_id, dimension_name)
        DO UPDATE SET
          score = EXCLUDED.score,
          explanation = COALESCE(EXCLUDED.explanation, production.dimension_scores.explanation),
          recommendations = COALESCE(EXCLUDED.recommendations, production.dimension_scores.recommendations)
        RETURNING
          id,
          evaluation_id  AS "evaluationId",
          dimension_name AS "dimensionName",
          score,
          explanation,
          recommendations,
          created_at     AS "createdAt"
      `
      const row = rows?.[0]
      if (!row) throw new Error('Raw SQL upsert returned no row for dimension_scores')
      console.log('✅ [DB] Dimension score created via raw SQL fallback:', row.id)
      return row as any
    } catch (fallbackErr) {
      console.error('❌ [DB] Raw SQL fallback for dimension_scores also failed:', fallbackErr)
      throw fallbackErr
    }
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

// Crawl data persistence helpers
export const createWebsiteSnapshot = async (snapshot: NewWebsiteSnapshot): Promise<WebsiteSnapshot> => {
  try {
    const result = await db.insert(websiteSnapshots).values(snapshot).returning()
    if (!result || result.length === 0) throw new Error('Insert returned empty result - website snapshot save failed')
    console.log('✅ [DB] Website snapshot created:', result[0].id)
    return result[0]
  } catch (error: any) {
    console.error('❌ [DB] Failed to create website snapshot:', error)
    console.error('❌ [DB] Snapshot data keys:', Object.keys(snapshot || {}))

    // Fallback: prefer ultra-minimal insert first to handle older production schema without advanced columns
    try {
      const pageType = (snapshot as any).pageType ?? 'homepage'
      const contentHash = (snapshot as any).contentHash ?? (String((snapshot as any).evaluationId || '').replace(/-/g, '') + '0'.repeat(64)).slice(0, 64)

      const rows2 = await sql<any>`
        INSERT INTO production.website_snapshots
          (brand_id, evaluation_id, url, page_type, content_hash)
        VALUES
          (${(snapshot as any).brandId || null}, ${snapshot.evaluationId}, ${snapshot.url}, ${String(pageType)}, ${contentHash})
        ON CONFLICT (evaluation_id, url, page_type)
        DO UPDATE SET
          content_hash = EXCLUDED.content_hash,
          crawl_timestamp = COALESCE(EXCLUDED.crawl_timestamp, production.website_snapshots.crawl_timestamp)
        RETURNING id, evaluation_id, url
      `
      const row2 = rows2?.[0]
      if (!row2) throw new Error('Raw minimal insert returned no rows for website_snapshots')
      console.log('✅ [DB] Website snapshot created via ultra-minimal SQL fallback:', row2.id)

      return {
        ...(snapshot as any),
        id: row2.id,
      } as any
    } catch (minimalErr: any) {
      console.error('❌ [DB] Ultra-minimal SQL fallback for website_snapshots failed:', minimalErr)

      // As a last resort, attempt advanced insert (only works if schema has analytics-friendly columns)
      try {
        const pageType = (snapshot as any).pageType ?? 'homepage'
        const statusCode = (snapshot as any).statusCode ?? 200

        // Ensure JSON values are serialized properly
        const structured = Array.isArray((snapshot as any).structuredContent) ? (snapshot as any).structuredContent : []
        const metadata = (snapshot as any).metadata && typeof (snapshot as any).metadata === 'object' ? (snapshot as any).metadata : {}

        const rows = await sql<any>`
          INSERT INTO production.website_snapshots
            (brand_id, evaluation_id, url, page_type, content_hash, raw_html, structured_content, metadata, status_code, content_size_bytes, title, meta_description, has_title, has_meta_description, has_structured_data, structured_data_types_count, crawl_timestamp)
          VALUES
            (${
              (snapshot as any).brandId || null
            }, ${snapshot.evaluationId}, ${snapshot.url}, ${String(pageType)}, ${snapshot.contentHash},
             ${ (snapshot as any).rawHtml ?? ''}, ${JSON.stringify(structured)}::jsonb, ${JSON.stringify(metadata)}::jsonb, ${statusCode},
             ${ (snapshot as any).contentSizeBytes ?? null}, ${ (snapshot as any).title ?? null}, ${ (snapshot as any).metaDescription ?? null},
             ${ (snapshot as any).hasTitle ?? null}, ${ (snapshot as any).hasMetaDescription ?? null}, ${ (snapshot as any).hasStructuredData ?? null},
             ${ (snapshot as any).structuredDataTypesCount ?? null}, ${ (snapshot as any).crawlTimestamp ?? new Date()}
            )
          ON CONFLICT (evaluation_id, url, page_type)
          DO UPDATE SET
            raw_html = EXCLUDED.raw_html,
            structured_content = EXCLUDED.structured_content,
            metadata = EXCLUDED.metadata,
            status_code = EXCLUDED.status_code,
            content_size_bytes = EXCLUDED.content_size_bytes,
            title = EXCLUDED.title,
            meta_description = EXCLUDED.meta_description,
            has_title = EXCLUDED.has_title,
            has_meta_description = EXCLUDED.has_meta_description,
            has_structured_data = EXCLUDED.has_structured_data,
            structured_data_types_count = EXCLUDED.structured_data_types_count,
            crawl_timestamp = EXCLUDED.crawl_timestamp
          RETURNING id, evaluation_id, url
        `
        const row = rows?.[0]
        if (!row) throw new Error('Raw insert returned no rows for website_snapshots (advanced)')
        console.log('✅ [DB] Website snapshot created via raw SQL advanced fallback:', row.id)

        return {
          ...(snapshot as any),
          id: row.id,
        } as any
      } catch (advancedErr: any) {
        const msg = error?.message || String(error)
        const minimalMsg = minimalErr?.message || String(minimalErr)
        const advancedMsg = advancedErr?.message || String(advancedErr)
        const combined = new Error(`[website_snapshots] primary insert failed: ${msg} | minimal failed: ${minimalMsg} | advanced failed: ${advancedMsg}`)
        ;(combined as any).code = (advancedErr?.code || minimalErr?.code || error?.code)
        ;(combined as any).detail = (advancedErr?.detail || minimalErr?.detail || error?.detail)
        ;(combined as any).constraint = (advancedErr?.constraint || minimalErr?.constraint || error?.constraint)
        throw combined
      }
    }
  }
}

export const createCrawlSiteSignals = async (signals: NewCrawlSiteSignals): Promise<CrawlSiteSignals> => {
  try {
    const result = await db.insert(crawlSiteSignals).values(signals).returning()
    if (!result || result.length === 0) throw new Error('Insert returned empty result - crawl site signals save failed')
    console.log('✅ [DB] Crawl site signals created:', result[0].id)
    return result[0]
  } catch (error: any) {
    console.error('❌ [DB] Failed to create crawl site signals:', error)
    console.error('❌ [DB] Signals data keys:', Object.keys(signals || {}))

    // Raw SQL fallback to avoid ORM brittleness and undefined/enum issues
    try {
      const s: any = signals || {}
      const rows = await sql<any>`
        INSERT INTO production.crawl_site_signals
          (evaluation_id, brand_id, domain,
           homepage_title_present, homepage_description_present, homepage_structured_data_present,
           homepage_structured_data_types_count, homepage_quality_score, homepage_content_size_bytes,
           sitemap_present, sitemap_url, sitemap_url_count,
           robots_present, robots_url, robots_has_sitemap,
           pages_crawled, pages_discovered,
           crawl_timestamp)
        VALUES
          (${s.evaluationId},
           ${s.brandId || null},
           ${String(s.domain || '')},
           ${Boolean(s.homepageTitlePresent)},
           ${Boolean(s.homepageDescriptionPresent)},
           ${Boolean(s.homepageStructuredDataPresent)},
           ${Number(s.homepageStructuredDataTypesCount || 0)},
           ${Number(s.homepageQualityScore || 0)},
           ${Number(s.homepageContentSizeBytes || 0)},
           ${Boolean(s.sitemapPresent)},
           ${s.sitemapUrl || null},
           ${Number(s.sitemapUrlCount || 0)},
           ${Boolean(s.robotsPresent)},
           ${s.robotsUrl || null},
           ${Boolean(s.robotsHasSitemap)},
           ${Number(s.pagesCrawled || 0)},
           ${Number(s.pagesDiscovered || 0)},
           ${s.crawlTimestamp || new Date()})
        ON CONFLICT (evaluation_id)
        DO UPDATE SET
           brand_id = EXCLUDED.brand_id,
           domain = EXCLUDED.domain,
           homepage_title_present = EXCLUDED.homepage_title_present,
           homepage_description_present = EXCLUDED.homepage_description_present,
           homepage_structured_data_present = EXCLUDED.homepage_structured_data_present,
           homepage_structured_data_types_count = EXCLUDED.homepage_structured_data_types_count,
           homepage_quality_score = EXCLUDED.homepage_quality_score,
           homepage_content_size_bytes = EXCLUDED.homepage_content_size_bytes,
           sitemap_present = EXCLUDED.sitemap_present,
           sitemap_url = EXCLUDED.sitemap_url,
           sitemap_url_count = EXCLUDED.sitemap_url_count,
           robots_present = EXCLUDED.robots_present,
           robots_url = EXCLUDED.robots_url,
           robots_has_sitemap = EXCLUDED.robots_has_sitemap,
           pages_crawled = EXCLUDED.pages_crawled,
           pages_discovered = EXCLUDED.pages_discovered,
           crawl_timestamp = EXCLUDED.crawl_timestamp
        RETURNING id, evaluation_id
      `
      const row = rows?.[0]
      if (!row) throw new Error('Raw insert returned no rows for crawl_site_signals')
      console.log('✅ [DB] Crawl site signals created via raw SQL fallback:', row.id)
      return {
        ...(signals as any),
        id: row.id
      } as any
    } catch (fallbackErr) {
      console.error('❌ [DB] Raw SQL fallback for crawl_site_signals also failed:', fallbackErr)
      const combined = new Error(`[crawl_site_signals] primary insert failed: ${error?.message || String(error)} | fallback failed: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`)
      throw combined
    }
  }
}

export const createEvaluationFeaturesFlat = async (features: NewEvaluationFeaturesFlat): Promise<EvaluationFeaturesFlat> => {
  try {
    const result = await db.insert(evaluationFeaturesFlat).values(features).returning()
    if (!result || result.length === 0) throw new Error('Insert returned empty result - features flat save failed')
    console.log('✅ [DB] Evaluation features flat created:', result[0].evaluationId)
    return result[0]
  } catch (error: any) {
    console.error('❌ [DB] Failed to create evaluation features flat:', error)
    console.error('❌ [DB] Feature data keys:', Object.keys(features || {}))

    // Raw SQL fallback to ensure persistence under serverless constraints
    try {
      const f: any = features || {}
      const rows = await sql<any>`
        INSERT INTO production.evaluation_features_flat
          (evaluation_id, brand_id,
           f_homepage_quality_score, f_has_structured_data, f_structured_data_types_count,
           f_has_robots_txt, f_has_sitemap, f_sitemap_url_count,
           f_homepage_title_present, f_homepage_description_present,
           f_pages_crawled, f_pages_discovered)
        VALUES
          (${f.evaluationId},
           ${f.brandId || null},
           ${Number(f.fHomepageQualityScore || 0)},
           ${Boolean(f.fHasStructuredData)},
           ${Number(f.fStructuredDataTypesCount || 0)},
           ${Boolean(f.fHasRobotsTxt)},
           ${Boolean(f.fHasSitemap)},
           ${Number(f.fSitemapUrlCount || 0)},
           ${Boolean(f.fHomepageTitlePresent)},
           ${Boolean(f.fHomepageDescriptionPresent)},
           ${Number(f.fPagesCrawled || 0)},
           ${Number(f.fPagesDiscovered || 0)})
        ON CONFLICT (evaluation_id)
        DO UPDATE SET
           brand_id = EXCLUDED.brand_id,
           f_homepage_quality_score = EXCLUDED.f_homepage_quality_score,
           f_has_structured_data = EXCLUDED.f_has_structured_data,
           f_structured_data_types_count = EXCLUDED.f_structured_data_types_count,
           f_has_robots_txt = EXCLUDED.f_has_robots_txt,
           f_has_sitemap = EXCLUDED.f_has_sitemap,
           f_sitemap_url_count = EXCLUDED.f_sitemap_url_count,
           f_homepage_title_present = EXCLUDED.f_homepage_title_present,
           f_homepage_description_present = EXCLUDED.f_homepage_description_present,
           f_pages_crawled = EXCLUDED.f_pages_crawled,
           f_pages_discovered = EXCLUDED.f_pages_discovered
        RETURNING id, evaluation_id
      `
      const row = rows?.[0]
      if (!row) throw new Error('Raw insert returned no rows for evaluation_features_flat')
      console.log('✅ [DB] Evaluation features flat created via raw SQL fallback:', row.id)
      return {
        ...(features as any),
        id: row.id
      } as any
    } catch (fallbackErr) {
      console.error('❌ [DB] Raw SQL fallback for evaluation_features_flat also failed:', fallbackErr)
      const combined = new Error(`[evaluation_features_flat] primary insert failed: ${error?.message || String(error)} | fallback failed: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`)
      throw combined
    }
  }
}
