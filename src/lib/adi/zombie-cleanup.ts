/**
 * Zombie Evaluation Cleanup Utility
 * Handles cleanup of evaluations stuck in 'running' state
 */

import { sql } from '@/lib/db'

export interface ZombieCleanupResult {
  cleanedCount: number
  zombieEvaluations: Array<{
    id: string
    brandName: string
    websiteUrl: string
    startedAt: string
    runningDuration: number
  }>
}

/**
 * Clean up zombie evaluations that have been running for too long
 * @param maxRunningMinutes Maximum minutes an evaluation should run before being considered zombie
 * @returns Cleanup result with count and details
 */
export async function cleanupZombieEvaluations(maxRunningMinutes: number = 10): Promise<ZombieCleanupResult> {
  try {
    console.log(`🧹 [ZOMBIE_CLEANUP] Starting cleanup of evaluations running longer than ${maxRunningMinutes} minutes`)
    
    // First, identify zombie evaluations
    const zombieEvaluations = await sql<Array<{
      id: string
      brand_name: string
      website_url: string
      started_at: string
      running_duration_minutes: number
    }>>`
      SELECT 
        e.id,
        b.name as brand_name,
        b.website_url,
        e.started_at,
        EXTRACT(EPOCH FROM (NOW() - e.started_at)) / 60 as running_duration_minutes
      FROM production.evaluations e
      JOIN production.brands b ON e.brand_id = b.id
      WHERE e.status = 'running'
        AND e.started_at < NOW() - INTERVAL '${maxRunningMinutes} minutes'
      ORDER BY e.started_at ASC
    `
    
    if (zombieEvaluations.length === 0) {
      console.log(`✅ [ZOMBIE_CLEANUP] No zombie evaluations found`)
      return {
        cleanedCount: 0,
        zombieEvaluations: []
      }
    }
    
    console.log(`🚨 [ZOMBIE_CLEANUP] Found ${zombieEvaluations.length} zombie evaluations:`)
    zombieEvaluations.forEach((zombie: any) => {
      console.log(`  - ${zombie.brand_name} (${zombie.website_url}): running for ${Math.round(zombie.running_duration_minutes)} minutes`)
    })
    
    // Clean up zombie evaluations
    const cleanupResult = await sql`
      UPDATE production.evaluations 
      SET 
        status = 'failed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE status = 'running'
        AND started_at < NOW() - INTERVAL '${maxRunningMinutes} minutes'
      RETURNING id
    `
    
    const cleanedCount = cleanupResult.length
    
    console.log(`✅ [ZOMBIE_CLEANUP] Successfully cleaned up ${cleanedCount} zombie evaluations`)
    
    return {
      cleanedCount,
      zombieEvaluations: zombieEvaluations.map((zombie: any) => ({
        id: zombie.id,
        brandName: zombie.brand_name,
        websiteUrl: zombie.website_url,
        startedAt: zombie.started_at,
        runningDuration: Math.round(zombie.running_duration_minutes)
      }))
    }
    
  } catch (error) {
    console.error(`❌ [ZOMBIE_CLEANUP] Failed to cleanup zombie evaluations:`, error)
    throw error
  }
}

/**
 * Get current zombie evaluation count without cleaning up
 */
export async function getZombieEvaluationCount(maxRunningMinutes: number = 10): Promise<number> {
  try {
    const result = await sql<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM production.evaluations
      WHERE status = 'running'
        AND started_at < NOW() - INTERVAL '${maxRunningMinutes} minutes'
    `
    
    return result[0]?.count || 0
  } catch (error) {
    console.error(`❌ [ZOMBIE_COUNT] Failed to get zombie evaluation count:`, error)
    return 0
  }
}
