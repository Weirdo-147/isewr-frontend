import { createClient } from '@supabase/supabase-js';

// Get URLs from environment variables or use defaults
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://xmidmrmiixhfnccvrjqk.supabase.co";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaWRtcm1paXhoZm5jY3ZyanFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDcyOTcsImV4cCI6MjA1OTg4MzI5N30.u8ZUAhjn0X4qEc4ebA6nH2JOQeYUB5fy15K4femDGWw";

// Get the site URL - this is used for redirects after OAuth
const siteUrl = window.location.origin;
console.log('Current site URL:', siteUrl);

// Create the Supabase client with auth options
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Set the site URL to ensure redirects work properly
    site_url: siteUrl,
    // Set redirect URLs
    redirectTo: `${siteUrl}/auth/callback`
  }
});

console.log('Supabase client initialized with URL:', supabaseUrl);
console.log('Auth redirect URL set to:', `${siteUrl}/auth/callback`);

// Function to submit contact form data
export const submitContactForm = async (formData) => {
  try {
    console.log('Submitting contact form:', formData);
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        { 
          ...formData,
          created_at: new Date().toISOString(),
          status: 'new'
        }
      ]);
      
    if (error) {
      console.error('Contact form submission error:', error);
      throw error;
    }
    
    console.log('Contact form submitted successfully');
    return data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

// Function to upload image to Supabase Storage
export const uploadImage = async (file, fileName) => {
  try {
    console.log('Uploading to Supabase Storage bucket: images');
    const { data, error } = await supabase.storage
      .from('images')
      .upload(`${fileName}`, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
    
    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);
      
    console.log('Public URL:', urlData);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Function to store image metadata in database
export const storeImageMetadata = async (imageData) => {
  try {
    console.log('Storing metadata in images table:', imageData);
    const { data, error } = await supabase
      .from('images')
      .insert([imageData])
      .select();
      
    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }
    
    console.log('Metadata stored successfully:', data);
    return data[0];
  } catch (error) {
    console.error('Error storing image metadata:', error);
    throw error;
  }
};

// Function to get recognition results
export const getRecognitionResult = async (recognitionId) => {
  try {
    console.log('Fetching recognition result:', recognitionId);
    const { data, error } = await supabase
      .from('recognition_results')
      .select('*')
      .eq('id', recognitionId)
      .single();
      
    if (error) {
      console.error('Database query error:', error);
      throw error;
    }
    
    console.log('Recognition result fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching recognition result:', error);
    throw error;
  }
};

// Function to store processed image metadata
export const storeProcessedImageMetadata = async (processedData) => {
  try {
    // Only include columns that we're pretty sure exist in the table
    const safeData = {
      original_url: processedData.original_url,
      processed_url: processedData.processed_url,
      processed_at: processedData.processed_at
    };
    
    console.log('Storing processed image metadata (safe fields only):', safeData);
    
    const { data, error } = await supabase
      .from('processed_images')
      .insert([safeData])
      .select();
      
    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }
    
    console.log('Processed image metadata stored successfully:', data);
    return data[0];
  } catch (error) {
    console.error('Error storing processed image metadata:', error);
    throw error;
  }
};

export default supabase; 