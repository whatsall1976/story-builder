#!/usr/bin/env python3
import os
import re
import shutil
from collections import defaultdict

def parse_filename(filename):
    """Parse filename to extract sequence information"""
    # Match patterns like 1-1-1.jpg or 4-2-1-a.jpg
    pattern1 = r'^(\d+)-(\d+)-(\d+)\.jpg$'  # num-num-num.jpg
    pattern2 = r'^(\d+)-(\d+)-(\d+)-([a-z])\.jpg$'  # num-num-num-letter.jpg
    
    match1 = re.match(pattern1, filename)
    if match1:
        return (int(match1.group(1)), int(match1.group(2)), int(match1.group(3)), None)
    
    match2 = re.match(pattern2, filename)
    if match2:
        return (int(match2.group(1)), int(match2.group(2)), int(match2.group(3)), match2.group(4))
    
    return None

def group_photos_by_sequence(photo_files):
    """Group photos by everything except the last number/letter"""
    sequences = defaultdict(list)
    
    for filename in photo_files:
        parsed = parse_filename(filename)
        if parsed:
            if parsed[3] is None:  # num-num-num.jpg format
                # Group by first two numbers, drop the last (third) number
                seq_key = (parsed[0], parsed[1])
                sequences[seq_key].append((filename, parsed))
            else:  # num-num-num-letter.jpg format  
                # Group by first three numbers, drop the last (letter)
                seq_key = (parsed[0], parsed[1], parsed[2])
                sequences[seq_key].append((filename, parsed))
    
    # Sort files within each sequence
    for seq_key in sequences:
        if any(x[1][3] is not None for x in sequences[seq_key]):  # Has letter variants
            sequences[seq_key].sort(key=lambda x: (x[1][3] or ''))  # Sort by letter
        else:  # No letter variants, sort by third number
            sequences[seq_key].sort(key=lambda x: x[1][2])  # Sort by third number
    
    return sequences

def create_folders_with_consecutive_photos(sequences, source_dir, max_photos_per_folder=5):
    """Create folders with consecutive photos, max 5 per folder, never mixing sequences"""
    folder_num = 1
    
    # Sort sequences by their key (to process in order)
    sorted_sequences = sorted(sequences.items())
    
    for seq_key, photos in sorted_sequences:
        # Each sequence must be processed separately - never mix sequences
        remaining_photos = photos[:]
        
        while remaining_photos:
            # Take up to max_photos_per_folder from current sequence
            batch = remaining_photos[:max_photos_per_folder]
            remaining_photos = remaining_photos[max_photos_per_folder:]
            
            # Create folder with this batch
            create_and_populate_folder(folder_num, batch, source_dir)
            folder_num += 1

def create_and_populate_folder(folder_num, photos, source_dir):
    """Create folder and copy photos to it with renamed files (1.jpg, 2.jpg, etc.)"""
    folder_name = str(folder_num)
    folder_path = os.path.join(source_dir, folder_name)
    
    # Create folder if it doesn't exist
    os.makedirs(folder_path, exist_ok=True)
    
    print(f"Creating folder '{folder_name}' with {len(photos)} photos:")
    for i, (filename, parsed) in enumerate(photos, 1):
        source_path = os.path.join(source_dir, filename)
        new_filename = f"{i}.jpg"
        dest_path = os.path.join(folder_path, new_filename)
        shutil.copy2(source_path, dest_path)
        print(f"  Copied: {filename} -> {new_filename}")
    print()

def main():
    source_dir = "./"
    
    # Get all jpg files
    all_files = [f for f in os.listdir(source_dir) if f.lower().endswith('.jpg')]
    
    # Filter files that match our patterns
    photo_files = []
    for filename in all_files:
        if parse_filename(filename):
            photo_files.append(filename)
    
    print(f"Found {len(photo_files)} photos matching the pattern")
    
    # Group photos by sequence
    sequences = group_photos_by_sequence(photo_files)
    print(f"Found {len(sequences)} unique sequences")
    
    # Create folders with consecutive photos
    create_folders_with_consecutive_photos(sequences, source_dir)
    
    print("Photo organization complete!")

if __name__ == "__main__":
    main()