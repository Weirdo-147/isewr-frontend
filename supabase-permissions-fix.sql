-- This script fixes RLS policies for both storage and database tables
-- Run this in your Supabase SQL Editor

-------------------------------
-- STORAGE POLICIES
-------------------------------

-- First, check if the images bucket exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'images'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('images', 'images', true);
    END IF;
END $$;

-- Enable row level security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;

-- Create comprehensive public access policy (simplest solution)
CREATE POLICY "Public Access" 
ON storage.objects FOR ALL 
TO public 
USING (bucket_id = 'images');

-- If the above doesn't work, try these more specific policies:
-- CREATE POLICY "Allow public read access" 
-- ON storage.objects FOR SELECT 
-- TO public 
-- USING (bucket_id = 'images');

-- CREATE POLICY "Allow anonymous uploads" 
-- ON storage.objects FOR INSERT 
-- TO public 
-- WITH CHECK (bucket_id = 'images');

-------------------------------
-- DATABASE TABLE POLICIES
-------------------------------

-- Enable RLS on images table
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Enable RLS on processed_images table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'processed_images'
    ) THEN
        ALTER TABLE public.processed_images ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to images" ON public.images;
DROP POLICY IF EXISTS "Allow anonymous inserts to images" ON public.images;

-- Create comprehensive policies for images table
CREATE POLICY "Allow public access to images" 
ON public.images FOR ALL
TO public
USING (true) 
WITH CHECK (true);

-- If the above doesn't work, try these more specific policies:
-- CREATE POLICY "Allow public read access to images"
-- ON public.images
-- FOR SELECT
-- TO public
-- USING (true);

-- CREATE POLICY "Allow anonymous inserts to images"
-- ON public.images
-- FOR INSERT
-- TO public
-- WITH CHECK (true);

-- Add processed_images policies if the table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'processed_images'
    ) THEN
        DROP POLICY IF EXISTS "Allow public access to processed_images" ON public.processed_images;
        
        CREATE POLICY "Allow public access to processed_images" 
        ON public.processed_images FOR ALL
        TO public
        USING (true)
        WITH CHECK (true);
    END IF;
END $$; 