"""
python youtube_download.py urls.txt
urls.txt: [r90] https://www.youtube.com/watch?v=dQw4w9WgXcQ r stands for rotation in degrees (90, 180, 270)
urls.txt: [c180] https://vimeo.com/12345678 c stands for cutting the video to a certain duration in seconds
"""
import os
import subprocess
import sys
import time
import re

# Get the URLs file path from command-line arguments
if len(sys.argv) < 2:
    print("Usage: python script.py <urls_file>")
    sys.exit(1)

URLS_FILE = sys.argv[1]
# FIX: The default MAX_FILESIZE_MB constant has been removed.
DOWNLOAD_DIR = 'downloads'

if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

def download_video(url, output_path, max_filesize):
    """
    Downloads a video using yt-dlp. The max_filesize argument is now optional.
    """
    print(f"Downloading video from {url}...")
    
    # FIX: The command is now built dynamically.
    # Start with the base command arguments that are always present.
    command = [
        'yt-dlp',
        '--cookies-from-browser', 'chrome',
        # Request highest quality: try VP9/AV1 first, fallback to H.264, then any format
        '-f', 'bestvideo[height<=2160][vcodec*=vp9]+bestaudio/bestvideo[height<=2160][vcodec*=av01]+bestaudio/bestvideo[height<=2160][vcodec^=avc]+bestaudio/bestvideo[height<=2160]+bestaudio/best[height<=2160]',
        '--merge-output-format', 'mp4',
        '--output', output_path,
    ]

    # If filesize limit specified, treat it as duration in seconds
    if max_filesize is not None:
        duration_seconds = max_filesize  # Now it's duration, not filesize
        command.extend(['--download-sections', f'*0-{duration_seconds}'])
        print(f"Limiting download to first {duration_seconds} seconds")

    # Add the URL at the very end
    command.append(url)
    
    try:
        # By removing capture_output=True, yt-dlp's output will be displayed in real-time.
        subprocess.run(command, check=True, timeout=600)
        print("Download successful.")
    except subprocess.CalledProcessError:
        # The specific error from yt-dlp will be visible in the terminal output.
        print(f"Download failed for {url}.")
        return False
    except subprocess.TimeoutExpired:
        print(f"Download timed out for {url}.")
        return False
    return True

def process_video(command, action_name, output_path):
    """Helper function to run FFmpeg commands and handle errors."""
    print(f"Running {action_name} on {command[2]}...")
    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"{action_name.capitalize()} successful. Output: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error during {action_name}: {e}\nFFmpeg stderr:\n{e.stderr}")
        return False

# Main processing loop
def parse_urls_and_process():
    with open(URLS_FILE, 'r') as file:
        lines = file.readlines()

    for idx, line in enumerate(lines, start=1):
        line = line.strip()
        if not line:
            continue

        line_copy = line
        rotation_match = re.search(r'\[r(\d+)\]', line_copy)
        angle = int(rotation_match.group(1)) if rotation_match else 0
        if rotation_match:
            line_copy = line_copy.replace(rotation_match.group(0), '')

        duration_match = re.search(r'\[c(\d+)\]', line_copy)
        # Parse duration limit in seconds (e.g., [c180] = 180 seconds)
        duration_limit = int(duration_match.group(1)) if duration_match else None
        if duration_match:
            line_copy = line_copy.replace(duration_match.group(0), '')

        url = line_copy.strip()

        print("-" * 50)
        print(f"Processing Video {idx}: URL: {url}")
        
        duration_display = f"{duration_limit} seconds" if duration_limit is not None else "No limit"
        print(f"Rotation: {angle} degrees, Duration limit: {duration_display}")

        # Define file paths
        output_template = os.path.join(DOWNLOAD_DIR, f"video_{idx}.%(ext)s")
        downloaded_file = os.path.join(DOWNLOAD_DIR, f"video_{idx}.mp4")
        processed_file = os.path.join(DOWNLOAD_DIR, f"video_{idx}_final.mp4")

        # 1. Download the video (now with optional filesize limit)
        if os.path.exists(downloaded_file):
            print(f"Video {downloaded_file} already exists. Skipping download.")
        elif not download_video(url, output_template, duration_limit):
            print(f"Skipping video {idx} due to download failure.")
            continue

        # 2. Process video only if rotation is specified
        if angle != 0:
            if os.path.exists(processed_file):
                print(f"Processed video {processed_file} already exists. Skipping processing.")
                print(f"Final file: {processed_file}")
                continue
            ffmpeg_command = ['ffmpeg', '-i', downloaded_file]
            
            video_filters = []
            if angle == 90:
                video_filters.append("transpose=1")
            elif angle == 180:
                video_filters.append("transpose=2,transpose=2")
            elif angle == 270:
                video_filters.append("transpose=2")
            else:
                video_filters.append(f"rotate={angle}*PI/180")
            
            ffmpeg_command.extend([
                '-vf', ",".join(video_filters),
                '-c:v', 'mpeg4',      # Basic encoder without crf
                '-q:v', '12',         # Higher compression for smaller file size
                '-c:a', 'copy',
                processed_file
            ])

            if not process_video(ffmpeg_command, "video processing (rotation)", processed_file):
                print(f"Skipping video {idx} due to processing failure.")
                continue
            
            print(f"Successfully processed video {idx}. Final file: {processed_file}")
        else:
            # If no rotation, the downloaded file is the final file.
            print(f"No rotation needed for video {idx}. Final file: {downloaded_file}")


if __name__ == '__main__':
    start_time = time.time()
    parse_urls_and_process()
    print(f"\nTotal processing time: {time.time() - start_time:.2f} seconds.")