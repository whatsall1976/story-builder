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
        const snapshot = this.generateRandomSnapshot(storyFolder);
        
        // If no media found in cache, try video test
        if (snapshot.type === 'image' && snapshot.src.includes('/media/1.jpg')) {
          const videoTest = await this.testVideoSnapshot(storyFolder);
          if (videoTest) {
            return videoTest;
          }
        }
        
        return snapshot;
      }

      // Collect media files for this story
      const mediaFiles = await this.collectMediaFiles(storyFolder);
      this.mediaCache.set(storyFolder, mediaFiles);
      
      const snapshot = this.generateRandomSnapshot(storyFolder);
      
      // If still no media found, try video test
      if (snapshot.type === 'image' && snapshot.src.includes('/media/1.jpg')) {
        const videoTest = await this.testVideoSnapshot(storyFolder);
        if (videoTest) {
          return videoTest;
        }
      }
      
      return snapshot;
    } catch (error) {
      console.error(`Error generating snapshot for ${storyFolder}:`, error);
      
      // Try video test as last resort
      const videoTest = await this.testVideoSnapshot(storyFolder);
      if (videoTest) {
        return videoTest;
      }
      
      return this.getFallbackSnapshot(storyFolder);
    }
  }

  // Collect all media files from story folder using pages.json
  async collectMediaFiles(storyFolder) {
    const mediaFiles = {
      images: [],
      videos: []
    };

    try {
      // Try to load pages.json
      const response = await fetch(`/stories/${storyFolder}/json/pages.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch pages.json for ${storyFolder}`);
      }
      
      const jsonContent = await response.text();
      console.log(`Loaded pages.json for ${storyFolder}`);
      
      // Extract media URLs from JSON content using regex
      const mediaUrls = this.extractMediaFromJson(jsonContent, storyFolder);
      
      mediaUrls.forEach(url => {
        const extension = this.getFileExtension(url).toLowerCase();
        if (this.supportedImageFormats.includes(extension)) {
          mediaFiles.images.push(url);
        } else if (this.supportedVideoFormats.includes(extension)) {
          mediaFiles.videos.push(url);
        }
      });

      console.log(`Found ${mediaFiles.images.length} images and ${mediaFiles.videos.length} videos in ${storyFolder}`);

    } catch (error) {
      console.warn(`Failed to load pages.json for ${storyFolder}, using fallback detection:`, error);
      await this.fallbackMediaDetection(storyFolder, mediaFiles);
    }

    return mediaFiles;
  }

  // Extract media URLs from JSON content
  extractMediaFromJson(jsonContent, storyFolder) {
    const mediaUrls = [];
    const mediaExtensions = [...this.supportedImageFormats, ...this.supportedVideoFormats];
    
    // Create regex pattern to find quoted strings ending with media extensions
    const extensionPattern = mediaExtensions.map(ext => ext.slice(1)).join('|'); // Remove dots
    const regex = new RegExp(`"([^"]*\\.(${extensionPattern}))"|'([^']*\\.(${extensionPattern}))'`, 'gi');
    
    let match;
    while ((match = regex.exec(jsonContent)) !== null) {
      const url = match[1] || match[3]; // Get the captured URL
      console.log(`Found media reference: ${url}`);
      
      // Convert relative paths to absolute localhost URLs
      const absoluteUrl = this.convertToAbsoluteUrl(url, storyFolder);
      if (absoluteUrl && !mediaUrls.includes(absoluteUrl)) {
        mediaUrls.push(absoluteUrl);
        console.log(`Added media URL: ${absoluteUrl}`);
      }
    }
    
    return mediaUrls;
  }

  // Convert relative media paths to absolute localhost URLs
  convertToAbsoluteUrl(url, storyFolder) {
    // If already absolute URL (starts with http), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If starts with 'media/', convert to localhost URL
    if (url.startsWith('media/')) {
      return `http://localhost:1976/stories/${storyFolder}/${url}`;
    }
    
    // If it's just a filename, assume it's in media folder
    if (!url.includes('/') && this.hasMediaExtension(url)) {
      return `http://localhost:1976/stories/${storyFolder}/media/${url}`;
    }
    
    // For other relative paths, prepend story path
    if (!url.startsWith('/')) {
      return `http://localhost:1976/stories/${storyFolder}/${url}`;
    }
    
    // If starts with /, it's already relative to root
    return `http://localhost:1976${url}`;
  }

  // Check if URL has supported media extension
  hasMediaExtension(url) {
    const extension = this.getFileExtension(url).toLowerCase();
    return [...this.supportedImageFormats, ...this.supportedVideoFormats].includes(extension);
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
    const commonNames = ['1', '2', '3', '4', '5', 'background', 'thumb', 'preview', 'video', 'movie'];
    const extensions = [...this.supportedImageFormats, ...this.supportedVideoFormats];

    for (const name of commonNames) {
      for (const ext of extensions) {
        try {
          const filePath = `/stories/${storyFolder}/${path}/${name}${ext}`;
          const response = await fetch(filePath, { method: 'HEAD' });
          
          if (response.ok) {
            console.log(`Found media file: ${filePath}`);
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
    console.log(`Applying video snapshot: ${snapshot.src}`);
    
    // Clear the element first
    element.innerHTML = '';
    
    const video = document.createElement('video');
    video.src = snapshot.src;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.display = 'block';
    video.style.backgroundColor = '#000';
    video.muted = true;
    video.preload = 'metadata';
    video.loop = false;
    video.controls = false;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    
    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.style.position = 'absolute';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.color = 'white';
    loadingDiv.style.fontSize = '14px';
    loadingDiv.textContent = 'Loading video...';
    loadingDiv.style.zIndex = '5';
    
    // Make element relative for absolute positioning
    element.style.position = 'relative';
    element.appendChild(loadingDiv);
    element.appendChild(video);
    
    // Handle video events
    video.addEventListener('loadstart', () => {
      console.log(`Video load started: ${snapshot.src}`);
    });
    
    video.addEventListener('loadeddata', () => {
      console.log(`Video data loaded: ${snapshot.src}`);
      loadingDiv.style.display = 'none';
    });
    
    video.addEventListener('loadedmetadata', () => {
      console.log(`Video metadata loaded: ${snapshot.src}, duration: ${video.duration}`);
      loadingDiv.style.display = 'none';
      
      if (video.duration && video.duration > 0 && !isNaN(video.duration) && isFinite(video.duration)) {
        // Generate random percentage between 10% and 80% of video duration
        const randomPercentage = 0.1 + (Math.random() * 0.7); // 10% to 80%
        const randomTime = video.duration * randomPercentage;
        console.log(`Setting video to ${(randomPercentage * 100).toFixed(1)}% (${randomTime.toFixed(2)}s of ${video.duration.toFixed(2)}s)`);
        
        // Set the time directly
        video.currentTime = randomTime;
      } else {
        console.warn(`Invalid video duration: ${video.duration}`);
      }
    });

    // Handle when video seeking is complete
    video.addEventListener('seeked', () => {
      console.log(`Video seeked to: ${video.currentTime.toFixed(2)}s`);
      
      // Play briefly to load the frame at this position
      video.play().then(() => {
        console.log(`Video playing at: ${video.currentTime.toFixed(2)}s`);
        // Pause after a short moment to capture the frame
        setTimeout(() => {
          video.pause();
          console.log(`Video paused at final position: ${video.currentTime.toFixed(2)}s`);
        }, 250);
      }).catch((error) => {
        console.warn(`Video play failed after seek: ${error.message}`);
        video.pause();
      });
    });

    video.addEventListener('canplay', () => {
      console.log(`Video can play: ${snapshot.src}`);
      loadingDiv.style.display = 'none';
    });

    video.addEventListener('error', (e) => {
      console.error(`Video error: ${snapshot.src}`, e);
      loadingDiv.textContent = 'Video failed to load';
      
      // Fallback to image after a delay
      setTimeout(() => {
        console.log(`Falling back to image for: ${snapshot.storyFolder}`);
        const fallback = this.getFallbackSnapshot(snapshot.storyFolder);
        this.applyImageSnapshot(element, fallback);
      }, 2000);
    });

    video.addEventListener('stalled', () => {
      console.warn(`Video stalled: ${snapshot.src}`);
    });

    video.addEventListener('waiting', () => {
      console.log(`Video waiting: ${snapshot.src}`);
    });
  }

  // Get fallback snapshot (original behavior)
  getFallbackSnapshot(storyFolder) {
    return {
      type: 'image',
      src: `http://localhost:1976/stories/${storyFolder}/media/1.jpg`,
      storyFolder: storyFolder
    };
  }

  // Test if a video file exists and create snapshot
  async testVideoSnapshot(storyFolder) {
    // First try to get from pages.json
    try {
      const response = await fetch(`/stories/${storyFolder}/json/pages.json`);
      if (response.ok) {
        const jsonContent = await response.text();
        const mediaUrls = this.extractMediaFromJson(jsonContent, storyFolder);
        
        // Find first video URL
        for (const url of mediaUrls) {
          const extension = this.getFileExtension(url).toLowerCase();
          if (this.supportedVideoFormats.includes(extension)) {
            console.log(`Found video from pages.json: ${url}`);
            return {
              type: 'video',
              src: url,
              storyFolder: storyFolder
            };
          }
        }
      }
    } catch (e) {
      console.warn(`Could not load pages.json for ${storyFolder}`);
    }

    // Fallback to common video paths
    const commonVideoPaths = [
      `http://localhost:1976/stories/${storyFolder}/media/1.mp4`,
      `http://localhost:1976/stories/${storyFolder}/media/video.mp4`,
      `http://localhost:1976/stories/${storyFolder}/media/movie.mp4`,
      `/stories/${storyFolder}/media/1.mp4`,
      `/stories/${storyFolder}/media/video.mp4`,
      `/stories/${storyFolder}/1.mp4`,
      `/stories/${storyFolder}/video.mp4`
    ];

    for (const path of commonVideoPaths) {
      try {
        const response = await fetch(path, { method: 'HEAD' });
        if (response.ok) {
          console.log(`Found video for testing: ${path}`);
          return {
            type: 'video',
            src: path,
            storyFolder: storyFolder
          };
        }
      } catch (e) {
        // Continue to next path
      }
    }
    
    return null;
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

  // Debug function to test video loading
  async debugVideoTest(storyFolder, elementId) {
    console.log(`Testing video for story: ${storyFolder}`);
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element ${elementId} not found`);
      return;
    }
    
    const videoSnapshot = await this.testVideoSnapshot(storyFolder);
    if (videoSnapshot) {
      console.log(`Found video snapshot:`, videoSnapshot);
      this.applyVideoSnapshot(element, videoSnapshot);
    } else {
      console.log(`No video found for ${storyFolder}`);
    }
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
