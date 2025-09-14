-- Migration: Add Conversational Copy dimension support
-- This migration documents the addition of the new "conversational_copy" dimension
-- to the AI Visibility Score evaluation framework.

-- The existing schema already supports this new dimension since dimension_name 
-- is stored as VARCHAR(100), but we're creating this migration for documentation
-- and to ensure any future constraints or indexes are properly handled.

-- Add a comment to document the new dimension
COMMENT ON TABLE dimension_scores IS 'Stores scores for all evaluation dimensions including:
Infrastructure & Machine Readability (40%):
- schema_structured_data (10%)
- semantic_clarity (10%) 
- ontologies_taxonomy (10%)
- knowledge_graphs (5%)
- llm_readability (5%)
- conversational_copy (5%) -- NEW DIMENSION

Perception & Reputation (35%):
- geo_visibility (10%)
- citation_strength (10%)
- answer_quality (10%)
- sentiment_trust (5%)

Commerce & Customer Experience (25%):
- hero_products (15%)
- shipping_freight (10%)';

-- Create an index on dimension_name for better query performance
-- (if it doesn't already exist)
CREATE INDEX IF NOT EXISTS idx_dimension_scores_dimension_name 
ON dimension_scores(dimension_name);

-- Insert a reference record for the new dimension (for documentation)
-- This helps ensure the dimension is recognized in the system
INSERT INTO dimension_scores (
    id,
    evaluation_id,
    dimension_name,
    score,
    explanation,
    recommendations,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'conversational_copy',
    0,
    'Reference record for Conversational Copy dimension - measures how well brand content teaches AI systems why the brand matters through natural, conversational language.',
    ARRAY['Implement use-case driven product descriptions', 'Add natural Q&A style content', 'Integrate brand values into copy', 'Mirror customer query patterns'],
    NOW()
) ON CONFLICT DO NOTHING;

-- Clean up the reference record (it's just for schema validation)
DELETE FROM dimension_scores 
WHERE evaluation_id = '00000000-0000-0000-0000-000000000000'::uuid;