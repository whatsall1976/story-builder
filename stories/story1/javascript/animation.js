// Animation variables for saved pages
var pageAnimationTimer = null;
var pageCurrentFrame = 0;
var pageIsAnimationPlaying = false;
var pageAnimationAudio = null;
var pageImageList = []; // List of image files from backend

// Helper function to get animation button positioning based on title position
function getPageAnimationButtonStyle(titlePosition) {
    // ALWAYS position at top right corner, very close to edge
    return 'top: 4px; right: 4px;';
}

// Function to get image file list from backend
function getImageList(folder, callback) {
    // Create API endpoint URL - extract folder path relative to current page
    var currentPath = window.location.pathname;
    var basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    var apiUrl = '/api/list-images?folder=' + encodeURIComponent(folder) + '&basePath=' + encodeURIComponent(basePath);
    
    fetch(apiUrl)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Backend API not available');
            }
            return response.json();
        })
        .then(function(data) {
            pageImageList = data.images || [];
            callback(pageImageList);
        })
        .catch(function(error) {
            console.log('Backend API failed, falling back to sequential scanning:', error);
            // Fallback to old method if backend not available
            fallbackImageDiscovery(folder, callback);
        });
}

// Fallback function for when backend API is not available
function fallbackImageDiscovery(folder, callback) {
    pageImageList = [];
    var extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    var currentIndex = 1;
    var consecutiveNotFound = 0;
    var maxConsecutiveNotFound = 5;
    
    function findNextImage() {
        if (consecutiveNotFound >= maxConsecutiveNotFound || currentIndex > 200) {
            callback(pageImageList);
            return;
        }
        
        var found = false;
        var extensionIndex = 0;
        
        function tryNextExtension() {
            if (extensionIndex >= extensions.length) {
                consecutiveNotFound++;
                currentIndex++;
                findNextImage();
                return;
            }
            
            var imagePath = folder + currentIndex + '.' + extensions[extensionIndex];
            var img = new Image();
            img.onload = function() {
                if (!found) {
                    found = true;
                    consecutiveNotFound = 0;
                    pageImageList.push(imagePath);
                    currentIndex++;
                    findNextImage();
                }
            };
            img.onerror = function() {
                extensionIndex++;
                tryNextExtension();
            };
            img.src = imagePath;
        }
        
        tryNextExtension();
    }
    
    findNextImage();
}

// Function to play still frame animation in saved pages
function playPageAnimation() {
    if (pageIsAnimationPlaying) {
        stopPageAnimation();
        return;
    }

    if (!pageData.animationFolder || pageData.animationFolder.trim() === '') {
        alert('没有设置幻灯片文件夹');
        return;
    }

    var folder = pageData.animationFolder;
    var interval = parseFloat(pageData.animationInterval) * 1000;
    var scale = pageData.animationScale;
    var position = pageData.animationPosition;
    var audioUrl = pageData.animationAudio;

    var button = document.getElementById('animationPlayButton');
    if (button) {
        button.textContent = '获取图片列表...';
    }

    // Get image list from backend
    getImageList(folder, function(imageList) {
        if (imageList.length === 0) {
            alert('文件夹中没有找到图片文件');
            if (button) {
                button.textContent = '播放幻灯片';
            }
            return;
        }

        console.log('Found ' + imageList.length + ' images:', imageList);
        
        pageIsAnimationPlaying = true;
        pageCurrentFrame = 0;
        
        if (button) {
            button.textContent = '停止幻灯片';
        }

        // Play audio if provided (NO LOOP - let it finish naturally)
        if (audioUrl && audioUrl.trim() !== '') {
            pageAnimationAudio = new Audio(audioUrl);
            pageAnimationAudio.play().catch(function(error) {
                console.log('Audio play failed:', error);
            });
        }

        // Create animation container
        var animationContainer = document.createElement('div');
        animationContainer.id = 'pageAnimationContainer';
        animationContainer.style.cssText = `
            position: absolute;
            left: ${position}%;
            top: 50%;
            transform: translateY(-50%);
            z-index: 5000;
            pointer-events: none;
        `;
        
        var animationImg = document.createElement('img');
        animationImg.id = 'pageAnimationImg';
        animationImg.style.cssText = `
            width: ${scale}%;
            height: auto;
            display: block;
            object-fit: contain;
        `;
        
        animationContainer.appendChild(animationImg);
        document.body.appendChild(animationContainer);

        // Animation loop using backend-provided image list
        function nextPageFrame() {
            if (!pageIsAnimationPlaying || pageImageList.length === 0) return;

            var imagePath = pageImageList[pageCurrentFrame];
            animationImg.src = imagePath;
            
            // Move to next frame
            pageCurrentFrame++;
            if (pageCurrentFrame >= pageImageList.length) {
                pageCurrentFrame = 0; // Loop back to beginning
            }
            
            pageAnimationTimer = setTimeout(nextPageFrame, interval);
        }

        nextPageFrame();
    });
}

function stopPageAnimation() {
    pageIsAnimationPlaying = false;
    if (pageAnimationTimer) {
        clearTimeout(pageAnimationTimer);
        pageAnimationTimer = null;
    }
    
    var animationContainer = document.getElementById('pageAnimationContainer');
    if (animationContainer) {
        animationContainer.remove();
    }
    
    if (pageAnimationAudio) {
        pageAnimationAudio.pause();
        pageAnimationAudio = null;
    }
    
    var button = document.getElementById('animationPlayButton');
    if (button) {
        button.textContent = '播放幻灯片';
    }
}

// New functions for frame-by-frame control (picture only, no audio control)
function skipToNextFrame() {
    if (pageImageList.length === 0 || !document.getElementById('pageAnimationImg')) {
        console.log('No animation running or no images available');
        return;
    }
    
    // Move to next frame immediately
    pageCurrentFrame++;
    if (pageCurrentFrame >= pageImageList.length) {
        pageCurrentFrame = 0; // Loop back to beginning
    }
    
    var animationImg = document.getElementById('pageAnimationImg');
    if (animationImg) {
        animationImg.src = pageImageList[pageCurrentFrame];
        console.log('Skipped to frame:', pageCurrentFrame);
    }
}

function skipToPreviousFrame() {
    if (pageImageList.length === 0 || !document.getElementById('pageAnimationImg')) {
        console.log('No animation running or no images available');
        return;
    }
    
    // Move to previous frame immediately
    pageCurrentFrame--;
    if (pageCurrentFrame < 0) {
        pageCurrentFrame = pageImageList.length - 1; // Loop to last frame
    }
    
    var animationImg = document.getElementById('pageAnimationImg');
    if (animationImg) {
        animationImg.src = pageImageList[pageCurrentFrame];
        console.log('Skipped to previous frame:', pageCurrentFrame);
    }
}

function toggleAnimationPause() {
    if (!pageIsAnimationPlaying && !document.getElementById('pageAnimationContainer')) {
        console.log('No animation to pause/resume');
        return;
    }
    
    if (pageAnimationTimer) {
        // Currently playing - pause it (stop timer but keep everything else)
        clearTimeout(pageAnimationTimer);
        pageAnimationTimer = null;
        console.log('Animation paused (audio continues)');
    } else if (document.getElementById('pageAnimationContainer')) {
        // Currently paused - resume it
        var interval = parseFloat(pageData.animationInterval) * 1000;
        
        function resumeNextFrame() {
            if (pageAnimationTimer && pageImageList.length > 0) {
                // Move to next frame
                pageCurrentFrame++;
                if (pageCurrentFrame >= pageImageList.length) {
                    pageCurrentFrame = 0;
                }
                
                var animationImg = document.getElementById('pageAnimationImg');
                if (animationImg) {
                    animationImg.src = pageImageList[pageCurrentFrame];
                }
                
                pageAnimationTimer = setTimeout(resumeNextFrame, interval);
            }
        }
        
        pageAnimationTimer = setTimeout(resumeNextFrame, interval);
        console.log('Animation resumed (audio unaffected)');
    }
}

// Auto-stop animation when page is hidden or unloaded
document.addEventListener('visibilitychange', function() {
    if (document.hidden && pageIsAnimationPlaying) {
        stopPageAnimation();
    }
});

window.addEventListener('beforeunload', function() {
    if (pageIsAnimationPlaying) {
        stopPageAnimation();
    }
});