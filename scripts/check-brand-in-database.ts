import { db } from '../src/lib/db'
import { nicheBrandSelection, evaluationQueue, leaderboardCache } from '../src/lib/db/schema'
import { ilike, or } from 'drizzle-orm'

/**
 * Quick script to check if a specific brand is in the database
 */
async function checkBrandInDatabase(brandName: string) {
  console.log(`🔍 Checking for brand: ${brandName}`)
  
  try {
    // Check in niche brand selection
    const nicheSelection = await db.select()
      .from(nicheBrandSelection)
      .where(or(
        ilike(nicheBrandSelection.brandName, `%${brandName}%`),
        ilike(nicheBrandSelection.websiteUrl, `%${brandName}%`)
      ))

    // Check in evaluation queue
    const queueEntries = await db.select()
      .from(evaluationQueue)
      .where(or(
        ilike(evaluationQueue.brandName, `%${brandName}%`),
        ilike(evaluationQueue.websiteUrl, `%${brandName}%`)
      ))

    // Check in leaderboard cache
    const cacheEntries = await db.select()
      .from(leaderboardCache)
      .where(or(
        ilike(leaderboardCache.brandName, `%${brandName}%`),
        ilike(leaderboardCache.websiteUrl, `%${brandName}%`)
      ))

    console.log('\n📊 SEARCH RESULTS:')
    console.log('==================')
    
    if (nicheSelection.length > 0) {
      console.log(`✅ Found in niche selection (${nicheSelection.length} entries):`)
      nicheSelection.forEach((entry: any) => {
        console.log(`  • ${entry.brandName} - ${entry.websiteUrl} (${entry.nicheCategory})`)
      })
    } else {
      console.log('❌ Not found in niche selection')
    }

    if (queueEntries.length > 0) {
      console.log(`✅ Found in evaluation queue (${queueEntries.length} entries):`)
      queueEntries.forEach((entry: any) => {
        console.log(`  • ${entry.brandName} - ${entry.websiteUrl} (${entry.status})`)
      })
    } else {
      console.log('❌ Not found in evaluation queue')
    }

    if (cacheEntries.length > 0) {
      console.log(`✅ Found in leaderboard cache (${cacheEntries.length} entries):`)
      cacheEntries.forEach((entry: any) => {
        console.log(`  • ${entry.brandName} - ${entry.websiteUrl} (Score: ${entry.adiScore})`)
      })
    } else {
      console.log('❌ Not found in leaderboard cache')
    }

    const totalFound = nicheSelection.length + queueEntries.length + cacheEntries.length
    
    if (totalFound > 0) {
      console.log(`\n✅ FOUND: ${brandName} exists in ${totalFound} database table(s)`)
    } else {
      console.log(`\n❌ NOT FOUND: ${brandName} is not in any database tables`)
      console.log('\n💡 To add this brand:')
      console.log('1. Add to brand taxonomy if missing')
      console.log('2. Run: npm run leaderboard:seed')
      console.log('3. Or add manually via API')
    }

  } catch (error) {
    console.error('❌ Error checking brand:', error)
  }
}

// CLI execution
if (require.main === module) {
  const brandName = process.argv[2] || 'Gymshark'
  checkBrandInDatabase(brandName)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

export { checkBrandInDatabase }