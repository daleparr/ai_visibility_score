import { Brain } from 'lucide-react';
import Link from 'next/link';
import { HomePageInteractive } from './Interactive';
import { AIModelLogos } from '../AIModelLogos';
import { Footer } from '../Footer';

export function MinimalHomepageVariant() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Minimal Top Nav - Mobile Menu Included */}
      <header className="py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-7 w-7 md:h-8 md:w-8 text-brand-600" />
            <span className="text-lg md:text-xl font-bold text-gray-900">AIDI</span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-8 text-sm">
            <Link href="/methodology" className="text-gray-600 hover:text-gray-900 transition">
              Methodology
            </Link>
            <Link href="/reports" className="text-gray-600 hover:text-gray-900 transition hidden sm:inline">
              Reports
            </Link>
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero - Reduced Padding */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-16 -mt-4 md:-mt-8">
        <div className="max-w-4xl w-full text-center space-y-8 md:space-y-12">
          {/* Premium Tagline - Smaller on Mobile */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 tracking-tight leading-none">
              Discover Your AI Visibility.
              <br />
              Instantly.
            </h1>
            <p className="text-lg md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
              See exactly how ChatGPT, Claude, and Gemini recommend your brand.
            </p>
          </div>

          {/* Single Prominent URL Input */}
          <div className="max-w-2xl mx-auto">
            <HomePageInteractive />
          </div>

          {/* AI Model Logos - Trust Signals (Single Row) */}
          <div className="pt-12 max-w-4xl mx-auto">
            <p className="text-xs text-gray-500 text-center mb-6 uppercase tracking-wider font-semibold">
              Testing Across Frontier AI Models
            </p>
            <div className="flex items-center justify-between gap-4 md:gap-8 overflow-x-auto pb-4" style={{flexWrap: 'nowrap'}}>
              {['openai', 'anthropic', 'google-ai', 'perplexity', 'mistral'].map((model) => (
                <div key={model} className="flex-shrink-0 flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 md:w-28 md:h-28 flex items-center justify-center">
                    <img
                      src={`/logos/${model === 'openai' ? 'OpenAI' : model === 'anthropic' ? 'Anthropic' : model === 'google-ai' ? 'Google' : model === 'perplexity' ? 'Perplexity AI' : 'Mistral ai'} logo 200 x 80.png`}
                      alt={`${model} logo`}
                      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimal Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 pt-8">
            <div className="flex items-center gap-2">
              <span className="text-brand-600 font-semibold">✓</span>
              <span>4+ AI Models</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-600 font-semibold">✓</span>
              <span>12 Dimensions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-600 font-semibold">✓</span>
              <span>95% Confidence Intervals</span>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Secondary CTA - Below Fold */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="text-sm text-gray-600 mb-6">
            Used by brand managers at leading companies for competitive intelligence
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <Link href="/methodology" className="hover:text-gray-900 transition">
              How It Works →
            </Link>
            <Link href="/reports" className="hover:text-gray-900 transition">
              Industry Reports →
            </Link>
            <Link href="/blog" className="hover:text-gray-900 transition">
              Blog →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
