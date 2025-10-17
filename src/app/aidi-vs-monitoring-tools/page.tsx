import { contentManager } from '@/lib/cms/cms-client'
import { Brain, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function PositioningPage() {
  // Fetch CMS content
  const page = await contentManager.getPage('aidi-vs-monitoring-tools')
  const intro = await contentManager.getBlockByKey('aidi-vs-monitoring-tools', 'positioning_intro')
  const comparison = await contentManager.getBlockByKey('aidi-vs-monitoring-tools', 'comparison_table')
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold gradient-text">AIDI</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-brand-600 transition-colors">
                Home
              </Link>
              <Link href="/methodology" className="text-gray-600 hover:text-brand-600 transition-colors">
                Methodology
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-brand-600 transition-colors">
                FAQ
              </Link>
              <Link href="/aidi-vs-monitoring-tools" className="text-brand-600 font-medium">
                vs. Monitoring Tools
              </Link>
              <Button variant="outline" asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            {page?.title || 'AIDI vs. Monitoring Tools'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-4">
            Different tools for different purposes. Use both for complete AEO mastery.
          </p>
          
          {/* Introduction */}
          <div 
            className="prose prose-xl mb-12 max-w-none"
            dangerouslySetInnerHTML={{ __html: intro?.html || '' }}
          />
          
          {/* Two-Column Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Monitoring Tools Column */}
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-5xl mb-4">{comparison?.monitoring?.icon || '📊'}</div>
                <CardTitle className="text-2xl">{comparison?.monitoring?.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {comparison?.monitoring?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="font-semibold text-gray-900 mb-2">Strengths:</div>
                  {comparison?.monitoring?.strengths?.map((strength: string, idx: number) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-sm font-semibold mb-2 text-blue-900">Perfect For:</div>
                  <div className="text-sm text-gray-700">{comparison?.monitoring?.perfect_for}</div>
                  <div className="text-sm text-gray-600 mt-3">
                    <strong>Audience:</strong> {comparison?.monitoring?.audience}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Pricing:</strong> {comparison?.monitoring?.pricing}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Benchmarking Column */}
            <Card className="border-2 border-brand-300 bg-brand-50/30 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="text-5xl mb-4">{comparison?.benchmarking?.icon || '🔬'}</div>
                <CardTitle className="text-2xl text-brand-900">{comparison?.benchmarking?.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {comparison?.benchmarking?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="font-semibold text-gray-900 mb-2">Strengths:</div>
                  {comparison?.benchmarking?.strengths?.map((strength: string, idx: number) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-brand-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-brand-50 p-4 rounded-lg border border-brand-200">
                  <div className="text-sm font-semibold mb-2 text-brand-900">Perfect For:</div>
                  <div className="text-sm text-gray-700">{comparison?.benchmarking?.perfect_for}</div>
                  <div className="text-sm text-gray-600 mt-3">
                    <strong>Audience:</strong> {comparison?.benchmarking?.audience}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Pricing:</strong> {comparison?.benchmarking?.pricing}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Conclusion Statement */}
          <div className="bg-green-50 border-l-4 border-green-500 p-8 rounded-r-xl mb-12">
            <div className="text-2xl font-bold mb-4 text-green-900">Both Are Valuable. Neither Is Replaceable.</div>
            <div 
              className="prose prose-lg prose-green max-w-none"
              dangerouslySetInnerHTML={{ __html: comparison?.conclusion || '' }}
            />
          </div>
          
          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Add Benchmark Intelligence to Your AEO Stack?
            </h2>
            <p className="text-base md:text-xl text-brand-100 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Get the strategic metrics you need for board presentations.
              Complement with monitoring tools for ongoing visibility.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                <Link href="/evaluate">
                  Get Your Benchmark Score →
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10" asChild>
                <Link href="/reports">
                  View Sample Report
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Related Pages */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Related Resources</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/methodology" className="text-brand-600 hover:text-brand-700 font-medium">
                Read Our Complete Methodology →
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/reports" className="text-brand-600 hover:text-brand-700 font-medium">
                View Industry Benchmarks →
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/faq" className="text-brand-600 hover:text-brand-700 font-medium">
                More Questions? FAQ →
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 AI Discoverability Index (AIDI). All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
            <Link href="/methodology" className="hover:text-white">Methodology</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

