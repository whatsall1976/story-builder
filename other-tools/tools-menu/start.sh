#!/bin/bash

# Get the directory of the script
DIR="$(cd "$(dirname "$0")" && pwd)"

# Navigate to the directory
cd "$DIR" || { echo "Directory not found"; exit 1; }

# Start the Python HTTP server in the background
python3 -m http.server 8000 &

# Wait a moment to ensure the server starts
sleep 2

# Open the default web browser to the specified URL
open http://localhost:8000/index.html