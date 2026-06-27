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
let musicToggleHiddenForSession = false

const DEFAULT_MUSIC_TOGGLE_POSITION = {
  x: 0.96,
  y: 0.04,
}

const MUSIC_TOGGLE_EDGE_MARGIN = 12
const MUSIC_TOGGLE_DRAG_THRESHOLD = 4
const MUSIC_TOGGLE_SNAP_MS = 160

type MusicToggleElement = HTMLButtonElement & {
  __ffDragAttached?: boolean
  __ffSuppressClick?: boolean
  __ffIsDragging?: boolean
}

type MusicDragState = {
  dragging: boolean
  startPointerX: number
  startPointerY: number
  pointerId: number | null
  frameId: number | null
  latestLeft: number
  latestTop: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getMusicToggleBounds(player: HTMLElement, button?: HTMLElement): {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
} {
  const playerRect = player.getBoundingClientRect()
  const buttonRect = button?.getBoundingClientRect()
  const buttonWidth = buttonRect?.width || button?.offsetWidth || 124
  const buttonHeight = buttonRect?.height || button?.offsetHeight || 32
  const halfWidth = buttonWidth / 2
  const halfHeight = buttonHeight / 2
  const minX = MUSIC_TOGGLE_EDGE_MARGIN + halfWidth
  const maxX = Math.max(minX, playerRect.width - MUSIC_TOGGLE_EDGE_MARGIN - halfWidth)
  const minY = MUSIC_TOGGLE_EDGE_MARGIN + halfHeight
  const maxY = Math.max(minY, playerRect.height - MUSIC_TOGGLE_EDGE_MARGIN - halfHeight)

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: playerRect.width || 1,
    height: playerRect.height || 1,
  }
}

function getMusicTogglePosition(state: FeedFreeState): { x: number; y: number } {
  const position = state.youtube.musicOnlyTogglePosition ?? DEFAULT_MUSIC_TOGGLE_POSITION
  return {
    x: clamp(position.x, 0.02, 0.98),
    y: clamp(position.y, 0.02, 0.98),
  }
}

async function saveMusicTogglePosition(x: number, y: number): Promise<void> {
  try {
    const s = await loadState()
    s.youtube.musicOnlyTogglePosition = {
      x: clamp(x, 0.02, 0.98),
      y: clamp(y, 0.02, 0.98),
    }
    await saveState(s)
  } catch (err) {
    console.error('[FeedFree:YouTube] Failed to save musicOnlyTogglePosition:', err)
  }
}

function applyMusicTogglePosition(button: HTMLElement, player: HTMLElement, state: FeedFreeState): void {
  if ((button as MusicToggleElement).__ffIsDragging) return

  const { x, y } = getMusicTogglePosition(state)
  const bounds = getMusicToggleBounds(player, button)
  const left = bounds.minX + ((bounds.maxX - bounds.minX) * x)
  const top = bounds.minY + ((bounds.maxY - bounds.minY) * y)

  button.style.left = `${left}px`
  button.style.top = `${top}px`
  button.style.right = 'auto'
  button.style.bottom = 'auto'
  button.style.transform = 'translate(-50%, -50%)'
}

function attachMusicToggleDrag(
  button: MusicToggleElement,
  player: HTMLElement,
): void {
  if (button.__ffDragAttached) return

  const dragState: MusicDragState = {
    dragging: false,
    startPointerX: 0,
    startPointerY: 0,
    pointerId: null,
    frameId: null,
    latestLeft: 0,
    latestTop: 0,
  }

  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    dragState.dragging = false
    dragState.pointerId = event.pointerId
    dragState.startPointerX = event.clientX
    dragState.startPointerY = event.clientY
    const bounds = getMusicToggleBounds(player, button)
    dragState.latestLeft = clamp(event.clientX - player.getBoundingClientRect().left, bounds.minX, bounds.maxX)
    dragState.latestTop = clamp(event.clientY - player.getBoundingClientRect().top, bounds.minY, bounds.maxY)
    button.__ffIsDragging = true
    button.classList.add('ff-dragging')
    button.style.transition = 'none'
    button.setPointerCapture(event.pointerId)
  })

  button.addEventListener('pointermove', (event) => {
    if (dragState.pointerId !== event.pointerId) return
    const deltaX = Math.abs(event.clientX - dragState.startPointerX)
    const deltaY = Math.abs(event.clientY - dragState.startPointerY)
    if (!dragState.dragging && (deltaX > MUSIC_TOGGLE_DRAG_THRESHOLD || deltaY > MUSIC_TOGGLE_DRAG_THRESHOLD)) {
      dragState.dragging = true
      button.style.cursor = 'grabbing'
    }
    if (!dragState.dragging) return
    event.preventDefault()

    const rect = player.getBoundingClientRect()
    const bounds = getMusicToggleBounds(player, button)
    dragState.latestLeft = clamp(event.clientX - rect.left, bounds.minX, bounds.maxX)
    dragState.latestTop = clamp(event.clientY - rect.top, bounds.minY, bounds.maxY)
    button.style.left = `${dragState.latestLeft}px`
    button.style.top = `${dragState.latestTop}px`
  })

  button.addEventListener('pointerup', async (event) => {
    if (dragState.pointerId !== event.pointerId) return
    const bounds = getMusicToggleBounds(player, button)
    const leftPx = Number.parseFloat(button.style.left || `${dragState.latestLeft}`)
    const topPx = Number.parseFloat(button.style.top || `${dragState.latestTop}`)
    const clampedLeft = clamp(leftPx, bounds.minX, bounds.maxX)
    const clampedTop = clamp(topPx, bounds.minY, bounds.maxY)
    const nextX = clamp((clampedLeft - bounds.minX) / (bounds.maxX - bounds.minX || 1), 0, 1)
    const nextY = clamp((clampedTop - bounds.minY) / (bounds.maxY - bounds.minY || 1), 0, 1)

    if (dragState.dragging) {
      button.__ffSuppressClick = true
      button.style.transition = `left ${MUSIC_TOGGLE_SNAP_MS}ms ease-out, top ${MUSIC_TOGGLE_SNAP_MS}ms ease-out, transform ${MUSIC_TOGGLE_SNAP_MS}ms ease-out`
      button.style.left = `${clampedLeft}px`
      button.style.top = `${clampedTop}px`
      await saveMusicTogglePosition(nextX, nextY)
    }

    dragState.dragging = false
    dragState.pointerId = null
    button.__ffIsDragging = false
    if (dragState.frameId !== null) {
      window.cancelAnimationFrame(dragState.frameId)
      dragState.frameId = null
    }
    button.classList.remove('ff-dragging')
    window.setTimeout(() => {
      if (!button.classList.contains('ff-dragging')) {
        button.style.transition = ''
      }
    }, MUSIC_TOGGLE_SNAP_MS)
    button.style.cursor = 'pointer'
    try {
      button.releasePointerCapture(event.pointerId)
    } catch { }
  })

  button.addEventListener('pointercancel', (event) => {
    if (dragState.pointerId !== event.pointerId) return
    dragState.dragging = false
    dragState.pointerId = null
    button.__ffIsDragging = false
    if (dragState.frameId !== null) {
      window.cancelAnimationFrame(dragState.frameId)
      dragState.frameId = null
    }
    button.classList.remove('ff-dragging')
    button.style.transition = ''
    button.style.cursor = 'pointer'
    try {
      button.releasePointerCapture(event.pointerId)
    } catch { }
  })

  button.addEventListener('click', (event) => {
    if (!button.__ffSuppressClick) return
    button.__ffSuppressClick = false
    event.preventDefault()
    event.stopPropagation()
  }, true)

  button.__ffDragAttached = true
}

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
        background-color: transparent;
        z-index: 2000;
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
      .ff-music-btn:focus-visible,
      #ff-music-toggle-btn:focus-visible {
        outline: 2px solid rgba(16, 185, 129, 0.8);
        outline-offset: 2px;
      }
      #ff-music-toggle-btn {
        position: absolute;
        top: 0;
        left: 0;
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
        z-index: 999999;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        pointer-events: auto;
        user-select: none;
        touch-action: none;
        will-change: left, top, transform;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif;
        white-space: nowrap;
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
      .ff-music-no-overlay .ytp-chrome-bottom,
      .ff-music-no-overlay .ytp-chrome-top,
      .ff-music-no-overlay .ytp-gradient-bottom,
      .ff-music-no-overlay .ytp-gradient-top,
      .ff-music-no-overlay .ytp-large-play-button,
      .ff-music-no-overlay .ytp-bezel {
        display: none !important;
      }
      #ff-music-toggle-btn.ff-dragging {
        cursor: grabbing;
        transition: none;
        opacity: 1 !important;
        transform: translate(-50%, -50%) scale(1.02);
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
    player?.classList.remove('ff-music-no-overlay')
    return
  }

  // Manage no-overlay class for hiding native controls
  if (isMusicOnly && !showOverlay) {
    player.classList.add('ff-music-no-overlay')
  } else {
    player.classList.remove('ff-music-no-overlay')
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
      title.textContent = 'Audio Only Mode Active'

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
    if (musicToggleHiddenForSession) {
      existingToggle?.remove()
      return
    }

    if (!existingToggle) {
      const toggleBtn = document.createElement('button')
      const musicToggleButton = toggleBtn as MusicToggleElement
      toggleBtn.id = 'ff-music-toggle-btn'
      toggleBtn.title = 'Drag to move. Alt+click hides this button until refresh.'
      toggleBtn.setAttribute('aria-label', isMusicOnly ? 'Switch to Video' : 'Enable Audio Mode')
      toggleBtn.innerHTML = `
        <svg class="ff-music-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; margin-right: 2px;">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        <span>${isMusicOnly ? 'Switch to Video' : 'Audio Mode'}</span>
      `

      player.appendChild(toggleBtn)
      applyMusicTogglePosition(musicToggleButton, player, state)
      attachMusicToggleDrag(musicToggleButton, player)

      toggleBtn.onclick = async (e) => {
        if (e.altKey) {
          e.preventDefault()
          e.stopPropagation()
          musicToggleHiddenForSession = true
          toggleBtn.remove()
          return
        }

        if (musicToggleButton.__ffSuppressClick) {
          musicToggleButton.__ffSuppressClick = false
          return
        }
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
    } else {
      if (existingToggle.parentNode !== player) {
        player.appendChild(existingToggle)
      }
      if (!(existingToggle as MusicToggleElement).__ffIsDragging) {
        applyMusicTogglePosition(existingToggle as HTMLElement, player, state)
        const span = existingToggle.querySelector('span')
        if (span) {
          span.textContent = isMusicOnly ? 'Switch to Video' : 'Audio Mode'
          existingToggle.setAttribute('aria-label', isMusicOnly ? 'Switch to Video' : 'Enable Audio Mode')
        }
      }
    }
  } else {
    existingToggle?.remove()
  }
}

function injectShadowStyles(state: FeedFreeState): void {
  if (!state.globalEnabled) return

  try {
    const cssLines: string[] = []

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

    const shadowRoots: ShadowRoot[] = []
    const traverse = (current: Document | ShadowRoot) => {
      try {
        const elements = current.querySelectorAll('*')
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i]
          if (el.shadowRoot) {
            shadowRoots.push(el.shadowRoot)
            traverse(el.shadowRoot)
          }
        }
      } catch (e) {
        err('Error querying shadow roots:', e)
      }
    }

    traverse(document)

    shadowRoots.forEach((shadow) => {
      ensureStyleInShadow(shadow)
    })
  } catch (e) {
    err('injectShadowStyles failed:', e)
  }
}

let cleanupInterval: ReturnType<typeof setInterval> | null = null

function restoreYouTubeEndScreensJS(): void {
  try {
    const elements = document.querySelectorAll(END_SCREEN_SELECTORS)
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
    const elements = document.querySelectorAll(END_SCREEN_SELECTORS)
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

let lastShownQuery: string | null = null
let currentToastElement: HTMLDivElement | null = null

function checkAndShowShortsSearchNotification(): void {
  if (!currentState?.globalEnabled) return
  if (!currentState.youtube.nukeSearchShorts) {
    if (currentToastElement) {
      currentToastElement.remove()
      currentToastElement = null
    }
    return
  }

  // Dismiss if navigate away from search
  if (location.pathname !== '/results') {
    if (currentToastElement) {
      currentToastElement.remove()
      currentToastElement = null
    }
    return
  }

  const searchParams = new URLSearchParams(location.search)
  const query = searchParams.get('search_query') || ''
  if (!query) return

  // Prevent multiple popups for same query
  if (lastShownQuery === query) return

  // Wait a moment for search results to load
  setTimeout(() => {
    if (location.pathname !== '/results') return
    const currentParams = new URLSearchParams(location.search)
    if (currentParams.get('search_query') !== query) return

    let hasHiddenShorts = false
    try {
      const renderers = document.querySelectorAll('ytd-video-renderer, ytd-reel-shelf-renderer, ytd-compact-video-renderer, ytd-reel-item-renderer, yt-reel-item-renderer, grid-shelf-view-model, ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2')
      for (let i = 0; i < renderers.length; i++) {
        const r = renderers[i]
        const tag = r.tagName.toUpperCase()
        if (
          tag === 'YTD-REEL-SHELF-RENDERER' ||
          tag === 'YTD-REEL-ITEM-RENDERER' ||
          tag === 'YT-REEL-ITEM-RENDERER' ||
          tag === 'GRID-SHELF-VIEW-MODEL' ||
          tag === 'YTM-SHORTS-LOCKUP-VIEW-MODEL' ||
          tag === 'YTM-SHORTS-LOCKUP-VIEW-MODEL-V2' ||
          r.querySelector('a[href^="/shorts"], a[href*="/shorts/"]')
        ) {
          hasHiddenShorts = true
          break
        }
      }
    } catch { }

    if (hasHiddenShorts) {
      lastShownQuery = query
      showShortsNotification()
    }
  }, 1800)
}

function showShortsNotification(): void {
  if (document.getElementById('ff-shorts-toast')) return

  const toast = document.createElement('div')
  toast.id = 'ff-shorts-toast'

  const isDark = document.documentElement.hasAttribute('dark') ||
    document.querySelector('html')?.getAttribute('system-tracker') === 'dark' ||
    getComputedStyle(document.body).backgroundColor !== 'rgb(255, 255, 255)'

  Object.assign(toast.style, {
    position: 'fixed',
    top: '90px',
    left: '50%',
    transform: 'translateX(-50%) translateY(-20px)',
    backgroundColor: isDark ? '#212121' : '#ffffff',
    color: isDark ? '#ffffff' : '#0f0f0f',
    padding: '12px 18px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'Roboto, Arial, sans-serif',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    opacity: '0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'auto',
  })

  const textNode = document.createElement('span')
  textNode.textContent = "Shorts results were hidden. Disable 'Hide Search Shorts' in Feed Free to see them."
  toast.appendChild(textNode)

  const dismissBtn = document.createElement('button')
  dismissBtn.textContent = 'Dismiss'
  Object.assign(dismissBtn.style, {
    background: 'none',
    border: 'none',
    color: '#3ea6ff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    padding: '0 4px',
    outline: 'none',
  })

  const dismissToast = () => {
    clearTimeout(autoDismissTimer)
    toast.style.transform = 'translateX(-50%) translateY(-20px)'
    toast.style.opacity = '0'
    setTimeout(() => {
      toast.remove()
      if (currentToastElement === toast) {
        currentToastElement = null
      }
    }, 300)
  }

  dismissBtn.addEventListener('click', dismissToast)
  toast.appendChild(dismissBtn)

  document.body.appendChild(toast)
  currentToastElement = toast

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)'
    toast.style.opacity = '1'
  })

  const autoDismissTimer = setTimeout(dismissToast, 6000)
}

function applyRules(state: FeedFreeState): void {
  currentState = state
  if (!state.globalEnabled) return

  const rules = getActiveRules(state)
  log('applyRules — globalEnabled:', state.globalEnabled, 'activeRules:', rules.map(r => r.name))
  try {
    const stylesChanged = updateStyles(rules)
    removeAntiflicker()
    manageMusicOverlay(state)
    injectShadowStyles(state)
    hideYouTubeEndScreensJS()
    checkAndShowShortsSearchNotification()
    if (stylesChanged) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 100)
    }
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
  if (currentToastElement) {
    currentToastElement.remove()
    currentToastElement = null
  }
  const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player')
  player?.classList.remove('ff-music-no-overlay')
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
  try {
    const shadowRoots: ShadowRoot[] = []
    const traverse = (current: Document | ShadowRoot) => {
      const elements = current.querySelectorAll('*')
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i]
        if (el.shadowRoot) {
          shadowRoots.push(el.shadowRoot)
          traverse(el.shadowRoot)
        }
      }
    }
    traverse(document)

    shadowRoots.forEach((shadow) => {
      shadow.getElementById('ff-shadow-styles')?.remove()
    })
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
