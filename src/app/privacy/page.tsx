import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | AI Discoverability Index',
  description: 'Learn how AIDI protects your privacy and handles data in our AI discoverability measurement platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              How we protect your privacy and handle data at AI Discoverability Index.
            </p>
            <p className="text-sm text-gray-500 mt-4">Last updated: September 24, 2024</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                At AI Discoverability Index ("AIDI," "we," "us," or "our"), we are committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Account information (name, email address, company)</li>
                <li>Brand and website URLs for evaluation</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and improve our AI discoverability measurement services</li>
                <li>Generate evaluation reports and benchmarking data</li>
                <li>Process payments and manage subscriptions</li>
                <li>Communicate with you about your account and our services</li>
                <li>Develop aggregate insights and industry benchmarks (anonymized)</li>
                <li>Ensure platform security and prevent abuse</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection & Security</h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Our Commitments</h3>
                <ul className="list-disc pl-6 text-blue-800 space-y-2">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Secure cloud infrastructure with regular security audits</li>
                  <li>Limited access controls and employee data handling training</li>
                  <li>Regular deletion of unnecessary data</li>
                  <li>Compliance with GDPR, CCPA, and other privacy regulations</li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell or rent your personal information. We may share information in limited circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>With service providers who help us operate our platform (under strict data protection agreements)</li>
                <li>To comply with legal obligations or protect our rights</li>
                <li>In aggregate, anonymized form for industry research and benchmarking</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access, update, or delete your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
                <li>Request restriction of processing</li>
                <li>File a complaint with supervisory authorities</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies & Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to improve your experience, analyze usage patterns, and provide 
                personalized content. You can control cookie preferences through your browser settings.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                AIDI is not intended for users under 16. We do not knowingly collect personal information from children 
                under 16. If we learn we have collected such information, we will delete it promptly.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email 
                or prominent notice on our platform. Continued use constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:privacy@aidi.ai" className="text-blue-600 hover:text-blue-800">privacy@aidi.ai</a><br/>
                  <strong>Subject:</strong> Privacy Policy Inquiry
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}