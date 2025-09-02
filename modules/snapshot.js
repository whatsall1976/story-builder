// Snapshot Module - Dynamic Image Preview Generation
// Recursively collects images from story folders and creates random previews

class SnapshotGenerator {
  constructor() {
    this.mediaCache = new Map();
    this.supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  }

  // Main function to get snapshot for a story
  async getSnapshot(storyFolder) {
    try {
      // Check cache first
      if (this.mediaCache.has(storyFolder)) {
        return this.generateRandomSnapshot(storyFolder);
      }

      // Collect image files for this story
      const imageFiles = await this.collectImageFiles(storyFolder);
      this.mediaCache.set(storyFolder, imageFiles);
      
      return this.generateRandomSnapshot(storyFolder);
    } catch (error) {
      console.error(`Error generating snapshot for ${storyFolder}:`, error);
      return this.getFallbackSnapshot(storyFolder);
    }
  }

  // Collect all image files from story folder recursively
  async collectImageFiles(storyFolder) {
    const imageFiles = [];

    try {
      // Get all files in the story folder recursively
      const response = await fetch(`/api/story-media/${storyFolder}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch media for ${storyFolder}`);
      }
      
      const files = await response.json();
      
      files.forEach(file => {
        const extension = this.getFileExtension(file).toLowerCase();
        if (this.supportedImageFormats.includes(extension)) {
          const fullPath = `/stories/${storyFolder}/${file}`;
          imageFiles.push(fullPath);
        }
      });

      console.log(`Found ${imageFiles.length} images in ${storyFolder}`);

    } catch (error) {
      // Fallback: try common paths
      console.warn(`API call failed for ${storyFolder}, using fallback detection`);
      await this.fallbackImageDetection(storyFolder, imageFiles);
    }

    return imageFiles;
  }

  // Fallback method to detect image files in common locations
  async fallbackImageDetection(storyFolder, imageFiles) {
    const commonPaths = [
      'media',
      'images', 
      'assets',
      'slide1/media', 'slide2/media', 'slide3/media', 'slide4/media', 'slide5/media',
      'slide6/media', 'slide7/media', 'slide8/media', 'slide9/media', 'slide10/media',
      'page1/media', 'page2/media', 'page3/media', 'page4/media', 'page5/media',
      'page6/media', 'page7/media', 'page8/media', 'page9/media', 'page10/media'
    ];

    for (const path of commonPaths) {
      try {
        await this.checkCommonImageFiles(storyFolder, path, imageFiles);
      } catch (e) {
        // Path doesn't exist, continue
      }
    }
  }

  // Check for common image file names in a specific path
  async checkCommonImageFiles(storyFolder, path, imageFiles) {
    const commonNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 
                        'background', 'thumb', 'preview', 'image', 'cover'];
    
    for (const name of commonNames) {
      for (const ext of this.supportedImageFormats) {
        try {
          const filePath = `/stories/${storyFolder}/${path}/${name}${ext}`;
          const response = await fetch(filePath, { method: 'HEAD' });
          
          if (response.ok) {
            console.log(`Found image file: ${filePath}`);
            imageFiles.push(filePath);
          }
        } catch (e) {
          // File doesn't exist, continue
        }
      }
    }
  }

  // Generate random snapshot from collected images
  generateRandomSnapshot(storyFolder) {
    const imageFiles = this.mediaCache.get(storyFolder);
    if (!imageFiles || imageFiles.length === 0) {
      console.log(`No images found for ${storyFolder}, using fallback`);
      return this.getFallbackSnapshot(storyFolder);
    }

    const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    console.log(`Selected random image for ${storyFolder}: ${randomImage}`);
    
    return {
      type: 'image',
      src: randomImage,
      storyFolder: storyFolder
    };
  }

  // Apply snapshot to an element
  async applySnapshot(element, storyFolder) {
    console.log(`Applying snapshot to element with ID: ${element.id}, story folder: ${storyFolder}`);
    const snapshot = await this.getSnapshot(storyFolder);
    this.applyImageSnapshot(element, snapshot);
  }

  // Apply image snapshot to element
  applyImageSnapshot(element, snapshot) {
    if (element.tagName === 'IMG') {
      // Add cache-busting query param to force reload
      const cacheBustedSrc = snapshot.src + (snapshot.src.includes('?') ? '&' : '?') + 'cb=' + Date.now();
      element.src = cacheBustedSrc;
      element.onerror = () => {
        console.warn(`Failed to load ${snapshot.src}, using fallback`);
        element.src = this.getFallbackSnapshot(snapshot.storyFolder).src;
      };
    } else {
      // Create img element if element is not img
      const img = document.createElement('img');
      const cacheBustedSrc = snapshot.src + (snapshot.src.includes('?') ? '&' : '?') + 'cb=' + Date.now();
      img.src = cacheBustedSrc;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.onerror = () => {
        console.warn(`Failed to load ${snapshot.src}, using fallback`);
        img.src = this.getFallbackSnapshot(snapshot.storyFolder).src;
      };
      
      element.innerHTML = '';
      element.appendChild(img);
    }
  }

  // Get fallback snapshot (original behavior)
  getFallbackSnapshot(storyFolder) {
    return {
      type: 'image',
      src: `/stories/${storyFolder}/media/1.jpg`,
      storyFolder: storyFolder
    };
  }

  // Utility: get file extension
  getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.'));
  }

  // Clear cache for a specific story or all
  clearCache(storyFolder = null) {
    if (storyFolder) {
      this.mediaCache.delete(storyFolder);
      console.log(`Cleared cache for ${storyFolder}`);
    } else {
      this.mediaCache.clear();
      console.log('Cleared all cache');
    }
  }

  // Preload snapshots for multiple stories
  async preloadSnapshots(storyFolders) {
    console.log(`Preloading snapshots for ${storyFolders.length} stories`);
    const promises = storyFolders.map(folder => this.getSnapshot(folder));
    await Promise.allSettled(promises);
    console.log('Preloading complete');
  }
}

// Global instance
const snapshotGenerator = new SnapshotGenerator();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SnapshotGenerator, snapshotGenerator };
}

// Global access
window.snapshotGenerator = snapshotGenerator;