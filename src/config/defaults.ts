import type { FeedFreeState, YouTubeState, InstagramState } from '../types'

export const CURRENT_VERSION = '1.2.0'

export const DEFAULT_YOUTUBE: YouTubeState = {
  nukeHomeFeed: false,
  nukeShorts: false,
  nukeSidebarRecs: false,
  nukeSidebar: false,
  nukeComments: false,
  nukeEndScreens: false,
  nukeSubscriptions: false,
  nukeExplore: false,
  nukeReportHistory: false,
  nukeMoreFromYouTube: false,
  musicOnlyMode: false,
  musicOnlyShowOverlay: true,
  grayMode: false,
  nukeShortsFromProfiles: false,
}

export const DEFAULT_INSTAGRAM: InstagramState = {
  forceChronological: false,
  nukeMainFeed: false,
  nukeReels: false,
  nukeExplore: false,
  blockDMs: false,
  conflictRedirectTarget: 'profile',
  grayMode: false,
  squareProfile: false,
  nukeNotifications: false,
  hideComments: false,
  nukeNotes: false,
  hideLikes: false,
  nukeStoriesHome: false,
  nukeStoriesEverywhere: false,
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
