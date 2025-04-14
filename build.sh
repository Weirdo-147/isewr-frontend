#!/bin/bash
# exit on error
set -o errexit

echo "Starting build process for ISEWR frontend..."

# Clean install of dependencies from package.json
echo "Installing dependencies from package.json..."
npm ci || npm install

# Ensure axios is installed
echo "Installing axios package..."
npm list axios || npm install axios@1.6.8 --no-save

# Build the application
echo "Building React application..."
GENERATE_SOURCEMAP=false npm run build

echo "Frontend build completed successfully" 