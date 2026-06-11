import { loadState, onStateChanged, pollState, saveState } from '../../utils/storage'
import { updateStyles, unmountAll, removeAntiflicker } from '../shared/injector'
import { DOMPatron } from '../shared/patron'
import { getActiveRules } from './rules'
import type { FeedFreeState } from '../../types'

const log = console.log.bind(console, '[FeedFree:YouTube]')
const err = console.error.bind(console, '[FeedFree:YouTube]')

const END_SCREEN_SELECTORS = '.ytp-ce-element, .ytp-endscreen, .html5-endscreen, .ytp-upnext, .ytp-ce-covering-overlay, .ytp-ce-covering-image, .ytp-videowall-still, .ytp-modern-videowall-still, .ytp-suggestion-set, .ytp-fullscreen-grid-main-content, .ytp-fullscreen-grid-stills-container'

let patrol: DOMPatron | null = null
let currentState: FeedFreeState | null = null
let initialized = false
let pendingState: FeedFreeState | null = null
let heartbeat: ReturnType<typeof setInterval> | null = null
function manageMusicOverlay(state: FeedFreeState): void {
  const isGlobalEnabled = state.globalEnabled
  const isMusicOnly = isGlobalEnabled && state.youtube.musicOnlyMode
  const showOverlay = isGlobalEnabled && state.youtube.musicOnlyShowOverlay

  const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player')
  const existingOverlay = document.getElementById('ff-music-overlay')
  const existingToggle = document.getElementById('ff-music-toggle-btn')

  // Helper to ensure style injection
  const styleId = 'ff-music-ui-style'
  if (isGlobalEnabled && !document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      #ff-music-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #000000;
        z-index: 67;
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif;
        box-sizing: border-box;
      }
      .ff-music-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        pointer-events: auto;
      }
      .ff-wave-container {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 6px;
        height: 40px;
        margin-bottom: 8px;
      }
      .ff-wave-bar {
        width: 4px;
        height: 100%;
        background-color: #10b981;
        border-radius: 2px;
        transform-origin: bottom;
        animation: ff-bounce 1.2s ease-in-out infinite;
      }
      .ff-paused .ff-wave-bar {
        animation-play-state: paused;
      }
      @keyframes ff-bounce {
        0%, 100% { transform: scaleY(0.25); }
        50% { transform: scaleY(1); }
      }
      .ff-music-title {
        color: #f8fafc;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.01em;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }
      .ff-music-btn {
        padding: 8px 16px;
        background-color: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #e2e8f0;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
      }
      .ff-music-btn:hover {
        background-color: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
        color: #ffffff;
        transform: translateY(-1px);
      }
      .ff-music-btn:active {
        transform: translateY(0);
      }
      #ff-music-toggle-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background-color: rgba(9, 13, 22, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(8px);
        color: #f8fafc;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        z-index: 67;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif;
      }
      #movie_player:hover #ff-music-toggle-btn,
      .html5-video-player:hover #ff-music-toggle-btn {
        opacity: 0.9;
      }
      #ff-music-toggle-btn:hover {
        opacity: 1 !important;
        background-color: rgba(9, 13, 22, 0.95);
        border-color: rgba(16, 185, 129, 0.4);
        transform: scale(1.05);
      }
      #ff-music-toggle-btn:active {
        transform: scale(0.95);
      }
    `
    document.documentElement.appendChild(style)
  }

  const syncAnimationState = () => {
    const overlay = document.getElementById('ff-music-overlay')
    if (!overlay) return
    const video = document.querySelector('#movie_player video') as HTMLVideoElement | null
    const isPaused = video ? video.paused : true
    if (isPaused) {
      overlay.classList.add('ff-paused')
    } else {
      overlay.classList.remove('ff-paused')
    }
  }

  if (!isGlobalEnabled || !player) {
    existingOverlay?.remove()
    existingToggle?.remove()
    return
  }

  // 1. Manage Music Overlay (Only if music mode is active AND showOverlay is true)
  if (isMusicOnly && showOverlay) {
    if (!existingOverlay) {
      const overlay = document.createElement('div')
      overlay.id = 'ff-music-overlay'

      const content = document.createElement('div')
      content.className = 'ff-music-content'

      const waveContainer = document.createElement('div')
      waveContainer.className = 'ff-wave-container'

      const barDelays = ['0.1s', '0.4s', '0.2s', '0.6s', '0.3s']
      for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div')
        bar.className = 'ff-wave-bar'
        bar.style.animationDelay = barDelays[i]
        waveContainer.appendChild(bar)
      }

      const title = document.createElement('h3')
      title.className = 'ff-music-title'
      title.textContent = 'Music Only Mode Active'

      const button = document.createElement('button')
      button.className = 'ff-music-btn'
      button.textContent = 'Switch to Video'
      button.onclick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        try {
          const s = await loadState()
          s.youtube.musicOnlyMode = false
          await saveState(s)
        } catch (err) {
          console.error('[FeedFree:YouTube] Failed to disable musicOnlyMode:', err)
        }
      }

      content.appendChild(waveContainer)
      content.appendChild(title)
      content.appendChild(button)
      overlay.appendChild(content)
      player.appendChild(overlay)
    } else {
      if (existingOverlay.parentNode !== player) {
        player.appendChild(existingOverlay)
      }
    }

    // Bind event listeners to video play/pause to sync visualizer animation state
    const video = document.querySelector('#movie_player video') as HTMLVideoElement & { __ffListenersAttached?: boolean } | null
    if (video) {
      if (!video.__ffListenersAttached) {
        video.__ffListenersAttached = true
        video.addEventListener('play', syncAnimationState)
        video.addEventListener('playing', syncAnimationState)
        video.addEventListener('pause', syncAnimationState)
        video.addEventListener('ended', syncAnimationState)
      }
      syncAnimationState()
    }
  } else {
    existingOverlay?.remove()
  }

  // 2. Manage Floating Toggle Button
  // Show toggle if Music Mode is OFF, OR if Music Mode is ON but we choose a pure black screen (showOverlay is false)
  const shouldShowToggle = !isMusicOnly || (isMusicOnly && !showOverlay)

  if (shouldShowToggle) {
    if (!existingToggle) {
      const toggleBtn = document.createElement('button')
      toggleBtn.id = 'ff-music-toggle-btn'
      toggleBtn.innerHTML = `
        <svg class="ff-music-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; margin-right: 2px;">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        <span>${isMusicOnly ? 'Switch to Video' : 'Music Mode'}</span>
      `

      toggleBtn.onclick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        try {
          const s = await loadState()
          s.youtube.musicOnlyMode = !s.youtube.musicOnlyMode
          await saveState(s)
        } catch (err) {
          console.error('[FeedFree:YouTube] Failed to toggle musicOnlyMode:', err)
        }
      }

      player.appendChild(toggleBtn)
    } else {
      if (existingToggle.parentNode !== player) {
        player.appendChild(existingToggle)
      }
      const span = existingToggle.querySelector('span')
      if (span) {
        span.textContent = isMusicOnly ? 'Switch to Video' : 'Music Mode'
      }
    }
  } else {
    existingToggle?.remove()
  }
}

const shadowObservers = new WeakMap<ShadowRoot, MutationObserver>()

function injectShadowStyles(state: FeedFreeState): void {
  try {
    const cssLines: string[] = []

    if (state.globalEnabled) {
      if (state.youtube.nukeEndScreens) {
        cssLines.push(`
          .ytp-ce-element,
          .ytp-ce-element-show,
          .ytp-endscreen,
          .html5-endscreen,
          .ytp-endscreen-content,
          .ytp-upnext,
          .ytp-upnext-autoplay-icon,
          .ytp-ce-covering-overlay,
          .ytp-ce-covering-image,
          .ytp-videowall-still,
          .ytp-modern-videowall-still,
          .ytp-suggestion-set,
          .ytp-fullscreen-grid-main-content,
          .ytp-fullscreen-grid-stills-container {
            display: none !important;
          }
        `)
      }

      if (state.youtube.musicOnlyMode) {
        cssLines.push(`
          video {
            opacity: 0 !important;
          }
          .html5-video-container {
            background: #000 !important;
          }
          #movie_player {
            background-color: #000 !important;
          }
        `)
      }
    }

    const css = cssLines.join('\n')
    const styleId = 'ff-shadow-styles'

    const ensureStyleInShadow = (shadow: ShadowRoot) => {
      let styleEl = shadow.getElementById(styleId) as HTMLStyleElement | null
      if (cssLines.length === 0) {
        styleEl?.remove()
      } else {
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = styleId
          styleEl.textContent = css
          shadow.appendChild(styleEl)
        } else if (styleEl.textContent !== css) {
          styleEl.textContent = css
        }
      }
    }

    const findAndInject = (node: Node) => {
      if (node instanceof HTMLElement) {
        const shadow = node.shadowRoot
        if (shadow) {
          ensureStyleInShadow(shadow)

          if (!shadowObservers.has(shadow)) {
            const observer = new MutationObserver(() => {
              if (currentState) {
                ensureStyleInShadow(shadow)
              }
            })
            observer.observe(shadow, { childList: true, subtree: true })
            shadowObservers.set(shadow, observer)
          }

          shadow.childNodes.forEach(findAndInject)
        }
      }
      node.childNodes.forEach(findAndInject)
    }

    findAndInject(document.documentElement)
  } catch (e) {
    err('injectShadowStyles failed:', e)
  }
}

let cleanupInterval: ReturnType<typeof setInterval> | null = null

function querySelectorsAllShadow(selector: string, root: Document | ShadowRoot | Element = document): Element[] {
  const elements: Element[] = []
  try {
    elements.push(...Array.from(root.querySelectorAll(selector)))
  } catch { }

  const traverse = (node: Node) => {
    if (node instanceof HTMLElement) {
      const shadow = node.shadowRoot
      if (shadow) {
        try {
          elements.push(...Array.from(shadow.querySelectorAll(selector)))
        } catch { }
        shadow.childNodes.forEach(traverse)
      }
    }
    node.childNodes.forEach(traverse)
  }

  traverse(root)
  return elements
}

function restoreYouTubeEndScreensJS(): void {
  try {
    const elements = querySelectorsAllShadow(END_SCREEN_SELECTORS)
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (htmlEl.style.display === 'none') {
        htmlEl.style.removeProperty('display')
      }
    })
  } catch (e) {
    err('restoreYouTubeEndScreensJS failed:', e)
  }
}

function hideYouTubeEndScreensJS(): void {
  if (!currentState?.globalEnabled || !currentState?.youtube.nukeEndScreens) {
    restoreYouTubeEndScreensJS()
    return
  }

  try {
    const elements = querySelectorsAllShadow(END_SCREEN_SELECTORS)
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (htmlEl.style.display !== 'none') {
        htmlEl.style.setProperty('display', 'none', 'important')
      }
    })
  } catch (e) {
    err('hideYouTubeEndScreensJS failed:', e)
  }
}

function applyRules(state: FeedFreeState): void {
  currentState = state
  const rules = getActiveRules(state)
  log('applyRules — globalEnabled:', state.globalEnabled, 'activeRules:', rules.map(r => r.name))
  try {
    updateStyles(rules)
    removeAntiflicker()
    manageMusicOverlay(state)
    injectShadowStyles(state)
    hideYouTubeEndScreensJS()
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 100)
  } catch (e) {
    err('applyRules failed:', e)
  }
}

function teardownAll(): void {
  unmountAll()
  restoreYouTubeEndScreensJS()
  document.getElementById('ff-music-overlay')?.remove()
  document.getElementById('ff-music-toggle-btn')?.remove()
  document.getElementById('ff-music-ui-style')?.remove()
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
  try {
    const removeShadowStyles = (node: Node) => {
      if (node instanceof HTMLElement) {
        const shadow = node.shadowRoot
        if (shadow) {
          shadow.getElementById('ff-shadow-styles')?.remove()
          const obs = shadowObservers.get(shadow)
          if (obs) {
            obs.disconnect()
          }
          shadow.childNodes.forEach(removeShadowStyles)
        }
      }
      node.childNodes.forEach(removeShadowStyles)
    }
    removeShadowStyles(document.documentElement)
  } catch (e) {
    err('Failed to clean shadow styles:', e)
  }
  patrol?.disconnect()
  patrol = null
  if (heartbeat !== null) {
    clearInterval(heartbeat)
    heartbeat = null
  }
}

function setupPatron(): void {
  if (patrol) return
  patrol = new DOMPatron(() => {
    try {
      if (currentState) {
        log('Patron detected URL change, reapplying rules')
        applyRules(currentState)
      }
    } catch (e) {
      err('Patron callback failed:', e)
    }
  })
  patrol.start()
}

function setupHeartbeat(): void {
  if (heartbeat) return
  heartbeat = setInterval(() => {
    try {
      if (!currentState?.globalEnabled) return
      manageMusicOverlay(currentState)
      injectShadowStyles(currentState)
      hideYouTubeEndScreensJS()

      const rules = getActiveRules(currentState)
      if (rules.length === 0) return
      log('Heartbeat — re-applying rules')
      updateStyles(rules)
    } catch (e) {
      err('Heartbeat failed:', e)
    }
  }, 3000)
}

function setupCleanupInterval(): void {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    if (currentState?.globalEnabled) {
      hideYouTubeEndScreensJS()
    }
  }, 1000)
}

function handleStateChange(state: FeedFreeState): void {
  try {
    if (!initialized) {
      pendingState = state
      log('Queued state during init — globalEnabled:', state.globalEnabled)
      return
    }

    log('handleStateChange — globalEnabled:', state.globalEnabled, 'youtube:', state.youtube)
    currentState = state

    if (!state.globalEnabled) {
      teardownAll()
      return
    }

    applyRules(state)
    setupPatron()
    setupHeartbeat()
    setupCleanupInterval()
  } catch (e) {
    err('handleStateChange failed:', e)
  }
}

function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse): boolean | undefined => {
    try {
      const msg = message as { type: string; state?: FeedFreeState }
      if (msg.type === 'feedfree:state' && msg.state) {
        log('onMessage received — has state:', msg.state.globalEnabled)
        handleStateChange(msg.state)
        sendResponse?.({ ok: true })
      }
    } catch (e) {
      err('onMessage handler failed:', e)
    }
    return undefined
  })
}

function onYouTubeNavigate(): void {
  try {
    if (currentState) {
      log('yt-navigate-finish fired, reapplying rules')
      applyRules(currentState)
    }
  } catch (e) {
    err('onYouTubeNavigate failed:', e)
  }
}

async function init(): Promise<void> {
  log('Content script starting...')

  setupMessageListener()

  try {
    const state = await loadState()
    log('State loaded:', state.globalEnabled, state.youtube)

    initialized = true

    if (pendingState) {
      log('Using pending state from message received during init')
      handleStateChange(pendingState)
      pendingState = null
    } else {
      currentState = state
      if (state.globalEnabled) {
        applyRules(state)
        setupPatron()
        setupHeartbeat()
        setupCleanupInterval()
      }
    }

    document.addEventListener('yt-navigate-finish', onYouTubeNavigate)
    onStateChanged(handleStateChange)
    pollState(handleStateChange)
    log('Content script initialized')
  } catch (e) {
    err('init failed:', e)
  }
}

init()
