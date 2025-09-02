#!/bin/bash

# --- Script to convert all PNG files in the current directory to JPG using ffmpeg ---

# 1. Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null
then
    echo "Error: ffmpeg could not be found."
    echo "Please install ffmpeg. On macOS, you can use Homebrew by running:"
    echo "  brew install ffmpeg"
    echo "Then try running this script again."
    exit 1
fi

echo "Starting PNG to JPG conversion in the current directory..."
echo "---------------------------------------------------------"

# 2. Loop through all .png files in the current directory
# The 'nullglob' option ensures the loop doesn't run if no .png files are found
shopt -s nullglob
png_files=(*.png)
shopt -u nullglob # Turn off nullglob after use

if [ ${#png_files[@]} -eq 0 ]; then
    echo "No PNG files found in the current directory. Exiting."
    exit 0
fi

for png_file in "${png_files[@]}"; do
    # Get the filename without the extension
    # e.g., "my_image.png" becomes "my_image"
    filename_without_ext=$(basename -- "$png_file" .png)
    
    # Define the output JPG filename
    # e.g., "my_image" becomes "my_image.jpg"
    jpg_file="${filename_without_ext}.jpg"

    echo "Converting \"$png_file\" to \"$jpg_file\"..."

    # Convert the file using ffmpeg
    # -i "$png_file": specifies the input file
    # -hide_banner: suppresses ffmpeg's initial copyright and build information
    # "$jpg_file": specifies the output file name and format (inferred from extension)
    ffmpeg -i "$png_file" -hide_banner "$jpg_file"

    if [ $? -eq 0 ]; then
        echo "Successfully converted \"$png_file\"."
    else
        echo "Error converting \"$png_file\"."
        echo "FFmpeg might have encountered an issue. Check the file or your ffmpeg installation."
    fi
    echo "---------------------------------------------------------"
done

echo "Conversion process finished."
echo "All available PNG files in this directory have been processed."
