#!/usr/bin/env python3
import os
import re
import json
import sys
from pathlib import Path

def extract_pagedata_from_html(html_file_path):
    """Extract pageData JavaScript object from HTML file"""
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Find the pageData JavaScript object
        pattern = r'var pageData = ({[\s\S]*?});(?=\s*</script>|\s*var|\s*function|\s*document)'
        match = re.search(pattern, html_content)
        
        if not match:
            print(f"  ❌ No pageData found in {html_file_path}")
            return None
            
        pagedata_str = match.group(1)
        
        # Parse as JSON
        try:
            pagedata = json.loads(pagedata_str)
            return pagedata
        except json.JSONDecodeError as e:
            print(f"  ❌ Failed to parse pageData JSON in {html_file_path}: {e}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error reading {html_file_path}: {e}")
        return None

def process_story_folder(folder_path):
    """Process all pageN.html files in a story folder"""
    folder_path = Path(folder_path)
    
    if not folder_path.exists():
        print(f"❌ Folder does not exist: {folder_path}")
        return
        
    print(f"\n📁 Processing folder: {folder_path}")
    
    # Find all pageN.html files
    page_files = []
    for file_path in folder_path.glob("page*.html"):
        match = re.match(r'page(\d+)\.html', file_path.name, re.IGNORECASE)
        if match:
            page_num = int(match.group(1))
            page_files.append((page_num, file_path))
    
    if not page_files:
        print(f"  ❌ No pageN.html files found in {folder_path}")
        return
    
    # Sort by page number
    page_files.sort(key=lambda x: x[0])
    
    # Extract data from each page
    pages_data = {}
    extracted_count = 0
    
    for page_num, file_path in page_files:
        print(f"  📄 Extracting page{page_num}.html...")
        pagedata = extract_pagedata_from_html(file_path)
        
        if pagedata:
            pages_data[str(page_num)] = pagedata
            extracted_count += 1
            print(f"  ✅ Successfully extracted page {page_num}")
        else:
            print(f"  ⚠️  Skipped page {page_num}")
    
    if not pages_data:
        print(f"  ❌ No valid pageData found in any files")
        return
    
    # Create json directory if it doesn't exist
    json_dir = folder_path / "json"
    json_dir.mkdir(exist_ok=True)
    
    # Save pages.json
    pages_json_path = json_dir / "pages.json"
    
    try:
        with open(pages_json_path, 'w', encoding='utf-8') as f:
            json.dump(pages_data, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ Created {pages_json_path}")
        print(f"  📊 Extracted {extracted_count} pages successfully")
        
    except Exception as e:
        print(f"  ❌ Failed to save pages.json: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python html2json.py <folder1> [folder2] ... [folderN]")
        print("Example: python html2json.py stories/story1 stories/tenfloors")
        sys.exit(1)
    
    folders = sys.argv[1:]
    
    print("🚀 HTML to JSON Migration Tool")
    print("=" * 40)
    
    for folder in folders:
        process_story_folder(folder)
    
    print("\n✅ Migration completed!")

if __name__ == "__main__":
    main()