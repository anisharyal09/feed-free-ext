export interface YouTubeState {
  nukeHomeFeed: boolean
  nukeShorts: boolean
  nukeSidebarRecs: boolean
  nukeSidebar: boolean
  nukeComments: boolean
  nukeEndScreens: boolean
  nukeSubscriptions: boolean
  nukeExplore: boolean
  nukeReportHistory: boolean
  nukeNotifications: boolean
  nukeMoreFromYouTube: boolean
  musicOnlyTogglePosition: {
    x: number
    y: number
  }
  musicOnlyMode: boolean
  musicOnlyShowOverlay: boolean
  grayMode: boolean
  nukeShortsFromProfiles: boolean
}

export interface InstagramState {
  forceChronological: boolean
  nukeMainFeed: boolean
  nukeReels: boolean
  nukeExplore: boolean
  blockDMs: boolean
  conflictRedirectTarget: 'profile' | 'saved'
  grayMode: boolean
  squareProfile: boolean
  nukeNotifications: boolean
  hideComments: boolean
  nukeNotes: boolean
  hideLikes: boolean
  nukeStoriesHome: boolean
  nukeStoriesEverywhere: boolean
  nukeDashboard: boolean
}

export interface FeedFreeState {
  version: string
  globalEnabled: boolean
  youtube: YouTubeState
  instagram: InstagramState
}

export type Platform = 'youtube' | 'instagram'

export type TogglePath =
  | 'globalEnabled'
  | `youtube.${keyof YouTubeState}`
  | `instagram.${keyof InstagramState}`

export interface SelectorRule {
  selector: string
  fallbacks: string[]
  property: string
  value: string
}

export type SelectorMap = Record<string, SelectorRule | SelectorRule[]>
