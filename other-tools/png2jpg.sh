#!/bin/bash

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null
then
    echo "ffmpeg could not be found. Please install it first."
    exit
fi

# Loop through all PNG files in the current directory and convert them to JPG
for file in *.png; do
    if [ -f "$file" ]; then
        ffmpeg -i "$file" -q:v 10 "${file%.png}.jpg"
        echo "Converted: $file to ${file%.png}.jpg"
    else
        echo "No PNG files found."
    fi
done
