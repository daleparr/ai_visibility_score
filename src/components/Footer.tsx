import Link from 'next/link';
import { Brain } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6" />
              <span className="text-lg font-bold">AIDI</span>
            </div>
            <p className="text-gray-400 text-sm">
              The benchmark standard for measuring brand visibility in AI-powered answer engines.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/evaluate" className="hover:text-white">Get Your Score</Link></li>
              <li><Link href="/reports" className="hover:text-white">Industry Reports</Link></li>
              <li><Link href="/leaderboards" className="hover:text-white">Leaderboards</Link></li>
              <li><Link href="/methodology" className="hover:text-white">Methodology</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/aidi-vs-monitoring-tools" className="hover:text-white">vs. Monitoring Tools</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><a href="mailto:hello@aidi.com" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 AI Discoverability Index (AIDI). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

