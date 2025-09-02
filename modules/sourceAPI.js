// Source API Module
// Handles API connectors between current active projects and other source media
// from AISwapFace, URL links from internet, and timing generation

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Generate page timing JSON based on audio files
async function generatePageTiming(storyPath, storyFolder) {
    console.log('Generating timing for story:', storyFolder);
    
    // Find all pageN.html files
    const files = fs.readdirSync(storyPath).filter(file => 
        file.match(/^page\d+\.html$/i)
    );
    
    const timingData = [];
    
    for (const file of files) {
        const pageNum = parseInt(file.match(/\d+/)[0]);
        let duration = 10; // default 10 seconds
        
        // Check for audio file using naming convention: pageN.html -> N.mp3
        const audioPath = path.join(storyPath, 'media', `${pageNum}.mp3`);
        console.log(`Page ${pageNum}: Checking for audio file: ${audioPath}`);
        
        if (fs.existsSync(audioPath)) {
            try {
                await new Promise((resolve) => {
                    const cmd = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`;
                    exec(cmd, (error, stdout, stderr) => {
                        if (!error && stdout.trim()) {
                            const rawDuration = parseFloat(stdout.trim());
                            duration = Math.round(rawDuration)+1; // round up and add 1s buffer
                            console.log(`Page ${pageNum}: Found audio duration ${rawDuration}s -> Rounded to ${duration}s`);
                        } else {
                            console.log(`Page ${pageNum}: Could not read audio duration, using default 10s`);
                        }
                        resolve();
                    });
                });
            } catch (audioError) {
                console.log(`Page ${pageNum}: Error reading audio, using default:`, audioError);
            }
        } else {
            console.log(`Page ${pageNum}: No audio file found, using default 10s`);
        }
        
        timingData.push({
            page: pageNum,
            duration: duration
        });
    }
    
    // Sort by page number
    timingData.sort((a, b) => a.page - b.page);
    
    // Create json directory if it doesn't exist
    const jsonDir = path.join(storyPath, 'json');
    if (!fs.existsSync(jsonDir)) {
        fs.mkdirSync(jsonDir, { recursive: true });
    }
    
    // Save timing JSON file
    const timingFile = path.join(storyPath, 'json', 'page-timing.json');
    fs.writeFileSync(timingFile, JSON.stringify(timingData, null, 2));
    
    console.log('Generated timing data:', timingData);
    
    return {
        success: true,
        message: 'Page timing generated successfully',
        data: timingData,
        file: 'json/page-timing.json'
    };
}

// List images from various source locations
function listImagesFromFolder(fullPath) {
    console.log('Listing images in:', fullPath);
    
    // Check if directory exists
    if (!fs.existsSync(fullPath)) {
        return { success: true, images: [], count: 0 };
    }
    
    // Read directory contents
    const files = fs.readdirSync(fullPath);
    
    // Filter for image files and sort by creation time
    const imageFiles = files
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        })
        .map(file => {
            const filePath = path.join(fullPath, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                path: file,
                birthTime: stats.birthtime || stats.mtime
            };
        })
        .sort((a, b) => {
            // Sort by creation time first, then by alphanumeric filename
            const timeDiff = a.birthTime.getTime() - b.birthTime.getTime();
            if (timeDiff !== 0) return timeDiff;
            
            return a.name.localeCompare(b.name, undefined, { numeric: true });
        })
        .map(item => item.path);
    
    console.log('Found images:', imageFiles);
    
    return {
        success: true,
        images: imageFiles,
        count: imageFiles.length
    };
}

// Execute image renaming script for organizing media files
function executeImageRenaming(storyFolder) {
    const command = `cd "stories/${storyFolder}/tools" && ./rename_slides_img.sh`;
    
    console.log('Executing:', command);
    console.log('For story folder:', storyFolder);
    
    return new Promise((resolve, reject) => {
        exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            console.log('Command executed:', command);
            console.log('Working directory:', process.cwd());
            console.log('Raw stdout:', stdout);
            console.log('Raw stderr:', stderr);
            
            if (error) {
                console.error('Error occurred:', error);
                reject({
                    success: false,
                    error: error.message,
                    stderr: stderr || '',
                    command: command,
                    workingDir: process.cwd()
                });
            } else {
                // Ensure we always return valid JSON
                const result = {
                    success: true,
                    output: stdout || 'Script completed successfully (no output)',
                    message: '图片文件名整理完成！'
                };
                
                console.log('Sending response:', result);
                resolve(result);
            }
        });
    });
}

module.exports = { 
    generatePageTiming,
    listImagesFromFolder,
    executeImageRenaming
};