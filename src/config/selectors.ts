import type { SelectorRule } from '../types'

export const YOUTUBE: Record<string, SelectorRule | SelectorRule[]> = {
  homeFeed: [
    {
      selector: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
      fallbacks: [
        'ytd-browse[page-subtype="home"] #primary ytd-rich-grid-renderer',
        'ytd-browse[page-subtype="home"] #contents',
        'ytd-browse[page-subtype="home"] #primary #contents',
        'ytd-browse[page-subtype="home"] ytd-rich-item-renderer',
      ],
      property: 'visibility',
      value: 'hidden',
    },
    {
      selector: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
      fallbacks: [
        'ytd-browse[page-subtype="home"] #primary ytd-rich-grid-renderer',
        'ytd-browse[page-subtype="home"] #contents',
        'ytd-browse[page-subtype="home"] #primary #contents',
        'ytd-browse[page-subtype="home"] ytd-rich-item-renderer',
      ],
      property: 'height',
      value: '0',
    },
    {
      selector: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
      fallbacks: [
        'ytd-browse[page-subtype="home"] #primary ytd-rich-grid-renderer',
        'ytd-browse[page-subtype="home"] #contents',
        'ytd-browse[page-subtype="home"] #primary #contents',
        'ytd-browse[page-subtype="home"] ytd-rich-item-renderer',
      ],
      property: 'overflow',
      value: 'hidden',
    },
    {
      selector: 'ytd-browse[page-subtype="home"]',
      fallbacks: [],
      property: 'min-height',
      value: '100vh',
    },
  ],
  shorts: [
    {
      selector: 'a[href^="/shorts"]:not(ytd-playlist-video-renderer a):not(ytd-playlist-panel-video-renderer a):not(ytd-playlist-video-list-renderer a):not(ytd-browse[page-subtype="channels"] a)',
      fallbacks: [
        'ytd-guide-entry-renderer[aria-label="Shorts"]',
        'a[title="Shorts"]',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
      fallbacks: ['a[href^="/shorts"]:not(ytd-playlist-video-renderer a):not(ytd-playlist-panel-video-renderer a):not(ytd-playlist-video-list-renderer a):not(ytd-browse[page-subtype="channels"] a)'],
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
      selector: '#dismissible ytd-thumbnail[href^="/shorts"]:not(ytd-playlist-video-renderer ytd-thumbnail):not(ytd-playlist-panel-video-renderer ytd-thumbnail):not(ytd-playlist-video-list-renderer ytd-thumbnail):not(ytd-browse[page-subtype="channels"] ytd-thumbnail)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
  ],
  shortsProfiles: [
    {
      selector: 'ytd-browse[page-subtype="channels"] yt-tab-shape[tab-title="Shorts"], ytd-browse[page-subtype="channels"] tp-yt-paper-tab:has(a[href*="/shorts"]), ytd-browse[page-subtype="channels"] a[href$="/shorts"]',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-browse[page-subtype="channels"] ytd-rich-item-renderer:has(a[href^="/shorts"]), ytd-browse[page-subtype="channels"] ytd-grid-video-renderer:has(a[href^="/shorts"])',
      fallbacks: [],
      property: 'display',
      value: 'none',
    }
  ],
  sidebarRecs: [
    {
      selector: 'ytd-watch-flexy #related',
      fallbacks: [
        'ytd-watch-flexy ytd-watch-next-secondary-results-renderer',
        '#related',
        'ytd-playlist-panel-renderer + #related',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-browse[page-subtype="playlist"] ytd-item-section-renderer:not(:has(ytd-playlist-video-list-renderer))',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
  ],
  sidebar: [
    {
      selector: 'ytd-watch-flexy #secondary',
      fallbacks: [
        '#secondary.ytd-watch-flexy',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-watch-flexy #primary',
      fallbacks: [],
      property: 'width',
      value: '100%',
    },
    {
      selector: 'ytd-watch-flexy #primary',
      fallbacks: [],
      property: 'max-width',
      value: '100%',
    },
    {
      selector: 'ytd-watch-flexy #primary',
      fallbacks: [],
      property: 'margin',
      value: '0 auto',
    },
    {
      selector: 'ytd-watch-flexy #primary',
      fallbacks: [],
      property: 'padding-right',
      value: '24px',
    },
    {
      selector: 'ytd-watch-flexy #primary',
      fallbacks: [],
      property: 'padding-left',
      value: '24px',
    },
    {
      selector: 'ytd-watch-flexy',
      fallbacks: [],
      property: '--ytd-watch-flexy-sidebar-width',
      value: '0px',
    },
    {
      selector: 'ytd-watch-flexy',
      fallbacks: [],
      property: '--ytd-watch-flexy-sidebar-min-width',
      value: '0px',
    },
    {
      selector: 'ytd-watch-flexy:not([theater]) #player-container-outer, ytd-watch-flexy:not([theater]) #player-container, ytd-watch-flexy:not([theater]) #player-container-inner, ytd-watch-flexy:not([theater]) ytd-player, ytd-watch-flexy:not([theater]) #ytd-player',
      fallbacks: [],
      property: 'width',
      value: '100%',
    },
    {
      selector: 'ytd-watch-flexy:not([theater]) #player-container-outer, ytd-watch-flexy:not([theater]) #player-container, ytd-watch-flexy:not([theater]) #player-container-inner, ytd-watch-flexy:not([theater]) ytd-player, ytd-watch-flexy:not([theater]) #ytd-player',
      fallbacks: [],
      property: 'height',
      value: 'auto',
    },
    {
      selector: 'ytd-watch-flexy:not([theater]) #player-container-outer, ytd-watch-flexy:not([theater]) #player-container, ytd-watch-flexy:not([theater]) #player-container-inner, ytd-watch-flexy:not([theater]) ytd-player, ytd-watch-flexy:not([theater]) #ytd-player',
      fallbacks: [],
      property: 'aspect-ratio',
      value: '16 / 9',
    },
    {
      selector: 'ytd-watch-flexy:not([theater]) #player-container-outer, ytd-watch-flexy:not([theater]) #player-container, ytd-watch-flexy:not([theater]) #player-container-inner, ytd-watch-flexy:not([theater]) ytd-player, ytd-watch-flexy:not([theater]) #ytd-player',
      fallbacks: [],
      property: 'max-width',
      value: '1280px',
    },
    {
      selector: 'ytd-watch-flexy:not([theater]) #player-container-outer, ytd-watch-flexy:not([theater]) #player-container, ytd-watch-flexy:not([theater]) #player-container-inner, ytd-watch-flexy:not([theater]) ytd-player, ytd-watch-flexy:not([theater]) #ytd-player',
      fallbacks: [],
      property: 'padding-top',
      value: '0',
    },
    {
      selector: 'ytd-watch-flexy:not([theater]) #player-container-outer, ytd-watch-flexy:not([theater]) #player-container, ytd-watch-flexy:not([theater]) #player-container-inner, ytd-watch-flexy:not([theater]) ytd-player, ytd-watch-flexy:not([theater]) #ytd-player',
      fallbacks: [],
      property: 'padding-bottom',
      value: '0',
    },
    {
      selector: 'ytd-watch-flexy:not([theater]) #player-container-outer, ytd-watch-flexy:not([theater]) #player-container, ytd-watch-flexy:not([theater]) #player-container-inner, ytd-watch-flexy:not([theater]) ytd-player, ytd-watch-flexy:not([theater]) #ytd-player',
      fallbacks: [],
      property: 'margin',
      value: '0 auto',
    },
    {
      selector: 'ytd-watch-flexy',
      fallbacks: [],
      property: '--ytd-watch-flexy-max-player-width',
      value: '1280px',
    },
  ],
  endScreens: [
    {
      selector: '.ytp-ce-element, .ytp-ce-element-show, .ytp-endscreen, .html5-endscreen, .ytp-endscreen-content, .ytp-upnext, .ytp-upnext-autoplay-icon, .ytp-ce-covering-overlay, .ytp-ce-covering-image, .ytp-videowall-still, .ytp-modern-videowall-still, .ytp-suggestion-set, .ytp-fullscreen-grid-main-content, .ytp-fullscreen-grid-stills-container',
      fallbacks: [
        '.ytp-ce-element',
        '.ytp-ce-element-show',
        '.ytp-endscreen',
        '.html5-endscreen',
        '.ytp-endscreen-content',
        '.ytp-upnext',
        '.ytp-ce-covering-overlay',
        '.ytp-ce-covering-image',
        '.ytp-videowall-still',
        '.ytp-modern-videowall-still',
        '.ytp-suggestion-set',
        '.ytp-fullscreen-grid-main-content',
        '.ytp-fullscreen-grid-stills-container',
      ],
      property: 'display',
      value: 'none',
    },
  ],
  subscriptions: [
    {
      selector: 'ytd-guide-entry-renderer:has(a[href="/feed/subscriptions"])',
      fallbacks: [
        'ytd-mini-guide-entry-renderer:has(a[href="/feed/subscriptions"])',
        'a[href="/feed/subscriptions"]',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-guide-section-renderer:has(a[href^="/@"]):not(:has(a[href^="/feed/history"])):not(:has(a[href^="/feed/you"])):not(:has(a[href^="/feed/library"])):not(:has(a[href="/"])):not(:has(a[href="/gaming"])):not(:has(a[href="/news"])):not(:has(a[href="/sports"])):not(:has(a[href^="/feed/trending"]))',
      fallbacks: [
        'ytd-guide-section-renderer:has(a[href*="/channel/"]):not(:has(a[href^="/feed/history"])):not(:has(a[href^="/feed/you"])):not(:has(a[href^="/feed/library"])):not(:has(a[href="/"])):not(:has(a[href="/gaming"])):not(:has(a[href="/news"])):not(:has(a[href="/sports"])):not(:has(a[href^="/feed/trending"]))',
        'ytd-guide-section-renderer:has(a[href*="/user/"]):not(:has(a[href^="/feed/history"])):not(:has(a[href^="/feed/you"])):not(:has(a[href^="/feed/library"])):not(:has(a[href="/"])):not(:has(a[href="/gaming"])):not(:has(a[href="/news"])):not(:has(a[href="/sports"])):not(:has(a[href^="/feed/trending"]))',
        'ytd-guide-section-renderer:has(a[href^="/@"]) + ytd-guide-divider-renderer',
        'ytd-guide-section-renderer:has(a[href^="/@"]) + tp-yt-paper-divider',
        'ytd-guide-divider-renderer:has(+ ytd-guide-section-renderer:has(a[href^="/@"]))',
        'tp-yt-paper-divider:has(+ ytd-guide-section-renderer:has(a[href^="/@"]))',
      ],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer, ytd-browse[page-subtype="subscriptions"] #contents, ytd-browse[page-subtype="subscriptions"] #primary ytd-section-list-renderer',
      fallbacks: [],
      property: 'visibility',
      value: 'hidden',
    },
    {
      selector: 'ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer, ytd-browse[page-subtype="subscriptions"] #contents, ytd-browse[page-subtype="subscriptions"] #primary ytd-section-list-renderer',
      fallbacks: [],
      property: 'height',
      value: '0',
    },
    {
      selector: 'ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer, ytd-browse[page-subtype="subscriptions"] #contents, ytd-browse[page-subtype="subscriptions"] #primary ytd-section-list-renderer',
      fallbacks: [],
      property: 'overflow',
      value: 'hidden',
    }
  ],
  explore: [
    {
      selector: 'ytd-guide-section-renderer:has(a[href="/gaming"]), ytd-guide-section-renderer:has(a[href="/news"]), ytd-guide-section-renderer:has(a[href="/sports"]), ytd-guide-section-renderer:has(a[href^="/feed/shopping"]), ytd-guide-section-renderer:has(a[href="/podcasts"]), ytd-guide-section-renderer:has(a[href="/courses"]), ytd-guide-section-renderer:has(a[href="/fashion"]), ytd-guide-section-renderer:has(a[href^="/feed/trending"])',
      fallbacks: [
        'ytd-guide-section-renderer:has(a[href="/gaming"])',
        'ytd-guide-section-renderer:has(a[href="/news"])',
        'ytd-guide-section-renderer:has(a[href="/sports"])',
        'ytd-guide-section-renderer:has(a[href^="/feed/shopping"])',
        'ytd-guide-section-renderer:has(a[href="/podcasts"])',
        'ytd-guide-section-renderer:has(a[href="/courses"])',
        'ytd-guide-section-renderer:has(a[href="/fashion"])',
        'ytd-guide-section-renderer:has(a[href^="/feed/trending"])',
        'ytd-guide-section-renderer:has(a[href="/gaming"]) + ytd-guide-divider-renderer',
        'ytd-guide-section-renderer:has(a[href="/gaming"]) + tp-yt-paper-divider',
        'ytd-guide-divider-renderer:has(+ ytd-guide-section-renderer:has(a[href="/gaming"]))',
        'tp-yt-paper-divider:has(+ ytd-guide-section-renderer:has(a[href="/gaming"]))',
      ],
      property: 'display',
      value: 'none',
    },
  ],
  reportHistory: {
    selector: 'ytd-guide-entry-renderer:has(a[href*="reporthistory"]), ytd-guide-entry-renderer:has(a[href*="report_history"])',
    fallbacks: [
      'a[href*="reporthistory"]',
      'a[href*="report_history"]',
      'ytd-guide-section-renderer:has(a[href*="reporthistory"]) + ytd-guide-divider-renderer',
      'ytd-guide-section-renderer:has(a[href*="report_history"]) + ytd-guide-divider-renderer',
      'ytd-guide-entry-renderer:has(a[href*="reporthistory"]) + ytd-guide-divider-renderer',
      'ytd-guide-entry-renderer:has(a[href*="report_history"]) + ytd-guide-divider-renderer',
      'ytd-guide-divider-renderer:has(+ ytd-guide-section-renderer:has(a[href*="reporthistory"]))',
      'ytd-guide-divider-renderer:has(+ ytd-guide-section-renderer:has(a[href*="report_history"]))',
      'ytd-guide-divider-renderer:has(+ ytd-guide-entry-renderer:has(a[href*="reporthistory"]))',
      'ytd-guide-divider-renderer:has(+ ytd-guide-entry-renderer:has(a[href*="report_history"]))',
      'ytd-guide-section-renderer:has(a[href*="reporthistory"]):not(:has(ytd-guide-entry-renderer + ytd-guide-entry-renderer))',
      'ytd-guide-section-renderer:has(a[href*="report_history"]):not(:has(ytd-guide-entry-renderer + ytd-guide-entry-renderer))',
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
        'ytd-engagement-panel-section-renderer[target-id="engagement-panel-comments"]',
        'ytd-engagement-panel-section-renderer[target-id="comment-teaser"]',
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
  moreFromYouTube: [
    {
      selector: 'ytd-guide-section-renderer:has(a[href*="/premium"]):not(:has(a[href^="/feed/history"])):not(:has(a[href^="/feed/you"])):not(:has(a[href^="/feed/library"])):not(:has(a[href="/"])), ytd-guide-section-renderer:has(a[href*="music.youtube.com"]):not(:has(a[href^="/feed/history"])):not(:has(a[href^="/feed/you"])):not(:has(a[href^="/feed/library"])):not(:has(a[href="/"])), ytd-guide-section-renderer:has(a[href*="youtubekids.com"]):not(:has(a[href^="/feed/history"])):not(:has(a[href^="/feed/you"])):not(:has(a[href^="/feed/library"])):not(:has(a[href="/"])), ytd-guide-section-renderer:has(a[href*="tv.youtube.com"]):not(:has(a[href^="/feed/history"])):not(:has(a[href^="/feed/you"])):not(:has(a[href^="/feed/library"])):not(:has(a[href="/"])), ytd-guide-section-renderer:has(a[href*="studio.youtube.com"]):not(:has(a[href^="/feed/history"])):not(:has(a[href^="/feed/you"])):not(:has(a[href^="/feed/library"])):not(:has(a[href="/"]))',
      fallbacks: [
        'ytd-guide-section-renderer:has(a[href*="/premium"]) + ytd-guide-divider-renderer',
        'ytd-guide-section-renderer:has(a[href*="/premium"]) + tp-yt-paper-divider',
        'ytd-guide-divider-renderer:has(+ ytd-guide-section-renderer:has(a[href*="/premium"]))',
        'tp-yt-paper-divider:has(+ ytd-guide-section-renderer:has(a[href*="/premium"]))',
      ],
      property: 'display',
      value: 'none',
    }
  ],
  grayMode: {
    selector: 'html',
    fallbacks: [],
    property: 'filter',
    value: 'grayscale(100%)',
  },
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
    selector: 'a[href="/reels/"]:not(main a), a[href="/reels"]:not(main a), a[href^="/reels/"]:not(main a), a[href^="/reels"]:not(main a)',
    fallbacks: [
      'a:has(svg[aria-label*="Reels"]):not(main a)',
      'a:has(svg[aria-label*="reels"]):not(main a)',
    ],
    property: 'display',
    value: 'none',
  },
  explore: {
    selector: 'div[role="navigation"] a[href^="/explore"]',
    fallbacks: [
      'nav a[href^="/explore"]',
      'svg[aria-label="Explore"]',
      'a[href^="/explore"]:not(main a)',
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
  grayMode: {
    selector: 'html',
    fallbacks: [],
    property: 'filter',
    value: 'grayscale(100%)',
  },
  squareProfile: [
    {
      selector: '*, button, a, img, div, *::after, *::before',
      fallbacks: [],
      property: 'border-radius',
      value: '0',
    },
    {
      selector: '._aarh',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="336"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'content',
      value: '""',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="336"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'display',
      value: 'block',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="336"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'position',
      value: 'absolute',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'top',
      value: '-3.5px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'left',
      value: '-3.5px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'right',
      value: '-3.5px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'bottom',
      value: '-3.5px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="336"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'z-index',
      value: '2',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas._aarh+span::before, canvas._aarh[width="119"]+span::before, canvas._aarh[width="336"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'background',
      value: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #d6249f 90%)',
    },
    {
      selector: 'canvas._aarh[width="336"]+span::before',
      fallbacks: [],
      property: 'top',
      value: '-6px',
    },
    {
      selector: 'canvas._aarh[width="336"]+span::before',
      fallbacks: [],
      property: 'left',
      value: '-6px',
    },
    {
      selector: 'canvas._aarh[width="336"]+span::before',
      fallbacks: [],
      property: 'right',
      value: '-6px',
    },
    {
      selector: 'canvas._aarh[width="336"]+span::before',
      fallbacks: [],
      property: 'bottom',
      value: '-6px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="336"]+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'content',
      value: '""',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="336"]+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'display',
      value: 'block',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="336"]+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'position',
      value: 'absolute',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'top',
      value: '-2px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'left',
      value: '-2px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'right',
      value: '-2px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'bottom',
      value: '-2px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="336"]+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'z-index',
      value: '4',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh+span::after, canvas._aarh[width="336"]+span::after, canvas._aarh[width="132"]+span::after, canvas._aarh[width="84"]+span::after',
      fallbacks: [],
      property: 'background',
      value: 'rgba(var(--ig-primary-background, 255, 255, 255))',
    },
    {
      selector: 'canvas._aarh[width="336"]+span::after',
      fallbacks: [],
      property: 'top',
      value: '-3px',
    },
    {
      selector: 'canvas._aarh[width="336"]+span::after',
      fallbacks: [],
      property: 'left',
      value: '-3px',
    },
    {
      selector: 'canvas._aarh[width="336"]+span::after',
      fallbacks: [],
      property: 'right',
      value: '-3px',
    },
    {
      selector: 'canvas._aarh[width="336"]+span::after',
      fallbacks: [],
      property: 'bottom',
      value: '-3px',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span, canvas._aarh+span',
      fallbacks: [],
      property: 'overflow',
      value: 'visible',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span>img, .x1upo8f9.xpdipgo.x87ps6o img, div._aarf img',
      fallbacks: [],
      property: 'position',
      value: 'relative',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span>img, .x1upo8f9.xpdipgo.x87ps6o img, div._aarf img',
      fallbacks: [],
      property: 'z-index',
      value: '10',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o+span>img, .x1upo8f9.xpdipgo.x87ps6o img, div._aarf img',
      fallbacks: [],
      property: 'box-sizing',
      value: 'border-box',
    },
    {
      selector: '.xnz67gz.x14yjl9h.xudhj91.x18nykt9.xww2gxu.x9f619.x1lliihq.x2lah0s.x6ikm8r.x10wlt62.x1n2onr6.x1ykvv32.xougopr.x159fomc.xnp5s1o.x194ut8o.x1vzenxt',
      fallbacks: [],
      property: 'box-sizing',
      value: 'border-box',
    },
    {
      selector: '.xnz67gz.x14yjl9h.xudhj91.x18nykt9.xww2gxu.x9f619.x1lliihq.x2lah0s.x6ikm8r.x10wlt62.x1n2onr6.x1ykvv32.xougopr.x159fomc.xnp5s1o.x194ut8o.x1vzenxt',
      fallbacks: [],
      property: 'overflow',
      value: 'visible',
    },
    {
      selector: '.xbyyjgo canvas._aarh+span::before',
      fallbacks: [],
      property: 'opacity',
      value: '0',
    },
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o, canvas._aarh[width="128"], .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"], ._aams._aamt canvas[width="174"]',
      fallbacks: [],
      property: 'opacity',
      value: '0',
    },
    {
      selector: 'canvas._aarh[width="128"]+span::before, .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div::before, ._aams._aamt canvas[width="174"]+div::before',
      fallbacks: [],
      property: 'content',
      value: '""',
    },
    {
      selector: 'canvas._aarh[width="128"]+span::before, .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div::before, ._aams._aamt canvas[width="174"]+div::before',
      fallbacks: [],
      property: 'display',
      value: 'block',
    },
    {
      selector: 'canvas._aarh[width="128"]+span::before, .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div::before, ._aams._aamt canvas[width="174"]+div::before',
      fallbacks: [],
      property: 'position',
      value: 'absolute',
    },
    {
      selector: 'canvas._aarh[width="128"]+span::before, .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div::before, ._aams._aamt canvas[width="174"]+div::before',
      fallbacks: [],
      property: 'top',
      value: '-3px',
    },
    {
      selector: 'canvas._aarh[width="128"]+span::before, .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div::before, ._aams._aamt canvas[width="174"]+div::before',
      fallbacks: [],
      property: 'left',
      value: '-3px',
    },
    {
      selector: 'canvas._aarh[width="128"]+span::before, .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div::before, ._aams._aamt canvas[width="174"]+div::before',
      fallbacks: [],
      property: 'right',
      value: '-3px',
    },
    {
      selector: 'canvas._aarh[width="128"]+span::before, .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div::before, ._aams._aamt canvas[width="174"]+div::before',
      fallbacks: [],
      property: 'bottom',
      value: '-3px',
    },
    {
      selector: 'canvas._aarh[width="128"]+span::before, .xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div::before, ._aams._aamt canvas[width="174"]+div::before',
      fallbacks: [],
      property: 'border',
      value: '1px solid #e0e0e0',
    },
    {
      selector: '.xamitd3.x1ypdohk.x1lliihq.x1n2onr6.x87ps6o canvas[width="174"]+div, ._aams._aamt canvas[width="174"]+div',
      fallbacks: [],
      property: 'overflow',
      value: 'visible',
    },
    {
      selector: '._aams._aamt canvas[width="174"]+div>img',
      fallbacks: [],
      property: 'position',
      value: 'relative',
    },
    {
      selector: '._aams._aamt canvas[width="174"]+div>img',
      fallbacks: [],
      property: 'z-index',
      value: '10',
    },
    {
      selector: '._aac4._aac5._aac6._aj3f._ajdu .x6ikm8r',
      fallbacks: [],
      property: 'overflow',
      value: 'visible',
    },
    {
      selector: 'div._ap3a._aacn._aacu._aacx._aad6._aade>div.x9f619',
      fallbacks: [],
      property: 'overflow',
      value: 'hidden',
    }
  ],
  notifications: [
    {
      selector: 'a[href^="/notifications"]',
      fallbacks: [
        'a[href="/notifications/"]',
        'a:has(svg[aria-label="Notifications"])',
        'a:has(svg[aria-label="Activity"])',
        'a:has(svg[aria-label="Heart"])',
        'div[role="button"]:has(svg[aria-label="Notifications"])',
        'div[role="button"]:has(svg[aria-label="Activity"])',
        'div[role="button"]:has(svg[aria-label="Heart"])',
      ],
      property: 'display',
      value: 'none',
    },
  ],
  comments: [
    {
      selector: 'section > div:has(> span > svg[aria-label="Comment"]), a:has(> svg[aria-label="Comment"]), button:has(> svg[aria-label="Comment"]), svg[aria-label="Comment"]',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'a[href*="/comments/"], a[href$="/comments/"], a[href$="/comments"], div:has(> a[href*="/comments/"])',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'form:has(textarea[placeholder*="comment"]), form:has(textarea[aria-label*="comment"]), textarea[placeholder*="comment"], textarea[aria-label*="comment"]',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'section ul._a9z6._a9z9._a9za > li:not(:first-child), section ul._a9z6._a9z9._a9za > div:not(:first-child), article ul._a9z6._a9z9._a9za > li:not(:first-child), article ul._a9z6._a9z9._a9za > div:not(:first-child), div[role="dialog"] ul._a9z6._a9z9._a9za > li:not(:first-child), div[role="dialog"] ul._a9z6._a9z9._a9za > div:not(:first-child)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '.x1qhh985.xm0m39n.x9f619.xe8uvvx[role="button"][tabindex="0"]:has(div>svg>path[d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"])',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '[aria-haspopup="menu"]:has(svg>path[d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"])',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    // Reference selectors from igplus
    {
      selector: 'section>.x78zum5>.xp7jhwk+span:nth-child(2)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'hr+.x5yr21d.xw2csxc.x1odjw0f.x1n2onr6',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '.x78zum5.x1q0g3np.xwib8y2.x1yrsyyn.x1xp8e9x.x13fuv20.x178xt8z.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xo1ph6p.x1pi30zi.x1swvt13 > span:nth-child(2):has(svg)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'article .x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1:has(h3._a9zc)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '.x9f619.xjbqb8w.x78zum5:nth-child(3) .x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1:nth-last-child(2) span[style="----base-line-clamp-line-height: 18px; --lineHeight: 18px;"]',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '._a9z6._a9za > div.xryxfnj:nth-child(2), ._a9z6._a9za > div.xryxfnj:nth-child(3)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    // Merged comment counts selectors
    {
      selector: '.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x1roi4f4.x10wh9bi.x1wdrske.x8viiok.x18hxmgj > span:nth-child(1)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '.x1qhh985.xm0m39n.x9f619.xe8uvvx[role="button"][tabindex="0"]:has(div>svg>path[d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"]) .html-span.xdj266r',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'ul._abpo > li:last-child',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '.x6s0dn4.xrvj5dj.x19g8pj0.x1dh5ka.xyamay9.x1l90r2v.x1mu97ne, .x6s0dn4.xrvj5dj.x1o61qjw.x12nagc.x1gslohp .x1ypdohk.x1s688f.x2fvf9.xe9ewy2',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '._ac7v.x1ty9z65.xzboxd6>div>a>div.x1ey2m1c>*, .x12nagc.x182iqb8.xv54qhq.xf7dkkf:has(.html-span.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '.html-div.xdj266r.x14z9mp.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x6s0dn4.x1ypdohk.x78zum5.xdt5ytf.xieb3on span.x1vvkbs, .html-div.xdj266r.x14z9mp.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x6s0dn4.x1ypdohk.x78zum5.xdt5ytf.xieb3on>div:nth-child(2)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    }
  ],
  notes: [
    {
      selector: '.x1vjfegm.x9a3u73 > .x7wppnt',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '[aria-label="Chats"] .x1c4vz4f.x2lah0s.x1e56ztr',
      fallbacks: [],
      property: 'display',
      value: 'none',
    }
  ],
  likes: [
    {
      // Post likes counts
      selector: 'section > .x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1iyjqo2.x2lwn1j.xeuugli.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1, .x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.xr1yuqi.xkrivgy.x4ii5y1.x1gryazu.x1n2onr6.x1plvlek.xryxfnj.x1iyjqo2.x2lwn1j.xeuugli.xdt5ytf.x1a02dak.xqjyukv.x1cy8zhl.x1oa3qoh.x1nhvcw1',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      // Reels likes count
      selector: 'div.xdj266r.x11i5rnm.x1mh8g0r.xexx8yu.x4uap5.x18d9i69:has(svg>path[d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"]) .html-span.xdj266r',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      // Followers & Following counts
      selector: 'ul.x78zum5.x1q0g3np.xieb3on > li:nth-child(2), ul.x78zum5.x1q0g3np.xieb3on > li:nth-child(3)',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      // Grid post hover likes count
      selector: 'ul._abpo > li:first-child',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: 'button.hide_ls2',
      fallbacks: [],
      property: 'display',
      value: 'none',
    }
  ],
  storiesHome: [
    {
      selector: 'main .xmnaoh6>[data-pagelet="story_tray"], [data-pagelet="story_tray"], div.xw7yly9 div.x18dvoc8, div>._aac4._aac6._aj3f._ajdu, .x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.xdj266r.x1e56ztr.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1',
      fallbacks: [],
      property: 'display',
      value: 'none',
    }
  ],
  storiesEverywhere: [
    {
      selector: 'canvas.x1upo8f9.xpdipgo.x87ps6o, canvas.x1upo8f9.xpdipgo.x87ps6o+span::before, canvas.x1upo8f9.xpdipgo.x87ps6o+span::after, canvas._aarh, canvas._aarh+span::before, canvas._aarh[width="336"]+span::before, canvas._aarh[width="132"]+span::before, canvas._aarh[width="84"]+span::before',
      fallbacks: [],
      property: 'display',
      value: 'none',
    },
    {
      selector: '[role="button"]:has(canvas.x1upo8f9.xpdipgo.x87ps6o), [role="button"]:has(canvas._aarh)',
      fallbacks: [],
      property: 'pointer-events',
      value: 'none',
    },
    {
      selector: '[role="menu"] .x1qo8xr2.x129qt2x.xpoid6y.xx7atzb, .xzzrveb.x1h862dm.xjk3ia2.x1tb5o9v[role="menu"], section.xc3tme8.xcrlgei.xtyw845.x1682tcd>div[role="menu"], .x4afe7t.x1v7wizp.x1htlvfj.x1a5igra.xds687c.xixxii4.x17qophe.x13vifvy.x1x85hfe.x1s85apg',
      fallbacks: [],
      property: 'display',
      value: 'none',
    }
  ],
  dashboard: [
    {
      selector: 'a[href*="professional_dashboard" i]',
      fallbacks: [
        'a[href*="dashboard" i]',
        'a[href*="professional-dashboard" i]',
        'a:has(svg[aria-label*="dashboard" i])',
        'div:has(> a[href*="dashboard" i])',
        'li:has(a[href*="dashboard" i])',
      ],
      property: 'display',
      value: 'none',
    }
  ]
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
