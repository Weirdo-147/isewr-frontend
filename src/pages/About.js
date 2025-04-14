import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">About Lens<span className="text-yellow-500">Lynx</span></h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to revolutionize image and video processing through cutting-edge AI technology.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2023, LensLynx emerged from a simple observation: the world needed better tools for image and video processing. Our team of AI experts and creative professionals came together to build solutions that make advanced image processing accessible to everyone.
              </p>
              <p className="text-gray-600">
                Today, we're proud to serve thousands of users worldwide, from professional photographers to content creators, helping them bring their creative visions to life.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✦</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Innovation</h3>
                    <p className="text-gray-600">Pushing the boundaries of what's possible with AI technology</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✦</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quality</h3>
                    <p className="text-gray-600">Delivering exceptional results that exceed expectations</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✦</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Accessibility</h3>
                    <p className="text-gray-600">Making advanced tools available to everyone</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Our Technologies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-blue-500"></div>
              <div className="p-6">
                <div className="text-5xl text-center mb-4">🧠</div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">Computer Vision</h3>
                <p className="text-gray-600">
                  Our advanced computer vision algorithms can identify objects, people, scenes, and more with exceptional accuracy. We leverage state-of-the-art neural networks trained on diverse datasets.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-purple-500"></div>
              <div className="p-6">
                <div className="text-5xl text-center mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">Deep Learning</h3>
                <p className="text-gray-600">
                  We employ multi-layered neural networks that continuously learn and improve. Our deep learning models can detect patterns and features that traditional algorithms might miss.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-yellow-500"></div>
              <div className="p-6">
                <div className="text-5xl text-center mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">Cloud Processing</h3>
                <p className="text-gray-600">
                  Our cloud infrastructure enables fast processing of your images and videos. Sophisticated operations that would take hours on a personal computer are completed in seconds on our platform.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <button 
              onClick={() => navigate('/documentation')} 
              className="inline-flex items-center px-6 py-3 border border-yellow-600 text-base font-bold rounded-md shadow-sm text-black bg-yellow-500 hover:bg-yellow-600 hover:text-white transition-colors duration-200"
            >
              Explore Our Technology
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 