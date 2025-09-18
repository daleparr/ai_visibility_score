'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, Lightbulb, TrendingUp, Target } from 'lucide-react'

interface Brand {
  id: string
  name: string
  website_url: string
  industry?: string
  description?: string
  created_at: string
}

export default function BrandSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await fetch(`/api/brands/${params.brandId}`)
        if (response.ok) {
          const data = await response.json()
          setBrand(data.brand)
        }
      } catch (error) {
        console.error('Error fetching brand:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.brandId) {
      fetchBrand()
    }
  }, [params.brandId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              🎉 Brand Successfully Created!
            </CardTitle>
            <CardDescription className="text-green-700">
              {brand?.name || 'Your brand'} is now ready for AI discoverability analysis
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Brand Details */}
        {brand && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {brand.name}
              </CardTitle>
              <CardDescription>
                Brand ID: {brand.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>Website:</strong> 
                <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                  {brand.website_url}
                </a>
              </div>
              {brand.industry && (
                <div>
                  <strong>Industry:</strong> 
                  <Badge variant="secondary" className="ml-2">{brand.industry}</Badge>
                </div>
              )}
              {brand.description && (
                <div>
                  <strong>Description:</strong> 
                  <span className="ml-2">{brand.description}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">AI Visibility Analysis</h4>
                  <p className="text-sm text-gray-600">We'll analyze how your brand appears across major AI platforms like ChatGPT, Claude, and Gemini.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Comprehensive Scoring</h4>
                  <p className="text-sm text-gray-600">Get detailed scores across 12 dimensions of AI discoverability with actionable insights.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Optimization Roadmap</h4>
                  <p className="text-sm text-gray-600">Receive prioritized recommendations to improve your AI visibility and discoverability.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Did You Know */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Lightbulb className="w-5 h-5" />
              Did You Know?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              Over 60% of consumers now use AI assistants to research brands and products. 
              Optimizing your AI discoverability is becoming as crucial as traditional SEO for reaching your audience.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => router.push(`/dashboard/new-evaluation?brandId=${params.brandId}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Start AI Evaluation
          </Button>
        </div>

        {/* One Step Closer */}
        <div className="text-center py-6">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            🚀 One Step Closer to AI Discoverability Optimization
          </p>
          <p className="text-gray-600">
            Your brand is now in our system and ready for comprehensive AI visibility analysis.
          </p>
        </div>
      </div>
    </div>
  )
}