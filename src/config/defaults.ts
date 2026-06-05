import type { FeedFreeState, YouTubeState, InstagramState } from '../types'

export const CURRENT_VERSION = '1.0.0'

export const DEFAULT_YOUTUBE: YouTubeState = {
  nukeHomeFeed: false,
  nukeShorts: false,
  nukeSidebarRecs: false,
  nukeComments: false,
  musicOnlyMode: false,
}

export const DEFAULT_INSTAGRAM: InstagramState = {
  forceChronological: false,
  nukeMainFeed: false,
  nukeReels: false,
  nukeExplore: false,
  blockDMs: false,
  conflictRedirectTarget: 'profile',
}

export function createDefaultState(): FeedFreeState {
  return {
    version: CURRENT_VERSION,
    globalEnabled: true,
    youtube: { ...DEFAULT_YOUTUBE },
    instagram: { ...DEFAULT_INSTAGRAM },
  }
}

export const STORAGE_KEY = 'feedFreeState'
