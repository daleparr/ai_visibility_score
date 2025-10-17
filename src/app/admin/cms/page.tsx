'use client';

import { useState, useEffect } from 'react';
import { ThemeEditor } from '@/components/admin/ThemeEditor';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { BlogManager } from '@/components/admin/BlogManager';
import { JobManager } from '@/components/admin/JobManager';
import { TierManager } from '@/components/admin/TierManager';
import { UserManager } from '@/components/admin/UserManager';
import { InvoiceManager } from '@/components/admin/InvoiceManager';
import { SectorManager } from '@/components/admin/SectorManager';
import { LogoManager } from '@/components/admin/LogoManager';
import { AgentControlPanel } from '@/components/admin/AgentControlPanel';
import {
  Palette,
  FileText,
  Newspaper,
  Briefcase,
  Settings,
  Package,
  Users,
  Receipt,
  BarChart3,
  Image,
  Bot
} from 'lucide-react';

type CMSSection = 'theme' | 'content' | 'blog' | 'jobs' | 'tiers' | 'users' | 'invoices' | 'sectors' | 'logos' | 'agents';

interface CMSPage {
  slug: string;
  label: string;
  title: string;
}

export default function CMSAdminPage() {
  const [activeSection, setActiveSection] = useState<CMSSection>('theme');
  const [selectedPage, setSelectedPage] = useState('homepage');
  const [pages, setPages] = useState<CMSPage[]>([
    { slug: 'homepage', label: 'Homepage', title: 'Homepage' }
  ]);
  const [loadingPages, setLoadingPages] = useState(true);

  // Load all CMS pages from database
  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/cms/pages');
      const data = await response.json();
      
      if (data?.pages) {
        const formattedPages = data.pages.map((p: any) => ({
          slug: p.slug,
          label: p.title,
          title: p.title
        }));
        setPages(formattedPages);
        
        // Set first page as selected if current selection doesn't exist
        if (formattedPages.length > 0 && !formattedPages.find((p: any) => p.slug === selectedPage)) {
          setSelectedPage(formattedPages[0].slug);
        }
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
      // Fallback to default pages if API fails
      setPages([
        { slug: 'homepage', label: 'Homepage', title: 'Homepage' },
        { slug: 'about', label: 'About', title: 'About' },
        { slug: 'pricing', label: 'Pricing', title: 'Pricing' },
        { slug: 'contact', label: 'Contact', title: 'Contact' },
        { slug: 'leaderboards', label: 'Leaderboards', title: 'AI Discoverability Leaderboards' },
        { slug: 'industry-report-template', label: 'Industry Report Template', title: 'Industry Report Template' },
        { slug: 'evaluation-report-template', label: 'Evaluation Report Template', title: 'Evaluation Report Template' }
      ]);
    } finally {
      setLoadingPages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold px-3 mb-4">CMS Admin</h2>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('theme')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'theme'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Palette className="h-4 w-4" />
              Theme Editor
            </button>

            <button
              onClick={() => setActiveSection('content')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'content'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              Page Content
            </button>

            <button
              onClick={() => setActiveSection('blog')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'blog'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Newspaper className="h-4 w-4" />
              Blog Posts
            </button>

            <button
              onClick={() => setActiveSection('jobs')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'jobs'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Job Board
            </button>

            <button
              onClick={() => setActiveSection('tiers')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'tiers'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package className="h-4 w-4" />
              Pricing Tiers
            </button>

            <button
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'users'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4" />
              User Management
            </button>

            <button
              onClick={() => setActiveSection('invoices')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'invoices'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Receipt className="h-4 w-4" />
              Invoicing
            </button>

            <button
              onClick={() => setActiveSection('sectors')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'sectors'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Industry Reports
            </button>

            <button
              onClick={() => setActiveSection('logos')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'logos'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Image className="h-4 w-4" />
              Brand Logos
            </button>

            <button
              onClick={() => setActiveSection('agents')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'agents'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bot className="h-4 w-4" />
              Agent Control
            </button>
          </nav>

          {/* Page Selector for Content Section */}
          {activeSection === 'content' && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-xs font-semibold text-gray-500 px-3 mb-2">
                SELECT PAGE
              </div>
              <div className="space-y-1">
                {pages.map((page) => (
                  <button
                    key={page.slug}
                    onClick={() => setSelectedPage(page.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedPage === page.slug
                        ? 'bg-gray-100 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeSection === 'theme' && <ThemeEditor />}
          {activeSection === 'content' && <ContentEditor pageSlug={selectedPage} />}
          {activeSection === 'blog' && <BlogManager />}
          {activeSection === 'jobs' && <JobManager />}
          {activeSection === 'tiers' && <TierManager />}
          {activeSection === 'users' && <UserManager />}
          {activeSection === 'invoices' && <InvoiceManager />}
          {activeSection === 'sectors' && <SectorManager />}
          {activeSection === 'logos' && <LogoManager />}
          {activeSection === 'agents' && <AgentControlPanel />}
        </main>
      </div>
    </div>
  );
}

