// Player Controls - Handle all keyboard interactions for player.html
// This script manages navigation and slideshow controls

var slideFrame = null;
var currentPage = window.currentPage || 1; // Use injected value if available
var totalPages = 100;
var pageInput = null;
var isAutoPageTurnEnabled = true;
var pageTimeout = null;
var pageTiming = null;
var isDockModeEnabled = true;
var controlsElement = null;
var slideFrameElement = null;
var dockTriggerElement = null;
var mouseInControlsArea = false;

// Initialize player controls when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    slideFrame = document.getElementById('slideFrame');
    pageInput = document.getElementById('pageInput');
    
    // CRITICAL: Attach iframe load listener BEFORE any navigation
    if (slideFrame) {
        slideFrame.addEventListener('load', function() {
            setTimeout(function() {
                clickSlideshowButton();
            }, 800);
        });
    }
    
    // Handle URL parameters for page navigation
    handleURLParameters();
    
    setupNavigationControls();
    setupKeyboardControls();
    setupAudioControls();
    setupAutoPageTurn();
    setupCalculateTimingButton();
    setupDockMode();
    
    // Initialize auto page turn as enabled
    loadPageTiming();
    
    // Initialize dock mode as enabled by default
    setTimeout(function() {
        enableDockMode();
    }, 100);
    
    // Auto-start slideshow for initial page load will be handled by iframe load event
    
    console.log('Player controls initialized');
});

// Handle URL parameters like ?page=N
function handleURLParameters() {
    var urlParams = new URLSearchParams(window.location.search);
    var pageParam = urlParams.get('page');
    
    if (pageParam) {
        var targetPage = parseInt(pageParam);
        if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
            console.log('URL parameter found, navigating to page:', targetPage);
            navigateToPage(targetPage);
        }
    }
}

// Setup navigation button controls
function setupNavigationControls() {
    document.getElementById('previousButton').addEventListener('click', function() {
        navigateToPage(currentPage - 1);
    });
    
    document.getElementById('nextButton').addEventListener('click', function() {
        navigateToPage(currentPage + 1);
    });
    
    document.getElementById('homeButton').addEventListener('click', function() {
        navigateToPage(1);
    });
    
    document.getElementById('goButton').addEventListener('click', function() {
        var page = parseInt(pageInput.value);
        if (!isNaN(page)) {
            navigateToPage(page);
        }
    });
}

// Setup all keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', function(event) {
        console.log('Player key pressed:', event.key);
        
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            navigateToPage(currentPage - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            navigateToPage(currentPage + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            sendKeyToIframe('ArrowUp');
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            sendKeyToIframe('ArrowDown');
        } else if (event.key === ' ') {
            event.preventDefault();
            sendKeyToIframe(' ');
        } else if (event.key === 'Home') {
            event.preventDefault();
            navigateToPage(1);
        } else if (event.key === 'a' || event.key === 'A') {
            event.preventDefault();
            toggleAutoPageTurn();
        } else if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            slideFrame.contentWindow.focus();
            console.log('Focus shifted to iframe');
        }
    });
}

// Setup audio controls
function setupAudioControls() {
    var bgAudio = document.getElementById('bgAudio');
    var bgVolume = document.getElementById('bgVolume');
    if (bgAudio && bgVolume) {
        bgVolume.addEventListener('input', function() {
            bgAudio.volume = parseFloat(bgVolume.value);
        });
        bgAudio.volume = parseFloat(bgVolume.value);
    }
}

// Navigate to a specific page
function navigateToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        slideFrame.src = 'page' + currentPage + '.html';
        pageInput.value = '';
        
        // Clear existing timeout
        if (pageTimeout) {
            clearTimeout(pageTimeout);
            pageTimeout = null;
        }
        
        
        // Set timeout for pages without audio
        if (isAutoPageTurnEnabled) {
            setupPageTimeout();
        }
        
        // Unmute background music when navigating to next page
        var bgAudio = document.getElementById('bgAudio');
        if (bgAudio && bgAudio.muted) {
            bgAudio.muted = false;
        }
        
        console.log('Navigated to page:', currentPage);
    } else {
        alert('页面号码必须在1到' + totalPages + '之间');
    }
}

// Send keyboard events to the iframe content
function sendKeyToIframe(keyCode) {
    try {
        if (slideFrame && slideFrame.contentWindow) {
            // Try to send custom event to iframe
            var iframeDoc = slideFrame.contentDocument || slideFrame.contentWindow.document;
            if (iframeDoc) {
                // Create and dispatch a custom keyboard event
                var event = new KeyboardEvent('keydown', {
                    key: keyCode,
                    code: keyCode,
                    bubbles: true,
                    cancelable: true
                });
                iframeDoc.dispatchEvent(event);
                console.log('Sent key to iframe:', keyCode);
            }
        }
    } catch (error) {
        console.log('Could not send key to iframe (cross-origin):', error);
        // Fallback: try to trigger slideshow functions directly
        if (keyCode === 'ArrowUp') {
            triggerIframeFunction('skipToNextFrame');
        } else if (keyCode === 'ArrowDown') {
            triggerIframeFunction('skipToPreviousFrame');
        } else if (keyCode === ' ') {
            triggerIframeFunction('toggleAnimationPause');
        }
    }
}

// Try to trigger specific functions in the iframe
function triggerIframeFunction(functionName) {
    try {
        if (slideFrame && slideFrame.contentWindow) {
            var iframeWindow = slideFrame.contentWindow;
            if (typeof iframeWindow[functionName] === 'function') {
                iframeWindow[functionName]();
                console.log('Triggered iframe function:', functionName);
            }
        }
    } catch (error) {
        console.log('Could not trigger iframe function:', functionName, error);
    }
}

// Setup auto page turn functionality
function setupAutoPageTurn() {
    var autoPageTurn = document.getElementById('autoPageTurn');
    if (autoPageTurn) {
        autoPageTurn.addEventListener('change', function() {
            isAutoPageTurnEnabled = this.checked;
            if (isAutoPageTurnEnabled) {
                loadPageTiming(); // Just load existing timing, don't generate
                console.log('自动翻页已启用');
            } else {
                if (pageTimeout) {
                    clearTimeout(pageTimeout);
                    pageTimeout = null;
                }
                console.log('自动翻页已禁用');
            }
        });
    }
}

// Setup calculate timing button
function setupCalculateTimingButton() {
    var calculateButton = document.getElementById('calculateTiming');
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            generatePageTiming();
        });
    }
}

// Setup dock mode functionality
function setupDockMode() {
    controlsElement = document.getElementById('controls');
    slideFrameElement = document.getElementById('slideFrame');
    dockTriggerElement = document.querySelector('.dock-trigger');
    
    var autoDockMode = document.getElementById('autoDockMode');
    if (autoDockMode) {
        autoDockMode.addEventListener('change', function() {
            isDockModeEnabled = this.checked;
            if (isDockModeEnabled) {
                enableDockMode();
            } else {
                disableDockMode();
            }
        });
    }
}

// Enable dock mode - hide controls and show on hover
function enableDockMode() {
    if (!controlsElement || !slideFrameElement) return;
    
    // Make slideFrame full height
    slideFrameElement.classList.remove('with-controls');
    
    // Hide controls initially
    controlsElement.classList.add('hidden');
    
    // Add mouse event listeners
    if (dockTriggerElement) {
        dockTriggerElement.addEventListener('mouseenter', showControls);
    }
    controlsElement.addEventListener('mouseenter', function() {
        mouseInControlsArea = true;
        showControls();
    });
    controlsElement.addEventListener('mouseleave', function() {
        mouseInControlsArea = false;
        setTimeout(function() {
            if (!mouseInControlsArea && isDockModeEnabled) {
                hideControls();
            }
        }, 500);
    });
    
    console.log('Dock mode enabled');
}

// Disable dock mode - show controls permanently
function disableDockMode() {
    if (!controlsElement || !slideFrameElement) return;
    
    // Restore slideFrame with controls height
    slideFrameElement.classList.add('with-controls');
    
    // Show controls permanently
    controlsElement.classList.remove('hidden');
    
    // Remove event listeners
    if (dockTriggerElement) {
        dockTriggerElement.removeEventListener('mouseenter', showControls);
    }
    
    console.log('Dock mode disabled');
}

// Show controls
function showControls() {
    if (controlsElement && isDockModeEnabled) {
        controlsElement.classList.remove('hidden');
    }
}

// Hide controls
function hideControls() {
    if (controlsElement && isDockModeEnabled) {
        controlsElement.classList.add('hidden');
    }
}

// Toggle auto page turn on/off with keyboard
function toggleAutoPageTurn() {
    var autoPageTurn = document.getElementById('autoPageTurn');
    if (autoPageTurn) {
        autoPageTurn.checked = !autoPageTurn.checked;
        // Trigger the change event to run the existing logic
        autoPageTurn.dispatchEvent(new Event('change'));
        console.log('Auto page turn toggled via keyboard:', autoPageTurn.checked ? 'ON' : 'OFF');
    }
}

// Generate page timing using backend API
function generatePageTiming() {
    fetch('/api/generate-timing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Page timing generated:', data.data);
            loadPageTiming();
        } else {
            console.error('Failed to generate timing:', data.error);
        }
    })
    .catch(error => {
        console.error('Error generating timing:', error);
    });
}

// Load page timing JSON
function loadPageTiming() {
    fetch('json/page-timing.json')
    .then(response => response.json())
    .then(data => {
        pageTiming = {};
        data.forEach(item => {
            pageTiming[item.page] = item.duration;
        });
        console.log('Loaded page timing:', pageTiming);
        
        // Clear any existing timeout before setting new one
        if (pageTimeout) {
            clearTimeout(pageTimeout);
            pageTimeout = null;
        }
        
        setupPageTimeout();
    })
    .catch(error => {
        console.error('Error loading page timing:', error);
        // Fallback to default timing
        setupPageTimeout();
    });
}

// Setup timeout based on page timing
function setupPageTimeout() {
    if (!isAutoPageTurnEnabled) return;
    
    // Get duration for current page (default 10 seconds)
    var duration = (pageTiming && pageTiming[currentPage]) ? pageTiming[currentPage] : 10;
    var timeoutMs = duration * 1000;
    
    console.log(`Setting ${duration}s timeout for page ${currentPage}`);
    
    pageTimeout = setTimeout(function() {
        console.log(`Page ${currentPage} timeout (${duration}s) reached, turning to next page`);
        navigateToPage(currentPage + 1);
    }, timeoutMs);
}

// Click slideshow button in the current page
function clickSlideshowButton() {
    try {
        if (slideFrame && slideFrame.contentDocument) {
            var doc = slideFrame.contentDocument;
            var foundSlideshowButton = false;
            
            // First, look for slideshow buttons by ID
            var animationButton = doc.getElementById('animationPlayButton');
            if (animationButton) {
                console.log('Clicking animation play button');
                animationButton.click();
                foundSlideshowButton = true;
            }
            
            // If not found, look for buttons by text content
            if (!foundSlideshowButton) {
                var buttons = doc.querySelectorAll('button');
                buttons.forEach(function(button) {
                    if (button.textContent.includes('播放') && button.textContent.includes('幻灯片')) {
                        console.log('Clicking slideshow button by text');
                        button.click();
                        foundSlideshowButton = true;
                    }
                });
            }
            
            // If no slideshow button found, look for audio/video play button
            if (!foundSlideshowButton) {
                var audioIcon = doc.getElementById('audioIcon');
                if (audioIcon) {
                    console.log('Clicking audio/video play button');
                    audioIcon.click();
                }
            }
        }
    } catch (error) {
        console.log('Could not click slideshow button (cross-origin)');
    }
}