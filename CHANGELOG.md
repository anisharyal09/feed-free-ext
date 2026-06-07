# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.1.0] - 2026-06-07

### Added
- **In-Player Overlay Options**: A customizable sub-setting to choose between a pure black screen or a black screen with a notice overlay showing text ("Music Only Mode Active") and an easy `"Switch to Video"` button.
- **Floating Player Toggle Button**: Sleek semi-transparent control pill ("🎵 Music Mode") positioned at the top-right of the YouTube player that appears on hover, permitting instant control right from the player interface.
- **Ko-fi Support**: Icon added at the footer 
- **Updated Documentation**: Screenshots of the popup added in `README.md`.

### Changed
- **Footer UI Spacing**: Distributed all footer links (Security Status, Ko-fi Support, Developer Site, and Version Tag) evenly across the width of the popup.
- **Global Project Version Bump**: Upgraded extension version from `1.0.0` to `1.1.0` across all metadata manifests, packages, files, and popup UI layers.

---

## [v1.0.0] - 2026-06-07

### Added
- **Initial Release** of the Feed Free - Unbiased Feed(FF - UF) extension, focusing on Feed-Free for phase 1 (v1)
- **YouTube Algorithmic De-cluttering**: Toggles to hide the main homepage recommendation grid, sidebar suggested videos panel, YouTube Shorts shelves, and comments section.
- **Instagram Feed Controls**: Switches to hide the main explore feed, direct messages view, Reels panel, and force chronological Following feed routing.
- **Real-Time Extension Sync**: State broadcast syncing configuration switches instantly across all open browser tabs.
- **Anti-Flicker Injection**: Synchronous pre-render styles loaded at `document_start` preventing layout shifts before filter script executes.
- **Master Global Toggle**: Universal toggle to pause/play blocking across the extension.
