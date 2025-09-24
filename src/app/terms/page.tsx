'use client'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | AI Discoverability Index',
  description: 'Terms of Service for using the AI Discoverability Index platform and services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Terms and conditions for using the AI Discoverability Index platform.
            </p>
            <p className="text-sm text-gray-500 mt-4">Last updated: September 24, 2024</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Acceptance */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using the AI Discoverability Index platform ("Service"), you agree to be bound by these 
                Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                AIDI provides AI discoverability measurement and optimization services, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Brand visibility analysis across AI models</li>
                <li>AI discoverability scoring and benchmarking</li>
                <li>Optimization recommendations and insights</li>
                <li>Industry leaderboards and competitive intelligence</li>
                <li>API access for integration with third-party tools</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and up-to-date information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Attempt to reverse engineer or compromise our systems</li>
                <li>Submit false or misleading information</li>
                <li>Use automated tools to abuse our evaluation system</li>
                <li>Resell or redistribute our services without permission</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content, features, and functionality are owned by AIDI and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Billing:</strong> Subscription fees are billed in advance on a monthly or annual basis.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Refunds:</strong> We offer prorated refunds for annual subscriptions canceled within 30 days.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Price Changes:</strong> We reserve the right to modify pricing with 30 days' notice.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, 
                  completeness, or reliability of AI evaluation results. AIDI scores are for informational purposes 
                  and should not be the sole basis for business decisions.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                AIDI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including loss of profits, data, or business opportunities, arising from your use of the Service.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
                without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                Questions about these Terms? Contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:legal@aidi.ai" className="text-blue-600 hover:text-blue-800">legal@aidi.ai</a><br/>
                  <strong>Subject:</strong> Terms of Service Inquiry
                </p>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="text-center mt-16">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              ↑ Back to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}