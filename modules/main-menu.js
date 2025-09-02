// Main Navigation Menu System
document.addEventListener('DOMContentLoaded', function() {
  initializeMainMenu();
  initializeHelpModal();
});

function initializeMainMenu() {
  const menuBtn = document.getElementById('main-menu-btn');
  const dropdownContent = document.getElementById('main-dropdown-content');

  if (!menuBtn || !dropdownContent) return;

  // Toggle dropdown
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownContent.classList.toggle('show');
    menuBtn.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
      dropdownContent.classList.remove('show');
      menuBtn.classList.remove('active');
    }
  });

  // Menu item handlers
  const viewSwitchGrid = document.getElementById('view-switch-grid');
  const viewSwitchGallery = document.getElementById('view-switch-gallery');
  const helpBtn = document.getElementById('help-btn');
  const toolboxBtn = document.getElementById('toolbox-btn');

  // View switching handlers
  if (viewSwitchGrid) {
    viewSwitchGrid.addEventListener('click', () => {
      if (typeof switchView === 'function') {
        switchView('grid');
      }
      closeMainMenu();
    });
  }

  if (viewSwitchGallery) {
    viewSwitchGallery.addEventListener('click', () => {
      if (typeof switchView === 'function') {
        switchView('gallery');
      }
      closeMainMenu();
    });
  }

  // Help modal handler
  if (helpBtn) {
    helpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openHelpModal();
      closeMainMenu();
    });
  }

  // Toolbox redirect handler
  if (toolboxBtn) {
    toolboxBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('/other-tools/tools-menu/index.html', '_blank');
      closeMainMenu();
    });
  }
}

function closeMainMenu() {
  const dropdownContent = document.getElementById('main-dropdown-content');
  const menuBtn = document.getElementById('main-menu-btn');
  
  if (dropdownContent && menuBtn) {
    dropdownContent.classList.remove('show');
    menuBtn.classList.remove('active');
  }
}

function initializeHelpModal() {
  const modal = document.getElementById('help-modal');
  const closeBtn = document.querySelector('.help-modal .close');

  // Close modal events
  if (closeBtn) {
    closeBtn.addEventListener('click', closeHelpModal);
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeHelpModal();
    }
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'block') {
      closeHelpModal();
    }
  });
}

function openHelpModal() {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeHelpModal() {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore background scrolling
  }
}