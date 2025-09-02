# Story Builder - Developer Documentation

## TLDR
This is an interactive story builder that creates HTML pages with multimedia content (video, audio, slideshow animations) and teleport navigation buttons. The system has both client-side (builder interface) and server-side (batch processing) components with an iframe-based player system for auto-timing.

## Project Architecture

### Core Components

```
story_builder/
├── server.js                  # Express server, API endpoints
├── stories/
│   └── story1/
│       ├── builder.html       # Main builder interface
│       ├── player.html        # Generated iframe player (auto-generated)
│       ├── pageN.html         # Generated story pages (auto-generated)
│       ├── json/              # JSON data files (NEW)
│       │   ├── pages.json     # Page configuration data (NEW)
│       │   └── page-timing.json # Auto-timing data (moved from root)
│       ├── media/             # Media assets
│       │   ├── N.mp3         # Page audio files
│       │   └── subfolder/    # Image folders for slideshows
│       └── javascript/        # Client-side code
│           ├── pageGenerator.js      # Generates individual pages
│           ├── playerGenerator.js    # Generates player.html
│           ├── player-controls.js    # Player controls & timing
│           ├── animation.js          # Slideshow functionality
│           ├── video.js             # Video looping logic
│           ├── tts1.js/tts2.js     # Text-to-speech (not covered)
│           └── builder.css          # Styling
├── modules/                   # Server-side modules
│   ├── serverPageGenerator.js # Server-side page generation
│   ├── batchUpdater.js        # Batch update existing pages
│   └── sourceAPI.js           # Media processing & timing generation
└── tools/
    └── html2json.py           # Migration tool for existing HTML files (NEW)
```

## Core Systems

### 1. Page Generation System

#### Client-Side Generation (pageGenerator.js)
- **Purpose**: Generate individual HTML pages from builder form data
- **Trigger**: User clicks "保存" (Save) button in builder
- **Process**:
  1. Collects form data into `pageData` object
  2. **Saves data to `json/pages.json`** via API call (NEW in v1.1)
  3. Generates complete HTML with embedded JavaScript and cache-busting
  4. Includes teleport buttons, media elements, text content
  5. Downloads as `pageN.html` file

#### Server-Side Generation (serverPageGenerator.js)
- **Purpose**: Same functionality but for server-side processing
- **Used by**: Batch updater system
- **Key difference**: Returns HTML string instead of downloading file
- **V1.1 Changes**: Includes cache-busting parameters and cleaned auto-play logic

### 2. Player System

#### Player HTML (playerGenerator.js)
- **Generates**: `player.html` - iframe container with controls
- **Components**:
  - Iframe for displaying story pages
  - Control panel (navigation, auto-page turn, volume)
  - Background audio player
  - Dock mode (hide/show controls)

#### Player Controls (player-controls.js)
- **Core Functions**:
  - `navigateToPage(n)`: Navigate iframe to pageN.html with auto-start
  - `loadPageTiming()`: Load timing data from **`json/page-timing.json`** (NEW path)
  - `setupPageTimeout()`: Auto-advance based on timing
  - `clickSlideshowButton()`: **UNIFIED auto-start** for all media types (NEW)
  - `handleURLParameters()`: Handle ?page=N URLs
- **V1.1 Auto-Play System**: **Single iframe load event** triggers all auto-play (eliminates conflicts)

### 3. Teleport Button System

#### How Teleport Buttons Work

**Configuration** (builder.html):
```javascript
// Each teleport button has:
{
  name: "Button Text",
  url: "page5.html" or "https://external.com",
  position: "top-left", // 9 predefined positions
  color: "black" or "white",
  newWindow: true/false,
  loop: true/false      // KEY SETTING
}
```

**Behavior Logic**:
- **Loop = true**: Navigate entire browser to `player.html?page=N`
- **Loop = false**: Navigate only the iframe to target page
- **Non-page URLs**: Always direct navigation

**Implementation** (in generated pages):
```javascript
function handleTeleportClick(url, newWindow, loop) {
    var pageMatch = url.match(/page(\d+)\.html/);
    if (pageMatch && loop) {
        // Redirect to player.html system
        window.location.href = '/stories/story1/player.html?page=' + pageNum;
    } else {
        // Direct navigation (iframe or full page)
        window.location.href = url;
    }
}
```

### 4. Auto-Play System (UNIFIED in V1.1)

#### Single-Trigger Auto-Start Logic (V1.1)
**Problem**: Multiple conflicting auto-play triggers caused duplicate/failed starts

**NEW Solution (V1.1)**: **Single iframe load event** handles ALL auto-play scenarios
```javascript
// In player-controls.js - CRITICAL: Single trigger point
slideFrame.addEventListener('load', function() {
    setTimeout(function() {
        clickSlideshowButton(); // Unified for all media types
    }, 800);
});
```

**Scenarios Handled**:
1. **Manual Navigation**: iframe load event → auto-start
2. **URL Parameter Load**: iframe load event → auto-start  
3. **Initial Player Load**: iframe load event → auto-start

**Auto-Start Function** (Enhanced):
```javascript
function clickSlideshowButton() {
    // 1. Look for animationPlayButton ID (slideshows)
    // 2. Fall back to text search for "播放" + "幻灯片"  
    // 3. Fall back to audioIcon for video/audio
    // 4. Works for all media: slides, video+audio, audio-only
}
```

**V1.1 Changes**:
- **Eliminated**: Embedded auto-play logic in generated pages
- **Eliminated**: Multiple conflicting auto-start mechanisms  
- **Added**: Cache-busting parameters to prevent JavaScript conflicts

#### Background Music Muting
- **Mute**: When teleporting to non-loop pages (avoid audio conflicts)
- **Unmute**: When auto-advancing to next page (restore background music)

### 5. Batch Update System (REWRITTEN in V1.1)

#### Purpose
Update existing pageN.html files with latest code templates while preserving content data.

#### NEW Process (V1.1 - JSON-Based):
1. **Read from `json/pages.json`** instead of parsing HTML files
2. Load clean, reliable page configuration data
3. Regenerate HTML using serverPageGenerator.js with current templates
4. **Eliminates**: HTML regex parsing vulnerabilities
5. **Preserves**: All teleport buttons and settings perfectly

#### OLD Process (Pre-V1.1 - Deprecated):
~~1. Scan for existing `pageN.html` files~~  
~~2. Extract `pageData` object using regex: `/var pageData = ({[\s\S]*?});/`~~  
~~3. Regenerate HTML with latest template + extracted data~~

#### V1.1 Advantages:
- **100% Reliable**: No more teleport button loss
- **No Regex Parsing**: Clean JSON data source
- **Future-Proof**: Easy to extend with new features
- **Error-Free**: Eliminates JSON parsing failures

### 6. Timing System

#### Auto-Timing Generation (sourceAPI.js)
**Purpose**: Calculate how long each page should be displayed

**Process**:
1. Scan for `media/N.mp3` files matching `pageN.html`
2. Use `ffprobe` to get audio duration
3. Add 1 second buffer: `Math.round(duration) + 1`
4. Default to 10 seconds if no audio
5. Generate **`json/page-timing.json`** (NEW path in V1.1)

**Format**:
```json
[
  {"page": 1, "duration": 15},
  {"page": 2, "duration": 8},
  {"page": 3, "duration": 10}
]
```

#### Auto-Page Turn Logic
- Load timing data on player initialization
- Set timeout for each page based on timing
- Clear timeout on manual navigation
- Respect "自动翻页" checkbox setting

## API Endpoints

### Server Endpoints (server.js)

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/api/folders` | GET | List story folders |
| `/api/generate-timing` | POST | Generate **json/page-timing.json** |
| `/api/batch-update` | POST | Update all existing pages (V1.1: JSON-based) |
| `/api/rename-images` | POST | Organize slideshow images |
| `/api/list-images` | GET | List images in folder |
| **`/api/save-page-data`** | **POST** | **Save page data to json/pages.json (NEW)** |
| `/stories/:folder/` | Static | Serve story files |

## Key Data Structures

### pageData Object
```javascript
{
  // Basic page info
  pageNum: 1,
  title: "Page Title",
  titlePos: "top-left",
  showPageNumber: true,
  
  // Background media
  bgUrl: "media/background.mp4",
  bgScale: 100,
  bgWid: 100,
  bgPos: 50,
  bgStart: 0,
  bgEnd: 10,
  
  // Foreground media  
  fgUrl: "media/foreground.mp4",
  fgScale: 50,
  fgPos: 30,
  fgStart: 0,
  fgEnd: 5,
  
  // Audio
  audioUrl: "media/narration.mp3",
  
  // Text content
  descript: "Story text",
  descriptPos: "bottom",
  conv1: "Female dialogue",
  conv1PosL: 600,
  conv1PosT: 300,
  conv2: "Male dialogue", 
  conv2PosL: 600,
  conv2PosT: 50,
  
  // Slideshow animation
  animationFolder: "media/slides/",
  animationInterval: 3,
  animationScale: 80,
  animationPosition: 30,
  animationAudio: "media/slideshow.mp3",
  
  // Teleport buttons
  teleportButtons: [
    {
      name: "Next Chapter",
      url: "page10.html", 
      position: "bottom-right",
      color: "white",
      newWindow: false,
      loop: false
    }
  ],
  
  // Styling
  sceneBgColor: "#ffffff",
  controlsBgColor: "#000000"
}
```

## Development Workflow

### Adding New Features
1. **Client-side**: Update `pageGenerator.js` and related JS files
2. **Server-side**: Update `serverPageGenerator.js` (same logic)
3. **Player**: Update `player-controls.js` if needed
4. **JSON Schema**: Update `json/pages.json` structure if needed
5. **Test**: Generate pages and test in player system
6. **Batch update**: Run 一键更新 to update existing pages (now JSON-based)

### Migration from Pre-V1.1 (One-Time)
If upgrading from older versions with existing HTML files:
```bash
# Extract pageData from HTML files to JSON (one-time only)
cd story_builder/
python tools/html2json.py stories/story1 stories/story2
```

### Common Pitfalls
1. **Cross-origin restrictions**: iframe access limitations
2. ~~**Timing conflicts**: Multiple auto-start mechanisms~~ ✓ FIXED in V1.1
3. ~~**Teleport button loss**: JSON parsing failures during batch updates~~ ✓ FIXED in V1.1  
4. **Audio conflicts**: Background music + page audio overlapping
5. **Browser Cache**: Use cache-busting parameters for development (auto-added in V1.1)

### Testing Checklist
- [ ] Builder preview works
- [ ] Generated pages work standalone  
- [ ] Player.html navigation works
- [ ] Auto-timing works
- [ ] Teleport buttons work (both loop modes)
- [ ] **Unified auto-start works** (all media types, first-time loads)
- [ ] Background music muting works
- [ ] **Batch update preserves ALL data** (JSON-based reliability)
- [ ] **Cache-busting prevents conflicts** (development reliability)
- [ ] **JSON file organization** (json/ directory structure)

## File Dependencies

```
builder.html
├── pageGenerator.js (client-side generation)
├── playerGenerator.js (player generation)  
└── Uses server APIs

Generated pageN.html  
├── animation.js (slideshow controls)
├── video.js (video looping)
├── Embedded handleTeleportClick function

player.html
└── player-controls.js (navigation, timing, auto-start)

Server APIs
├── modules/serverPageGenerator.js
├── modules/batchUpdater.js
└── modules/sourceAPI.js
```

## Future Improvements
- Simplify auto-start logic (currently has 3 different mechanisms)
- Better error handling for cross-origin restrictions  
- More robust teleport button preservation
- Unified timing system across all components