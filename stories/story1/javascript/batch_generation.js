// Batch Generation Functions
// Functions for importing JSON data and creating multiple pages

async function importJsonPages() {
    var button = document.getElementById('importJsonButton');
    var originalText = button.textContent;
    
    if (!confirm('这将根据media文件夹中的两个JSON文件创建40个页面，覆盖现有页面。\n\n确定要继续吗？')) {
        return;
    }
    
    button.textContent = '导入中...';
    button.disabled = true;
    
    try {
        // Fetch both JSON files
        const [narrationResponse, mediaTypeResponse] = await Promise.all([
            fetch('json/narration-tts.json'),
            fetch('json/media-type.json')
        ]);
        
        if (!narrationResponse.ok || !mediaTypeResponse.ok) {
            throw new Error('无法读取JSON文件');
        }
        
        // Debug: log the response text before parsing
        const narrationText = await narrationResponse.text();
        const mediaTypeText = await mediaTypeResponse.text();
        
        console.log('Narration response:', narrationText);
        console.log('MediaType response:', mediaTypeText);
        
        let narrationData, mediaTypeData;
        try {
            narrationData = JSON.parse(narrationText);
        } catch (e) {
            throw new Error('narration-tts.json 格式错误: ' + e.message);
        }
        
        try {
            mediaTypeData = JSON.parse(mediaTypeText);
        } catch (e) {
            throw new Error('media-type.json 格式错误: ' + e.message);
        }
        
        // Create 40 pages
        var pagesCreated = [];
        
        for (var pageNum = 1; pageNum <= 40; pageNum++) {
            var pageData = createPageFromJson(pageNum, narrationData, mediaTypeData);
            
            // Send to server to save as pageN.html and update pages.json
            const saveResponse = await fetch('/api/save-page-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pageNum: pageNum,
                    pageData: pageData,
                    generateHtml: true
                })
            });
            
            const saveResult = await saveResponse.json();
            if (saveResult.success) {
                pagesCreated.push(pageNum);
            }
        }
        
        alert(`JSON导入完成！\n\n已创建 ${pagesCreated.length} 个页面: page${pagesCreated.join('.html, page')}.html`);
        
    } catch (error) {
        console.error('Import error:', error);
        alert('导入过程中出现错误: ' + error.message);
    }
    
    button.textContent = originalText;
    button.disabled = false;
}

function createPageFromJson(pageNum, narrationData, mediaTypeData) {
    // Get narration text for this page
    var narrationText = "";
    if (narrationData[pageNum.toString()]) {
        narrationText = narrationData[pageNum.toString()][1] || "";
    }
    
    // Determine media type and settings for this page
    var mediaType = getMediaTypeForPage(pageNum, mediaTypeData);
    
    // Create base page data with defaults
    var pageData = {
        bgUrl: "media/",
        bgScale: 33,
        bgWid: 100,
        bgPos: 33,
        fgUrl: "media/",
        audioUrl: "",
        descript: narrationText,
        fgScale: 33,
        fgWid: 30,
        fgPos: 70,
        bgStart: 0,
        bgEnd: 10,
        fgStart: 0,
        fgEnd: 1,
        title: "",
        titlePos: "top-left",
        pageNum: pageNum,
        showPageNumber: true,
        conv1: "",
        conv1PosL: 600,
        conv1PosT: 300,
        conv2: "",
        conv2PosL: 600,
        conv2PosT: 50,
        animationFolder: "",
        animationInterval: 3,
        animationScale: 80,
        animationPosition: 30,
        animationAudio: "",
        storyTitle: "切记先点击预览才能保存！！！！",
        playerBgAudio: "media/music.m4a",
        sceneBgColor: "#ffffff",
        controlsBgColor: "#000000",
        descriptPos: "bottom",
        teleportButtons: []
    };
    
    // Apply specific settings based on media type
    if (mediaType.type === "image") {
        pageData.bgUrl = `media/${pageNum}.jpg`;
        if (mediaType.audio !== "no-audio") {
            pageData.audioUrl = `media/${pageNum}.mp3`;
        }
    } else if (mediaType.type === "slides") {
        pageData.animationFolder = `media/${pageNum}/`;
        pageData.animationAudio = `media/${pageNum}.mp3`;
    } else if (mediaType.type === "video") {
        pageData.bgUrl = `media/${pageNum}.mp4`;
        pageData.audioUrl = `media/${pageNum}.mp3`;
    } else if (mediaType.type === "teleport") {
        pageData.descript = "";
        pageData.audioUrl = "";
        // Create single centered teleport button based on target page
        var targetPage = mediaType.target || "1";
        pageData.teleportButtons = [
            {
                name: `传送到页面${targetPage}`,
                newWindow: false,
                loop: false,
                url: `./player.html?page=${targetPage}`,
                position: "center",
                color: "black"
            }
        ];
    }
    
    return pageData;
}

function getMediaTypeForPage(pageNum, mediaTypeData) {
    // Check if specific page is defined in media-type.json
    if (mediaTypeData[pageNum.toString()]) {
        var mediaInfo = mediaTypeData[pageNum.toString()];
        
        if (Array.isArray(mediaInfo)) {
            if (mediaInfo[0] === "teleport") {
                return {
                    type: "teleport",
                    target: mediaInfo[1] || "1"
                };
            } else {
                return {
                    type: mediaInfo[0],
                    audio: mediaInfo[1] || ""
                };
            }
        } else if (mediaInfo === "slides") {
            return { type: "slides" };
        } else if (mediaInfo === "video") {
            return { type: "video" };
        }
    }
    
    // Find the most recent page that has a defined media type
    for (var i = pageNum - 1; i >= 1; i--) {
        if (mediaTypeData[i.toString()]) {
            var prevMediaInfo = mediaTypeData[i.toString()];
            
            if (Array.isArray(prevMediaInfo)) {
                return {
                    type: prevMediaInfo[0],
                    audio: prevMediaInfo[1] || ""
                };
            } else if (prevMediaInfo === "slides") {
                return { type: "slides" };
            } else if (prevMediaInfo === "video") {
                return { type: "video" };
            }
        }
    }
    
    // Fallback to slides if no previous page found
    return { type: "slides" };
}