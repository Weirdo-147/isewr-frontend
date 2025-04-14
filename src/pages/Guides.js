import React from 'react';
import { useNavigate } from 'react-router-dom';

const Guides = () => {
  const navigate = useNavigate();
  
  const guides = [
    {
      category: 'Getting Started',
      items: [
        {
          title: 'Quick Start Guide',
          description: 'Learn the basics of LensLynx in 5 minutes',
          duration: '5 min read',
          level: 'Beginner',
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        {
          title: 'Setting Up Your Account',
          description: 'Complete guide to account setup and configuration',
          duration: '10 min read',
          level: 'Beginner',
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
      ],
    },
    {
      category: 'Image Recognition',
      items: [
        {
          title: 'Understanding Image Recognition',
          description: 'Deep dive into how our AI recognizes images',
          duration: '15 min read',
          level: 'Intermediate',
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
        },
        {
          title: 'Best Practices for Image Recognition',
          description: 'Tips and tricks for better recognition results',
          duration: '12 min read',
          level: 'Intermediate',
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      category: 'Video Conversion',
      items: [
        {
          title: 'Creating Videos from Images',
          description: 'Step-by-step guide to video creation',
          duration: '20 min read',
          level: 'Intermediate',
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          title: 'Advanced Animation Techniques',
          description: 'Master complex animations and effects',
          duration: '25 min read',
          level: 'Advanced',
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
        },
      ],
    },
    {
      category: 'Image Processing',
      items: [
        {
          title: 'Image Enhancement Guide',
          description: 'Learn to enhance your images effectively',
          duration: '15 min read',
          level: 'Intermediate',
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          title: 'Filter and Effect Mastery',
          description: 'Complete guide to filters and effects',
          duration: '18 min read',
          level: 'Advanced',
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Guides & Tutorials</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to use LensLynx effectively with our comprehensive guides
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {guides.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">{section.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {section.items.map((guide) => (
                  <div key={guide.title} className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {guide.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{guide.title}</h3>
                        <p className="mt-2 text-gray-600">{guide.description}</p>
                        <div className="mt-4 flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{guide.duration}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{guide.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-gray-600 mb-8">
            Check out our documentation or contact our support team for personalized assistance.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate('/documentation')}
              className="inline-flex items-center px-6 py-3 border border-yellow-600 text-base font-medium rounded-md shadow-sm text-gray-900 bg-yellow-500 hover:bg-yellow-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            >
              Documentation
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guides; 