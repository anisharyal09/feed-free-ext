import { getSelectorEntries } from '../../config/selectors'
import type { FeedFreeState, SelectorRule } from '../../types'

export type YouTubeRuleKey = 'homeFeed' | 'shorts' | 'sidebarRecs' | 'comments' | 'musicOnly'

export interface ActiveRule {
  name: YouTubeRuleKey
  selectors: SelectorRule[]
}

const RULE_MAP: Record<YouTubeRuleKey, string> = {
  homeFeed: 'homeFeed',
  shorts: 'shorts',
  sidebarRecs: 'sidebarRecs',
  comments: 'comments',
  musicOnly: 'musicOnly',
}

export function getActiveRules(state: FeedFreeState): ActiveRule[] {
  const rules: ActiveRule[] = []

  if (state.youtube.nukeHomeFeed) {
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
  if (state.youtube.nukeSidebarRecs) {
    rules.push({
      name: 'sidebarRecs',
      selectors: getSelectorEntries('youtube', RULE_MAP.sidebarRecs),
    })
  }
  if (state.youtube.nukeComments) {
    rules.push({
      name: 'comments',
      selectors: getSelectorEntries('youtube', RULE_MAP.comments),
    })
  }
  if (state.youtube.musicOnlyMode) {
    rules.push({
      name: 'musicOnly',
      selectors: getSelectorEntries('youtube', RULE_MAP.musicOnly),
    })
  }

  return rules
}
