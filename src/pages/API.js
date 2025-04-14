import React from 'react';

const API = () => {
  const endpoints = [
    {
      name: 'Image Recognition',
      endpoint: '/api/v1/recognition',
      method: 'POST',
      description: 'Analyze images and detect objects, faces, and scenes',
      request: {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: {
          image: 'File (required)',
          category: 'String (optional)',
          confidence: 'Number (optional)',
        },
      },
      response: {
        success: {
          status: 200,
          body: {
            objects: [
              {
                label: 'person',
                confidence: 0.95,
                boundingBox: { x: 100, y: 100, width: 200, height: 300 },
              },
            ],
            scene: 'indoor',
            tags: ['people', 'office', 'business'],
          },
        },
        error: {
          status: 400,
          body: {
            error: 'Invalid image format',
            message: 'Please provide a valid image file',
          },
        },
      },
    },
    {
      name: 'Video Conversion',
      endpoint: '/api/v1/video/convert',
      method: 'POST',
      description: 'Convert images to videos with various effects and animations',
      request: {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: {
          image: 'File (required)',
          animation: 'String (required)',
          duration: 'Number (required)',
          effect: 'String (optional)',
        },
      },
      response: {
        success: {
          status: 200,
          body: {
            videoUrl: 'https://api.imaginairy.com/videos/123.mp4',
            duration: 10,
            format: 'mp4',
          },
        },
        error: {
          status: 400,
          body: {
            error: 'Invalid parameters',
            message: 'Please provide all required parameters',
          },
        },
      },
    },
    {
      name: 'Image Processing',
      endpoint: '/api/v1/processing',
      method: 'POST',
      description: 'Apply various filters and effects to images',
      request: {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: {
          image: 'File (required)',
          filters: 'Array (optional)',
          adjustments: {
            brightness: 'Number (optional)',
            contrast: 'Number (optional)',
            saturation: 'Number (optional)',
          },
        },
      },
      response: {
        success: {
          status: 200,
          body: {
            processedImageUrl: 'https://api.imaginairy.com/images/123.jpg',
            metadata: {
              width: 1920,
              height: 1080,
              format: 'jpg',
            },
          },
        },
        error: {
          status: 400,
          body: {
            error: 'Processing failed',
            message: 'Unable to process the image',
          },
        },
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">API Documentation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Integrate ImaginAIry's powerful features into your applications
          </p>
        </div>

        {/* Authentication */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Authentication</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-600 mb-4">
              All API requests require authentication using an API key. Include your API key in the request headers:
            </p>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <code className="text-sm text-gray-800">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </pre>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Endpoints</h2>
          <div className="space-y-8">
            {endpoints.map((endpoint) => (
              <div key={endpoint.name} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{endpoint.name}</h3>
                  <span className="px-3 py-1 text-sm font-medium text-white bg-yellow-500 rounded-full">
                    {endpoint.method}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{endpoint.description}</p>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <code className="text-sm text-gray-800">{endpoint.endpoint}</code>
                </div>

                {/* Request */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Request</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Headers</h5>
                    <pre className="text-sm text-gray-800 mb-4">
                      <code>{JSON.stringify(endpoint.request.headers, null, 2)}</code>
                    </pre>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Body</h5>
                    <pre className="text-sm text-gray-800">
                      <code>{JSON.stringify(endpoint.request.body, null, 2)}</code>
                    </pre>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Response</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Success Response</h5>
                    <pre className="text-sm text-gray-800 mb-4">
                      <code>{JSON.stringify(endpoint.response.success, null, 2)}</code>
                    </pre>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Error Response</h5>
                    <pre className="text-sm text-gray-800">
                      <code>{JSON.stringify(endpoint.response.error, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Limits */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Rate Limits</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-600 mb-4">
              API rate limits are based on your subscription plan:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Free: 100 requests per day</li>
              <li>Pro: 1,000 requests per day</li>
              <li>Enterprise: Custom limits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default API; 