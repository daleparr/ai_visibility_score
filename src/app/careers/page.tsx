import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers | AI Discoverability Index',
  description: 'Join our team building the future of AI discoverability measurement and brand optimization.',
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Help us build the future of AI discoverability measurement and brand optimization.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We're pioneering a new discipline: AI Discoverability. As traditional search evolves into AI-powered conversation, 
              brands need new ways to measure and optimize their visibility. We're building the tools that will define this space.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Join us in creating the measurement platform that will help brands thrive in the age of AI assistants.
            </p>
          </div>

          {/* Open Positions */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
            
            <div className="space-y-6">
              {/* Senior Data Scientist */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Senior Data Scientist</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Remote</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Build and optimize our multi-model AI evaluation framework. Work with LLMs, statistical validation, 
                  and advanced analytics to measure brand visibility across AI systems.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Python</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Machine Learning</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">LLMs</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Statistics</span>
                </div>
              </div>

              {/* Frontend Engineer */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Senior Frontend Engineer</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Remote</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Design and build intuitive interfaces for complex AI analytics. Create beautiful, responsive dashboards 
                  that make AI discoverability insights accessible to marketing teams.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">React</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">TypeScript</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Next.js</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Tailwind</span>
                </div>
              </div>

              {/* Product Manager */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Product Manager</h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Remote</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Shape the future of AI discoverability measurement. Work closely with customers to understand their needs 
                  and translate insights into product features that drive business value.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Product Strategy</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">AI/ML</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">B2B SaaS</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Why Join Us */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Join AIDI?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Pioneer a New Field</h3>
                <p className="text-gray-700">Be at the forefront of AI discoverability—a discipline that will define the next decade of digital marketing.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🧠 Cutting-Edge Technology</h3>
                <p className="text-gray-700">Work with the latest AI models, advanced analytics, and bleeding-edge measurement techniques.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🌍 Remote-First Culture</h3>
                <p className="text-gray-700">Work from anywhere with a supportive, distributed team focused on results and innovation.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📈 Growth Opportunity</h3>
                <p className="text-gray-700">Join an early-stage company with huge market potential and significant impact on brand strategy.</p>
              </div>
            </div>
          </div>

          {/* No Current Openings */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Current Openings?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We're always interested in connecting with exceptional talent. If you're passionate about AI, data science, 
              or product development and want to help shape the future of brand discoverability, we'd love to hear from you.
            </p>
          </div>

          {/* Contact */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Join Us?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Send us your resume and a note about why you're excited about AI discoverability.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get in Touch →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}