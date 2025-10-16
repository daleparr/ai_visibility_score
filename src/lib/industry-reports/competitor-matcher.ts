// Competitor matching and benchmarking logic

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface CompetitorRelationship {
  userId: string;
  brandDomain: string;
  competitorDomain: string;
  sectorId: string;
  confidence: 'user-confirmed' | 'ai-suggested' | 'industry-standard';
  relationshipType: 'direct' | 'adjacent' | 'aspirational';
}

/**
 * Save user-confirmed competitors from evaluation
 */
export async function saveCompetitors(
  userId: string,
  brandDomain: string,
  sectorId: string,
  competitors: string[]
): Promise<void> {
  for (const competitor of competitors) {
    if (!competitor.trim()) continue;
    
    // Normalize competitor input (could be domain or company name)
    const normalizedCompetitor = normalizeCompetitorInput(competitor);
    
    await db.execute(sql`
      INSERT INTO competitor_relationships (
        user_id, brand_domain, competitor_domain, sector_id,
        confidence, relationship_type, last_validated_at
      ) VALUES (
        ${userId},
        ${brandDomain},
        ${normalizedCompetitor},
        ${sectorId},
        'user-confirmed',
        'direct',
        now()
      )
      ON CONFLICT (user_id, brand_domain, competitor_domain)
      DO UPDATE SET
        sector_id = EXCLUDED.sector_id,
        last_validated_at = now()
    `);
  }
  
  // Also update user's primary sector
  await db.execute(sql`
    UPDATE users
    SET primary_sector_id = ${sectorId},
        sector_set_at = now()
    WHERE id = ${userId}
  `);
}

/**
 * Get user's confirmed competitors for a brand
 */
export async function getUserCompetitors(
  userId: string,
  brandDomain: string
): Promise<Array<{ domain: string; type: string }>> {
  const result = await db.execute(sql`
    SELECT competitor_domain, relationship_type, confidence
    FROM competitor_relationships
    WHERE user_id = ${userId}
      AND brand_domain = ${brandDomain}
    ORDER BY 
      CASE confidence
        WHEN 'user-confirmed' THEN 1
        WHEN 'ai-suggested' THEN 2
        ELSE 3
      END,
      added_at DESC
  `);
  
  return result.rows.map((row: any) => ({
    domain: row.competitor_domain,
    type: row.relationship_type,
  }));
}

/**
 * Get competitive benchmark data for a brand
 */
export async function getCompetitiveBenchmark(
  brandDomain: string,
  sectorId: string,
  competitors: string[],
  reportMonth: Date
): Promise<{
  userRank?: number;
  competitorRanks: Array<{ brand: string; rank: number; score: number }>;
  sectorAverage: number;
  userVsAverage: number;
}> {
  // Get brand performance data for the user's brand and their competitors
  const result = await db.execute(sql`
    SELECT 
      brand_name,
      brand_domain,
      rank_overall,
      mention_share,
      avg_sentiment_score,
      recommendation_rate
    FROM brand_performance
    WHERE sector_id = ${sectorId}
      AND report_month = ${reportMonth}
      AND (
        brand_domain = ${brandDomain}
        OR brand_domain = ANY(${competitors})
        OR brand_name = ANY(${competitors})
      )
    ORDER BY rank_overall
  `);
  
  const performances = result.rows as Array<any>;
  
  // Get sector average
  const avgResult = await db.execute(sql`
    SELECT AVG(mention_share) as avg_share
    FROM brand_performance
    WHERE sector_id = ${sectorId}
      AND report_month = ${reportMonth}
  `);
  
  const sectorAverage = avgResult.rows[0]?.avg_share || 0;
  
  // Find user's performance
  const userPerf = performances.find(p => 
    p.brand_domain === brandDomain || p.brand_name === brandDomain
  );
  
  const competitorRanks = performances
    .filter(p => p.brand_domain !== brandDomain)
    .map(p => ({
      brand: p.brand_name,
      rank: p.rank_overall,
      score: p.mention_share,
    }));
  
  return {
    userRank: userPerf?.rank_overall,
    competitorRanks,
    sectorAverage,
    userVsAverage: userPerf ? userPerf.mention_share - sectorAverage : 0,
  };
}

/**
 * Normalize competitor input (handle both domains and company names)
 */
function normalizeCompetitorInput(input: string): string {
  // Remove protocol and trailing slashes
  let normalized = input.trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
  
  // If it looks like a domain, extract it
  if (normalized.includes('.')) {
    // It's a domain
    return normalized.split('/')[0].toLowerCase();
  }
  
  // Otherwise, it's a company name - return as is
  return normalized;
}

/**
 * Suggest competitors based on sector and AI analysis (future enhancement)
 */
export async function suggestCompetitors(
  brandDomain: string,
  sectorId: string
): Promise<string[]> {
  // TODO: Use LLM to suggest competitors based on:
  // 1. Sector analysis
  // 2. Brand performance data
  // 3. Co-mention patterns in probe results
  
  // For now, return top brands in the sector
  const result = await db.execute(sql`
    SELECT brand_name
    FROM brand_performance
    WHERE sector_id = ${sectorId}
      AND brand_domain != ${brandDomain}
    ORDER BY rank_overall
    LIMIT 5
  `);
  
  return result.rows.map((row: any) => row.brand_name);
}

