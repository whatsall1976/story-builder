// View Mode Management
let currentViewMode = 'grid';
let allStories = [];
let selectedStoryIndex = 0;

// Initialize view mode switching
document.addEventListener('DOMContentLoaded', function() {
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === '1') {
        e.preventDefault();
        switchView('grid');
      } else if (e.key === '4') {
        e.preventDefault();
        switchView('gallery');
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

  if (viewMode === 'grid') {
    gridContainer.style.display = 'grid';
    galleryContainer.classList.remove('active');
  } else if (viewMode === 'gallery') {
    gridContainer.style.display = 'none';
    galleryContainer.classList.add('active');
    if (allStories.length > 0) {
      loadGalleryView();
    }
  }
}

function loadGalleryView() {
  const thumbnailsContainer = document.getElementById('thumbnails');
  thumbnailsContainer.innerHTML = '';

  allStories.forEach((story, index) => {
    const thumbnailCard = document.createElement('div');
    thumbnailCard.classList.add('thumbnail-card');
    if (index === selectedStoryIndex) {
      thumbnailCard.classList.add('selected');
    }

    const img = document.createElement('img');
    img.src = `/stories/${story.folder}/media/1.jpg`;
    img.onerror = function() {
      this.onerror = null;
      this.src = `/stories/${story.folder}/media/1.png`;
    };

    const title = document.createElement('div');
    title.classList.add('thumbnail-title');
    title.textContent = story.title;

    thumbnailCard.appendChild(img);
    thumbnailCard.appendChild(title);
    
    thumbnailCard.addEventListener('click', () => selectStory(index));
    thumbnailsContainer.appendChild(thumbnailCard);
  });

  selectStory(selectedStoryIndex);
}

function selectStory(index) {
  selectedStoryIndex = index;
  const story = allStories[index];

  // Update thumbnail selection
  document.querySelectorAll('.thumbnail-card').forEach((card, i) => {
    card.classList.toggle('selected', i === index);
  });

  // Update featured story
  const featuredImg = document.getElementById('featured-img');
  const featuredTitle = document.getElementById('featured-title');

  featuredImg.src = `/stories/${story.folder}/media/1.jpg`;
  featuredImg.onerror = function() {
    this.onerror = null;
    this.src = `/stories/${story.folder}/media/1.png`;
  };
  
  featuredTitle.textContent = story.title;
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