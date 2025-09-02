# Changelog

## Version 1.2 - [2025-9-02]

### Added

- **Modern UI Design System:** Complete visual overhaul with contemporary design inspired by Tailwind CSS principles.
  - **CSS Custom Properties:** Implemented comprehensive design tokens for colors, spacing, shadows, and typography
  - **Modern Color Palette:** Professional color scheme with proper contrast ratios (primary: #3b82f6, success: #10b981, etc.)
  - **Enhanced Typography:** System font stack with improved readability and -webkit-font-smoothing
  - **Box Shadow System:** Layered shadow system for depth and modern card-based layouts
- **Responsive Grid Layout:** Redesigned story cards with modern responsive grid system.
  - **Auto-Fill Grid:** Dynamic grid that adapts to screen sizes with minmax(320px, 1fr) columns
  - **Modern Card Design:** Clean cards with subtle shadows, rounded corners, and smooth hover animations
  - **Image Scaling Effects:** Subtle zoom effects on hover for enhanced interactivity
  - **Mobile Optimization:** Responsive breakpoints for optimal mobile experience
- **Gallery View Mode:** Added macOS Finder-inspired Cover Flow view mode for story browsing.
  - **Featured Story Display:** Large featured image with story details and action buttons
  - **Thumbnail Navigation:** Interactive thumbnail strip for story selection
  - **Smooth Animations:** Slide-up animations and smooth transitions between view modes
  - **Keyboard Shortcuts:** Cmd/Ctrl+1 for Grid View, Cmd/Ctrl+4 for Gallery View (matching macOS Finder)
- **Favorites Management System:** Comprehensive bookmark system for organizing story collections.
  - **Dropdown Menu:** Hamburger menu with clean dropdown interface and backdrop blur effects
  - **Custom Favorites Lists:** Create named collections with selected stories
  - **Visual Story Selection:** Modal with thumbnail grid for intuitive story picking
  - **Persistent Storage:** Favorites saved to localStorage with automatic loading
  - **Dynamic Menu Updates:** New favorites automatically appear in dropdown menu
- **Enhanced Modal System:** Modernized all modal interfaces with improved UX.
  - **Backdrop Blur:** Modern glass-morphism effects with backdrop-filter blur
  - **Slide-Up Animations:** Smooth entrance animations for better user experience
  - **Improved Close Buttons:** Better positioned and styled close controls
  - **Form Validation:** Real-time validation with disabled state management

### Changed

- **Modular Architecture:** Complete refactoring of frontend code into organized module system.
  - **Separated CSS Modules:** Split styles into logical modules (styles.css, view-switcher.css, favorites.css)
  - **JavaScript Modules:** Organized functionality into dedicated modules (view-switcher.js, story-loader.js, favorites.js)
  - **Clean HTML Structure:** Reduced index.html from ~800 lines to ~130 lines with external module references
  - **Project Organization:** Moved all frontend modules to root-level /modules directory for better organization
- **Server Static File Configuration:** Enhanced Express server to serve modular architecture.
  - **Module Serving:** Added /modules endpoint for serving frontend modules
  - **Clean URLs:** Simplified module paths from /stories/modules/ to /modules/
  - **Better Separation:** Clear distinction between story content and UI modules
- **Button Design System:** Unified button styling with consistent color-coded actions.
  - **Primary Actions:** Blue buttons for main actions (Edit, Confirm)
  - **Success Actions:** Green buttons for positive actions (Play)  
  - **Secondary Actions:** Gray buttons for secondary actions (Preview, Cancel)
  - **Hover Animations:** Micro-interactions with translateY transforms and color transitions
- **Header Layout:** Redesigned main header with gradient background and improved navigation controls.
  - **Gradient Background:** Modern linear gradient from primary to secondary colors
  - **Centered Title:** Improved typography and positioning for main title
  - **Dual Navigation:** Both hamburger dropdown and view switcher controls available

### Technical Improvements

- **CSS Architecture:** Modern CSS methodology with design tokens and modular organization.
  - **Design Token System:** Comprehensive CSS custom properties for maintainable theming
  - **Modular CSS:** Logical separation of concerns across multiple stylesheet modules
  - **Performance Optimization:** Reduced redundancy and improved CSS loading efficiency
- **JavaScript Organization:** Clean separation of functionality into focused modules.
  - **Single Responsibility:** Each module handles one specific feature area
  - **Shared State Management:** Proper state sharing between modules through global variables
  - **Event Handling:** Centralized event management with proper cleanup
- **Build-Free Development:** Modern development experience without complex build tools.
  - **Native ES Modules Ready:** Code structure prepared for future ES module migration
  - **Zero Dependencies:** No additional npm packages required for UI functionality
  - **Browser-Native Features:** Leverages modern CSS and JavaScript APIs

## Version 1.1 - [2025-8-26]

### Added

- **JSON-Based Data Management System:** Complete restructuring of data storage for improved reliability and maintainability.
  - **pages.json Storage:** All page configuration data now stored in `json/pages.json` instead of being extracted from HTML files
  - **Centralized JSON Directory:** Both `pages.json` and `page-timing.json` moved to organized `json/` folder structure
  - **Migration Tool:** Added `html2json.py` standalone Python script for one-time migration of existing pageN.html files to JSON format
  - **Separation of Concerns:** Clean separation between user data (JSON) and presentation templates (HTML generators)
- **Enhanced Batch Update System:** Complete rewrite of 一键更新 functionality for maximum reliability.
  - **JSON-Based Updates:** Batch updates now read from reliable `json/pages.json` instead of parsing fragile HTML regex patterns
  - **Teleport Button Preservation:** Eliminates previous issues with teleport button configuration loss during updates
  - **Template Safety:** Updates only affect code templates while preserving all user configuration data
  - **Error Prevention:** Eliminates JSON parsing failures and data corruption from HTML extraction
- **Unified Auto-Play System:** Simplified and consolidated audio/slideshow auto-start functionality.
  - **Single Trigger Point:** All auto-play logic consolidated to iframe load event for consistent behavior
  - **Eliminated Conflicts:** Removed duplicate and conflicting auto-play mechanisms from generated pages
  - **Background Music Management:** Automatic muting/unmuting of player background music during teleport navigation
  - **Cross-Frame Communication:** Enhanced iframe-to-parent communication for teleport button functionality
- **Cache-Busting Implementation:** Added dynamic cache invalidation to prevent JavaScript caching issues.
  - **Timestamp-Based Versioning:** All JavaScript file includes now use `?v=timestamp` parameters
  - **Development Reliability:** Ensures code updates are immediately reflected without browser cache conflicts
- **Auto Page Turn Functionality:** Implemented intelligent automatic page navigation with audio-based timing for seamless story playback.
  - **自动翻页 Checkbox:** Toggle automatic page turning on/off in the player control panel
  - **计算时间长度 Button:** Manually trigger audio duration analysis and timing calculation
  - **Smart Audio Detection:** Uses ffprobe to automatically detect actual audio file durations (e.g., 1.mp3 → 19s, 2.mp3 → 14s)
  - **JSON-Based Timing System:** Generates `page-timing.json` with precise timing data for each page
  - **Fallback Default Timing:** Pages without audio files default to 10-second display duration
- **Backend Audio Analysis API:** Added `/api/generate-timing` endpoint for server-side audio duration detection using ffmpeg/ffprobe.
- **Automatic Button Activation:** Auto page turn includes automatic clicking of audio/slideshow buttons on each new page for hands-free operation.
- **Enhanced Keyboard Controls:** Improved slideshow navigation with more intuitive key mappings.
  - **'a' Key:** Toggle auto page turn mode on/off
  - **Space Bar:** Pause/resume slideshow animation (moved from ArrowDown)
  - **ArrowDown:** Skip to previous slide frame (new functionality)
  - **ArrowUp:** Skip to next slide frame (unchanged)
- **JSON Batch Import System:** Added "📥 一键导入json" button for automated page generation from JSON data sources.
  - **Dual JSON File Support:** Imports from `media/narration-tts.json` (page content) and `media/media-type.json` (media configuration)
  - **Intelligent Media Type Inheritance:** Pages not explicitly defined inherit media type from the most recent previous page
  - **40-Page Batch Generation:** Creates complete story with proper page numbering, media paths, and content mapping
  - **Modular Architecture:** Extracted 180+ lines of import logic into separate `javascript/batch_generation.js` module
- **Batch Page Update System:** Added "⚡ 一键更新" button for mass regeneration of existing pages.
  - **Auto-Discovery:** Automatically finds all existing pageN.html files
  - **Batch Processing:** Performs load-preview-save cycle for each page
  - **Progress Tracking:** Real-time feedback during update process
  - **Use Case:** Essential when updating tools (animation.js, player-controls.js) or adding new features that require page regeneration
- **Teleport Button System:** Added "传送按钮" functionality for advanced page navigation and story flow control.
  - **Configuration Popup:** 8-row configuration window with name, new window, loop options, URL input, position selection, and color choice
  - **Position Management:** 9 position options (top-left, top, top-right, middle-left, center, middle-right, bottom-left, bottom, bottom-right) with overlap prevention
  - **Visual Design:** Borderless rectangular buttons with 60% background opacity, 100% font opacity, 24pt font size, and 2-second flash animation
  - **Dual Navigation Modes:** Normal mode (jump to page, continue from original sequence) and Loop mode (redirect to player.html?page=N for story flow change)
  - **URL Parameter Support:** Enhanced player-controls.js to handle ?page=N parameters for seamless loop functionality integration. **补充说明： loop模式的页面必须填写成player.html?page=3而不能填写成page3.html.**
- **Auto-Dock Mode:** Added Mac dock-like behavior for player controls with "自动收拢模式" checkbox. Controls automatically hide and show on mouse hover at bottom of screen for distraction-free viewing.
- **Page Number Display Control:** Added "显示页面号码" checkbox in builder interface to selectively hide page numbers while preserving titles.

### Changed

- **Data Storage Architecture:** Migrated from HTML-embedded data extraction to dedicated JSON file storage system for improved reliability.
- **File Organization:** Consolidated all JSON data files into dedicated `json/` directory structure (previously scattered across javascript/ and root directories).
- **Batch Update Logic:** Completely rewritten to eliminate HTML parsing and regex-based data extraction vulnerabilities.
- **Auto-Play Architecture:** Unified all auto-start mechanisms into single iframe load event handler, eliminating timing conflicts and duplicate triggers.
- **JavaScript Cache Management:** All generated pages now include cache-busting parameters to prevent browser caching conflicts during development.
- **Simplified Naming Convention:** Audio files now follow strict `N.mp3` pattern (page1.html → 1.mp3, page2.html → 2.mp3) for reliable detection.
- **Manual Timing Control:** Separated timing calculation from auto page turn activation, allowing manual adjustment of durations without automatic override.
- **Player Control Layout:** Added new controls to player interface while maintaining compact design.
- **UI Organization:** Moved "故事场景背景色" from Player Settings to Background section for better logical grouping and proper loading functionality.
- **Directory Structure Update:** Changed subdirectory reference from 'tools' to 'javascript' throughout the codebase for better organization and clarity.
- **Default Player Mode:** Set both "自动翻页" and "自动收拢模式" as default enabled modes for enhanced user experience.
- **Batch Update Compatibility:** Updated 一键更新 system to handle new showPageNumber property with backward compatibility for existing pages.

### Technical Improvements

- **Server-Side Processing:** Audio duration analysis performed on backend using system ffmpeg/ffprobe for maximum compatibility.
- **Story Folder Detection:** Automatically detects story context from referrer URL, supporting multiple story projects.
- **Clean Separation of Concerns:** Auto page turn logic completely separate from existing slideshow and navigation controls.
- **No Additional Dependencies:** Uses system ffmpeg tools instead of Node.js audio libraries for zero-dependency audio analysis.

## Version 1.0 - [2025-8-21]

### Added

- **Advanced Slideshow Controls:** Implemented frame-by-frame navigation and pause/resume functionality for still frame animations.
  - **ArrowUp Key:** Skip to next slideshow frame (pictures only, independent of audio)
  - **ArrowDown Key:** Pause/resume slideshow animation (pictures only, audio continues)
  - **Audio-Independent Operation:** Slideshow controls work completely independently of background audio and music playback
- **Enhanced Animation Functions:** Added `skipToNextFrame()` and `toggleAnimationPause()` functions to animation.js for granular slideshow control.
- **Narrative Text Positioning:** Added support for top, middle, and bottom positioning of narrative text with radio button selection in the builder interface.
- **Cross-Frame Communication:** Improved player-controls.js to properly communicate with iframe content for slideshow control.

### Changed

- **Keyboard Event Handling:** Updated generated page templates to include ArrowUp/ArrowDown event listeners for direct slideshow control.
- **Player Controls Architecture:** Enhanced player-controls.js fallback mechanism to call correct slideshow functions (`skipToNextFrame`, `toggleAnimationPause`) instead of non-existent functions.
- **Animation Control Separation:** Clearly separated full animation control (start/stop with audio) from slideshow control (frame navigation and pause/resume without audio).

### Fixed

- **ArrowUp/ArrowDown Not Working:** Resolved issue where keyboard shortcuts for slideshow control were not functioning due to missing event handlers in generated pages.
- **Cross-Origin Communication:** Improved iframe communication to properly handle slideshow controls when direct DOM access fails.
- **Function Name Mismatch:** Fixed player-controls.js to call the correct function names that actually exist in animation.js.

### Technical Improvements

- **Modular Control Design:** Slideshow controls are now completely independent of audio playback, allowing for precise visual timing control while maintaining audio continuity.
- **Event Handling Optimization:** Streamlined keyboard event processing to remove unnecessary key handlers (removed / and Ctrl+P from page templates).
- **Function Isolation:** Created dedicated functions for frame-by-frame control that don't interfere with existing play/stop animation functionality.

## Version 0.9 - [2025-8-16]

### Added

- **Express Server Integration:** Replaced static http-server with full Express.js server providing both file serving and backend script execution capabilities.
- **Functional Image Organization Button:** The "🔄 一键整理图片文件名" button now actually executes the `rename_slides_img.sh` script via server API calls, providing real automated image organization by creation date.
- **Automated Server Management:** Enhanced `start.sh` script now automatically installs dependencies, kills existing servers, and starts the Express server from the correct directory structure.
- **Server-Side Script Execution:** Added `/api/rename-images` endpoint that executes shell scripts server-side and returns results to the browser.

### Changed

- **File Structure Reorganization:** Moved all web assets into `pages/` directory and tools into `pages/tools/` for better organization and separation of concerns.
- **Server Architecture:** Migrated from static file server to Express.js with proper backend capabilities for script execution.
- **Startup Process:** `start.sh` now serves from parent directory to properly handle multiple story projects under the `stories/` structure.
- **Button Functionality:** Converted previously informational "image organization" button into fully functional feature with real-time execution and feedback.

### Fixed

- **Path Resolution Issues:** Corrected all file paths to work with the new directory structure and server setup.
- **Script Execution Context:** Fixed working directory issues in `rename_slides_img.sh` execution to ensure proper media folder detection.
- **Server Persistence:** Added automatic process cleanup to prevent multiple server instances and port conflicts.

### Technical Improvements

- **Dependency Management:** Added `package.json` with Express.js dependency and proper Node.js project structure.
- **Error Handling:** Enhanced error reporting for script execution failures with detailed debugging information.
- **Process Management:** Implemented proper server lifecycle management with automatic cleanup and restart capabilities.

## Version 0.8 - [2025-8-13]

### Added

- **AppleScript Autoplay Integration:** Enhanced master-controller.js with AppleScript fallback to bypass browser autoplay restrictions. When browser-level autoplay fails, the system automatically uses macOS AppleScript to programmatically click play buttons for audio, video, and slide controls.
- **Enhanced Keyboard Navigation:** Left and right arrow keys now trigger autoplay functionality in addition to page navigation, ensuring seamless hands-free operation.

### Changed

- **Improved Autoplay Reliability:** The autoPlayCurrentPage() function now includes a 500ms delayed AppleScript fallback to handle cases where browser autoplay policies prevent media from starting automatically.

## Version 0.7 - [2025-5-30]


-   **Auto-incrementing Media Paths:** When saving a page, file paths in the following fields that match the pattern `media/{current-page-number}.{extension}` or `media/{current-page-number}/` are automatically updated to `media/{new-page-number}.{extension}` or `media/{new-page-number}/`. This feature applies to:
    -   后景 (Background) URL
    -   前景 (Foreground) URL
    -   声音 (Audio) URL
    -   幻灯片连播 (Animation) 图片文件夹路径
    -   幻灯片音频 (Animation Audio)

### Changed

-   **Separate Player Settings Management:** The 播放器设置 (Player Settings) now have dedicated "加载播放器设置" (Load Player Settings) and "保存播放器设置" (Save Player Settings) buttons within their section. This clearly separates player configuration from individual page settings, preventing confusion previously caused by using page 0 for this purpose.
    -   "加载播放器设置" now reads the existing `player.html` file to populate the Player Settings form fields.
    -   "保存播放器设置" saves the current form values and generates the `player.html` file.

### Fixed

-   **故事场景背景色 (Scene Background Color) Application:** The 故事场景背景色 now correctly affects the background of individual saved pages. This was resolved by:
    -   Ensuring the `sceneBgColor` is applied inline to the `<body>` tag of each saved `pageN.html` file.
    -   Removing a conflicting `background: black;` rule from the `body` selector in `builder.css` that was previously overriding the inline styles.
