'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain, Search, TrendingUp, Shield, Zap, BarChart3, Globe, CheckCircle, Lock, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [tier, setTier] = useState('free')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!url) return
    
    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      alert('Please enter a valid URL')
      return
    }

    setIsAnalyzing(true)
    
    // Navigate to evaluation with URL and tier parameters
    const encodedUrl = encodeURIComponent(url)
    router.push(`/evaluate?url=${encodedUrl}&tier=${tier}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold gradient-text">AI Discoverability Index</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-brand-600 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-brand-600 transition-colors">
                Pricing
              </Link>
              <Link href="/leaderboards" className="text-gray-600 hover:text-brand-600 transition-colors">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Leaderboards</span>
                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                </span>
              </Link>
              <Button variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="#features"
                  className="text-gray-600 hover:text-brand-600 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-gray-600 hover:text-brand-600 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/leaderboards"
                  className="text-gray-600 hover:text-brand-600 transition-colors py-2 flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Leaderboards</span>
                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                </Link>
                <div className="flex flex-col space-y-2 pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/evaluate" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Your Score
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with URL Input */}
      <section className="py-16 md:py-24 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              🚀 Free AI Visibility Audit
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              How Visible Is Your Brand
              <span className="gradient-text block">to AI Models?</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
              Test how ChatGPT, Claude, and Gemini discover, understand, and recommend your brand. 
              Get your free AI visibility audit in minutes.
            </p>

            {/* URL Input Section */}
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="p-6 shadow-lg border-2">
                {/* Tier Selection */}
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setTier('free')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        tier === 'free'
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      🆓 Free Tier
                      <div className="text-xs mt-1">GPT-4 Analysis</div>
                    </button>
                    <button
                      onClick={() => setTier('professional')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        tier === 'professional'
                          ? 'bg-brand-100 text-brand-700 border-2 border-brand-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      🚀 Professional
                      <div className="text-xs mt-1">Multi-Model Analysis</div>
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
                    className={`h-12 px-8 text-lg ${
                      tier === 'professional' ? 'bg-brand-600 hover:bg-brand-700' : ''
                    }`}
                  >
                    {isAnalyzing ? 'Analyzing...' : tier === 'professional' ? 'Pro Analysis' : 'Analyze Now'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {tier === 'professional'
                    ? 'Professional analysis • Multi-model comparison • Advanced insights'
                    : 'Free audit • No signup required • Results in 10 minutes'
                  }
                </div>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Brain className="h-4 w-4 mr-1" />
                5+ AI Models
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                12 Dimensions
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                3 Core Pillars
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get - Free vs Premium */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                What's Included in Your Free Audit
              </h2>
              <p className="text-lg text-gray-600">
                Get comprehensive insights into your brand's AI visibility across all major models
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Free Features */}
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-green-700">Free Audit</CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      $0
                    </Badge>
                  </div>
                  <CardDescription>
                    Complete AI visibility analysis with actionable insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Full AI visibility score across 12 dimensions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Testing across 5+ AI models (ChatGPT, Claude, Gemini)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Infrastructure, Perception & Commerce pillar analysis</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Basic recommendations and priority actions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Online report viewing and sharing</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Premium Features */}
              <Card className="border-2 border-brand-200 bg-brand-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-brand-700">Premium Features</CardTitle>
                    <Badge className="bg-brand-600 text-white">
                      Upgrade
                    </Badge>
                  </div>
                  <CardDescription>
                    Advanced insights and competitive intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Lock className="h-5 w-5 text-brand-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>PDF/Excel report exports</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="h-5 w-5 text-brand-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Detailed optimization suggestions with implementation guides</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="h-5 w-5 text-brand-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Industry leaderboards and competitive benchmarking</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="h-5 w-5 text-brand-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Market insights and trend analysis</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="h-5 w-5 text-brand-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>AI Discoverability Index (AIDI) tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="h-5 w-5 text-brand-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Historical tracking and progress monitoring</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section id="features" className="py-16 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Three Pillars of AI Visibility
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our evaluation framework tests how AI models discover, understand, and recommend your brand
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get your AI visibility score in 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Enter URL</h3>
              <p className="text-gray-600 text-sm">
                Simply paste your website URL above - no signup required
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                Our agents test your brand across 5+ AI models simultaneously
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Your Score</h3>
              <p className="text-gray-600 text-sm">
                Receive comprehensive scores across 12 key dimensions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Take Action</h3>
              <p className="text-gray-600 text-sm">
                View insights online or upgrade for exports and advanced features
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade when you need advanced features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2 border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free Audit</CardTitle>
                <div className="text-4xl font-bold text-green-600">$0</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Complete AI visibility analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    All 12 dimension scores
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Basic recommendations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Online report viewing
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Always Free
                </Button>
              </CardContent>
            </Card>

            {/* Professional Tier */}
            <Card className="border-2 border-brand-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-brand-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="text-4xl font-bold text-brand-600">$49</div>
                <CardDescription>For serious optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Everything in Free
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    PDF & Excel exports
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Detailed optimization guides
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Industry benchmarking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full">
                  Upgrade After Audit
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="border-2 border-purple-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-purple-600">Custom</div>
                <CardDescription>For large organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Everything in Professional
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    AIDI leaderboard access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Market insights & trends
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Historical tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    API access & integrations
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">
              Why AI Visibility Matters Now
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-left">
                <CardHeader>
                  <Search className="h-8 w-8 text-brand-600 mb-2" />
                  <CardTitle className="text-lg">AI Search Revolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    ChatGPT, Claude, and Gemini are becoming primary research tools. 
                    Is your brand discoverable when customers ask AI for recommendations?
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
                    about your brand to millions of users daily.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-success-600 mb-2" />
                  <CardTitle className="text-lg">First-Mover Advantage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Brands optimized for AI discovery will capture more mindshare 
                    and recommendations as AI adoption accelerates.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-brand-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Your Free AI Visibility Audit
          </h2>
          <p className="text-xl mb-8 text-brand-100 max-w-2xl mx-auto">
            Enter your URL above to discover how AI models see your brand. 
            No signup required - get results in minutes.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => {
            const input = document.querySelector('input[type="url"]') as HTMLInputElement
            input?.focus()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}>
            Get Your Free Audit Now
            <ArrowRight className="ml-2 h-5 w-5" />
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
                <span className="text-lg font-bold">AI Discoverability Index</span>
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
            <p>&copy; 2024 AI Discoverability Index. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}