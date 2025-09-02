#!/bin/bash

# Check if correct number of arguments is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <source_file> <target_parent_directory>"
    exit 1
fi

source_file="$1"
target_parent_dir="$2"

# Check if source file exists
if [ ! -f "$source_file" ]; then
    echo "Error: Source file '$source_file' does not exist"
    exit 1
fi

# Check if target parent directory exists
if [ ! -d "$target_parent_dir" ]; then
    echo "Error: Target parent directory '$target_parent_dir' does not exist"
    exit 1
fi

# Get the filename from the source path
filename=$(basename "$source_file")

# Loop through all directories in the target parent directory
for dir in "$target_parent_dir"/*/; do
    if [ -d "$dir" ]; then
        echo "Copying $filename to $dir"
        cp -f "$source_file" "$dir$filename"
    fi
done

echo "Copy operation completed!"