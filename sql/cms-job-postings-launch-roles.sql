-- =============================================================================
-- AIDI Job Postings: Launch Team Roles
-- Date: October 17, 2025
-- Roles: AI Discoverability Analyst, LLM Infrastructure Engineer, Index Strategy Director, Sector Collaborators
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
  '# The Brand Intelligence Detective

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

## Success in This Role Looks Like

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
**Working:** Flexible hours, async-first culture',
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
  '# The AI Search Architect

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

## Technical Challenges You'll Solve

- **Reliability:** Maintaining 99.5%+ uptime for LLM probe systems despite external API volatility
- **Cost Optimization:** Processing 160+ calls per sector while keeping API costs under $50/sector/month
- **Version Management:** Tracking ChatGPT-4.5, Claude 3.7, Gemini 2.0 updates and ensuring consistent baselines
- **Concurrent Processing:** Orchestrating 12 agents across 4 models without race conditions or deadlocks
- **Error Handling:** Gracefully managing API failures, timeouts, and hallucinated responses

## Success in This Role Looks Like

- **Month 3:** 5 sectors running automated monthly probes with <2% failure rate
- **Month 6:** Zero-touch deployment pipeline; probe → analysis → report generation fully automated
- **Month 12:** 15 sectors at scale, API costs optimized 40%, 99.7% uptime
- **Month 18:** Custom enterprise API supporting real-time brand monitoring for top-tier clients

## Why Join AIDI?

**Technical Ownership:** You design the architecture, choose the stack, set the standards  
**Market Timing:** Ground-floor infrastructure for a Bloomberg-aspiring platform  
**Learning:** Constant exposure to cutting-edge LLM capabilities and AI evolution  
**Impact:** Your code generates intelligence that influences £100M+ in brand strategy budgets

**Location:** Remote (UK/Europe timezone preferred)  
**Compensation:** £70k-110k (based on experience) + meaningful equity  
**Stack:** Python, TypeScript, Next.js, Neon DB, Netlify Functions, LLM APIs',
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
  '# The Market Maker

Shape AIDI's evolution from emerging benchmark to industry standard. You'll define new sectors, design competitive frameworks, drive partnerships with industry leaders, and position AIDI as the authoritative voice in AI discoverability—essentially, you're building the Bloomberg Intelligence of AEO.

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
Shape vision, prioritize initiatives, and make calls that determine AIDI's trajectory. This is a founder-level strategic role without needing to found the company.

## Strategic Initiatives You'll Own

**Year 1: Foundation**
- Launch 5 core sectors (fashion, beauty, electronics, wellness, home)
- Establish benchmark credibility through rigorous methodology
- Secure 3-5 tier-1 brand partnerships
- Present at 2-3 industry conferences
- Publish quarterly thought leadership white papers

**Year 2: Scale**
- Expand to 15 sectors
- Launch API product for enterprise real-time monitoring
- Build agency partnership program (50+ agencies using AIDI)
- Establish "AIDI Certification" program for top-performing brands
- Secure analyst coverage (Gartner, Forrester mentions)

**Year 3: Dominance**
- 25+ sectors covered
- AIDI becomes default benchmark cited in industry reports
- Platform partnerships (Shopify, BigCommerce integration)
- Annual AIDI Summit with 500+ attendees
- Considered for acquisition by major data/analytics platform

## Success in This Role Looks Like

- **Month 6:** 3 new sectors launched, methodology featured in 2 major publications
- **Month 12:** AIDI cited in 10+ industry articles/reports, 5 speaking engagements completed
- **Month 18:** 50+ agency partnerships, "AIDI score" becomes standard terminology in AEO discussions
- **Month 24:** Industry analysts including AIDI in market landscape reports

## Ideal Candidate Profile

**Background:**
- 5-7+ years in marketing strategy, product management, or business development
- Ideally in data/analytics/SaaS or market research/benchmarking space
- Experience building or scaling a category-defining product

**Strategic Thinker:**
- Can see 18-24 months ahead
- Understands positioning, competitive dynamics, and market-making
- Comfortable with ambiguity and building from early stage

**Exceptional Communicator:**
- Can present to C-suite executives with authority and credibility
- Strong writer—white papers, thought leadership, compelling narratives
- Media-ready for podcasts, webinars, conference panels

**Relationship Builder:**
- Natural networker who builds authentic industry relationships
- Can engage with CMOs, VPs of Marketing, agency leaders at peer level
- Partnership development experience (brands, agencies, platforms)

**Entrepreneurial:**
- Founder mentality—ownership, initiative, resourcefulness
- Comfortable with early-stage dynamics (ambiguity, rapid iteration)
- Strategic but also willing to execute tactically when needed

## Why Join AIDI?

**Mission:** Redefine how brands win in the AI-native economy  
**Impact:** Your strategic choices shape the benchmark that influences £100M+ in brand investments  
**Growth:** Ground-floor opportunity in a Bloomberg-aspiring platform—leadership trajectory  
**Innovation:** Define a new market category from the inside  
**Equity:** Significant equity stake—you're building the standard, not optimizing an existing one

**Location:** Remote-first (UK-based strongly preferred for timezone/market alignment)  
**Compensation:** £80k-130k (based on experience) + significant equity package  
**Working Style:** Async-first, flexible hours, outcome-focused',
  ARRAY[
    '5-7+ years in marketing strategy, product management, business development, or market research',
    'Strong understanding of brand strategy, digital marketing, and emerging AI/search trends',
    'Exceptional communicator—can present to executives, write thought leadership, build relationships',
    'Entrepreneurial mindset—comfortable with ambiguity, strategic thinking, building from early stage',
    'Track record of positioning products/services or building market categories',
    'Experience with data-driven decision making and analytics',
    'Natural networker with ability to build authentic industry relationships'
  ],
  ARRAY[
    'Experience in data/analytics/SaaS, market research, or benchmarking companies',
    'Prior category creation or market-making experience',
    'Speaking experience (conferences, webinars, podcasts)',
    'Published thought leadership or industry articles',
    'Agency or consulting background (understand client needs)',
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
-- PROGRAM: Sector Collaborator Network (Structured as "position")
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
  'Equity in Visibility + Data Access',
  '# Guest Expert Network

Join AIDI's Sector Collaborator Program—a curated network of 2-3 industry experts per vertical who contribute monthly guest commentary, validate findings, and co-author sections of our benchmark reports.

This builds credibility for AIDI, expands your reach and thought leadership, and creates powerful network effects.

## Who We're Looking For

We're recruiting sector experts across these verticals:

**Fashion & Apparel**
- CMOs or VPs of Marketing from DTC or sustainable fashion brands
- Fashion industry analysts or trend forecasters
- E-commerce consultants specializing in apparel

**Beauty & Personal Care**
- Brand strategists from indie beauty or clean beauty brands
- Cosmetics industry journalists or influencers
- Retail beauty buyers or category managers

**Consumer Electronics**
- Tech reviewers or gadget journalists
- Product managers from leading electronics brands
- Retail tech analysts

**Health & Wellness**
- Wellness brand founders or CMOs
- Supplement industry consultants
- Fitness tech strategists

**Home & Lifestyle**
- Interior design or home goods experts
- Furniture/home decor brand leaders
- Retail merchandising specialists

**Plus:** B2B SaaS, Professional Services, Financial Services, iGaming, Travel & Hospitality, and more

## What Collaborators Get

### Visibility & Thought Leadership
- **Byline credit** in monthly reports distributed to thousands of industry subscribers
- **Co-branded social media** promotion and LinkedIn features
- **Speaking opportunities** at AIDI events and webinars
- **Industry recognition** as a trusted voice in AI discoverability

### Exclusive Data Access
- **Free premium subscription** to your sector report (£119/month value)
- **Early access** to trend data before public release
- **Custom competitive analysis** for your brand or clients
- **Raw data exports** for your own analysis and content creation

### Network Effects
- **Connection to industry leaders** in the collaborator network
- **Quarterly roundtable discussions** with peers across sectors
- **Advisory board consideration** for top contributors
- **Partnership opportunities** with other network members

### Professional Benefits
- Enhance your credibility as an industry expert
- Build your personal brand through association with authoritative benchmark
- Access to proprietary data for your own content/consulting/speaking
- First look at emerging AI trends in your sector

## What You'll Contribute

**Monthly Commentary (1-2 hours/month)**
Review draft findings and provide 300-500 word expert analysis or sector context. Example: "As someone who's led marketing at 3 DTC fashion brands, I can confirm this trend—AI recommendations are shifting 15-20% of discovery traffic away from Google..."

**Trend Validation**
Confirm or challenge data interpretations based on your market knowledge. Help us distinguish signal from noise.

**Case Examples**
Share anonymized real-world examples of brands winning or losing in AI search. Bring the data to life with practitioner stories.

**Guest Q&A**
Participate in occasional webinars or subscriber-only roundtables (2-3 per year). Share your expertise with the AIDI community.

**Referrals**
Connect us with other industry experts, brands for case studies, or media opportunities in your sector.

## Time Commitment

**Typical month:**
- 30 minutes: Review draft report findings
- 45 minutes: Write 300-500 word expert commentary
- 15 minutes: Provide feedback/validation on methodology
- **Total: ~90 minutes per month**

**Quarterly:**
- 60 minutes: Roundtable discussion with other collaborators

**Occasional (2-3x per year):**
- 60 minutes: Guest webinar or podcast interview

## Collaboration Agreement

**Terms:**
- 12-month initial commitment (renewable)
- Monthly contribution expectations clearly defined
- Flexibility to skip months with notice
- Option to transition to full advisory board role

**Compensation:**
- No monetary payment (this is a visibility/data-access exchange)
- Free premium subscription ($1,400/year value)
- Equity in thought leadership and industry recognition
- Data access that supports your own content/consulting work

**Ownership:**
- You retain rights to your contributed commentary
- Can republish your sections with attribution
- AIDI gains rights to use in reports with your byline credit

## Selection Criteria

We're looking for experts who:
- Have genuine sector expertise (practitioners, analysts, journalists, consultants)
- Are active voices in their industry (LinkedIn, conferences, publications)
- Value thought leadership and industry positioning
- See mutual benefit in the data access and visibility exchange
- Will contribute consistently and thoughtfully

**Not a fit if:**
- Looking for paid consulting engagement (this is visibility exchange, not paid work)
- Can't commit to monthly contributions
- Primarily interested in promoting own brand/service (we need objective sector insights)

## How to Apply

**Submit:**
1. LinkedIn profile or personal website
2. 2-3 examples of your industry expertise (articles, talks, analysis)
3. 250-word explanation of why you're interested and what sector expertise you bring
4. Sector(s) you'd like to contribute to

**We'll schedule:**
- 30-minute intro call to discuss collaboration fit
- Review of sample report and commentary expectations
- If mutual fit → Welcome to the network!

## Why Join AIDI as a Collaborator?

**Strategic Positioning:** Align yourself with the emerging benchmark standard  
**Data Access:** Proprietary competitive intelligence for your sector  
**Network:** Connect with other industry leaders and decision-makers  
**Thought Leadership:** Byline credit in authoritative industry reports  
**Influence:** Help shape how your sector gets measured and benchmarked

**This is how industry authorities are built.**

---

*Applications reviewed on rolling basis • First cohort launches November 2025*',
  ARRAY[
    'Demonstrated sector expertise (practitioner, analyst, journalist, consultant, or brand leader)',
    'Active industry voice (LinkedIn posts, articles, conference talks, or similar)',
    'Ability to commit to ~90 minutes monthly contribution',
    '12-month commitment to program',
    'Genuine interest in AI discoverability and brand strategy trends',
    'Strong writer—can provide compelling 300-500 word commentary',
    'Objective mindset—can provide balanced sector insights, not just brand promotion'
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
  status,
  posted_at::date as posted
FROM job_postings
WHERE status = 'open'
ORDER BY posted_at DESC;

-- Count by department
SELECT 
  department,
  COUNT(*) as open_positions
FROM job_postings
WHERE status = 'open'
GROUP BY department;

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
  RAISE NOTICE '🎯 Roles: Analyst, Engineer, Strategy Director, Collaborators';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🌐 View at: /careers';
  RAISE NOTICE '🎊 Jobs board is ready to launch!';
  RAISE NOTICE '';
END $$;

