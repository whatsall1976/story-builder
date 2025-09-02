const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { batchUpdatePages } = require('./modules/batchUpdater');
const { generatePageTiming, listImagesFromFolder, executeImageRenaming } = require('./modules/sourceAPI');
const app = express();

// Middleware
app.use(express.json());

// Directory paths
const storiesDir = path.join(__dirname, 'stories');
const modulesDir = path.join(__dirname, 'modules');
const aiswapFaceDir = path.join(__dirname, 'AISwapFace');
const ciag1Dir = path.join(__dirname, 'CIAG1Library');
const toolsDir = path.join(__dirname, 'other-tools');

// Handle player.html with dynamic page parameter
app.get('/stories/:folder/player.html', async (req, res) => {
    const { folder } = req.params;
    const { page } = req.query;
    const playerPath = path.join(storiesDir, folder, 'player.html');

    try {
        const exists = await fs.access(playerPath).then(() => true).catch(() => false);
        if (!exists) return res.status(404).send('Player not found');

        if (page && !isNaN(page) && parseInt(page) > 1) {
            const data = await fs.readFile(playerPath, 'utf8');
            const modifiedHtml = data
                .replace(/src='page1\.html'/, `src='page${page}.html'`)
                .replace(/<script src='javascript\/player-controls\.js\?v=\d+'><\/script>/,
                    `<script>var currentPage = ${page};</script><script src='javascript/player-controls.js?v=${Date.now()}'></script>`);
            return res.send(modifiedHtml);
        }
        res.sendFile(playerPath);
    } catch (error) {
        console.error('Error serving player.html:', error);
        res.status(500).send('Error serving player.html');
    }
});

// Handle pageN.html with subtitle control
app.get('/stories/:folder/page:pageNum.html', async (req, res) => {
    const { folder, pageNum } = req.params;
    const { noSubtitles } = req.query;
    const pagePath = path.join(storiesDir, folder, `page${pageNum}.html`);

    try {
        const exists = await fs.access(pagePath).then(() => true).catch(() => false);
        if (!exists) return res.status(404).send('Page not found');

        let data = await fs.readFile(pagePath, 'utf8');

        if (noSubtitles === '1') {
            // Remove subtitle elements: title, descript, conv elements, animation button, teleport buttons
            data = data.replace(/<div class="title"[^>]*>[\s\S]*?<\/div>/g, '');
            data = data.replace(/<div class="descript"[^>]*>[\s\S]*?<\/div>/g, '');
            data = data.replace(/<div class="conv"[^>]*>[\s\S]*?<\/div>/g, '');
            data = data.replace(/<button[^>]*id="animationPlayButton"[^>]*>[\s\S]*?<\/button>/g, '');
            data = data.replace(/<button class="teleportButton"[^>]*>[\s\S]*?<\/button>/g, '');
        }

        res.send(data);
    } catch (error) {
        console.error('Error serving page:', error);
        res.status(500).send('Error serving page');
    }
});

// Serve static files
app.use('/stories', express.static(storiesDir));
app.use('/modules', express.static(modulesDir));
app.use('/AISwapFace', express.static(aiswapFaceDir));
app.use('/CIAG1Library', express.static(ciag1Dir));
app.use('/other-tools', express.static(toolsDir));

// API: Get folder names in 'stories'
app.get('/api/folders', async (req, res) => {
    try {
        const files = await fs.readdir(storiesDir, { withFileTypes: true });
        const folders = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
        res.json({ success: true, folders });
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Get all media files from a story folder recursively
app.get('/api/story-media/:folder', async (req, res) => {
    const { folder } = req.params;
    const storyPath = path.join(storiesDir, folder);
    
    try {
        const exists = await fs.access(storyPath).then(() => true).catch(() => false);
        if (!exists) return res.status(404).json({ error: 'Story folder not found' });

        const mediaFiles = await collectMediaFilesRecursive(storyPath, '');
        res.json(mediaFiles);
    } catch (error) {
        console.error('Error collecting media files:', error);
        res.status(500).json({ error: 'Failed to collect media files' });
    }
});

// Helper function to collect media files recursively
async function collectMediaFilesRecursive(dirPath, relativePath) {
    const mediaFiles = [];
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg', '.mov'];

    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);
            const relativeItemPath = relativePath ? path.join(relativePath, item.name) : item.name;
            
            if (item.isDirectory()) {
                // Recursively search subdirectories
                const subFiles = await collectMediaFilesRecursive(itemPath, relativeItemPath);
                mediaFiles.push(...subFiles);
            } else if (item.isFile()) {
                const ext = path.extname(item.name).toLowerCase();
                if (supportedExtensions.includes(ext)) {
                    mediaFiles.push(relativeItemPath);
                }
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
    }

    return mediaFiles;
}

// API: Get page count for a story folder
app.get('/api/stories/:folder/pages', async (req, res) => {
    const { folder } = req.params;
    const folderPath = path.join(storiesDir, folder);

    try {
        const exists = await fs.access(folderPath).then(() => true).catch(() => false);
        if (!exists) return res.status(404).json({ error: 'Folder not found' });

        const files = await fs.readdir(folderPath);
        const pageCount = files.filter(file => /^page\d+\.html$/.test(file)).length;
        res.json({ pageCount });
    } catch (error) {
        console.error('Error fetching page count:', error);
        res.status(500).json({ error: 'Failed to fetch page count' });
    }
});

// API: List images in a folder
app.get('/api/list-images', async (req, res) => {
    try {
        const folder = req.query.folder || '';
        const referer = req.get('Referer');
        let storyFolder = 'story1'; // Default fallback

        if (referer) {
            const match = referer.match(/\/stories\/([^\/]+)\//);
            if (match) storyFolder = decodeURIComponent(match[1]);
        }

        const fullPath = path.join(storiesDir, storyFolder, folder);
        const result = listImagesFromFolder(fullPath);
        if (folder && result.images) {
            result.images = result.images.map(img => path.join(folder, img));
        }
        res.json(result);
    } catch (error) {
        console.error('Error listing images:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Rename images
app.post('/api/rename-images', async (req, res) => {
    try {
        const referer = req.get('Referer');
        let storyFolder = 'story1';

        if (referer) {
            const match = referer.match(/\/stories\/([^\/]+)\//);
            if (match) storyFolder = decodeURIComponent(match[1]);
        }

        const result = await executeImageRenaming(storyFolder);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Generate page timing
app.post('/api/generate-timing', async (req, res) => {
    try {
        const referer = req.get('Referer');
        let storyFolder = 'story1';

        if (referer) {
            const match = referer.match(/\/stories\/([^\/]+)\//);
            if (match) storyFolder = decodeURIComponent(match[1]);
        }

        const storyPath = path.join(storiesDir, storyFolder);
        const result = await generatePageTiming(storyPath, storyFolder);
        res.json(result);
    } catch (error) {
        console.error('Error generating timing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Save page data
app.post('/api/save-page-data', async (req, res) => {
    try {
        const { pageNum, pageData } = req.body;
        const referer = req.get('Referer');
        let storyFolder = 'story1';

        if (referer) {
            const match = referer.match(/\/stories\/([^\/]+)\//);
            if (match) storyFolder = decodeURIComponent(match[1]);
        }

        const storyPath = path.join(storiesDir, storyFolder);
        const pagesJsonPath = path.join(storyPath, 'json', 'pages.json');

        await fs.mkdir(path.dirname(pagesJsonPath), { recursive: true });

        let pagesData = {};
        try {
            const content = await fs.readFile(pagesJsonPath, 'utf8');
            pagesData = JSON.parse(content);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }

        pagesData[pageNum] = pageData;
        await fs.writeFile(pagesJsonPath, JSON.stringify(pagesData, null, 2));

        res.json({ success: true, message: 'Page data saved successfully' });
    } catch (error) {
        console.error('Save page data error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Batch update pages
app.post('/api/batch-update', async (req, res) => {
    try {
        const referer = req.get('Referer');
        let storyFolder = 'story1';

        if (referer) {
            const match = referer.match(/\/stories\/([^\/]+)\//);
            if (match) storyFolder = decodeURIComponent(match[1]);
        }

        const storyPath = path.join(storiesDir, storyFolder);
        const result = await batchUpdatePages(storyPath, storyFolder);
        res.json(result);
    } catch (error) {
        console.error('Batch update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Get favorites
app.get('/api/favorites', async (req, res) => {
    try {
        const favoritesPath = path.join(__dirname, 'modules', 'favorites.json');
        
        try {
            const data = await fs.readFile(favoritesPath, 'utf8');
            const favorites = JSON.parse(data);
            res.json({ success: true, favorites });
        } catch (err) {
            if (err.code === 'ENOENT') {
                // File doesn't exist, return empty favorites
                res.json({ success: true, favorites: {} });
            } else {
                throw err;
            }
        }
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Save favorites
app.post('/api/favorites', async (req, res) => {
    try {
        const { favorites } = req.body;
        const favoritesPath = path.join(__dirname, 'modules', 'favorites.json');
        
        await fs.writeFile(favoritesPath, JSON.stringify(favorites, null, 2));
        res.json({ success: true, message: 'Favorites saved successfully' });
    } catch (error) {
        console.error('Error saving favorites:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(storiesDir, 'index.html'));
});

// Start server
const PORT = 1976;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});