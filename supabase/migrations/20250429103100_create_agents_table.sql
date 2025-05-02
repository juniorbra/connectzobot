-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    type TEXT DEFAULT 'DIFY',
    prompt TEXT,
    model TEXT DEFAULT 'gpt-3.5-turbo',
    webhook_url TEXT,
    response_template TEXT,
    advanced_settings JSONB DEFAULT '{"temperature": 0.7, "max_tokens": 2000}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Policy for select (users can only see their own agents)
CREATE POLICY "Users can view their own agents" 
    ON public.agents 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy for insert (users can only insert their own agents)
CREATE POLICY "Users can insert their own agents" 
    ON public.agents 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy for update (users can only update their own agents)
CREATE POLICY "Users can update their own agents" 
    ON public.agents 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy for delete (users can only delete their own agents)
CREATE POLICY "Users can delete their own agents" 
    ON public.agents 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on agents table
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
