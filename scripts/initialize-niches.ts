import { LeaderboardPopulationService } from '../src/lib/leaderboard-population-service'
import { db } from '../src/lib/db'
import { nicheBrandSelection } from '../src/lib/db/schema'

async function initializeAndEnqueue() {
  console.log('🚀 Initializing niches and enqueueing brands for evaluation...')

  const service = LeaderboardPopulationService.getInstance({
    batchSize: 5,
    dailyLimit: 20,
    retryAttempts: 3,
    cacheExpiryDays: 30,
  })

  try {
    // Populate niche_brand_selection from taxonomy
    await service.initializeNichePopulation()

    // Read all selections (dedup/limits handled downstream via queue + retries)
    const selections = await db.select().from(nicheBrandSelection)
    console.log(`📥 Loaded ${selections.length} niche brand selections`)

    if (selections.length === 0) {
      console.log('⚠️ No selections found; nothing to enqueue')
      return
    }

    // Map selections to queue requests
    const requests = selections.map((s: any) => ({
      brandName: s.brandName as string,
      websiteUrl: s.websiteUrl as string,
      nicheCategory: s.nicheCategory as string,
      priority: (s.priority ?? 5) as number,
      triggerType: 'systematic' as const,
      userId: undefined,
      brandId: undefined,
    }))

    console.log(`📝 Enqueuing ${requests.length} evaluations...`)
    await service.addToEvaluationQueue(requests)

    // Show queue stats
    const stats = await service.getQueueStats()
    console.log('📊 Queue stats after initialization:', stats)
    console.log('✅ Initialization and enqueue complete')
  } catch (err) {
    console.error('❌ Error initializing niches:', err)
    process.exitCode = 1
  }
}

initializeAndEnqueue()