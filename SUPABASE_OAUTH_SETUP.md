# Fixing OAuth Redirects in Supabase

This guide explains how to fix the issue with OAuth redirects going to `localhost:3000` instead of your production domain.

## Update Redirect URLs in Supabase Dashboard

1. Go to your [Supabase dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** in the sidebar
4. Click on **URL Configuration**
5. Update the following settings:
   - **Site URL**: Set this to your production URL (e.g., `https://lenslynx.onrender.com`)
   - **Redirect URLs**: Add your production callback URL, along with the development URL:
     ```
     https://lenslynx.onrender.com/auth/callback
     https://isewr-frontend.onrender.com/auth/callback
     http://localhost:3000/auth/callback
     ```

## Update OAuth Provider Settings

If you're using Google, GitHub, or other OAuth providers, you also need to update their settings:

1. Still in the **Authentication** section of Supabase
2. Click on **Providers** 
3. For each enabled provider (Google, GitHub, etc.):
   - Make sure the Callback URL they receive from Supabase includes your production domain
   - If you need to update these, go to each provider's developer console

## Testing the Fix

After making these changes:

1. Log out of your application completely
2. Clear your browser cache and cookies for your domain
3. Try logging in with Google or GitHub again
4. You should now be redirected back to your production domain after authentication

## Note for Local Development

If you need to switch between local development and production:
- The updated code now automatically detects the current domain and uses it for redirects
- No code changes are needed when switching between environments

## Troubleshooting

If you still experience redirect issues:

1. Check browser console for any errors
2. Verify the Supabase client initialization in the console logs
3. Confirm that the `window.location.origin` value is correct
4. Make sure your OAuth providers are properly configured in the Supabase dashboard 