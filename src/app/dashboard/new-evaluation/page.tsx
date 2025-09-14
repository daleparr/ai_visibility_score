'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function NewEvaluationPage() {
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    console.log('NewEvaluationPage: Component mounted, starting redirect...')
    setRedirecting(true)
    
    // Add a small delay to ensure the page is fully loaded before redirecting
    const timer = setTimeout(() => {
      console.log('NewEvaluationPage: Executing redirect to /dashboard/brands/new')
      try {
        router.push('/dashboard/brands/new')
      } catch (error) {
        console.error('NewEvaluationPage: Redirect failed:', error)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">
          {redirecting ? 'Redirecting...' : 'Loading...'}
        </h1>
        <p className="text-gray-600">Taking you to create a new brand for evaluation.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

export default NewEvaluationPage