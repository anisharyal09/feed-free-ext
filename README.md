# Feed Free — Unbiased Feed Extension (FF – UF)

Take control of your social media feeds. Block algorithmic recommendations, Shorts, Reels, suggested content, comments, and more on YouTube and Instagram. Works seamlessly with SPA navigation — no page reload required.


<p align="center">
  <img src="assets/youtube.png" alt="YouTube Feed Free" width="49%" />
  <img src="assets/instagram.png" alt="Instagram Feed Free" width="49%" />
  <br>
  <em>Screenshots of Popup UI with Youtube and Instagram Controls (Left-to-Right).</em>
</p>

---
> [!NOTE]
> See [CHANGELOG.md](CHANGELOG.md) for detailed version updates and release logs.

## Features

### YouTube
- **Hide Home Feed** — Remove the algorithmic video grid from youtube.com
- **Hide Shorts** — Remove Shorts from sidebar and homepage
- **Hide Sidebar Recs** — Clear suggested videos next to the player
- **Hide Comments** — Remove the entire comments section
- **Music Mode** — Black out the video player (keep audio playing) with a floating toggle button on the player UI to switch back-and-forth directly, plus an optional screen overlay.

### Instagram
- **Following Feed** — Auto-redirect to the Following timeline instead of the algorithmic Home feed
- **Redirect to DMs** — Go straight to `/direct/inbox/` on open instead of the feed
- **Hide DMs** — Remove DM navigation and redirect away from the messages inbox
- **Hide Reels** — Remove Reels from navigation and auto-redirect away
- **Hide Explore** — Remove the Explore tab and auto-redirect
- **Conflict Resolution** — Choose redirect target (Profile or Saved) when both "Redirect to DMs" and "Hide DMs" are enabled simultaneously

### Global
- **Master toggle** — Enable/disable all blocking at once (Feed Free Active / Inactive)
- **Real-time sync** — Changes apply across all open tabs instantly
- **SPA-proof** — Works through client-side navigation without requiring a page reload
- **Firefox + Chrome** — Supports both browsers from the same codebase

---

## Installation

### Chrome / Chromium
```bash
npm install
npm run build:chrome
```
Load `dist/chrome/` as an unpacked extension at `chrome://extensions` (enable Developer mode first).

### Firefox
```bash
npm install
npm run build:firefox
```
Load `dist/firefox/manifest.json` via `about:debugging` → This Firefox → Load Temporary Add-on.

---

## Development

```bash
npm run dev               # Chrome dev server with HMR (load dist/chrome/)
npm run dev:firefox       # Firefox dev server
npm run dev:reload        # Chrome watch build (manual reload)
npm run build             # Build both Chrome + Firefox
npm run typecheck         # TypeScript check
npm test                  # Run tests
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Chrome MV3 / Firefox MV3 |
| Bundler | Vite 6 + CRXJS Vite Plugin |
| UI | React 19 + Zustand 5 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5 |

---

## Project Structure

```
src/
├── background/        # Service worker (storage init)
├── bootstrap/         # document_start anti-flicker script
├── config/            # Default state values, CSS selectors
├── content/
│   ├── shared/        # Injector (style element), Patron (URL poller)
│   ├── youtube/       # YouTube content script + CSS rules
│   └── instagram/     # Instagram content script + CSS rules
├── popup/             # React popup UI
│   └── components/    # Toggle, Row, platform panels
├── types/             # TypeScript definitions
└── utils/             # chrome.storage wrapper + migration

manifest.json          # Chrome manifest (MV3)
vite.config.ts         # Vite build config (dynamically builds Firefox manifest)
```

---

## How It Works

### Semantic CSS Selectors
Social media platforms (especially Instagram) use obfuscated, dynamically generated CSS classes that change frequently with code updates. To maintain durability and prevent breaks, Feed Free targets stable structural selectors—such as tag names, attribute selectors (e.g. `a[href^="/reels"]`), and ARIA labels (e.g. `svg[aria-label="Reels"]`)—rather than raw CSS class names.

### CSS Injection
Uses dynamic `<style>` tag element injection appended directly to the `document.documentElement`. This ensures maximum compatibility across browser platforms (Chrome and Firefox) and handles CSS updates natively in isolated MV3 worlds without requiring page reloads. 

### State Management
Three-layer sync for reliability:
1. **Message broadcasting** — Popup sends state directly to all matching content scripts via `chrome.tabs.sendMessage`
2. **Storage change listener** — `chrome.storage.onChanged` catches cross-tab updates instantly
3. **Polling fallback** — Content scripts poll `chrome.storage.local` every 2 seconds via `setInterval` (catches cases where message delivery fails)

### SPA Navigation Detection
`DOMPatron` uses a `MutationObserver` mapped strictly to URL changes to instantly detect SPA navigations. We deliberately decouple the observer trigger from our CSS style injections to prevent infinite mutation loops while guaranteeing zero-delay instant filtering, even when returning to an idle tab.

### Anti-Flicker
A `document_start` content script (`bootstrap/antiflicker.ts`) loads the saved state synchronously and injects a `<style>` block to hide feed elements **before the page renders**. The main content script removes this style once it takes over with the dynamically injected style tag.

### Heartbeat Recovery
A 3-second `setInterval` in each content script periodically re-applies CSS rules. This catches edge cases where page scripts override or flush the injected stylesheet.

---

## Acknowledgements
- [IG Plus Extension](https://github.com/ptjaworski/igplus-extension) —for Instagram architecture.

---

## Troubleshooting

> [!IMPORTANT]
> **Extension Not Working?**  
> For any issue with the extension not working or functioning correctly:
> **_The Fix_**: **Force reload** the webpage (YouTube/Instagram). If it still doesn't work after this, kindly report the issue.

---

## Roadmap

### Phase 2 — The Unified Unbiased Engine *(Core Feature)*
The main upcoming feature is a shared data engine that feeds unmanipulated, randomly discovered, or educational content to both platforms, creating a custom Unbiased Feed!
- **YouTube Injection**: Pull unbiased videos and Shorts into a custom home feed.
- **Instagram Side-Injection**: Inject random educational content (or cross-platform YouTube Shorts) directly into the Instagram interface, or to any other platform.
- **Architecture Designed for Expansion**: The engine's data pipeline will feed into any supported platform beyond YouTube and Instagram.

### Phase 3 — The Lock *(Behavioral Control)*
Add intentional friction to your social media usage for a true digital detox.

> *Note: These are just a basic theoretical outline. Features may be reimagined or changed entirely as development continues. (Open to new ideas and suggestions!)*

---

## License

MIT
