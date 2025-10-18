'use client';

import { useEffect, useState } from 'react';
import { CareersPageWithData } from '@/components/CareersPageWithData';
import { FigmaCareersPage } from '@/components/FigmaCareersPage';

export default function CareersPage() {
  const [useRealData, setUseRealData] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch real job postings from the database
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/cms/jobs?status=open&limit=20');
        if (response.ok) {
          const data = await response.json();
          if (data.jobs && data.jobs.length > 0) {
            setJobs(data.jobs);
            setUseRealData(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch job postings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading job postings...</div>
      </div>
    );
  }

  // Use real data if available, otherwise fall back to Figma design
  if (useRealData) {
    return <CareersPageWithData jobs={jobs} />;
  }

  // Fallback to Figma design with mock data
  return <FigmaCareersPage />;
}
