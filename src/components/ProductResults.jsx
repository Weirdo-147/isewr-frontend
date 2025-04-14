import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const ProductResults = ({ products, reset }) => {
  const [searchResults, setSearchResults] = useState({});
  const [loading, setLoading] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [activeProduct, setActiveProduct] = useState(null);

  useEffect(() => {
    // Log environment variables
    console.log("Environment variables check:");
    console.log("REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    
    // Reset the active product when products change
    if (products.length > 0) {
      // Create a default generic product option
      const genericProduct = {
        name: products[0].name,
        score: 1.0,
        isGeneric: true
      };
      setActiveProduct(genericProduct);
    } else {
      setActiveProduct(null);
    }
    
    // Reset search results when products change
    setSearchResults({});
    setLoading({});
  }, [products]);

  useEffect(() => {
    // Search for active product when it changes or tab changes
    if (activeProduct) {
      const searchType = tabValue === 1 ? "images" : tabValue === 2 ? "videos" : "web";
      const cacheKey = `${activeProduct.name}_${searchType}`;
      
      // Only fetch if we don't have this specific search type result cached
      if (!searchResults[cacheKey]) {
        fetchSerpResults(activeProduct.name, searchType);
      }
    }
  }, [activeProduct, tabValue, searchResults]);

  const fetchSerpResults = async (query, searchType) => {
    const cacheKey = `${query}_${searchType}`;
    if (searchResults[cacheKey]) return;
    
    setLoading(prev => ({ ...prev, [cacheKey]: true }));
    console.log(`Attempting to fetch SerpAPI ${searchType} results for:`, query);
    
    try {
      const apiUrl = `${API_URL}/serp-search`;
      console.log("Calling API endpoint:", apiUrl);
      
      const response = await axios.post(apiUrl, {
        query: query + " product",
        search_type: searchType
      });
      
      console.log("SerpAPI response:", response);
      
      if (response.data.success) {
        console.log(`SerpAPI ${searchType} search successful:`, response.data);
        setSearchResults(prev => ({
          ...prev,
          [cacheKey]: response.data
        }));
      } else {
        console.error("Error fetching search results:", response.data.error);
      }
    } catch (error) {
      console.error(`Error during SerpAPI ${searchType} search:`, error);
      // Show more details about the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
    } finally {
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  };

  const renderTabContent = () => {
    if (!activeProduct) return null;
    
    const query = activeProduct.name;
    const searchType = tabValue === 1 ? "images" : tabValue === 2 ? "videos" : "web";
    const cacheKey = `${query}_${searchType}`;
    const results = searchResults[cacheKey];
    const isLoading = loading[cacheKey];
    
    switch (tabValue) {
      case 0: // Web Results
        return (
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : results ? (
              results.organic_results && results.organic_results.length > 0 ? (
                <div className="space-y-6">
                  {results.organic_results.slice(0, 10).map((result, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-100">
                      {result.thumbnail && (
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <div className="w-20 h-20 overflow-hidden rounded border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <img 
                              src={result.thumbnail}
                              alt={result.title || 'Search result'} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        </a>
                      )}
                      <div className={result.thumbnail ? 'flex-1' : 'w-full'}>
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-lg font-medium"
                        >
                          {result.title}
                        </a>
                        <p className="text-sm text-gray-500 mb-1">
                          {result.displayed_link}
                        </p>
                        <p className="text-gray-700">
                          {result.snippet}
                        </p>
                        {result.rich_snippet && (
                          <div className="mt-2 text-sm text-gray-500">
                            {result.rich_snippet.top && (
                              <div className="italic">{result.rich_snippet.top.detected_extensions?.join(' · ')}</div>
                            )}
                            {result.rich_snippet.bottom && (
                              <div className="text-green-700">{result.rich_snippet.bottom.extensions?.join(' · ')}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 text-right">
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(activeProduct.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View more results on Google
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-4">No web results found in API response.</p>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 mb-4">
                    <p className="font-medium">Debug Info:</p>
                    <p>Response received: {results ? 'Yes' : 'No'}</p>
                    <p>Response keys: {results ? Object.keys(results).join(', ') : 'None'}</p>
                    <p>Organic results: {results && results.organic_results ? results.organic_results.length : 0}</p>
                  </div>
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Search on Google
                  </a>
                </div>
              )
            ) : (
              <p>Search for "{query}" to see results</p>
            )}
          </div>
        );
      
      case 1: // Images
        return (
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : results ? (
              (() => {
                // Check for images in both possible response formats
                const images = results.images_results || [];
                console.log("Images found:", images.length);
                
                return images.length > 0 ? (
                  <div>
                    <p className="mb-4 text-sm text-gray-600">
                      Showing product images for <span className="font-medium">{query}</span>. Click on any image to view the source.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.slice(0, 12).map((image, idx) => (
                        <div key={idx} className="rounded overflow-hidden shadow-md hover:shadow-lg">
                          <a href={image.original || image.link} target="_blank" rel="noopener noreferrer">
                            <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                              <img 
                                src={image.thumbnail} 
                                alt={image.title || 'Product image'} 
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150x150?text=Image+Not+Found';
                                }}
                              />
                            </div>
                            <div className="p-2 bg-gray-50">
                              <p className="text-xs truncate">
                                {image.source || image.title || ''}
                              </p>
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                    {images.length > 12 && (
                      <div className="mt-4 text-right">
                        <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View more images
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="mb-4">No image results found in API response.</p>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 mb-4">
                      <p className="font-medium">Debug Info:</p>
                      <p>Response received: {results ? 'Yes' : 'No'}</p>
                      <p>Response keys: {results ? Object.keys(results).join(', ') : 'None'}</p>
                      <p>Images results: {results && results.images_results ? results.images_results.length : 0}</p>
                    </div>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Search for images on Google
                    </a>
                  </div>
                )
              })()
            ) : (
              <p>Search for "{query}" to see results</p>
            )}
          </div>
        );
        
      case 2: // Videos
        return (
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : results ? (
              (() => {
                // Check for videos in both possible response formats
                const videos = results.videos_results || results.video_results || [];
                console.log("Videos found:", videos.length);
                
                return videos.length > 0 ? (
                  <div>
                    <p className="mb-4 text-sm text-gray-600">
                      Showing videos related to <span className="font-medium">{query}</span>. Click on any video to watch it.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.slice(0, 8).map((video, idx) => (
                        <div key={idx} className="flex rounded overflow-hidden shadow-md hover:shadow-lg border border-gray-200">
                          <a 
                            href={video.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block relative min-w-[120px] h-[120px] bg-gray-100"
                          >
                            <img 
                              src={video.thumbnail} 
                              alt={video.title || 'Video thumbnail'} 
                              className="w-full h-full object-cover absolute inset-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/120x120?text=Video';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black bg-opacity-50 rounded-full p-2">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                                </svg>
                              </div>
                            </div>
                          </a>
                          <div className="flex-1 p-3">
                            <a 
                              href={video.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm mb-1 hover:text-blue-600 line-clamp-2"
                            >
                              {video.title}
                            </a>
                            {video.snippet && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{video.snippet}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500 flex items-center">
                                {video.date && (
                                  <span className="mr-2">{video.date}</span>
                                )}
                                {video.duration && (
                                  <span className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    {video.duration}
                                  </span>
                                )}
                              </p>
                              {video.rich_snippet?.top?.extensions && (
                                <p className="text-xs text-gray-500">{video.rich_snippet.top.extensions[1]}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Key Moments Section - Show for the first video */}
                    {videos[0]?.key_moments && videos[0].key_moments.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-md font-medium mb-3">Key Moments from "{videos[0].title}"</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {videos[0].key_moments.map((moment, idx) => (
                            <a 
                              key={idx} 
                              href={moment.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-2 transition"
                            >
                              <div className="relative mb-2 bg-black rounded overflow-hidden">
                                <img 
                                  src={moment.thumbnail} 
                                  alt={moment.title}
                                  className="w-full h-20 object-cover opacity-90"
                                />
                                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                  {moment.time}
                                </div>
                              </div>
                              <p className="text-xs font-medium truncate">{moment.title}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-right">
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=vid`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View more videos on Google
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4">No video results found in API response.</p>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 mb-4">
                      <p className="font-medium">Debug Info:</p>
                      <p>Response received: {results ? 'Yes' : 'No'}</p>
                      <p>Response keys: {results ? Object.keys(results).join(', ') : 'None'}</p>
                      <p>Video results: {results && results.videos_results ? results.videos_results.length : 0}</p>
                      <p>Alternative video results: {results && results.video_results ? results.video_results.length : 0}</p>
                    </div>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=vid`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Search for videos on Google
                    </a>
                  </div>
                )
              })()
            ) : (
              <p>Search for "{query}" to see video results</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  const handleProductClick = (product) => {
    setActiveProduct(product);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
        Product Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                Detected Products
              </h3>
            </div>
            
            <div className="mb-3 p-3">
              <button 
                onClick={reset}
                className="w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-150 ease-in-out shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Try Another Image
              </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto px-3 pb-3">
              {/* Default generic option */}
              {products.length > 0 && (
                <div 
                  className={`mb-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeProduct && activeProduct.isGeneric
                      ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleProductClick({
                    name: products[0].name,
                    score: 1.0,
                    isGeneric: true
                  })}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-800 mb-1">
                      {products[0].name}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      Default
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Raw product name without modifications
                  </p>
                </div>
              )}
              
              {/* Existing detected products */}
              {products.map((product, index) => (
                <div 
                  key={index} 
                  className={`mb-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeProduct && !activeProduct.isGeneric && activeProduct.name === product.name 
                      ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-800 mb-1">
                      {product.name}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      product.score > 0.9 ? 'bg-green-100 text-green-800' : 
                      product.score > 0.8 ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(product.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  {product.objectSource && (
                    <p className="text-xs mt-1 text-gray-400 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {product.objectSource}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-9">
          {activeProduct ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex bg-gradient-to-r from-gray-50 to-white">
                  <button
                    onClick={() => setTabValue(0)}
                    className={`px-6 py-3 font-medium text-sm flex items-center ${
                      tabValue === 0 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                    </svg>
                    Web Results
                  </button>
                  <button
                    onClick={() => setTabValue(1)}
                    className={`px-6 py-3 font-medium text-sm flex items-center ${
                      tabValue === 1 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Images
                  </button>
                  <button
                    onClick={() => setTabValue(2)}
                    className={`px-6 py-3 font-medium text-sm flex items-center ${
                      tabValue === 2
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Videos
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-medium text-gray-800">
                    {activeProduct.name}
                  </h3>
                  <span className="ml-2 text-sm bg-blue-50 text-blue-700 py-0.5 px-2 rounded-full">
                    {(activeProduct.score * 100).toFixed(0)}% confidence
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  {renderTabContent()}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="mb-2 sm:mb-0">
                    <span className="text-sm font-semibold text-gray-600 mr-3">
                      Shop Online:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href={`https://www.amazon.com/s?k=${encodeURIComponent(activeProduct.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 px-3 py-1.5 text-sm rounded-md hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 transition"
                    >
                      <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.5 4C12.8755 4 11.5 5.37547 11.5 7C11.5 8.62453 12.8755 10 14.5 10C16.1245 10 17.5 8.62453 17.5 7C17.5 5.37547 16.1245 4 14.5 4ZM14.5 9C13.3955 9 12.5 8.10453 12.5 7C12.5 5.89547 13.3955 5 14.5 5C15.6045 5 16.5 5.89547 16.5 7C16.5 8.10453 15.6045 9 14.5 9Z" />
                        <path d="M18.5 11H10.5C9.39547 11 8.5 11.8955 8.5 13V19H9.5V13C9.5 12.4477 9.94772 12 10.5 12H18.5C19.0523 12 19.5 12.4477 19.5 13V19H20.5V13C20.5 11.8955 19.6045 11 18.5 11Z" />
                        <path d="M3.5 15.25C3.5 14.8358 3.83579 14.5 4.25 14.5H8.75C9.16421 14.5 9.5 14.8358 9.5 15.25V18.75C9.5 19.1642 9.16421 19.5 8.75 19.5H4.25C3.83579 19.5 3.5 19.1642 3.5 18.75V15.25ZM4.5 15.5V18.5H8.5V15.5H4.5Z" />
                      </svg>
                      Amazon
                    </a>
                    <a 
                      href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(activeProduct.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center bg-gradient-to-r from-red-50 to-red-100 text-red-800 px-3 py-1.5 text-sm rounded-md hover:from-red-100 hover:to-red-200 border border-red-200 transition"
                    >
                      <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.9999 3C7.02941 3 2.99994 7.02947 2.99994 12C2.99994 16.9705 7.02941 21 11.9999 21C16.9704 21 20.9999 16.9705 20.9999 12C20.9999 7.02947 16.9704 3 11.9999 3ZM11.9999 20C7.58165 20 3.99994 16.4183 3.99994 12C3.99994 7.58173 7.58165 4 11.9999 4C16.4182 4 19.9999 7.58173 19.9999 12C19.9999 16.4183 16.4182 20 11.9999 20Z" />
                        <path d="M12.0001 7C11.4478 7 11.0001 7.44772 11.0001 8V12C11.0001 12.5523 11.4478 13 12.0001 13H15.0001C15.5523 13 16.0001 12.5523 16.0001 12C16.0001 11.4477 15.5523 11 15.0001 11H13.0001V8C13.0001 7.44772 12.5523 7 12.0001 7Z" />
                      </svg>
                      eBay
                    </a>
                    <a 
                      href={`https://www.walmart.com/search/?query=${encodeURIComponent(activeProduct.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 px-3 py-1.5 text-sm rounded-md hover:from-blue-100 hover:to-blue-200 border border-blue-200 transition"
                    >
                      <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.99994 16H7.99994L8.99994 12H11.9999L10.9999 16H12.9999L13.9999 12H16.9999L15.9999 16H17.9999L18.9999 12H21.9999V10H19.4999L19.9999 8H21.9999V6H20.4999L21.9999 2H19.9999L18.4999 6H15.4999L16.9999 2H14.9999L13.4999 6H9.99994V8H12.9999L12.4999 10H8.99994V12H11.9999L10.9999 16H8.99994L7.99994 20H9.99994L10.9999 16H13.9999L14.9999 20H16.9999L15.9999 16H18.9999L19.9999 20H21.9999L20.9999 16H22.9999V14H20.4999L19.4999 10H16.4999L17.4999 8H20.4999L19.4999 6H16.4999L14.9999 10H11.9999L10.4999 6H7.49994L5.99994 16ZM14.9999 12L15.4999 10H18.4999L17.9999 12H14.9999Z" />
                      </svg>
                      Walmart
                    </a>
                    <a 
                      href={`https://shopping.google.com/search?q=${encodeURIComponent(activeProduct.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center bg-gradient-to-r from-green-50 to-green-100 text-green-800 px-3 py-1.5 text-sm rounded-md hover:from-green-100 hover:to-green-200 border border-green-200 transition"
                    >
                      <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18ZM7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L21.16 4.96L19.42 4H19.41L18.31 6L15.55 11H8.53L8.4 10.73L6.16 6L5.21 4L4.27 2H1V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.29 15 7.17 14.89 7.17 14.75Z" />
                      </svg>
                      Google Shopping
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center text-gray-500">
              <svg className="w-8 h-8 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-lg">Select a product from the list to view details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductResults; 