export interface YouTubeState {
  nukeHomeFeed: boolean
  nukeShorts: boolean
  nukeSidebarRecs: boolean
  nukeComments: boolean
  musicOnlyMode: boolean
}

export interface InstagramState {
  forceChronological: boolean
  nukeMainFeed: boolean
  nukeReels: boolean
  nukeExplore: boolean
  blockDMs: boolean
  conflictRedirectTarget: 'profile' | 'saved'
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
