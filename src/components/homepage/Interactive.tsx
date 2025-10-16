'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Globe, ArrowRight, CheckCircle } from 'lucide-react'
import { safeHref } from '@/lib/url'

export function HomePageInteractive() {
  const [url, setUrl] = useState('')
  const [tier, setTier] = useState<'quick-scan' | 'full-audit' | 'enterprise'>('quick-scan')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!url) return
    
    try {
      const safeUrl = safeHref(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      alert('Please enter a valid URL')
      return
    }

    setIsAnalyzing(true)
    const encodedUrl = encodeURIComponent(url)
    router.push(`/evaluate?url=${encodedUrl}&tier=${tier}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <Card className="p-6 shadow-lg border-2">
        {/* Tier Selection */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <button
              onClick={() => setTier('quick-scan')}
              className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                tier === 'quick-scan'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Quick Scan
              <div className="text-xs mt-1">$499 • 4 dimensions</div>
            </button>
            <button
              onClick={() => setTier('full-audit')}
              className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                tier === 'full-audit'
                  ? 'bg-brand-100 text-brand-700 border-2 border-brand-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              💎 Full Audit
              <div className="text-xs mt-1">$2,500 • Board-Ready</div>
            </button>
            <button
              onClick={() => setTier('enterprise')}
              className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                tier === 'enterprise'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              🏢 Enterprise
              <div className="text-xs mt-1">$10,000 • M&A Ready</div>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="url"
              placeholder="Enter your website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-12 text-lg"
              disabled={isAnalyzing}
            />
          </div>
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!url || isAnalyzing}
            className="h-12 px-8 text-lg"
          >
            {isAnalyzing ? 'Analyzing...' : 'Get Benchmark Score'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          {tier === 'full-audit'
            ? 'Full audit • Statistical validation • Board-ready reporting'
            : tier === 'enterprise'
            ? 'Enterprise • M&A support • Protected sites analysis'
            : 'Quick scan • 2-day turnaround • Baseline assessment'
          }
        </div>
      </Card>
    </div>
  )
}

