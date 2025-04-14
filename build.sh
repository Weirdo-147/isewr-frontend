#!/bin/bash
# exit on error
set -o errexit

echo "Starting build process for LensLynx frontend..."

# Clean install of dependencies from package.json
echo "Installing dependencies from package.json..."
npm ci || npm install

# Ensure axios is installed
echo "Installing axios package..."
npm list axios || npm install axios@1.6.8 --no-save

# Create PNG versions of icons if possible
echo "Checking for svg-to-png conversion tools..."
if command -v convert &> /dev/null || command -v magick &> /dev/null || command -v inkscape &> /dev/null || command -v rsvg-convert &> /dev/null; then
    echo "Creating PNG icons from SVG..."
    chmod +x convert-icons.sh
    ./convert-icons.sh || echo "Icon conversion failed, will use fallback method"
else
    echo "No SVG conversion tools found. Using fallback icon creation."
fi

# Always create fallback icons using Node.js
echo "Creating fallback icons using Node.js..."
node public/create-fallback-favicon.js

# Build the application
echo "Building React application..."
GENERATE_SOURCEMAP=false npm run build

echo "Frontend build completed successfully" 