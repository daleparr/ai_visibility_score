-- =============================================================================
-- AIDI Job Postings: Launch Team Roles (FIXED - Dollar-Quoted Strings)
-- Date: October 17, 2025
-- Fixed: Uses $$ syntax to avoid quote escaping issues
-- =============================================================================

-- Ensure job categories exist
INSERT INTO job_categories (slug, name)
VALUES 
  ('data-science', 'Data Science & Analytics'),
  ('engineering', 'Engineering'),
  ('strategy', 'Strategy & Business Development'),
  ('partnerships', 'Partnerships & Network')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- JOB 1: AI Discoverability Analyst
-- =============================================================================

INSERT INTO job_postings (
  slug,
  title,
  department,
  location,
  employment_type,
  experience_level,
  salary_range,
  description,
  requirements,
  nice_to_have,
  category_id,
  status,
  posted_at
)
VALUES (
  'ai-discoverability-analyst',
  'AI Discoverability Analyst',
  'Data Science & Analytics',
  'Remote (UK-based preferred)',
  'Full-time',
  'Mid to Senior',
  'Competitive + Equity',
  $$# The Brand Intelligence Detective

You'll be at the forefront of a new discipline—systematically measuring and analyzing how brands appear (or disappear) in AI-powered search and recommendations. This role combines data science rigor with marketing insight to deliver monthly sector intelligence that shapes billion-dollar brand strategies.

## What You'll Do

**Design & Execute Probe Runs**
Manage systematic testing of 20-prompt frameworks across 4+ LLMs for 5-10 retail sectors monthly. You'll own the end-to-end testing process—from prompt design to result validation.

**Statistical Analysis**
Calculate confidence intervals, perform significance testing, and validate brand mention trends. Every metric you report needs to be defensible to boards and CFOs.

**Sector Intelligence**
Write compelling monthly reports translating raw data into actionable insights for CMOs and brand leaders. Your analysis becomes the benchmark cited in boardrooms and industry publications.

**Quality Assurance**
Validate LLM responses for hallucinations, bias, and accuracy. Maintain audit-grade standards that executives can defend.

**Methodology Evolution**
Continuously refine prompt design, testing protocols, and measurement frameworks based on market shifts and LLM evolution.

## What Makes This Exciting

**First-Mover Role**
You're defining an entirely new job category—AI discoverability analyst didn't exist 12 months ago. You'll set the standards for what this discipline becomes.

**Industry Impact**
Your reports become the benchmark cited in boardrooms, conferences, and industry publications. You're creating the intelligence layer for an emerging market.

**Cross-Functional Exposure**
Work with data science, marketing strategy, and product teams. Present findings to C-suite executives and industry leaders.

**Continuous Learning**
Stay at the cutting edge of LLM evolution, AEO techniques, and conversational commerce trends. The landscape changes monthly—you never get bored.

## Success Metrics

- **Month 3:** Publishing monthly reports for 3 sectors with statistical rigor
- **Month 6:** Methodology refinements improving test-retest reliability from r=0.94 to r=0.96+
- **Month 12:** Your sector reports cited by major industry publications and analyst firms
- **Month 18:** Speaking at conferences about AI discoverability measurement

## Why Join AIDI?

**Mission:** Redefine how brands win in the AI-native economy  
**Impact:** Your work shapes billion-dollar marketing strategies  
**Growth:** Ground-floor opportunity—early team equity and leadership trajectory  
**Innovation:** Intersection of AI, brand strategy, and data science

**Location:** Remote-first (UK-based preferred)  
**Compensation:** Competitive salary + equity  
**Working:** Flexible hours, async-first culture$$,
  ARRAY[
    'Background in data analysis, marketing analytics, or research methodology',
    'Comfortable with Python or R for statistical analysis and automation',
    'Strong writer—can translate complex data into compelling narratives for executives',
    'Curious about AI, search behavior, and brand strategy',
    'Experience with statistical testing (confidence intervals, p-values, significance testing)',
    'Comfortable managing multiple projects simultaneously (5-10 sectors monthly)',
    'Detail-oriented with commitment to audit-grade quality standards'
  ],
  ARRAY[
    'Experience with LLM APIs (OpenAI, Anthropic, Google AI)',
    'Background in market research or competitive intelligence',
    'Published research or data journalism experience',
    'Understanding of brand strategy and marketing frameworks',
    'SQL or database querying experience',
    'Experience presenting data insights to executives or boards',
    'Knowledge of SEO/SEM/digital marketing analytics'
  ],
  (SELECT id FROM job_categories WHERE slug = 'data-science'),
  'open',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  nice_to_have = EXCLUDED.nice_to_have,
  updated_at = NOW();

-- =============================================================================
-- JOB 2: LLM Infrastructure Engineer
-- =============================================================================

INSERT INTO job_postings (
  slug,
  title,
  department,
  location,
  employment_type,
  experience_level,
  salary_range,
  description,
  requirements,
  nice_to_have,
  category_id,
  status,
  posted_at
)
VALUES (
  'llm-infrastructure-engineer',
  'LLM Infrastructure Engineer',
  'Engineering',
  'Remote (UK/Europe)',
  'Full-time',
  'Senior',
  '£70k-110k + Equity',
  $$# The AI Search Architect

Build and maintain the technical backbone that powers the world's first AI Discoverability Index. You'll design scalable, reliable systems for probing, analyzing, and benchmarking brand visibility across evolving LLM platforms—creating the infrastructure for Bloomberg-grade intelligence.

## What You'll Do

**Multi-Agent Orchestration**
Design and optimize 12-agent probe systems across ChatGPT, Claude, Gemini, Perplexity, and emerging platforms. Handle concurrent execution, dependency management, and result aggregation.

**API Management**
Maintain version-locked connections to LLM providers. Manage rate limits, cost optimization, and reliability across 160+ API calls per sector per month.

**Data Pipeline Architecture**
Build ETL workflows for processing probe results into structured, analyzable datasets. Ensure data quality, consistency, and audit-grade traceability.

**Automation & Scaling**
Automate monthly probe runs, error handling, retry logic, and alert systems for production-grade reliability. Scale from 5 sectors to 25+ sectors over 18 months.

**Model Version Control**
Track LLM updates, test for consistency impacts, and maintain historical comparability across model versions. Ensure methodology integrity as platforms evolve.

**Integration Development**
Build secure data connectors for Netlify, Neon DB, analytics platforms, and client reporting dashboards. API design for enterprise customers.

## What Makes This Exciting

**Cutting-Edge Tech Stack**
Work with the latest LLM APIs, multi-agent frameworks, and real-time data processing systems. You're building on platforms that didn't exist 2 years ago.

**Strategic Impact**
Your infrastructure decisions directly influence the accuracy and credibility of industry-standard benchmarks. When boards cite AIDI data, they're trusting your systems.

**Ownership & Autonomy**
Lead technical architecture choices. Build greenfield systems from the ground up. You're not maintaining legacy systems—you're defining the architecture.

**Innovation Opportunity**
Experiment with emerging AI models, context engineering techniques, and prompt optimization strategies. Your playground is the frontier of AI.

## Success Metrics

- **Month 3:** 5 sectors running automated monthly probes with <2% failure rate
- **Month 6:** Zero-touch deployment pipeline; probe → analysis → report generation fully automated
- **Month 12:** 15 sectors at scale, API costs optimized 40%, 99.7% uptime
- **Month 18:** Custom enterprise API supporting real-time brand monitoring for top-tier clients

## Why Join AIDI?

**Technical Ownership:** You design the architecture, choose the stack, set the standards  
**Market Timing:** Ground-floor infrastructure for a Bloomberg-aspiring platform  
**Learning:** Constant exposure to cutting-edge LLM capabilities  
**Impact:** Your code generates intelligence influencing £100M+ in brand strategy budgets

**Location:** Remote (UK/Europe timezone preferred)  
**Compensation:** £70k-110k + meaningful equity  
**Stack:** Python, TypeScript, Next.js, Neon DB, Netlify Functions, LLM APIs$$,
  ARRAY[
    'Strong Python development experience (3+ years)',
    'Experience with async processing, API integration, and data pipelines',
    'Familiarity with LLM APIs (OpenAI, Anthropic, Google AI) and prompt engineering',
    'Understanding of distributed systems, concurrency, and error handling',
    'Cloud infrastructure experience (AWS, Azure, GCP, or similar)',
    'Version control fluency (Git) and CI/CD mindset',
    'Database experience (PostgreSQL, SQL optimization)',
    'Comfortable with production systems, monitoring, and observability'
  ],
  ARRAY[
    'Experience building multi-agent AI systems',
    'Background in data engineering or MLOps',
    'TypeScript/Next.js experience',
    'Familiarity with Netlify, Vercel, or similar edge platforms',
    'Experience with cost optimization at scale',
    'Understanding of statistical methods and data quality validation',
    'Open source contributions or side projects in AI/ML space',
    'Interest in brand strategy, marketing, or e-commerce'
  ],
  (SELECT id FROM job_categories WHERE slug = 'engineering'),
  'open',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  nice_to_have = EXCLUDED.nice_to_have,
  updated_at = NOW();

-- =============================================================================
-- JOB 3: Index Strategy Director
-- =============================================================================

INSERT INTO job_postings (
  slug,
  title,
  department,
  location,
  employment_type,
  experience_level,
  salary_range,
  description,
  requirements,
  nice_to_have,
  category_id,
  status,
  posted_at
)
VALUES (
  'index-strategy-director',
  'Index Strategy Director',
  'Strategy & Business Development',
  'Remote (UK-based preferred)',
  'Full-time',
  'Senior / Lead',
  '£80k-130k + Significant Equity',
  $$# The Market Maker

Shape AIDI's evolution from emerging benchmark to industry standard. You'll define new sectors, design competitive frameworks, drive partnerships with industry leaders, and position AIDI as the authoritative voice in AI discoverability.

## What You'll Do

**Sector Expansion**
Identify and launch new industry verticals—from fashion and beauty to finance, healthcare, B2B SaaS, professional services. Determine which markets get measured next and how.

**Benchmark Design**
Create competitive frameworks, leaderboard methodologies, and scoring systems that become industry-adopted standards. Define what "good AI visibility" means for each sector.

**Thought Leadership**
Author white papers, present at conferences, secure speaking engagements, and establish AIDI as the category authority. You're the public face of the index.

**Partnership Development**
Build relationships with brands, agencies, and platforms (Shopify, Google, OpenAI) to drive adoption and data partnerships. Turn AIDI into the benchmark everyone references.

**Product Roadmap**
Define AIDI's feature evolution—from monthly reports to real-time dashboards, API access, and custom intelligence services. You own the vision.

**Market Positioning**
Craft messaging, competitive differentiation, and go-to-market strategies that establish AIDI's Bloomberg-level credibility in the market.

## What Makes This Exciting

**Category Creation**
You're not just growing a product—you're defining a new market category and establishing its standards. This is S&P 500 Index-level opportunity.

**Executive Engagement**
Regular interaction with CMOs, VPs of Marketing, and C-suite leaders at leading brands. Your insights shape their multi-million dollar strategies.

**Visibility & Influence**
Your work gets cited in industry publications, conference keynotes, and boardroom strategy sessions. You become a recognized authority.

**Strategic Freedom**
Shape vision, prioritize initiatives, and make calls that determine AIDI's trajectory. This is a founder-level strategic role.

## Success Metrics

**Year 1:** Launch 5 core sectors, secure 3-5 tier-1 partnerships, speak at 2-3 conferences  
**Year 2:** Expand to 15 sectors, build agency program (50+ agencies), establish AIDI Certification  
**Year 3:** 25+ sectors, AIDI becomes default benchmark, annual summit with 500+ attendees

## Why Join AIDI?

**Mission:** Redefine how brands win in the AI-native economy  
**Impact:** Strategic choices shape the benchmark influencing £100M+ in brand investments  
**Growth:** Ground-floor opportunity—leadership trajectory  
**Equity:** Significant stake—you're building the standard

**Location:** Remote-first (UK-based preferred)  
**Compensation:** £80k-130k + significant equity  
**Working:** Async-first, flexible, outcome-focused$$,
  ARRAY[
    '5-7+ years in marketing strategy, product management, business development, or market research',
    'Strong understanding of brand strategy, digital marketing, and AI/search trends',
    'Exceptional communicator—can present to executives, write thought leadership, build relationships',
    'Entrepreneurial mindset—comfortable with ambiguity, strategic thinking, early stage building',
    'Track record of positioning products/services or building market categories',
    'Experience with data-driven decision making and analytics',
    'Natural networker with ability to build authentic industry relationships'
  ],
  ARRAY[
    'Experience in data/analytics/SaaS, market research, or benchmarking companies',
    'Prior category creation or market-making experience',
    'Speaking experience (conferences, webinars, podcasts)',
    'Published thought leadership or industry articles',
    'Agency or consulting background',
    'Prior startup or early-stage company experience',
    'Understanding of LLMs, AI, or search technology',
    'Existing network in marketing, brand strategy, or agency worlds'
  ],
  (SELECT id FROM job_categories WHERE slug = 'strategy'),
  'open',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  nice_to_have = EXCLUDED.nice_to_have,
  updated_at = NOW();

-- =============================================================================
-- PROGRAM: Sector Collaborator Network
-- =============================================================================

INSERT INTO job_postings (
  slug,
  title,
  department,
  location,
  employment_type,
  experience_level,
  salary_range,
  description,
  requirements,
  nice_to_have,
  category_id,
  status,
  posted_at
)
VALUES (
  'sector-collaborator-guest-expert',
  'Sector Collaborator (Guest Expert Network)',
  'Partnerships & Network',
  'Remote (Global)',
  'Part-time / Contributor',
  'Mid to Senior',
  'Visibility + Data Access (No Cash)',
  $$# Guest Expert Network

Join AIDI's Sector Collaborator Program—a curated network of 2-3 industry experts per vertical who contribute monthly guest commentary, validate findings, and co-author sections of our benchmark reports.

## Who We're Looking For

**Fashion & Apparel:** CMOs, trend forecasters, e-commerce consultants  
**Beauty & Personal Care:** Brand strategists, industry journalists, retail buyers  
**Consumer Electronics:** Tech reviewers, product managers, retail analysts  
**Health & Wellness:** Wellness brand founders, consultants, fitness tech strategists  
**Home & Lifestyle:** Interior design experts, home goods brand leaders

## What Collaborators Get

**Visibility & Thought Leadership**
- Byline credit in monthly reports distributed to thousands of subscribers
- Co-branded social media promotion
- Speaking opportunities at AIDI events

**Exclusive Data Access**
- Free premium subscription to your sector report (£119/month value)
- Early access to trend data before public release
- Custom competitive analysis for your brand or clients

**Network Effects**
- Connection to industry leaders in the collaborator network
- Quarterly roundtable discussions with peers
- Advisory board consideration for top contributors

## What You'll Contribute

**Monthly Commentary (1-2 hours/month)**
Review draft findings and provide 300-500 word expert analysis or sector context.

**Trend Validation**
Confirm or challenge data interpretations based on your market knowledge.

**Case Examples**
Share anonymized real-world examples of brands winning or losing in AI search.

**Guest Q&A**
Participate in occasional webinars or subscriber-only roundtables (2-3 per year).

## Time Commitment

**Monthly:** ~90 minutes (review + commentary)  
**Quarterly:** 60 minutes (roundtable discussion)  
**Occasional:** 60 minutes (webinar/podcast - 2-3x per year)

## Why Join?

**Strategic Positioning:** Align with the emerging benchmark standard  
**Data Access:** Proprietary competitive intelligence for your sector  
**Network:** Connect with industry leaders and decision-makers  
**Thought Leadership:** Byline credit in authoritative reports  
**Influence:** Help shape how your sector gets measured

This is how industry authorities are built.$$,
  ARRAY[
    'Demonstrated sector expertise (practitioner, analyst, journalist, consultant, or brand leader)',
    'Active industry voice (LinkedIn posts, articles, conference talks)',
    'Ability to commit to ~90 minutes monthly contribution',
    '12-month commitment to program',
    'Genuine interest in AI discoverability and brand strategy trends',
    'Strong writer—can provide compelling 300-500 word commentary',
    'Objective mindset—balanced sector insights, not just brand promotion'
  ],
  ARRAY[
    'Existing audience or platform (newsletter, blog, podcast)',
    'Prior analyst or research experience',
    'Understanding of statistical analysis or data interpretation',
    'Conference speaking experience',
    'Consulting practice where AIDI data would support client work',
    'Media relationships in your sector',
    'Experience as brand-side CMO/VP Marketing'
  ],
  (SELECT id FROM job_categories WHERE slug = 'partnerships'),
  'open',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  nice_to_have = EXCLUDED.nice_to_have,
  updated_at = NOW();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- List all job postings
SELECT 
  title,
  department,
  location,
  employment_type,
  salary_range,
  status
FROM job_postings
WHERE status = 'open'
ORDER BY posted_at DESC;

-- Count by department
SELECT 
  department,
  COUNT(*) as open_positions
FROM job_postings
WHERE status = 'open'
GROUP BY department
ORDER BY open_positions DESC;

-- Success message
DO $$
DECLARE
  job_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO job_count 
  FROM job_postings 
  WHERE status = 'open';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Job Postings Created Successfully!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '💼 Open positions: %', job_count;
  RAISE NOTICE '📊 Analyst • 🔧 Engineer • 🎯 Strategy Director • 🤝 Collaborators';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🌐 View at: /careers';
  RAISE NOTICE '🎊 Jobs board is ready to launch!';
  RAISE NOTICE '';
END $$;

