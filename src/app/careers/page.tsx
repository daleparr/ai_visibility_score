'use client';

import { FigmaCareersPage } from '@/components/FigmaCareersPage';

export default function CareersPage() {
  // Use Figma design (will integrate CMS job postings later)
  return <FigmaCareersPage />;
  
  /* CMS Integration will be added later
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      // Fetch job postings from job_postings table
      const response = await fetch('/api/cms/jobs?status=open');
      const data = await response.json();
      
      if (data?.jobs) {
        const positions = data.jobs;
        setJobs(positions);
        
        // Extract unique departments
        const depts = [...new Set(positions.map((j: JobPosting) => j.department))];
        setDepartments(depts as string[]);
      }
    } catch (error) {
      console.error('Failed to load jobs from CMS:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = selectedDept === 'all'
    ? jobs
    : jobs.filter(j => j.department === selectedDept);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-xl md:text-2xl font-bold gradient-text">AIDI</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-brand-600 transition-colors">
                Home
              </Link>
              <Link href="/methodology" className="text-gray-600 hover:text-brand-600 transition-colors">
                Methodology
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-brand-600 transition-colors">
                Blog
              </Link>
              <Link href="/careers" className="text-brand-600 font-medium">
                Careers
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Join Us: Building the Future of AI Brand Intelligence.
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 max-w-3xl">
            We've Built AIDI—The World's First AI Discoverability Index.
            <br></br>
            AIDI is on a mission to become the Bloomberg of AI visibility—delivering audit-grade intelligence on how brands appear (or disappear) in conversational AI platforms. We're defining a new category and establishing the benchmark standard for an industry worth billions.
            <br></br>
            Help us maintain the benchmark standard for AEO intelligence.
            Work with data scientists, executives, and industry leaders.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <div>
              <div className="text-2xl md:text-3xl font-bold">{jobs.length}</div>
              <div className="text-blue-200">Open Positions</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold">{departments.length}</div>
              <div className="text-blue-200">Departments</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold">Remote OK</div>
              <div className="text-blue-200">Work From Anywhere</div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Filter */}
      {departments.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedDept('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedDept === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Departments ({jobs.length})
              </button>
              {departments.map((dept) => {
                const count = jobs.filter(j => j.department === dept).length;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      selectedDept === dept
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dept} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Link key={job.id} href={`/careers/${job.slug}`}>
              <div className="bg-white rounded-xl border hover:shadow-lg hover:border-blue-300 transition-all p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.employment_type}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary_range}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <Button variant="outline">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {selectedDept === 'all'
                ? 'No open positions at the moment. Check back soon!'
                : `No open positions in ${selectedDept} right now.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
