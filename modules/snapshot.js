// Snapshot Module - Dynamic Preview Generation
// Collects media from story folders and creates random previews

class SnapshotGenerator {
  constructor() {
    this.mediaCache = new Map();
    this.supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    this.supportedVideoFormats = ['.mp4', '.webm', '.ogg', '.mov'];
  }

  // Main function to get snapshot for a story
  async getSnapshot(storyFolder) {
    try {
      // Check cache first
      if (this.mediaCache.has(storyFolder)) {
        return this.generateRandomSnapshot(storyFolder);
      }

      // Collect media files for this story
      const mediaFiles = await this.collectMediaFiles(storyFolder);
      this.mediaCache.set(storyFolder, mediaFiles);
      
      return this.generateRandomSnapshot(storyFolder);
    } catch (error) {
      console.error(`Error generating snapshot for ${storyFolder}:`, error);
      return this.getFallbackSnapshot(storyFolder);
    }
  }

  // Collect all media files from story folder recursively
  async collectMediaFiles(storyFolder) {
    const mediaFiles = {
      images: [],
      videos: []
    };

    try {
      // Get all files in the story folder recursively
      const response = await fetch(`/api/story-media/${storyFolder}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch media for ${storyFolder}`);
      }
      
      const files = await response.json();
      
      files.forEach(file => {
        const extension = this.getFileExtension(file).toLowerCase();
        const fullPath = `/stories/${storyFolder}/${file}`;
        
        if (this.supportedImageFormats.includes(extension)) {
          mediaFiles.images.push(fullPath);
        } else if (this.supportedVideoFormats.includes(extension)) {
          mediaFiles.videos.push(fullPath);
        }
      });

    } catch (error) {
      // Fallback: try common paths
      console.warn(`API call failed for ${storyFolder}, using fallback detection`);
      await this.fallbackMediaDetection(storyFolder, mediaFiles);
    }

    return mediaFiles;
  }

  // Fallback method to detect media files
  async fallbackMediaDetection(storyFolder, mediaFiles) {
    const commonPaths = [
      'media',
      'images', 
      'videos',
      'assets',
      'page1/media',
      'page2/media',
      'page3/media',
      'page4/media',
      'page5/media'
    ];

    for (const path of commonPaths) {
      try {
        const response = await fetch(`/stories/${storyFolder}/${path}/`, { method: 'HEAD' });
        if (response.ok) {
          // Try to load common file names
          await this.checkCommonFiles(storyFolder, path, mediaFiles);
        }
      } catch (e) {
        // Path doesn't exist, continue
      }
    }
  }

  // Check for common file names in a path
  async checkCommonFiles(storyFolder, path, mediaFiles) {
    const commonNames = ['1', '2', '3', '4', '5', 'background', 'thumb', 'preview'];
    const extensions = [...this.supportedImageFormats, ...this.supportedVideoFormats];

    for (const name of commonNames) {
      for (const ext of extensions) {
        try {
          const filePath = `/stories/${storyFolder}/${path}/${name}${ext}`;
          const response = await fetch(filePath, { method: 'HEAD' });
          
          if (response.ok) {
            if (this.supportedImageFormats.includes(ext)) {
              mediaFiles.images.push(filePath);
            } else {
              mediaFiles.videos.push(filePath);
            }
          }
        } catch (e) {
          // File doesn't exist, continue
        }
      }
    }
  }

  // Generate random snapshot from collected media
  generateRandomSnapshot(storyFolder) {
    const mediaFiles = this.mediaCache.get(storyFolder);
    if (!mediaFiles || (mediaFiles.images.length === 0 && mediaFiles.videos.length === 0)) {
      console.log(`No media found for ${storyFolder}, using fallback`);
      return this.getFallbackSnapshot(storyFolder);
    }

    console.log(`Media for ${storyFolder}:`, mediaFiles);

    // Prefer videos for more dynamic previews (70% chance if videos exist)
    let selectedMedia;
    if (mediaFiles.videos.length > 0 && Math.random() < 0.7) {
      selectedMedia = mediaFiles.videos[Math.floor(Math.random() * mediaFiles.videos.length)];
      console.log(`Selected video for ${storyFolder}:`, selectedMedia);
    } else if (mediaFiles.images.length > 0) {
      selectedMedia = mediaFiles.images[Math.floor(Math.random() * mediaFiles.images.length)];
      console.log(`Selected image for ${storyFolder}:`, selectedMedia);
    } else if (mediaFiles.videos.length > 0) {
      selectedMedia = mediaFiles.videos[Math.floor(Math.random() * mediaFiles.videos.length)];
      console.log(`Selected video (fallback) for ${storyFolder}:`, selectedMedia);
    } else {
      return this.getFallbackSnapshot(storyFolder);
    }
    
    const isVideo = this.supportedVideoFormats.includes(this.getFileExtension(selectedMedia).toLowerCase());
    
    return {
      type: isVideo ? 'video' : 'image',
      src: selectedMedia,
      storyFolder: storyFolder
    };
  }

  // Apply snapshot to an element (img or video)
  async applySnapshot(element, storyFolder) {
    const snapshot = await this.getSnapshot(storyFolder);
    
    if (snapshot.type === 'image') {
      this.applyImageSnapshot(element, snapshot);
    } else {
      this.applyVideoSnapshot(element, snapshot);
    }
  }

  // Apply image snapshot
  applyImageSnapshot(element, snapshot) {
    if (element.tagName === 'IMG') {
      element.src = snapshot.src;
      element.onerror = () => {
        element.src = this.getFallbackSnapshot(snapshot.storyFolder).src;
      };
    } else {
      // Create img element if element is not img
      const img = document.createElement('img');
      img.src = snapshot.src;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.onerror = () => {
        img.src = this.getFallbackSnapshot(snapshot.storyFolder).src;
      };
      
      element.innerHTML = '';
      element.appendChild(img);
    }
  }

  // Apply video snapshot
  applyVideoSnapshot(element, snapshot) {
    const video = document.createElement('video');
    video.src = snapshot.src;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.muted = true;
    video.preload = 'metadata';
    video.loop = false;
    video.controls = false;
    
    // Set random time and pause
    video.addEventListener('loadedmetadata', () => {
      if (video.duration && video.duration > 0) {
        const randomTime = Math.random() * Math.min(video.duration, 30); // Limit to first 30 seconds
        video.currentTime = randomTime;
        
        // Play briefly then pause to show the frame
        setTimeout(() => {
          video.play().then(() => {
            setTimeout(() => {
              video.pause();
            }, 100);
          }).catch(() => {
            // If play fails, just pause
            video.pause();
          });
        }, 500);
      }
    });

    video.onerror = () => {
      console.warn(`Video failed to load: ${snapshot.src}, falling back to image`);
      // Fallback to image on video error
      const fallback = this.getFallbackSnapshot(snapshot.storyFolder);
      this.applyImageSnapshot(element, fallback);
    };
    
    element.innerHTML = '';
    element.appendChild(video);
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
    } else {
      this.mediaCache.clear();
    }
  }

  // Preload snapshots for multiple stories
  async preloadSnapshots(storyFolders) {
    const promises = storyFolders.map(folder => this.getSnapshot(folder));
    await Promise.allSettled(promises);
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
