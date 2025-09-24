import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | AI Discoverability Index',
  description: 'Get in touch with the AIDI team for support, partnerships, or enterprise solutions.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Get in touch with our team for support, partnerships, or enterprise solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@company.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="press">Press & Media</option>
                    <option value="careers">Careers</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* General Contact */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">General Inquiries</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Email:</strong> <a href="mailto:hello@aidi.ai" className="text-blue-600 hover:text-blue-800">hello@aidi.ai</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Response Time:</strong> Within 24 hours
                  </p>
                </div>
              </div>

              {/* Sales Contact */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sales & Partnerships</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Email:</strong> <a href="mailto:sales@aidi.ai" className="text-blue-600 hover:text-blue-800">sales@aidi.ai</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Enterprise Solutions:</strong> Custom pricing and features available
                  </p>
                </div>
              </div>

              {/* Support Contact */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Support</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Email:</strong> <a href="mailto:support@aidi.ai" className="text-blue-600 hover:text-blue-800">support@aidi.ai</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Available:</strong> Monday-Friday, 9 AM - 6 PM UTC
                  </p>
                </div>
              </div>

              {/* Office Information */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🌍 Remote-First Company</h3>
                <p className="text-gray-700 leading-relaxed">
                  We're a distributed team working across time zones to build the future of AI discoverability measurement. 
                  Our team spans from Silicon Valley to London, bringing diverse perspectives to this emerging field.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Looking for quick answers? Check our documentation first.
            </p>
            <a 
              href="/docs" 
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Documentation →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}