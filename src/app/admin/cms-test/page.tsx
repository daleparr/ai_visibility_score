'use client';

/**
 * CMS Test Page - No Auth Required
 * For testing CMS functionality without authentication
 * Access at: /admin/cms-test
 */

import { useState } from 'react';
import { ThemeEditor } from '@/components/admin/ThemeEditor';
import { BlogManager } from '@/components/admin/BlogManager';
import { JobManager } from '@/components/admin/JobManager';
import {
  Palette,
  Newspaper,
  Briefcase
} from 'lucide-react';

type Section = 'theme' | 'blog' | 'jobs';

export default function CMSTestPage() {
  const [activeSection, setActiveSection] = useState<Section>('theme');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold px-3 mb-1">CMS Test Mode</h2>
            <p className="text-xs text-gray-500 px-3">No auth required</p>
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeSection === 'theme' && <ThemeEditor />}
          {activeSection === 'blog' && <BlogManager />}
          {activeSection === 'jobs' && <JobManager />}
        </main>
      </div>
    </div>
  );
}


