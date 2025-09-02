# Need to conda activate facefusion first. Also be careful about SRC_FILENAME = "1.jpg" and "--execution-providers", "coreml",
import os
import sys
import time
import shutil
import subprocess
from PIL import Image

# --- Configuration ---
SOURCE_DIR = "/Volumes/Users/DevAdmin/Pictures/Screenshots"
INPUT_DIR_NAME = "input"
OUTPUT_DIR_NAME = "output"
SRC_FILENAME = "faces/1.jpg"
SEEN_FILES_LOG = "seen_files.log"
INTERVAL_SECONDS = 60

SUPPORTED_EXTENSIONS = [".mp4", ".mov", ".webm", ".png", ".jpg", ".jpeg", ".webp"]

# --- Helpers ---
def get_script_dir():
    return os.path.dirname(os.path.abspath(__file__))

def ensure_dirs(script_dir):
    input_path = os.path.join(script_dir, INPUT_DIR_NAME)
    output_path = os.path.join(script_dir, OUTPUT_DIR_NAME)
    os.makedirs(input_path, exist_ok=True)
    os.makedirs(output_path, exist_ok=True)
    return input_path, output_path

def load_seen_files(script_dir):
    log_path = os.path.join(script_dir, SEEN_FILES_LOG)
    if not os.path.exists(log_path):
        return set()
    with open(log_path, "r") as f:
        return {line.strip() for line in f if line.strip()}

def save_seen_file(script_dir, file_path_from_source_dir):
    log_path = os.path.join(script_dir, SEEN_FILES_LOG)
    with open(log_path, "a") as f:
        f.write(file_path_from_source_dir + "\n")

def convert_png_to_jpg(png_path, jpg_path):
    try:
        img = Image.open(png_path)
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        img.save(jpg_path, 'jpeg', quality=90)
        print(f"Converted {os.path.basename(png_path)} to {os.path.basename(jpg_path)}")
        return True
    except Exception as e:
        print(f"Error converting {os.path.basename(png_path)} to JPG: {e}")
        return False

def get_unique_filename(directory, filename):
    base, ext = os.path.splitext(filename)
    counter = 1
    unique_filename = filename
    while os.path.exists(os.path.join(directory, unique_filename)):
        counter += 1
        unique_filename = f"{base}_{counter}{ext}"
        if counter > 1000:
            raise FileExistsError(f"Could not find a unique name for {filename}")
    return unique_filename

def is_supported_extension(filename):
    _, ext = os.path.splitext(filename)
    return ext.lower() in SUPPORTED_EXTENSIONS

def wait_for_file_stable(file_path, source_size, timeout=300, interval=1):
    print(f"Waiting for {os.path.basename(file_path)} to reach size {source_size} bytes...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            current_size = os.path.getsize(file_path)
            if current_size == source_size:
                print(f"{os.path.basename(file_path)} reached expected size.")
                return True
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"Error checking size of {os.path.basename(file_path)}: {e}")
        time.sleep(interval)
    print(f"Timeout waiting for {os.path.basename(file_path)}.")
    return False

def process_single_file_with_facefusion(script_dir, input_file_path_abs, output_dir, src_file_path_abs, facefusion_script_path):
    input_filename = os.path.basename(input_file_path_abs)
    output_file_path_abs = os.path.join(output_dir, input_filename)

    if os.path.exists(output_file_path_abs) and os.path.getsize(output_file_path_abs) > 0:
        print(f"Output for {input_filename} already exists and is non-empty. Skipping.")
        return True

    print(f"Running facefusion for {input_filename}...")
    command = [
        sys.executable,  # Use current Python (your active Conda env)
        facefusion_script_path,
        "headless-run",
        "--processors", "face_swapper", "face_enhancer",
        "--temp-path", "temp",
        "--execution-providers", "coreml",
        "--face-selector-mode", "one",
        "--face-enhancer-model", "gfpgan_1.4",
        "--face-swapper-mode", "inswapper_128_fp16",
        "--face-selector-gender", "female",
        "--face-selector-gender", "female",
        "--face-selector-order", "best-worst",
        "-s", src_file_path_abs,
        "-t", input_file_path_abs,
        "-o", output_file_path_abs
    ]
    print(f"Executing command: {' '.join(command)}")
    try:
        result = subprocess.run(command, text=True, cwd=script_dir)
        if result.returncode != 0:
            print(f"Facefusion failed with exit code {result.returncode}")
            return False
        return True
    except Exception as e:
        print(f"Error running facefusion: {e}")
        return False

# --- Main Loop ---
def main():
    script_dir = get_script_dir()
    input_dir, output_dir = ensure_dirs(script_dir)
    seen_files = load_seen_files(script_dir)

    print(f"Monitoring directory: {SOURCE_DIR} every {INTERVAL_SECONDS} seconds.")
    print(f"Input directory: {input_dir}")
    print(f"Output directory: {output_dir}")
    print(f"Source image: {os.path.join(script_dir, SRC_FILENAME)}")
    print(f"Processed log: {os.path.join(script_dir, SEEN_FILES_LOG)}")
    print(f"Using Python: {sys.executable}")

    src_file_path_abs = os.path.join(script_dir, SRC_FILENAME)
    facefusion_script_path = os.path.join(script_dir, 'facefusion.py')

    if not os.path.exists(src_file_path_abs):
        print(f"ERROR: Source file not found: {src_file_path_abs}")
    if not os.path.exists(facefusion_script_path):
        print(f"ERROR: facefusion.py not found: {facefusion_script_path}")

    while True:
        # Stage 1: Process files in input dir
        print(f"\n{time.strftime('%Y-%m-%d %H:%M:%S')} - Checking input dir...")
        files_in_input = [f for f in os.listdir(input_dir) if os.path.isfile(os.path.join(input_dir, f)) and is_supported_extension(f)]
        for filename_in_input in files_in_input:
            input_file_path_abs = os.path.join(input_dir, filename_in_input)
            process_single_file_with_facefusion(script_dir, input_file_path_abs, output_dir, src_file_path_abs, facefusion_script_path)

        # Stage 2: Watch source dir
        try:
            print(f"\n{time.strftime('%Y-%m-%d %H:%M:%S')} - Checking source dir...")
            current_files_in_source = set(os.listdir(SOURCE_DIR))
            new_files_relative_paths = current_files_in_source - seen_files

            if not new_files_relative_paths:
                print("No new files in source directory.")
            else:
                print(f"Found {len(new_files_relative_paths)} new file(s) in source directory.")
                for filename in new_files_relative_paths:
                    source_file_path_abs = os.path.join(SOURCE_DIR, filename)
                    if os.path.isfile(source_file_path_abs) and is_supported_extension(filename):
                        time.sleep(5)
                        try:
                            source_file_size = os.path.getsize(source_file_path_abs)
                            if source_file_size == 0:
                                print(f"Skipping {filename} (empty file).")
                                save_seen_file(script_dir, filename)
                                seen_files.add(filename)
                                continue
                        except FileNotFoundError:
                            print(f"Skipping {filename} (file disappeared).")
                            continue

                        if filename.lower().endswith(".png"):
                            base_name, _ = os.path.splitext(filename)
                            jpg_filename = f"{base_name}.jpg"
                            source_jpg_path = os.path.join(SOURCE_DIR, jpg_filename)
                            if not os.path.exists(source_jpg_path):
                                if convert_png_to_jpg(source_file_path_abs, source_jpg_path):
                                    try:
                                        os.remove(source_file_path_abs)
                                        print(f"Deleted original PNG: {filename}")
                                    except Exception as e:
                                        print(f"Warning: Could not delete PNG {filename}: {e}")
                                    filename = jpg_filename
                                    source_file_path_abs = source_jpg_path
                                    source_file_size = os.path.getsize(source_file_path_abs)
                                    save_seen_file(script_dir, base_name + ".png")
                                    seen_files.add(base_name + ".png")
                            else:
                                try:
                                    os.remove(source_file_path_abs)
                                    print(f"Deleted original PNG: {filename}")
                                except Exception as e:
                                    print(f"Error deleting PNG {filename}: {e}")
                                save_seen_file(script_dir, filename)
                                seen_files.add(filename)
                                continue

                        unique_input_filename = get_unique_filename(input_dir, filename)
                        input_file_path_abs = os.path.join(input_dir, unique_input_filename)
                        try:
                            shutil.copy2(source_file_path_abs, input_file_path_abs)
                        except Exception as e:
                            print(f"Error copying file {filename}: {e}")
                            save_seen_file(script_dir, filename)
                            seen_files.add(filename)
                            continue

                        if wait_for_file_stable(input_file_path_abs, source_file_size):
                            process_single_file_with_facefusion(script_dir, input_file_path_abs, output_dir, src_file_path_abs, facefusion_script_path)

                        save_seen_file(script_dir, filename)
                        seen_files.add(filename)
                    else:
                        print(f"Skipping unsupported or missing file: {filename}")
                        save_seen_file(script_dir, filename)
                        seen_files.add(filename)
        except FileNotFoundError:
            print(f"Error: Source directory not found: {SOURCE_DIR}")
        except Exception as e:
            print(f"Unexpected error during source dir check: {e}")

        print(f"Finished cycle. Waiting {INTERVAL_SECONDS} seconds...")
        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
