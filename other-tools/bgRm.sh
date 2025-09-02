#!/bin/bash

# Fully Automatic Background Removal Script for macOS - Batch Processing
# Removes background of all images in a folder and saves to ./output
# Converts all supported images to PNG using ffmpeg before processing with Preview

function show_usage() {
    echo "Usage: $0 input_folder"
    echo ""
    echo "Automatically remove background from all images in the specified folder"
    echo "(.jpg, .JPEG, .png, .PN, .JPG, .jpeg, .webp) and save as transparent"
    echo "PNG files in a new './output' subdirectory."
    echo ""
    echo "REQUIREMENTS: ffmpeg must be installed (e.g., via Homebrew: brew install ffmpeg)"
    echo ""
    echo "EXAMPLE:"
    echo "  $0 ~/Pictures/my_images"
    echo ""
}

# Check arguments
if [[ $# -ne 1 || "$1" == "-h" || "$1" == "--help" ]]; then
    show_usage
    exit 0
fi

INPUT_FOLDER="$1"
OUTPUT_FOLDER="./output"

# Check if input folder exists and is a directory
if [[ ! -d "$INPUT_FOLDER" ]]; then
    echo "❌ ERROR: Input folder '$INPUT_FOLDER' does not exist or is not a directory"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "❌ ERROR: ffmpeg is not installed. Please install it (e.g., via Homebrew: brew install ffmpeg)"
    exit 1
fi

# Create output folder if it doesn't exist
mkdir -p "$OUTPUT_FOLDER"

echo "🚀 Starting batch background removal..."
echo "📁 Input Folder: $INPUT_FOLDER"
echo "📂 Output Folder: $OUTPUT_FOLDER"

TEMP_PNG_FOLDER="$INPUT_FOLDER/temp_png"
mkdir -p "$TEMP_PNG_FOLDER"

echo "🔄 Converting supported images to PNG using ffmpeg in '$TEMP_PNG_FOLDER'..."

# Find all supported image files and convert them to PNG
find "$INPUT_FOLDER" -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.JPEG" -o -name "*.png" -o -name "*.PNG" -o -name "*.JPG" -o -name "*.jpeg" -o -name "*.webp" \) -print0 | while IFS= read -r -d $'\0' INPUT_FILE; do
    input_filename=$(basename "$INPUT_FILE")
    input_filename_without_ext="${input_filename%.*}"
    temp_png_file="$TEMP_PNG_FOLDER/${input_filename_without_ext}.png"
    echo "   Converting: $input_filename -> $temp_png_file"
    ffmpeg -i "$INPUT_FILE" "$temp_png_file" -n 2>/dev/null # -n prevents overwriting if it exists
done

echo "✅ Conversion to PNG complete."

# Process the converted PNG files
find "$TEMP_PNG_FOLDER" -maxdepth 1 -type f -name "*.png" -print0 | while IFS= read -r -d $'\0' TEMP_PNG_FILE; do
    echo ""
    echo "Processing PNG file: $(basename "$TEMP_PNG_FILE")"

    # Generate final output filename in the OUTPUT_FOLDER
    temp_png_filename=$(basename "$TEMP_PNG_FILE")
    temp_png_filename_without_ext="${temp_png_filename%.*}"
    FINAL_OUTPUT_FILE="$OUTPUT_FOLDER/${temp_png_filename_without_ext}_transparent.png"

    echo "💾 Intended Output: $FINAL_OUTPUT_FILE"

    # Convert to absolute paths
    INPUT_FULL=$(realpath "$TEMP_PNG_FILE") # Processing the temporary PNG

    echo "🔍 Processing: $INPUT_FULL"

    # Kill existing Preview instances
    killall Preview 2>/dev/null && sleep 1

    echo "🔄 Opening Preview and removing background..."

    # Launch Preview directly with the file
    open -a Preview "$INPUT_FULL"
    sleep 1
    
    #Explicitly set permissions on the temporary file BEFORE AppleScript runs
    chmod 644 "$INPUT_FULL"
    sleep 2

# Modified AppleScript: Remove background and CLOSE (without explicit save)
osascript << EOF
try
    tell application "Preview"
        activate
    end tell
    delay 1

    tell application "System Events"
        tell process "Preview"
            set frontmost to true
            delay 0.5

            -- Remove background
            keystroke "k" using {shift down, command down}
            delay 2

            -- Close the original temporary file
            keystroke "w" using {command down}
            delay 1
            -- Handle "Don't Save" prompt for the original temp file (as we've saved a new one)
            try
                if exists sheet 1 of window 1 then
                    if exists button "Don't Save" of sheet 1 of window 1 then
                        click button "Don't Save" of sheet 1 of window 1
                        delay 0.5
                    end if
                end if
            end try
        end tell
    end tell

    delay 1

    tell application "Preview"
        -- Don't quit
    end tell

    return "SUCCESS"
on error errorMessage
    tell application "Preview"
        -- Don't quit
    end tell
    return "ERROR: " & errorMessage
end try
EOF

    # Wait for operations to complete
    sleep 3

    # Now, move the processed (hopefully transparent) temporary PNG to the output folder
    if [[ -f "$INPUT_FULL" ]]; then # Check if the temporary file still exists
        echo "➡️ Moving processed file to: $FINAL_OUTPUT_FILE"
        mv "$INPUT_FULL" "$FINAL_OUTPUT_FILE"
        # Change permissions of the output file to be readable
        chmod 644 "$FINAL_OUTPUT_FILE" # Owner: read/write, Group/Others: read

        if command -v sips >/dev/null 2>&1; then
            # Check for transparency
            if sips -g hasAlpha "$FINAL_OUTPUT_FILE" 2>/dev/null | grep -q "hasAlpha: yes"; then
                echo "   Transparency: ✅ Yes - Background removed!"
            else
                echo "   Transparency: ⚠️ No alpha channel detected"
            fi
        fi
    else
        echo "❌ ERROR: Temporary processed file not found: $INPUT_FULL"
    fi

done