import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Stage, Layer, Image, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import ProcessedResult from './ProcessedResult';
// Import Supabase functions
import { uploadImage, storeImageMetadata, storeProcessedImageMetadata } from '../supabase';
import { API_URL } from '../config';

const Processing = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('adjust');
  const [textOverlay, setTextOverlay] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(24);
  const [textContainerSize, setTextContainerSize] = useState({ width: 200, height: 50 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isResizingText, setIsResizingText] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStartSize, setResizeStartSize] = useState(null);
  const [textScale, setTextScale] = useState(1);
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [konvaText, setKonvaText] = useState('');
  const [konvaTextProps, setKonvaTextProps] = useState({
    x: 50,
    y: 50,
    fontSize: 24,
    fill: '#000000',
    width: 200,
    height: 50,
    align: 'center',
    verticalAlign: 'middle',
    draggable: true
  });
  const [isSelected, setIsSelected] = useState(false);
  const transformerRef = useRef();
  const canvasRef = useRef(null);
  const cropRef = useRef(null);
  const textRef = useRef(null);
  const textContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const [konvaImage, setKonvaImage] = useState(null);

  // Add state for advanced options
  const [compressionLevel, setCompressionLevel] = useState(95);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [compressionStats, setCompressionStats] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showCompressionPage, setShowCompressionPage] = useState(false);
  const [compressionFileInput, setCompressionFileInput] = useState(null);
  const [compressedImageUrl, setCompressedImageUrl] = useState(null);
  
  // Add state for Supabase integration
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedImageName, setUploadedImageName] = useState(null);
  const [supabaseError, setSupabaseError] = useState(null);

  // Add a shared image processing function that both preview and final result will use
  const processImage = (sourceImage, settings) => {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Handle different source types (Image element or string URL)
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Extract settings
          const {
            brightness: currentBrightness,
            contrast: currentContrast,
            saturation: currentSaturation,
            blur: currentBlur,
            filter: currentFilter,
            compressionLevel: currentCompressionLevel,
            outputFormat: currentFormat
          } = settings;
          
          // Process each pixel
          for (let i = 0; i < data.length; i += 4) {
            // Get pixel values
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Apply brightness
            const brightnessFactor = currentBrightness / 100;
            r = r * brightnessFactor;
            g = g * brightnessFactor;
            b = b * brightnessFactor;
            
            // Apply contrast
            const factor = (259 * (currentContrast + 100)) / (255 * (259 - currentContrast));
            r = factor * (r - 128) + 128;
            g = factor * (g - 128) + 128;
            b = factor * (b - 128) + 128;
            
            // Apply saturation
            if (currentSaturation !== 100) {
              const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
              const saturationFactor = currentSaturation / 100;
              r = gray + (r - gray) * saturationFactor;
              g = gray + (g - gray) * saturationFactor;
              b = gray + (b - gray) * saturationFactor;
            }
            
            // Apply filters
            if (currentFilter === 'grayscale') {
              const grayValue = 0.299 * r + 0.587 * g + 0.114 * b;
              r = g = b = grayValue;
            } else if (currentFilter === 'sepia') {
              const newR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
              const newG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
              const newB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
              r = newR;
              g = newG;
              b = newB;
            } else if (currentFilter === 'vintage') {
              r = r * 0.9;
              g = g * 0.8;
              b = b * 0.7;
            } else if (currentFilter === 'cinematic') {
              r = r * 1.1;
              g = g * 1.05;
              b = b * 0.95;
            } else if (currentFilter === 'dramatic') {
              const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
              r = gray + (r - gray) * 1.2;
              g = gray + (g - gray) * 1.2;
              b = gray + (b - gray) * 1.2; 
            } else if (currentFilter === 'dreamy') {
              r = r * 1.1;
              g = g * 1.1;
              b = b * 1.1;
            } else if (currentFilter === 'noir') {
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              r = gray * 0.8;
              g = gray * 0.8;
              b = gray * 0.8;
            }
            
            // Clamp values
            data[i] = Math.min(255, Math.max(0, r));
            data[i + 1] = Math.min(255, Math.max(0, g));
            data[i + 2] = Math.min(255, Math.max(0, b));
          }
          
          // Put processed data back to canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Apply blur if needed
          if (currentBlur > 0) {
            const blurCanvas = document.createElement('canvas');
            const blurCtx = blurCanvas.getContext('2d');
            blurCanvas.width = canvas.width;
            blurCanvas.height = canvas.height;
            
            blurCtx.filter = `blur(${currentBlur}px)`;
            blurCtx.drawImage(canvas, 0, 0);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(blurCanvas, 0, 0);
          }
          
          // Convert to data URL with specified format and compression
          let mimeType;
          switch (currentFormat) {
            case 'png':
              mimeType = 'image/png';
              break;
            case 'webp':
              mimeType = 'image/webp';
              break;
            case 'jpeg':
            default:
              mimeType = 'image/jpeg';
              break;
          }
          
          const compression = currentFormat === 'png' ? undefined : currentCompressionLevel / 100;
          const processedImageUrl = canvas.toDataURL(mimeType, compression);
          resolve(processedImageUrl);
        };
        
        img.onerror = (err) => {
          console.error("Error loading image for processing:", err);
          reject(err);
        };
        
        // Set source - could be a URL string or an Image element
        if (typeof sourceImage === 'string') {
          img.src = sourceImage;
        } else if (sourceImage instanceof File) {
          img.src = URL.createObjectURL(sourceImage);
        } else {
          reject(new Error("Invalid source image type"));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Add state for the preview processed image
  const [previewProcessedImage, setPreviewProcessedImage] = useState(null);

  // Effect to update the preview processed image when settings change
  useEffect(() => {
    if (!selectedImage || !preview) return;
    
    const updatePreview = async () => {
      try {
        // Use the same settings object that will be used in final processing
        const settings = {
          brightness,
          contrast,
          saturation,
          blur,
          filter: selectedFilter,
          compressionLevel,
          outputFormat: 'png'  // Force PNG to preserve transparency
        };
        
        // Process the preview image
        const processedPreview = await processImage(preview, settings);
        setPreviewProcessedImage(processedPreview);
      } catch (error) {
        console.error("Error updating preview:", error);
      }
    };
    
    // Debounce the preview update to avoid performance issues
    const timeoutId = setTimeout(updatePreview, 200);
    return () => clearTimeout(timeoutId);
  }, [brightness, contrast, saturation, blur, selectedFilter, preview, selectedImage, compressionLevel]);

  // Modify handleProcess to use Supabase and backend
  const handleProcess = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setSupabaseError(null);
    
    try {
      // Process image locally only
      console.log("Processing image locally");
      
      // If we've removed background, make sure we're using PNG format to preserve transparency
      const hasTransparency = processedImage && (processedImage.includes('base64') || processedImage.includes('png'));
      const formatToUse = hasTransparency ? 'png' : outputFormat;
      
      // Process the image using your existing logic
    const settings = {
      brightness,
      contrast,
      saturation,
      blur,
      filter: selectedFilter,
      compressionLevel,
        outputFormat: formatToUse
      };
      
      // Generate a unique filename for the processed image
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `processed-${timestamp}-${randomString}.${formatToUse}`;
      
      // Process image locally to get the result
      const processedUrl = await processImage(preview, settings);
      
      // Convert base64 to blob for upload to Supabase
      const fetchResponse = await fetch(processedUrl);
      const processedBlob = await fetchResponse.blob();
      
      // Upload the processed image to Supabase
      const processedImageUrl = await uploadImage(processedBlob, fileName);
      
      // Set the processed image for display
      setProcessedImage(processedUrl);
      
      // Store processed image metadata in Supabase if available
      if (uploadedImageUrl) {
        const processedImageData = {
          original_url: uploadedImageUrl,
          processed_url: processedImageUrl,
          processed_at: new Date().toISOString()
        };
        
        try {
          await storeProcessedImageMetadata(processedImageData);
        } catch (metadataError) {
          console.error('Error storing metadata, but processing completed:', metadataError);
        }
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      setSupabaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'none', name: 'No Filter', icon: '🎯', description: 'Clean, no effects' },
    { id: 'vintage', name: 'Vintage', icon: '📷', description: 'Classic film look' },
    { id: 'cinematic', name: 'Cinematic', icon: '🎬', description: 'Movie-like quality' },
    { id: 'dramatic', name: 'Dramatic', icon: '🎭', description: 'High contrast and mood' },
    { id: 'dreamy', name: 'Dreamy', icon: '💫', description: 'Soft, ethereal look' },
    { id: 'grayscale', name: 'Grayscale', icon: '⚫', description: 'Black and white' },
    { id: 'sepia', name: 'Sepia', icon: '🟤', description: 'Warm brown tones' },
    { id: 'noir', name: 'Noir', icon: '🎥', description: 'Film noir style' }
  ];

  const stickers = [
    { id: 'heart', url: '/stickers/heart.png', icon: '❤️' },
    { id: 'star', url: '/stickers/star.png', icon: '⭐' },
    { id: 'smile', url: '/stickers/smile.png', icon: '😊' },
    { id: 'crown', url: '/stickers/crown.png', icon: '👑' },
    { id: 'fire', url: '/stickers/fire.png', icon: '🔥' },
    { id: 'sparkles', url: '/stickers/sparkles.png', icon: '✨' }
  ];

  // Modify handleImageChange to upload to Supabase
  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
      
      // Store file for potential upload
        setPendingImageFile(file);
      
      // Check if an image is already being edited
      if (selectedImage) {
        setShowUploadWarning(true);
      } else {
        await loadNewImage(file);
      }
    }
  };

  const handleDiscardImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setProcessedImage(null);
    setUploadedImageUrl(null);
    setUploadedImageName(null);
    setImageId(null);
    resetAdjustments();
    /* eslint-disable no-undef */
    setHistory([]);
    /* eslint-enable no-undef */
  };

  // Modify loadNewImage to upload to Supabase
  const loadNewImage = async (file) => {
    try {
      setLoading(true);
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      setSelectedImage(file);
      
      // Upload to Supabase
      const { data, error } = await uploadImage(file);
      
      if (error) throw error;
      
      setUploadedImageUrl(data.url);
      setUploadedImageName(data.name);
      /* eslint-disable no-undef */
      setImageId(data.id);
      /* eslint-enable no-undef */
      
      // Reset adjustments
      resetAdjustments();
      
      // Save initial state to history
      /* eslint-disable no-undef */
      setHistory([{
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        rotation: 0,
        crop: null,
        filter: 'none'
      }]);
      /* eslint-enable no-undef */
    } catch (error) {
      console.error('Error loading image:', error);
      setError('Failed to load image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelUpload = () => {
    setShowUploadWarning(false);
    setPendingImageFile(null);
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
    setSelectedFilter('none');
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
    setCompletedCrop(null);
    setCropMode(false);
    setTextOverlay('');
    setTextPosition({ x: 50, y: 50 });
    setTextColor('#000000');
    setTextSize(24);
    setKonvaText('');
    setKonvaTextProps({
      x: 50,
      y: 50,
      fontSize: 24,
      fill: '#000000',
      width: 200,
      height: 50,
      align: 'center',
      verticalAlign: 'middle',
      draggable: true
    });
  };

  const saveToHistory = () => {
    const currentState = {
      brightness,
      contrast,
      saturation,
      blur,
      rotation,
      textOverlay,
      crop
    };
    setHistory(prev => [...prev, currentState]);
  };

  const handleTextDragStart = (e) => {
    if (!textOverlay) return;
    setIsDraggingText(true);
    const rect = cropRef.current.getBoundingClientRect();
    
    // Get cursor position relative to container
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Convert coordinates based on rotation
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    if (normalizedRotation === 90) {
      [x, y] = [y, 100 - x];
    } else if (normalizedRotation === 180) {
      [x, y] = [100 - x, 100 - y];
    } else if (normalizedRotation === 270) {
      [x, y] = [100 - y, x];
    }
    
    // Clamp values between 0 and 100
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    
    setTextPosition({ x, y });
  };

  const handleTextDrag = (e) => {
    if (!isDraggingText || !textOverlay) return;
    const rect = cropRef.current.getBoundingClientRect();
    
    // Get cursor position relative to container
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Convert coordinates based on rotation
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    if (normalizedRotation === 90) {
      [x, y] = [y, 100 - x];
    } else if (normalizedRotation === 180) {
      [x, y] = [100 - x, 100 - y];
    } else if (normalizedRotation === 270) {
      [x, y] = [100 - y, x];
    }
    
    // Clamp values between 0 and 100
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    
    setTextPosition({ x, y });
  };

  const handleTextDragEnd = () => {
    setIsDraggingText(false);
  };

  const handleTextResizeStart = (e, handle) => {
    if (!textOverlay) return;
    e.stopPropagation();
    setIsResizingText(true);
    setResizeHandle(handle);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ ...textContainerSize });
  };

  const handleTextResize = (e) => {
    if (!isResizingText || !textOverlay || !resizeHandle) return;
    
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    
    let newSize = { ...resizeStartSize };
    
    switch (resizeHandle) {
      case 'n':
        newSize.height = Math.max(50, resizeStartSize.height - deltaY);
        break;
      case 's':
        newSize.height = Math.max(50, resizeStartSize.height + deltaY);
        break;
      case 'e':
        newSize.width = Math.max(100, resizeStartSize.width + deltaX);
        break;
      case 'w':
        newSize.width = Math.max(100, resizeStartSize.width - deltaX);
        break;
      case 'ne':
        newSize.width = Math.max(100, resizeStartSize.width + deltaX);
        newSize.height = Math.max(50, resizeStartSize.height - deltaY);
        break;
      case 'nw':
        newSize.width = Math.max(100, resizeStartSize.width - deltaX);
        newSize.height = Math.max(50, resizeStartSize.height - deltaY);
        break;
      case 'se':
        newSize.width = Math.max(100, resizeStartSize.width + deltaX);
        newSize.height = Math.max(50, resizeStartSize.height + deltaY);
        break;
      case 'sw':
        newSize.width = Math.max(100, resizeStartSize.width - deltaX);
        newSize.height = Math.max(50, resizeStartSize.height + deltaY);
        break;
      default:
        break;
    }
    
    setTextContainerSize(newSize);
  };

  const handleTextResizeEnd = () => {
    setIsResizingText(false);
    setResizeHandle(null);
  };

  const getFilterStyle = () => {
    switch (selectedFilter) {
      case 'grayscale':
        return 'grayscale(100%)';
      case 'sepia':
        return 'sepia(100%)';
      case 'vintage':
        return 'sepia(50%) contrast(120%) brightness(90%)';
      case 'cinematic':
        return 'contrast(120%) brightness(110%) saturate(110%)';
      case 'dramatic':
        return 'contrast(130%) brightness(105%) saturate(120%)';
      case 'dreamy':
        return 'brightness(110%) contrast(90%) saturate(130%) blur(1px)';
      case 'noir':
        return 'contrast(150%) brightness(90%) grayscale(50%)';
      case 'none':
      default:
        return 'none';
    }
  };

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
  };

  // Function to center the crop
  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  // Function to handle image load
  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  // Function to handle rotation with React Image Crop
  const handleRotate = (direction) => {
    saveToHistory();
    const newRotation = (rotation + (direction === 'clockwise' ? 90 : -90)) % 360;
    setRotation(newRotation);
    
    // Reset crop when rotating
    if (newRotation % 180 !== 0) {
      // For portrait orientation
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
      });
    } else {
      // For landscape orientation
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
      });
    }
  };

  // Function to handle crop completion
  const handleCropComplete = (crop, percentageCrop) => {
    setCompletedCrop(percentageCrop);
  };

  // Function to handle image load for Konva
  const handleKonvaImageLoad = () => {
    if (!preview) return;
    
    const imageObj = new window.Image();
    imageObj.crossOrigin = 'Anonymous';
    imageObj.src = preview;
    imageObj.onload = () => {
      setKonvaImage(imageObj);
    };
  };

  // Function to handle text selection
  const handleTextSelect = () => {
    setIsSelected(true);
  };

  // Function to handle text deselection
  const handleTextDeselect = () => {
    setIsSelected(false);
  };

  // Function to update text properties
  const updateTextProps = (newProps) => {
    setKonvaTextProps({
      ...konvaTextProps,
      ...newProps
    });
  };

  // Effect to update transformer when text is selected
  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Effect to load image for Konva when preview changes
  useEffect(() => {
    if (preview) {
      handleKonvaImageLoad();
    }
  }, [preview]);

  // Effect to update Konva text when text overlay changes
  useEffect(() => {
    if (textOverlay) {
      setKonvaText(textOverlay);
      setKonvaTextProps({
        ...konvaTextProps,
        fontSize: textSize,
        fill: textColor,
        width: textContainerSize.width,
        height: textContainerSize.height,
        x: (textPosition.x / 100) * (cropRef.current ? cropRef.current.offsetWidth : 800),
        y: (textPosition.y / 100) * (cropRef.current ? cropRef.current.offsetHeight : 600)
      });
    }
  }, [textOverlay, textSize, textColor, textContainerSize, textPosition]);

  // Effect to update Konva text properties when text settings change
  useEffect(() => {
    updateTextProps({
      fontSize: textSize,
      fill: textColor,
      width: textContainerSize.width,
      height: textContainerSize.height
    });
  }, [textSize, textColor, textContainerSize]);

  // Function to apply filter to Konva image
  const applyKonvaFilter = (node) => {
    if (!node) return;
    
    // Apply base adjustments
    node.cache();
    node.brightness((brightness - 100) / 100);
    node.contrast((contrast - 100) / 100);
    node.enhance((saturation - 100) / 100);
    
    if (blur > 0) {
      node.blurRadius(blur / 2);
          }
          
          // Apply selected filter
    switch (selectedFilter) {
      case 'grayscale':
        node.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.Enhance, Konva.Filters.Blur, Konva.Filters.Grayscale]);
        break;
      case 'sepia':
        node.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.Enhance, Konva.Filters.Blur, Konva.Filters.Sepia]);
        break;
      case 'vintage':
      case 'cinematic':
      case 'dramatic':
      case 'dreamy':
      case 'noir':
        // For complex filters, we'll use the handleProcess function instead
        node.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.Enhance, Konva.Filters.Blur]);
        break;
      default:
        node.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.Enhance, Konva.Filters.Blur]);
        break;
    }
  };

  // Effect to update Konva image filters when settings change
  useEffect(() => {
    if (konvaImage) {
      const imageNode = document.querySelector('.konva-image');
      if (imageNode && imageNode._element) {
        applyKonvaFilter(imageNode._element);
      }
    }
  }, [brightness, contrast, saturation, blur, selectedFilter, konvaImage]);

  // Add console logging to track processedImage changes
  useEffect(() => {
    console.log("processedImage state changed:", processedImage ? "Image present" : "No image");
  }, [processedImage]);

  // Add debugging for loading state changes
  useEffect(() => {
    console.log("Loading state changed:", loading);
  }, [loading]);

  // Add handleRemoveBackground function back (it was removed in previous edit)
  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    setIsRemovingBackground(true);
    setLoading(true);
    
    try {
      // Create base64 representation of the image
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        // Call the API
        const response = await fetch(`${API_URL}/remove-background`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_base64: base64Image,
            return_type: 'base64'
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Background removal response:', data);
        
        if (data.success && data.base64) {
          // Store the image in state for display
          setProcessedImage(data.base64);
          
          // Update the preview image to the background-removed version
          setPreview(data.base64);
          
          // Store the processed image in Supabase
          try {
            // Generate a unique filename for the processed image
            const timestamp = new Date().getTime();
            const randomString = Math.random().toString(36).substring(2, 8);
            const fileName = `bg-removed-${timestamp}-${randomString}.png`;
            
            // Convert base64 to blob for upload
            const base64Response = await fetch(data.base64);
            const processedBlob = await base64Response.blob();
            
            // Upload to Supabase
            const processedImageUrl = await uploadImage(processedBlob, fileName);
            console.log('Stored background-removed image in Supabase:', processedImageUrl);
            
            // Store metadata in Supabase if needed
            if (uploadedImageUrl) {
              const processedImageData = {
                original_url: uploadedImageUrl,
                processed_url: processedImageUrl,
                processed_at: new Date().toISOString()
              };
              
              await storeProcessedImageMetadata(processedImageData);
            }
          } catch (uploadError) {
            console.error('Error storing background-removed image in Supabase:', uploadError);
          }
        } else if (data.success && data.path) {
          // If the server returned a path instead of base64
          const imageUrl = `${API_URL}${data.path}`;
          setProcessedImage(imageUrl);
          
          // Update the preview image to the background-removed version
          setPreview(imageUrl);
          
          // For path-based response, we would need to fetch the image first
          try {
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();
            
            // Generate a unique filename
            const timestamp = new Date().getTime();
            const randomString = Math.random().toString(36).substring(2, 8);
            const fileName = `bg-removed-${timestamp}-${randomString}.png`;
            
            // Upload to Supabase
            const processedImageUrl = await uploadImage(imageBlob, fileName);
            console.log('Stored background-removed image in Supabase:', processedImageUrl);
            
            // Store metadata if needed
            if (uploadedImageUrl) {
              const processedImageData = {
                original_url: uploadedImageUrl,
                processed_url: processedImageUrl,
                processed_at: new Date().toISOString()
              };
              
              await storeProcessedImageMetadata(processedImageData);
            }
          } catch (uploadError) {
            console.error('Error storing background-removed image in Supabase:', uploadError);
          }
        } else {
          throw new Error('Invalid response format from server');
        }
      };
    } catch (error) {
      console.error('Error removing background:', error);
      alert('Failed to remove background. Please try again later.');
    } finally {
      setLoading(false);
      setIsRemovingBackground(false);
    }
  };

  // Add function to handle format conversion and compression
  const handleFormatChange = (format) => {
    setOutputFormat(format);
  };

  // Add function to handle image compression with reSmush.it API via our backend
  const handleCompress = async () => {
    if (!compressionFileInput && !selectedImage && !preview) {
      alert("Please select an image to compress");
      return;
    }
    
    setIsCompressing(true);
    
    try {
      // Try local compression first if backend is not available
      const tryLocalCompression = async () => {
        console.log("Falling back to local compression");
        
        // Use the same settings as in handleProcess
        const settings = {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          filter: 'none',
          compressionLevel: compressionLevel,
          outputFormat: 'jpeg'  // JPEG for better compression
        };
        
        // Get source image - prioritize the compression file input
        let sourceImage = compressionFileInput || preview;
        if (!sourceImage && selectedImage) {
          sourceImage = selectedImage;
        }
        
        // Get original file size
        let originalSize = 0;
        if (compressionFileInput && compressionFileInput.size) {
          originalSize = compressionFileInput.size;
        } else if (selectedImage && selectedImage.size) {
          originalSize = selectedImage.size;
        } else if (preview) {
          // Estimate size from base64
          originalSize = Math.floor(preview.length * 0.75);
        }
        
        // Format size display
        const formatBytes = (bytes, decimals = 2) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const dm = decimals < 0 ? 0 : decimals;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };
        
        // Process locally
        const compressedDataUrl = await processImage(sourceImage, settings);
        
        // Convert to blob to get size
        const response = await fetch(compressedDataUrl);
        const blob = await response.blob();
        const compressedSize = blob.size;
        
        // Calculate savings
        const savedBytes = Math.max(0, originalSize - compressedSize);
        const savingPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;
        
        // Generate mock compression stats
        const compressionStats = {
          originalSize: formatBytes(originalSize),
          compressedSize: formatBytes(compressedSize),
          savings: `${savingPercent}% (${formatBytes(savedBytes)})`
        };
        
        // Update state
        setCompressionStats(compressionStats);
        setCompressedImageUrl(compressedDataUrl);
        
        // Upload to Supabase if needed
        try {
          const timestamp = new Date().getTime();
          const randomString = Math.random().toString(36).substring(2, 8);
          const fileName = `compressed-${timestamp}-${randomString}.jpeg`;
          
          const processedImageUrl = await uploadImage(blob, fileName);
          console.log("Local compression: Image uploaded to Supabase:", processedImageUrl);
          
          // Store metadata using less restrictive conditions
          // Use a better fallback for the original URL
          const originalUrl = uploadedImageUrl || "Unknown original source";
          
          const processedImageData = {
            original_url: originalUrl,
            processed_url: processedImageUrl,
            processed_at: new Date().toISOString()
          };
          
          console.log("Local compression: Storing metadata:", processedImageData);
          try {
            const result = await storeProcessedImageMetadata(processedImageData);
            console.log("Local compression: Metadata stored successfully:", result);
          } catch (metadataError) {
            console.error('Error storing compression metadata:', metadataError);
          }
        } catch (uploadError) {
          console.error('Error uploading compressed image:', uploadError);
        }
      };
      
      // Try to use the backend first
      try {
        // Get image data
        let imageData;
        let file = compressionFileInput || selectedImage;
        
        // If we're working with a base64 image (e.g., after background removal)
        if (preview && preview.startsWith('data:image') && !file) {
          imageData = {
            image_base64: preview
          };
          
          // Call our backend compression endpoint with base64 data
          const response = await fetch(`${API_URL}/compress-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-image-quality': compressionLevel.toString()
            },
            body: JSON.stringify(imageData)
          });
          
          if (!response.ok) {
            console.warn(`Server responded with status: ${response.status}`);
            await tryLocalCompression();
            return;
          }
          
          const data = await response.json();
          await handleCompressionResponse(data);
        } 
        // If we have a file object
        else if (file) {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('file', file);
          
          // Call our backend compression endpoint with form data
          const response = await fetch(`${API_URL}/compress-image`, {
            method: 'POST',
            headers: {
              'x-image-quality': compressionLevel.toString()
            },
            body: formData
          });
          
          if (!response.ok) {
            console.warn(`Server responded with status: ${response.status}`);
            await tryLocalCompression();
            return;
          }
          
          const data = await response.json();
          await handleCompressionResponse(data);
        }
      } catch (serverError) {
        console.warn("Backend server error:", serverError);
        // Fall back to local compression
        await tryLocalCompression();
      }
    } catch (error) {
      console.error('Error compressing image:', error);
      alert(`Failed to compress image: ${error.message}`);
    } finally {
      setIsCompressing(false);
    }
  };
  
  // Helper function to handle the compression response
  const handleCompressionResponse = async (data) => {
    try {
      if (data.success) {
        // Parse compression statistics from objects array
        const originalSizeStr = data.objects[0].replace('Original: ', '');
        const compressedSizeStr = data.objects[1].replace('Compressed: ', '');
        const savingsStr = data.objects[2].replace('Saved: ', '');
        
        // Update compression stats for display
        setCompressionStats({
          originalSize: originalSizeStr,
          compressedSize: compressedSizeStr,
          savings: savingsStr
        });
        
        // Set processed image based on base64 or path
        if (data.base64) {
          setCompressedImageUrl(data.base64);
        } else if (data.path) {
          const imageUrl = `http://localhost:8000${data.path}`;
          setCompressedImageUrl(imageUrl);
        }
        
        // Store in Supabase - modified to ensure data is stored in all cases
        // Log values to debug the issue
        console.log("uploadedImageUrl:", uploadedImageUrl);
        console.log("data.processed_image_url:", data.processed_image_url);
        
        if (data.processed_image_url) {
          try {
            // Use uploadedImageUrl if available, otherwise use a better fallback
            // Get a proper original URL - use the backend-provided one if available
            const originalUrl = uploadedImageUrl || 
                               (data.original_url && data.original_url !== "None" ? data.original_url : 
                               "Unknown original source");
            
            const processedImageData = {
              original_url: originalUrl,
              processed_url: data.processed_image_url,
              processed_at: new Date().toISOString()
            };
            
            console.log("Sending metadata to Supabase:", processedImageData);
            await storeProcessedImageMetadata(processedImageData);
            console.log("Successfully stored metadata!");
          } catch (metadataError) {
            console.error('Error storing compression metadata:', metadataError);
          }
        } else {
          console.warn("No processed_image_url available in the response. Cannot store metadata.");
        }
      } else {
        throw new Error(data.message || 'Unknown error during compression');
      }
    } catch (error) {
      console.error('Error handling compression response:', error);
      throw error;
    }
  };
  
  // Function to handle compression file input
  const handleCompressionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompressionFileInput(file);
      // Clear previous results
      setCompressedImageUrl(null);
      setCompressionStats(null);
    }
  };

  // Function to start compression journey
  const startCompression = () => {
    setShowCompressionPage(true);
    setCompressionFileInput(null);
    setCompressedImageUrl(null);
    setCompressionStats(null);
  };

  // Function to go back from compression page
  const exitCompressionPage = () => {
    setShowCompressionPage(false);
    setCompressionFileInput(null);
    setCompressedImageUrl(null);
    setCompressionStats(null);
  };

  // Optional: Add Supabase error display
  const renderSupabaseError = () => {
    if (!supabaseError) return null;
    
    return (
      <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
        <p className="font-semibold">Storage Error:</p>
        <p>{supabaseError.message}</p>
      </div>
    );
  };

  // Add Supabase info display to your render function
  // Find an appropriate place in your UI to add this:
  const renderSupabaseInfo = () => {
    if (!uploadedImageUrl) return null;
    
    return (
      <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
        <p className="font-semibold">Image stored in Supabase:</p>
        <p className="truncate">{uploadedImageName}</p>
        <p className="truncate text-xs mt-1">{uploadedImageUrl}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-3">Image Editor</h1>
          <p className="text-xl text-gray-500 mb-8">Edit and enhance your images with professional tools</p>
          
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800 mb-1">How it works</h3>
                <p className="text-gray-500">Upload an image and use our tools to edit, enhance, and transform it into a masterpiece.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex flex-wrap mb-6">
                  <button
                    onClick={() => setActiveTab('adjust')}
                    className={`py-2 px-3 m-1 rounded-lg text-sm font-medium ${
                      activeTab === 'adjust'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Adjust
                  </button>
                  <button
                    onClick={() => setActiveTab('filters')}
                    className={`py-2 px-3 m-1 rounded-lg text-sm font-medium ${
                      activeTab === 'filters'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Filters
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`py-2 px-3 m-1 rounded-lg text-sm font-medium ${
                      activeTab === 'text'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => {
                      console.log("Switching to Advanced tab");
                      setActiveTab('advanced');
                      console.log("New activeTab value:", 'advanced');
                    }}
                    className={`py-2 px-3 m-1 rounded-lg text-sm font-medium ${
                      activeTab === 'advanced'
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Advanced
                  </button>
                </div>

                {activeTab === 'adjust' && (
                  <div className="space-y-4">
                    <div>
                      <button
                        onClick={resetAdjustments}
                        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset All
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brightness
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-right">{brightness}%</div>
                    </div>

                    <div className="flex items-center justify-between space-x-4">
                      <button
                        onClick={() => handleRotate('counterclockwise')}
                        className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Rotate Left
                      </button>
                      <button
                        onClick={() => handleRotate('clockwise')}
                        className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center justify-center"
                      >
                        Rotate Right
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <button
                        onClick={() => setCropMode(!cropMode)}
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                          cropMode
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cropMode ? 'Cancel Crop' : 'Crop Image'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contrast
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-right">{contrast}%</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saturation
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-right">{saturation}%</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blur
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={blur}
                        onChange={(e) => setBlur(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-right">{blur}px</div>
                    </div>
                  </div>
                )}

                {activeTab === 'filters' && (
                  <div className="space-y-2">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => handleFilterChange(filter.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                          selectedFilter === filter.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-2xl mr-3">{filter.icon}</span>
                        <div>
                          <div className="font-medium">{filter.name}</div>
                          <div className="text-sm text-gray-500">{filter.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Text
                      </label>
                      <input
                        type="text"
                        value={textOverlay}
                        onChange={(e) => setTextOverlay(e.target.value)}
                        placeholder="Enter your text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Size
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-right">{textSize}px</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Container Width
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="500"
                        value={textContainerSize.width}
                        onChange={(e) => setTextContainerSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-right">{textContainerSize.width}px</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Container Height
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={textContainerSize.height}
                        onChange={(e) => setTextContainerSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-right">{textContainerSize.height}px</div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>💡 Tip: Click and drag the text to position it</p>
                      <p>💡 Tip: Click the text to select and resize it</p>
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-medium text-blue-800 mb-3">Background Removal</h3>
                      <p className="text-sm text-blue-600 mb-3">Remove the background from your image with AI-powered technology.</p>
                      <button 
                        onClick={handleRemoveBackground}
                        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                        disabled={!selectedImage || isRemovingBackground}
                      >
                        {isRemovingBackground ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Removing Background...
                          </>
                        ) : (
                          <>
                            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        Remove Background
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                      <h3 className="text-lg font-medium text-green-800 mb-3">Image Compression</h3>
                      <p className="text-sm text-green-600 mb-3">Reduce file size while maintaining quality with our compression tool.</p>
                      
                      <button 
                        onClick={startCompression}
                        className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                      >
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        Open Compression Tool
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                {showCompressionPage ? (
                  // Compression tool in main panel
                    <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Image Compression Tool</h3>
                      <button 
                        onClick={exitCompressionPage}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* File Upload */}
                      {!compressionFileInput && !compressedImageUrl && (
                        <div className="mt-1 flex justify-center px-6 pt-12 pb-12 border-2 border-gray-200 border-dashed rounded-lg hover:border-green-300 transition-colors duration-200">
                          <div className="space-y-3 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <div className="flex flex-col text-sm text-gray-600 space-y-1">
                              <label htmlFor="main-compression-file-upload" className="relative cursor-pointer bg-white font-medium text-green-600 hover:text-green-700 focus-within:outline-none">
                                <span className="text-lg">Upload a file for compression</span>
                                <input 
                                  id="main-compression-file-upload" 
                                  name="main-compression-file-upload" 
                                  type="file" 
                                  className="sr-only" 
                                  accept="image/*"
                                  onChange={handleCompressionFileChange}
                                />
                              </label>
                              <p className="text-gray-500">JPG, PNG, WebP up to 10MB</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Selected File Info */}
                      {compressionFileInput && !compressedImageUrl && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {compressionFileInput.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {(compressionFileInput.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                type="button"
                                className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                                onClick={() => setCompressionFileInput(null)}
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Quality Settings */}
                      {compressionFileInput && !compressedImageUrl && (
                        <div className="max-w-md mx-auto">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Compression Quality
                          </label>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-600 mr-2">High Compression</span>
                      <input 
                        type="range" 
                              min="65" 
                              max="95" 
                        value={compressionLevel}
                        onChange={(e) => setCompressionLevel(Number(e.target.value))}
                              className="flex-1"
                      />
                            <span className="text-xs text-gray-600 ml-2">High Quality</span>
                          </div>
                          <div className="text-sm text-gray-500 text-center">
                            {compressionLevel}% Quality
                    </div>
                  </div>
                )}
                      
                      {/* Compress Button */}
                      {compressionFileInput && !compressedImageUrl && (
                        <div className="max-w-md mx-auto">
                          <button 
                            onClick={handleCompress}
                            disabled={isCompressing}
                            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center"
                          >
                            {isCompressing ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Compressing...
                              </>
                            ) : (
                              <>
                                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                                Compress Image
                              </>
                            )}
                          </button>
              </div>
                      )}
                      
                      {/* Compression Results */}
                      {compressedImageUrl && compressionStats && (
                        <div className="space-y-6">
                          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 max-w-lg mx-auto">
                            <h4 className="text-lg font-semibold mb-4 text-gray-700 text-center">Compression Results</h4>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                              <div>
                                <p className="text-sm text-gray-500">Original Size</p>
                                <p className="text-xl font-medium text-gray-800">{compressionStats.originalSize}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Compressed Size</p>
                                <p className="text-xl font-medium text-gray-800">{compressionStats.compressedSize}</p>
                              </div>
                              <div className="col-span-2 text-center bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-500">Space Saved</p>
                                <p className="text-xl font-medium text-green-600">{compressionStats.savings}</p>
                              </div>
            </div>
          </div>

                          <div className="mt-4">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={compressedImageUrl} 
                                alt="Compressed Preview" 
                                className="object-contain w-full h-full"
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                            <a 
                              href={compressedImageUrl}
                              download={`compressed-${Date.now()}.${outputFormat}`}
                              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 font-medium rounded-lg shadow-sm transition-colors duration-200 text-center flex items-center justify-center"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download Compressed Image
                            </a>
                            <button
                              onClick={() => {
                                setCompressionFileInput(null);
                                setCompressedImageUrl(null);
                                setCompressionStats(null);
                              }}
                              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              New Compression
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Regular image editor
                  <>
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

                {/* Upload Warning Modal */}
                {showUploadWarning && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {pendingImageFile ? 'Unsaved Changes' : 'Discard Image'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {pendingImageFile 
                          ? 'You have unsaved changes. Uploading a new image will discard your current edits. Are you sure you want to continue?'
                          : 'Are you sure you want to discard the current image? All your edits will be lost.'}
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={cancelUpload}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => loadNewImage(pendingImageFile)}
                          className={`px-4 py-2 rounded-md ${
                            pendingImageFile 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {pendingImageFile ? 'Continue' : 'Discard'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {preview && (
                  <div 
                    ref={cropRef}
                    className="relative"
                    style={{
                      width: '100%',
                      height: rotation % 180 === 0 ? '56.25vw' : '100vw',
                      maxHeight: rotation % 180 === 0 ? '600px' : '1000px',
                      margin: '0 auto',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      {cropMode ? (
                        <ReactCrop
                          crop={crop}
                          onChange={(c) => setCrop(c)}
                          onComplete={handleCropComplete}
                          aspect={undefined}
                          className="w-full h-full"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }}
                        >
                          <img
                            src={previewProcessedImage || preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  backgroundColor: 'transparent'
                                }}
                          />
                        </ReactCrop>
                      ) : (
                        <div className="w-full h-full">
                          {cropRef.current && (
                            <div className="relative w-full h-full">
                              <img
                                src={previewProcessedImage || preview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                                    style={{
                                  maxWidth: '100%',
                                      maxHeight: '100%',
                                      backgroundColor: 'transparent'
                                    }}
                                  />
                                {textOverlay && (
                                <div 
                                  className="absolute pointer-events-none" 
                                  style={{
                                    left: `${textPosition.x}%`,
                                    top: `${textPosition.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    color: textColor,
                                    fontSize: `${textSize}px`,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {textOverlay}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={handleProcess}
                    disabled={!selectedImage || loading}
                    className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${
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
                    ) : 'Apply Changes'}
                  </button>
                  
                  {selectedImage && (
                    <button
                      onClick={handleDiscardImage}
                      disabled={loading}
                      className={`py-3 px-4 rounded-lg text-red-600 font-medium ${
                        loading 
                          ? 'bg-red-50 opacity-50 cursor-not-allowed' 
                          : 'bg-red-50 hover:bg-red-100 transition-colors duration-200'
                      } flex items-center`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Discard Image
                    </button>
                  )}
                </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Use the ProcessedResult component instead */}
        <ProcessedResult processedImage={processedImage} />

        {renderSupabaseError()}
        {renderSupabaseInfo()}
      </div>
    </div>
  );
}

export default Processing; 