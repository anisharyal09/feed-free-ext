import type { SelectorRule } from '../types'

export const YOUTUBE: Record<string, SelectorRule | SelectorRule[]> = {
  homeFeed: [
    {
      selector: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
      fallbacks: [
        'ytd-rich-grid-renderer',
        'ytd-browse ytd-rich-grid-renderer',
        '#primary ytd-rich-grid-renderer',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-browse[page-subtype="home"] #contents',
      fallbacks: [
        '#contents.ytd-rich-grid-renderer',
        '#page-manager ytd-rich-grid-renderer #contents',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-browse[page-subtype="home"] ytd-rich-item-renderer',
      fallbacks: [
        'ytd-rich-item-renderer',
        'ytd-browse ytd-rich-item-renderer',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-browse[page-subtype="home"] #primary #contents',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
  ],
  shorts: [
    {
      selector: 'a[href^="/shorts"]',
      fallbacks: [
        'ytd-guide-entry-renderer[aria-label="Shorts"]',
        'a[title="Shorts"]',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
      fallbacks: ['a[href^="/shorts"]'],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-reel-shelf-renderer',
      fallbacks: [
        '#shorts-inner-container',
        'ytd-rich-section-renderer ytd-reel-shelf-renderer',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: '#dismissible ytd-thumbnail[href^="/shorts"]',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
  ],
  sidebarRecs: {
    selector: 'ytd-watch-flexy #secondary',
    fallbacks: [
      '#secondary ytd-item-section-renderer',
      '#related',
      '#secondary.ytd-watch-flexy',
    ],
    property: 'display',
    value: 'none',
  },
  comments: [
    {
      selector: '#comments',
      fallbacks: [
        'ytd-comments',
        '#primary ytd-comments',
        '#secondary ytd-comments',
        '#watch-discussion',
        '#comments.ytd-item-section-renderer',
        '#primary ytd-item-section-renderer.ytd-comments',
        '#secondary #comments',
        '#engagement-panel',
        '#comment-teaser',
      ],
      property: 'display',
      value: 'none',
    },
  ],
  musicOnly: [
    {
      selector: '#movie_player video',
      fallbacks: [
        'video.video-stream.html5-main-video',
        'video',
      ],
      property: 'opacity',
      value: '0',
    },
    {
      selector: '.html5-video-container',
      fallbacks: [
        '#movie_player .html5-video-container',
      ],
      property: 'background',
      value: '#000',
    },
    {
      selector: '#movie_player',
      fallbacks: [
        '.html5-video-player',
        'ytd-player',
        '#player-container-inner',
      ],
      property: 'background-color',
      value: '#000',
    },
    {
      selector: '#cinematicContainer',
      fallbacks: [
        '#cinematic-container',
        '#cinematic',
      ],
      property: 'display',
      value: 'none',
    },
  ],
}

export const INSTAGRAM: Record<string, SelectorRule | SelectorRule[]> = {
  mainFeed: {
    selector: 'main article',
    fallbacks: [
      'article',
      'main div[role="feed"]',
      'article[role="presentation"]',
    ],
    property: 'display',
    value: 'none',
  },
  reels: {
    selector: 'a[href^="/reels"]',
    fallbacks: [
      'svg[aria-label="Reels"]',
      'nav a[href="/reels"]',
      'a[role="link"][href*="reels"]',
    ],
    property: 'display',
    value: 'none',
  },
  explore: {
    selector: 'a[href^="/explore"]',
    fallbacks: [
      'nav a[href="/explore"]',
      'svg[aria-label="Explore"]',
      'a[role="link"][href*="explore"]',
    ],
    property: 'display',
    value: 'none',
  },
  dms: {
    selector: 'a[href^="/direct"]',
    fallbacks: [
      'a[href*="direct"]',
      'div[role="navigation"] a[href*="direct"]',
    ],
    property: 'display',
    value: 'none',
  },
}

export function getSelectorEntries(
  platform: 'youtube' | 'instagram',
  ruleName: string,
): SelectorRule[] {
  const map = platform === 'youtube' ? YOUTUBE : INSTAGRAM
  const entry = map[ruleName]
  if (!entry) return []
  return Array.isArray(entry) ? entry : [entry]
}

export function getAllSelectors(
  platform: 'youtube' | 'instagram',
): Record<string, SelectorRule[]> {
  const map = platform === 'youtube' ? YOUTUBE : INSTAGRAM
  const result: Record<string, SelectorRule[]> = {}
  for (const [key, value] of Object.entries(map)) {
    result[key] = Array.isArray(value) ? value : [value]
  }
  return result
}
