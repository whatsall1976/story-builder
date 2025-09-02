#!/bin/bash

# Script to convert .m4a to .mp3 and then pitch shift .mp3 files

# Exit immediately if a command exits with a non-zero status.
set -e

INPUT_DIR="."
PITCH_FACTOR="1.25"

echo "--- Starting Audio Processing ---"
echo "Target Directory: $INPUT_DIR"
echo "Pitch Factor: $PITCH_FACTOR"
echo

# Step 1: Convert all .m4a files to .mp3
echo "--- Converting .m4a to .mp3 ---"

find "$INPUT_DIR" -maxdepth 1 -name "*.m4a" -print0 | while IFS= read -r -d $'\0' m4a_file;
do
    # Get filename without extension
    base_name=$(basename "$m4a_file" .m4a)
    output_mp3="${INPUT_DIR}/${base_name}.mp3"
    
    echo "Converting \"$m4a_file\" to \"$output_mp3\"..."
    
    # Convert m4a to mp3 using ffmpeg
    # -y: Overwrite output files without asking
    # -v warning: Suppress verbose output, only show warnings/errors
    ffmpeg -y -v warning -i "$m4a_file" "$output_mp3"
    
    echo "Converted \"$m4a_file\""
    echo
done

echo "--- .m4a to .mp3 Conversion Complete ---"
echo

# Step 2: Pitch shift all .mp3 files
echo "--- Pitch Shifting .mp3 files ---"

find "$INPUT_DIR" -maxdepth 1 -name "*.mp3" -print0 | while IFS= read -r -d $'\0' mp3_file;
do
    # Get filename without extension
    base_name=$(basename "$mp3_file" .mp3)
    output_mp3="${INPUT_DIR}/${base_name}_o.mp3"
    
    # Skip if input and output names are the same (shouldn't happen with _o suffix)
    if [ "$mp3_file" -ef "$output_mp3" ]; then
        echo "Skipping \"$mp3_file\": Input and output are the same file."
        echo
        continue
    fi
    
    echo "Pitch shifting \"$mp3_file\" to \"$output_mp3\"..."
    
    # Pitch shift mp3 using the specified command
    # -y: Overwrite output files without asking
    # -v warning: Suppress verbose output, only show warnings/errors
    # -q:a 0: Highest quality VBR MP3 encoding
    ffmpeg -y -v warning -i "$mp3_file" -af "asetrate=44100*${PITCH_FACTOR},aresample=44100:resampler=soxr" -q:a 0 "$output_mp3"
    
    echo "Pitch shifted \"$mp3_file\""
    echo
done

echo "--- Pitch Shifting Complete ---"
echo "--- Audio Processing Finished ---" 