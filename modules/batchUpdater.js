// Batch Update Module
// Handles batch updating of all pageN.html files in a story

const fs = require('fs');
const path = require('path');
const { generatePageHTML } = require('./serverPageGenerator');

async function batchUpdatePages(storyPath, storyFolder) {
    console.log('Batch updating pages for story:', storyFolder);
    
    // Read from pages.json instead of parsing HTML files
    const pagesJsonPath = path.join(storyPath, 'json', 'pages.json');
    
    if (!fs.existsSync(pagesJsonPath)) {
        return {
            success: false,
            message: 'No json/pages.json found. Please save pages using the builder first.',
            updatedPages: []
        };
    }
    
    let pagesData;
    try {
        const content = fs.readFileSync(pagesJsonPath, 'utf8');
        pagesData = JSON.parse(content);
    } catch (parseError) {
        return {
            success: false,
            message: 'Failed to parse pages.json: ' + parseError.message,
            updatedPages: []
        };
    }
    
    const updatedPages = [];
    
    // Generate HTML for each page in pages.json
    for (const [pageNumStr, pageData] of Object.entries(pagesData)) {
        const pageNum = parseInt(pageNumStr);
        
        try {
            // Add default showPageNumber property for backward compatibility
            if (pageData.showPageNumber === undefined) {
                pageData.showPageNumber = true;
            }
            
            // Generate new HTML with updated template and clean JSON data
            const newHTML = generatePageHTML(pageData);
            
            // Write the updated file
            const filePath = path.join(storyPath, `page${pageNum}.html`);
            fs.writeFileSync(filePath, newHTML);
            updatedPages.push(pageNum);
            console.log(`Updated page ${pageNum} from pages.json`);
            
        } catch (pageError) {
            console.error(`Error updating page ${pageNum}:`, pageError);
        }
    }
    
    return {
        success: true,
        message: 'Batch update completed successfully using pages.json',
        updatedPages: updatedPages.sort((a, b) => a - b)
    };
}

module.exports = { batchUpdatePages };