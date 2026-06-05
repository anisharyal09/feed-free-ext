import { loadState, onStateChanged, pollState } from '../../utils/storage'
import { updateStyles, unmountAll, removeAntiflicker } from '../shared/injector'
import { DOMPatron } from '../shared/patron'
import { getActiveRules } from './rules'
import type { FeedFreeState } from '../../types'

const log = console.log.bind(console, '[FeedFree:YouTube]')
const err = console.error.bind(console, '[FeedFree:YouTube]')

let patrol: DOMPatron | null = null
let currentState: FeedFreeState | null = null
let initialized = false
let pendingState: FeedFreeState | null = null
let heartbeat: ReturnType<typeof setInterval> | null = null

function applyRules(state: FeedFreeState): void {
  currentState = state
  const rules = getActiveRules(state)
  log('applyRules — globalEnabled:', state.globalEnabled, 'activeRules:', rules.map(r => r.name))
  try {
    updateStyles(rules)
    removeAntiflicker()
  } catch (e) {
    err('applyRules failed:', e)
  }
}

function teardownAll(): void {
  unmountAll()
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
      const rules = getActiveRules(currentState)
      if (rules.length === 0) return
      log('Heartbeat — re-applying rules')
      updateStyles(rules)
    } catch (e) {
      err('Heartbeat failed:', e)
    }
  }, 3000)
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
