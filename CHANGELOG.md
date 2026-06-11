# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.2.2] - 2026-06-11

### Changed
- Tweaked z-index of YouTube visualizer overlay and floating toggle button to 2000.
- Polished the "Hide Comments" option description in the Instagram popup.
- Updated README **Get it on** badges to reflect live approved store version v1.2.1 (from v1.1.0)

### Fixed
- Fixed Instagram Hide Likes not functioning and Comments over functioning.
- Fixed YouTube Music Mode overlay blocking native player controls by making the overlay wrapper transparent.
- Fixed the "Switch to Video" overlay button click responsiveness issues.

## [v1.2.1] - 2026-06-10

### Added
- **Instagram Controls**:
  - **Hide Professional Dashboard**: Added option to hide the "Professional Dashboard" sidebar link and icon on business/creator accounts using case-insensitive matches for the URL path and accessibility labels.
- **Documentation**: Added live Chrome Web Store (`v1.1.0`) and Firefox Add-ons (`v1.1.0`) badges to the README.

### Changed
- **Popup Footer**: Removed the personal website shortcut link from the popup interface.
- **Documentation**: Updated the project screenshots (`assets/youtube.png` and `assets/instagram.png`).

### Fixed
- **YouTube End-Screens Toggle**: Fixed a bug where YouTube end screen suggestions and overlay elements remained hidden after toggling the option off. Added style clearing to reset display overrides.
- **YouTube Report History Sidebar Divider**: Fixed an issue where hiding "Report history" left an extra visual separator line above the guide footer. Now hides adjacent divider elements dynamically.


## [v1.2.0] - 2026-06-09

### Added
- **Global Grayscale Mode**: Dynamic filter settings mapping `grayscale(100%)` to the root `html` element on both YouTube and Instagram to eliminate bright colors and reduce addictive scrolling without layout shifts.
- **YouTube Controls**:
  - **Hide Entire Sidebar**: Option to completely hide the sidebar on the video watch page, auto-stretching the player container symmetrically.
  - **Hide End Screens**: Removes video card overlays, autoplay suggestions, and modern fullscreen or suggestion videowalls at the end of videos, utilizing a recursive shadow root MutationObserver for style preservation across video load resets.
  - **Hide Subscriptions**: Hides subscription feed contents on `/feed/subscriptions` and guide links/sidebar entries.
  - **Hide Explore**: Hides the entire "Explore" link and section from the guide/sidebar.
  - **Hide Report History**: Hides the "Report history" link from the guide/sidebar using robust wildcard href matching.
  - **Hide More from YouTube**: Hides the "More from YouTube" category sections from the guide/sidebar.
  - **Hide Shorts Everywhere**: Option to completely hide the Shorts tab and video thumbnails from channel pages, locking the parent "Hide Shorts" toggle.
- **Instagram Controls**:
  - **Hide Stories (Home)**: Option to remove the top stories tray from the home feed.
  - **Hide Stories Everywhere**: Option to completely hide the stories tray, highlights, and story rings (plus auto-redirect from `/stories/`), locking the "Hide Stories (Home)" option to active/disabled.
  - **Square Profile Photos**: Renders profile pictures/avatars, highlights, story rings, and story tray borders as soft squares cleanly scoped to prevent other elements from distorting.
  - **Hide Notes**: Hides status note bubbles from profile pictures and inbox lists.
  - **Hide Likes**: Scopes metrics hiding specifically to likes counts on posts, reels, hover cards, and profile follower counts.
  - **Hide Comments**: Unified comments hiding toggle that hides comment counts, comment icons, comment list lines, and comment textareas/inputs while preserving the post author's original caption.
  - **Instagram Comments Restoration**: Hidden comments are tagged with `data-ff-comment-hidden` attributes, enabling instant restoration of comments when the feature is disabled without page reloads.
  - **Hide Notifications**: Hides the notifications/activity tab from the sidebar.
- **Music Visualizer Pause state Synchronization**: Wave-bar animation automatically halts when the active YouTube video element is paused or ended.
- **Support & Feedback Channel**: Prefilled support `mailto` link added directly inside the popup footer and README, automatically formatting standard extension subject tags.
- **Clickable Security Shield**: Quick shortcut links added directly on the privacy status shield to visit the public source code repository.

### Changed
- **Instagram Reels Navigation Hiding**: Scopes the Reels sidebar/navigation hiding rule to target only items outside of the `<main>` container (using `:not(main a)`). This ensures the Reels tab and grid on user profile pages remain visible and accessible while hiding it from the navigation menus.

### Fixed
- **YouTube Profile Page Videos Hiding**: Scoped homepage nuke selectors strictly to `page-subtype="home"` and homepage root paths, resolving a bug where video grid lists on user profile and channel pages were hidden when "Hide Home Feed" was enabled.
- **YouTube Shorts in Playlists/Channels**: Corrected shorts rules to ignore videos listed inside playlist containers and channel pages, resolving a bug where enabling "Hide Shorts" would incorrectly block Shorts from rendering inside playlists.
- **Instagram Saved Section Posts/Reels**: Scoped main feed hiding rules strictly to homepage root paths, allowing saved posts and reels to render successfully.
- **Instagram Profile/Details Navigation**: Refined reels and explore links selectors to ignore page body frames (`main`), resolving navigation glitches when view items were selected.

### Acknowledgements
- Inspiration [IG Plus Extension](https://github.com/ptjaworski/igplus-extension) for Instagram architecture.


---

## [v1.1.0] - 2026-06-07

### Added
- **In-Player Overlay Options**: A customizable sub-setting to choose between a pure black screen or a black screen with a notice overlay showing text ("Music Only Mode Active") and an easy `"Switch to Video"` button.
- **Floating Player Toggle Button**: Sleek semi-transparent control pill ("🎵 Music Mode") positioned at the top-right of the YouTube player that appears on hover, permitting instant control right from the player interface.
- **Ko-fi Support**: Icon added at the footer 
- **Updated Documentation**: Added a detailed `PRIVACY.md` policy file and updated `README.md` with popup screenshots and a styled changelog reference.

### Changed
- **Footer UI Spacing**: Distributed all footer links (Security Status, Ko-fi Support, Developer Site, and Version Tag) evenly across the width of the popup.
- **Global Project Version Bump**: Upgraded extension version from `1.0.0` to `1.1.0` across all metadata manifests, packages, files, and popup UI layers.

---

## [v1.0.0] - 2026-06-06

### Added
- **Initial Release** of the Feed Free - Unbiased Feed(FF - UF) extension, focusing on Feed-Free for phase 1 (v1)
- **YouTube Algorithmic De-cluttering**: Toggles to hide the main homepage recommendation grid, sidebar suggested videos panel, YouTube Shorts shelves, and comments section.
- **Instagram Feed Controls**: Switches to hide the main explore feed, direct messages view, Reels panel, and force chronological Following feed routing.
- **Real-Time Extension Sync**: State broadcast syncing configuration switches instantly across all open browser tabs.
- **Anti-Flicker Injection**: Synchronous pre-render styles loaded at `document_start` preventing layout shifts before filter script executes.
- **Master Global Toggle**: Universal toggle to pause/play blocking across the extension.
