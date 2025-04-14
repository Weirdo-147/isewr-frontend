import React, { useState, useEffect, useRef } from 'react';

const VideoConvert = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [conversionId, setConversionId] = useState(null);
  const [conversionStatus, setConversionStatus] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('kling-1.0-pro');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [error, setError] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalIdRef = useRef(null);

  // Available styles from the imagine.art API
  const styles = [
    { id: 'kling-1.0-pro', name: 'Kling 1.0 Pro', description: 'High-quality professional video style' },
    { id: 'kling-1.0-standard', name: 'Kling 1.0 Standard', description: 'Standard quality video style' },
    { id: 'kling-1.5', name: 'Kling 1.5', description: 'Enhanced modern video style' },
    { id: 'imagine-v1', name: 'Imagine V1', description: 'Creative artistic style' },
    { id: 'imagine-v2', name: 'Imagine V2', description: 'Advanced artistic style' },
    { id: 'hailuo-ai', name: 'Hailuo AI', description: 'Contemporary AI-optimized style' },
    { id: 'hailuo-live-ai', name: 'Hailuo Live AI', description: 'Dynamic live-action style' }
  ];

  // Available aspect ratios
  const aspectRatios = [
    { id: '1:1', name: 'Square (1:1)', description: 'Perfect for social media posts' },
    { id: '16:9', name: 'Landscape (16:9)', description: 'Ideal for YouTube and desktop viewing' },
    { id: '9:16', name: 'Portrait (9:16)', description: 'Best for mobile and TikTok/Instagram Stories' }
  ];

  // Example API usage based on documentation
  const apiUsageExample = `
// Example API usage from documentation
import requests

url = "https://api.vyro.ai/v2/video/image-to-video"

payload={}
files=[
  ('file',('image.jpg',open('path/to/image.jpg','rb'),'image/jpeg')),
  ('prompt', (None, 'A futuristic cityscape at night with neon lights')),
  ('style', (None, 'kling-1.0-pro')),
  ('aspect_ratio', (None, '1:1'))
]
headers = {
  'Authorization': 'Bearer {API_TOKEN}'
}

response = requests.request("POST", url, headers=headers, data=payload, files=files)
  `;

  // Effect to poll for video conversion status
  useEffect(() => {
    if (conversionId && (conversionStatus === 'pending' || conversionStatus === 'processing')) {
      // Set start time if not already set
      if (!startTime) {
        setStartTime(Date.now());
      }
      
      intervalIdRef.current = setInterval(async () => {
        try {
          // Increment request count to track how many times we've polled
          setRequestCount(prev => prev + 1);
          
          // Calculate how long we've been polling
          const elapsedMinutes = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;
          
          // If we've been polling for more than 30 minutes, show a timeout error
          if (elapsedMinutes > 30) {
            setError(`The conversion process is taking longer than expected (${elapsedMinutes} minutes). 
                     The imagine.art API may be experiencing issues or your request might be in a queue. 
                     You can continue waiting or try again later.`);
            // Keep polling but slow it down
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = setInterval(() => fetchStatus(), 10000); // Check every 10 seconds instead
            return;
          }
          
          await fetchStatus();
        } catch (error) {
          console.error('Error checking conversion status:', error);
          setError('Error checking conversion status. Will retry automatically.');
        }
      }, 3000); // Check every 3 seconds
    }
    
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [conversionId, conversionStatus, startTime]);
  
  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/convert/${conversionId}`);
      const data = await response.json();
      
      setConversionStatus(data.status);
      
      if (data.status === 'pending') {
        setProgress(10);
      } else if (data.status === 'processing') {
        // Update progress based on elapsed time to give user feedback
        // Assuming 15 minutes for processing, increase progress proportionally
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const estimatedTotal = 15 * 60; // 15 minutes in seconds
        const calculatedProgress = Math.min(90, Math.floor((elapsed / estimatedTotal) * 80) + 10);
        setProgress(calculatedProgress);
      } else if (data.status === 'completed') {
        setProgress(100);
        setVideoUrl(data.video_url);
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        setLoading(false);
      } else if (data.status === 'failed') {
        setError(`Conversion failed. This might be due to server issues or API limitations. 
                 Try using a different image or prompt, or check your API key configuration.`);
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchStatus:', error);
      // Don't set error here to avoid too many error messages
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setVideoUrl(null);
      setProgress(0);
      setConversionId(null);
      setConversionStatus(null);
      setError(null);
      setRequestCount(0);
      setStartTime(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedImage || !prompt) {
      setError('Please select an image and enter a prompt');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setRequestCount(0);
    setStartTime(Date.now());
    
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('prompt', prompt);
    formData.append('style', selectedStyle);
    formData.append('aspect_ratio', aspectRatio);

    try {
      const response = await fetch('http://localhost:8000/convert', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error starting conversion');
      }
      
      const data = await response.json();
      
      setConversionId(data.id);
      setConversionStatus(data.status);
      setProgress(5);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to start conversion');
      setLoading(false);
    }
  };

  // Calculate information to show to user
  const calculateTimeInfo = () => {
    if (!startTime) return '';
    
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    
    return `Time elapsed: ${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-3">Image to Video Converter</h1>
          <p className="text-xl text-gray-500 mb-8">Transform your images into stunning videos with AI-powered motion</p>
          
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800 mb-1">How it works</h3>
                <p className="text-gray-500">Upload an image, add a descriptive prompt, select a style and aspect ratio, then create a beautiful video in minutes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Video Settings</h2>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Prompt (required)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the motion and style for your video..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    A detailed prompt helps the AI create better videos
                  </p>
                </div>

                <h2 className="text-lg font-medium text-gray-800 mb-4">Video Style</h2>
                <div className="space-y-2 mb-6">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        selectedStyle === style.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-sm text-gray-500">{style.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <h2 className="text-lg font-medium text-gray-800 mb-4">Aspect Ratio</h2>
                <div className="space-y-2 mb-6">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        aspectRatio === ratio.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{ratio.name}</div>
                        <div className="text-sm text-gray-500">{ratio.description}</div>
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

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={!selectedImage || loading || !prompt}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                    !selectedImage || loading || !prompt
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
                      {conversionStatus === 'pending' ? 'Starting conversion...' : 
                       conversionStatus === 'processing' ? 'Processing video...' : 
                       'Creating Video...'}
                    </span>
                  ) : 'Create Video'}
                </button>

                {loading && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 text-center space-y-1">
                      <p>
                        {conversionStatus === 'pending' ? 'Starting conversion process...' : 
                        conversionStatus === 'processing' ? 'Creating your video (this usually takes 10-15 minutes)...' : 
                        ''}
                      </p>
                      <p>{calculateTimeInfo()}</p>
                      <p>API Requests: {requestCount}</p>
                      {startTime && (Date.now() - startTime) > 15 * 60 * 1000 && (
                        <p className="text-yellow-600 font-medium">
                          This is taking longer than usual. The imagine.art API might be experiencing high demand.
                          You can continue waiting or try again later.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {videoUrl && (
                  <div className="mt-8">
                    <h2 className="text-xl font-medium text-gray-800 mb-3">Your Video is Ready!</h2>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <video 
                        controls 
                        className="w-full h-auto rounded"
                        src={videoUrl}
                        onError={(e) => {
                          console.error("Video loading error:", e);
                          setError("Unable to load video. The URL might be invalid or the video format is not supported.");
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                      
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        <p className="font-medium">Video URL (for troubleshooting):</p>
                        <code className="break-all">{videoUrl}</code>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a 
                          href={videoUrl} 
                          download="video.mp4"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Download Video
                        </a>
                        <a 
                          href={videoUrl.replace("/object/public/", "/object/sign/")} 
                          download="video.mp4"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          Try Alternate Download
                        </a>
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setPreview(null);
                            setVideoUrl(null);
                            setProgress(0);
                            setConversionId(null);
                            setConversionStatus(null);
                            setError(null);
                            setRequestCount(0);
                            setStartTime(null);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          Create New Video
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConvert; 