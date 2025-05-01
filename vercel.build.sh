#!/bin/bash

# Create a directory for the build output
mkdir -p public

# Copy all necessary files to the public directory
cp index.html public/
cp style.css public/
cp script.js public/

echo "Build completed successfully!" 