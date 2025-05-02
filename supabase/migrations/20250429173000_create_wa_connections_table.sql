-- Create wa_connections table
CREATE TABLE IF NOT EXISTS public.wa_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_name TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.wa_connections ENABLE ROW LEVEL SECURITY;

-- Policy for select (users can only see their own connections)
CREATE POLICY "Users can view their own wa_connections" 
    ON public.wa_connections 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy for insert (users can only insert their own connections)
CREATE POLICY "Users can insert their own wa_connections" 
    ON public.wa_connections 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy for update (users can only update their own connections)
CREATE POLICY "Users can update their own wa_connections" 
    ON public.wa_connections 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy for delete (users can only delete their own connections)
CREATE POLICY "Users can delete their own wa_connections" 
    ON public.wa_connections 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create trigger to update updated_at on wa_connections table
CREATE TRIGGER set_wa_connections_updated_at
BEFORE UPDATE ON public.wa_connections
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add index for faster lookups by user_id
CREATE INDEX idx_wa_connections_user_id ON public.wa_connections(user_id);
