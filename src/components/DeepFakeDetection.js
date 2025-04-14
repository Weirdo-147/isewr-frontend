import React, { useState, useRef } from 'react';

const DeepFakeDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectionMode, setDetectionMode] = useState('standard');
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [fileType, setFileType] = useState(''); // 'image' or 'video'
  const mediaRef = useRef(null);

  const detectionModes = [
    { id: 'standard', name: 'Standard', icon: '🔍', description: 'Balanced detection for most cases' },
    { id: 'aggressive', name: 'Aggressive', icon: '⚡', description: 'Higher accuracy but slower processing' },
    { id: 'lightweight', name: 'Lightweight', icon: '🚀', description: 'Faster processing for quick checks' },
    { id: 'detailed', name: 'Detailed', icon: '📊', description: 'Comprehensive analysis with metrics' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
    setProgress(0);
    
    // Determine if it's an image or video
    if (file.type.startsWith('image/')) {
      setFileType('image');
    } else if (file.type.startsWith('video/')) {
      setFileType('video');
    } else {
      alert('Please select an image or video file');
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      let response;
      
      // Call different endpoints based on file type
      if (fileType === 'image') {
        // For images, use the SightEngine deepfake API
        formData.append('threshold', confidenceThreshold / 100); // Convert percent to 0-1 scale
        response = await fetch('http://localhost:8000/detect-deepfake-image', {
          method: 'POST',
          body: formData,
        });
      } else if (fileType === 'video') {
        // For videos, use the mock video deepfake detection
        formData.append('mode', detectionMode);
        formData.append('threshold', confidenceThreshold);
        response = await fetch('http://localhost:8000/detect-deepfake', {
          method: 'POST',
          body: formData,
        });
      }
      
      const data = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if ((fileType === 'image' && data.success) || (fileType === 'video' && data.success)) {
        // Handle the different response formats
        if (fileType === 'image') {
          // Transform image API response to match video format for UI
          setAnalysis({
            confidence: Math.round(data.face_manipulation_score * 100),
            face_confidence: Math.round(data.face_manipulation_score * 100),
            lip_sync_confidence: 0, // Not applicable for images
            motion_confidence: 0,   // Not applicable for images
            findings: [
              data.is_face_manipulated ? 
                "Face manipulation detected - likely a deepfake" : 
                "No face manipulation detected - likely authentic",
              data.face_details ? 
                `Detected ${data.face_details.count} face(s) in the image` : 
                "No faces detected in the image",
              "Analysis focused on detecting face manipulation in still images"
            ]
          });
        } else {
          // For videos, use the response directly
          setAnalysis(data);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-red-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-3">DeepFake Detection</h1>
          <p className="text-xl text-gray-500 mb-8">Advanced AI-powered detection of manipulated media</p>
          
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800 mb-1">How it works</h3>
                <p className="text-gray-500">Upload an image or video and our AI will analyze it for signs of manipulation using advanced detection algorithms.</p>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">About Deepfake Detection</h3>
              <p className="text-gray-600 mb-4">
                Deepfakes are synthetic media where a person's likeness is replaced with someone else's using AI techniques. LensLynx uses multiple detection methods:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li><span className="font-medium">Facial Analysis:</span> Detects inconsistencies and artifacts in facial features</li>
                <li><span className="font-medium">Temporal Coherence:</span> Analyzes frame-to-frame consistency in videos</li>
                <li><span className="font-medium">Metadata Verification:</span> Examines digital signatures that may indicate manipulation</li>
                <li><span className="font-medium">Neural Network Analysis:</span> Uses deep learning to identify patterns common in synthetic media</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Only show the settings panel if a file is selected */}
          {selectedFile && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Detection Settings</h2>
                  
                  <div className="space-y-4">
                    {/* Only show detection modes for videos */}
                    {(fileType === 'video') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detection Mode
                        </label>
                        <div className="space-y-2">
                          {detectionModes.map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setDetectionMode(mode.id)}
                              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                                detectionMode === mode.id
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span className="text-2xl mr-3">{mode.icon}</span>
                              <div>
                                <div className="font-medium">{mode.name}</div>
                                <div className="text-sm text-gray-500">{mode.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confidence Threshold
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="90"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-right">{confidenceThreshold}%</div>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Active Detection Features</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Face Analysis
                        </li>
                        {fileType === 'video' && (
                          <>
                            <li className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Lip Sync Detection
                            </li>
                            <li className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Motion Analysis
                            </li>
                          </>
                        )}
                        {fileType === 'image' && (
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Digital Artifact Detection
                          </li>
                        )}
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Metadata Analysis
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={selectedFile ? "lg:col-span-3" : "lg:col-span-4"}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Upload Image or Video
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
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">Images (JPG, PNG) or Videos (MP4, MOV, AVI) up to 100MB</p>
                    </div>
                  </div>
                </div>

                {preview && (
                  <div className="mb-6">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      {fileType === 'video' ? (
                        <video
                          ref={mediaRef}
                          src={preview}
                          controls
                          className="w-full h-auto"
                        ></video>
                      ) : (
                        <img
                          ref={mediaRef}
                          src={preview}
                          alt="Preview"
                          className="w-full h-auto"
                        />
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                    !selectedFile || loading
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
                  ) : `Analyze ${fileType === 'image' ? 'Image' : fileType === 'video' ? 'Video' : 'Media'}`}
                </button>

                {loading && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Analysis Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {analysis && (
                  <div className="mt-8">
                    <h2 className="text-xl font-medium text-gray-800 mb-3">Analysis Results</h2>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-800">Overall Assessment</h3>
                          <span className={`text-lg font-medium ${getConfidenceColor(analysis.confidence)}`}>
                            {analysis.confidence}% Confidence
                          </span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Face Manipulation</span>
                              <span className={getConfidenceColor(analysis.face_confidence)}>
                                {analysis.face_confidence}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${analysis.face_confidence}%` }}
                              ></div>
                            </div>
                          </div>
                          {fileType === 'video' && (
                            <>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Lip Sync Analysis</span>
                                  <span className={getConfidenceColor(analysis.lip_sync_confidence)}>
                                    {analysis.lip_sync_confidence}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${analysis.lip_sync_confidence}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Motion Consistency</span>
                                  <span className={getConfidenceColor(analysis.motion_confidence)}>
                                    {analysis.motion_confidence}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${analysis.motion_confidence}%` }}
                                  ></div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Detailed Findings</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {analysis.findings.map((finding, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-4 h-4 mr-2 mt-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Advanced Detection</h3>
            <p className="text-gray-500">Uses multiple AI models to detect subtle signs of manipulation in both images and videos.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Detailed Analysis</h3>
            <p className="text-gray-500">Provides comprehensive metrics and findings for each analysis.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Fast Processing</h3>
            <p className="text-gray-500">Quick analysis with real-time progress tracking for immediate results.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepFakeDetection; 