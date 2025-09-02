// Page HTML Generator Module
// Handles generation of pageN.html files with latest template

function generatePageHTML(pageData) {
    // Helper function for title positioning
    function getTitlePositionStyle(position) {
        switch (position) {
            case 'top-left': return 'left: 10px; top: 10px;';
            case 'top': return 'left: 50%; top: 10px; transform: translateX(-50%);';
            case 'top-right': return 'right: 10px; top: 10px;';
            case 'bottom-left': return 'left: 10px; bottom: 10px;';
            case 'bottom': return 'left: 50%; bottom: 10px; transform: translateX(-50%);';
            case 'bottom-right': return 'right: 10px; bottom: 10px;';
            default: return 'left: 10px; top: 10px;';
        }
    }

    function getAnimationButtonStyle() {
        return 'top: 4px; right: 4px;';
    }

    // Generate media elements
    var bgMediaElement = '';
    var fgMediaElement = '';
    var audioElement = '';
    
    var hasBgVideo = pageData.bgUrl && (pageData.bgUrl.endsWith('.mp4') || pageData.bgUrl.endsWith('.webm') || pageData.bgUrl.endsWith('.ogg'));

    // Background style
    var bgStyle = '';
    if (pageData.bgUrl) {
        bgStyle += 'width: ' + pageData.bgScale + '%;';
        bgStyle += 'left: ' + pageData.bgPos + '%;';
        var bgCropWidth = (100 - pageData.bgWid)/2 + '%';
        bgStyle += 'clip-path: inset(0% ' + bgCropWidth + ' 0% ' + bgCropWidth + ');';
    }

    // Foreground style
    var fgStyle = '';
    if (pageData.fgUrl) {
        fgStyle += 'width: ' + pageData.fgScale + '%;';
        fgStyle += 'left: ' + pageData.fgPos + '%;';
        var fgCropWidth = (100 - pageData.fgWid)/2 + '%';
        fgStyle += 'clip-path: inset(0% ' + fgCropWidth + ' 0% ' + fgCropWidth + ');';
    }

    // Show audio/video control if there's audio OR background video
    if ((pageData.audioUrl && pageData.audioUrl.trim() !== '') || hasBgVideo) {
        audioElement = '<div id="audioIcon" class="audio-icon play" onclick="toggleAudioAndVideo()"></div>';
        if (pageData.audioUrl && pageData.audioUrl.trim() !== '') {
            audioElement += '<audio id="audioPlayer" style="display: none;"><source src="' + pageData.audioUrl + '" type="audio/mpeg">Your browser does not support the audio element.</audio>';
        }
    }

    // Generate background media element
    if (hasBgVideo) {
        bgMediaElement = '<video id="bgVideo" src="' + pageData.bgUrl + '" muted loop style="position: absolute; bottom:0; ' + bgStyle + '"></video>';
    } else if (pageData.bgUrl && (pageData.bgUrl.endsWith('.jpg') || pageData.bgUrl.endsWith('.png') || pageData.bgUrl.endsWith('.gif') || pageData.bgUrl.endsWith('.webp'))) {
        bgMediaElement = '<img src="' + pageData.bgUrl + '" alt="Background Image" class="bgImg" style="' + bgStyle + '">';
    }

    // Generate foreground media element
    if (pageData.fgUrl && (pageData.fgUrl.endsWith('.mp4') || pageData.fgUrl.endsWith('.webm') || pageData.fgUrl.endsWith('.ogg'))) {
        fgMediaElement = '<video id="fgVideo" src="' + pageData.fgUrl + '"muted loop style="position:absolute;' + fgStyle + '"></video>';
    } else if (pageData.fgUrl && (pageData.fgUrl.endsWith('.jpg') || pageData.fgUrl.endsWith('.png') || pageData.fgUrl.endsWith('.gif') || pageData.fgUrl.endsWith('.webp'))) {
        fgMediaElement = '<img src="' + pageData.fgUrl + '" alt="Foreground Image" class="fgImg" style="' + fgStyle + '">';
    }

    var previewContent = '<div>' +
        bgMediaElement +
        fgMediaElement +
        audioElement +
        (pageData.title || pageData.showPageNumber ? '<div class="title" style="position: absolute; ' + getTitlePositionStyle(pageData.titlePos) + '">' + (pageData.title || '') + (pageData.showPageNumber ? '&nbsp;' + (pageData.pageNum || '') : '') + '</div>' : '');

    // Add animation button if animation folder is specified
    if (pageData.animationFolder && pageData.animationFolder.trim() !== '') {
        previewContent += '<button id="animationPlayButton" onclick="playPageAnimation()" style="position: absolute; ' + getAnimationButtonStyle() + ' z-index: 10001; padding: 10px; background: rgba(0,0,0,0.7); color: white; border: none; cursor: pointer;">播放幻灯片</button>';
    }

    previewContent += '</div>';
    
    // Apply narrative text position and width
    var descriptStyle = 'position: absolute; background-color: rgba(0, 0, 0, 0.6); color: white; font-size: 18px; padding: 20px; z-index: 8888; box-sizing: border-box; text-align: center;';
    if (pageData.descriptPos === 'top') {
        descriptStyle += 'top: 0; left: 0; right: 0; width: 100%;';
    } else if (pageData.descriptPos === 'middle') {
        descriptStyle += 'top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60%; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0); color: #999;';
    } else {
        descriptStyle += 'bottom: 0; left: 0; right: 0; width: 100%;';
    }

    if (pageData.descript && pageData.descript !== '') {
        previewContent += '<div class="descript" style="' + descriptStyle + '">' + pageData.descript + '</div>';
    }

    // Add conversation elements
    if (pageData.conv1 && pageData.conv1.trim() !== '') {
        previewContent += '<div class="conv" style="position: absolute; left: ' + (pageData.conv1PosL || 50) + 'px; top: ' + (pageData.conv1PosT || 50) + 'px;" onclick="speakText1()">' + pageData.conv1 + '</div>';
    }

    if (pageData.conv2 && pageData.conv2.trim() !== '') {
        previewContent += '<div class="conv" style="position: absolute; left: ' + (pageData.conv2PosL || 50) + 'px; top: ' + (pageData.conv2PosT || 50) + 'px;" onclick="speakText2()">' + pageData.conv2 + '</div>';
    }

    // Add teleport buttons
    if (pageData.teleportButtons && Array.isArray(pageData.teleportButtons)) {
        pageData.teleportButtons.forEach(function(button) {
            if (button.name && button.url && button.position) {
                var buttonStyle = 'position: absolute; padding: 10px 15px; border: none; cursor: pointer; font-size: 24pt; font-weight: bold; border-radius: 0; z-index: 9999; background-color: rgba(' + (button.color === 'white' ? '255,255,255' : '0,0,0') + ', 0.6); color: ' + (button.color === 'white' ? 'black' : 'white') + '; ';
                
                switch (button.position) {
                    case 'top-left': buttonStyle += 'top: 10px; left: 10px;'; break;
                    case 'top': buttonStyle += 'top: 10px; left: 50%; transform: translateX(-50%);'; break;
                    case 'top-right': buttonStyle += 'top: 10px; right: 10px;'; break;
                    case 'middle-left': buttonStyle += 'top: 50%; left: 10px; transform: translateY(-50%);'; break;
                    case 'center': buttonStyle += 'top: 50%; left: 50%; transform: translate(-50%, -50%);'; break;
                    case 'middle-right': buttonStyle += 'top: 50%; right: 10px; transform: translateY(-50%);'; break;
                    case 'bottom-left': buttonStyle += 'bottom: 10px; left: 10px;'; break;
                    case 'bottom': buttonStyle += 'bottom: 10px; left: 50%; transform: translateX(-50%);'; break;
                    case 'bottom-right': buttonStyle += 'bottom: 10px; right: 10px;'; break;
                }
                
                previewContent += '<button class="teleportButton" onclick=\'handleTeleportClick(' + 
                    JSON.stringify(button.url) + ', ' + JSON.stringify(button.newWindow) + ', ' + JSON.stringify(button.loop) + ')\' style="' + buttonStyle + '">' + button.name + '</button>';
            }
        });
    }

    // Generate complete HTML
    var savedHTML = "<!DOCTYPE html>\n" +
        "<html lang='en'>\n" +
        "<head>\n" +
        "    <meta charset='UTF-8'>\n" +
        "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
        "    <title>Saved Webpage</title>\n" +
        "    <link rel='stylesheet' type='text/css' href='javascript/builder.css'>\n" +
        "    <style>\n" +
        "        body { background-color: " + (pageData.sceneBgColor || '#ffffff') + " !important; }\n" +
        "        html { background-color: " + (pageData.sceneBgColor || '#ffffff') + " !important; }\n" +
        "    </style>\n" +
        "    <script> var pageData = " + JSON.stringify(pageData) + "; </script>\n" +
        "</head>\n" +
        "<body style='background-color: " + (pageData.sceneBgColor || '#ffffff') + ";'>\n" +
        previewContent + "\n" +
        "    <script>\n" +
        "        function toggleAudioAndVideo() {\n" +
        "            var audio = document.getElementById('audioPlayer');\n" +
        "            var video = document.getElementById('bgVideo');\n" +
        "            var icon = document.getElementById('audioIcon');\n" +
        "            var isPlaying = false;\n" +
        "            if (audio && !audio.paused) isPlaying = true;\n" +
        "            if (video && !video.paused) isPlaying = true;\n" +
        "            if (isPlaying) {\n" +
        "                if (audio) audio.pause();\n" +
        "                if (video) video.pause();\n" +
        "                icon.classList.remove('pause');\n" +
        "                icon.classList.add('play');\n" +
        "            } else {\n" +
        "                if (audio) audio.play();\n" +
        "                if (video) video.play();\n" +
        "                icon.classList.remove('play');\n" +
        "                icon.classList.add('pause');\n" +
        "            }\n" +
        "        }\n" +
        "        function toggleAudio() { toggleAudioAndVideo(); }\n" +
        "        function handleTeleportClick(url, newWindow, loop) {\n" +
        "            var pageMatch = url.match(/page(\\\\d+)\\\\.html/);\n" +
        "            if (pageMatch) {\n" +
        "                // For page navigation, always use player.html to enable iframe and timing functionality\n" +
        "                var pageNum = pageMatch[1];\n" +
        "                var currentPath = window.location.pathname;\n" +
        "                var pathParts = currentPath.split('/');\n" +
        "                var storiesIndex = pathParts.indexOf('stories');\n" +
        "                var storyName = (storiesIndex !== -1 && pathParts[storiesIndex + 1]) ? pathParts[storiesIndex + 1] : '';\n" +
        "                var playerUrl = '/stories/' + storyName + '/player.html?page=' + pageNum;\n" +
        "                if (window.parent !== window) {\n" +
        "                    try {\n" +
        "                        window.parent.postMessage({ type: 'teleport', url: playerUrl }, '*');\n" +
        "                    } catch (e) {\n" +
        "                        window.location.href = playerUrl;\n" +
        "                    }\n" +
        "                } else {\n" +
        "                    if (newWindow) {\n" +
        "                        window.open(playerUrl, '_blank');\n" +
        "                    } else {\n" +
        "                        window.location.href = playerUrl;\n" +
        "                    }\n" +
        "                }\n" +
        "            } else {\n" +
        "                // For non-page URLs, use direct navigation\n" +
        "                if (newWindow) { window.open(url, '_blank'); } else {\n" +
        "                    // Mute background music in parent before navigation\n" +
        "                    if (window.parent !== window) {\n" +
        "                        try {\n" +
        "                            var parentAudio = window.parent.document.getElementById('bgAudio');\n" +
        "                            if (parentAudio) {\n" +
        "                                parentAudio.muted = true;\n" +
        "                            }\n" +
        "                        } catch (e) {\n" +
        "                            // Cross-origin restriction, ignore\n" +
        "                        }\n" +
        "                    }\n" +
        "                    window.location.href = url;\n" +
        "                }\n" +
        "            }\n" +
        "        }\n" +
        "        document.addEventListener('DOMContentLoaded', function() {\n" +
        "            var urlParams = new URLSearchParams(window.location.search);\n" +
        "            var pageParam = urlParams.get('page');\n" +
        "            if (pageParam) {\n" +
        "                var targetUrl = './page' + pageParam + '.html';\n" +
        "                setTimeout(function() { window.location.href = targetUrl; }, 100);\n" +
        "                return;\n" +
        "            }\n" +
        "            document.addEventListener('keydown', function(event) {\n" +
        "                if (event.key === 'ArrowUp') {\n" +
        "                    if (typeof skipToNextFrame === 'function') {\n" +
        "                        skipToNextFrame();\n" +
        "                        console.log('ArrowUp: skipped to next frame');\n" +
        "                    }\n" +
        "                } else if (event.key === 'ArrowDown') {\n" +
        "                    if (typeof skipToPreviousFrame === 'function') {\n" +
        "                        skipToPreviousFrame();\n" +
        "                        console.log('ArrowDown: skipped to previous frame');\n" +
        "                    }\n" +
        "                } else if (event.key === ' ') {\n" +
        "                    event.preventDefault();\n" +
        "                    if (typeof toggleAnimationPause === 'function') {\n" +
        "                        toggleAnimationPause();\n" +
        "                        console.log('Space: toggled animation pause');\n" +
        "                    }\n" +
        "                }\n" +
        "            });\n" +
        "        });\n" +
        "    </script>\n" +
        "    <script src='javascript/video.js?v=" + Date.now() + "'></script>\n" +
        "    <script src='javascript/tts1.js?v=" + Date.now() + "'></script>\n" +
        "    <script src='javascript/tts2.js?v=" + Date.now() + "'></script>\n" +
        "    <script src='javascript/animation.js?v=" + Date.now() + "'></script>\n" +
        "</body>\n" +
        "</html>";

    return savedHTML;
}

module.exports = { generatePageHTML };