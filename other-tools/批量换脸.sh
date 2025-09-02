#!/bin/bash
shopt -s extglob # Enable extended pattern matching if not enabled by default

cd "$(dirname "$0")" # Navigate to the script's directory
source venv/bin/activate # Activate the virtual environment

# Define the source file path
src_file="1.jpg"

# Loop through each target file in the input directory with specified extensions
for target_file in /Volumes/sandisk/4hobby/ent/CIAG/TG_TEMP/input/*.@(jpg|jpeg|png|webp); do
    # Extract the filename with extension
    filename=$(basename "$target_file")

    # Construct the output file path using the original filename
    output_file="/Volumes/sandisk/4hobby/ent/CIAG/TG_TEMP/input/out/${filename}"

    # Ensure the output directory exists for this file
    output_dir=$(dirname "$output_file")
    mkdir -p "$output_dir"

    # Run the Python script with the constant source, current target, and corresponding output file
    python facefusion.py headless-run --processors face_swapper face_enhancer -s "$src_file" -t "$target_file" -o "$output_file"
done