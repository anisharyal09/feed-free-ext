import { getSelectorEntries } from '../../config/selectors'
import type { FeedFreeState, SelectorRule } from '../../types'

export type InstagramRuleKey = 'mainFeed' | 'reels' | 'explore' | 'dms'

export interface ActiveRule {
  name: InstagramRuleKey
  selectors: SelectorRule[]
}

const RULE_MAP: Record<InstagramRuleKey, string> = {
  mainFeed: 'mainFeed',
  reels: 'reels',
  explore: 'explore',
  dms: 'dms',
}

export function getActiveRules(state: FeedFreeState): ActiveRule[] {
  const rules: ActiveRule[] = []

  if (state.instagram.nukeMainFeed) {
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

  return rules
}
