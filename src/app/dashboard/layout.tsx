'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isDemoMode } from '@/lib/demo-mode'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // In demo mode, redirect to demo dashboard
    if (isDemoMode()) {
      router.push('/demo')
      return
    }
    
    // For production, would check authentication here
    // For now, redirect to demo
    router.push('/demo')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Redirecting to demo...</h2>
          <p className="text-gray-600 mt-2">Please wait while we redirect you to the demo dashboard.</p>
        </div>
      </div>
    </div>
  )
}