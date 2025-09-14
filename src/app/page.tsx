import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain, Search, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold gradient-text">AI Visibility Score</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-brand-600 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-brand-600 transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-brand-600 transition-colors">
                Pricing
              </Link>
              <Button variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Now Supporting 5+ AI Models
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Measure Your Brand's
            <span className="gradient-text block">AI Visibility</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-balance">
            Unlike traditional SEO audits, AI Visibility Score tests whether frontier models 
            (OpenAI, Anthropic, Google) can find, parse, and reason about your brand's presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/demo">
                Try Demo Version
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/dashboard/new-evaluation">
                Start Free Evaluation
              </Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Get results in 10 minutes
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Is Your Brand Invisible to AI?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              As AI-powered search and recommendations reshape how customers discover brands, 
              traditional SEO metrics tell only half the story.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-left">
                <CardHeader>
                  <Search className="h-8 w-8 text-brand-600 mb-2" />
                  <CardTitle className="text-lg">AI Search Revolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    ChatGPT, Claude, and Gemini are becoming primary research tools, 
                    but can they find and recommend your brand?
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <Shield className="h-8 w-8 text-warning-600 mb-2" />
                  <CardTitle className="text-lg">Reputation Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    AI models may provide incomplete, outdated, or inaccurate information 
                    about your brand to millions of users.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-success-600 mb-2" />
                  <CardTitle className="text-lg">Competitive Advantage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Brands optimized for AI discovery will capture more mindshare 
                    and recommendations in the AI-first future.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Comprehensive AI Visibility Analysis
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our multi-agent system evaluates your brand across three critical pillars 
              using the latest AI models.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Infrastructure Pillar */}
            <Card className="pillar-infrastructure">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-brand-600" />
                  <CardTitle>Infrastructure & Machine Readability</CardTitle>
                </div>
                <CardDescription>
                  Can AI parse and understand your brand's digital footprint?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Schema & Structured Data Coverage</li>
                  <li>• Semantic Clarity & Disambiguation</li>
                  <li>• Ontologies & Taxonomy Structure</li>
                  <li>• Knowledge Graph Presence</li>
                  <li>• LLM Readability Optimization</li>
                  <li>• Conversational Copy Analysis</li>
                </ul>
              </CardContent>
            </Card>

            {/* Perception Pillar */}
            <Card className="pillar-perception">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Search className="h-6 w-6 text-success-600" />
                  <CardTitle>Perception & Reputation</CardTitle>
                </div>
                <CardDescription>
                  Can AI explain why your brand matters?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Geographic Visibility Testing</li>
                  <li>• Citation Strength Analysis</li>
                  <li>• AI Response Quality Assessment</li>
                  <li>• Sentiment & Trust Signals</li>
                  <li>• Brand Heritage Recognition</li>
                </ul>
              </CardContent>
            </Card>

            {/* Commerce Pillar */}
            <Card className="pillar-commerce">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-warning-600" />
                  <CardTitle>Commerce & Customer Experience</CardTitle>
                </div>
                <CardDescription>
                  Can AI recommend and transact with confidence?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Hero Product Identification</li>
                  <li>• Product Recommendation Accuracy</li>
                  <li>• Shipping & Delivery Clarity</li>
                  <li>• Return Policy Accessibility</li>
                  <li>• Competitive Positioning</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              How AI Visibility Score Works
            </h2>
            <p className="text-lg text-gray-600">
              Our multi-agent evaluation process tests your brand across multiple AI models
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Brand Input</h3>
              <p className="text-gray-600 text-sm">
                Enter your website URL and select competitors for benchmarking
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Multi-Agent Testing</h3>
              <p className="text-gray-600 text-sm">
                Test across OpenAI, Anthropic, Google, and other AI models simultaneously
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Scoring Analysis</h3>
              <p className="text-gray-600 text-sm">
                Generate comprehensive scores across 12 key dimensions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Actionable Report</h3>
              <p className="text-gray-600 text-sm">
                Receive prioritized recommendations with clear implementation timelines
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Measure Your AI Visibility?
          </h2>
          <p className="text-xl mb-8 text-brand-100">
            Join forward-thinking brands optimizing for the AI-first future
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/dashboard/new-evaluation">
              Start Your Free Evaluation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6" />
                <span className="text-lg font-bold">AI Visibility Score</span>
              </div>
              <p className="text-gray-400 text-sm">
                The first platform to measure and optimize brand visibility 
                across AI-powered search and recommendation systems.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 AI Visibility Score. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}