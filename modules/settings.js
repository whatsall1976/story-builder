// Settings Management System
let userSettings = {
  viewMode: 'focus', // Default to focus view
  showSubtitles: true, // Default to show subtitles
  ...JSON.parse(localStorage.getItem('storyBuilderSettings') || '{}')
};

// Export userSettings globally
window.userSettings = userSettings;

let focusIndex = 0;

// Initialize settings system
document.addEventListener('DOMContentLoaded', function() {
  initializeSettingsModal();
  loadUserSettings();
  initializeFocusView();
  setupKeyboardNavigation();
});

function initializeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const closeBtn = document.querySelector('.settings-modal .close');
  const cancelBtn = document.getElementById('settings-cancel-btn');
  const saveBtn = document.getElementById('settings-save-btn');

  // Close modal events
  [closeBtn, cancelBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', closeSettingsModal);
    }
  });

  // Save settings
  if (saveBtn) {
    saveBtn.addEventListener('click', saveSettings);
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeSettingsModal();
    }
  });

  // Load current settings into form
  loadSettingsForm();
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    loadSettingsForm(); // Refresh form with current settings
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function loadSettingsForm() {
  // Set view mode radio button
  const viewModeRadio = document.querySelector(`input[name="view-mode"][value="${userSettings.viewMode}"]`);
  if (viewModeRadio) {
    viewModeRadio.checked = true;
  }

  // Set subtitles checkbox
  const showSubtitlesCheckbox = document.getElementById('show-subtitles');
  if (showSubtitlesCheckbox) {
    showSubtitlesCheckbox.checked = userSettings.showSubtitles;
  }
}

function saveSettings() {
  // Get view mode selection
  const selectedViewMode = document.querySelector('input[name="view-mode"]:checked');
  if (selectedViewMode) {
    userSettings.viewMode = selectedViewMode.value;
  }

  // Get subtitles setting
  const showSubtitlesCheckbox = document.getElementById('show-subtitles');
  if (showSubtitlesCheckbox) {
    userSettings.showSubtitles = showSubtitlesCheckbox.checked;
  }

  // Save to localStorage
  localStorage.setItem('storyBuilderSettings', JSON.stringify(userSettings));

  // Update global reference
  window.userSettings = userSettings;

  // Apply settings immediately
  applyViewMode();

  // Close modal
  closeSettingsModal();

  console.log('Settings saved:', userSettings);
}

function loadUserSettings() {
  // Apply the saved view mode
  applyViewMode();
  
  // Update global reference
  window.userSettings = userSettings;
}

function applyViewMode() {
  const gridContainer = document.getElementById('grid');
  const galleryContainer = document.getElementById('gallery');
  const focusContainer = document.getElementById('focus');

  // Hide all views first
  if (gridContainer) gridContainer.style.display = 'none';
  if (galleryContainer) galleryContainer.classList.remove('active');
  if (focusContainer) focusContainer.classList.remove('active');

  // Show the selected view
  switch (userSettings.viewMode) {
    case 'grid':
      if (gridContainer) gridContainer.style.display = 'grid';
      break;
    case 'gallery':
      if (galleryContainer) galleryContainer.classList.add('active');
      if (typeof loadGalleryView === 'function' && allStories && allStories.length > 0) {
        loadGalleryView();
      }
      break;
    case 'focus':
      if (focusContainer) focusContainer.classList.add('active');
      if (allStories && allStories.length > 0) {
        loadFocusView();
      }
      break;
  }
}

function initializeFocusView() {
  const prevBtn = document.getElementById('focus-prev-btn');
  const nextBtn = document.getElementById('focus-next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', async () => await navigateFocus(-1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => await navigateFocus(1));
  }
}

async function loadFocusView() {
  if (!allStories || allStories.length === 0) return;

  // Ensure focusIndex is within bounds
  if (focusIndex >= allStories.length) focusIndex = 0;
  if (focusIndex < 0) focusIndex = allStories.length - 1;

  await updateFocusDisplay();
  generateFocusIndicators();
  
  // Start auto-shift timer if in focus view
  if (userSettings.viewMode === 'focus' && typeof startFocusAutoShift === 'function') {
    startFocusAutoShift();
  }
}

async function updateFocusDisplay() {
  const story = allStories[focusIndex];
  if (!story) return;

  // Update thumbnail
  const thumbnail = document.getElementById('focus-thumbnail');
  if (thumbnail) {
    // Use snapshot generator for random image
    if (window.snapshotGenerator) {
      await snapshotGenerator.applySnapshot(thumbnail, story.folder);
    } else {
      // Fallback to original behavior
      thumbnail.src = `/stories/${story.folder}/media/1.jpg`;
      thumbnail.onerror = function() {
        this.onerror = null;
        this.src = `/stories/${story.folder}/media/1.png`;
      };
    }
  }

  // Update story title
  const title = document.getElementById('focus-story-title');
  if (title) {
    title.textContent = story.title;
  }

  // Update action buttons
  const previewBtn = document.getElementById('focus-preview-btn');
  const playBtn = document.getElementById('focus-play-btn');
  const editBtn = document.getElementById('focus-edit-btn');

  if (previewBtn) {
    previewBtn.onclick = () => {
      if (typeof openPreviewModal === 'function') {
        openPreviewModal(story.folder);
      }
    };
  }

  if (playBtn) {
    playBtn.onclick = () => window.open(`/stories/${story.folder}/player.html`, '_blank');
  }

  if (editBtn) {
    editBtn.onclick = () => window.open(`/stories/${story.folder}/builder.html`, '_blank');
  }

  // Update indicators
  updateFocusIndicators();
}

function generateFocusIndicators() {
  const container = document.getElementById('focus-indicators');
  if (!container || !allStories) return;

  container.innerHTML = '';

  allStories.forEach((story, index) => {
    const indicator = document.createElement('div');
    indicator.classList.add('focus-indicator');
    if (index === focusIndex) {
      indicator.classList.add('active');
    }
    
    indicator.addEventListener('click', async () => {
      focusIndex = index;
      await updateFocusDisplay();
      
      // Restart auto-shift timer after manual navigation
      if (typeof restartFocusAutoShift === 'function') {
        restartFocusAutoShift();
      }
    });

    container.appendChild(indicator);
  });
}

function updateFocusIndicators() {
  const indicators = document.querySelectorAll('.focus-indicator');
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === focusIndex);
  });
}

async function navigateFocus(direction) {
  if (!allStories || allStories.length === 0) return;

  focusIndex += direction;

  if (focusIndex >= allStories.length) {
    focusIndex = 0;
  } else if (focusIndex < 0) {
    focusIndex = allStories.length - 1;
  }

  await updateFocusDisplay();
  
  // Restart auto-shift timer after manual navigation
  if (typeof restartFocusAutoShift === 'function') {
    restartFocusAutoShift();
  }
}

function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Only handle arrow keys when focus view is active
    const focusView = document.getElementById('focus');
    if (!focusView || !focusView.classList.contains('active')) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateFocus(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateFocus(1);
    }
  });
}

// Export functions for use by other modules
window.settingsModule = {
  openSettingsModal,
  applyViewMode,
  loadFocusView,
  navigateFocus
};