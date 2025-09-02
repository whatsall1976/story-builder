Set-Location -Path "D:\2-facefusion\facefusion" # Keep this line as facefusion.py is in this directory
Write-Host "Changed directory to D:\2-facefusion\facefusion" # Add this line

# Define the source file path
$src_file = "D:\2-facefusion\faces\1.jpg"
$target_dir = "D:\2-facefusion\facefusion\input"
$output_dir = Join-Path $target_dir "out"

# Ensure the output directory exists
if (-not (Test-Path -Path $output_dir)) {
    Write-Host "Output directory $output_dir does not exist, creating it." # Add this line
    New-Item -ItemType Directory -Path $output_dir | Out-Null
}
Write-Host "Output directory check complete." # Add this line

# Loop through each .jpg file in the target directory
Write-Host "Attempting to list files in $target_dir" # Add this line
Get-ChildItem -Path $target_dir | Where-Object { $_.Extension -ieq ".jpg" -or $_.Extension -ieq ".png" -or $_.Extension -ieq ".jpeg" -or $_.Extension -ieq ".webp"  -or $_.Extension -ieq ".JPG"  -or $_.Extension -ieq ".PNG" } | ForEach-Object {
    Write-Host "Processing file: $($_.FullName)" # Add this line inside the loop
    $target_file = $_.FullName
    $output_name = $_.BaseName
    $output_file = Join-Path $output_dir ($_.BaseName + $_.Extension) 

    # Run the Python script using conda run
    # Note: We specify the environment path with -p
    Write-Host "Running conda command for file $($_.BaseName)" # Add this line inside the loop
    conda run -p D:\2-facefusion\facefusion\conda python facefusion.py headless-run --processors face_swapper face_enhancer --face-swapper-pixel-boost 512x512 -s $src_file -t $target_file -o $output_file
    Write-Host "Finished conda command for file $($_.BaseName)" # Add this line inside the loop
}
Write-Host "Script finished." # Add this line at the very end