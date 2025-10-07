import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation | AI Discoverability Index',
  description: 'Comprehensive API documentation for integrating AIDI into your applications and workflows.',
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              API Documentation
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Integrate AI Discoverability Index into your applications and workflows with our comprehensive API.
            </p>
          </div>

          {/* API Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The AIDI API allows you to programmatically evaluate brands, retrieve scores, and access benchmark data. 
              Perfect for integrating AI discoverability insights into your existing tools and workflows.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Base URL</h3>
              <code className="text-blue-600 font-mono">https://ai-visibility-score.netlify.app/api</code>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
              <p className="text-yellow-700">
                API access requires an active AIDI Index Pro or Enterprise subscription. 
                Contact our sales team to get your API key.
              </p>
            </div>
          </div>

          {/* Endpoints */}
          <div className="space-y-8">
            {/* Evaluate Endpoint */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">POST /api/evaluate</h3>
              <p className="text-gray-700 mb-6">Initiate a new AI discoverability evaluation for a brand.</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Request Body</h4>
                <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "brandUrl": "https://example.com",
  "brandName": "Example Brand",
  "industry": "ecommerce",
  "priority": "standard"
}`}
                </pre>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Response</h4>
                <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "evaluationId": "eval_123456",
  "status": "queued",
  "estimatedCompletion": "2024-09-24T12:00:00Z"
}`}
                </pre>
              </div>
            </div>

            {/* Status Endpoint */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">GET /api/evaluate/status</h3>
              <p className="text-gray-700 mb-6">Check the status of an ongoing evaluation.</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Parameters</h4>
                <p className="text-gray-700"><code>evaluationId</code> - The ID returned from the evaluate endpoint</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Response</h4>
                <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "evaluationId": "eval_123456",
  "status": "completed",
  "overallScore": 85,
  "pillarScores": {
    "infrastructure": 90,
    "perception": 82,
    "commerce": 83
  },
  "completedAt": "2024-09-24T12:05:00Z"
}`}
                </pre>
              </div>
            </div>

            {/* Leaderboards Endpoint */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">GET /api/leaderboards</h3>
              <p className="text-gray-700 mb-6">Access industry leaderboards and benchmarking data.</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Parameters</h4>
                <ul className="text-gray-700 space-y-2">
                  <li><code>industry</code> - Filter by industry (optional)</li>
                  <li><code>limit</code> - Number of results (default: 50, max: 100)</li>
                  <li><code>offset</code> - Pagination offset (default: 0)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Need API Access?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Contact our team to get your API key and start integrating AIDI into your workflows.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Sales →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}