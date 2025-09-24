import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | AI Discoverability Index',
  description: 'Learn about AIDI, the first platform to measure and optimize brand visibility across AI-powered search and recommendation systems.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About AI Discoverability Index
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              The first platform to measure and optimize brand visibility across AI-powered search and recommendation systems.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              As AI models become the primary interface for customer research and discovery, traditional SEO metrics are becoming obsolete. 
              We're pioneering the next generation of digital visibility measurement—helping brands understand how AI sees, interprets, and recommends them.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              AIDI provides the tools and insights needed to optimize your brand's presence in the AI-driven economy, ensuring you remain discoverable 
              when customers ask AI assistants for recommendations.
            </p>
          </div>

          {/* The Problem */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem We're Solving</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  <strong>70% of customers</strong> now start product research with AI assistants like ChatGPT, Claude, and Gemini
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  Traditional SEO tools can't measure AI visibility—they only check if search engines can crawl your site
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  Brands are invisible to AI models despite having perfect "SEO scores"
                </p>
              </div>
            </div>
          </div>

          {/* Our Solution */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  <strong>Direct AI Testing:</strong> We probe 5+ AI models with real customer questions about your brand
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  <strong>12-Dimension Analysis:</strong> Comprehensive scoring across Infrastructure, Perception, and Commerce pillars
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  <strong>Actionable Insights:</strong> Clear recommendations for improving your AI discoverability
                </p>
              </div>
            </div>
          </div>

          {/* Team & Technology */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Technology & Methodology</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              AIDI combines advanced data science with LLM expertise to create the most comprehensive AI visibility measurement platform available. 
              Our methodology includes:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Model Analysis</h3>
                <p className="text-gray-700">Testing across ChatGPT, Claude, Gemini, and other leading AI models to ensure comprehensive coverage.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Statistical Validation</h3>
                <p className="text-gray-700">Confidence intervals, hallucination detection, and schema-constrained outputs for reliable results.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Hybrid Evidence</h3>
                <p className="text-gray-700">Combining structured signals, AI comprehension analysis, and citation verification.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Industry Benchmarking</h3>
                <p className="text-gray-700">Compare your AI visibility against competitors and industry leaders in real-time.</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Measure Your AI Visibility?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Get your free AI discoverability audit in minutes. No signup required.
            </p>
            <a 
              href="/evaluate" 
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Your Free Audit →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}