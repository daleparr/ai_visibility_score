// =====================================================================================
// DATA SAFETY GUARDS AND UTILITIES
// Bulletproof data validation and normalization for database persistence
// =====================================================================================

/**
 * Clamp numeric values to safe ranges. Reject/normalize NaN.
 * @param x - Value to clamp
 * @param lo - Minimum value (default: 0)
 * @param hi - Maximum value (default: 100)
 * @returns Clamped numeric value
 */
export const clampNumeric = (x: any, lo: number = 0, hi: number = 100): number => {
  const num = Number(x)
  if (isNaN(num)) return lo
  return Math.max(lo, Math.min(hi, num))
}

/**
 * Ensure boolean values are properly typed (not null for non-nullable columns)
 * @param x - Value to convert to boolean
 * @param defaultValue - Default value if x is null/undefined (default: false)
 * @returns Boolean value
 */
export const safeBool = (x: any, defaultValue: boolean = false): boolean => {
  if (x === null || x === undefined) return defaultValue
  return Boolean(x)
}

/**
 * Ensure string values are safe for database storage
 * @param x - Value to convert to string
 * @param maxLength - Maximum string length (default: 1000)
 * @param defaultValue - Default value if x is null/undefined (default: '')
 * @returns Safe string value
 */
export const safeString = (x: any, maxLength: number = 1000, defaultValue: string = ''): string => {
  if (x === null || x === undefined) return defaultValue
  const str = String(x)
  return str.length > maxLength ? str.slice(0, maxLength) : str
}

/**
 * Ensure JSON values are properly serialized for database storage
 * @param x - Value to convert to JSON
 * @param defaultValue - Default value if x is null/undefined/invalid (default: {})
 * @returns Safe JSON object
 */
export const safeJson = (x: any, defaultValue: any = {}): any => {
  if (x === null || x === undefined) return defaultValue
  if (typeof x === 'object') return x
  try {
    return JSON.parse(String(x))
  } catch {
    return defaultValue
  }
}

/**
 * Generate a short trace ID for request tracking (8 chars from UUID)
 * @param fullId - Full UUID or string to extract from
 * @returns 8-character trace ID
 */
export const generateTraceId = (fullId?: string): string => {
  if (fullId && fullId.length >= 8) {
    return fullId.replace(/-/g, '').slice(0, 8).toUpperCase()
  }
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

/**
 * Safe database score clamping for ADI scores
 * @param score - Score value to clamp
 * @returns Score clamped to 0-100 range
 */
export const clampScore = (score: any): number => clampNumeric(score, 0, 100)

/**
 * Safe database percentage clamping
 * @param percentage - Percentage value to clamp
 * @returns Percentage clamped to 0-100 range
 */
export const clampPercentage = (percentage: any): number => clampNumeric(percentage, 0, 100)

/**
 * Safe database count clamping (non-negative integers)
 * @param count - Count value to clamp
 * @param maxCount - Maximum allowed count (default: 10000)
 * @returns Count clamped to 0-maxCount range
 */
export const clampCount = (count: any, maxCount: number = 10000): number => {
  const num = clampNumeric(count, 0, maxCount)
  return Math.floor(num) // Ensure integer
}

/**
 * Safe database byte size clamping
 * @param bytes - Byte size to clamp
 * @returns Byte size clamped to 0-100MB range
 */
export const clampBytes = (bytes: any): number => clampNumeric(bytes, 0, 100 * 1024 * 1024)

/**
 * Safe content hash generation for website snapshots
 * @param content - Content to hash
 * @param evaluationId - Fallback evaluation ID for hash generation
 * @returns 64-character content hash
 */
export const safeContentHash = (content?: string, evaluationId?: string): string => {
  if (content && content.length > 0) {
    // Simple hash from content (in production, use crypto.createHash)
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64)
  }
  
  // Fallback: use evaluation ID
  const fallback = evaluationId ? evaluationId.replace(/-/g, '') : '0'
  return (fallback + '0'.repeat(64)).slice(0, 64)
}

/**
 * Comprehensive data validation for dimension scores
 * @param score - Raw dimension score data
 * @returns Validated and safe dimension score data
 */
export const validateDimensionScore = (score: any) => {
  return {
    ...score,
    score: clampScore(score?.score),
    explanation: safeString(score?.explanation, 2000, ''),
    recommendations: safeJson(score?.recommendations, {})
  }
}

/**
 * Comprehensive data validation for website snapshots
 * @param snapshot - Raw website snapshot data
 * @returns Validated and safe website snapshot data
 */
export const validateWebsiteSnapshot = (snapshot: any) => {
  return {
    ...snapshot,
    url: safeString(snapshot?.url, 2000, ''),
    pageType: safeString(snapshot?.pageType, 50, 'homepage'),
    title: safeString(snapshot?.title, 500),
    metaDescription: safeString(snapshot?.metaDescription, 1000),
    contentHash: safeContentHash(snapshot?.rawHtml, snapshot?.evaluationId),
    statusCode: clampNumeric(snapshot?.statusCode, 200, 599),
    contentSizeBytes: clampBytes(snapshot?.contentSizeBytes),
    hasTitle: safeBool(snapshot?.hasTitle),
    hasMetaDescription: safeBool(snapshot?.hasMetaDescription),
    hasStructuredData: safeBool(snapshot?.hasStructuredData),
    structuredDataTypesCount: clampCount(snapshot?.structuredDataTypesCount, 100),
    structuredContent: safeJson(snapshot?.structuredContent, []),
    metadata: safeJson(snapshot?.metadata, {})
  }
}

/**
 * Comprehensive data validation for crawl site signals
 * @param signals - Raw crawl site signals data
 * @returns Validated and safe crawl site signals data
 */
export const validateCrawlSiteSignals = (signals: any) => {
  return {
    ...signals,
    domain: safeString(signals?.domain, 255, ''),
    homepageTitlePresent: safeBool(signals?.homepageTitlePresent),
    homepageDescriptionPresent: safeBool(signals?.homepageDescriptionPresent),
    homepageStructuredDataPresent: safeBool(signals?.homepageStructuredDataPresent),
    homepageStructuredDataTypesCount: clampCount(signals?.homepageStructuredDataTypesCount, 100),
    homepageQualityScore: clampScore(signals?.homepageQualityScore),
    homepageContentSizeBytes: clampBytes(signals?.homepageContentSizeBytes),
    sitemapPresent: safeBool(signals?.sitemapPresent),
    sitemapUrl: safeString(signals?.sitemapUrl, 500),
    sitemapUrlCount: clampCount(signals?.sitemapUrlCount, 100000),
    robotsPresent: safeBool(signals?.robotsPresent),
    robotsUrl: safeString(signals?.robotsUrl, 500),
    robotsHasSitemap: safeBool(signals?.robotsHasSitemap),
    pagesCrawled: clampCount(signals?.pagesCrawled, 10000),
    pagesDiscovered: clampCount(signals?.pagesDiscovered, 100000)
  }
}

/**
 * Comprehensive data validation for evaluation features
 * @param features - Raw evaluation features data
 * @returns Validated and safe evaluation features data
 */
export const validateEvaluationFeatures = (features: any) => {
  return {
    ...features,
    fHomepageQualityScore: clampScore(features?.fHomepageQualityScore),
    fHasStructuredData: safeBool(features?.fHasStructuredData),
    fStructuredDataTypesCount: clampCount(features?.fStructuredDataTypesCount, 100),
    fHasRobotsTxt: safeBool(features?.fHasRobotsTxt),
    fHasSitemap: safeBool(features?.fHasSitemap),
    fSitemapUrlCount: clampCount(features?.fSitemapUrlCount, 100000),
    fHomepageTitlePresent: safeBool(features?.fHomepageTitlePresent),
    fHomepageDescriptionPresent: safeBool(features?.fHomepageDescriptionPresent),
    fPagesCrawled: clampCount(features?.fPagesCrawled, 10000),
    fPagesDiscovered: clampCount(features?.fPagesDiscovered, 100000)
  }
}