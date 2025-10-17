-- Seed AIDI Careers Page with Job Postings
-- Roles aligned with benchmark-standard positioning
-- Date: October 16, 2025

-- Ensure job categories exist
INSERT INTO job_categories (slug, name) VALUES
('data-science', 'Data Science & Research'),
('engineering', 'Engineering'),
('business', 'Business Development & Sales'),
('operations', 'Operations & Strategy')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- =============================================================================
-- JOB POSTINGS - Data Scientist Roles
-- =============================================================================

-- 1. Senior Data Scientist - AEO Research
INSERT INTO job_postings (
  slug, title, department, location, employment_type, experience_level,
  salary_range, description, requirements, nice_to_have, category_id,
  status, apply_email, posted_at
) VALUES (
  'senior-data-scientist-aeo-research',
  'Senior Data Scientist - AEO Research',
  'Data Science & Research',
  'Remote (US/UK)',
  'Full-time',
  'Senior',
  '$140,000-$180,000 + equity',
  E'## About AIDI

The AI Discoverability Index (AIDI) provides the benchmark standard for measuring brand visibility in AI-powered answer engines. We''re building the Bloomberg Terminal for AEO intelligence.

## The Role

We''re seeking a Senior Data Scientist to lead our statistical validation framework and peer-review methodology. You''ll design experiments, validate benchmarks, and ensure our metrics meet institutional-grade rigor.

## What You''ll Do

- Design and validate statistical protocols for AI visibility benchmarking
- Build industry percentile ranking systems with confidence intervals
- Conduct peer-review of methodology and publish research papers
- Develop multi-run averaging algorithms and reproducibility testing
- Collaborate with Fortune 500 executives on custom analyses
- Present findings at industry conferences

## The Impact

Your work will be cited in board presentations, M&A due diligence reports, and strategic investment decisions affecting $500M+ budgets.

## Why AIDI

- Work with real AI models (GPT-4, Claude, Gemini)
- Publish peer-reviewed research
- Influence enterprise strategy
- Build the industry standard',
  ARRAY[
    '5+ years in data science with focus on statistical validation',
    'PhD in Statistics, Computer Science, or related field (or equivalent experience)',
    'Expert in confidence intervals, p-values, effect sizes, and experimental design',
    'Published research or peer-reviewed papers strongly preferred',
    'Experience with LLMs and AI model evaluation',
    'Python/R proficiency for statistical analysis',
    'Clear communication skills (present to executives)'
  ],
  ARRAY[
    'Experience at Bloomberg, McKinsey, or similar institutional data firms',
    'Academic background in experimental psychology or econometrics',
    'Previous work in SEO/marketing analytics',
    'Knowledge of Bayesian statistics and causal inference',
    'Speaking experience at industry conferences'
  ],
  (SELECT id FROM job_categories WHERE slug = 'data-science'),
  'open',
  'careers@aidi.com',
  NOW()
);

-- 2. Research Engineer - Methodology Infrastructure
INSERT INTO job_postings (
  slug, title, department, location, employment_type, experience_level,
  salary_range, description, requirements, nice_to_have, category_id,
  status, apply_email, posted_at
) VALUES (
  'research-engineer-methodology',
  'Research Engineer - Methodology Infrastructure',
  'Engineering',
  'Remote (Global)',
  'Full-time',
  'Mid-Senior',
  '$120,000-$160,000 + equity',
  E'## About the Role

Build the technical infrastructure for AIDI''s peer-reviewed benchmarking framework. You''ll create systems for multi-model testing, statistical validation, and reproducibility at scale.

## Responsibilities

- Build automated testing framework across 4+ AI models
- Implement statistical validation pipeline (CI calculation, p-values)
- Create reproducibility testing infrastructure
- Develop API for enterprise BI tool integration
- Optimize for 1000+ brand evaluations per month
- Ensure audit-grade data quality and traceability

## Tech Stack

- Python, TypeScript/Node.js
- PostgreSQL (Neon), Redis
- OpenAI, Anthropic, Google AI APIs
- Next.js, React for internal tools
- Statistical libraries (SciPy, NumPy, Pandas)

## Impact

Your code will power strategic decisions for Fortune 500 companies, M&A deals, and board presentations.',
  ARRAY[
    '3+ years software engineering with focus on data pipelines',
    'Strong Python and TypeScript skills',
    'Experience with PostgreSQL and large-scale data processing',
    'API integration experience (OpenAI, Anthropic, etc.)',
    'Understanding of statistical concepts (confidence intervals, significance testing)',
    'Test-driven development and code quality focus'
  ],
  ARRAY[
    'Experience building research infrastructure or ML platforms',
    'Background in academic research or institutional data',
    'DevOps experience (CI/CD, monitoring)',
    'Previous work with LLM APIs at scale'
  ],
  (SELECT id FROM job_categories WHERE slug = 'engineering'),
  'open',
  'careers@aidi.com',
  NOW()
);

-- 3. Enterprise Account Executive
INSERT INTO job_postings (
  slug, title, department, location, employment_type, experience_level,
  salary_range, description, requirements, nice_to_have, category_id,
  status, apply_email, posted_at
) VALUES (
  'enterprise-account-executive',
  'Enterprise Account Executive - Strategic Sales',
  'Business Development',
  'Remote (US preferred)',
  'Full-time',
  'Senior',
  '$100,000-$140,000 base + $100K+ commission',
  E'## About AIDI

We''re not selling dashboards. We''re selling audit-grade intelligence for strategic decisions affecting $500K-$50M budgets.

## The Role

Sell AIDI''s benchmark intelligence to C-suite executives, data science leaders, and private equity firms. You''ll position AIDI as complementary to monitoring tools, not competitive.

## What You''ll Sell

- $2,500 Full Audits (board presentation support)
- $5,000 Protected Site Audits (M&A due diligence)
- $10,000+ Enterprise Packages (multi-competitor analysis)

**Average deal size:** $5,000+  
**Sales cycle:** 2-4 weeks  
**Target buyers:** CMOs, CDOs, PE principals

## Ideal Background

- **NOT:** SaaS subscription sales
- **YES:** Consulting, research, or institutional data sales
- Think: Bloomberg, McKinsey, Gartner, Forrester

## Why Different

You''re selling strategic intelligence, not software. Your buyers are executives making multi-million dollar decisions, not practitioners optimizing content.

## Compensation

- Base: $100K-$140K
- Commission: Uncapped (realistic $100K-$200K first year)
- Equity: Early-stage options
- Benefits: Health, dental, 401k

## The Pitch

"We complement monitoring tools like Searchable with quarterly strategic validation. When you''re presenting to the board or evaluating an M&A target, you need benchmark-grade rigor."',
  ARRAY[
    '5+ years selling to C-suite/executive buyers',
    'Experience selling high-ticket ($2,500+) products or services',
    'Consultative sales approach (not transactional)',
    'Comfortable discussing statistical validation and methodology',
    'Track record of $500K+ annual quota achievement',
    'Excellent presentation and communication skills'
  ],
  ARRAY[
    'Background at Bloomberg, Gartner, McKinsey, or similar',
    'Experience selling research, data, or consulting services',
    'Understanding of private equity or M&A processes',
    'Existing relationships with Fortune 500 CMOs/CDOs',
    'Previous work in martech or data analytics space'
  ],
  (SELECT id FROM job_categories WHERE slug = 'business'),
  'open',
  'careers@aidi.com',
  NOW()
);

-- 4. Head of Methodology (Leadership Role)
INSERT INTO job_postings (
  slug, title, department, location, employment_type, experience_level,
  salary_range, description, requirements, nice_to_have, category_id,
  status, apply_email, posted_at
) VALUES (
  'head-of-methodology',
  'Head of Methodology - Build the Benchmark Standard',
  'Data Science & Research',
  'Remote (US/UK preferred)',
  'Full-time',
  'Lead/Director',
  '$180,000-$240,000 + significant equity',
  E'## The Opportunity

Lead AIDI''s transformation into the Bloomberg Terminal of AEO intelligence. You''ll build the peer-reviewed methodology that becomes the industry standard.

## What You''ll Own

- **Methodology Development:** Design statistical protocols with academic rigor
- **Peer Review:** Coordinate external validation and academic partnerships
- **Industry Benchmarks:** Build percentile ranking systems across 15+ industries
- **Thought Leadership:** Present at conferences, publish research, build authority
- **Team Building:** Hire and lead data science team (2-5 people in Year 1)

## The Vision

Just as Bloomberg didn''t compete on price but on rigor, AIDI doesn''t compete with monitoring tools. We''re building the benchmark standard for strategic AEO measurement.

Your role: Make "according to AIDI data..." the standard citation in industry publications.

## Ideal Candidate

**Background:** Bloomberg, Nielsen, Gartner research divisions, or academic research leadership

**You''ve:**
- Built research methodologies used by Fortune 500
- Published peer-reviewed papers or industry reports
- Presented findings to C-suite audiences
- Managed teams of data scientists or researchers

## Why This Matters

Your methodology will influence:
- Board presentations ($500K+ budget decisions)
- M&A valuations ($10M+ deals)
- Strategic investments (Fortune 500 companies)

## Compensation

- Base: $180K-$240K
- Equity: Significant early-stage grant (0.5-1.5%)
- Benefits: Comprehensive
- Conference budget: Generous (we want you speaking)

## The Challenge

Build institutional credibility from scratch. Establish peer-reviewed standards. Become the go-to expert cited by tier-1 publications within 12 months.',
  ARRAY[
    '10+ years in data science, research, or statistical analysis',
    'PhD in Statistics, Economics, Computer Science, or related field',
    'Published research (peer-reviewed journals or industry reports)',
    'Experience building methodologies for institutional buyers',
    'Strong leadership and team-building skills',
    'Excellent communication (technical to executive audiences)',
    'Track record of establishing industry standards or frameworks'
  ],
  ARRAY[
    'Previous role at Bloomberg, Nielsen, Gartner, McKinsey, or similar',
    'Academic research background with industry transition',
    'Experience in experimental design and causal inference',
    'Conference speaking and thought leadership',
    'Understanding of SEO/marketing analytics',
    'Existing industry relationships (CMOs, data leaders)'
  ],
  (SELECT id FROM job_categories WHERE slug = 'data-science'),
  'open',
  'careers@aidi.com',
  NOW()
);

END $$;

-- Verify job postings created
SELECT 
  title,
  department,
  location,
  salary_range,
  status
FROM job_postings
ORDER BY posted_at DESC;

-- Success message
SELECT '✅ Career positions seeded!' as status,
       COUNT(*) as positions_created
FROM job_postings;

