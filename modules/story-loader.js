// Story Loading and Management

async function getPageCount(folder) {
  try {
    const response = await fetch(`/api/stories/${folder}/pages`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return data.pageCount || 0;
  } catch (error) {
    console.error('Error fetching page count:', error);
    return 0;
  }
}

// Function to get page-specific media files
async function getPageMediaFiles(folder, pageNum) {
  try {
    const response = await fetch(`/api/story-media/${folder}`);
    if (!response.ok) return [];
    
    const files = await response.json();
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg'];
    
    // Filter for page-specific media files: media/{pageNum}/* or page{pageNum}/media/*
    const pageMediaFiles = files.filter(file => {
      const extension = file.substring(file.lastIndexOf('.')).toLowerCase();
      if (!supportedFormats.includes(extension)) return false;
      
      // Check if file is in media/{pageNum}/ or page{pageNum}/media/
      return file.includes(`media/${pageNum}/`) || file.includes(`page${pageNum}/media/`);
    });
    
    return pageMediaFiles;
  } catch (error) {
    console.error(`Error getting media files for page ${pageNum}:`, error);
    return [];
  }
}

// Function to get general media files  
async function getGeneralMediaFiles(folder) {
  try {
    const response = await fetch(`/api/story-media/${folder}`);
    if (!response.ok) return [];
    
    const files = await response.json();
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg'];
    
    // Filter for general media files: media/* (but not in numbered subdirectories)
    const generalMediaFiles = files.filter(file => {
      const extension = file.substring(file.lastIndexOf('.')).toLowerCase();
      if (!supportedFormats.includes(extension)) return false;
      
      // Include files in media/ but not in media/{num}/ subdirectories
      if (file.startsWith('media/')) {
        const pathParts = file.split('/');
        if (pathParts.length === 2) return true; // media/filename
        // Check if second part is a number (page subdirectory)
        return isNaN(parseInt(pathParts[1]));
      }
      
      return false;
    });
    
    return generalMediaFiles;
  } catch (error) {
    console.error('Error getting general media files:', error);
    return [];
  }
}

// Function to set preview image for iframe
async function setPreviewImage(imgElement, folder, pageNum) {
  try {
    // First try to get page-specific media
    let mediaFiles = await getPageMediaFiles(folder, pageNum);
    
    // If no page-specific media, try general media
    if (mediaFiles.length === 0) {
      mediaFiles = await getGeneralMediaFiles(folder);
    }
    
    // If still no media, try fallback paths
    if (mediaFiles.length === 0) {
      const fallbackPaths = [
        'media/1.jpg', 'media/1.png', 'media/background.jpg', 
        'media/background.png', 'media/thumb.jpg', 'media/thumb.png'
      ];
      
      for (const fallbackPath of fallbackPaths) {
        try {
          const response = await fetch(`/stories/${folder}/${fallbackPath}`, { method: 'HEAD' });
          if (response.ok) {
            imgElement.src = `/stories/${folder}/${fallbackPath}`;
            return;
          }
        } catch (e) {
          // Continue to next fallback
        }
      }
      
      // Ultimate fallback - placeholder
      imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
      return;
    }
    
    // Randomly select a media file
    const randomFile = mediaFiles[Math.floor(Math.random() * mediaFiles.length)];
    const mediaUrl = `/stories/${folder}/${randomFile}`;
    
    // Check if it's a video file
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    const extension = randomFile.substring(randomFile.lastIndexOf('.')).toLowerCase();
    
    if (videoExtensions.includes(extension)) {
      // For videos, create a video element and capture a frame
      const video = document.createElement('video');
      video.src = mediaUrl;
      video.currentTime = 1; // Capture frame at 1 second
      video.muted = true;
      
      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        imgElement.src = canvas.toDataURL();
      });
      
      video.addEventListener('error', () => {
        // Fallback for video preview error
        imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDQ0Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjZmZmIi8+PHBvbHlnb24gcG9pbnRzPSI5NSw1MCA5NSw3MCA5MjQsNjAiIGZpbGw9IiM0NDQiLz48L3N2Zz4=';
      });
    } else {
      // For images, set directly
      imgElement.src = mediaUrl;
      imgElement.onerror = () => {
        imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
      };
    }
    
  } catch (error) {
    console.error(`Error setting preview image for page ${pageNum}:`, error);
    // Fallback placeholder
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4=';
  }
}

async function openPreviewModal(folder) {
  const modal = document.getElementById('previewModal');
  const previewContainer = document.getElementById('previewContainer');
  modal.style.display = 'block';
  previewContainer.innerHTML = '';

  // Get subtitle setting from userSettings
  const showSubtitles = (typeof userSettings !== 'undefined' && userSettings.showSubtitles !== undefined) ? userSettings.showSubtitles : true;
  const subtitleParam = showSubtitles ? '' : '?noSubtitles=1';

  const pageCount = await getPageCount(folder);
  for (let i = 1; i <= pageCount; i++) {
    const iframeContainer = document.createElement('div');
    iframeContainer.classList.add('iframe-container');

    // Add preview image overlay
    const previewOverlay = document.createElement('div');
    previewOverlay.classList.add('preview-overlay');
    previewOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;

    const previewImage = document.createElement('img');
    previewImage.style.cssText = `
      max-width: 80%;
      max-height: 80%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // Try to get a random preview image for this page
    await setPreviewImage(previewImage, folder, i);
    previewOverlay.appendChild(previewImage);

    const iframeWrapper = document.createElement('div');
    iframeWrapper.classList.add('iframe-wrapper');
    iframeWrapper.style.position = 'relative';
    
    const iframe = document.createElement('iframe');
    iframe.src = `/stories/${folder}/page${i}.html${subtitleParam}`;
    iframe.style.filter = 'blur(2px)';
    
    // Add hover effects
    iframeWrapper.addEventListener('mouseenter', () => {
      previewOverlay.style.opacity = '0';
      iframe.style.filter = 'none';
    });
    
    iframeWrapper.addEventListener('mouseleave', () => {
      previewOverlay.style.opacity = '1';
      iframe.style.filter = 'blur(2px)';
    });
    
    iframeWrapper.appendChild(iframe);
    iframeWrapper.appendChild(previewOverlay);
    iframeContainer.appendChild(iframeWrapper);

    const button = document.createElement('button');
    button.classList.add('enter-button');
    button.textContent = `Enter Page ${i}`;
    button.dataset.pageNumber = i;
    button.dataset.folder = folder;
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const pageNumber = button.dataset.pageNumber;
      const folder = button.dataset.folder;
      const url = `/stories/${folder}/player.html?page=${pageNumber}`;
      window.open(url, '_blank');
    });
    iframeContainer.appendChild(button);

    previewContainer.appendChild(iframeContainer);
  }
}

// Modal event handlers
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('previewModal').style.display = 'none';
    document.getElementById('previewContainer').innerHTML = '';
  });

  window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('previewModal')) {
      document.getElementById('previewModal').style.display = 'none';
      document.getElementById('previewContainer').innerHTML = '';
    }
  });
});

// Load stories from API
fetch('/api/folders')
  .then(response => response.json())
  .then(data => {
    if (data.success && data.folders) {
      loadCards(data.folders);
    } else {
      console.error('Failed to fetch folder names');
    }
  })
  .catch(err => console.error('Error fetching folder names:', err));

function loadCards(folders) {
  const grid = document.getElementById("grid");
  
  // Reset stories array
  allStories = [];

  const shuffledFolders = folders.sort(() => Math.random() - 0.5);
  shuffledFolders.forEach((folder, index) => {
    // Add to stories array for gallery view
    const storyData = {
      folder: folder,
      title: folder,
      index: index
    };
    allStories.push(storyData);
    
    const card = document.createElement("div");
    card.classList.add("story-card");

    const img = document.createElement("img");
    // Use snapshot generator for dynamic preview
    if (window.snapshotGenerator) {
      snapshotGenerator.applySnapshot(img, folder);
    } else {
      // Fallback to original behavior
      img.src = `/stories/${folder}/media/1.jpg`;
      img.onerror = function() {
        this.onerror = null;
        this.src = `/stories/${folder}/media/1.png`;
      };
    }
    card.appendChild(img);

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const titleElem = document.createElement("div");
    titleElem.classList.add("title");
    titleElem.textContent = folder;
    cardContent.appendChild(titleElem);

    fetch(`/stories/${folder}/player.html`)
      .then(res => res.text())
      .then(html => {
        const match = html.match(/<div id=['"]controls['"][^>]*>\s*<span>(.*?)<\/span>/i);
        if (match && match[1]) {
          const title = match[1].trim();
          titleElem.textContent = title;
          // Update the stories array with the actual title
          const storyIndex = allStories.findIndex(s => s.folder === folder);
          if (storyIndex !== -1) {
            allStories[storyIndex].title = title;
          }
        }
      })
      .catch(() => console.warn(`Could not load title for ${folder}`));

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons-container");

    const previewButton = document.createElement("button");
    previewButton.classList.add("btn", "btn-secondary");
    previewButton.textContent = "Preview";
    previewButton.onclick = () => openPreviewModal(folder);

    const playButton = document.createElement("button");
    playButton.classList.add("btn", "btn-success");
    playButton.textContent = "Play";
    playButton.onclick = () => window.open(`/stories/${folder}/player.html`, "_blank");

    const editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-primary");
    editButton.textContent = "Edit";
    editButton.onclick = () => window.open(`/stories/${folder}/builder.html`, "_blank");

    buttonsContainer.appendChild(previewButton);
    buttonsContainer.appendChild(playButton);
    buttonsContainer.appendChild(editButton);
    cardContent.appendChild(buttonsContainer);
    card.appendChild(cardContent);

    grid.appendChild(card);
  });

  // After loading all cards, apply the user's preferred view mode
  if (typeof settingsModule !== 'undefined' && settingsModule.applyViewMode) {
    setTimeout(() => settingsModule.applyViewMode(), 100);
  }
}