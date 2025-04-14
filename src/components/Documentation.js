import React from 'react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Documentation</h1>
          <p className="text-xl text-gray-500">Learn how to use Lens<span className="text-yellow-500">Lynx</span>'s powerful features</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:shadow-xl transition-all duration-300">
          <div className="p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
              <p className="text-gray-600">
                Welcome to the LensLynx documentation. This guide will help you understand how to use our AI-powered tools for image and video processing.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Quick Start</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600 mb-8">
                <li>Sign up for an account or log in to your existing account</li>
                <li>Choose the tool you want to use from the navigation menu</li>
                <li>Upload your media file (image or video)</li>
                <li>Configure the settings as needed</li>
                <li>Process your media and download the results</li>
              </ol>

              <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-medium text-gray-800 mb-2 flex items-center">
                    <span className="text-yellow-500 mr-2">🔍</span> Image Recognition
                  </h3>
                  <p className="text-gray-600">
                    Our image recognition tool uses advanced AI to identify objects, people, and scenes in your images. Simply upload an image and our system will analyze it and provide detailed information about what it contains.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-medium text-gray-800 mb-2 flex items-center">
                    <span className="text-yellow-500 mr-2">🕵️</span> Deep Fake Detection
                  </h3>
                  <p className="text-gray-600">
                    The deep fake detection tool helps you identify manipulated videos. Upload a video and our AI will analyze it for signs of manipulation, providing a confidence score and detailed findings.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-medium text-gray-800 mb-2 flex items-center">
                    <span className="text-yellow-500 mr-2">🎬</span> Image to Video
                  </h3>
                  <p className="text-gray-600">
                    Convert static images into dynamic videos with our image to video tool. Choose from various animation styles and effects to bring your images to life.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-medium text-gray-800 mb-2 flex items-center">
                    <span className="text-yellow-500 mr-2">✨</span> Image Processing
                  </h3>
                  <p className="text-gray-600">
                    Enhance and edit your images with our comprehensive image processing tool. Apply filters, adjust settings, add text, stickers, and more.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">API Reference</h2>
              <p className="text-gray-600 mb-4">
                For developers who want to integrate LensLynx into their applications, we provide a RESTful API. The API allows you to programmatically access all of our features.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Authentication</h3>
              <p className="text-gray-600 mb-4">
                All API requests require an API key, which you can obtain from your account settings. Include the API key in the Authorization header of your requests.
              </p>
              
              

              <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">Support</h2>
              <p className="text-gray-600">
                If you have any questions or need assistance, please contact our support team at noreply@lenslynx.art or use the contact form below.
              </p>
              
              <div className="mt-8 text-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 border border-yellow-600 text-base font-bold rounded-md shadow-sm text-black bg-yellow-500 hover:bg-yellow-600 hover:text-white transition-colors duration-200"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 