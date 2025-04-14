// This script creates a fallback favicon from the base64 data
const fs = require('fs');
const path = require('path');

console.log('Creating fallback favicon from base64 data...');

try {
  // Read the base64 data
  const base64Data = fs.readFileSync(path.join(__dirname, 'favicon-base64.txt'), 'utf8');
  
  // Create the binary data
  const binaryData = Buffer.from(base64Data, 'base64');
  
  // Write the binary data to a .ico file
  fs.writeFileSync(path.join(__dirname, 'favicon.ico'), binaryData);
  
  console.log('Created fallback favicon.ico successfully');
  
  // Also create a PNG version for older browsers
  fs.writeFileSync(path.join(__dirname, 'favicon.png'), binaryData);
  console.log('Created fallback favicon.png successfully');
  
  // Create a simple apple-touch-icon if needed
  if (!fs.existsSync(path.join(__dirname, 'apple-touch-icon.png'))) {
    fs.writeFileSync(path.join(__dirname, 'apple-touch-icon.png'), binaryData);
    console.log('Created fallback apple-touch-icon.png');
  }
  
  console.log('Fallback favicons created successfully');
} catch (error) {
  console.error('Error creating fallback favicon:', error.message);
} 