import { contentManager } from '@/lib/cms/cms-client'
import { Brain, Download, FileText, GitBranch, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function MethodologyPage() {
  // Fetch CMS content
  const page = await contentManager.getPage('methodology')
  const intro = await contentManager.getBlockByKey('methodology', 'methodology_intro')
  const version = await contentManager.getBlockByKey('methodology', 'methodology_version')
  const principles = await contentManager.getBlockByKey('methodology', 'core_principles')
  
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
              <Link href="/methodology" className="text-brand-600 font-medium">
                Methodology
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-brand-600 transition-colors">
                FAQ
              </Link>
              <Link href="/aidi-vs-monitoring-tools" className="text-gray-600 hover:text-brand-600 transition-colors">
                vs. Monitoring Tools
              </Link>
              <Button variant="outline" asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Page Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            {page?.title || 'AIDI Methodology: Peer-Reviewed Framework'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Transparently published. Academically validated. Third-party auditable.
          </p>
          
          {/* Version Badge */}
          {version && (
            <div className="flex items-center gap-4 mb-8">
              <Badge variant="secondary" className="text-sm">
                Version {version.version}
              </Badge>
              <span className="text-sm text-gray-500">
                Published: {version.published}
              </span>
              <span className="text-sm text-gray-500">
                Last Updated: {version.last_updated}
              </span>
            </div>
          )}
          
          {/* Download Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Methodology PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="text-xs">Statistical Protocol</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">Peer Review</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="text-xs">Version History</span>
            </Button>
          </div>
          
          {/* Introduction */}
          <div 
            className="prose prose-lg prose-brand mb-16 max-w-none"
            dangerouslySetInnerHTML={{ __html: intro?.html || '' }} 
          />
          
          {/* Core Principles */}
          {principles?.principles && (
            <section className="space-y-12 mb-16">
              <h2 className="text-4xl font-bold mb-8">
                {principles.headline || 'Five Pillars of Scientific Rigor'}
              </h2>
              
              {principles.principles.map((principle: any, idx: number) => (
                <Card key={principle.id} className="border-2 border-gray-200 hover:border-brand-300 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{principle.icon}</span>
                      <div>
                        <CardTitle className="text-2xl">{principle.title}</CardTitle>
                        <p className="text-gray-600 mt-2">{principle.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Why It Matters */}
                    {principle.why_matters && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Why It Matters:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{principle.why_matters}</p>
                      </div>
                    )}
                    
                    {/* Problem/Solution Examples */}
                    {principle.problem_example && principle.solution_example && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                          <div className="text-xs font-semibold text-red-600 mb-2">❌ PROBLEM</div>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{principle.problem_example}</pre>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <div className="text-xs font-semibold text-green-600 mb-2">✓ SOLUTION</div>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{principle.solution_example}</pre>
                        </div>
                      </div>
                    )}
                    
                    {/* Implementation Details */}
                    {principle.implementation && (
                      <div>
                        <h4 className="font-semibold mb-3">Implementation:</h4>
                        <ul className="space-y-2">
                          {principle.implementation.map((item: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <span className="text-brand-500 mr-2">•</span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Statistical Rigor */}
                    {principle.stat_rigor && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <span>📊</span>
                          Statistical Rigor:
                        </h4>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-green-200">{principle.stat_rigor}</pre>
                      </div>
                    )}
                    
                    {/* Formula Display */}
                    {principle.formula && (
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Statistical Formula:</h4>
                        <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">{principle.formula}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </section>
          )}
          
          {/* CTA Section */}
          <div className="bg-brand-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready for Benchmark-Grade AEO Intelligence?
            </h2>
            <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
              Our peer-reviewed methodology ensures results you can defend to boards, 
              present to CFOs, and rely on for strategic investment.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="secondary">
                Get Your Benchmark Score →
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Sample Report
              </Button>
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

