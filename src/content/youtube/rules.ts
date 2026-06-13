import { getSelectorEntries } from '../../config/selectors'
import type { FeedFreeState, SelectorRule } from '../../types'

export type YouTubeRuleKey =
  | 'homeFeed'
  | 'shorts'
  | 'sidebarRecs'
  | 'sidebar'
  | 'comments'
  | 'musicOnly'
  | 'grayMode'
  | 'endScreens'
  | 'subscriptions'
  | 'explore'
  | 'reportHistory'
  | 'notifications'
  | 'moreFromYouTube'
  | 'shortsProfiles'

export interface ActiveRule {
  name: YouTubeRuleKey
  selectors: SelectorRule[]
}

const RULE_MAP: Record<YouTubeRuleKey, string> = {
  homeFeed: 'homeFeed',
  shorts: 'shorts',
  sidebarRecs: 'sidebarRecs',
  sidebar: 'sidebar',
  comments: 'comments',
  musicOnly: 'musicOnly',
  grayMode: 'grayMode',
  endScreens: 'endScreens',
  subscriptions: 'subscriptions',
  explore: 'explore',
  reportHistory: 'reportHistory',
  notifications: 'notifications',
  moreFromYouTube: 'moreFromYouTube',
  shortsProfiles: 'shortsProfiles',
}

export function getActiveRules(state: FeedFreeState): ActiveRule[] {
  const rules: ActiveRule[] = []

  const isHomepage = window.location.pathname === '/' || window.location.pathname === ''

  if (state.youtube.nukeHomeFeed && isHomepage) {
    rules.push({
      name: 'homeFeed',
      selectors: getSelectorEntries('youtube', RULE_MAP.homeFeed),
    })
  }
  if (state.youtube.nukeShorts) {
    rules.push({
      name: 'shorts',
      selectors: getSelectorEntries('youtube', RULE_MAP.shorts),
    })
  }
  if (state.youtube.nukeShortsFromProfiles) {
    rules.push({
      name: 'shortsProfiles',
      selectors: getSelectorEntries('youtube', RULE_MAP.shortsProfiles),
    })
  }
  if (state.youtube.nukeSidebarRecs) {
    rules.push({
      name: 'sidebarRecs',
      selectors: getSelectorEntries('youtube', RULE_MAP.sidebarRecs),
    })
  }
  if (state.youtube.nukeSidebar) {
    rules.push({
      name: 'sidebar',
      selectors: getSelectorEntries('youtube', RULE_MAP.sidebar),
    })
  }
  if (state.youtube.nukeComments) {
    rules.push({
      name: 'comments',
      selectors: getSelectorEntries('youtube', RULE_MAP.comments),
    })
  }
  if (state.youtube.nukeEndScreens) {
    rules.push({
      name: 'endScreens',
      selectors: getSelectorEntries('youtube', RULE_MAP.endScreens),
    })
  }
  if (state.youtube.nukeSubscriptions) {
    rules.push({
      name: 'subscriptions',
      selectors: getSelectorEntries('youtube', RULE_MAP.subscriptions),
    })
  }
  if (state.youtube.nukeExplore) {
    rules.push({
      name: 'explore',
      selectors: getSelectorEntries('youtube', RULE_MAP.explore),
    })
  }
  if (state.youtube.nukeReportHistory) {
    rules.push({
      name: 'reportHistory',
      selectors: getSelectorEntries('youtube', RULE_MAP.reportHistory),
    })
  }
  if (state.youtube.nukeNotifications) {
    rules.push({
      name: 'notifications',
      selectors: getSelectorEntries('youtube', RULE_MAP.notifications),
    })
  }
  if (state.youtube.nukeMoreFromYouTube) {
    rules.push({
      name: 'moreFromYouTube',
      selectors: getSelectorEntries('youtube', RULE_MAP.moreFromYouTube),
    })
  }
  if (state.youtube.musicOnlyMode) {
    rules.push({
      name: 'musicOnly',
      selectors: getSelectorEntries('youtube', RULE_MAP.musicOnly),
    })
  }
  if (state.youtube.grayMode) {
    rules.push({
      name: 'grayMode',
      selectors: getSelectorEntries('youtube', RULE_MAP.grayMode),
    })
  }

  return rules
}
