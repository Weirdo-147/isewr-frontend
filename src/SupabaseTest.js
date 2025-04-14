import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with hardcoded placeholders
// In a real app, these would come from environment variables
const supabaseUrl = 'https://xmidmrmiixhfnccvrjqk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaWRtcm1paXhoZm5jY3ZyanFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDcyOTcsImV4cCI6MjA1OTg4MzI5N30.u8ZUAhjn0X4qEc4ebA6nH2JOQeYUB5fy15K4femDGWw';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function SupabaseTest() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    // Check Supabase connection and list buckets when component mounts
    const checkConnection = async () => {
      try {
        // List buckets to verify connection and permissions
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        setBuckets(data || []);
        
        // Try to get policies for the images bucket if it exists
        const imagesBucket = data?.find(bucket => bucket.name === 'images');
        if (imagesBucket) {
          try {
            // This is just to check policy existence - the actual API might differ
            const { data: policiesData } = await supabase.rpc('get_policies', { 
              bucket_id: 'images' 
            }).catch(() => ({ data: null }));
            
            if (policiesData) {
              setPolicies(policiesData);
            }
          } catch (e) {
            console.log('Could not fetch policies (this is expected):', e);
          }
        }
      } catch (err) {
        console.error('Connection error:', err);
        setError(`Connection error: ${err.message}`);
      }
    };
    
    checkConnection();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setDetailedError(null);
      
      console.log('Using Supabase URL:', supabaseUrl);
      
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomString}-${file.name.replace(/\s+/g, '-')}`;
      
      // Skip the database insert for now and just test file upload
      console.log('Attempting to upload to bucket: images');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        setDetailedError(uploadError);
        throw new Error(`Storage upload error: ${uploadError.message}`);
      }
      
      console.log('Upload successful:', uploadData);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path);
        
      console.log('Public URL:', urlData);
      setUploadedUrl(urlData.publicUrl);
      
      // Store metadata in Supabase Database - only attempt this if file upload succeeded
      console.log('Attempting to store metadata in images table');
      const { data: metadataData, error: metadataError } = await supabase
        .from('images')
        .insert([{
          url: urlData.publicUrl,
          name: file.name,
          uploaded_at: new Date().toISOString(),
        }])
        .select();
        
      if (metadataError) {
        console.error('Metadata error:', metadataError);
        setDetailedError(metadataError);
        // Don't throw here - we already have the uploaded file URL
        console.warn(`Database insert error: ${metadataError.message}`);
      } else {
        console.log('Metadata stored successfully:', metadataData);
      }
      
    } catch (err) {
      console.error('Error uploading:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Supabase Storage Test</h1>
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <h2 className="font-semibold">Connection Status:</h2>
        <p>
          {buckets.length > 0 
            ? `✅ Connected. Found ${buckets.length} buckets.` 
            : '❌ Could not retrieve buckets.'}
        </p>
        <p className="mt-1">
          {buckets.find(b => b.name === 'images') 
            ? '✅ Images bucket exists.' 
            : '❌ Images bucket not found.'}
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Select Image</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <button 
        onClick={handleUpload}
        disabled={uploading || !file}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : 'Upload to Supabase'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          
          {detailedError && (
            <div className="mt-2 text-sm">
              <p className="font-semibold">Detailed error:</p>
              <pre className="bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-40">
                {JSON.stringify(detailedError, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      {uploadedUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Uploaded Image:</h2>
          <img 
            src={uploadedUrl} 
            alt="Uploaded" 
            className="w-full h-auto rounded shadow"
          />
          <p className="mt-2 text-sm text-gray-600 break-all">
            URL: {uploadedUrl}
          </p>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded text-sm">
        <p className="font-semibold">RLS Policy Requirements:</p>
        <ol className="list-decimal pl-5 mt-2">
          <li>
            Run the following in SQL Editor:
            <pre className="bg-gray-100 p-2 mt-1 mb-2 rounded text-xs overflow-auto">
              {`-- Enable RLS on bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR ALL 
TO public 
USING (bucket_id = 'images');`}
            </pre>
          </li>
          <li>
            You can also create separate policies for INSERT and SELECT:
            <pre className="bg-gray-100 p-2 mt-1 mb-2 rounded text-xs overflow-auto">
              {`-- Storage policy for uploads
CREATE POLICY "Allow uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'images');`}
            </pre>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default SupabaseTest; 