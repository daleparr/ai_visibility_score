'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Clock, DollarSign, Briefcase, ArrowLeft, Brain, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { markdownToHtmlAdvanced } from '@/lib/markdown';

interface JobPosting {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range?: string;
  description: string;
  requirements: string[];
  nice_to_have?: string[];
  posted_at: string;
}

export default function JobPostingPage() {
  const params = useParams();
  const jobSlug = params.id as string; // Next.js requires [id] for routing consistency
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJob();
  }, [jobSlug]);

  const loadJob = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cms/jobs/${jobSlug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Job posting not found');
        } else {
          setError('Failed to load job posting');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data?.job) {
        setJob(data.job);
      } else {
        setError('Job posting not found');
      }
    } catch (error) {
      console.error('Failed to load job:', error);
      setError('Failed to load job posting');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Job Not Found'}
          </h1>
          <Button asChild>
            <Link href="/careers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Careers
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-xl md:text-2xl font-bold gradient-text">AIDI</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-brand-600">Home</Link>
              <Link href="/methodology" className="text-gray-600 hover:text-brand-600">Methodology</Link>
              <Link href="/blog" className="text-gray-600 hover:text-brand-600">Blog</Link>
              <Link href="/careers" className="text-brand-600 font-medium">Careers</Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/careers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Positions
            </Link>
          </Button>
        </div>
      </div>

      {/* Job Details */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white rounded-xl border p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {job.department}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-6">{job.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {job.location}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {job.employment_type}
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {job.experience_level}
              </span>
              {job.salary_range && (
                <span className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {job.salary_range}
                </span>
              )}
            </div>
          </div>

          {/* Description - Rendered HTML from markdown */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: markdownToHtmlAdvanced(job.description) }}
          />

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nice to Have */}
          {job.nice_to_have && job.nice_to_have.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Nice to Have</h2>
              <ul className="space-y-2">
                {job.nice_to_have.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Posted Date */}
          <div className="pt-6 border-t text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Posted {format(new Date(job.posted_at), 'MMMM d, yyyy')}
            </span>
          </div>

          {/* Apply CTA */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
            <h3 className="text-2xl font-bold mb-2">Interested in this role?</h3>
            <p className="mb-4 opacity-90">
              Send your CV and cover letter to join the AIDI team.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <a href={`mailto:careers@aidi.com?subject=Application: ${job.title}`}>
                Apply for this Position
              </a>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}

