# Supabase Setup Instructions

This document provides instructions on setting up Supabase for the ISEWR image processing application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one.
2. Click on "New Project" to create a new project.
3. Fill in the project details:
   - **Name**: ISEWR
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to you
4. Click "Create new project" and wait for your project to be provisioned.

## 2. Create Database Tables

Once your project is ready, set up the required database tables:

### Images Table
1. Go to the SQL Editor in your Supabase dashboard.
2. Create the `images` table by running the following SQL:

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  name TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Processed Images Table
1. Create the `processed_images` table by running:

```sql
CREATE TABLE processed_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_url TEXT,
  processed_url TEXT NOT NULL,
  brightness INTEGER,
  rotation INTEGER,
  text TEXT,
  text_x FLOAT,
  text_y FLOAT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Set Up Storage Bucket

1. Go to the Storage section in your Supabase dashboard.
2. Click "Create a new bucket".
3. Enter the name as `images` and select "Public bucket" option.

## 4. Set Up Row Level Security (RLS) Policies

Supabase uses Row Level Security (RLS) to control access to your data. You need to set up appropriate policies to allow your application to read and write data.

### Storage Policies

1. Go to the Storage section in your Supabase dashboard.
2. Click on the "images" bucket.
3. Go to the "Policies" tab.
4. Add the following policies:

#### Allow Public Read Access
- Policy name: "Allow public read access"
- Allowed operation: SELECT
- Target roles: Public (anon, authenticated)
- Policy definition: `true`

#### Allow Anonymous Uploads
- Policy name: "Allow anonymous uploads"
- Allowed operation: INSERT
- Target roles: Public (anon)
- Policy definition: `true`

### Database Policies

1. Go to the Authentication > Policies section in your Supabase dashboard.
2. Find your "images" table.
3. Create the following policies:

#### Allow Public Read Access to Images
```sql
CREATE POLICY "Allow public read access to images"
ON images
FOR SELECT
TO public
USING (true);
```

#### Allow Anonymous Inserts to Images
```sql
CREATE POLICY "Allow anonymous inserts to images"
ON images
FOR INSERT
TO anon
WITH CHECK (true);
```

#### Allow Public Read Access to Processed Images
```sql
CREATE POLICY "Allow public read access to processed_images"
ON processed_images
FOR SELECT
TO public
USING (true);
```

#### Allow Anonymous Inserts to Processed Images
```sql
CREATE POLICY "Allow anonymous inserts to processed_images"
ON processed_images
FOR INSERT
TO anon
WITH CHECK (true);
```

### Enable RLS on Tables

```sql
-- Enable RLS on images table
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Enable RLS on processed_images table
ALTER TABLE processed_images ENABLE ROW LEVEL SECURITY;
```

## 5. Get Project Credentials

1. Go to Project Settings > API.
2. You'll need two pieces of information:
   - **Project URL**: Your Supabase project URL
   - **anon/public key**: Your public API key

## 6. Add Credentials to Your Project

1. Create a `.env` file in the frontend directory of your project based on the `.env.example` file.
2. Add your Supabase credentials:

```
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_URL=http://localhost:8000
```

## 7. Update Supabase Client in Code

Open the file `frontend/src/SupabaseTest.js` and update the Supabase URL and anon key with your actual values:

```javascript
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

Also update `frontend/src/supabase.js` with the same values if you're not using environment variables.

## 8. Test the Integration

1. Start your React app with `npm start`
2. Navigate to `/supabase` route to test the integration
3. Try uploading an image
4. Check your Supabase dashboard to verify that:
   - Images are uploaded to the storage bucket
   - Metadata is stored in the database tables

## Troubleshooting

### Error: "new row violates row-level security policy"
This error occurs when your RLS policies are not configured correctly. Make sure you've:
1. Enabled RLS on your tables
2. Created policies that allow anonymous inserts
3. Verified the policy is applied to the correct table

### Error: "Bucket not found"
Make sure you've:
1. Created a bucket named exactly "images" (case-sensitive)
2. The bucket is public

### Error: "Table not found"
Make sure you've:
1. Created the tables with the exact names specified
2. You're using the correct table names in your code 