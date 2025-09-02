#!/bin/bash

# Script to rename image files in media subfolders to sequential numbers (1.jpg, 2.jpg, etc.)
# Files are sorted by creation date and time before renaming

echo "Starting image renaming process..."

# Check if media directory exists
if [ ! -d "../media" ]; then
    echo "Error: ../media directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Function to rename images in a folder
rename_images_in_folder() {
    local folder="$1"
    echo "Processing folder: $folder"
    
    # Change to the folder
    cd "$folder" || return
    
    # Get all image files sorted by creation time (birth time on macOS)
    # -t sorts by modification time, -U sorts by creation time
    local image_files
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS: use stat -f %B for birth time (creation time)
        image_files=$(find . -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) -exec stat -f "%B %N" {} \; | sort -n | cut -d' ' -f2-)
    else
        # Linux: use stat -c %Y for modification time (creation time not available)
        image_files=$(find . -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) -exec stat -c "%Y %n" {} \; | sort -n | cut -d' ' -f2-)
    fi
    
    # Convert to array
    local files_array=()
    while IFS= read -r line; do
        if [ -n "$line" ]; then
            # Remove leading ./
            line=${line#./}
            files_array+=("$line")
        fi
    done <<< "$image_files"
    
    local count=${#files_array[@]}
    echo "Found $count image files in $folder"
    
    if [ $count -eq 0 ]; then
        echo "No image files found in $folder"
        cd - > /dev/null
        return
    fi
    
    # Create temporary directory for renaming process
    local temp_dir="temp_rename_$$"
    mkdir "$temp_dir"
    
    # First, move all files to temp directory with new names
    local counter=1
    for file in "${files_array[@]}"; do
        if [ -f "$file" ]; then
            # Get file extension
            local extension="${file##*.}"
            local new_name="${counter}.${extension}"
            
            echo "  Renaming: $file -> $new_name"
            mv "$file" "$temp_dir/$new_name"
            ((counter++))
        fi
    done
    
    # Move all files back from temp directory
    mv "$temp_dir"/* . 2>/dev/null
    rmdir "$temp_dir"
    
    echo "Completed renaming in $folder"
    cd - > /dev/null
}

# Main processing
echo "Scanning for subfolders in ../media/..."

# Find all subdirectories in media
for subfolder in ../media/*/; do
    if [ -d "$subfolder" ]; then
        rename_images_in_folder "$subfolder"
        echo "---"
    fi
done

echo "Image renaming process completed!"
echo ""
echo "Usage: Run this script from the story_builder directory"
echo "Example: ./rename_slides_img.sh"