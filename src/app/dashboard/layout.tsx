'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isDemoMode } from '@/lib/demo-mode'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Allow admin routes to bypass redirects
    if (pathname.includes('/admin')) {
      return
    }
    
    // In demo mode, redirect to demo dashboard (except for admin routes)
    if (isDemoMode()) {
      router.push('/demo')
      return
    }
    
    // For production, would check authentication here for non-admin routes
    // For now, redirect non-admin routes to demo
    router.push('/demo')
  }, [router, pathname])

  // If this is an admin route, render children directly
  if (pathname.includes('/admin')) {
    return children
  }

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