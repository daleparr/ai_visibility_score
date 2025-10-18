import { Brain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DynamicPricingCards } from '@/components/DynamicPricingCards';
import { Footer } from '@/components/Footer';

// Disable caching so CMS changes appear immediately
export const revalidate = 0;

export default function PricingPage() {
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
              <Link href="/reports" className="text-gray-600 hover:text-brand-600 transition-colors">
                Reports
              </Link>
              <Link href="/pricing" className="text-brand-600 font-medium">
                Pricing
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free with instant AI visibility analysis. Upgrade when you need advanced features, competitive benchmarking, and strategic intelligence.
            </p>
          </div>

          {/* Dynamic Pricing Cards - Fully CMS Controlled */}
          <DynamicPricingCards className="mb-16" />

          {/* FAQ / Trust Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mt-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">What's included in the free tier?</h4>
                <p className="text-gray-700">
                  Complete 12-dimension AI visibility analysis, your AIDI score with grade, and basic recommendations. No credit card required.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I upgrade later?</h4>
                <p className="text-gray-700">
                  Yes! Start free, then upgrade to Index Pro or Enterprise when you need multi-model analysis, industry benchmarking, or API access.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-gray-700">
                  All major credit cards via Stripe. Enterprise customers can pay via invoice with NET-30 terms.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                <p className="text-gray-700">
                  100% satisfaction guarantee. If you're not satisfied with the quality or rigor of your report, we'll refund your payment.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-gray-600 mb-6">
              See your AI visibility score in minutes - no signup required for free tier
            </p>
            <Button size="lg" asChild>
              <Link href="/evaluate">
                Get Your AIDI Score Now →
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

