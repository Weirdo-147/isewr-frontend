import React, { useState } from 'react';
import { API_URL } from '../config';

const Recognition = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🌎', description: 'Search across all categories' },
    { id: 'food', name: 'Food & Beverages', icon: '🍽️', description: 'Dishes, ingredients, and drinks' },
    { id: 'people', name: 'People', icon: '👥', description: 'Human faces and activities' },
    { id: 'nature', name: 'Nature', icon: '🌿', description: 'Plants, animals, and landscapes' },
    { id: 'buildings', name: 'Architecture', icon: '🏛️', description: 'Buildings and landmarks' },
    { id: 'vehicles', name: 'Vehicles', icon: '🚗', description: 'Cars, planes, and transportation' },
    { id: 'objects', name: 'Objects', icon: '📦', description: 'Common items and products' },
    { id: 'tech', name: 'Technology', icon: '💻', description: 'Gadgets and electronics' },
    { id: 'art', name: 'Art', icon: '🎨', description: 'Artwork and creative pieces' },
    { id: 'sports', name: 'Sports', icon: '⚽', description: 'Sports equipment and activities' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const handleRecognize = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('category', selectedCategory);

    try {
      const response = await fetch(`${API_URL}/recognize`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
      setResults({ success: false, message: 'Error processing image' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-3">Smart Image Recognition</h1>
          <p className="text-xl text-gray-500 mb-8">Identify objects and scenes in your images with AI</p>
          
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800 mb-1">How it works</h3>
                <p className="text-gray-500">Select a category to narrow down the search and improve accuracy. Our AI will analyze your image within the selected context.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Select Category</h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Upload Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg hover:border-blue-300 transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-500 hover:text-blue-600 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                {preview && (
                  <div className="mb-6">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRecognize}
                  disabled={!selectedImage || loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                    !selectedImage || loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 transition-colors duration-200'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Recognize Objects'}
                </button>

                {results && (
                  <div className="mt-8">
                    <h2 className="text-xl font-medium text-gray-800 mb-3">Results</h2>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <p className="text-gray-700 mb-3">{results.message}</p>
                      {results.objects && results.objects.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Detected Objects:</h3>
                          <div className="flex flex-wrap gap-2">
                            {results.objects.map((obj, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                {obj}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Precise Categories</h3>
            <p className="text-gray-500">Choose from specific categories to narrow down the search scope and improve recognition accuracy.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Fast Processing</h3>
            <p className="text-gray-500">Our AI processes your image in seconds, providing quick and accurate results.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Detailed Analysis</h3>
            <p className="text-gray-500">Get comprehensive information about objects, scenes, and elements in your image.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recognition; 