import { loadState } from '../utils/storage'
import { getSelectorEntries } from '../config/selectors'
import type { FeedFreeState, SelectorRule, YouTubeState, InstagramState } from '../types'

const AF_STYLE_ID = 'ff-antiflicker'

const YOUTUBE_TOGGLES: Record<keyof Pick<YouTubeState, 'nukeHomeFeed' | 'nukeShorts' | 'nukeSidebarRecs' | 'nukeComments'>, string> = {
  nukeHomeFeed: 'homeFeed',
  nukeShorts: 'shorts',
  nukeSidebarRecs: 'sidebarRecs',
  nukeComments: 'comments',
}

const INSTAGRAM_TOGGLES: Record<keyof Pick<InstagramState, 'nukeMainFeed' | 'nukeReels' | 'nukeExplore' | 'blockDMs'>, string> = {
  nukeMainFeed: 'mainFeed',
  nukeReels: 'reels',
  nukeExplore: 'explore',
  blockDMs: 'dms',
}

function injectCSS(css: string): void {
  const existing = document.getElementById(AF_STYLE_ID)
  if (existing) existing.remove()

  const style = document.createElement('style')
  style.id = AF_STYLE_ID
  style.textContent = css
  document.documentElement.appendChild(style)
}

function buildAntiflickerCSS(state: FeedFreeState, platform: 'youtube' | 'instagram'): string {
  const lines: string[] = []
  const platformState = state[platform]
  const toggleMap = platform === 'youtube' ? YOUTUBE_TOGGLES : INSTAGRAM_TOGGLES

  for (const [toggle, selectorKey] of Object.entries(toggleMap)) {
    if (!(platformState as unknown as Record<string, unknown>)[toggle]) continue

    const rules: SelectorRule[] = getSelectorEntries(platform, selectorKey)
    for (const rule of rules) {
      for (const sel of [rule.selector, ...rule.fallbacks]) {
        if (sel) {
          lines.push(`${sel} { ${rule.property}: ${rule.value} !important; }`)
        }
      }
    }
  }

  return lines.join('\n')
}

async function init(): Promise<void> {
  const hostname = window.location.hostname
  let platform: 'youtube' | 'instagram' | null = null

  if (hostname.includes('youtube.com')) platform = 'youtube'
  else if (hostname.includes('instagram.com')) platform = 'instagram'
  else return

  try {
    const state = await loadState()
    if (!state.globalEnabled) return

    const css = buildAntiflickerCSS(state, platform)
    if (css) injectCSS(css)
  } catch {
    /* fail silently — main content script takes over */
  }
}

init()
