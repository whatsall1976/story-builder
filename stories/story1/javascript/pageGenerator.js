// Page Generator Module
// Handles generation of individual page HTML files and preview functionality

class PageGenerator {
    constructor(pageData) {
        this.pageData = pageData;
    }

    // Helper function to get the CSS for title positioning
    getTitlePositionStyle(position) {
        switch (position) {
            case 'top-left':
                return 'left: 10px; top: 10px;';
            case 'top':
                return 'left: 50%; top: 10px; transform: translateX(-50%);';
            case 'top-right':
                return 'right: 10px; top: 10px;';
            case 'bottom-left':
                return 'left: 10px; bottom: 10px;';
            case 'bottom':
                return 'left: 50%; bottom: 10px; transform: translateX(-50%);';
            case 'bottom-right':
                return 'right: 10px; bottom: 10px;';
            default:
                return 'left: 10px; top: 10px;'; // Default to top-left
        }
    }

    // Helper function to get animation button positioning based on title position (VERTICAL alignment)
    getAnimationButtonStyle(titlePosition) {
        // ALWAYS position at top right corner, very close to edge
        return 'top: 4px; right: 4px;';
    }

    // Helper function to get teleport button positioning style
    getTeleportButtonPositionStyle(position) {
        switch (position) {
            case 'top-left':
                return 'left: 10px; top: 10px;';
            case 'top':
                return 'left: 50%; top: 10px; transform: translateX(-50%);';
            case 'top-right':
                return 'right: 10px; top: 10px;';
            case 'middle-left':
                return 'left: 10px; top: 50%; transform: translateY(-50%);';
            case 'center':
                return 'left: 50%; top: 50%; transform: translate(-50%, -50%);';
            case 'middle-right':
                return 'right: 10px; top: 50%; transform: translateY(-50%);';
            case 'bottom-left':
                return 'left: 10px; bottom: 10px;';
            case 'bottom':
                return 'left: 50%; bottom: 10px; transform: translateX(-50%);';
            case 'bottom-right':
                return 'right: 10px; bottom: 10px;';
            default:
                return 'left: 10px; top: 10px;';
        }
    }

    // Function to generate preview content
    generatePreviewContent() {
        // Update pageData with current form values
        this.updatePageDataFromForm();

        var bgMediaElement, fgMediaElement;
        var audioElement = '';
        var hasBgVideo = this.pageData.bgUrl.endsWith('.mp4') || this.pageData.bgUrl.endsWith('.webm') || this.pageData.bgUrl.endsWith('.ogg');

        // Background style
        var bgStyle = '';
        bgStyle += 'width: ' + this.pageData.bgScale + '%;';
        var bgPosLeft = this.pageData.bgPos + '%';
        bgStyle += 'left: ' + bgPosLeft + ';';
        var bgCropWidth = (100 - this.pageData.bgWid)/2 + '%';
        bgStyle += 'clip-path: inset(0% ' + bgCropWidth + ' 0% ' + bgCropWidth + ');';

        // Foreground style
        var fgStyle = '';
        fgStyle += 'width: ' + this.pageData.fgScale + '%;';
        var fgPosLeft = this.pageData.fgPos + '%';
        fgStyle += 'left: ' + fgPosLeft + ';';
        var fgCropWidth = (100 - this.pageData.fgWid)/2 + '%';
        fgStyle += 'clip-path: inset(0% ' + fgCropWidth + ' 0% ' + fgCropWidth + ');';

        // Show audio/video control if there's audio OR background video
        if (this.pageData.audioUrl.trim() !== '' || hasBgVideo) {
            audioElement = '<div id="audioIcon" class="audio-icon play" onclick="toggleAudioAndVideo()"></div>';
            if (this.pageData.audioUrl.trim() !== '') {
                audioElement += '<audio id="audioPlayer" style="display: none;"><source src="' + this.pageData.audioUrl + '" type="audio/mpeg">Your browser does not support the audio element.</audio>';
            }
        }

        // Generate background media element
        if (hasBgVideo) {
            bgMediaElement = '<video id="bgVideo" src="' + this.pageData.bgUrl + '" muted loop style="position: absolute; bottom:0; ' + bgStyle + '"></video>';
        } else if (this.pageData.bgUrl.endsWith('.jpg') || this.pageData.bgUrl.endsWith('.png') || this.pageData.bgUrl.endsWith('.gif') || this.pageData.bgUrl.endsWith('.webp')) {
            bgMediaElement = '<img src="' + this.pageData.bgUrl + '" alt="Background Image" class="bgImg" style="' + bgStyle + '">';
        } else {
            bgMediaElement = '';
        }

        // Generate foreground media element
        if (this.pageData.fgUrl.endsWith('.mp4') || this.pageData.fgUrl.endsWith('.webm') || this.pageData.fgUrl.endsWith('.ogg')) {
            fgMediaElement = '<video id="fgVideo" src="' + this.pageData.fgUrl + '"muted loop style="position:absolute;' + fgStyle + '"></video>';
        } else if (this.pageData.fgUrl.endsWith('.jpg') || this.pageData.fgUrl.endsWith('.png') || this.pageData.fgUrl.endsWith('.gif') || this.pageData.fgUrl.endsWith('.webp')) {
            fgMediaElement = '<img src="' + this.pageData.fgUrl + '" alt="Foreground Image" class="fgImg" style="' + fgStyle + '">';
        } else {
            fgMediaElement = '';
        }
       
        this.pageData.previewContent =
        '<!-- HTML content for preview -->' +
        '<div>' +
            bgMediaElement +
            fgMediaElement +
            audioElement +
            (this.pageData.title || this.pageData.showPageNumber ? '<div class="title" style="position: absolute; ' + this.getTitlePositionStyle(this.pageData.titlePos) + '">' + this.pageData.title + (this.pageData.showPageNumber ? '&nbsp;' + this.pageData.pageNum : '') + '</div>' : '');

            // Add animation button if animation folder is specified - ALWAYS TOP RIGHT CORNER
            if (this.pageData.animationFolder.trim() !== '') {
                this.pageData.previewContent += '<button id="animationPlayButton" onclick="playPageAnimation()" style="position: absolute; ' + this.getAnimationButtonStyle(this.pageData.titlePos) + ' z-index: 10001; padding: 10px; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer;">播放幻灯片</button>';
            }

            // Add teleport buttons
            if (this.pageData.teleportButtons && this.pageData.teleportButtons.length > 0) {
                this.pageData.teleportButtons.forEach((button, index) => {
                    var buttonStyle = 'position: absolute; ' + this.getTeleportButtonPositionStyle(button.position) + 
                        ' z-index: 9999; padding: 8px 16px; border: none; cursor: pointer; font-size: 24pt; ' +
                        'background-color: ' + (button.color === 'white' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)') + '; ' +
                        'color: ' + (button.color === 'white' ? 'black' : 'white') + '; ' +
                        'animation: flashTeleport 2s infinite;';
                    
                    this.pageData.previewContent += '<button class="teleportButton" onclick=\'handleTeleportClick(' + 
                        JSON.stringify(button.url) + ', ' + JSON.stringify(button.newWindow) + ', ' + JSON.stringify(button.loop) + ')\' style="' + buttonStyle + '">' + button.name + '</button>';
                });
            }

            this.pageData.previewContent += '</div>';
            
            // Apply narrative text position and width
            var descriptStyle = 'position: absolute; background-color: rgba(0, 0, 0, 0.6); color: white; font-size: 18px; padding: 20px; z-index: 8888; box-sizing: border-box; text-align: center;';
            if (this.pageData.descriptPos === 'top') {
                descriptStyle += 'top: 0; left: 0; right: 0; width: 100%;';
            } else if (this.pageData.descriptPos === 'middle') {
                descriptStyle += 'top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60%; display: flex; font-size: 24px; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0); color: #000;';
            } else { // Default to bottom
                descriptStyle += 'bottom: 0; left: 0; right: 0; width: 100%;';
            }

            // Keep narrative text OUTSIDE the main div so it stays visible during animation
            if (this.pageData.descript !== '') {
                this.pageData.previewContent += '<div class="descript" style="' + descriptStyle + '">' + this.pageData.descript + '</div>';
            }

            // Check if conv1 is not empty and update conv1Text accordingly
            if (this.pageData.conv1.trim() !== '') {
                this.pageData.previewContent += '<div class="conv" style="position: absolute; left: ' + this.pageData.conv1PosL + 'px; top: ' + this.pageData.conv1PosT + 'px;" onclick="speakText1()">' + this.pageData.conv1 + '</div>';
            }

            // Check if conv2 is not empty and update conv2Text accordingly
            if (this.pageData.conv2.trim() !== '') {
                this.pageData.previewContent += '<div class="conv" style="position: absolute; left: ' + this.pageData.conv2PosL + 'px; top: ' + this.pageData.conv2PosT + 'px;" onclick="speakText2()">' + this.pageData.conv2 + '</div>';
            }

        return this.pageData.previewContent;
    }

    // Function to update pageData from form values
    updatePageDataFromForm() {
        this.pageData.bgUrl = document.getElementById('bgUrl').value;
        this.pageData.bgScale = document.getElementById('bgScale').value;
        this.pageData.bgWid = document.getElementById('bgWid').value;
        this.pageData.bgPos = document.getElementById('bgPos').value;
        this.pageData.fgUrl = document.getElementById('fgUrl').value;
        this.pageData.audioUrl = document.getElementById('audioUrl').value;
        this.pageData.descript = document.getElementById('descript').value;
        this.pageData.fgScale = document.getElementById('fgScale').value;
        this.pageData.fgWid = document.getElementById('fgWid').value;
        this.pageData.fgPos = document.getElementById('fgPos').value;
        this.pageData.bgStart = document.getElementById('bgStart').value;
        this.pageData.fgStart = document.getElementById('fgStart').value;
        this.pageData.bgEnd = document.getElementById('bgEnd').value;
        this.pageData.fgEnd = document.getElementById('fgEnd').value;
        this.pageData.title = document.getElementById('title').value;
        this.pageData.titlePos = document.getElementById('titlePos').value;
        this.pageData.pageNum = document.getElementById('pageNum').value;
        this.pageData.conv1 = document.getElementById('conv1').value;
        this.pageData.conv1PosL = document.getElementById('conv1PosL').value;
        this.pageData.conv1PosT = document.getElementById('conv1PosT').value;
        this.pageData.conv2 = document.getElementById('conv2').value;
        this.pageData.conv2PosL = document.getElementById('conv2PosL').value;
        this.pageData.conv2PosT = document.getElementById('conv2PosT').value;
        this.pageData.animationFolder = document.getElementById('animationFolder').value;
        this.pageData.animationInterval = document.getElementById('animationInterval').value;
        this.pageData.animationScale = document.getElementById('animationScale').value;
        this.pageData.animationPosition = document.getElementById('animationPosition').value;
        this.pageData.animationAudio = document.getElementById('animationAudio').value;
        this.pageData.showPageNumber = document.getElementById('showPageNumber').checked;
        
        // Load narrative text position
        this.pageData.descriptPos = document.querySelector('input[name="descriptPos"]:checked').value;
        
        // Always update player settings from form values
        this.pageData.storyTitle = document.getElementById('storyTitle').value;
        this.pageData.playerBgAudio = document.getElementById('playerBgAudio').value;
        this.pageData.sceneBgColor = document.getElementById('sceneBgColor').value;
        this.pageData.controlsBgColor = document.getElementById('controlsBgColor').value;
    }

    // Function to generate complete HTML page
    generatePageHTML() {
        // Construct the script content as an object
        var pageDataScript = {
            bgUrl: this.pageData.bgUrl,
            bgScale: this.pageData.bgScale,
            bgWid: this.pageData.bgWid,
            bgPos: this.pageData.bgPos,
            fgUrl: this.pageData.fgUrl,
            audioUrl: this.pageData.audioUrl,
            descript: this.pageData.descript,
            fgScale: this.pageData.fgScale,
            fgWid: this.pageData.fgWid,
            fgPos: this.pageData.fgPos,
            bgStart: this.pageData.bgStart,
            bgEnd: this.pageData.bgEnd,
            fgStart: this.pageData.fgStart,
            fgEnd: this.pageData.fgEnd,
            title: this.pageData.title,
            titlePos: this.pageData.titlePos,
            pageNum: this.pageData.pageNum,
            conv1: this.pageData.conv1,
            conv1PosL: this.pageData.conv1PosL,
            conv1PosT: this.pageData.conv1PosT,
            conv2: this.pageData.conv2,
            conv2PosL: this.pageData.conv2PosL,
            conv2PosT: this.pageData.conv2PosT,
            animationFolder: this.pageData.animationFolder,
            animationInterval: this.pageData.animationInterval,
            animationScale: this.pageData.animationScale,
            animationPosition: this.pageData.animationPosition,
            animationAudio: this.pageData.animationAudio,
            showPageNumber: this.pageData.showPageNumber,
            storyTitle: this.pageData.storyTitle,
            playerBgAudio: this.pageData.playerBgAudio,
            sceneBgColor: this.pageData.sceneBgColor,
            controlsBgColor: this.pageData.controlsBgColor,
            descriptPos: this.pageData.descriptPos,
            teleportButtons: this.pageData.teleportButtons
        };

        // Convert the pageDataScript object to a JSON string
        var scriptContentStart = '<script> var pageData = ';
        var scriptContentEnd = '; ' + String.fromCharCode(60) + '/script' + String.fromCharCode(62);
        var scriptContent = scriptContentStart + JSON.stringify(pageDataScript) + scriptContentEnd;

        // Generate HTML content for the saved file using pageData
        var savedHTML = `<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Saved Webpage</title>
    <link rel='stylesheet' type='text/css' href='javascript/builder.css'>
    <style>
        body { background-color: ${this.pageData.sceneBgColor} !important; }
        html { background-color: ${this.pageData.sceneBgColor} !important; }
        @keyframes flashTeleport { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
    </style>
    ${scriptContent}
</head>
<body style='background-color: ${this.pageData.sceneBgColor};'>
    ${this.pageData.previewContent}
    <script>
        function toggleAudioAndVideo() {
            var audio = document.getElementById('audioPlayer');
            var video = document.getElementById('bgVideo');
            var icon = document.getElementById('audioIcon');
            var isPlaying = false;
            if (audio && !audio.paused) isPlaying = true;
            if (video && !video.paused) isPlaying = true;
            if (isPlaying) {
                if (audio) audio.pause();
                if (video) video.pause();
                icon.classList.remove('pause');
                icon.classList.add('play');
            } else {
                if (audio) audio.play();
                if (video) video.play();
                icon.classList.remove('play');
                icon.classList.add('pause');
            }
        }
        function toggleAudio() { toggleAudioAndVideo(); }
        function handleTeleportClick(url, newWindow, loop) {
            var pageMatch = url.match(/page(\\d+)\\.html/);
            if (pageMatch) {
                // For page navigation, always use player.html to enable iframe and timing functionality
                var pageNum = pageMatch[1];
                var currentPath = window.location.pathname;
                var storyMatch = currentPath.match(/\\/stories\\/([^\\/]+)\\//);
                var storyName = storyMatch ? storyMatch[1] : '';
                var playerUrl = '/stories/' + storyName + '/player.html?page=' + pageNum;
                
                // Check if we're inside an iframe (player.html)
                if (window.parent !== window) {
                    // We're in an iframe, use postMessage to communicate with parent
                    try {
                        window.parent.postMessage({ type: 'teleport', url: playerUrl }, '*');
                    } catch (e) {
                        // Fallback if postMessage fails
                        window.location.href = playerUrl;
                    }
                } else {
                    // We're in a standalone page, redirect normally
                    if (newWindow) {
                        window.open(playerUrl, '_blank');
                    } else {
                        window.location.href = playerUrl;
                    }
                }
            } else {
                // For non-page URLs, use direct navigation
                if (newWindow) { 
                    window.open(url, '_blank'); 
                } else { 
                    // Mute background music in parent before navigation
                    if (window.parent !== window) {
                        try {
                            var parentAudio = window.parent.document.getElementById('bgAudio');
                            if (parentAudio) {
                                parentAudio.muted = true;
                            }
                        } catch (e) {
                            // Cross-origin restriction, ignore
                        }
                    }
                    window.location.href = url;
                }
            }
        }
        document.addEventListener('DOMContentLoaded', function() {
            var urlParams = new URLSearchParams(window.location.search);
            var pageParam = urlParams.get('page');
            if (pageParam) {
                var targetUrl = './page' + pageParam + '.html';
                setTimeout(function() { window.location.href = targetUrl; }, 100);
                return;
            }
            
            
            document.addEventListener('keydown', function(event) {
                if (event.key === 'ArrowUp') {
                    if (typeof skipToNextFrame === 'function') {
                        skipToNextFrame();
                        console.log('ArrowUp: skipped to next frame');
                    }
                } else if (event.key === 'ArrowDown') {
                    if (typeof skipToPreviousFrame === 'function') {
                        skipToPreviousFrame();
                        console.log('ArrowDown: skipped to previous frame');
                    }
                } else if (event.key === ' ') {
                    event.preventDefault();
                    if (typeof toggleAnimationPause === 'function') {
                        toggleAnimationPause();
                        console.log('Space: toggled animation pause');
                    }
                }
            });
        });
    </script>
    <script src='javascript/video.js?v=${Date.now()}'></script>
    <script src='javascript/tts1.js?v=${Date.now()}'></script>
    <script src='javascript/tts2.js?v=${Date.now()}'></script>
    <script src='javascript/animation.js?v=${Date.now()}'></script>
</body>
</html>`;

        return savedHTML;
    }

    // Function to save page as HTML file
    savePage() {
        var savedHTML = this.generatePageHTML();
        
        // Create a Blob containing the HTML content
        var blob = new Blob([savedHTML], { type: 'text/html' });

        // Create a link element to trigger the download
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'page' + this.pageData.pageNum +'.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Auto-increment page number after saving
        this.autoIncrementPageAndPaths();
    }

    // Function to auto-increment page number and update paths
    autoIncrementPageAndPaths() {
        var pageNumInput = document.getElementById('pageNum');
        var currentPageNum = parseInt(pageNumInput.value);
        if (!isNaN(currentPageNum)) {
            var newPageNum = currentPageNum + 1;
            pageNumInput.value = newPageNum;
            
            // Auto-update media file paths that follow the pattern media/{current-page-number}
            var mediaPathRegex = new RegExp('media/' + currentPageNum + '(\\.|/|$)', 'g');
            
            // Update background URL
            var bgUrlInput = document.getElementById('bgUrl');
            if (bgUrlInput.value.match(mediaPathRegex)) {
                bgUrlInput.value = bgUrlInput.value.replace(mediaPathRegex, 'media/' + newPageNum + '$1');
            }
            
            // Update foreground URL
            var fgUrlInput = document.getElementById('fgUrl');
            if (fgUrlInput.value.match(mediaPathRegex)) {
                fgUrlInput.value = fgUrlInput.value.replace(mediaPathRegex, 'media/' + newPageNum + '$1');
            }
            
            // Update audio URL
            var audioUrlInput = document.getElementById('audioUrl');
            if (audioUrlInput.value.match(mediaPathRegex)) {
                audioUrlInput.value = audioUrlInput.value.replace(mediaPathRegex, 'media/' + newPageNum + '$1');
            }
            
            // Update animation folder path
            var animationFolderInput = document.getElementById('animationFolder');
            if (animationFolderInput.value.match(mediaPathRegex)) {
                animationFolderInput.value = animationFolderInput.value.replace(mediaPathRegex, 'media/' + newPageNum + '$1');
            }
            
            // Update animation audio
            var animationAudioInput = document.getElementById('animationAudio');
            if (animationAudioInput.value.match(mediaPathRegex)) {
                animationAudioInput.value = animationAudioInput.value.replace(mediaPathRegex, 'media/' + newPageNum + '$1');
            }
        }
    }

    // Function to load page data from existing page
    loadPage() {
        var pageNum = document.getElementById('pageNum').value;
        var pageName = 'page' + pageNum + '.html';

        return fetch(pageName)
        .then(response => response.text())
        .then(html => {
            // Create a temporary element to parse the HTML content
            var tempElement = document.createElement('div');
            tempElement.innerHTML = html;

            // Find the script block containing the pageData object
            var scriptBlock = tempElement.querySelector('script');
            if (scriptBlock) {
                // Extract the pageData object from the script content
                var scriptContent = scriptBlock.textContent.trim();
                var startIndex = scriptContent.indexOf('{');
                var endIndex = scriptContent.lastIndexOf('}');
                if (startIndex !== -1 && endIndex !== -1) {
                    var pageDataString = scriptContent.substring(startIndex, endIndex + 1);
                    var loadedPageData = JSON.parse(pageDataString);

                    // Update input fields with parameter values from pageData
                    this.updateFormFromPageData(loadedPageData);
                    
                    // Load teleport buttons
                    this.pageData.teleportButtons = loadedPageData.teleportButtons || [];
                    
                    return loadedPageData;
                }
            }
            throw new Error('Page data not found in HTML');
        })
        .catch(error => {
            console.error('Error loading page:', error);
            throw error;
        });
    }

    // Function to update form fields from page data
    updateFormFromPageData(loadedPageData) {
        document.getElementById('bgUrl').value = loadedPageData.bgUrl || '';
        document.getElementById('bgScale').value = loadedPageData.bgScale || 100;
        document.getElementById('bgWid').value = loadedPageData.bgWid || 100;
        document.getElementById('bgPos').value = loadedPageData.bgPos || 50;
        document.getElementById('fgUrl').value = loadedPageData.fgUrl || '';
        document.getElementById('audioUrl').value = loadedPageData.audioUrl || '';
        document.getElementById('descript').value = loadedPageData.descript || '';
        document.getElementById('fgScale').value = loadedPageData.fgScale || 30;
        document.getElementById('fgWid').value = loadedPageData.fgWid || 100;
        document.getElementById('fgPos').value = loadedPageData.fgPos || 70;
        document.getElementById('bgStart').value = loadedPageData.bgStart || 0;
        document.getElementById('bgEnd').value = loadedPageData.bgEnd || 0;
        document.getElementById('fgStart').value = loadedPageData.fgStart || 0;
        document.getElementById('fgEnd').value = loadedPageData.fgEnd || 0;
        document.getElementById('title').value = loadedPageData.title || '';
        document.getElementById('titlePos').value = loadedPageData.titlePos || 'top-left';
        document.getElementById('pageNum').value = loadedPageData.pageNum || 1;
        document.getElementById('conv1').value = loadedPageData.conv1 || '';
        document.getElementById('conv1PosL').value = loadedPageData.conv1PosL || 50;
        document.getElementById('conv1PosT').value = loadedPageData.conv1PosT || 50;
        document.getElementById('conv2').value = loadedPageData.conv2 || '';
        document.getElementById('conv2PosL').value = loadedPageData.conv2PosL || 50;
        document.getElementById('conv2PosT').value = loadedPageData.conv2PosT || 50;
        
        // Load animation data
        document.getElementById('animationFolder').value = loadedPageData.animationFolder || '';
        document.getElementById('animationInterval').value = loadedPageData.animationInterval || 0.1;
        document.getElementById('animationScale').value = loadedPageData.animationScale || 80;
        document.getElementById('animationPosition').value = loadedPageData.animationPosition || 30;
        document.getElementById('animationAudio').value = loadedPageData.animationAudio || '';
        
        // Load scene background color (now in background section)
        document.getElementById('sceneBgColor').value = loadedPageData.sceneBgColor || '#ffffff';
        
        // Load show page number setting
        document.getElementById('showPageNumber').checked = loadedPageData.showPageNumber !== undefined ? loadedPageData.showPageNumber : true;

        // Load narrative text position
        if (loadedPageData.descriptPos) {
            document.querySelector('input[name="descriptPos"][value="' + loadedPageData.descriptPos + '"]').checked = true;
        }
    }
}

// Export for use in other modules
window.PageGenerator = PageGenerator;