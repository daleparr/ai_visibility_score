// Homepage with CMS-driven authoritative copy
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Search, TrendingUp, Shield, Zap, BarChart3, CheckCircle, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { contentManager } from '@/lib/cms/cms-client'
import { HomePageInteractive } from '@/components/homepage/Interactive'
import { HomePageHeader } from '@/components/homepage/Header'
import { LogoDisplay } from '@/components/LogoDisplay'
import { DynamicPricingCards } from '@/components/DynamicPricingCards'
import { AIModelLogos } from '@/components/AIModelLogos'
import { MinimalHomepageVariant } from '@/components/homepage/MinimalVariant'

// Disable caching so CMS changes appear immediately
export const revalidate = 0;

export default async function HomePage() {
  // Check which homepage variant to display
  let homepageVariant = 'full'; // Default
  
  try {
    const variantSetting = await contentManager.getBlockByKey('homepage', 'homepage_variant');
    homepageVariant = variantSetting?.active_variant || 'full';
  } catch (error) {
    console.log('Homepage variant not set, using full version');
  }

  // If minimal variant selected, render that instead
  if (homepageVariant === 'minimal') {
    return <MinimalHomepageVariant />;
  }

  // Otherwise render full homepage (existing design)
  // Fetch CMS content for hero section
  let heroHeadline, heroSubhead, heroDescription, trustIndicators, pricingTiers, footerAbout, threePillars
  
  try {
    heroHeadline = await contentManager.getBlockByKey('homepage', 'hero_headline')
    heroSubhead = await contentManager.getBlockByKey('homepage', 'hero_subhead')
    heroDescription = await contentManager.getBlockByKey('homepage', 'hero_description')
    trustIndicators = await contentManager.getBlockByKey('homepage', 'trust_indicators')
    pricingTiers = await contentManager.getBlockByKey('homepage', 'pricing_tiers')
    footerAbout = await contentManager.getBlockByKey('homepage', 'footer_about')
    threePillars = await contentManager.getBlockByKey('homepage', 'three_pillars_cards')
  } catch (error) {
    console.error('Error loading CMS content:', error)
    // Fallback to defaults if CMS not available yet
  }

  return (
    <div className="min-h-screen">
      {/* Header - Client Component for Mobile Menu */}
      <HomePageHeader />

      {/* Hero Section with URL Input - CMS Driven */}
      <section className="py-12 md:py-24 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 md:mb-6">
              ✓ Available Now - No Waitlist
            </Badge>
            
            {/* Title - Single Row on Mobile */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              {heroHeadline?.text || 'The Benchmark Standard for AEO Intelligence'}
            </h1>
            
            <p className="text-lg md:text-xl font-semibold text-gray-700 mb-3 md:mb-4 max-w-2xl mx-auto px-2">
              {heroSubhead?.text || 'Scientifically rigorous. Statistically validated. Board-ready insights.'}
            </p>
            
            <div 
              className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto px-2"
              dangerouslySetInnerHTML={{ 
                __html: heroDescription?.html || '<p>While monitoring tools provide quick feedback, AIDI delivers the systematic benchmarking enterprises need for strategic decisions.</p>' 
              }}
            />
            
            {/* Trust Indicators - 2 Rows on Mobile, 1 Row on Desktop */}
            {trustIndicators?.items && (
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 max-w-3xl mx-auto">
                {trustIndicators.items.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center text-xs md:text-sm text-gray-700 bg-white/80 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-brand-200 whitespace-nowrap">
                    {item}
                  </div>
                ))}
              </div>
            )}

            {/* URL Input Section - Interactive Client Component */}
            <HomePageInteractive />

            {/* Statistical Rigor Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 mb-12">
              <div className="flex items-center">
                <Brain className="h-4 w-4 mr-1" />
                4+ AI Models
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                12 Dimensions
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                95% Confidence Intervals
              </div>
            </div>

            {/* AI Model Logos - Shows tier-based availability */}
            <AIModelLogos 
              userTier="free"
              showUpgradePrompt={true}
              variant="homepage"
              className="mt-8"
            />
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
                      £0
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
                      <span>GPT-4 analysis with comprehensive insights</span>
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
              {threePillars?.heading || 'Three Pillars of AI Visibility'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {threePillars?.subheading || 'Our evaluation framework tests how AI models discover, understand, and recommend your brand'}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {(threePillars?.pillars || [
              {
                number: "1", icon: "🏗️", title: "Infrastructure & Machine Readability",
                subtitle: "Can AI parse and understand your brand's digital footprint?",
                features: ["Schema & Structured Data Coverage", "Semantic Clarity & Disambiguation", "Ontologies & Taxonomy Structure", "Knowledge Graph Presence", "LLM Readability Optimization", "Conversational Copy Analysis"]
              },
              {
                number: "2", icon: "🔍", title: "Perception & Reputation",
                subtitle: "Can AI explain why your brand matters?",
                features: ["Geographic Visibility Testing", "Citation Strength Analysis", "AI Response Quality Assessment", "Sentiment & Trust Signals", "Brand Heritage Recognition"]
              },
              {
                number: "3", icon: "🛒", title: "Commerce & Customer Experience",
                subtitle: "Can AI recommend and transact with confidence?",
                features: ["Hero Product Identification", "Product Recommendation Accuracy", "Shipping & Delivery Clarity", "Return Policy Accessibility", "Competitive Positioning"]
              }
            ]).map((pillar: any, idx: number) => (
              <Card key={idx} className={`pillar-${idx === 0 ? 'infrastructure' : idx === 1 ? 'perception' : 'commerce'}`}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="text-3xl">{pillar.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-brand-600">{pillar.number}</span>
                        <CardTitle className="text-lg">{pillar.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {pillar.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {pillar.features.map((feature: string, fIdx: number) => (
                      <li key={fIdx}>• {feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
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
                Our agents analyze your brand using advanced AI evaluation
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

          {/* Dynamic Pricing Cards - Fully CMS Controlled */}
          <DynamicPricingCards className="max-w-5xl mx-auto" />
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
                    AI models are becoming primary research tools.
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

      {/* Social Proof - Logos */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <LogoDisplay 
            collectionKey="homepage_trusted"
            title="Trusted by brand managers at leading companies"
            className=""
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-brand-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready for Benchmark-Grade AEO Intelligence?
          </h2>
          <p className="text-xl mb-8 text-brand-100 max-w-2xl mx-auto">
            Get the strategic metrics you need for board presentations. 
            Our peer-reviewed methodology ensures defendable results.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/evaluate">
                Get Your Benchmark Score
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10" asChild>
              <Link href="/methodology">
                View Methodology
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6" />
                <span className="text-lg font-bold">AI Discoverability Index (AIDI)</span>
              </div>
              <div 
                className="text-gray-400 text-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: footerAbout?.html || '<p>The benchmark standard for measuring brand visibility in AI-powered answer engines. Built by data scientists for executives who need audit-grade results for strategic decisions.</p>' 
                }}
              />
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link href="/api-docs" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/methodology" className="hover:text-white">Methodology</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/aidi-vs-monitoring-tools" className="hover:text-white">vs. Monitoring Tools</Link></li>
                <li><Link href="/reports" className="hover:text-white">Industry Reports</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 AI Discoverability Index (AIDI). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}