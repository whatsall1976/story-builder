// View Mode Management
let currentViewMode = 'grid';
let allStories = [];
let selectedStoryIndex = 0;
let focusAutoShiftTimer = null;

// Initialize view mode switching
document.addEventListener('DOMContentLoaded', function() {
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Focus view navigation buttons
  const focusPrevBtn = document.getElementById('focus-prev-btn');
  const focusNextBtn = document.getElementById('focus-next-btn');
  
  if (focusPrevBtn) {
    focusPrevBtn.addEventListener('click', async () => {
      if (allStories.length > 0) {
        selectedStoryIndex = (selectedStoryIndex - 1 + allStories.length) % allStories.length;
        await updateFocusView(allStories[selectedStoryIndex]);
        updateFocusIndicators();
        restartFocusAutoShift();
      }
    });
  }
  
  if (focusNextBtn) {
    focusNextBtn.addEventListener('click', async () => {
      if (allStories.length > 0) {
        selectedStoryIndex = (selectedStoryIndex + 1) % allStories.length;
        await updateFocusView(allStories[selectedStoryIndex]);
        updateFocusIndicators();
        restartFocusAutoShift();
      }
    });
  }

  // Focus overlay buttons
  const focusPreviewBtn = document.getElementById('focus-preview-btn');
  const focusPlayBtn = document.getElementById('focus-play-btn');
  const focusEditBtn = document.getElementById('focus-edit-btn');
  
  if (focusPreviewBtn) {
    focusPreviewBtn.addEventListener('click', () => {
      if (allStories[selectedStoryIndex]) {
        openPreviewModal(allStories[selectedStoryIndex].folder);
      }
    });
  }
  
  if (focusPlayBtn) {
    focusPlayBtn.addEventListener('click', () => {
      if (allStories[selectedStoryIndex]) {
        window.open(`/stories/${allStories[selectedStoryIndex].folder}/player.html`, '_blank');
      }
    });
  }
  
  if (focusEditBtn) {
    focusEditBtn.addEventListener('click', () => {
      if (allStories[selectedStoryIndex]) {
        window.open(`/stories/${allStories[selectedStoryIndex].folder}/builder.html`, '_blank');
      }
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === '1') {
        e.preventDefault();
        switchView('grid');
      } else if (e.key === '4') {
        e.preventDefault();
        switchView('gallery');
      } else if (e.key === '3') {
        e.preventDefault();
        switchView('focus');
      }
    }
  });
});

function switchView(viewMode) {
  currentViewMode = viewMode;
  
  // Update button states
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewMode);
  });

  // Show/hide appropriate containers
  const gridContainer = document.getElementById('grid');
  const galleryContainer = document.getElementById('gallery');
  const focusContainer = document.getElementById('focus');

  if (viewMode === 'grid') {
    gridContainer.style.display = 'grid';
    galleryContainer.classList.remove('active');
    if (focusContainer) focusContainer.classList.remove('active');
    stopFocusAutoShift();
  } else if (viewMode === 'gallery') {
    gridContainer.style.display = 'none';
    galleryContainer.classList.add('active');
    if (focusContainer) focusContainer.classList.remove('active');
    stopFocusAutoShift();
    if (allStories.length > 0) {
      loadGalleryView();
    }
  } else if (viewMode === 'focus') {
    gridContainer.style.display = 'none';
    galleryContainer.classList.remove('active');
    if (focusContainer) {
      focusContainer.classList.add('active');
      if (allStories.length > 0) {
        loadFocusView();
      }
      startFocusAutoShift();
    }
  }

  console.log(`Switching to view mode: ${viewMode}`);
}

function loadGalleryView() {
  const thumbnailsContainer = document.getElementById('thumbnails');
  thumbnailsContainer.innerHTML = '';

  allStories.forEach(async (story, index) => {
    const thumbnailCard = document.createElement('div');
    thumbnailCard.classList.add('thumbnail-card');
    if (index === selectedStoryIndex) {
      thumbnailCard.classList.add('selected');
    }

    const img = document.createElement('img');
    // Use snapshot generator for dynamic preview
    if (window.snapshotGenerator) {
      await snapshotGenerator.applySnapshot(img, story.folder);
    } else {
      img.src = `/stories/${story.folder}/media/1.jpg`;
      img.onerror = function() {
        this.onerror = null;
        this.src = `/stories/${story.folder}/media/1.png`;
      };
    }

    const title = document.createElement('div');
    title.classList.add('thumbnail-title');
    title.textContent = story.title;

    thumbnailCard.appendChild(img);
    thumbnailCard.appendChild(title);
    
  thumbnailCard.addEventListener('click', async () => await selectStory(index));
    thumbnailsContainer.appendChild(thumbnailCard);
  });

  selectStory(selectedStoryIndex);
}

async function selectStory(index) {
  selectedStoryIndex = index;
  const story = allStories[index];

  // Update thumbnail selection
  document.querySelectorAll('.thumbnail-card').forEach((card, i) => {
    card.classList.toggle('selected', i === index);
  });

  // Update featured story
  const featuredImg = document.getElementById('featured-img');
  const featuredTitle = document.getElementById('featured-title');

  // Use snapshot generator for featured image
  if (window.snapshotGenerator) {
    await snapshotGenerator.applySnapshot(featuredImg, story.folder);
  } else {
    featuredImg.src = `/stories/${story.folder}/media/1.jpg`;
    featuredImg.onerror = function() {
      this.onerror = null;
      this.src = `/stories/${story.folder}/media/1.png`;
    };
  }
  
  featuredTitle.textContent = story.title;

  // Update focus view if active
  await updateFocusView(story);
}

async function updateFocusView(story) {
  const focusImg = document.getElementById('focus-thumbnail');
  if (!focusImg) {
    console.error('Focus-thumbnail element is missing or not accessible in the DOM.');
    return;
  }
  
  const focusTitle = document.getElementById('focus-story-title');
  
  if (focusImg && focusTitle) {
    // Use snapshot generator for focus view
    if (window.snapshotGenerator) {
      console.log(`Focus-thumbnail ID before applying snapshot: ${focusImg.id}`);
      await snapshotGenerator.applySnapshot(focusImg, story.folder);
    } else {
      focusImg.src = `/stories/${story.folder}/media/1.jpg`;
      focusImg.onerror = function() {
        this.onerror = null;
        this.src = `/stories/${story.folder}/media/1.png`;
      };
    }
    
    focusTitle.textContent = story.title;
  }

  console.log(`updateFocusView called for story: ${story.folder}`);
  console.log(`focus-thumbnail element:`, focusImg);
  console.log('Focus-thumbnail element details:', focusImg);

  console.log(`Updating focus view for story: ${story.folder}, focus-thumbnail ID: ${focusImg.id}`);
}

async function loadFocusView() {
  if (allStories.length > 0) {
    const story = allStories[selectedStoryIndex] || allStories[0];
    await updateFocusView(story);
    loadFocusIndicators();
  }
}

function loadFocusIndicators() {
  const indicatorsContainer = document.getElementById('focus-indicators');
  if (!indicatorsContainer) return;
  
  indicatorsContainer.innerHTML = '';
  
  allStories.forEach((story, index) => {
    const indicator = document.createElement('div');
    indicator.classList.add('focus-indicator');
    if (index === selectedStoryIndex) {
      indicator.classList.add('active');
    }
    
    indicator.addEventListener('click', async () => {
      selectedStoryIndex = index;
      await updateFocusView(allStories[index]);
      updateFocusIndicators();
      restartFocusAutoShift();
    });
    
    indicatorsContainer.appendChild(indicator);
  });
}

function updateFocusIndicators() {
  document.querySelectorAll('.focus-indicator').forEach((indicator, index) => {
    indicator.classList.toggle('active', index === selectedStoryIndex);
  });
}

function previewFeaturedStory() {
  if (allStories[selectedStoryIndex]) {
    openPreviewModal(allStories[selectedStoryIndex].folder);
  }
}

function playFeaturedStory() {
  if (allStories[selectedStoryIndex]) {
    window.open(`/stories/${allStories[selectedStoryIndex].folder}/player.html`, '_blank');
  }
}

function editFeaturedStory() {
  if (allStories[selectedStoryIndex]) {
    window.open(`/stories/${allStories[selectedStoryIndex].folder}/builder.html`, '_blank');
  }
}

// Top-level debug log
console.log('Top-level check: focus-thumbnail element:', document.getElementById('focus-thumbnail'));

function startFocusAutoShift() {
  if (focusAutoShiftTimer) {
    clearInterval(focusAutoShiftTimer);
  }
  
  focusAutoShiftTimer = setInterval(() => {
    if (allStories.length > 1) {
      // Select a random story different from current
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * allStories.length);
      } while (newIndex === selectedStoryIndex && allStories.length > 1);
      
      selectedStoryIndex = newIndex;
      updateFocusView(allStories[selectedStoryIndex]);
      updateFocusIndicators();
    }
  }, 5000); // 5 seconds
}

function restartFocusAutoShift() {
  if (currentViewMode === 'focus') {
    startFocusAutoShift();
  }
}

// Export functions globally for other modules
window.startFocusAutoShift = startFocusAutoShift;
window.restartFocusAutoShift = restartFocusAutoShift;
window.stopFocusAutoShift = stopFocusAutoShift;

// Clean up timer on page unload
window.addEventListener('beforeunload', () => {
  stopFocusAutoShift();
});

function stopFocusAutoShift() {
  if (focusAutoShiftTimer) {
    clearInterval(focusAutoShiftTimer);
    focusAutoShiftTimer = null;
  }
}