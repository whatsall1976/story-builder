# Story Builder

A web-based interactive story presentation builder that allows users to create rich multimedia slides combining images, videos, audio, and text with TTS (Text-to-Speech) capabilities. Perfect for creating narrative-style presentations similar to visual novels or interactive storytelling experiences.

## Features

### 🎬 Multi-Media Support
- **Background Media**: Support for images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, OGG)
- **Foreground Media**: Layered foreground images/videos with customizable positioning and scaling
- **Audio Integration**: Background audio with play/pause controls
- **Video Looping**: Define custom start and end points for video loops using percentage-based controls
- **Still Frame Animation (幻灯片连播)**: Sequential image animation with customizable timing and positioning

### 🎭 Interactive Elements
- **Text-to-Speech (TTS)**: Click-to-speak conversation bubbles with gender-specific voices
  - Female voice: Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)
  - Male voice: Configurable through tts2.js
- **Conversation Bubbles**: Positioned dialogue elements with custom placement
- **Narrative Text**: Customizable position (top, middle, bottom) with semi-transparent background
- **Animation Controls**: Play/stop buttons for still frame animations
- **Advanced Slideshow Controls**: Frame-by-frame navigation and pause/resume functionality independent of audio playback

### 🎨 Layout & Positioning
- **Foreground Scaling**: Adjust foreground element size (0-200% scale)
- **Aspect Ratio Control**: Crop foreground media width (0-100%)
- **Position Control**: Horizontal positioning of foreground elements
- **Title Positioning**: 6 preset positions (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
- **Custom Dialogue Placement**: Pixel-perfect positioning for conversation bubbles
- **Animation Positioning**: Configurable scale and position for still frame animations

### 💾 Project Management
- **Save System**: Export individual pages as standalone HTML files
- **Load System**: Import previously saved pages for editing
- **Preview Mode**: Real-time preview of your story slide
- **Page Numbering**: Organized page management system
- **Collapsible Interface**: Organized sections with expand/collapse functionality

### 🎮 Playback System
- **Dedicated Player**: `player.html` for presenting your complete story
- **Navigation Controls**: Left/right arrow keys or on-screen buttons for page navigation
- **Slideshow Controls**: Up/down arrow keys for frame-by-frame control and pause/resume
- **Direct Page Access**: Jump to specific pages via input field
- **Background Music**: Optional looping background audio during playback
- **Independent Media Control**: Slideshow controls work independently of audio playback

## Setup Instructions

### 1. Quick Start (Recommended)
The easiest way to start the story builder:

```bash
cd story_builder
./start.sh
```

This script will:
- Install required Node.js dependencies automatically
- Kill any existing server processes
- Start the Express server with script execution capabilities
- Open both builder.html and player.html in Microsoft Edge

### 2. Manual Server Setup Options

**Option A: Built-in Express Server (Recommended)**
```bash
cd story_builder
npm install
node server.js
# Access via http://localhost:888/stories/story_builder/pages/builder.html
```

**Option B: Static File Server (Limited functionality)**
```bash
npm install -g http-server
cd story_builder
http-server -p 888
# Access via http://localhost:888/builder.html
# Note: Some features like script execution won't work
```

### 2. Media Organization
- Create a `media/` folder in your story_builder directory
- Organize your images, videos, and audio files within this folder
- For animations, create subfolders like `media/animation/` with numbered images (1.jpg, 2.jpg, etc.)
- The builder defaults to `media/` path for easy access

## Usage Guide

### Creating a New Story Page

1. **Open the Builder**
   - Navigate to `builder.html` in your local server
   - The interface shows a collapsible control panel on the left and preview area on the right
   - Click section headers to expand/collapse different configuration areas

2. **Configure Basic Settings** (页面号码 section)
   - **页面号码 (Page Number)**: Set the page number for organization
   - **标题 (Title)**: Optional title text that appears on the slide
   - **标题位置 (Title Position)**: Choose from 6 positioning options

3. **Set Background Media** (后景 section)
   - **后景 (Background)**: Enter path to background image/video (e.g., `media/background.jpg`)
   - **播放起点/终点 (Start/End Points)**: For videos, set loop points in seconds
   - **声音 (Audio)**: Background audio file path

4. **Configure Foreground Elements** (前景 section)
   - **前景 (Foreground)**: Path to foreground image/video
   - **占比多少 (Scale)**: Size percentage (30% default)
   - **画幅展现 (Width Display)**: Aspect ratio control (100% = full width)
   - **展现位置 (Position)**: Horizontal position (70% default)
   - **播放起点/终点**: Video loop points for foreground media

5. **Add Text Content** (叙述文字 section)
   - **叙述文字 (Narrative Text)**: Descriptive text with position options (top, middle, bottom)
   - **叙述文字位置**: Choose between bottom (default), middle, or top positioning
   - **女声说话 (Female Voice)**: Clickable dialogue for female character
   - **男声说话 (Male Voice)**: Clickable dialogue for male character
   - **台词位置 (Dialogue Position)**: X,Y coordinates for speech bubbles

6. **Configure Still Frame Animation** (幻灯片连播 section)
   - **图片文件夹路径 (Image Folder Path)**: Path to folder containing numbered images (e.g., `media/animation/`)
   - **间隔时间 (Interval)**: Time between frames in seconds (e.g., 0.1 for 100ms)
   - **缩放比例 (Scale)**: Animation size as percentage of original (e.g., 80 for 80%)
   - **左边距 (Left Margin)**: Horizontal position as percentage (e.g., 30 for 30% from left)
   - **幻灯片音频 (Animation Audio)**: Optional audio file to play with animation
   - **播放幻灯片连播 (Play Animation)**: Test button to preview animation in builder
   - **🔄 一键整理图片文件名 (One-Click Image Organization)**: Automatically renames image files by creation date

### Animation Setup Requirements
- Images must be numbered sequentially: `1.jpg`, `2.jpg`, `3.jpg`, etc.
- Supported formats: JPG, PNG, GIF
- Place all animation frames in a dedicated folder
- Animation stops automatically when no more numbered images are found

### Image Organization Tool
The **🔄 一键整理图片文件名** button provides automated image organization:
- Scans all subfolders in the `media/` directory
- Sorts images by creation date/time
- Renames them sequentially (1.jpg, 2.jpg, etc.)
- Works with JPG, JPEG, PNG, GIF, WebP formats
- Requires Express server to function (automatically available when using `./start.sh`)

### Workflow Steps

1. **Preview** (预览): Click to see real-time preview of your slide
2. **Save** (保存): Downloads the page as `pageX.html` file
3. **Load** (加载): Enter page number and click to edit existing pages

### Editing Existing Pages

1. Enter the page number in **页面号码 (Page Number)** field
2. Click **加载 (Load)** button
3. The form will populate with existing page data
4. Make your changes
5. Click **预览 (Preview)** to review
6. Click **保存 (Save)** to update the page

### Playing Your Story

1. Open `player.html` in your browser
2. Use navigation controls:
   - **< >**: Previous/Next page buttons
   - **^**: Return to first page
   - **Left/Right Arrow Keys**: Page navigation
   - **Up Arrow Key**: Skip to next animation frame (pictures only)
   - **Down Arrow Key**: Pause/resume animation (pictures only, audio continues)
   - **Page Input**: Type page number and press Enter
3. Background music plays automatically if configured
4. Click conversation bubbles to hear TTS audio
5. Click animation buttons to play still frame animations
6. Use keyboard shortcuts for hands-free slideshow control

## File Structure

```
ciag/                    # Parent project directory
├── start.sh             # Quick start script (recommended)
├── server.js            # Express server with script execution (shared)
├── package.json         # Node.js dependencies (shared)
├── node_modules/        # Installed dependencies (shared, auto-generated)
├── story_builder/       # Story builder project
│   ├── docs/            # Documentation
│   │   ├── README.md    # This file
│   │   └── changelog.md # Version history
│   └── stories/         # Story projects directory
│       └── story1/      # Individual story project
│           ├── builder.html # Main builder interface
│           ├── player.html  # Story playback interface (generated)
│           ├── tools/   # JavaScript modules and utilities
│           │   ├── builder.css         # Styling for builder and slides
│           │   ├── video.js            # Video looping functionality
│           │   ├── tts1.js             # Female voice TTS
│           │   ├── tts2.js             # Male voice TTS
│           │   ├── animation.js        # Still frame animation functionality
│           │   ├── player-controls.js  # Player navigation and slideshow controls
│           │   ├── cosyvoice_tts.py    # TTS generation script
│           │   ├── cosyvoice_tts_json.py # TTS JSON processing
│           │   └── rename_slides_img.sh # Image organization script
│           ├── media/   # Your media assets
│           │   ├── images/
│           │   ├── videos/
│           │   ├── audio/
│           │   └── animation/ # Numbered animation frames
│           │       ├── 1.jpg
│           │       ├── 2.jpg
│           │       └── ...
│           └── pageX.html # Generated story pages
└── [other projects...]  # Other projects sharing the same server infrastructure
```

## Browser Compatibility

- **TTS Features**: Work best in Microsoft Edge with Chinese language support
- **Video/Audio**: Modern browsers with HTML5 support
- **File Operations**: Requires local server (not file:// protocol)
- **Animations**: Compatible with all modern browsers

## Tips & Best Practices

1. **Media Optimization**: Use compressed images/videos for better performance
2. **Consistent Naming**: Use clear, numbered naming for easy organization
3. **Preview Often**: Use preview function frequently to check layout
4. **Backup Pages**: Keep copies of your generated HTML files
5. **Audio Format**: MP3 format recommended for broad compatibility
6. **Video Loops**: Test start/end points to ensure smooth looping
7. **Animation Frames**: Keep animation frames consistent in size and format
8. **Folder Organization**: Use descriptive folder names for different animation sequences

## Technical Notes

- Pages are saved as standalone HTML files with embedded data
- TTS uses browser's built-in Speech Synthesis API
- Video looping uses JavaScript time monitoring
- Still frame animations use setTimeout for precise timing control
- Responsive design adapts to different screen sizes
- Z-index layering ensures proper element stacking
- Collapsible sections improve interface organization

## Troubleshooting

**Common Issues:**
- **Media not loading**: Check file paths and local server setup
- **TTS not working**: Ensure using compatible browser (Edge recommended)
- **Save/Load issues**: Verify local server is running properly
- **Video not looping**: Check that start/end times are within video duration
- **Animation not playing**: Verify image files are numbered correctly (1.jpg, 2.jpg, etc.)
- **Animation stops early**: Check that all frame files exist and are accessible
- **Sections not collapsing**: Ensure JavaScript is enabled in browser

## Player Configuration

To configure the player settings for your story presentation, set the page number to **0**. This allows you to specify the following parameters:

- **故事标题**: The title of your story.
- **播放器背景音乐**: The URL for the background music.
- **故事场景背景色**: The background color for the story scene.
- **播放器面板背景色**: The background color for the player controls.

Once you have entered these settings, click the **保存** button. This will generate a `player.html` file with your specified settings. No `page0.html` will be created, ensuring a clean setup for your story presentation.

## Keyboard Shortcuts

Enhance your navigation and control experience with these keyboard shortcuts:

- **Player Panel (`player.html`)**:
  - **Left Arrow**: Navigate to the previous page.
  - **Right Arrow**: Navigate to the next page.
  - **Up Arrow**: Skip to next slideshow frame (pictures only, independent of audio).
  - **Down Arrow**: Pause/resume slideshow animation (pictures only, audio unaffected).
  - **Ctrl + F**: Shift focus to the main content area (iframe) to interact with the story content.

- **Main Content (`pageN.html`)**:
  - **Up Arrow**: Skip to next slideshow frame (frame-by-frame control).
  - **Down Arrow**: Toggle slideshow pause/resume (independent of audio playback).
  - **Ctrl + P**: Return focus to the player panel to navigate between pages.

### Advanced Slideshow Control Features:
- **Frame-by-Frame Navigation**: Use Up Arrow to manually advance through animation frames at your own pace.
- **Independent Pause/Resume**: Use Down Arrow to pause/resume slideshow without affecting background audio or music.
- **Audio-Independent Control**: Slideshow controls work independently of all audio playback, allowing you to control visual timing while maintaining audio continuity.

These shortcuts allow for a seamless, mouse-free experience when presenting or editing your story.


---

*Created for interactive storytelling and multimedia presentations* 