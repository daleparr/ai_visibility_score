-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE evaluation_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE recommendation_priority AS ENUM ('1', '2', '3');
CREATE TYPE grade_type AS ENUM ('A', 'B', 'C', 'D', 'F');

-- Brands table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    competitors TEXT[], -- Array of competitor URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    status evaluation_status DEFAULT 'pending',
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    grade grade_type,
    verdict TEXT,
    strongest_dimension VARCHAR(100),
    weakest_dimension VARCHAR(100),
    biggest_opportunity VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dimension scores table
CREATE TABLE dimension_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    dimension_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    explanation TEXT,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI providers table
CREATE TABLE ai_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_name)
);

-- Evaluation results table
CREATE TABLE evaluation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    prompt_used TEXT,
    response_received TEXT,
    score_contribution INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    priority recommendation_priority NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    impact_level VARCHAR(20) CHECK (impact_level IN ('high', 'medium', 'low')),
    effort_level VARCHAR(20) CHECK (effort_level IN ('high', 'medium', 'low')),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor benchmarks table
CREATE TABLE competitor_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    competitor_url VARCHAR(500) NOT NULL,
    competitor_name VARCHAR(255),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    dimension_scores JSONB, -- Store all dimension scores as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(100),
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_evaluations_brand_id ON evaluations(brand_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_dimension_scores_evaluation_id ON dimension_scores(evaluation_id);
CREATE INDEX idx_ai_providers_user_id ON ai_providers(user_id);
CREATE INDEX idx_evaluation_results_evaluation_id ON evaluation_results(evaluation_id);
CREATE INDEX idx_recommendations_evaluation_id ON recommendations(evaluation_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
CREATE INDEX idx_competitor_benchmarks_evaluation_id ON competitor_benchmarks(evaluation_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON ai_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimension_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Brands policies
CREATE POLICY "Users can view their own brands" ON brands
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brands" ON brands
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brands" ON brands
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brands" ON brands
    FOR DELETE USING (auth.uid() = user_id);

-- Evaluations policies
CREATE POLICY "Users can view evaluations for their brands" ON evaluations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brands 
            WHERE brands.id = evaluations.brand_id 
            AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert evaluations for their brands" ON evaluations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM brands 
            WHERE brands.id = evaluations.brand_id 
            AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update evaluations for their brands" ON evaluations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM brands 
            WHERE brands.id = evaluations.brand_id 
            AND brands.user_id = auth.uid()
        )
    );

-- Dimension scores policies
CREATE POLICY "Users can view dimension scores for their evaluations" ON dimension_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM evaluations e
            JOIN brands b ON e.brand_id = b.id
            WHERE e.id = dimension_scores.evaluation_id 
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert dimension scores for their evaluations" ON dimension_scores
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM evaluations e
            JOIN brands b ON e.brand_id = b.id
            WHERE e.id = dimension_scores.evaluation_id 
            AND b.user_id = auth.uid()
        )
    );

-- AI providers policies
CREATE POLICY "Users can manage their own AI providers" ON ai_providers
    FOR ALL USING (auth.uid() = user_id);

-- Evaluation results policies
CREATE POLICY "Users can view evaluation results for their evaluations" ON evaluation_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM evaluations e
            JOIN brands b ON e.brand_id = b.id
            WHERE e.id = evaluation_results.evaluation_id 
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert evaluation results" ON evaluation_results
    FOR INSERT WITH CHECK (true);

-- Recommendations policies
CREATE POLICY "Users can view recommendations for their evaluations" ON recommendations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM evaluations e
            JOIN brands b ON e.brand_id = b.id
            WHERE e.id = recommendations.evaluation_id 
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert recommendations" ON recommendations
    FOR INSERT WITH CHECK (true);

-- Competitor benchmarks policies
CREATE POLICY "Users can view competitor benchmarks for their evaluations" ON competitor_benchmarks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM evaluations e
            JOIN brands b ON e.brand_id = b.id
            WHERE e.id = competitor_benchmarks.evaluation_id 
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert competitor benchmarks" ON competitor_benchmarks
    FOR INSERT WITH CHECK (true);

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();