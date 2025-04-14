import React, { useState } from 'react';

const AIImageDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.7);
  const [faceThreshold, setFaceThreshold] = useState(0.5);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setPreview(e.target.value);
    setResult(null);
    setError(null);
  };

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting API request...");
      
      if (uploadType === 'file') {
        if (!selectedImage) {
          setError('Please select an image file.');
          setLoading(false);
          return;
        }
        
        console.log("Using file upload mode with file:", selectedImage.name);
        
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('threshold', threshold);
        formData.append('face_threshold', faceThreshold);
        
        console.log("Sending request to API with file...");
        const response = await fetch('http://localhost:8000/detect-ai-image', {
          method: 'POST',
          body: formData,
        });
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          let errorMessage = 'Error processing image';
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use the error text
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        console.log("Parsing response...");
        const data = await response.json();
        console.log("Response data:", data);
        setResult(data);
      } else {
        // URL mode
        if (!imageUrl) {
          setError('Please enter an image URL.');
          setLoading(false);
          return;
        }
        
        console.log("Using URL mode with URL:", imageUrl);
        
        // Use regular form data (not FormData) for URL submissions
        console.log("Sending request to API with URL...");
        const response = await fetch('http://localhost:8000/detect-ai-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'image_url': imageUrl,
            'threshold': threshold,
            'face_threshold': faceThreshold
          })
        });
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          let errorMessage = 'Error processing image';
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use the error text
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        console.log("Parsing response...");
        const data = await response.json();
        console.log("Response data:", data);
        setResult(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error processing image');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score < 0.3) return 'text-green-600';
    if (score < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-gray-800 mb-2">AI & Deepfake Detection</h1>
          <p className="text-gray-500">Check if an image is AI-generated or face-manipulated using SightEngine API</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setUploadType('file')}
                  className={`py-2 px-4 rounded-lg ${
                    uploadType === 'file'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Upload Image
                </button>
                <button
                  onClick={() => setUploadType('url')}
                  className={`py-2 px-4 rounded-lg ${
                    uploadType === 'url'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Image URL
                </button>
              </div>
              
              {uploadType === 'file' ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg hover:border-blue-300 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
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
              ) : (
                <div className="mt-1">
                  <input
                    type="url"
                    placeholder="Enter image URL"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={imageUrl}
                    onChange={handleUrlChange}
                  />
                </div>
              )}
              
              {error && (
                <div className="mt-2 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Detection Threshold ({Math.round(threshold * 100)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Face Manipulation Threshold ({Math.round(faceThreshold * 100)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={faceThreshold}
                onChange={(e) => setFaceThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <button
              onClick={handleCheck}
              disabled={(!selectedImage && !imageUrl) || loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                (!selectedImage && !imageUrl) || loading
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
              ) : 'Check Image'}
            </button>
          </div>
        </div>
        
        {preview && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Preview</h2>
              <div className="flex justify-center">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-96 max-w-full rounded-lg object-contain" 
                  onError={() => {
                    setError('Unable to load image. Please check the URL or try another image.');
                    setPreview(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {result && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Analysis Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* AI Generation Section */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">AI Generation</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Overall Score</span>
                    <span className={`font-medium ${getScoreColor(result.ai_generated_score)}`}>
                      {Math.round(result.ai_generated_score * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full ${
                        result.ai_generated_score < 0.3 
                          ? 'bg-green-500' 
                          : result.ai_generated_score < 0.7 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${result.ai_generated_score * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        result.is_ai_generated 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {result.is_ai_generated 
                          ? <span className="text-xl">🤖</span>
                          : <span className="text-xl">✓</span>
                        }
                      </div>
                      <div className="ml-3">
                        <p className={`font-medium ${
                          result.is_ai_generated ? 'text-red-800' : 'text-green-800'
                        }`}>
                          {result.is_ai_generated 
                            ? 'AI-Generated Image Detected' 
                            : 'Likely Natural Image'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Generation Types */}
                  {result.diffusion_score > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Diffusion Models</span>
                        <span className={getScoreColor(result.diffusion_score)}>
                          {Math.round(result.diffusion_score * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${result.diffusion_score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {result.gan_score > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">GAN Models</span>
                        <span className={getScoreColor(result.gan_score)}>
                          {Math.round(result.gan_score * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${result.gan_score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Specific AI Models if available */}
                  {result.specific_models && Object.keys(result.specific_models).length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Specific AI Models Detected</h4>
                      {Object.entries(result.specific_models)
                        .sort(([, a], [, b]) => b - a)
                        .map(([model, score]) => (
                          <div key={model} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 capitalize">{model.replace('-', ' ')}</span>
                              <span className={getScoreColor(score)}>
                                {Math.round(score * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-500 h-2 rounded-full"
                                style={{ width: `${score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                
                {/* Face Manipulation Section */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Face Detection & Analysis</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Manipulation Probability</span>
                    <span className={`font-medium ${getScoreColor(result.face_manipulation_score)}`}>
                      {Math.round((result.face_manipulation_score || 0) * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full ${
                        (result.face_manipulation_score || 0) < 0.3 
                          ? 'bg-green-500' 
                          : (result.face_manipulation_score || 0) < 0.7 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${(result.face_manipulation_score || 0) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        result.is_face_manipulated 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {result.is_face_manipulated 
                          ? <span className="text-xl">⚠️</span>
                          : <span className="text-xl">✓</span>
                        }
                      </div>
                      <div className="ml-3">
                        <p className={`font-medium ${
                          result.is_face_manipulated ? 'text-red-800' : 'text-green-800'
                        }`}>
                          {result.is_face_manipulated 
                            ? 'Potential Face Manipulation' 
                            : 'No Manipulation Indicators Found'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Display face details if available */}
                  {result.face_details && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Detected Faces: {result.face_details.count}
                      </h4>
                      
                      {result.face_details.attributes && result.face_details.attributes.length > 0 && (
                        <div className="space-y-3">
                          {result.face_details.attributes.map((face, index) => (
                            <div key={index} className="bg-white p-2 rounded-lg border border-gray-200">
                              <p className="text-xs font-medium text-gray-700 mb-1">Face #{index + 1}</p>
                              
                              {face.attributes && (
                                <div className="grid grid-cols-3 gap-1 text-xs">
                                  {face.attributes.gender && (
                                    <div className="bg-gray-50 p-1 rounded">
                                      <span className="block font-medium">Gender</span>
                                      <span>
                                        {Object.entries(face.attributes.gender)
                                          .sort(([, a], [, b]) => b - a)
                                          .slice(0, 1)
                                          .map(([gender, score]) => (
                                            `${gender} (${Math.round(score * 100)}%)`
                                          ))}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {face.attributes.age && (
                                    <div className="bg-gray-50 p-1 rounded">
                                      <span className="block font-medium">Age</span>
                                      <span>
                                        {Object.entries(face.attributes.age)
                                          .sort(([, a], [, b]) => b - a)
                                          .slice(0, 1)
                                          .map(([age, score]) => (
                                            `${age} (${Math.round(score * 100)}%)`
                                          ))}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {face.attributes.emotion && (
                                    <div className="bg-gray-50 p-1 rounded">
                                      <span className="block font-medium">Emotion</span>
                                      <span>
                                        {Object.entries(face.attributes.emotion)
                                          .sort(([, a], [, b]) => b - a)
                                          .slice(0, 1)
                                          .map(([emotion, score]) => (
                                            `${emotion} (${Math.round(score * 100)}%)`
                                          ))}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Celebrity matches from specific_models */}
                  {result.specific_models && Object.keys(result.specific_models)
                    .filter(key => key.startsWith('nudity-'))
                    .length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Content Analysis
                      </h4>
                      
                      <div className="space-y-2">
                        {Object.entries(result.specific_models)
                          .filter(([key]) => key.startsWith('nudity-'))
                          .sort(([, a], [, b]) => b - a)
                          .map(([key, score]) => {
                            const label = key === 'nudity-raw' ? 'General Detection' : 
                                         key === 'nudity-artificial' ? 'Artificial Content' : key;
                            return (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600">{label}</span>
                                <span className={getScoreColor(score)}>
                                  {Math.round(score * 100)}%
                                </span>
                              </div>
                            );
                          })}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Artificial content detection can help identify manipulated images
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 mt-4 bg-blue-50 p-3 rounded-lg">
                    <p>
                      <span className="font-medium">How this works:</span> We analyze face properties, 
                      unusual patterns, and content detection signals to estimate manipulation probability. 
                      Higher face scores and artificial content detection suggest possible manipulation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="mb-2">
                  <strong>How to interpret results:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="text-green-600 font-medium">0-30%</span>: Low probability</li>
                  <li><span className="text-yellow-600 font-medium">30-70%</span>: Medium probability, may contain manipulated elements</li>
                  <li><span className="text-red-600 font-medium">70-100%</span>: High probability of manipulation or AI generation</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIImageDetection; 