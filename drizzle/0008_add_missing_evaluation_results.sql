-- Add missing evaluation_results table to production schema
-- This table is needed for perception and commerce pillar evaluations

CREATE TABLE IF NOT EXISTS production.evaluation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES production.evaluations(id) ON DELETE cascade,
  provider_name varchar(50) NOT NULL,
  test_type varchar(100) NOT NULL,
  prompt_used text,
  response_received text,
  score_contribution integer,
  created_at timestamp DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluation_id 
ON production.evaluation_results(evaluation_id);

-- Create index for provider queries
CREATE INDEX IF NOT EXISTS idx_evaluation_results_provider_test 
ON production.evaluation_results(provider_name, test_type);