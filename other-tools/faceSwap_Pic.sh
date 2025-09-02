#!/bin/bash

# Define the source file path for facefusion
src_file="1.jpg"

# Define the input and output directories
input_dir="/Volumes/sandisk/4hobby/ent/CIAG/TG_TEMP/input"
output_dir="/Volumes/sandisk/4hobby/ent/CIAG/TG_TEMP/input/out"

# Create output directory if it doesn't exist
mkdir -p "$output_dir"

# Loop through each target file in the input directory (png and jpg extensions)
# Using find is more robust for various case extensions
find "$input_dir" -maxdepth 1 -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r target_file; do
    # Extract the base name (e.g., s1 from /path/to/s1.png)
    output_name=$(basename "$target_file")

    # Define a temporary file path for the JPG conversion
    temp_jpg="${input_dir}/temp_${output_name%.*}.jpg"

    # Convert the target file to JPG using ffmpeg
    echo "Converting '$target_file' to temporary JPG: '$temp_jpg'"
    ffmpeg -loglevel error -y -i "$target_file" -q:v 2 "$temp_jpg"

    # Check if ffmpeg conversion was successful
    if [ $? -eq 0 ]; then
        # Construct the final output file path (based on original name, but with .jpg extension)
        final_output_file="${output_dir}/${output_name%.*}.jpg"

        echo "Running facefusion for '$target_file' using temporary '$temp_jpg'"
        # Run the Python script with the constant source, temporary target, and final output file
        python facefusion.py headless-run --processors face_swapper face_enhancer -s "$src_file" -t "$temp_jpg" -o "$final_output_file"

        # Remove the temporary JPG file
        echo "Removing temporary file: '$temp_jpg'"
        rm "$temp_jpg"
    else
        echo "ffmpeg conversion failed for '$target_file'. Skipping facefusion for this file."
    fi
done

echo "Processing complete."