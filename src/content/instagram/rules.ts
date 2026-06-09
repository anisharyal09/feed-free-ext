import { getSelectorEntries } from '../../config/selectors'
import type { FeedFreeState, SelectorRule } from '../../types'

export type InstagramRuleKey =
  | 'mainFeed'
  | 'reels'
  | 'explore'
  | 'dms'
  | 'grayMode'
  | 'squareProfile'
  | 'notifications'
  | 'comments'
  | 'notes'
  | 'likes'
  | 'storiesHome'
  | 'storiesEverywhere'

export interface ActiveRule {
  name: InstagramRuleKey
  selectors: SelectorRule[]
}

const RULE_MAP: Record<InstagramRuleKey, string> = {
  mainFeed: 'mainFeed',
  reels: 'reels',
  explore: 'explore',
  dms: 'dms',
  grayMode: 'grayMode',
  squareProfile: 'squareProfile',
  notifications: 'notifications',
  comments: 'comments',
  notes: 'notes',
  likes: 'likes',
  storiesHome: 'storiesHome',
  storiesEverywhere: 'storiesEverywhere',
}

export function getActiveRules(state: FeedFreeState): ActiveRule[] {
  const rules: ActiveRule[] = []

  const isHomepage = window.location.pathname === '/' || window.location.pathname === ''

  if (state.instagram.nukeMainFeed && isHomepage) {
    rules.push({
      name: 'mainFeed',
      selectors: getSelectorEntries('instagram', RULE_MAP.mainFeed),
    })
  }
  if (state.instagram.nukeReels) {
    rules.push({
      name: 'reels',
      selectors: getSelectorEntries('instagram', RULE_MAP.reels),
    })
  }
  if (state.instagram.nukeExplore) {
    rules.push({
      name: 'explore',
      selectors: getSelectorEntries('instagram', RULE_MAP.explore),
    })
  }
  if (state.instagram.blockDMs) {
    rules.push({
      name: 'dms',
      selectors: getSelectorEntries('instagram', RULE_MAP.dms),
    })
  }
  if (state.instagram.grayMode) {
    rules.push({
      name: 'grayMode',
      selectors: getSelectorEntries('instagram', RULE_MAP.grayMode),
    })
  }
  if (state.instagram.squareProfile) {
    rules.push({
      name: 'squareProfile',
      selectors: getSelectorEntries('instagram', RULE_MAP.squareProfile),
    })
  }
  if (state.instagram.nukeNotifications) {
    rules.push({
      name: 'notifications',
      selectors: getSelectorEntries('instagram', RULE_MAP.notifications),
    })
  }
  if (state.instagram.hideComments) {
    rules.push({
      name: 'comments',
      selectors: getSelectorEntries('instagram', RULE_MAP.comments),
    })
  }
  if (state.instagram.nukeNotes) {
    rules.push({
      name: 'notes',
      selectors: getSelectorEntries('instagram', RULE_MAP.notes),
    })
  }
  if (state.instagram.hideLikes) {
    rules.push({
      name: 'likes',
      selectors: getSelectorEntries('instagram', RULE_MAP.likes),
    })
  }
  if (state.instagram.nukeStoriesHome || state.instagram.nukeStoriesEverywhere) {
    rules.push({
      name: 'storiesHome',
      selectors: getSelectorEntries('instagram', RULE_MAP.storiesHome),
    })
  }
  if (state.instagram.nukeStoriesEverywhere) {
    rules.push({
      name: 'storiesEverywhere',
      selectors: getSelectorEntries('instagram', RULE_MAP.storiesEverywhere),
    })
  }

  return rules
}
