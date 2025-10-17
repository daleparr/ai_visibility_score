import { contentManager } from '@/lib/cms/cms-client'
import { Brain, Mail, Book, MessageCircle, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Disable caching so CMS changes appear immediately
export const revalidate = 0;

export default async function FAQPage() {
  const page = await contentManager.getPage('faq')
  const faqs = await contentManager.getBlockByKey('faq', 'faq_items')
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold gradient-text">AIDI</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-brand-600 transition-colors">
                Home
              </Link>
              <Link href="/methodology" className="text-gray-600 hover:text-brand-600 transition-colors">
                Methodology
              </Link>
              <Link href="/faq" className="text-brand-600 font-medium">
                FAQ
              </Link>
              <Link href="/aidi-vs-monitoring-tools" className="text-gray-600 hover:text-brand-600 transition-colors">
                vs. Monitoring Tools
              </Link>
              <Button variant="outline" asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            {page?.title || 'Frequently Asked Questions'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            Clear answers about AIDI's methodology, positioning, and strategic value.
          </p>
          
          {/* FAQ Grid - 3 columns x 4 rows = 12 questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {faqs?.questions?.map((faq: any, idx: number) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-6 w-6 text-brand-600 mt-1 flex-shrink-0" />
                    <CardTitle className="text-lg leading-tight">{faq.question}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Show placeholder if no FAQs in CMS */}
          {(!faqs?.questions || faqs.questions.length === 0) && (
            <div className="text-center py-12 bg-white rounded-xl border">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">FAQ questions will appear here once added to CMS</p>
              <p className="text-sm text-gray-500 mt-2">Go to CMS → Page Content → FAQ to add questions</p>
            </div>
          )}
          
          {/* Still Have Questions CTA */}
          <div className="bg-brand-50 border-l-4 border-brand-500 p-6 md:p-8 rounded-r-xl mt-16">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-brand-900">Still have questions?</h3>
            <p className="text-gray-700 mb-6 text-sm md:text-base">
              We're here to help. Our team includes data scientists, AEO strategists, 
              and former Fortune 500 executives who understand your challenges.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
              <Button variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto" asChild>
                <a href="mailto:hello@aidi.com">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm md:text-base">hello@aidi.com</span>
                </a>
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto" asChild>
                <Link href="/evaluate">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm md:text-base">Get Started</span>
                </Link>
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto" asChild>
                <Link href="/methodology">
                  <Book className="h-4 w-4" />
                  <span className="text-sm md:text-base">Read Methodology</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 AI Discoverability Index (AIDI). All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
            <Link href="/methodology" className="hover:text-white">Methodology</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

