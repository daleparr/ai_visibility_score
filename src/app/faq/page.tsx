import { contentManager } from '@/lib/cms/cms-client'
import { Brain, Mail, Book, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FAQAccordion } from '@/components/faq/Accordion'

export default async function FAQPage() {
  const page = await contentManager.getPage('faq')
  const categories = await contentManager.getBlockByKey('faq', 'faq_categories')
  
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
          
          {/* FAQ Categories */}
          {categories?.categories?.map((category: any, catIdx: number) => (
            <div key={catIdx} className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                {category.name}
              </h2>
              
              <div className="space-y-4">
                {category.questions?.map((q: any) => (
                  <FAQAccordion 
                    key={q.id}
                    question={q.question}
                    answer={q.answer}
                  />
                ))}
              </div>
            </div>
          ))}
          
          {/* Still Have Questions CTA */}
          <div className="bg-brand-50 border-l-4 border-brand-500 p-8 rounded-r-xl mt-16">
            <h3 className="text-2xl font-bold mb-4 text-brand-900">Still have questions?</h3>
            <p className="text-gray-700 mb-6">
              We're here to help. Our team includes data scientists, AEO strategists, 
              and former Fortune 500 executives who understand your challenges.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email: hello@aidi.com
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Book a Consultation
              </Button>
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <Link href="/methodology">
                  <Book className="h-4 w-4" />
                  Read Methodology
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

