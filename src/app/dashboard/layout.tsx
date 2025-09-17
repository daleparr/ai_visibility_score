'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Allow admin routes to bypass authentication checks
    if (pathname.includes('/admin')) {
      return
    }
    
    // If loading, don't redirect yet
    if (status === 'loading') {
      return
    }
    
    // If not authenticated, redirect to sign in
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
  }, [status, router, pathname])

  // If this is an admin route, render children directly
  if (pathname.includes('/admin')) {
    return children
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Loading...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your authentication.</p>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, show redirecting message
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Redirecting to sign in...</h2>
            <p className="text-gray-600 mt-2">Please wait while we redirect you to the sign in page.</p>
          </div>
        </div>
      </div>
    )
  }

  // If authenticated, render the dashboard
  return children
}