import { Brain } from 'lucide-react';
import Link from 'next/link';
import { HomePageInteractive } from './Interactive';
import { AIModelLogos } from '../AIModelLogos';
import { Footer } from '../Footer';

export function MinimalHomepageVariant() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Minimal Top Nav - Just Logo + Sign In */}
      <header className="py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">AIDI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/methodology" className="text-gray-600 hover:text-gray-900 transition">
              Methodology
            </Link>
            <Link href="/reports" className="text-gray-600 hover:text-gray-900 transition">
              Reports
            </Link>
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Spacious Hero - Maximum White Space */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-4xl w-full text-center space-y-16">
          {/* Premium Tagline - Minimal Copy */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-none">
              Discover Your AI Visibility.
              <br />
              Instantly.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
              See exactly how ChatGPT, Claude, and Gemini recommend your brand.
            </p>
          </div>

          {/* Single Prominent URL Input */}
          <div className="max-w-2xl mx-auto">
            <HomePageInteractive />
          </div>

          {/* AI Model Logos - Trust Signals (All Labs Visible) */}
          <div className="pt-12 max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 text-center mb-8 uppercase tracking-wider font-semibold">
              Testing Across Frontier AI Models
            </p>
            <div className="flex items-center justify-center gap-12 flex-wrap">
              {['openai', 'anthropic', 'google-ai', 'perplexity', 'mistral'].map((model) => (
                <div key={model} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-32 h-32 flex items-center justify-center">
                    <img
                      src={`/logos/${model === 'openai' ? 'OpenAI' : model === 'anthropic' ? 'Anthropic' : model === 'google-ai' ? 'Google' : model === 'perplexity' ? 'Perplexity AI' : 'Mistral ai'} logo 200 x 80.png`}
                      alt={`${model} logo`}
                      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-2">
                    {model === 'openai' ? 'ChatGPT' : model === 'anthropic' ? 'Claude' : model === 'google-ai' ? 'Gemini' : model === 'perplexity' ? 'Perplexity' : 'Mistral'}
                  </span>
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
