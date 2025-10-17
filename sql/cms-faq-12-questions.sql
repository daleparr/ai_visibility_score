-- =============================================================================
-- FAQ Page - 12 Questions in Card Grid Format (3x4)
-- Replaces accordion format with card grid matching blog layout
-- =============================================================================

-- Update FAQ page content block with 12 questions
INSERT INTO content_blocks (page_id, block_key, block_type, content, display_order, is_visible)
SELECT 
  p.id,
  'faq_items',
  'json',
  $${
    "questions": [
      {
        "id": 1,
        "question": "What is AIDI and how is it different from SEO tools?",
        "answer": "<p>AIDI (AI Discoverability Index) measures how brands appear in AI-powered answer engines like ChatGPT, Claude, and Perplexity. Unlike SEO tools that track Google rankings, AIDI measures <strong>conversational visibility</strong>—whether AI assistants recommend your brand when users ask for recommendations.</p><p>SEO optimizes for search results you can click. AIDI optimizes for answers AI systems give directly.</p>"
      },
      {
        "id": 2,
        "question": "How does AIDI's methodology differ from monitoring tools like Searchable?",
        "answer": "<p>AIDI and monitoring tools serve <strong>different purposes</strong>:</p><p><strong>Monitoring tools</strong> (Searchable, BrightEdge AEO): Daily optimization, practitioner-focused, subscription pricing.</p><p><strong>AIDI</strong>: Quarterly strategic benchmarking, executive-focused, audit-grade rigor with 95% confidence intervals and peer-reviewed methodology.</p><p>Use both: Monitor daily with tools like Searchable, validate strategically with AIDI quarterly.</p>"
      },
      {
        "id": 3,
        "question": "Why do I need statistical confidence intervals for AI visibility?",
        "answer": "<p>LLMs are <strong>stochastic</strong>—the same prompt yields different results. A single test might show you're mentioned 80% of the time, but that could be noise.</p><p>AIDI runs 5 tests per prompt (100 total per brand) and reports: \"68% mention rate (95% CI: 64-72%)\"—meaning we're 95% confident your true rate is between 64-72%.</p><p>This enables defensible board presentations and investment decisions.</p>"
      },
      {
        "id": 4,
        "question": "Can I use AIDI for M&A due diligence?",
        "answer": "<p><strong>Yes—that's a primary use case.</strong></p><p>PE firms and corporate development teams use AIDI to:</p><ul><li>Assess target company's AI visibility position</li><li>Quantify competitive gaps</li><li>Model post-acquisition value creation</li><li>Identify AI visibility as valuation risk/opportunity</li></ul><p>Our methodology is reproducible and peer-reviewable, which auditors require.</p>"
      },
      {
        "id": 5,
        "question": "How often should I run an AIDI evaluation?",
        "answer": "<p><strong>Quarterly</strong> for most brands—that's when strategic measurement matters.</p><p><strong>Monthly</strong> if you're actively optimizing AEO or in competitive markets.</p><p><strong>One-time</strong> for M&A due diligence or initial baseline.</p><p>Between evaluations, use monitoring tools for daily feedback. Think of AIDI as your quarterly \"bloodwork\" and monitoring tools as your daily \"Fitbit.\"</p>"
      },
      {
        "id": 6,
        "question": "What's the difference between the £499 Quick Scan and £2,500 Full Audit?",
        "answer": "<p><strong>Quick Scan (£499):</strong> 4-dimension baseline assessment in 48 hours. Identifies top 3 gaps. Good for \"should we invest in AEO?\" questions.</p><p><strong>Full Audit (£2,500):</strong> Complete 12-dimension evaluation in 2 weeks. Industry percentile ranking, competitive benchmarking vs top 5 competitors, 30-page report, 90-day action roadmap. Board-ready deliverable.</p><p>Most brands start with Quick Scan, then upgrade to Full Audit for strategic planning.</p>"
      },
      {
        "id": 7,
        "question": "Do you test across all AI models or just ChatGPT?",
        "answer": "<p>AIDI tests across <strong>4 major AI platforms</strong>:</p><ul><li><strong>ChatGPT</strong> (GPT-4 Turbo)</li><li><strong>Claude</strong> (Claude 3.5 Sonnet)</li><li><strong>Gemini</strong> (Gemini 1.5 Pro)</li><li><strong>Perplexity</strong> (Sonar Pro)</li></ul><p>We use frontier models, not basic versions. This ensures comprehensive coverage across the AI landscape users actually interact with.</p>"
      },
      {
        "id": 8,
        "question": "How do you ensure competitive comparisons are fair?",
        "answer": "<p>AIDI uses <strong>standardized prompt libraries</strong>—the exact same 20 prompts for every competitor in a category.</p><p>We don't allow user-customized prompts because that destroys comparability. Everyone tested with identical methodology.</p><p>Results include p-values to confirm competitive differences are statistically significant, not measurement noise.</p>"
      },
      {
        "id": 9,
        "question": "Can I see a sample AIDI report before purchasing?",
        "answer": "<p><strong>Yes!</strong> We provide:</p><ul><li><strong>Demo report:</strong> Anonymized example showing format and depth</li><li><strong>Sample data:</strong> Industry benchmark examples</li><li><strong>Methodology white paper:</strong> Complete technical documentation</li></ul><p>Email <a href=\"mailto:hello@aidi.com\" class=\"text-blue-600 underline\">hello@aidi.com</a> to request sample materials or schedule a walkthrough.</p>"
      },
      {
        "id": 10,
        "question": "What if my brand ranks poorly? Can you help us improve?",
        "answer": "<p>AIDI provides <strong>diagnostic intelligence</strong>, not optimization services directly.</p><p>Your report includes:</p><ul><li>Specific gaps identified (weak citations, poor entity recognition, etc.)</li><li>Prioritized recommendations</li><li>90-day action roadmap</li></ul><p>We can refer you to AEO agencies and consultants who specialize in implementation. Our job is measurement; theirs is optimization.</p>"
      },
      {
        "id": 11,
        "question": "How does AIDI pricing compare to traditional market research?",
        "answer": "<p>Traditional competitive intelligence reports from firms like Gartner or Forrester cost <strong>£5,000-£15,000+</strong> and take 4-8 weeks.</p><p>AIDI Full Audit (£2,500) delivers in 2 weeks with:</p><ul><li>Quantitative benchmarking (not qualitative surveys)</li><li>Statistical validation</li><li>Real-time AI testing</li><li>Competitive percentile rankings</li></ul><p>You're getting research-grade intelligence at a fraction of traditional cost.</p>"
      },
      {
        "id": 12,
        "question": "Do you offer refunds if I'm not satisfied?",
        "answer": "<p><strong>Yes—100% satisfaction guarantee.</strong></p><p>If you're not satisfied with the quality, rigor, or actionability of your AIDI report, we'll refund your full payment.</p><p>Our methodology is transparent and peer-reviewable. If we can't defend our findings to your satisfaction, you shouldn't pay for them.</p><p>No hassle, no questions asked.</p>"
      }
    ]
  }$$::jsonb,
  1,
  true
FROM cms_pages p
WHERE p.slug = 'faq'
ON CONFLICT (page_id, block_key) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ FAQ Page Updated!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📝 Format: 3-column card grid (matches blog layout)';
  RAISE NOTICE '📊 Questions: 12 FAQs ready to edit';
  RAISE NOTICE '🎯 CMS Path: Page Content → FAQ → Edit faq_items block';
  RAISE NOTICE '';
  RAISE NOTICE 'QUESTIONS INCLUDED:';
  RAISE NOTICE '1. What is AIDI vs SEO tools?';
  RAISE NOTICE '2. AIDI vs monitoring tools difference?';
  RAISE NOTICE '3. Why statistical confidence intervals?';
  RAISE NOTICE '4. Can use for M&A due diligence?';
  RAISE NOTICE '5. How often to run evaluation?';
  RAISE NOTICE '6. Quick Scan vs Full Audit?';
  RAISE NOTICE '7. Which AI models tested?';
  RAISE NOTICE '8. Fair competitive comparisons?';
  RAISE NOTICE '9. Can see sample report?';
  RAISE NOTICE '10. Help improving rankings?';
  RAISE NOTICE '11. Pricing vs traditional research?';
  RAISE NOTICE '12. Refund policy?';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

