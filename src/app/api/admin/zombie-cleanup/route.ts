import { NextRequest, NextResponse } from 'next/server'
import { cleanupZombieEvaluations, getZombieEvaluationCount } from '@/lib/adi/zombie-cleanup'

export async function POST(request: NextRequest) {
  try {
    const { maxRunningMinutes = 10 } = await request.json().catch(() => ({}))
    
    console.log(`🧹 [API] Starting zombie cleanup with ${maxRunningMinutes} minute threshold`)
    
    const result = await cleanupZombieEvaluations(maxRunningMinutes)
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.cleanedCount} zombie evaluations`,
      data: result
    })
    
  } catch (error) {
    console.error('❌ [API] Zombie cleanup failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to cleanup zombie evaluations'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const maxRunningMinutes = parseInt(url.searchParams.get('maxRunningMinutes') || '10')
    
    const zombieCount = await getZombieEvaluationCount(maxRunningMinutes)
    
    return NextResponse.json({
      success: true,
      data: {
        zombieCount,
        maxRunningMinutes,
        message: zombieCount > 0 
          ? `Found ${zombieCount} zombie evaluations running longer than ${maxRunningMinutes} minutes`
          : 'No zombie evaluations found'
      }
    })
    
  } catch (error) {
    console.error('❌ [API] Failed to get zombie count:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get zombie evaluation count'
    }, { status: 500 })
  }
}
