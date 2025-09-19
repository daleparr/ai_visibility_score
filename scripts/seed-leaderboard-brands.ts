import { LeaderboardPopulationService } from '../src/lib/leaderboard-population-service'

/**
 * Seed script to initialize leaderboard brand selections
 * This populates the niche_brand_selection table with 20 brands per niche
 */
async function seedLeaderboardBrands() {
  console.log('🌱 Starting leaderboard brand seeding...')
  
  try {
    const service = LeaderboardPopulationService.getInstance({
      batchSize: 3, // Smaller batch for initial seeding
      dailyLimit: 10, // Conservative limit for testing
      cacheExpiryDays: 30
    })

    // Initialize all niche brand selections
    await service.initializeNichePopulation()
    
    console.log('✅ Leaderboard brand seeding completed!')
    console.log('📊 Next steps:')
    console.log('  1. Run evaluation queue processing: npm run process-leaderboard-queue')
    console.log('  2. Monitor progress via API: GET /api/leaderboard-population?action=stats')
    console.log('  3. View populated leaderboards: GET /api/leaderboards?type=niche&category=Streetwear')
    
  } catch (error) {
    console.error('❌ Error seeding leaderboard brands:', error)
    process.exit(1)
  }
}

// Run the seed function
seedLeaderboardBrands()