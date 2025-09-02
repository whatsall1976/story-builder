// Get elements
const mainButton = document.getElementById('main-button');
const verticalMenu = document.getElementById('vertical-menu');
const floatingPage = document.getElementById('floating-page');

// Function to toggle vertical menu visibility
mainButton.addEventListener('click', () => {
    verticalMenu.classList.toggle('visible');
});

// Function to show floating page with HTML content
function showFloatingPageFromHTML(htmlContent) {
    floatingPage.innerHTML = htmlContent + '<button class="close-button">Close</button>';
    floatingPage.classList.add('visible');
    
    // Add event listener to close button
    floatingPage.querySelector('.close-button').addEventListener('click', () => {
        hideFloatingPage();
    });

     // Add event listener to close when clicking outside
    document.addEventListener('click', outsideClickListener);
}

// Function to show floating page with fallback content
function showFloatingPage(title, content) {
    floatingPage.innerHTML = `
        <h2>${title}</h2>
        <p>${content}</p>
        <button class="close-button">Close</button>
    `;
    floatingPage.classList.add('visible');
    
    // Add event listener to close button
    floatingPage.querySelector('.close-button').addEventListener('click', () => {
        hideFloatingPage();
    });

     // Add event listener to close when clicking outside
    document.addEventListener('click', outsideClickListener);
}

// Function to hide floating page
function hideFloatingPage() {
    floatingPage.classList.remove('visible');
    // Remove event listener
    document.removeEventListener('click', outsideClickListener);
}

// Click outside listener
function outsideClickListener(event) {
    const isClickInsideFloatingPage = floatingPage.contains(event.target);
    const isClickOnSubSubButton = event.target.classList.contains('sub-sub-menu-button');
    
    // Hide if click is outside the floating page AND not on a sub-sub button (which would open a new page)
    if (!isClickInsideFloatingPage && !isClickOnSubSubButton && floatingPage.classList.contains('visible')) {
        hideFloatingPage();
    }
}

// Add event listeners to sub-sub-menu buttons
document.querySelectorAll('.sub-sub-menu-button').forEach(button => {
    button.addEventListener('click', (event) => {
        // Prevent click from immediately closing if outside listener is active
        event.stopPropagation(); 
        
        // Find the menu item index (1-based)
        const menuItem = button.closest('.menu-item');
        const menuItems = Array.from(verticalMenu.querySelectorAll('.menu-item'));
        const menuItemIndex = menuItems.indexOf(menuItem) + 1;
        
        // Find the sub-sub-menu button index within its horizontal menu (1-based)
        const horizontalMenu = button.closest('.horizontal-menu');
        const subSubButtons = Array.from(horizontalMenu.querySelectorAll('.sub-sub-menu-button'));
        const subSubButtonIndex = subSubButtons.indexOf(button) + 1;
        
        // Construct filename
        const filename = `${menuItemIndex}.${subSubButtonIndex}.html`;
        
        // Try to fetch the HTML file
        fetch(filename)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(htmlContent => {
                showFloatingPageFromHTML(htmlContent);
            })
            .catch(error => {
                console.error('Error loading HTML file:', error);
                // Fallback to default content
                const buttonText = event.target.innerText;
                showFloatingPage('Content Not Found', `Could not load content for ${buttonText}. File: ${filename}`);
            });
    });
});

// Prevent vertical menu from closing when clicking inside it
verticalMenu.addEventListener('click', (event) => {
    event.stopPropagation();
});

// Optional: Close vertical menu when clicking outside
document.addEventListener('click', (event) => {
    const isClickInsideWidget = document.querySelector('.widget-container').contains(event.target);
    if (!isClickInsideWidget && verticalMenu.classList.contains('visible')) {
        verticalMenu.classList.remove('visible');
    }
}); 