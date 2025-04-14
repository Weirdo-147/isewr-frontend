#!/bin/bash
# exit on error
set -o errexit

# Install dependencies
npm ci

# Build the application
npm run build

echo "Frontend build completed successfully" 