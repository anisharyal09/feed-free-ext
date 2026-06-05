import { create } from 'zustand'
import type { FeedFreeState, YouTubeState, InstagramState } from '../types'
import { loadState, saveState, onStateChanged } from '../utils/storage'
import { createDefaultState } from '../config/defaults'

interface StoreState {
  state: FeedFreeState
  loaded: boolean
  init: () => Promise<void>
  setGlobal: (enabled: boolean) => Promise<void>
  setYouTube: (partial: Partial<YouTubeState>) => Promise<void>
  setInstagram: (partial: Partial<InstagramState>) => Promise<void>
  resetAll: () => Promise<void>
}

async function persist(
  current: FeedFreeState,
  patch: Partial<FeedFreeState>,
): Promise<FeedFreeState> {
  const next = { ...current, ...patch }
  await saveState(next)
  return next
}

async function broadcast(state: FeedFreeState): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({
      url: ['*://*.youtube.com/*', '*://*.instagram.com/*'],
    })
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'feedfree:state', state }).catch(() => {
          /* tab not ready — storage poll will pick it up */
        })
      }
    }
  } catch {
    /* host permissions not granted */
  }
}

export const useStore = create<StoreState>((set, get) => ({
  state: createDefaultState(),
  loaded: false,

  init: async () => {
    const state = await loadState()
    set({ state, loaded: true })

    onStateChanged((newState) => {
      set({ state: newState })
    })
  },

  setGlobal: async (enabled) => {
    const current = get().state
    const next = await persist(current, { globalEnabled: enabled })
    set({ state: next })
    broadcast(next)
  },

  setYouTube: async (partial) => {
    const current = get().state
    const next = await persist(current, {
      youtube: { ...current.youtube, ...partial },
    })
    set({ state: next })
    broadcast(next)
  },

  setInstagram: async (partial) => {
    const current = get().state
    const next = await persist(current, {
      instagram: { ...current.instagram, ...partial },
    })
    set({ state: next })
    broadcast(next)
  },

  resetAll: async () => {
    const defaults = createDefaultState()
    await saveState(defaults)
    set({ state: defaults })
    broadcast(defaults)
  },
}))
