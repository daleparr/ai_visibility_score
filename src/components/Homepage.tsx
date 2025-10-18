/**
 * AIDI Homepage — Light Theme, Audit-Grade Authority
 * Conversion-optimized with spacious, institutional design
 * Mobile-optimized for iPhone 16 and desktop
 * 
 * Design Strategy:
 * - Light, spacious theme (contrast to dark reports/leaderboard)
 * - Hero = board-room confidence with breathing room
 * - Input field = "initiate audit-grade analysis"
 * - Trust signals = statistical credibility, not marketing fluff
 * - Premium tier positioning upfront
 */

import { motion } from 'framer-motion';
import { CheckCircle2, BarChart3, Database, TrendingUp, Lock, ArrowRight, Award, Zap, Target, ExternalLink, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function Homepage() {
  const [url, setUrl] = useState('');
  const [selectedTier, setSelectedTier] = useState<'quick' | 'full' | 'enterprise'>('full');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load Stripe.js on component mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Stripe Price IDs - Replace with your actual Stripe Price IDs from your Stripe Dashboard
  const stripePriceIds = {
    quick: 'price_XXXXX_QUICK_SCAN_438',
    full: 'price_XXXXX_FULL_AUDIT_2500',
    enterprise: 'price_XXXXX_ENTERPRISE_30000',
  };

  const handleSubscribe = async (tierId: 'quick' | 'full' | 'enterprise') => {
    const priceId = stripePriceIds[tierId];
    
    try {
      // Initialize Stripe with your publishable key
      const stripe = await (window as any).Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}`,
      });

      if (error) {
        console.error('Error redirecting to checkout:', error);
        alert('Unable to process payment. Please try again.');
      }
    } catch (err) {
      console.error('Stripe initialization error:', err);
      alert('Payment system unavailable. Please try again later.');
    }
  };

  const tiers = [
    {
      id: 'quick' as const,
      name: 'Quick Scan',
      price: '$438',
      features: ['4 core dimensions', '2-day turnaround', 'Baseline report'],
      badge: 'Foundation',
      recommended: false,
    },
    {
      id: 'full' as const,
      name: 'Full Audit',
      price: '$2,500',
      features: ['Board-ready report', 'Multi-run averaging', '95% confidence intervals'],
      badge: 'Most Popular',
      recommended: true,
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: '$30,000',
      features: ['M&A-grade diligence', 'Continuous monitoring', 'Peer benchmarking'],
      badge: 'Strategic',
      recommended: false,
    },
  ];

  const aiModels = [
    { name: 'OpenAI', icon: '🤖', active: true },
    { name: 'Anthropic', icon: '🧠', active: true },
    { name: 'Google', icon: '🔍', active: true },
    { name: 'Perplexity', icon: '🔬', active: true },
  ];

  const methodologyPoints = [
    'Full-site deep crawl with credentialed access',
    'Standardized, locked testing framework',
    'Brand-agnostic, category-generic queries',
    'Multi-run averaging (n≥3) with 95% CI',
    'Percentile rankings vs. industry benchmarks',
    'Peer-reviewable, published methodology',
  ];

  const trustStats = [
    { value: '4+', label: 'AI Models Tested', sublabel: 'Frontier systems' },
    { value: '12', label: 'Dimensions', sublabel: 'Analyzed' },
    { value: '95%', label: 'Confidence', sublabel: 'Intervals' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Sticky Light Header */}
      <nav className="bg-white border-b sticky top-0 z-50" style={{ borderColor: '#e7e5e4' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded flex items-center justify-center"
                style={{ backgroundColor: '#1c1917' }}
              >
                <LogoImage size={28} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1c1917', letterSpacing: '-0.01em' }}>
                  AIDI
                </div>
                <div className="hidden md:block text-xs uppercase tracking-wider" style={{ color: '#78716c', fontWeight: 500 }}>
                  Audit-Grade Intelligence
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#methodology" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#44403c', fontWeight: 500 }}>
                Methodology
              </a>
              <a href="#leaderboard" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#44403c', fontWeight: 500 }}>
                Leaderboard
              </a>
              <a href="#reports" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#44403c', fontWeight: 500 }}>
                Reports
              </a>
              <button 
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: '#44403c', fontWeight: 500 }}
              >
                Sign In
              </button>
            </div>

            {/* Mobile Menu - Burger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button 
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6" style={{ color: '#44403c' }} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-white">
                <div className="flex flex-col h-full">
                  {/* Logo in mobile menu */}
                  <div className="flex items-center gap-3 pb-6 border-b" style={{ borderColor: '#e7e5e4' }}>
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: '#1c1917' }}
                    >
                      <LogoImage size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1c1917', letterSpacing: '-0.01em' }}>
                        AIDI
                      </div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: '#78716c', fontWeight: 500 }}>
                        Audit-Grade
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-1 pt-6">
                    <a 
                      href="#home" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#1c1917', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </a>
                    <a 
                      href="#methodology" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#44403c', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Methodology
                    </a>
                    <a 
                      href="#leaderboard" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#44403c', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Leaderboard
                    </a>
                    <a 
                      href="#blog" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#44403c', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Blog
                    </a>
                    <a 
                      href="#reports" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#44403c', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Industry Reports
                    </a>
                    <a 
                      href="#careers" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#44403c', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Careers
                    </a>
                  </nav>

                  {/* CTA Button at bottom */}
                  <div className="mt-auto pt-6 border-t" style={{ borderColor: '#e7e5e4' }}>
                    <button 
                      className="w-full px-4 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#1c1917', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Your Score
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section - Light & Spacious */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-24">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full mb-6 md:mb-8 border" 
              style={{ 
                backgroundColor: 'white',
                borderColor: '#d4a574',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
              }}
            >
              <Award className="w-4 h-4" style={{ color: '#d4a574' }} />
              <span className="text-xs md:text-sm uppercase tracking-widest" style={{ color: '#d4a574', fontWeight: 500, letterSpacing: '0.1em' }}>
                The Bloomberg Terminal of AI Visibility
              </span>
            </div>

            {/* Headline */}
            <h1 
              className="mb-6 md:mb-8 px-4"
              style={{ 
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 400,
                color: '#1c1917',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                fontFamily: 'Georgia, serif',
                maxWidth: '900px',
                margin: '0 auto 2rem'
              }}
            >
              Discover Your AI Visibility.
              <br />
              <span style={{ fontWeight: 300, color: '#44403c' }}>Instantly.</span>
            </h1>

            {/* Subheadline */}
            <p 
              className="text-base md:text-lg mb-8 md:mb-12 px-4"
              style={{ 
                color: '#57534e',
                maxWidth: '600px',
                margin: '0 auto 3rem',
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              See exactly how ChatGPT, Claude, and Gemini recommend your brand.
              Statistical rigor. Peer-reviewable methodology. Board-ready intelligence.
            </p>

            {/* Input Section */}
            <motion.div
              className="bg-white rounded-2xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto border"
              style={{ borderColor: '#e7e5e4' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex-1 relative">
                  <div 
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: '#a8a29e' }}
                  >
                    <Database className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter your website URL (e.g., example.com)"
                    className="w-full pl-14 pr-6 py-4 md:py-5 rounded-xl text-base md:text-lg border-2 focus:outline-none transition-all"
                    style={{
                      borderColor: url ? '#d4a574' : '#e7e5e4',
                      backgroundColor: '#fafaf9',
                      color: '#1c1917',
                      fontWeight: 400
                    }}
                  />
                </div>
                <button
                  className="px-8 md:px-10 py-4 md:py-5 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg"
                  style={{
                    backgroundColor: '#1c1917',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '1rem md:1.125rem'
                  }}
                >
                  Initiate Analysis
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm" style={{ color: '#57534e' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#5a7359' }} />
                  <span>{selectedTier === 'quick' ? 'Quick scan • 2-day turnaround' : selectedTier === 'full' ? 'Board-ready • Multi-run averaging' : 'Enterprise-grade • M&A ready'}</span>
                </div>
                <div className="hidden md:block w-1 h-1 rounded-full" style={{ backgroundColor: '#d6d3d1' }} />
                <div className="flex items-center gap-2">
                  <LogoImage size={16} />
                  <span>Statistical significance tested</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="border-y py-8 md:py-12 bg-slate-50" style={{ borderColor: '#e7e5e4' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {trustStats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                <div className="text-3xl md:text-5xl mb-2" style={{ fontWeight: 400, color: '#1c1917', fontFamily: 'Georgia, serif' }}>
                  {stat.value}
                </div>
                <div className="text-sm md:text-base mb-1" style={{ color: '#44403c', fontWeight: 500 }}>
                  {stat.label}
                </div>
                <div className="text-xs md:text-sm" style={{ color: '#78716c', fontWeight: 400 }}>
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-12">
            <div className="text-xs md:text-sm uppercase tracking-widest mb-3" style={{ color: '#78716c', fontWeight: 500 }}>
              Frontier AI Models Tested
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, color: '#1c1917', fontFamily: 'Georgia, serif' }}>
              Multi-Model Benchmarking
            </h2>
          </div>

          <div className="grid grid-cols-2 md:flex md:justify-center items-center gap-8 md:gap-16 mb-8 md:mb-12">
            {aiModels.map((model, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-3xl md:text-4xl mb-3 mx-auto shadow-md border-2"
                  style={{ 
                    backgroundColor: 'white',
                    borderColor: '#d4a574'
                  }}
                >
                  {model.icon}
                </div>
                <div className="text-sm md:text-base" style={{ 
                  color: '#1c1917',
                  fontWeight: 500
                }}>
                  {model.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section - Two Column */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left: Content */}
            <div>
              <Badge 
                className="mb-4 text-xs uppercase tracking-wider"
                style={{ 
                  backgroundColor: '#d4a574',
                  color: 'white',
                  fontWeight: 500,
                  padding: '0.5rem 1rem'
                }}
              >
                Why AIDI
              </Badge>
              <h2 
                className="mb-4 md:mb-6"
                style={{ 
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  fontWeight: 400,
                  color: '#1c1917',
                  lineHeight: 1.3,
                  fontFamily: 'Georgia, serif'
                }}
              >
                Audit-Grade Methodology.
                <br />
                <span style={{ fontWeight: 300, color: '#44403c' }}>Board-Ready Intelligence.</span>
              </h2>
              <p className="text-base md:text-lg mb-6 md:mb-8" style={{ color: '#57534e', lineHeight: 1.7, fontWeight: 400 }}>
                Not all AI visibility measurement is created equal. AIDI employs statistical rigor, 
                peer-reviewable methodology, and bias-controlled testing designed for enterprise decision-making.
              </p>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {methodologyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#5a7359' }} />
                    <span style={{ color: '#44403c', lineHeight: 1.6, fontWeight: 400 }}>{point}</span>
                  </div>
                ))}
              </div>

              <button 
                className="px-6 md:px-8 py-3 md:py-4 rounded-xl border-2 hover:bg-slate-50 transition-all flex items-center gap-2"
                style={{ 
                  borderColor: '#1c1917',
                  color: '#1c1917',
                  fontWeight: 500
                }}
              >
                View Full Methodology
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Visual Proof */}
            <div className="relative">
              <div 
                className="rounded-2xl p-6 md:p-8 border-2 bg-white shadow-xl"
                style={{ 
                  borderColor: '#e7e5e4'
                }}
              >
                <div className="space-y-4 md:space-y-6">
                  {/* Score Display */}
                  <div className="bg-slate-50 rounded-xl p-5 md:p-6 border" style={{ borderColor: '#e7e5e4' }}>
                    <div className="text-xs uppercase tracking-wider mb-3" style={{ color: '#78716c', fontWeight: 500 }}>
                      AIDI Score
                    </div>
                    <div className="flex items-end gap-3">
                      <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: 400, color: '#1c1917', lineHeight: 1, fontFamily: 'Georgia, serif' }}>
                        82
                      </div>
                      <div className="mb-2 text-xl" style={{ color: '#78716c' }}>/100</div>
                    </div>
                  </div>

                  {/* CI Display */}
                  <div className="bg-slate-50 rounded-xl p-5 md:p-6 border" style={{ borderColor: '#e7e5e4' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4" style={{ color: '#57534e' }} />
                      <div className="text-xs uppercase tracking-wider" style={{ color: '#78716c', fontWeight: 500 }}>
                        95% Confidence Interval
                      </div>
                    </div>
                    <div style={{ color: '#1c1917', fontSize: '1.5rem', fontWeight: 500 }}>
                      79–85
                    </div>
                    <div className="text-xs mt-2" style={{ color: '#78716c', fontWeight: 400 }}>
                      n = 15 runs • p &lt; 0.01
                    </div>
                  </div>

                  {/* Percentile */}
                  <div className="bg-emerald-50 rounded-xl p-5 md:p-6 border" style={{ borderColor: '#5a735940' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4" style={{ color: '#5a7359' }} />
                      <div className="text-xs uppercase tracking-wider" style={{ color: '#4a5f49', fontWeight: 500 }}>
                        Percentile Rank
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div style={{ fontSize: '2rem', color: '#5a7359', fontWeight: 500, lineHeight: 1 }}>
                        94<span style={{ fontSize: '1.25rem', color: '#4a5f49' }}>th</span>
                      </div>
                    </div>
                    <div className="text-xs mt-2" style={{ color: '#4a5f49', fontWeight: 400 }}>
                      Top 6% in Athletic Footwear
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 
              className="mb-4 md:mb-6"
              style={{ 
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                fontWeight: 400,
                color: '#1c1917',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.2
              }}
            >
              Institutional-Grade Intelligence
            </h2>
            <p className="text-base md:text-lg" style={{ color: '#57534e', lineHeight: 1.7, fontWeight: 400, maxWidth: '700px', margin: '0 auto' }}>
              Choose the audit depth that matches your strategic requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <motion.div
                key={tier.id}
                className="relative bg-white rounded-2xl p-8 border-2 shadow-lg hover:shadow-2xl transition-all"
                style={{
                  borderColor: tier.recommended ? '#d4a574' : '#e7e5e4',
                }}
                whileHover={{ y: -4 }}
              >
                {tier.recommended && (
                  <div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider"
                    style={{ backgroundColor: '#d4a574', color: 'white', fontWeight: 500 }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-sm uppercase tracking-wider mb-3" style={{ fontWeight: 500, color: '#57534e', letterSpacing: '0.1em' }}>
                    {tier.name}
                  </div>
                  <div className="mb-2" style={{ fontSize: '3rem', fontWeight: 400, fontFamily: 'Georgia, serif', color: '#1c1917' }}>
                    {tier.price}
                  </div>
                  <div className="text-sm" style={{ color: '#78716c' }}>
                    One-time payment
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#5a7359' }} />
                      <span className="text-sm" style={{ color: '#44403c', lineHeight: 1.6 }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(tier.id)}
                  className="w-full px-6 py-4 rounded-xl transition-all hover:opacity-90 shadow-md"
                  style={{
                    backgroundColor: tier.recommended ? '#1c1917' : 'white',
                    color: tier.recommended ? 'white' : '#1c1917',
                    border: tier.recommended ? 'none' : '2px solid #e7e5e4',
                    fontWeight: 500
                  }}
                >
                  Subscribe Now
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10 md:mt-12">
            <p className="text-sm" style={{ color: '#78716c' }}>
              All plans include peer-reviewable methodology and statistical rigor
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 
            className="mb-4 md:mb-6"
            style={{ 
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              fontWeight: 400,
              color: '#1c1917',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.2
            }}
          >
            Ready to see your AI visibility score?
          </h2>
          <p className="text-base md:text-lg mb-8 md:mb-10" style={{ color: '#57534e', lineHeight: 1.7, fontWeight: 400 }}>
            Join leading brands using AIDI for competitive intelligence and strategic planning.
          </p>
          <button
            className="px-10 md:px-12 py-4 md:py-5 rounded-xl text-white text-base md:text-lg hover:opacity-90 transition-all shadow-xl"
            style={{
              backgroundColor: '#1c1917',
              fontWeight: 500
            }}
          >
            Get Your AIDI Score →
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
