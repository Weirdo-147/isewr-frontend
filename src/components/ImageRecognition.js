import React, { useState, useEffect, useRef } from 'react';
import { uploadImage } from '../supabase';
import ProductResults from './ProductResults';
import { API_URL } from '../config';

// Add a throttling delay utility at the top of the file after imports
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function for retrying API calls with exponential backoff
const fetchWithRetry = async (url, options, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  let lastError;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      // If response is 429 (rate limit), wait longer before retrying
      if (response.status === 429) {
        console.warn(`Rate limit hit (429), retry ${retries + 1}/${maxRetries} after delay`);
        await delay(initialDelay * Math.pow(2, retries));
        retries++;
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`API request failed, retry ${retries + 1}/${maxRetries}`, error);
      await delay(initialDelay * Math.pow(2, retries));
      retries++;
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Request failed after multiple retries');
};

const ImageRecognition = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [recognitionId, setRecognitionId] = useState(null);
  const [recognitionResults, setRecognitionResults] = useState(null);
  const [celebrityResults, setCelebrityResults] = useState(null);
  const [productResults, setProductResults] = useState({});
  const [selectedObject, setSelectedObject] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isLoadingCelebrity, setIsLoadingCelebrity] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [serpResults, setSerpResults] = useState(null);
  const [serpTab, setSerpTab] = useState('images');
  const [isLoadingSerp, setIsLoadingSerp] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [googleLensResults, setGoogleLensResults] = useState(null);
  const [isLoadingGoogleLens, setIsLoadingGoogleLens] = useState(false);
  const [imageLensTab, setImageLensTab] = useState('all');
  const [isGoogleLensRequestInProgress, setIsGoogleLensRequestInProgress] = useState(false);
  const [lastSearchedImageUrl, setLastSearchedImageUrl] = useState(null);
  const [exactMatches, setExactMatches] = useState(null);
  const [isLoadingExactMatches, setIsLoadingExactMatches] = useState(false);
  const [visualMatches, setVisualMatches] = useState(null);
  const [isLoadingVisualMatches, setIsLoadingVisualMatches] = useState(false);
  const [productMatches, setProductMatches] = useState(null);
  const [isLoadingProductMatches, setIsLoadingProductMatches] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reset all previous results
      setGoogleLensResults(null);
      setExactMatches(null);
      setVisualMatches(null);
      setProductMatches(null);
      setImageLensTab('all'); // Reset to 'all' tab when a new image is uploaded
      setError(null);
      
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setRecognitionResults(null);
      setCelebrityResults(null);
      setProductResults({});
      setImageUrl(null);
      setRecognitionId(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setError(null);

    try {
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const filename = `${timestamp}_${selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload to Supabase
      const url = await uploadImage(selectedImage, filename);
      setImageUrl(url);
      
      console.log('Image uploaded successfully:', url);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRecognize = async () => {
    if (!imageUrl) return;

    setIsRecognizing(true);
    setError(null);

    try {      
      // Call the recognition endpoint
      const response = await fetch(`${API_URL}/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error(`Recognition failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setRecognitionResults(data);
      setRecognitionId(data.recognition_id);
      
      console.log('Recognition results:', data);
    } catch (error) {
      console.error('Error recognizing image:', error);
      setError('Failed to recognize image. Please try again.');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleCelebrityDetection = async () => {
    if (!imageUrl) return;

    setIsLoadingCelebrity(true);
    setError(null);

    try {      
      // Call the celebrity detection endpoint
      const response = await fetch(`${API_URL}/celebrity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error(`Celebrity detection failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setCelebrityResults(data);
      
      console.log('Celebrity detection results:', data);
    } catch (error) {
      console.error('Error detecting celebrities:', error);
      setError('Failed to detect celebrities. Please try again.');
    } finally {
      setIsLoadingCelebrity(false);
    }
  };

  const handleProductSearch = async (objectName) => {
    if (!objectName) return;

    setSelectedObject(objectName);
    setExpandedProduct(null); // Reset expanded product when searching for a new one
    setSerpResults(null); // Reset SERP results
    setIsLoadingProducts(true);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      // Call the products endpoint with both object name and image URL
      const response = await fetch(`${backendUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          object_name: objectName,
          image_url: imageUrl, // Include the image URL for better context
          description: recognitionResults?.scene_description || "" // Include the scene description for context
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Product search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store products by object name
      setProductResults(prev => ({
        ...prev,
        [objectName]: data.products
      }));
      
      console.log(`Product results for ${objectName}:`, data);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to search for products. Please try again.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchSerpResults = async (query) => {
    if (!query) return;
    
    setIsLoadingSerp(true);
    try {      
      const response = await fetch(`${API_URL}/serp-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`SERP search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setSerpResults(data);
      console.log('SERP results:', data);
    } catch (error) {
      console.error('Error fetching SERP results:', error);
    } finally {
      setIsLoadingSerp(false);
    }
  };

  /* eslint-disable no-undef */
  const handleExpandProduct = (product) => {
    setExpandedProduct(product);
    fetchSerpResults(product.name.split('-')[0].trim());
  };
  /* eslint-enable no-undef */

  // Enhanced function to extract specific products from description
  const extractProductsFromDescription = (text) => {
    if (!text) return [];
    
    // Initialize results array
    const products = [];
    
    // Look for specific product patterns (e.g., year + make + model)
    const yearMakeModelPattern = /(19|20)\d{2}\s+[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+/g;
    const yearMakeModels = text.match(yearMakeModelPattern) || [];
    
    // Look for "Brand + Model" patterns (2+ capitalized words in sequence)
    const brandModelPattern = /\b[A-Z][a-zA-Z]*\s+[A-Z][a-zA-Z]*(\s+[A-Z][a-zA-Z]*){0,3}\b/g;
    const brandModels = text.match(brandModelPattern) || [];
    
    // Look for product identifiers like "Model X", "iPhone 14", "Galaxy S23"
    const productIdPattern = /\b([A-Z][a-z]+\s+(([A-Z0-9])|([A-Z][a-z]*))(\s*\d*\.?\d+)?)\b/g;
    const productIds = text.match(productIdPattern) || [];
    
    // Extract specific numbered models (like "RTX 3080", "PS5", "Xbox Series X")
    const modelNumberPattern = /\b([A-Z]+[\s-]?\d{1,4}(\s?[A-Z]+)?|[A-Z]+\s+Series\s+[A-Z])\b/g;
    const modelNumbers = text.match(modelNumberPattern) || [];
    
    // Combine all matches and remove duplicates
    const allMatches = [...yearMakeModels, ...brandModels, ...productIds, ...modelNumbers];
    const uniqueMatches = [...new Set(allMatches)];
    
    // Filter out common false positives
    const falsePositives = ["The Image", "The Car", "This Image", "The Picture", "The Scene"];
    const filteredMatches = uniqueMatches.filter(match => 
      !falsePositives.some(fp => match.includes(fp))
    );
    
    return filteredMatches;
  };

  // Enhanced function to extract key terms with better product recognition
  const extractKeyTerms = (text) => {
    if (!text) return [];
    
    // Common product categories and consumer items to look for
    const productTerms = [
      'bottle', 'shoes', 'phone', 'camera', 'computer', 'laptop', 'bag', 'watch', 
      'headphones', 'speaker', 'tv', 'television', 'monitor', 'tablet', 'chair', 
      'desk', 'table', 'sofa', 'furniture', 'clothing', 'shirt', 'pants', 'dress', 
      'jacket', 'coat', 'hat', 'glasses', 'sunglasses', 'jewelry', 'car', 'bicycle', 'book',
      'motorcycle', 'drone', 'game console', 'sneakers', 'guitar', 'instrument'
    ];
    
    // Clean and normalize text
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    // Find matches with common product terms
    const matches = [];
    productTerms.forEach(term => {
      if (lowerText.includes(term) && !matches.includes(term)) {
        matches.push(term);
      }
    });
    
    // Extract brand names (capitalized words)
    const brands = text.match(/\b[A-Z][a-z]+\b/g) || [];
    const filteredBrands = brands.filter(brand => 
      brand.length > 2 && 
      !['The', 'This', 'It', 'A', 'An', 'And', 'In', 'On', 'At', 'Of', 'With'].includes(brand)
    );
    
    // Look for model years (19XX or 20XX)
    const years = text.match(/\b(19|20)\d{2}\b/g) || [];
    
    // Look for color terms
    const colorTerms = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'silver', 'gold', 'gray', 'grey', 'brown'];
    const colors = [];
    colorTerms.forEach(color => {
      if (lowerText.includes(color) && !colors.includes(color)) {
        colors.push(color);
      }
    });
    
    // Combine unique terms
    return [...new Set([...matches, ...filteredBrands, ...years, ...colors])];
  };

  // Extract product names from OCR text - Updated with better brand detection
  const extractProductsFromOCR = (text) => {
    if (!text) return [];
    
    // Try to identify product names and brands in OCR text
    const lines = text.split('\n');
    const products = [];
    
    // Brand patterns (all caps or title case)
    const brandPatterns = [
      /\b[A-Z]{2,}\b/, // ALL CAPS
      /\b[A-Z][a-z]+\b/, // Title Case
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/ // Brand + Model (Title Case)
    ];
    
    // Product identifiers (e.g., model numbers)
    const productIdentifiers = [
      /\b[A-Z0-9]{2,}\b/, // Alphanumeric codes like "GTX1080"
      /\b[A-Z][A-Za-z]*[\-\s]?\d{1,4}\b/, // Pattern like "iPhone 13" or "S-21"
      /\b\d{2,4}[A-Z]{1,2}\b/ // Pattern like "3080Ti"
    ];
    
    for (const line of lines) {
      // Skip very short lines or lines with just numbers
      if (line.length < 3 || /^\d+(\.\d+)?$/.test(line)) continue;
      
      // Check for brand patterns
      for (const pattern of brandPatterns) {
        const matches = line.match(pattern) || [];
        for (const match of matches) {
          if (match.length > 2 && 
              !['THE', 'AND', 'FOR', 'WITH', 'OF'].includes(match.toUpperCase()) && 
              !products.includes(match)) {
            products.push(match);
          }
        }
      }
      
      // Check for product identifiers
      for (const pattern of productIdentifiers) {
        const matches = line.match(pattern) || [];
        for (const match of matches) {
          if (!products.includes(match)) {
            products.push(match);
          }
        }
      }
    }
    
    return products.slice(0, 5); // Limit to top 5 to avoid too many
  };

  // Function to detect specific products - enhanced with better patterns
  const isSpecificProduct = (text) => {
    // Pattern for Year + Make + Model (e.g., "1968 Dodge Charger")
    const hasYearMakeModel = /(19|20)\d{2}\s+[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+/.test(text);
    
    // Pattern for Brand + Model (e.g., "Sony PlayStation 5")
    const hasBrandModel = /\b[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+\b/.test(text);
    
    // Pattern for Model with numbers (e.g., "iPhone 14 Pro" or "GTX 3080")
    const hasModelNumbers = /\b[A-Za-z]+\s+\d+(\s+[A-Za-z]+)?\b|\b[A-Z]+\d{3,4}\b/.test(text);
    
    // Pattern for specific products with slashes or hyphens (e.g., "Canon EOS R5" or "BMW M3")
    const hasSpecialFormat = /\b[A-Z][a-zA-Z]+[\s-][A-Z0-9][^\s]*\b/.test(text);
    
    return hasYearMakeModel || hasBrandModel || hasModelNumbers || hasSpecialFormat;
  };

  // Products display component
  const ProductResultsDisplay = ({ objectName, products }) => (
    <div key={objectName} className="mb-6">
      <div className="flex items-center mb-4">
        <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-3 py-1 rounded-full">
          {objectName}
        </span>
        <h4 className="font-medium text-gray-700">Products</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <div 
            key={index} 
            className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white hover:bg-gray-50 cursor-pointer"
            onClick={() => handleExpandProduct(product)}
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-gray-800 text-md">{product.name}</h5>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                product.store === 'Amazon' ? 'bg-yellow-100 text-yellow-800' :
                product.store === 'eBay' ? 'bg-red-100 text-red-800' :
                product.store === 'Walmart' ? 'bg-blue-100 text-blue-800' :
                product.store === 'Target' ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}>
                {product.store}
              </span>
            </div>
            
            <p className="text-green-600 font-medium mb-2">{product.price}</p>
            
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-gray-500">
                Relevance: {Math.round(product.score * 100)}%
              </div>
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 border border-yellow-600 text-sm leading-4 font-medium rounded-md text-gray-900 bg-yellow-500 hover:bg-yellow-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                onClick={(e) => e.stopPropagation()}
              >
                Shop Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Expanded product view with SerpAPI results
  const ExpandedProductView = ({ product }) => {
    if (!product) return null;

    return (
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-medium text-gray-800">{product.name}</h3>
          <button 
            onClick={() => setExpandedProduct(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className={`text-sm font-semibold px-3 py-1 rounded ${
              product.store === 'Amazon' ? 'bg-yellow-100 text-yellow-800' :
              product.store === 'eBay' ? 'bg-red-100 text-red-800' :
              product.store === 'Walmart' ? 'bg-blue-100 text-blue-800' :
              product.store === 'Target' ? 'bg-red-100 text-red-800' :
              'bg-green-100 text-green-800'
            }`}>
              {product.store}
            </span>
            <p className="text-green-600 font-medium">{product.price}</p>
          </div>

          <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-yellow-600 text-sm font-medium rounded-md text-gray-900 bg-yellow-500 hover:bg-yellow-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Shop Now at {product.store}
          </a>
        </div>

        {/* SERP Results Tabs */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setSerpTab('images')}
              className={`px-4 py-2 text-sm font-medium ${serpTab === 'images' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Images
            </button>
            <button
              onClick={() => setSerpTab('videos')}
              className={`px-4 py-2 text-sm font-medium ${serpTab === 'videos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Videos
            </button>
            <button
              onClick={() => setSerpTab('links')}
              className={`px-4 py-2 text-sm font-medium ${serpTab === 'links' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Links
            </button>
            <button
              onClick={() => setSerpTab('qa')}
              className={`px-4 py-2 text-sm font-medium ${serpTab === 'qa' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Q&A
            </button>
          </div>

          {/* Tab Content */}
          {isLoadingSerp ? (
            <div className="flex items-center justify-center py-10">
              <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading search results...</span>
            </div>
          ) : !serpResults ? (
            <div className="text-center py-8 text-gray-500">
              No results found. Try a different search term.
            </div>
          ) : (
            <div>
              {serpTab === 'images' && serpResults.images_results && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {serpResults.images_results.slice(0, 8).map((image, index) => (
                      <a 
                        key={index} 
                        href={image.original || image.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block rounded overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <img 
                          src={image.thumbnail} 
                          alt={image.title || 'Product image'} 
                          className="w-full h-32 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                  {serpResults.images_results.length > 8 && (
                    <div className="mt-3 text-right">
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(product.name)}&tbm=isch`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View more images
                      </a>
                    </div>
                  )}
                </div>
              )}

              {serpTab === 'videos' && serpResults.videos_results && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {serpResults.videos_results.slice(0, 4).map((video, index) => (
                      <a 
                        key={index} 
                        href={video.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block rounded overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="relative">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-60 rounded-full p-2">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50">
                          <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.source}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                  {serpResults.videos_results.length > 4 && (
                    <div className="mt-3 text-right">
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(product.name)}&tbm=vid`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View more videos
                      </a>
                    </div>
                  )}
                </div>
              )}

              {serpTab === 'links' && serpResults.organic_results && (
                <div>
                  <div className="space-y-4">
                    {serpResults.organic_results.slice(0, 5).map((result, index) => (
                      <a 
                        key={index} 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 rounded hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm text-gray-500">{result.displayed_link}</p>
                        <p className="text-blue-600 font-medium">{result.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{result.snippet}</p>
                      </a>
                    ))}
                  </div>
                  <div className="mt-3 text-right">
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(product.name)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View more links
                    </a>
                  </div>
                </div>
              )}

              {serpTab === 'qa' && serpResults.related_questions && (
                <div>
                  <div className="space-y-4">
                    {serpResults.related_questions.slice(0, 4).map((question, index) => (
                      <details key={index} className="bg-gray-50 rounded p-3">
                        <summary className="font-medium text-gray-800 cursor-pointer">{question.question}</summary>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600">{question.snippet}</p>
                          <a 
                            href={question.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 mt-1 block"
                          >
                            Source: {question.title}
                          </a>
                        </div>
                      </details>
                    ))}
                  </div>
                  <div className="mt-3 text-right">
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(product.name)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Search for more information
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const fetchGoogleLensResults = async () => {
    // If no image URL or the request is already in progress, do nothing
    if (!imageUrl || isGoogleLensRequestInProgress) return;
    
    // If we've already searched this exact image URL, use the cached results
    if (lastSearchedImageUrl === imageUrl && googleLensResults) {
      console.log('Using cached Google Lens results for the same image URL');
      return;
    }
    
    // Reset any previous results and errors
    setGoogleLensResults(null);
    setError(null);
    setIsLoadingGoogleLens(true);
    setIsGoogleLensRequestInProgress(true);
    
    // Reset tab-specific data when a new image is uploaded
    setExactMatches(null);
    setVisualMatches(null);
    setProductMatches(null);
    
    try {
      console.log(`Making Google Lens API request for image: ${imageUrl}`);
      
      // Use fetchWithRetry instead of regular fetch
      const response = await fetchWithRetry(
        `${API_URL}/google-lens`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: imageUrl }),
        }
      );
      
      // Handle specific status codes
      if (response.status === 429) {
        const errorText = await response.text();
        console.error('Google Lens rate limit exceeded:', errorText);
        throw new Error('API rate limit exceeded. Please wait a few minutes and try again.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Lens search failed with status: ${response.status}`, errorText);
        throw new Error(`Google Lens search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Google Lens results received successfully:', data);
      
      // Check if we have the expected data
      if (!data.search_results && !data.visual_matches) {
        console.warn('No visual matches found in Google Lens results');
      }
      
      // Track this successful search
      setLastSearchedImageUrl(imageUrl);
      
      // Set the results immediately
      setGoogleLensResults(data);
      setIsLoadingGoogleLens(false);
      setIsGoogleLensRequestInProgress(false);
      
      // Auto-load relevant content if available
      if (data.exact_matches && data.exact_matches.length > 0) {
        setExactMatches(data.exact_matches);
      }
      
      if (data.visual_matches && data.visual_matches.length > 0) {
        setVisualMatches(data.visual_matches);
      }
      
      if (data.products && data.products.length > 0) {
        setProductMatches(data.products);
      }
      
    } catch (error) {
      console.error('Error fetching Google Lens results:', error);
      setError(error.message || 'Failed to search using Google Lens. Please try again.');
      setGoogleLensResults(null);
      setIsLoadingGoogleLens(false);
      setIsGoogleLensRequestInProgress(false);
    }
  };

  const fetchExactMatches = async () => {
    // Check if we have Google Lens results with a page token
    if (!googleLensResults || !googleLensResults.exact_matches_page_token) {
      console.error('No exact matches page token available');
      return;
    }
    
    // If we already have exact matches, don't fetch again
    if (exactMatches) {
      console.log('Using cached exact matches');
      return;
    }
    
    setIsLoadingExactMatches(true);
    setExactMatches(null);
    
    try {
      console.log(`Making Google Lens Exact Matches API request with page token: ${googleLensResults.exact_matches_page_token}`);
      
      // Use fetchWithRetry instead of regular fetch
      const response = await fetchWithRetry(
        `${API_URL}/google-lens-exact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            image_url: imageUrl,
            page_token: googleLensResults.exact_matches_page_token
          }),
        }
      );
      
      // Handle rate limiting errors
      if (response.status === 429) {
        const errorText = await response.text();
        console.error('Google Lens Exact Matches rate limit exceeded:', errorText);
        throw new Error('API rate limit exceeded. Please wait a few minutes and try again.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Lens Exact Matches failed with status: ${response.status}`, errorText);
        throw new Error(`Google Lens Exact Matches failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Google Lens Exact Matches received successfully:', data);
      
      setExactMatches(data.exact_matches || []);
      setIsLoadingExactMatches(false);
    } catch (error) {
      console.error('Error fetching exact matches:', error);
      setError(error.message || 'Failed to fetch exact matches. Please try again.');
      setExactMatches([]);
      setIsLoadingExactMatches(false);
    }
  };

  const fetchVisualMatches = async () => {
    // Check if we have Google Lens results with a page token
    if (!googleLensResults || !googleLensResults.visual_matches_page_token) {
      console.error('No visual matches page token available');
      return;
    }
    
    // If we already have visual matches, don't fetch again
    if (visualMatches) {
      console.log('Using cached visual matches');
      return;
    }
    
    setIsLoadingVisualMatches(true);
    setVisualMatches(null);
    
    try {
      console.log(`Making Google Lens Visual Matches API request with page token: ${googleLensResults.visual_matches_page_token}`);
      
      // Use fetchWithRetry instead of regular fetch
      const response = await fetchWithRetry(
        `${API_URL}/google-lens-visual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            image_url: imageUrl,
            page_token: googleLensResults.visual_matches_page_token 
          }),
        }
      );
      
      // Handle rate limiting errors
      if (response.status === 429) {
        const errorText = await response.text();
        console.error('Google Lens Visual Matches rate limit exceeded:', errorText);
        throw new Error('API rate limit exceeded. Please wait a few minutes and try again.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Lens Visual Matches failed with status: ${response.status}`, errorText);
        throw new Error(`Google Lens Visual Matches failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Google Lens Visual Matches received successfully:', data);
      
      setVisualMatches(data.visual_matches || []);
      setIsLoadingVisualMatches(false);
    } catch (error) {
      console.error('Error fetching visual matches:', error);
      setError(error.message || 'Failed to fetch visual matches. Please try again.');
      setVisualMatches([]);
      setIsLoadingVisualMatches(false);
    }
  };

  const fetchProductMatches = async () => {
    // Check if we have Google Lens results with a page token
    if (!googleLensResults || !googleLensResults.products_page_token) {
      console.error('No products page token available');
      return;
    }
    
    // If we already have product matches, don't fetch again
    if (productMatches) {
      console.log('Using cached product matches');
      return;
    }
    
    setIsLoadingProductMatches(true);
    setProductMatches(null);
    
    try {
      console.log(`Making Google Lens Products API request with page token: ${googleLensResults.products_page_token}`);
      
      // Use fetchWithRetry instead of regular fetch
      const response = await fetchWithRetry(
        `${API_URL}/google-lens-products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            image_url: imageUrl,
            page_token: googleLensResults.products_page_token 
          }),
        }
      );
      
      // Handle rate limiting errors
      if (response.status === 429) {
        const errorText = await response.text();
        console.error('Google Lens Products rate limit exceeded:', errorText);
        throw new Error('API rate limit exceeded. Please wait a few minutes and try again.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Lens Products failed with status: ${response.status}`, errorText);
        throw new Error(`Google Lens Products failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        console.log(`Successfully received ${data.products.length} products from Google Lens API`);
        setProductMatches(data.products);
      } else {
        console.warn('No products found in Google Lens API response');
        setProductMatches([]);
      }
      
      setIsLoadingProductMatches(false);
    } catch (error) {
      console.error('Error fetching product matches:', error);
      setError(error.message || 'Failed to fetch product matches. Please try again.');
      setProductMatches([]);
      setIsLoadingProductMatches(false);
    }
  };

  // ImageSearchComponent definition
  const ImageSearchComponent = () => {
    // Reset Google Lens results and fetch new results when the component mounts
    useEffect(() => {
      if (imageUrl && !isGoogleLensRequestInProgress && 
          (!lastSearchedImageUrl || lastSearchedImageUrl !== imageUrl)) {
        fetchGoogleLensResults();
      }
    }, []);

    const handleTabChange = (tab) => {
      setImageLensTab(tab);
      
      // If switching to exact matches tab and we don't have exact matches yet, fetch them
      if (tab === 'exact' && !exactMatches && googleLensResults?.exact_matches_page_token) {
        fetchExactMatches();
      }
      
      // If switching to visual matches tab and we don't have visual matches yet, fetch them
      if (tab === 'visual' && !visualMatches && googleLensResults?.visual_matches_page_token) {
        fetchVisualMatches();
      }
      
      // If switching to products tab and we don't have products yet, fetch them
      if (tab === 'products' && !productMatches && googleLensResults?.products_page_token) {
        fetchProductMatches();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <button 
                    onClick={() => {
                      setShowImageSearch(false);
                    }}
                    className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                  </button>
                  <h2 className="text-xl font-medium text-gray-800">Visual Search Results</h2>
                </div>
                
                <button
                  onClick={() => setShowImageSearch(false)}
                  className="inline-flex items-center px-4 py-2 border border-yellow-600 text-sm font-medium rounded-md text-gray-900 bg-yellow-500 hover:bg-yellow-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Back to Recognition
                </button>
              </div>
              
              <div className="mb-6 relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Search image"
                  className="w-full h-auto max-h-96 object-contain bg-gray-50"
                />
              </div>
              
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => handleTabChange('all')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      imageLensTab === 'all'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${isLoadingGoogleLens ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoadingGoogleLens}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleTabChange('exact')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      imageLensTab === 'exact'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${isLoadingGoogleLens ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoadingGoogleLens}
                  >
                    Exact Matches
                  </button>
                  <button
                    onClick={() => handleTabChange('visual')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      imageLensTab === 'visual'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${isLoadingGoogleLens ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoadingGoogleLens}
                  >
                    Visual Matches
                  </button>
                  <button
                    onClick={() => handleTabChange('products')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      imageLensTab === 'products'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${isLoadingGoogleLens ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoadingGoogleLens}
                  >
                    Products
                  </button>
                </nav>
              </div>
              
              <div className="min-h-[300px]">
                {isLoadingGoogleLens ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-800 text-lg">Loading visual search results...</span>
                  </div>
                ) : !googleLensResults ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-800 text-lg">Loading results...</span>
                    <p className="text-gray-500 text-sm">Please wait while we analyze the image.</p>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    {imageLensTab === 'all' && googleLensResults.visual_matches && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Visual Matches</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {googleLensResults.visual_matches.map((match, index) => (
                            <a 
                              key={index}
                              href={match.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative">
                                <div className="w-full h-48 flex items-center justify-center">
                                  <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  </div>
                                  <img 
                                    src={match.thumbnail || match.image} 
                                    alt={match.title || 'Visual match'}
                                    className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300"
                                    onLoad={(e) => {
                                      e.target.classList.remove('opacity-0');
                                      e.target.classList.add('opacity-100');
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                      e.target.classList.remove('opacity-0');
                                      e.target.classList.add('opacity-100');
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600">{match.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{match.source}</p>
                                {match.price && (
                                  <p className="text-sm font-medium text-green-600 mt-2">{match.price.value}</p>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {imageLensTab === 'all' && googleLensResults.related_content && googleLensResults.related_content.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Related Content</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {googleLensResults.related_content.map((item, index) => (
                            <a 
                              key={index}
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <div className="p-3 bg-gray-50">
                                <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{item.query}</h4>
                              </div>
                              {item.thumbnail && (
                                <div className="relative bg-gray-100 w-full h-32">
                                  <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  </div>
                                  <img 
                                    src={item.thumbnail} 
                                    alt={item.query || 'Related content'}
                                    className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300"
                                    onLoad={(e) => {
                                      e.target.classList.remove('opacity-0');
                                      e.target.classList.add('opacity-100');
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                      e.target.classList.remove('opacity-0');
                                      e.target.classList.add('opacity-100');
                                    }}
                                  />
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {imageLensTab === 'exact' && (
                      <div className="text-center py-12">
                        {isLoadingExactMatches ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-gray-800 text-lg">Loading exact matches...</span>
                          </div>
                        ) : !exactMatches ? (
                          <div>
                            <p className="text-gray-500">No exact matches found for this image.</p>
                            {!googleLensResults?.exact_matches_page_token && (
                              <p className="text-gray-500 mt-2">No page token available. Try searching with another image.</p>
                            )}
                          </div>
                        ) : exactMatches.length === 0 ? (
                          <p className="text-gray-500">No exact matches found for this image.</p>
                        ) : (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Exact Matches</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {exactMatches.map((match, index) => (
                                <a 
                                  key={index}
                                  href={match.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group block rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                  <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative">
                                    <div className="w-full h-48 flex items-center justify-center">
                                      <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      </div>
                                      <img 
                                        src={match.thumbnail} 
                                        alt={match.title || 'Exact match'}
                                        className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300"
                                        onLoad={(e) => {
                                          e.target.classList.remove('opacity-0');
                                          e.target.classList.add('opacity-100');
                                        }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                          e.target.classList.remove('opacity-0');
                                          e.target.classList.add('opacity-100');
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600">{match.title}</h4>
                                    <div className="flex items-center mt-1">
                                      {match.source_icon && (
                                        <img 
                                          src={match.source_icon} 
                                          alt={match.source || 'Source'} 
                                          className="w-4 h-4 mr-1"
                                        />
                                      )}
                                      <p className="text-xs text-gray-500">{match.source}</p>
                                    </div>
                                    {match.price && (
                                      <p className="text-sm font-medium text-green-600 mt-1">{match.price}</p>
                                    )}
                                    {match.in_stock && (
                                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">In Stock</span>
                                    )}
                                    {match.out_of_stock && (
                                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">Out of Stock</span>
                                    )}
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {imageLensTab === 'visual' && (
                      <div className="text-center py-12">
                        {isLoadingVisualMatches ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-gray-800 text-lg">Loading visual matches...</span>
                          </div>
                        ) : !visualMatches ? (
                          <div>
                            <p className="text-gray-500">No visual matches found for this image.</p>
                            {!googleLensResults?.visual_matches_page_token && (
                              <p className="text-gray-500 mt-2">No page token available. Try searching with another image.</p>
                            )}
                          </div>
                        ) : visualMatches.length === 0 ? (
                          <p className="text-gray-500">No visual matches found for this image.</p>
                        ) : (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Visual Matches</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {visualMatches.map((match, index) => (
                                <a 
                                  key={index}
                                  href={match.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group block rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                  <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative">
                                    <div className="w-full h-48 flex items-center justify-center">
                                      <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      </div>
                                      <img 
                                        src={match.thumbnail || match.image} 
                                        alt={match.title || 'Visual match'}
                                        className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300"
                                        onLoad={(e) => {
                                          e.target.classList.remove('opacity-0');
                                          e.target.classList.add('opacity-100');
                                        }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                          e.target.classList.remove('opacity-0');
                                          e.target.classList.add('opacity-100');
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600">{match.title}</h4>
                                    <div className="flex items-center mt-1">
                                      {match.source_icon && (
                                        <img 
                                          src={match.source_icon} 
                                          alt={match.source || 'Source'} 
                                          className="w-4 h-4 mr-1"
                                        />
                                      )}
                                      <p className="text-xs text-gray-500">{match.source}</p>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {imageLensTab === 'products' && (
                      <div className="text-center py-12">
                        {isLoadingProductMatches ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-gray-800 text-lg">Loading product matches...</span>
                          </div>
                        ) : !productMatches ? (
                          <div>
                            <p className="text-gray-500">No product matches found for this image.</p>
                            {!googleLensResults?.products_page_token && (
                              <p className="text-gray-500 mt-2">No page token available. Try searching with another image.</p>
                            )}
                          </div>
                        ) : productMatches.length === 0 ? (
                          <p className="text-gray-500">No product matches found for this image.</p>
                        ) : (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Matches</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {productMatches.map((product, index) => (
                                <a 
                                  key={index}
                                  href={product.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group block rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                  <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative">
                                    <div className="w-full h-48 flex items-center justify-center">
                                      <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      </div>
                                      <img 
                                        src={product.thumbnail} 
                                        alt={product.title || 'Product match'}
                                        className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300"
                                        onLoad={(e) => {
                                          e.target.classList.remove('opacity-0');
                                          e.target.classList.add('opacity-100');
                                        }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                          e.target.classList.remove('opacity-0');
                                          e.target.classList.add('opacity-100');
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600">{product.title}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                      <div className="flex items-center">
                                        {product.source_icon && (
                                          <img 
                                            src={product.source_icon} 
                                            alt={product.source || 'Source'} 
                                            className="w-4 h-4 mr-1"
                                          />
                                        )}
                                        <p className="text-xs text-gray-500">{product.source}</p>
                                      </div>
                                      {product.price && (
                                        <p className="text-sm font-medium text-green-600">
                                          {typeof product.price === 'object' ? product.price.value : product.price}
                                        </p>
                                      )}
                                    </div>
                                    {product.rating && (
                                      <div className="flex items-center mt-1">
                                        <div className="flex items-center">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <svg 
                                              key={star}
                                              className={`w-3 h-3 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                              fill="currentColor" 
                                              viewBox="0 0 20 20" 
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                            </svg>
                                          ))}
                                        </div>
                                        {product.reviews && (
                                          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                                        )}
                                      </div>
                                    )}
                                    {product.in_stock !== undefined && (
                                      <div className="mt-1">
                                        <span className={`text-xs ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Return the main component or the image search component based on state
  if (showImageSearch) {
    return <ImageSearchComponent />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Recognition</h1>
          <p className="text-gray-500">Upload an image to analyze its content using Google Cloud Vision and Gemini Pro</p>
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

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p>{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <button
                onClick={handleUpload}
                disabled={!selectedImage || isUploading}
                className={`py-3 px-4 rounded-lg text-white font-medium flex-1 ${
                  !selectedImage || isUploading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 transition-colors duration-200'
                }`}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : 'Upload to Supabase'}
              </button>
              
              <button
                onClick={handleRecognize}
                disabled={!imageUrl || isRecognizing}
                className={`py-3 px-4 rounded-lg text-white font-medium flex-1 ${
                  !imageUrl || isRecognizing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 transition-colors duration-200'
                }`}
              >
                {isRecognizing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : 'Recognize Image'}
              </button>
            </div>

            {recognitionResults && (
              <div className="mt-8 space-y-8">
                <div>
                  <h2 className="text-xl font-medium text-gray-800 mb-3">Recognition Results</h2>
                  
                  {/* Add Image Search Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        setGoogleLensResults(null); // Clear previous results
                        setShowImageSearch(true);
                      }}
                      className="flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-yellow-600 text-base font-bold rounded-md text-gray-900 bg-yellow-500 hover:bg-yellow-600 hover:text-white transition-colors duration-200 shadow-sm"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                      Search with this image
                    </button>
                  </div>
                  
                  {/* Objects + Extracted Terms */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700">Detected Objects</h3>
                      
                      <div className="text-xs text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                        Click on any item to find products
                      </div>
                    </div>
                    
                    {/* Display specific products first if available from the backend */}
                    {recognitionResults.specific_products && recognitionResults.specific_products.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Identified Products:</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {recognitionResults.specific_products.map((product, index) => (
                            <div 
                              key={`backend-product-${index}`} 
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 hover:shadow-sm transition-all border border-green-300 flex items-center"
                              onClick={() => handleProductSearch(product)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                              </svg>
                              <span>{product}</span>
                              {isLoadingProducts && selectedObject === product && (
                                <svg className="animate-spin ml-2 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Regular objects */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {recognitionResults.objects && recognitionResults.objects.map((object, index) => (
                        <div 
                          key={index} 
                          className={`px-3 py-1 rounded-full text-sm cursor-pointer hover:shadow-sm transition-all flex items-center ${
                            // Check if this is a specific product from the list
                            isSpecificProduct(object) 
                              ? "bg-green-100 text-green-800 font-medium border border-green-300 hover:bg-green-200"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          }`}
                          onClick={() => handleProductSearch(object)}
                        >
                          {isSpecificProduct(object) && (
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                          )}
                          <span>{object}</span>
                          {isLoadingProducts && selectedObject === object && (
                            <svg className="animate-spin ml-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Only show frontside extracted products if not provided by backend */}
                    {(!recognitionResults.specific_products || recognitionResults.specific_products.length === 0) && 
                      recognitionResults.scene_description && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-2">Specific products from description:</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {extractProductsFromDescription(recognitionResults.scene_description).map((product, index) => (
                            <div 
                              key={`product-${index}`} 
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 hover:shadow-sm transition-all border border-green-300 flex items-center"
                              onClick={() => handleProductSearch(product)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                              </svg>
                              <span>{product}</span>
                              {isLoadingProducts && selectedObject === product && (
                                <svg className="animate-spin ml-2 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Terms from description */}
                    {recognitionResults.scene_description && (
                      <div>
                        <h4 className="text-xs text-gray-500 mb-2">Suggested from description:</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {extractKeyTerms(recognitionResults.scene_description).map((term, index) => (
                            <div 
                              key={`desc-${index}`} 
                              className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-purple-100 hover:shadow-sm transition-all flex items-center"
                              onClick={() => handleProductSearch(term)}
                            >
                              <span>{term}</span>
                              {isLoadingProducts && selectedObject === term && (
                                <svg className="animate-spin ml-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Terms from OCR */}
                    {recognitionResults.text && (
                      <div>
                        <h4 className="text-xs text-gray-500 mb-2">Detected from text:</h4>
                        <div className="flex flex-wrap gap-2">
                          {extractProductsFromOCR(recognitionResults.text).map((term, index) => (
                            <div 
                              key={`ocr-${index}`} 
                              className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-orange-100 hover:shadow-sm transition-all flex items-center"
                              onClick={() => handleProductSearch(term)}
                            >
                              <span>{term}</span>
                              {isLoadingProducts && selectedObject === term && (
                                <svg className="animate-spin ml-2 h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Scene Description */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                    <h3 className="font-medium text-gray-700 mb-3">Scene Description</h3>
                    <p className="text-gray-600">{recognitionResults.scene_description || recognitionResults.message || 'No description available'}</p>
                  </div>
                  
                  {/* OCR Text */}
                  {recognitionResults.texts && recognitionResults.texts.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                      <h3 className="font-medium text-gray-700 mb-3">Extracted Text (OCR)</h3>
                      <div className="bg-gray-50 p-3 rounded text-gray-700 font-mono text-sm whitespace-pre-wrap">
                        {recognitionResults.texts.join('\n\n')}
                      </div>
                    </div>
                  )}
                  
                  {/* Web Matches */}
                  {recognitionResults.web_matches && recognitionResults.web_matches.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                      <h3 className="font-medium text-gray-700 mb-3">Web Matches</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recognitionResults.web_matches.map((match, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium">{match.description}</p>
                            <p className="text-sm text-gray-500">Score: {Math.round(match.score * 100)}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Person Detection - Celebrity Recognition */}
                  {recognitionResults.objects && recognitionResults.objects.includes('Person') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                      <h3 className="font-medium text-gray-700 mb-3">Person Detected</h3>
                      <p className="text-gray-600 mb-4">Check if any celebrities are present in this image.</p>
                      
                      <button
                        onClick={handleCelebrityDetection}
                        disabled={isLoadingCelebrity}
                        className={`py-2 px-4 rounded-lg text-white font-medium ${
                          isLoadingCelebrity
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-purple-500 hover:bg-purple-600 transition-colors duration-200'
                        }`}
                      >
                        {isLoadingCelebrity ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                          </span>
                        ) : 'Check for Celebrities'}
                      </button>
                      
                      {celebrityResults && (
                        <div className="mt-4">
                          {celebrityResults.celebrities && celebrityResults.celebrities.length > 0 ? (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Detected Celebrities:</h4>
                              <ul className="list-disc pl-5 text-gray-600">
                                {celebrityResults.celebrities.map((celebrity, index) => (
                                  <li key={index}>{celebrity}</li>
                                ))}
                              </ul>
                              <h4 className="font-medium text-gray-700 mt-3 mb-2">Scene Description (Gemini Pro Vision):</h4>
                              <p className="text-gray-600">{celebrityResults.scene_description}</p>
                            </div>
                          ) : (
                            <p className="text-gray-600">No celebrities detected in this image.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Products */}
                  {Object.keys(productResults).length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <h3 className="text-xl font-medium text-gray-800 mb-3">Product Matches</h3>
                      
                      {/* Use the ProductResults component for SerpAPI integration */}
                      <ProductResults 
                        products={Object.entries(productResults).flatMap(([objectName, products]) => 
                          products.map(product => ({
                            ...product,
                            objectSource: objectName
                          }))
                        )} 
                        reset={() => {
                          setProductResults({});
                          setSelectedObject(null);
                        }} 
                      />
                      
                      {/* Loading indicator */}
                      {isLoadingProducts && selectedObject && (
                        <div className="flex items-center justify-center py-4">
                          <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading products for {selectedObject}...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageRecognition; 