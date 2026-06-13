import type { FeedFreeState, YouTubeState, InstagramState } from '../types'

export const CURRENT_VERSION = '1.2.3'

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
  nukeNotifications: false,
  nukeMoreFromYouTube: false,
  musicOnlyTogglePosition: {
    x: 0.98,
    y: 0.08,
  },
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
  nukeDashboard: false,
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
