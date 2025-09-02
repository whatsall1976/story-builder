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

async function openPreviewModal(folder) {
  const modal = document.getElementById('previewModal');
  const previewContainer = document.getElementById('previewContainer');
  modal.style.display = 'block';
  previewContainer.innerHTML = '';

  const pageCount = await getPageCount(folder);
  for (let i = 1; i <= pageCount; i++) {
    const iframeContainer = document.createElement('div');
    iframeContainer.classList.add('iframe-container');

    const iframeWrapper = document.createElement('div');
    iframeWrapper.classList.add('iframe-wrapper');
    const iframe = document.createElement('iframe');
    iframe.src = `/stories/${folder}/page${i}.html`;
    iframeWrapper.appendChild(iframe);
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