import React from 'react';
import { useAuth } from '../App';
import { useTheme } from '../App';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.email || 'User'}!
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your personal dashboard
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Account Information
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="mt-1 text-sm text-gray-900 truncate">{user?.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Created</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <a
                  href="/recognition"
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'} bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  New Image Recognition
                </a>
                <a
                  href="/deepfake"
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'} bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  Deepfake Detection
                </a>
                <a
                  href="/ai-detection"
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'} bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  AI Image Detection
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips - Full Width */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            Quick Tips
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Get the most out of our platform
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Use high-resolution images for better recognition accuracy</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Use our deepfake detection to verify the authenticity of images</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">We support over 10,000 objects and concepts in image recognition</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Try our AI detection to identify AI-generated content</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Change your theme preferences in your profile settings</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">You can process multiple images in batch for efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 