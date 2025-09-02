// Favorites Management System
let favorites = {};
let currentFilter = 'all'; // 'all', 'grid', 'gallery', or favorite list name

// Initialize favorites system
document.addEventListener('DOMContentLoaded', function() {
  initializeDropdownMenu();
  initializeFavoritesModal();
  loadFavoritesFromFile();
});

// Load favorites from JSON file
async function loadFavoritesFromFile() {
  try {
    const response = await fetch('/api/favorites');
    const data = await response.json();
    
    if (data.success) {
      favorites = data.favorites;
      loadFavoriteMenuItems();
    }
  } catch (error) {
    console.error('Error loading favorites from file:', error);
    favorites = {}; // fallback to empty
  }
}

function initializeDropdownMenu() {
  // The main menu dropdown is now handled by main-menu.js
  // We just need to handle favorite list selection events
}

function selectViewMode(mode) {
  currentFilter = mode;

  // Update active state in dropdown
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeItem = document.querySelector(`[data-view="${mode}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }

  // Handle view switching
  if (mode === 'grid') {
    switchView('grid');
    filterStories('all');
  } else if (mode === 'gallery') {
    switchView('gallery');
    filterStories('all');
  } else {
    // It's a favorite list
    filterStories(mode);
  }
}

function filterStories(filterType) {
  if (filterType === 'all') {
    // Show all stories
    showAllStories();
  } else {
    // Show only stories in the favorite list
    showFavoriteStories(filterType);
  }
}

function showAllStories() {
  // Reset the current filter to 'all'
  currentFilter = 'all';
  
  // Reload all cards
  if (typeof loadCards === 'function') {
    // Fetch the original folders list again
    fetch('/api/folders')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.folders) {
          const grid = document.getElementById('grid');
          grid.innerHTML = '';
          loadCards(data.folders);
        }
      })
      .catch(err => console.error('Error refetching folders:', err));
  }
}

function showFavoriteStories(favoriteListName) {
  const favoriteList = favorites[favoriteListName];
  if (!favoriteList) return;

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  
  // Filter and load only favorite stories
  const favoriteFolders = favoriteList.stories;
  loadCards(favoriteFolders);
}

function initializeFavoritesModal() {
  const modal = document.getElementById('favorites-modal');
  const closeBtn = document.querySelector('.favorites-modal .close');
  const cancelBtn = document.getElementById('cancel-favorite-btn');
  const confirmBtn = document.getElementById('confirm-favorite-btn');
  const nameInput = document.getElementById('favorite-name-input');

  // Close modal events
  [closeBtn, cancelBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', closeFavoritesModal);
    }
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeFavoritesModal();
    }
  });

  // Confirm button
  if (confirmBtn) {
    confirmBtn.addEventListener('click', saveFavoriteList);
  }

  // Name input validation
  if (nameInput) {
    nameInput.addEventListener('input', validateFavoriteForm);
  }
}

function openFavoritesModal() {
  const modal = document.getElementById('favorites-modal');
  const storiesGrid = document.getElementById('stories-grid');
  const nameInput = document.getElementById('favorite-name-input');
  
  if (!modal || !storiesGrid) return;

  // Clear previous state
  nameInput.value = '';
  storiesGrid.innerHTML = '';
  
  // Populate stories
  populateStoriesSelection();
  
  // Show modal
  modal.style.display = 'block';
  nameInput.focus();
}

function closeFavoritesModal() {
  const modal = document.getElementById('favorites-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function populateStoriesSelection() {
  const storiesGrid = document.getElementById('stories-grid');
  if (!storiesGrid || !allStories) return;

  allStories.forEach((story, index) => {
    const storyItem = document.createElement('div');
    storyItem.classList.add('story-checkbox-item');
    storyItem.dataset.folder = story.folder;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('story-checkbox');
    checkbox.id = `story-${index}`;
    checkbox.value = story.folder;

    const img = document.createElement('img');
    img.src = `/stories/${story.folder}/media/1.jpg`;
    img.onerror = function() {
      this.onerror = null;
      this.src = `/stories/${story.folder}/media/1.png`;
    };

    const storyName = document.createElement('div');
    storyName.classList.add('story-name');
    storyName.textContent = story.title;

    // Toggle selection on click
    storyItem.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      storyItem.classList.toggle('selected', checkbox.checked);
      updateSelectionCounter();
      validateFavoriteForm();
    });

    storyItem.appendChild(checkbox);
    storyItem.appendChild(img);
    storyItem.appendChild(storyName);
    storiesGrid.appendChild(storyItem);
  });

  updateSelectionCounter();
}

function updateSelectionCounter() {
  const checkedBoxes = document.querySelectorAll('.story-checkbox:checked');
  const counter = document.getElementById('selection-counter');
  
  if (counter) {
    counter.textContent = `已选择 ${checkedBoxes.length} 个故事`;
  }
}

function validateFavoriteForm() {
  const nameInput = document.getElementById('favorite-name-input');
  const confirmBtn = document.getElementById('confirm-favorite-btn');
  const checkedBoxes = document.querySelectorAll('.story-checkbox:checked');

  const isValid = nameInput.value.trim() && checkedBoxes.length > 0;
  
  if (confirmBtn) {
    confirmBtn.disabled = !isValid;
  }

  return isValid;
}

async function saveFavoriteList() {
  if (!validateFavoriteForm()) return;

  const nameInput = document.getElementById('favorite-name-input');
  const checkedBoxes = document.querySelectorAll('.story-checkbox:checked');
  
  const listName = nameInput.value.trim();
  const selectedStories = Array.from(checkedBoxes).map(cb => cb.value);

  // Save to favorites
  favorites[listName] = {
    name: listName,
    stories: selectedStories,
    createdAt: Date.now()
  };

  try {
    // Save to JSON file via API
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ favorites })
    });

    const result = await response.json();
    
    if (result.success) {
      // Update dropdown menu
      loadFavoriteMenuItems();
      
      // Close modal
      closeFavoritesModal();
      
      console.log(`Favorite list "${listName}" saved to JSON file with ${selectedStories.length} stories`);
    } else {
      console.error('Failed to save favorites to file:', result.error);
    }
  } catch (error) {
    console.error('Error saving favorites to file:', error);
  }
}

function loadFavoriteMenuItems() {
  const dropdownContent = document.getElementById('main-dropdown-content');
  if (!dropdownContent) return;

  // Remove existing favorite items
  const existingFavorites = dropdownContent.querySelectorAll('.favorite-item');
  existingFavorites.forEach(item => item.remove());

  // Add favorite lists
  Object.keys(favorites).forEach(listName => {
    const favoriteItem = document.createElement('button');
    favoriteItem.classList.add('main-dropdown-item', 'favorite-item');
    favoriteItem.dataset.view = listName;
    
    favoriteItem.innerHTML = `
      <div class="main-dropdown-item-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      ${listName}
    `;

    favoriteItem.addEventListener('click', (e) => {
      e.preventDefault();
      selectViewMode(listName);
      // Close the main menu
      if (typeof closeMainMenu === 'function') {
        closeMainMenu();
      }
    });

    // Insert before the separator (if it exists)
    const separator = dropdownContent.querySelector('.main-dropdown-separator');
    if (separator) {
      dropdownContent.insertBefore(favoriteItem, separator);
    } else {
      dropdownContent.appendChild(favoriteItem);
    }
  });
}

// Export functions for use by other modules
window.favoritesModule = {
  selectViewMode,
  filterStories,
  showAllStories,
  showFavoriteStories
};

// Make openFavoritesModal available globally for main-menu.js
window.openFavoritesModal = openFavoritesModal;