import React, { useState } from 'react';

const DeepFake = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleCheck = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('http://localhost:8000/deepfake', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ success: false, message: 'Error processing image' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-gray-800 mb-2">Deep Fake Detection</h1>
          <p className="text-gray-500">Check if an image is real or artificially generated</p>
        </div>
        
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
              onClick={handleCheck}
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
                  Analyzing...
                </span>
              ) : 'Check Deep Fake'}
            </button>

            {result && (
              <div className="mt-8">
                <h2 className="text-xl font-medium text-gray-800 mb-3">Result</h2>
                <div className={`p-5 rounded-lg border ${
                  result.objects?.[0] === 'Real' 
                    ? 'bg-green-50 border-green-100' 
                    : 'bg-red-50 border-red-100'
                }`}>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      result.objects?.[0] === 'Real' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {result.objects?.[0] === 'Real' ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-lg font-medium ${
                        result.objects?.[0] === 'Real' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.message}
                      </p>
                      <p className={`text-sm ${
                        result.objects?.[0] === 'Real' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.objects?.[0] === 'Real' 
                          ? 'This image appears to be authentic' 
                          : 'This image may have been artificially generated'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepFake; 