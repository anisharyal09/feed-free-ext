import { loadState, onStateChanged, pollState } from '../../utils/storage'
import { updateStyles, unmountAll, removeAntiflicker } from '../shared/injector'
import { DOMPatron } from '../shared/patron'
import { getActiveRules } from './rules'
import type { FeedFreeState } from '../../types'

const log = console.log.bind(console, '[FeedFree:Instagram]')
const err = console.error.bind(console, '[FeedFree:Instagram]')

let patrol: DOMPatron | null = null
let currentState: FeedFreeState | null = null
let initialized = false
let pendingState: FeedFreeState | null = null
let heartbeat: ReturnType<typeof setInterval> | null = null

const SYSTEM_PATHS = [
  'direct', 'explore', 'reels', 'saved', 'about', 'developer',
  'terms', 'privacy', 'legal', 'accounts', 'emailsignup',
  'logging', 'ajax', 'api', 'create', 'notifications',
  'messages', 'play', 'press', 'safety', 'directory',
  'stories', 'p', 'tv', 'blog', 'jobs', 'help', 'settings',
  'meta'
]

function isProfilePath(path: string): boolean {
  const clean = path.replace(/^\/|\/$/g, '').split('?')[0]
  if (!clean || clean.includes('/')) return false
  return !SYSTEM_PATHS.includes(clean)
}

function isLoggedIn(): boolean {
  if (location.pathname.startsWith('/accounts/')) return false
  if (document.cookie.includes('ds_user_id')) return true
  return !!(
    document.querySelector('a[href^="/explore"]') ||
    document.querySelector('a[href^="/reels"]') ||
    document.querySelector('a[href^="/direct"]') ||
    document.querySelector('a[href^="/saved"]') ||
    document.querySelector('svg[aria-label="Home"]') ||
    document.querySelector('svg[aria-label="Reels"]') ||
    document.querySelector('svg[aria-label="Messenger"]') ||
    document.querySelector('svg[aria-label="Direct"]') ||
    document.querySelector('svg[aria-label="New post"]')
  )
}

function getProfileUrl(): string | null {
  try {
    const navContainers = document.querySelectorAll('div[role="navigation"], nav, header')
    for (const container of navContainers) {
      const links = container.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')
      for (const link of links) {
        const href = link.getAttribute('href')
        if (href && isProfilePath(href)) return href
      }
    }
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')
    for (const link of links) {
      if (link.closest('article')) continue
      const href = link.getAttribute('href')
      if (href && isProfilePath(href)) return href
    }
  } catch (e) {
    err('getProfileUrl failed:', e)
  }
  return null
}

function getUsernameFromProfileUrl(url: string | null): string | null {
  if (!url) return null
  const clean = url.replace(/^\/|\/$/g, '').split('?')[0]
  return clean || null
}

function handleRedirect(state: FeedFreeState): boolean {
  try {
    if (!state.globalEnabled) return false
    if (!isLoggedIn()) return false

    const path = location.pathname

    if (state.instagram.blockDMs && path.startsWith('/direct/')) {
      if (state.instagram.nukeMainFeed && state.instagram.conflictRedirectTarget === 'saved') {
        const username = getUsernameFromProfileUrl(getProfileUrl())
        if (username) { log('blockDMs + nukeMainFeed — redirecting to saved'); location.replace(`/${username}/saved/`) }
        else { log('blockDMs + nukeMainFeed — username not found, redirecting to /'); location.replace('/') }
      } else {
        const username = getUsernameFromProfileUrl(getProfileUrl())
        location.replace(username ? `/${username}/` : '/')
      }
      return true
    }

    if (state.instagram.nukeReels && path.startsWith('/reels')) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
      return true
    }

    if (state.instagram.nukeExplore && path.startsWith('/explore')) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
      return true
    }

    if (state.instagram.nukeStoriesEverywhere && path.startsWith('/stories')) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
      return true
    }

    const isMainFeed = path === '/' || path === ''
    if (!isMainFeed) return false

    if (state.instagram.nukeMainFeed) {
      if (state.instagram.blockDMs) {
        const target = state.instagram.conflictRedirectTarget
        if (target === 'saved') {
          const username = getUsernameFromProfileUrl(getProfileUrl())
          if (username) { log('nukeMainFeed + blockDMs — redirecting to saved'); location.replace(`/${username}/saved/`); return true }
          return false
        }
        const username = getUsernameFromProfileUrl(getProfileUrl())
        if (username) { log('nukeMainFeed + blockDMs — redirecting to profile'); location.replace(`/${username}/`); return true }
        return false
      }
      log('nukeMainFeed — redirecting to DMs')
      location.replace('/direct/inbox/')
      return true
    }

    if (state.instagram.forceChronological) {
      const url = new URL(location.href)
      if (!url.searchParams.has('variant')) {
        url.searchParams.set('variant', 'following')
        log('forceChronological — adding variant=following')
        location.replace(url.toString())
        return true
      }
    }
  } catch (e) {
    err('handleRedirect failed:', e)
  }
  return false
}

let cleanupInterval: ReturnType<typeof setInterval> | null = null

function restoreInstagramCommentsJS(): void {
  try {
    const hidden = document.querySelectorAll('[data-ff-comment-hidden]')
    hidden.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.removeAttribute('data-ff-comment-hidden')
      htmlEl.style.removeProperty('display')
    })
  } catch (e) {
    err('restoreInstagramCommentsJS failed:', e)
  }
}

function hideInstagramCommentsJS(): void {
  if (!currentState?.globalEnabled || !currentState?.instagram.hideComments) {
    restoreInstagramCommentsJS()
    return
  }

  try {
    // 1. Hide comments on feed posts (articles)
    const articles = document.querySelectorAll('article')
    articles.forEach((article) => {
      // Find the post author
      let authorUsername: string | null = null
      const headerLinks = article.querySelectorAll('header a, header span a')
      for (const link of headerLinks) {
        const href = link.getAttribute('href')
        if (href && isProfilePath(href)) {
          authorUsername = href.replace(/^\/|\/$/g, '').split('?')[0]
          break
        }
      }

      if (!authorUsername) {
        const allLinks = article.querySelectorAll('a')
        for (const link of allLinks) {
          const href = link.getAttribute('href')
          if (href && isProfilePath(href)) {
            authorUsername = href.replace(/^\/|\/$/g, '').split('?')[0]
            break
          }
        }
      }

      if (!authorUsername) return

      // Hide comments in lists under the post
      const commentLists = article.querySelectorAll('ul')
      commentLists.forEach((ul) => {
        if (ul.closest('header')) return
        const children = ul.children
        let foundCaptionInList = false
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement
          const links = child.querySelectorAll('a')
          let hasAuthorLink = false
          let hasAnyProfileLink = false
          for (const link of links) {
            const href = link.getAttribute('href')
            if (href && isProfilePath(href)) {
              hasAnyProfileLink = true
              const username = href.replace(/^\/|\/$/g, '').split('?')[0]
              if (username === authorUsername) {
                hasAuthorLink = true
              }
            }
          }

          if (hasAnyProfileLink) {
            if (hasAuthorLink && !foundCaptionInList) {
              foundCaptionInList = true
              if (child.hasAttribute('data-ff-comment-hidden')) {
                child.removeAttribute('data-ff-comment-hidden')
                child.style.removeProperty('display')
              }
            } else {
              child.setAttribute('data-ff-comment-hidden', 'true')
              child.style.setProperty('display', 'none', 'important')
            }
          }
        }
      })

      // Hide commenter leaf row divs in the main feed layout
      const divs = article.querySelectorAll('div')
      let foundCaptionInFeed = false
      divs.forEach((div) => {
        if (div === article || div.closest('header') || div.closest('form')) return
        
        const links = div.querySelectorAll('a')
        if (links.length === 0) return

        let hasAuthorLink = false
        let hasAnyProfileLink = false
        let profileLinkCount = 0

        for (const link of links) {
          const href = link.getAttribute('href')
          if (href && isProfilePath(href)) {
            hasAnyProfileLink = true
            profileLinkCount++
            const username = href.replace(/^\/|\/$/g, '').split('?')[0]
            if (username === authorUsername) {
              hasAuthorLink = true
            }
          }
        }

        if (hasAnyProfileLink && profileLinkCount <= 3) {
          const childDivs = div.querySelectorAll('div')
          let hasChildWithProfileLink = false
          for (const childDiv of childDivs) {
            if (childDiv !== div) {
              const childLinks = childDiv.querySelectorAll('a')
              for (const cl of childLinks) {
                const chref = cl.getAttribute('href')
                if (chref && isProfilePath(chref)) {
                  hasChildWithProfileLink = true
                  break
                }
              }
            }
            if (hasChildWithProfileLink) break
          }

          if (!hasChildWithProfileLink) {
            if (hasAuthorLink && !foundCaptionInFeed) {
              foundCaptionInFeed = true
              if (div.hasAttribute('data-ff-comment-hidden')) {
                div.removeAttribute('data-ff-comment-hidden')
                div.style.removeProperty('display')
              }
            } else {
              div.setAttribute('data-ff-comment-hidden', 'true')
              div.style.setProperty('display', 'none', 'important')
            }
          }
        }
      })
    })

    // 2. Hide comments in detail dialog modals (div[role="dialog"])
    const dialogs = document.querySelectorAll('div[role="dialog"]')
    dialogs.forEach((dialog) => {
      let authorUsername: string | null = null
      
      const headerLinks = dialog.querySelectorAll('header a, header span a')
      for (const link of headerLinks) {
        const href = link.getAttribute('href')
        if (href && isProfilePath(href)) {
          authorUsername = href.replace(/^\/|\/$/g, '').split('?')[0]
          break
        }
      }
      if (!authorUsername) {
        const allLinks = dialog.querySelectorAll('a')
        for (const link of allLinks) {
          const href = link.getAttribute('href')
          if (href && isProfilePath(href)) {
            authorUsername = href.replace(/^\/|\/$/g, '').split('?')[0]
            break
          }
        }
      }
      if (!authorUsername) return

      const uls = dialog.querySelectorAll('ul')
      uls.forEach((ul) => {
        if (ul.closest('header')) return
        const children = ul.children
        let foundCaptionInList = false
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement
          const links = child.querySelectorAll('a')
          let hasAuthorLink = false
          let hasAnyProfileLink = false
          for (const link of links) {
            const href = link.getAttribute('href')
            if (href && isProfilePath(href)) {
              hasAnyProfileLink = true
              const username = href.replace(/^\/|\/$/g, '').split('?')[0]
              if (username === authorUsername) {
                hasAuthorLink = true
              }
            }
          }

          if (hasAnyProfileLink) {
            if (hasAuthorLink && !foundCaptionInList) {
              foundCaptionInList = true
              if (child.hasAttribute('data-ff-comment-hidden')) {
                child.removeAttribute('data-ff-comment-hidden')
                child.style.removeProperty('display')
              }
            } else {
              child.setAttribute('data-ff-comment-hidden', 'true')
              child.style.setProperty('display', 'none', 'important')
            }
          }
        }
      })
    })

    // 3. Find and hide "View all X comments" button by text content
    const elements = document.querySelectorAll('span, button, a, div')
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement
      const text = el.textContent || ''
      if (
        (text.includes('View all') || text.includes('View comments') || text.includes('view all')) &&
        (text.includes('comment') || text.includes('comments')) &&
        el.offsetWidth > 0
      ) {
        const container = el.closest('div') || el
        if (container !== document.body && container !== document.documentElement) {
          container.setAttribute('data-ff-comment-hidden', 'true')
          container.style.setProperty('display', 'none', 'important')
        }
      }
    }

    // 4. Hide comment input form wrappers
    const textareas = document.querySelectorAll('textarea[placeholder*="comment"], textarea[aria-label*="comment"]')
    textareas.forEach((textarea) => {
      const form = textarea.closest('form')
      if (form) {
        form.setAttribute('data-ff-comment-hidden', 'true')
        form.style.setProperty('display', 'none', 'important')
      }
      const parentDiv = textarea.closest('div')
      if (parentDiv && parentDiv !== document.body) {
        parentDiv.setAttribute('data-ff-comment-hidden', 'true')
        parentDiv.style.setProperty('display', 'none', 'important')
      }
    })
  } catch (e) {
    err('hideInstagramCommentsJS failed:', e)
  }
}

function applyRules(state: FeedFreeState): void {
  currentState = state
  const rules = getActiveRules(state)
  log('applyRules — globalEnabled:', state.globalEnabled, 'activeRules:', rules.map(r => r.name))
  try {
    updateStyles(rules)
    removeAntiflicker()
    hideInstagramCommentsJS()
  } catch (e) {
    err('applyRules failed:', e)
  }
}

function teardownAll(): void {
  unmountAll()
  restoreInstagramCommentsJS()
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
  patrol?.disconnect()
  patrol = null
  if (heartbeat !== null) {
    clearInterval(heartbeat)
    heartbeat = null
  }
}

function setupPatron(): void {
  if (patrol) return
  patrol = new DOMPatron(() => {
    try {
      if (!currentState) return
      log('Patron detected URL change')
      const r = handleRedirect(currentState)
      if (!r) applyRules(currentState)
    } catch (e) {
      err('Patron callback failed:', e)
    }
  })
  patrol.start()
}

function setupHeartbeat(): void {
  if (heartbeat) return
  heartbeat = setInterval(() => {
    try {
      if (!currentState?.globalEnabled) return
      const redirected = handleRedirect(currentState)
      if (redirected) return
      const rules = getActiveRules(currentState)
      if (rules.length === 0) return
      log('Heartbeat — re-applying rules')
      updateStyles(rules)
      hideInstagramCommentsJS()
    } catch (e) {
      err('Heartbeat failed:', e)
    }
  }, 3000)
}

function setupCleanupInterval(): void {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    if (currentState?.globalEnabled) {
      hideInstagramCommentsJS()
    }
  }, 1000)
}

function handleStateChange(state: FeedFreeState): void {
  try {
    if (!initialized) {
      pendingState = state
      log('Queued state during init — globalEnabled:', state.globalEnabled)
      return
    }

    log('handleStateChange — globalEnabled:', state.globalEnabled, 'instagram:', state.instagram)
    currentState = state

    if (!state.globalEnabled) {
      teardownAll()
      return
    }

    const redirected = handleRedirect(state)
    if (!redirected) applyRules(state)

    setupPatron()
    setupHeartbeat()
    setupCleanupInterval()
  } catch (e) {
    err('handleStateChange failed:', e)
  }
}

function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse): boolean | undefined => {
    try {
      const msg = message as { type: string; state?: FeedFreeState }
      if (msg.type === 'feedfree:state' && msg.state) {
        log('onMessage received — has state:', msg.state.globalEnabled)
        handleStateChange(msg.state)
        sendResponse?.({ ok: true })
      }
    } catch (e) {
      err('onMessage handler failed:', e)
    }
    return undefined
  })
}

async function init(): Promise<void> {
  log('Content script starting...')
  setupMessageListener()

  try {
    const state = await loadState()
    log('State loaded:', state.globalEnabled, state.instagram)

    initialized = true

    if (pendingState) {
      log('Using pending state from message received during init')
      handleStateChange(pendingState)
      pendingState = null
    } else {
      currentState = state
      if (state.globalEnabled) {
        const redirected = handleRedirect(state)
        if (!redirected) applyRules(state)
        setupPatron()
        setupHeartbeat()
        setupCleanupInterval()
      }
    }

    onStateChanged(handleStateChange)
    pollState(handleStateChange)
    log('Content script initialized')
  } catch (e) {
    err('init failed:', e)
  }
}

init()
