import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Handle the OAuth callback to exchange the OAuth code for a session
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback handler starting");
        console.log("Current URL:", window.location.href);
        console.log("Current origin:", window.location.origin);
        
        // Check if we have a hash containing access_token (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Check for error parameters
        const errorParam = hashParams.get('error') || new URLSearchParams(window.location.search).get('error');
        const errorDescription = hashParams.get('error_description') || new URLSearchParams(window.location.search).get('error_description');
        
        if (errorParam) {
          console.error('Auth callback error:', errorParam, errorDescription);
          setError(`Authentication failed: ${errorDescription || errorParam}`);
          return;
        }
        
        // If we have access_token in the URL hash, set the session directly
        if (accessToken) {
          console.log("Found access_token in URL, setting session");
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          if (data?.session) {
            console.log('Successfully set session from tokens');
            navigate('/dashboard', { replace: true });
            return;
          }
        }
        
        // If no tokens in URL hash, check for code in query params (authorization code flow)
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        
        if (code) {
          console.log("Found code in URL, exchanging for session");
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) throw error;
          
          if (data?.session) {
            console.log('Successfully exchanged code for session');
            navigate('/dashboard', { replace: true });
            return;
          }
        }
        
        // If we get here, we have no session information in the URL
        // Try to get the current session as a fallback
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          console.log('Found existing session');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // If we get here, authentication failed
        console.warn('No session information found in URL or current session');
        setError('Authentication was successful, but no session was established. Please try logging in again.');
        
      } catch (err) {
        console.error('Error handling auth callback:', err);
        setError(`Failed to complete authentication: ${err.message}`);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Show a loading state while processing the callback
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      {error ? (
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Authentication Error</h2>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Finishing Authentication</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we complete the authentication process...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthCallback; 