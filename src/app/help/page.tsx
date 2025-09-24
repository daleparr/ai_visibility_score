import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center | AI Discoverability Index',
  description: 'Find answers to common questions about AIDI, AI discoverability measurement, and optimizing your brand visibility.',
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Find answers to common questions about AIDI and AI discoverability measurement.
            </p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Search for Help</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-3 top-3 p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {/* Getting Started */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Getting Started</h2>
              <div className="space-y-4">
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    How do I get my first AI discoverability score?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p>Simply visit our evaluation page and enter your website URL. No signup required for the free audit. Results are typically available within 5-10 minutes.</p>
                  </div>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    What makes AIDI different from traditional SEO tools?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p>Traditional SEO tools measure search engine crawlability. AIDI measures how AI models actually understand and recommend your brand to real customers.</p>
                  </div>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    Which AI models does AIDI test?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p>We test across 5+ leading AI models including ChatGPT, Claude, Gemini, and other proprietary systems used for product recommendations.</p>
                  </div>
                </details>
              </div>
            </div>

            {/* Understanding Scores */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Understanding Your Scores</h2>
              <div className="space-y-4">
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    What do the Infrastructure, Perception, and Commerce scores mean?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p><strong>Infrastructure:</strong> Can AI models parse and understand your digital footprint?</p>
                    <p><strong>Perception:</strong> What do AI models know about your brand and reputation?</p>
                    <p><strong>Commerce:</strong> Can AI models recommend your products and facilitate transactions?</p>
                  </div>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    How is the overall AIDI score calculated?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p>The overall score is a weighted average of all 12 dimensions, with emphasis on the dimensions most critical for your industry and business model.</p>
                  </div>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    What's a good AIDI score?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p>Scores above 80 indicate strong AI discoverability. Scores below 60 suggest significant optimization opportunities. Industry context matters—check our leaderboards for benchmarks.</p>
                  </div>
                </details>
              </div>
            </div>

            {/* Technical Questions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Technical Questions</h2>
              <div className="space-y-4">
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    How long does an evaluation take?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p>Free audits complete in 5-10 minutes. Professional multi-model analysis takes 15-30 minutes depending on brand complexity.</p>
                  </div>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    Can I integrate AIDI with my existing tools?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p>Yes! Pro and Enterprise plans include API access for integrating AIDI scores into your dashboards, reporting tools, and workflows.</p>
                  </div>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    How often should I re-evaluate my brand?
                  </summary>
                  <div className="mt-3 pl-4 text-gray-700">
                    <p>We recommend monthly evaluations to track optimization progress and monitor competitor movements. Enterprise customers get automated monitoring.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Still Need Help */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find what you're looking for? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support →
              </a>
              <a 
                href="/docs" 
                className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Documentation →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}