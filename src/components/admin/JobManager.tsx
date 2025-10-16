'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Briefcase, MapPin, DollarSign } from 'lucide-react';

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
  status: 'open' | 'closed' | 'draft';
  apply_url?: string;
  apply_email?: string;
  posted_at?: Date;
  application_count: number;
}

export function JobManager() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [view, setView] = useState<'list' | 'edit' | 'create'>('list');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/cms/jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job posting?')) return;

    try {
      await fetch(`/api/cms/jobs/${id}`, { method: 'DELETE' });
      await loadJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Board</h1>
            <p className="text-gray-600 mt-1">Manage job postings</p>
          </div>
          <Button onClick={() => {
            setSelectedJob(null);
            setView('create');
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.status === 'open').length}
            </div>
            <div className="text-sm text-gray-600">Open Positions</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">
              {jobs.reduce((acc, j) => acc + j.application_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">
              {[...new Set(jobs.map(j => j.department))].length}
            </div>
            <div className="text-sm text-gray-600">Departments</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    {job.salary_range && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary_range}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{job.description.substring(0, 200)}...</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedJob(job);
                      setView('edit');
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <JobPostingEditor
      job={selectedJob}
      onSave={async (jobData) => {
        try {
          const method = selectedJob ? 'PUT' : 'POST';
          const url = selectedJob
            ? `/api/cms/jobs/${selectedJob.id}`
            : '/api/cms/jobs';

          await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
          });

          await loadJobs();
          setView('list');
        } catch (error) {
          console.error('Failed to save job:', error);
        }
      }}
      onCancel={() => setView('list')}
    />
  );
}

function JobPostingEditor({
  job,
  onSave,
  onCancel
}: {
  job: JobPosting | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    slug: job?.slug || '',
    department: job?.department || '',
    location: job?.location || 'Remote',
    employment_type: job?.employment_type || 'Full-time',
    experience_level: job?.experience_level || 'Mid',
    salary_range: job?.salary_range || '',
    description: job?.description || '',
    requirements: job?.requirements?.join('\n') || '',
    nice_to_have: job?.nice_to_have?.join('\n') || '',
    apply_url: job?.apply_url || '',
    apply_email: job?.apply_email || '',
    status: job?.status || 'draft'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {job ? 'Edit Job' : 'Create New Job'}
        </h1>
        <Button variant="outline" onClick={onCancel}>
          ← Back
        </Button>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Title & Department */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Job Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({
                ...formData,
                title: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              })}
              placeholder="Senior Data Scientist"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Department *</Label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Engineering, Sales, etc."
              className="mt-2"
            />
          </div>
        </div>

        {/* Location & Type */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Employment Type</Label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
              className="w-full mt-2 h-10 px-3 rounded-md border"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
          <div>
            <Label>Experience Level</Label>
            <select
              value={formData.experience_level}
              onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
              className="w-full mt-2 h-10 px-3 rounded-md border"
            >
              <option>Entry</option>
              <option>Mid</option>
              <option>Senior</option>
              <option>Lead</option>
              <option>Executive</option>
            </select>
          </div>
        </div>

        {/* Salary */}
        <div>
          <Label>Salary Range</Label>
          <Input
            value={formData.salary_range}
            onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
            placeholder="$80k-120k or Competitive"
            className="mt-2"
          />
        </div>

        {/* Description */}
        <div>
          <Label>Job Description *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={10}
            className="mt-2"
          />
        </div>

        {/* Requirements */}
        <div>
          <Label>Requirements (one per line)</Label>
          <Textarea
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            rows={6}
            className="mt-2 font-mono text-sm"
            placeholder="5+ years Python experience&#10;Strong ML background&#10;Published research preferred"
          />
        </div>

        {/* Nice to Have */}
        <div>
          <Label>Nice to Have (one per line)</Label>
          <Textarea
            value={formData.nice_to_have}
            onChange={(e) => setFormData({ ...formData, nice_to_have: e.target.value })}
            rows={4}
            className="mt-2 font-mono text-sm"
          />
        </div>

        {/* Application Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Apply URL</Label>
            <Input
              value={formData.apply_url}
              onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
              placeholder="https://jobs.aidi.com/apply"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Apply Email</Label>
            <Input
              value={formData.apply_email}
              onChange={(e) => setFormData({ ...formData, apply_email: e.target.value })}
              placeholder="jobs@aidi.com"
              className="mt-2"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={() => onSave({
              ...formData,
              requirements: formData.requirements.split('\n').filter(Boolean),
              nice_to_have: formData.nice_to_have.split('\n').filter(Boolean),
              status: 'open',
              posted_at: new Date()
            })}
          >
            Publish Job
          </Button>
          <Button
            variant="outline"
            onClick={() => onSave({
              ...formData,
              requirements: formData.requirements.split('\n').filter(Boolean),
              nice_to_have: formData.nice_to_have.split('\n').filter(Boolean),
              status: 'draft'
            })}
          >
            Save as Draft
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  const config = {
    open: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${config[status as keyof typeof config]}`}>
      {status}
    </span>
  );
}

