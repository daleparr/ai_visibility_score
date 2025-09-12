'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function NewEvaluationPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to brand creation since we need a brand first
    router.push('/dashboard/brands/new')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Taking you to create a new brand for evaluation.</p>
      </div>
    </div>
  )
}

export default NewEvaluationPage