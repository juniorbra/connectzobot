-- Create a new table for storing questions and answers
CREATE TABLE IF NOT EXISTS qa_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE qa_pairs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own qa_pairs
CREATE POLICY "Users can view their own qa_pairs" 
    ON qa_pairs 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own qa_pairs
CREATE POLICY "Users can insert their own qa_pairs" 
    ON qa_pairs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own qa_pairs
CREATE POLICY "Users can update their own qa_pairs" 
    ON qa_pairs 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own qa_pairs
CREATE POLICY "Users can delete their own qa_pairs" 
    ON qa_pairs 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create index on agent_id for faster lookups
CREATE INDEX idx_qa_pairs_agent_id ON qa_pairs(agent_id);

-- Create index on user_id for faster lookups
CREATE INDEX idx_qa_pairs_user_id ON qa_pairs(user_id);

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_qa_pairs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_qa_pairs_updated_at
BEFORE UPDATE ON qa_pairs
FOR EACH ROW
EXECUTE FUNCTION update_qa_pairs_updated_at();

-- Add this table to the database types
COMMENT ON TABLE qa_pairs IS 'Table for storing question and answer pairs for agents';
COMMENT ON COLUMN qa_pairs.question IS 'The question text';
COMMENT ON COLUMN qa_pairs.answer IS 'The answer text';
COMMENT ON COLUMN qa_pairs.agent_id IS 'The ID of the agent this QA pair belongs to';
COMMENT ON COLUMN qa_pairs.user_id IS 'The ID of the user who owns this QA pair';
