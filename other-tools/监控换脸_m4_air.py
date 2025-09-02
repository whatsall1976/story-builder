# venv => venv3.11 in line 143, 147, 154 AND python => python3.11 in line 147 AND  "--execution-providers", "coreml",
import os
import time
import shutil
import subprocess
import glob
from PIL import Image

# --- Configuration ---
SOURCE_DIR = "/Volumes/Users/DevAdmin/Pictures/Screenshots"
INPUT_DIR_NAME = "input"
OUTPUT_DIR_NAME = "output"
SRC_FILENAME = "1.jpg" # Source image for facefusion, expected in the same directory as this script
SEEN_FILES_LOG = "seen_files.log" # File to log processed files
INTERVAL_SECONDS = 60 # Check for new files every 60 seconds

# Supported target file extensions (case-insensitive check will be used)
SUPPORTED_EXTENSIONS = [".mp4", ".mov", ".webm", ".png", ".jpg", ".jpeg", ".webp"]

# --- Script Logic ---
def get_script_dir():
    """Get the directory where the current script is located."""
    return os.path.dirname(os.path.abspath(__file__))

def ensure_dirs(script_dir):
    """Ensure necessary directories (input, output) exist."""
    input_path = os.path.join(script_dir, INPUT_DIR_NAME)
    output_path = os.path.join(script_dir, OUTPUT_DIR_NAME)
    os.makedirs(input_path, exist_ok=True)
    os.makedirs(output_path, exist_ok=True)
    return input_path, output_path

def load_seen_files(script_dir):
    """Load the set of previously seen files from the log (original filenames from SOURCE_DIR)."""
    log_path = os.path.join(script_dir, SEEN_FILES_LOG)
    if not os.path.exists(log_path):
        return set()
    with open(log_path, "r") as f:
        seen_files = {line.strip() for line in f if line.strip()}
    return seen_files

def save_seen_file(script_dir, file_path_from_source_dir):
    """Save an original file path from SOURCE_DIR to the seen files log."""
    log_path = os.path.join(script_dir, SEEN_FILES_LOG)
    with open(log_path, "a") as f:
        f.write(file_path_from_source_dir + "\n")

def convert_png_to_jpg(png_path, jpg_path):
    """Converts a PNG image to JPG."""
    try:
        img = Image.open(png_path)
        # Convert to RGB if it's RGBA (common for PNGs)
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        img.save(jpg_path, 'jpeg', quality=90) # Adjust quality as needed (0-100)
        print(f"Converted {os.path.basename(png_path)} to {os.path.basename(jpg_path)}")
        return True
    except Exception as e:
        print(f"Error converting {os.path.basename(png_path)} to JPG: {e}")
        return False
    
def get_unique_filename(directory, filename):
    """Ensure a filename is unique in a directory by appending _2, _3, etc."""
    base, ext = os.path.splitext(filename)
    counter = 1
    unique_filename = filename
    while os.path.exists(os.path.join(directory, unique_filename)):
        counter += 1
        unique_filename = f"{base}_{counter}{ext}"
        if counter > 1000: # Prevent infinite loops
            raise FileExistsError(f"Could not find a unique name for {filename} in {directory} after 1000 tries.")
    return unique_filename

def is_supported_extension(filename):
    """Check if the file extension is in the supported list."""
    _, ext = os.path.splitext(filename)
    return ext.lower() in SUPPORTED_EXTENSIONS

def wait_for_file_stable(file_path, source_size, timeout=300, interval=1):
    """Wait for a file at file_path to reach source_size, or until timeout."""
    print(f"Waiting for {os.path.basename(file_path)} to reach size {source_size} bytes...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            current_size = os.path.getsize(file_path)
            if current_size == source_size:
                print(f"{os.path.basename(file_path)} reached expected size.")
                return True
        except FileNotFoundError:
            pass # File might be temporarily moved or deleted, wait and check again
        except Exception as e:
            print(f"Error checking size of {os.path.basename(file_path)}: {e}")
        time.sleep(interval)
    print(f"Timeout waiting for {os.path.basename(file_path)} to reach expected size. (Last size: {os.path.getsize(file_path) if os.path.exists(file_path) else 'N/A'})")
    return False

def process_single_file_with_facefusion(script_dir, input_file_path_abs, output_dir, src_file_path_abs, python_interpreter, facefusion_script_path):
    """
    Handles running facefusion for a given input file.
    It checks if the corresponding output file exists and is non-empty before processing.
    Returns True if processed successfully or already processed, False otherwise.
    """
    input_filename = os.path.basename(input_file_path_abs)
    output_file_path_abs = os.path.join(output_dir, input_filename) # Output name matches input name

    # Check if this file has already been successfully processed (output exists and is non-empty)
    if os.path.exists(output_file_path_abs) and os.path.getsize(output_file_path_abs) > 0:
        print(f"Output for {input_filename} already exists and is non-empty. Skipping processing in input directory.")
        return True # Considered processed

    print(f"Running facefusion for {input_filename} from input directory...")
    command = [
        python_interpreter,
        facefusion_script_path,
        "headless-run",
        "--processors", "face_swapper", "face_enhancer",
        "--temp-path", "temp",
        "--execution-providers", "coreml",
        "--face-selector-mode", "one",
        "--face-selector-gender", "female",
        "--face-selector-order", "best-worst",
        "-s", src_file_path_abs,
        "-t", input_file_path_abs,
        "-o", output_file_path_abs
    ]
    print(f"Executing command: {' '.join(command)}")

    try:
        result = subprocess.run(
            command,
            text=True,
            cwd=script_dir
        )
        # The stdout/stderr are now directly printed to the console due to not capturing output.
        # print("Facefusion stdout:\n", result.stdout)
        # if result.stderr:
        #     print("Facefusion stderr:\n", result.stderr)

        if result.returncode != 0:
            print(f"Facefusion failed for {input_filename} with exit code {result.returncode}")
            return False
        else:
            print(f"Facefusion completed successfully for {input_filename}")
            return True

    except FileNotFoundError:
        print(f"ERROR: Could not find Python interpreter or facefusion.py script. Ensure paths are correct and venv is active.")
        return False
    except Exception as e:
        print(f"Error running facefusion for {input_filename}: {e}")
        return False

def main():
    script_dir = get_script_dir()
    input_dir, output_dir = ensure_dirs(script_dir)
    seen_files = load_seen_files(script_dir)

    print(f"Monitoring directory: {SOURCE_DIR} for new files every {INTERVAL_SECONDS} seconds.")
    print(f"Input directory for media: {input_dir}")
    print(f"Output directory for processed media: {output_dir}")
    print(f"Using source image for facefusion: {os.path.join(script_dir, SRC_FILENAME)}")
    print(f"Using virtual environment: {os.path.join(script_dir, 'venv3.11')}")
    print(f"Processed source files log: {os.path.join(script_dir, SEEN_FILES_LOG)}")

    src_file_path_abs = os.path.join(script_dir, SRC_FILENAME)
    python_interpreter = os.path.join(script_dir, 'venv3.11', 'bin', 'python3.11')
    facefusion_script_path = os.path.join(script_dir, 'facefusion.py')

    # Basic check for existence of critical files/dirs
    if not os.path.exists(src_file_path_abs):
        print(f"ERROR: Source file not found: {src_file_path_abs}. Please ensure 1.jpg is in the script directory.")
    if not os.path.exists(python_interpreter):
         print(f"ERROR: Python interpreter not found at {python_interpreter}. Please ensure the 'venv3.11' folder is in the script directory and the venv is built.")
    if not os.path.exists(facefusion_script_path):
         print(f"ERROR: facefusion.py not found at {facefusion_script_path}. Please ensure it's in the script directory.")

    while True:
        # --- Stage 1: Process existing files in the input directory ---
        # This will run regardless of SOURCE_DIR accessibility.
        print(f"\n{time.strftime('%Y-%m-%d %H:%M:%S')} - Checking for un-processed files in input directory: {input_dir}...")
        
        files_in_input = [f for f in os.listdir(input_dir) if os.path.isfile(os.path.join(input_dir, f)) and is_supported_extension(f)]
        
        if not files_in_input:
            print("No supported files found in input directory to process.")
        else:
            processed_count_in_input = 0
            for filename_in_input in files_in_input:
                input_file_path_abs = os.path.join(input_dir, filename_in_input)
                if process_single_file_with_facefusion(script_dir, input_file_path_abs, output_dir, src_file_path_abs, python_interpreter, facefusion_script_path):
                    processed_count_in_input += 1
            
            if processed_count_in_input > 0:
                print(f"Processed {processed_count_in_input} files from input directory in this cycle.")
            else:
                print("No new files processed from input directory in this cycle.")


        # --- Stage 2: Check SOURCE_DIR for new files and copy them to input_dir ---
        # This part will only run if SOURCE_DIR is accessible.
        try:
            print(f"\n{time.strftime('%Y-%m-%d %H:%M:%S')} - Checking for new files in source directory: {SOURCE_DIR}...")
            current_files_in_source = set(os.listdir(SOURCE_DIR))

            new_files_relative_paths = current_files_in_source - seen_files

            if not new_files_relative_paths:
                print("No new files found in source directory.")
            else:
                print(f"Found {len(new_files_relative_paths)} potential new files in source directory.")
                
                # Process new files from SOURCE_DIR
                for filename in new_files_relative_paths:
                    # Double-check if file is already seen (debugging)
                    if filename in seen_files:
                        print(f"WARNING: {filename} is in seen_files but was detected as new. Skipping.")
                        continue
                        
                    source_file_path_abs = os.path.join(SOURCE_DIR, filename)

                    # Check if it's a supported file and exists
                    if os.path.isfile(source_file_path_abs) and is_supported_extension(filename):
                        print(f"Processing new supported file from source: {filename}")

                        # --- Wait for source file to stabilize before copying ---
                        source_stabilize_wait_seconds = 5
                        print(f"Waiting {source_stabilize_wait_seconds}s for source file to stabilize: {filename}")
                        time.sleep(source_stabilize_wait_seconds)

                        try:
                            source_file_size = os.path.getsize(source_file_path_abs)
                            if source_file_size == 0:
                                print(f"Warning: Source file {filename} has size 0. Skipping processing.")
                                save_seen_file(script_dir, filename) # Log even if size is 0
                                seen_files.add(filename)
                                continue
                        except FileNotFoundError:
                            print(f"Warning: Source file {filename} disappeared after initial listing. Skipping.")
                            continue
                        except Exception as e:
                            print(f"Error getting size of source file {filename}: {e}. Skipping.")
                            save_seen_file(script_dir, filename)
                            seen_files.add(filename)
                            continue

                        is_png = filename.lower().endswith(".png")
                        
                        if is_png:
                            # Convert PNG to JPG in the source directory, then delete PNG
                            base_name, _ = os.path.splitext(filename)
                            jpg_filename = f"{base_name}.jpg"
                            source_jpg_path = os.path.join(SOURCE_DIR, jpg_filename)
                            
                            # Check if JPG already exists in source directory
                            if os.path.exists(source_jpg_path):
                                print(f"JPG version {jpg_filename} already exists in source directory. Deleting PNG {filename}.")
                                try:
                                    os.remove(source_file_path_abs)
                                    print(f"Deleted original PNG: {filename}")
                                except Exception as e:
                                    print(f"Error deleting PNG {filename}: {e}")
                                save_seen_file(script_dir, filename)
                                seen_files.add(filename)
                                continue
                            
                            # Convert PNG to JPG in source directory
                            print(f"Converting PNG {filename} to JPG in source directory: {jpg_filename}")
                            if not convert_png_to_jpg(source_file_path_abs, source_jpg_path):
                                print(f"Failed to convert PNG {filename}. Skipping processing.")
                                save_seen_file(script_dir, filename)
                                seen_files.add(filename)
                                continue
                            
                            # Delete original PNG after successful conversion
                            try:
                                os.remove(source_file_path_abs)
                                print(f"Deleted original PNG: {filename}")
                            except Exception as e:
                                print(f"Warning: Could not delete original PNG {filename}: {e}")
                            
                            # Update variables to process the new JPG file
                            filename = jpg_filename
                            source_file_path_abs = source_jpg_path
                            source_file_size = os.path.getsize(source_file_path_abs)
                            
                            # Log the original PNG as seen
                            save_seen_file(script_dir, os.path.splitext(jpg_filename)[0] + ".png")
                            seen_files.add(os.path.splitext(jpg_filename)[0] + ".png")
                            print(f"Logged original PNG as seen and will now process JPG: {filename}")

                        # Determine the intended name in the input directory
                        input_filename_for_processing = filename

                        # Get a unique name for the file in the input directory
                        unique_input_filename = get_unique_filename(input_dir, input_filename_for_processing)
                        input_file_path_abs = os.path.join(input_dir, unique_input_filename)

                        # Copy file to input directory
                        try:
                            print(f"Starting copy of {filename} to {unique_input_filename}")
                            shutil.copy2(source_file_path_abs, input_file_path_abs)
                            print("Copy initiated.")
                        except Exception as e:
                            print(f"Error copying file {filename}: {e}")
                            save_seen_file(script_dir, filename)
                            seen_files.add(filename)
                            continue

                        # Wait for the copied file to be stable (size matches source)
                        if not wait_for_file_stable(input_file_path_abs, source_file_size):
                            print(f"Skipping processing for {unique_input_filename} due to copy not completing within timeout.")
                            save_seen_file(script_dir, filename)
                            seen_files.add(filename)
                            continue

                        # Run facefusion
                        if process_single_file_with_facefusion(script_dir, input_file_path_abs, output_dir, src_file_path_abs, python_interpreter, facefusion_script_path):
                            # If successfully processed, log the current file as seen (JPG filename for converted files)
                            save_seen_file(script_dir, filename)
                            seen_files.add(filename)
                            print(f"Logged source file {filename} as seen.")
                        else:
                            # If facefusion failed, still log as seen to avoid endless retries
                            save_seen_file(script_dir, filename)
                            seen_files.add(filename)
                            print(f"Logged source file {filename} as seen, despite processing failure in this cycle.")


                    elif os.path.isfile(source_file_path_abs) and not is_supported_extension(filename):
                         print(f"Skipping unsupported file extension: {filename}")
                         save_seen_file(script_dir, filename) # Log unsupported files too, so we don't keep seeing them
                         seen_files.add(filename)
                    else:
                         print(f"Skipping {filename} (not a supported file or no longer exists in source).")


        except FileNotFoundError:
            print(f"Error: Source directory not found: {SOURCE_DIR}. Skipping checking for new files from source.")
        except Exception as e:
            print(f"An unexpected error occurred during source directory check: {e}")

        print(f"Finished check cycle. Waiting {INTERVAL_SECONDS} seconds...")
        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    main()