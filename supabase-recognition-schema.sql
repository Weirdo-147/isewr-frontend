-- Create recognition_results table
CREATE TABLE IF NOT EXISTS public.recognition_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    objects JSONB DEFAULT '[]'::jsonb,
    texts JSONB DEFAULT '[]'::jsonb,
    scene_description TEXT DEFAULT '',
    web_matches JSONB DEFAULT '[]'::jsonb,
    celebrities JSONB DEFAULT '[]'::jsonb,
    celebrity_scene_description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comment to table
COMMENT ON TABLE public.recognition_results IS 'Stores image recognition results from Google Cloud Vision API and Gemini Pro Vision';

-- Set up Row Level Security (RLS)
ALTER TABLE public.recognition_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" 
    ON public.recognition_results FOR SELECT 
    USING (true);

-- Create policy to allow authenticated insert
CREATE POLICY "Allow authenticated insert" 
    ON public.recognition_results FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Create policy for allowing updates
CREATE POLICY "Allow updates to own records" 
    ON public.recognition_results FOR UPDATE 
    TO authenticated 
    USING (true);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS recognition_results_created_at_idx ON public.recognition_results (created_at);

-- Create index on image_url for faster lookups
CREATE INDEX IF NOT EXISTS recognition_results_image_url_idx ON public.recognition_results (image_url);

-- Set up trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recognition_results_updated_at
    BEFORE UPDATE ON public.recognition_results
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at(); 