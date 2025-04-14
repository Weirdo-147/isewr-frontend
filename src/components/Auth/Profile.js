import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../App';
import { useTheme } from '../../App';
import supabase from '../../supabase';
import { uploadImage } from '../../supabase';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    avatar_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    notificationsEnabled: true,
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    receiveUpdates: true,
    showTips: true,
  });
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (user) {
      // Fetch profile data
      fetchProfile();
    }
    
    // Set the theme preference based on current theme
    setPreferences(prev => ({
      ...prev,
      theme: currentTheme
    }));
  }, [user, currentTheme]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get profile data from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // If no profile found, check if we have data from OAuth provider
      if (!data) {
        // Try to get provider data
        const { data: userData } = await supabase.auth.getUser();
        console.log('User data from Auth:', userData);
        
        // Check for avatar from identities (OAuth providers)
        if (userData?.user?.identities) {
          const identities = userData.user.identities;
          let avatar_url = '';
          let name = '';
          
          // Try to get picture from Google
          const googleIdentity = identities.find(identity => identity.provider === 'google');
          if (googleIdentity && googleIdentity.identity_data) {
            avatar_url = googleIdentity.identity_data.avatar_url || googleIdentity.identity_data.picture;
            name = googleIdentity.identity_data.name || googleIdentity.identity_data.full_name;
          }
          
          // If not found, try GitHub
          if (!avatar_url) {
            const githubIdentity = identities.find(identity => identity.provider === 'github');
            if (githubIdentity && githubIdentity.identity_data) {
              avatar_url = githubIdentity.identity_data.avatar_url;
              name = githubIdentity.identity_data.name || githubIdentity.identity_data.user_name;
            }
          }
          
          // If we found provider data, create a profile
          if (avatar_url || name) {
            const newProfile = {
              id: user.id,
              avatar_url,
              name,
              updated_at: new Date().toISOString(),
            };
            
            // Create profile record
            const { error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile);
            
            if (insertError) throw insertError;
            
            setProfileData(newProfile);
            return;
          }
        }
        
        // If no OAuth data, set default values
        setProfileData({
          name: user.email.split('@')[0],
          avatar_url: '',
        });
        return;
      }
      
      // Use data from the database
      setProfileData({
        name: data.name || '',
        avatar_url: data.avatar_url || '',
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      setUploading(true);
      setError('');
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        setUploading(false);
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size should be less than 2MB');
        setUploading(false);
        return;
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const avatarUrl = await uploadImage(file, `avatars/${fileName}`);
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      
      if (error) throw error;
      
      // Update local state
      setProfileData(prev => ({ ...prev, avatar_url: avatarUrl }));
      setSuccess('Profile picture updated successfully');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      
      if (error) throw error;
      
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (settingType, key) => {
    if (settingType === 'security') {
      setSecuritySettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    } else if (settingType === 'preferences') {
      setPreferences(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const updateTheme = (theme) => {
    setPreferences(prev => ({
      ...prev,
      theme
    }));
    setTheme(theme);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h2 className="text-lg font-medium text-white">Profile</h2>
            <p className="mt-1 text-sm text-blue-100">
              Manage your account settings and view your activity.
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
              </div>
              
              <div className="sm:col-span-3">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              
              <div className="sm:col-span-3">
                <dt className="text-sm font-medium text-gray-500">Account created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </dd>
              </div>
              
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900 pt-6 border-t border-gray-200">Change Password</h3>
              </div>
              
              {error && (
                <div className="sm:col-span-6 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="sm:col-span-6 bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form className="sm:col-span-6 space-y-4" onSubmit={updateProfile}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {loading ? 'Updating profile...' : 'Update Profile'}
                  </button>
                </div>
              </form>
              
              {/* Account Security Section */}
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900 pt-6 border-t border-gray-200">Account Security</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account security settings
                </p>
              </div>
              
              <div className="sm:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-factor authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleSetting('security', 'twoFactorEnabled')}
                      className={`${
                        securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      aria-pressed={securitySettings.twoFactorEnabled}
                    >
                      <span className="sr-only">Enable two-factor authentication</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          securitySettings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Login notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications when a new device logs into your account</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleSetting('security', 'notificationsEnabled')}
                      className={`${
                        securitySettings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      aria-pressed={securitySettings.notificationsEnabled}
                    >
                      <span className="sr-only">Enable login notifications</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          securitySettings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Preferences Section */}
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900 pt-6 border-t border-gray-200">Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Customize your experience
                </p>
              </div>
              
              <div className="sm:col-span-6">
                <h4 className="text-sm font-medium text-gray-900">Theme</h4>
                <div className="mt-2 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => updateTheme('light')}
                    className={`relative px-3 py-2 border rounded-md text-sm font-medium ${
                      preferences.theme === 'light'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTheme('dark')}
                    className={`relative px-3 py-2 border rounded-md text-sm font-medium ${
                      preferences.theme === 'dark'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTheme('system')}
                    className={`relative px-3 py-2 border rounded-md text-sm font-medium ${
                      preferences.theme === 'system'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    System
                  </button>
                </div>
              </div>
              
              <div className="sm:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Product updates</h4>
                    <p className="text-sm text-gray-500">Receive emails about new features and improvements</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleSetting('preferences', 'receiveUpdates')}
                      className={`${
                        preferences.receiveUpdates ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      aria-pressed={preferences.receiveUpdates}
                    >
                      <span className="sr-only">Enable product updates</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          preferences.receiveUpdates ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Show tips and suggestions</h4>
                    <p className="text-sm text-gray-500">Display helpful tips while using the platform</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleSetting('preferences', 'showTips')}
                      className={`${
                        preferences.showTips ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      aria-pressed={preferences.showTips}
                    >
                      <span className="sr-only">Show tips</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          preferences.showTips ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-6 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 