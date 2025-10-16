'use client';

import { useState } from 'react';
import { ThemeEditor } from '@/components/admin/ThemeEditor';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { BlogManager } from '@/components/admin/BlogManager';
import { JobManager } from '@/components/admin/JobManager';
import {
  Palette,
  FileText,
  Newspaper,
  Briefcase,
  Settings
} from 'lucide-react';

type CMSSection = 'theme' | 'content' | 'blog' | 'jobs';

export default function CMSAdminPage() {
  const [activeSection, setActiveSection] = useState<CMSSection>('theme');
  const [selectedPage, setSelectedPage] = useState('homepage');

  const pages = [
    { slug: 'homepage', label: 'Homepage' },
    { slug: 'about', label: 'About' },
    { slug: 'pricing', label: 'Pricing' },
    { slug: 'contact', label: 'Contact' }
  ];

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
        </main>
      </div>
    </div>
  );
}

