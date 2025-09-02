// Player Generator Module
// Handles generation of player.html and player settings management

class PlayerGenerator {
    constructor(pageData) {
        this.pageData = pageData;
    }

    // Function to generate player.html when page number is 0
    generatePlayerHTML() {
        var playerHTML = `<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Slide Player</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: ${this.pageData.controlsBgColor};
        }
        #container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            height: 100vh;
            background-color: ${this.pageData.controlsBgColor};
        }
        #slideFrame {
            width: 100%;
            height: 100vh;
            border: none;
            margin: 0;
            background-color: ${this.pageData.sceneBgColor};
        }
        #slideFrame.with-controls {
            height: calc(100vh - 60px);
        }
        #controls {
            width: 100%;
            height: 60px;
            background-color: ${this.pageData.controlsBgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: white;
            padding: 5px;
            box-sizing: border-box;
            position: fixed;
            bottom: 0;
            left: 0;
            z-index: 1000;
            transition: transform 0.3s ease;
        }
        #controls.hidden {
            transform: translateY(100%);
        }
        #controls:not(.hidden) {
            transform: translateY(0);
        }
        .dock-trigger {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 10px;
            background: transparent;
            z-index: 999;
        }
        #controls button {
            padding: 5px 10px;
            margin: 0 2px;
            background-color: #444;
            color: white;
            border: 1px solid #666;
            cursor: pointer;
        }
        #controls input[type='number'] {
            width: 80px;
            padding: 4px;
        }
        #controls label {
            font-size: 12px;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div id='container'>
        <iframe id='slideFrame' src='page1.html'></iframe>
        <div id='controls'>
            <span>${this.pageData.storyTitle}</span>
            <label><input type='checkbox' id='autoPageTurn' checked>自动翻页</label>
            <label><input type='checkbox' id='autoDockMode' checked>自动收拢模式</label>
            <button id='calculateTiming'>计算时间长度</button>
            <button id='previousButton'>←</button>
            <button id='nextButton'>→</button>
            <button id='homeButton'>Home</button>
            <input type='number' id='pageInput' placeholder='页数' min='1'>
            <button id='goButton'>跳转</button>
            <audio id='bgAudio' src='${this.pageData.playerBgAudio}' controls autoplay loop style='height:25px'></audio>
            <input type='range' id='bgVolume' min='0' max='1' step='0.01' value='0.5' style='width: 60px;'>
        </div>
    </div>
    <div class='dock-trigger'></div>
    <script src='javascript/player-controls.js?v=${Date.now()}'></script>
    <script>
        // Listen for teleport messages from iframe
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'teleport') {
                window.location.href = event.data.url;
            }
        }, false);
    </script>
</body>
</html>`;

        // Create and download player.html
        var blob = new Blob([playerHTML], { type: 'text/html' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'player.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Function to load player settings from existing player.html
    loadPlayerSettings() {
        return fetch('player.html')
        .then(response => response.text())
        .then(html => {
            // Parse the HTML to extract player settings
            var tempElement = document.createElement('div');
            tempElement.innerHTML = html;
            
            var settings = {};
            
            // Extract story title from the HTML content
            var titleMatch = html.match(/<span>([^<]+)<\/span>/);
            if (titleMatch && titleMatch[1]) {
                settings.storyTitle = titleMatch[1];
            }
            
            // Extract background audio from the HTML content
            var audioMatch = html.match(/src='([^']+)' controls autoplay loop/);
            if (audioMatch && audioMatch[1]) {
                settings.playerBgAudio = audioMatch[1];
            }
            
            // Extract scene background color (for slideFrame)
            var sceneBgMatch = html.match(/#slideFrame[^}]*background-color:\s*([^;]+);/);
            if (sceneBgMatch && sceneBgMatch[1]) {
                settings.sceneBgColor = sceneBgMatch[1].trim();
            }
            
            // Extract controls background color (for body/container)
            var controlsBgMatch = html.match(/body[^}]*background-color:\s*([^;]+);/);
            if (controlsBgMatch && controlsBgMatch[1]) {
                settings.controlsBgColor = controlsBgMatch[1].trim();
            }
            
            console.log('Loaded settings:', {
                title: titleMatch ? titleMatch[1] : 'not found',
                audio: audioMatch ? audioMatch[1] : 'not found', 
                sceneBg: sceneBgMatch ? sceneBgMatch[1] : 'not found',
                controlsBg: controlsBgMatch ? controlsBgMatch[1] : 'not found'
            });
            
            return settings;
        })
        .catch(error => {
            console.error('Error loading player.html:', error);
            // Return defaults if file doesn't exist
            return {
                storyTitle: '切记先点击预览才能保存！！！！',
                playerBgAudio: 'media/music.m4a',
                sceneBgColor: '#ffffff',
                controlsBgColor: '#000000'
            };
        });
    }

    // Function to save player settings and generate player.html
    savePlayerSettings() {
        // Update pageData with current player settings
        this.pageData.storyTitle = document.getElementById('storyTitle').value;
        this.pageData.playerBgAudio = document.getElementById('playerBgAudio').value;
        this.pageData.sceneBgColor = document.getElementById('sceneBgColor').value;
        this.pageData.controlsBgColor = document.getElementById('controlsBgColor').value;
        
        // Generate player.html
        this.generatePlayerHTML();
        alert('播放器设置已保存到 player.html');
    }
}

// Export for use in other modules
window.PlayerGenerator = PlayerGenerator;