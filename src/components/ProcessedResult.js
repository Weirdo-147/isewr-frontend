import React from 'react';

const ProcessedResult = ({ processedImage }) => {
  if (!processedImage) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-medium text-gray-800 mb-3">Result</h2>
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
        {processedImage && (
          <div className="flex items-center justify-center bg-white rounded-xl p-6 relative">
            <img 
              src={processedImage} 
              alt="Processed Result" 
              className="max-w-full max-h-96 object-contain rounded-lg" 
              style={{ backgroundColor: 'transparent' }}
            />
            
            <a 
              href={processedImage}
              download={`processed-image-${Date.now()}.png`}
              className="absolute bottom-8 right-8 bg-blue-500 text-black rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessedResult; 