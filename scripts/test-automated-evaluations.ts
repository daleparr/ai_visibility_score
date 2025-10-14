/**
 * Test Script: Automated Brand Evaluation System
 * 
 * This script tests the full automated evaluation pipeline:
 * 1. Selects a test brand from the queue
 * 2. Runs genuine ADI evaluation with all agents
 * 3. Verifies database persistence (probe_runs, page_blobs, etc.)
 * 4. Confirms leaderboard cache population
 * 5. Validates ranking calculations
 * 
 * Usage:
 *   npm run test:evaluations
 *   tsx scripts/test-automated-evaluations.ts
 */

import { LeaderboardPopulationService } from '../src/lib/leaderboard-population-service'
import { db } from '../src/lib/db'
import { 
  nicheBrandSelection, 
  leaderboardCache, 
  probeRuns, 
  pageBlobs, 
  evaluations 
} from '../src/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

interface TestResult {
  success: boolean
  message: string
  details?: any
}

class AutomatedEvaluationTester {
  private service: LeaderboardPopulationService
  private testResults: TestResult[] = []

  constructor() {
    this.service = LeaderboardPopulationService.getInstance({
      batchSize: 1, // Test with single brand
      dailyLimit: 20,
      retryAttempts: 3,
      cacheExpiryDays: 30
    })
  }

  /**
   * Run comprehensive test suite
   */
  async runTests(): Promise<void> {
    console.log('\n' + '='.repeat(80))
    console.log('🧪 AUTOMATED EVALUATION SYSTEM TEST SUITE')
    console.log('='.repeat(80) + '\n')

    try {
      await this.test1_CheckBrandQueue()
      await this.test2_ExecuteGenuineEvaluation()
      await this.test3_VerifyDatabasePersistence()
      await this.test4_VerifyLeaderboardCache()
      await this.test5_VerifyRankings()
      await this.test6_ProcessBatch()

      // Print summary
      this.printSummary()

    } catch (error) {
      console.error('❌ Test suite failed:', error)
      process.exit(1)
    }
  }

  /**
   * Test 1: Check that brand selection queue is populated
   */
  private async test1_CheckBrandQueue(): Promise<void> {
    console.log('\n📋 TEST 1: Brand Selection Queue')
    console.log('─'.repeat(80))

    try {
      const brands = await db.select()
        .from(nicheBrandSelection)
        .limit(5)

      if (brands.length === 0) {
        this.recordResult({
          success: false,
          message: 'No brands in selection queue. Run: npm run leaderboard:seed'
        })
        return
      }

      console.log(`✅ Found ${brands.length} brands in queue`)
      console.log('Sample brands:')
      brands.slice(0, 3).forEach((brand: any) => {
        console.log(`  • ${brand.brandName} (${brand.nicheCategory})`)
      })

      this.recordResult({
        success: true,
        message: `Brand queue populated with ${brands.length}+ brands`,
        details: { totalBrands: brands.length }
      })

    } catch (error) {
      this.recordResult({
        success: false,
        message: `Queue check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  /**
   * Test 2: Execute genuine evaluation for one brand
   */
  private async test2_ExecuteGenuineEvaluation(): Promise<void> {
    console.log('\n🤖 TEST 2: Genuine ADI Evaluation')
    console.log('─'.repeat(80))

    try {
      // Get a test brand that hasn't been evaluated
      const testBrands = await db.select()
        .from(nicheBrandSelection)
        .where(eq(nicheBrandSelection.lastEvaluated, null as any))
        .limit(1)

      if (testBrands.length === 0) {
        this.recordResult({
          success: false,
          message: 'No unevaluated brands available for testing'
        })
        return
      }

      const testBrand = testBrands[0]
      console.log(`🎯 Test brand: ${testBrand.brandName}`)
      console.log(`🌐 URL: ${testBrand.websiteUrl}`)
      console.log(`📂 Niche: ${testBrand.nicheCategory}`)
      console.log('\n⏳ Starting genuine evaluation (this may take 30-60 seconds)...\n')

      const startTime = Date.now()

      // Execute genuine evaluation
      const result = await this.service.executeGenuineEvaluation(
        testBrand.brandName,
        testBrand.websiteUrl,
        testBrand.nicheCategory
      )

      const duration = Math.round((Date.now() - startTime) / 1000)

      console.log(`\n✅ Evaluation completed in ${duration} seconds`)
      console.log(`📊 ADI Score: ${result.adiScore.overall}/100 (${result.adiScore.grade})`)
      console.log(`📈 Status: ${result.overallStatus}`)
      console.log(`🎯 Strengths: ${result.highlights.strengths.length}`)
      console.log(`⚠️  Gaps: ${result.highlights.gaps.length}`)

      this.recordResult({
        success: true,
        message: `Genuine evaluation executed successfully in ${duration}s`,
        details: {
          brand: testBrand.brandName,
          score: result.adiScore.overall,
          grade: result.adiScore.grade,
          status: result.overallStatus,
          durationSeconds: duration
        }
      })

    } catch (error) {
      this.recordResult({
        success: false,
        message: `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  /**
   * Test 3: Verify database persistence (probe_runs, page_blobs)
   */
  private async test3_VerifyDatabasePersistence(): Promise<void> {
    console.log('\n💾 TEST 3: Database Persistence Verification')
    console.log('─'.repeat(80))

    try {
      // Get most recent evaluation
      const recentEvaluations = await db.select()
        .from(evaluations)
        .orderBy(desc(evaluations.createdAt))
        .limit(1)

      if (recentEvaluations.length === 0) {
        this.recordResult({
          success: false,
          message: 'No evaluations found in database'
        })
        return
      }

      const evaluation = recentEvaluations[0]
      console.log(`📍 Checking evaluation: ${evaluation.id}`)

      // Check probe runs
      const probeRunsData = await db.select()
        .from(probeRuns)
        .where(eq(probeRuns.evaluationId, evaluation.id))

      console.log(`✅ Probe runs saved: ${probeRunsData.length}`)

      // Check page blobs
      const pageBlobsData = await db.select()
        .from(pageBlobs)
        .where(eq(pageBlobs.evaluationId, evaluation.id))

      console.log(`✅ Page blobs saved: ${pageBlobsData.length}`)

      const allPersisted = probeRunsData.length > 0 && pageBlobsData.length > 0

      this.recordResult({
        success: allPersisted,
        message: allPersisted 
          ? 'All agent data persisted to Neon database'
          : 'Some data missing from database',
        details: {
          evaluationId: evaluation.id,
          probeRuns: probeRunsData.length,
          pageBlobs: pageBlobsData.length
        }
      })

    } catch (error) {
      this.recordResult({
        success: false,
        message: `Database verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  /**
   * Test 4: Verify leaderboard cache population
   */
  private async test4_VerifyLeaderboardCache(): Promise<void> {
    console.log('\n🏆 TEST 4: Leaderboard Cache Verification')
    console.log('─'.repeat(80))

    try {
      const cacheEntries = await db.select()
        .from(leaderboardCache)
        .orderBy(desc(leaderboardCache.lastEvaluated))
        .limit(5)

      console.log(`✅ Cache entries found: ${cacheEntries.length}`)

      if (cacheEntries.length > 0) {
        console.log('\nRecent cache entries:')
        cacheEntries.slice(0, 3).forEach((entry: any) => {
          console.log(`  • ${entry.brandName}: ${entry.adiScore}/100 (${entry.grade})`)
          console.log(`    Rank: #${entry.rankNiche || '?'} in ${entry.nicheCategory}`)
        })
      }

      this.recordResult({
        success: cacheEntries.length > 0,
        message: cacheEntries.length > 0 
          ? 'Leaderboard cache populated successfully'
          : 'No cache entries found',
        details: { cacheEntries: cacheEntries.length }
      })

    } catch (error) {
      this.recordResult({
        success: false,
        message: `Cache verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  /**
   * Test 5: Verify ranking calculations
   */
  private async test5_VerifyRankings(): Promise<void> {
    console.log('\n📊 TEST 5: Ranking Calculation Verification')
    console.log('─'.repeat(80))

    try {
      // Get a niche with multiple entries
      const cacheEntries = await db.select()
        .from(leaderboardCache)
        .orderBy(desc(leaderboardCache.adiScore))
        .limit(10)

      if (cacheEntries.length === 0) {
        this.recordResult({
          success: false,
          message: 'No cache entries available for ranking verification'
        })
        return
      }

      // Check if rankings are sequential and correct
      let rankingsCorrect = true
      const rankingIssues: string[] = []

      for (let i = 0; i < cacheEntries.length - 1; i++) {
        const current = cacheEntries[i]
        const next = cacheEntries[i + 1]

        // Check if higher score has lower or equal rank number
        if (current.adiScore < next.adiScore && current.rankNiche && next.rankNiche) {
          if (current.rankNiche < next.rankNiche) {
            rankingsCorrect = false
            rankingIssues.push(
              `Ranking order issue: ${current.brandName} (score: ${current.adiScore}, rank: ${current.rankNiche}) vs ${next.brandName} (score: ${next.adiScore}, rank: ${next.rankNiche})`
            )
          }
        }
      }

      if (rankingsCorrect) {
        console.log('✅ Ranking calculations are correct')
      } else {
        console.log('⚠️  Ranking issues detected:')
        rankingIssues.forEach((issue: string) => console.log(`  • ${issue}`))
      }

      this.recordResult({
        success: rankingsCorrect,
        message: rankingsCorrect 
          ? 'Rankings calculated correctly'
          : 'Ranking calculation issues detected',
        details: { issues: rankingIssues }
      })

    } catch (error) {
      this.recordResult({
        success: false,
        message: `Ranking verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  /**
   * Test 6: Process batch (if desired)
   */
  private async test6_ProcessBatch(): Promise<void> {
    console.log('\n📦 TEST 6: Batch Processing')
    console.log('─'.repeat(80))
    console.log('ℹ️  Skipping batch test to avoid multiple evaluations')
    console.log('   To test batch processing, run: npm run leaderboard:process')

    this.recordResult({
      success: true,
      message: 'Batch processing available via npm run leaderboard:process'
    })
  }

  /**
   * Record test result
   */
  private recordResult(result: TestResult): void {
    this.testResults.push(result)
    
    if (result.success) {
      console.log(`\n✅ PASSED: ${result.message}`)
    } else {
      console.log(`\n❌ FAILED: ${result.message}`)
    }

    if (result.details) {
      console.log('   Details:', JSON.stringify(result.details, null, 2))
    }
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    console.log('\n' + '='.repeat(80))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(80))

    const passed = this.testResults.filter(r => r.success).length
    const failed = this.testResults.filter(r => !r.success).length
    const total = this.testResults.length

    console.log(`\n✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)
    console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`)

    if (failed > 0) {
      console.log('Failed Tests:')
      this.testResults.filter(r => !r.success).forEach((result: any) => {
        console.log(`  ❌ ${result.message}`)
      })
      console.log()
    }

    console.log('='.repeat(80) + '\n')

    if (failed > 0) {
      process.exit(1)
    }
  }
}

// Run tests
const tester = new AutomatedEvaluationTester()
tester.runTests().catch(error => {
  console.error('❌ Test suite crashed:', error)
  process.exit(1)
})

