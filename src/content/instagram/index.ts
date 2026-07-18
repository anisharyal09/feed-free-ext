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

    if (state.instagram.blockDMs && path.startsWith('/direct')) {
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

    if (state.instagram.nukeNotifications && path.startsWith('/notifications')) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
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
    if (!isMainFeed) {
      if (!path.startsWith('/direct')) {
        sessionStorage.removeItem('ff_redirected_to_dms')
      }
      return false
    }

    if (state.instagram.nukeMainFeed) {
      if (sessionStorage.getItem('ff_redirected_to_dms') === 'true') {
        sessionStorage.removeItem('ff_redirected_to_dms')
        const username = getUsernameFromProfileUrl(getProfileUrl())
        if (username) {
          log('Back button loop detected: redirecting to profile instead of DMs')
          location.replace(`/${username}/`)
          return true
        }
      } else {
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
        sessionStorage.setItem('ff_redirected_to_dms', 'true')
        location.replace('/direct/inbox/')
        return true
      }
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

function findActionSection(article: HTMLElement): HTMLElement | null {
  const svgs = article.querySelectorAll('svg')
  for (const svg of svgs) {
    const label = (svg.getAttribute('aria-label') || svg.parentElement?.getAttribute('aria-label') || '').toLowerCase()
    let isActionIcon = false
    
    if (
      label.includes('like') ||
      label.includes('comment') ||
      label.includes('share') ||
      label.includes('save') ||
      label.includes('unlike')
    ) {
      isActionIcon = true
    } else {
      const paths = svg.querySelectorAll('path')
      for (const p of paths) {
        const d = p.getAttribute('d') || ''
        if (d.includes('16.792') || d.includes('20.656')) {
          isActionIcon = true
          break
        }
      }
    }
    
    if (isActionIcon) {
      const parentSection = svg.closest('section')
      if (parentSection && article.contains(parentSection)) {
        return parentSection
      }
      
      let curr: HTMLElement | null = svg.parentElement
      let bestCandidate: HTMLElement | null = null
      while (curr && curr !== article) {
        if (curr.querySelectorAll('svg').length >= 3) {
          if (!curr.querySelector('form, textarea, input, ul')) {
            bestCandidate = curr
          }
        }
        curr = curr.parentElement
      }
      if (bestCandidate) return bestCandidate
    }
  }
  
  const sections = article.querySelectorAll('section')
  for (const sec of sections) {
    if (sec.querySelectorAll('svg').length > 0) {
      return sec as HTMLElement
    }
  }
  
  return null
}

function getLikesElementsForArticle(article: HTMLElement, authorUsername: string | null): HTMLElement[] {
  const likesEls: HTMLElement[] = []
  const actionSection = findActionSection(article)
  if (!actionSection) return likesEls

  const isCaptionEl = (el: HTMLElement): boolean => {
    if (!authorUsername) return false
    const links = el.querySelectorAll('a')
    for (const link of links) {
      const href = link.getAttribute('href')
      if (href) {
        const username = href.replace(/^\/|\/$/g, '').split('?')[0]
        if (username === authorUsername) {
          return true
        }
      }
    }
    return false
  }

  const next = actionSection.nextElementSibling as HTMLElement | null
  if (next) {
    const isDetailsContainer = next.classList.contains('x1o61qjw') || next.classList.contains('x12nagc') || next.querySelector('form, textarea, input, ul, ol')
    if (isDetailsContainer && next.children.length > 0) {
      const child = next.firstElementChild as HTMLElement | null
      if (child && !child.querySelector('form, textarea, input')) {
        const text = (child.textContent || '').trim().toLowerCase()
        const isLikesText = 
          text.includes('like') || 
          text.includes('likes') || 
          text.includes('liked by') ||
          text.includes('gusta') ||
          text.includes('aime') ||
          text.includes('gefällt') ||
          text.includes('piace') ||
          text.includes('curti') ||
          text.includes('нравится') ||
          /^\d+[\d,\.\sKkMm]*$/.test(text)
        
        if (isLikesText && !isCaptionEl(child)) {
          likesEls.push(child)
        }
      }
    } else {
      if (!next.querySelector('form, textarea, input')) {
        const text = (next.textContent || '').trim().toLowerCase()
        const isLikesText = 
          text.includes('like') || 
          text.includes('likes') || 
          text.includes('liked by') ||
          text.includes('gusta') ||
          text.includes('aime') ||
          text.includes('gefällt') ||
          text.includes('piace') ||
          text.includes('curti') ||
          text.includes('нравится') ||
          /^\d+[\d,\.\sKkMm]*$/.test(text)
        
        if (isLikesText && !isCaptionEl(next)) {
          likesEls.push(next)
        }
      }
    }
  }

  const likesLink = article.querySelector('a[href*="/liked_by/"], a[href*="/likers/"]')
  if (likesLink) {
    let curr = likesLink.parentElement
    while (curr && curr !== article) {
      const parent = curr.parentElement
      if (parent === article || (parent && (parent === actionSection.nextElementSibling || parent.classList.contains('x1o61qjw')))) {
        if (!likesEls.includes(curr)) {
          likesEls.push(curr)
        }
        break
      }
      curr = parent
    }
  }

  return likesEls
}

function isLikesElement(el: HTMLElement, article: HTMLElement, authorUsername: string | null): boolean {
  if (el.hasAttribute('data-ff-likes-hidden') || el.closest('[data-ff-likes-hidden]')) {
    return true
  }
  
  const likesEls = getLikesElementsForArticle(article, authorUsername)
  for (const likesEl of likesEls) {
    if (el === likesEl || likesEl.contains(el)) {
      return true
    }
  }
  
  return false
}

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

function restoreInstagramLikesJS(): void {
  try {
    const hidden = document.querySelectorAll('[data-ff-likes-hidden]')
    hidden.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.removeAttribute('data-ff-likes-hidden')
      htmlEl.style.removeProperty('display')
    })
  } catch (e) {
    err('restoreInstagramLikesJS failed:', e)
  }
}

function hideInstagramLikesJS(): void {
  if (!currentState?.globalEnabled || !currentState?.instagram.hideLikes) {
    restoreInstagramLikesJS()
    return
  }

  try {
    // 1. Articles (posts in feed/dialogs)
    const articles = document.querySelectorAll('article')
    articles.forEach((article) => {
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

      // Check all section elements inside the article
      const sections = article.querySelectorAll('section')
      sections.forEach((sec) => {
        if (sec.querySelector('form, textarea, input')) return
        if (sec.querySelector('svg[aria-label="Like"], svg[aria-label="Unlike"], svg[aria-label="Comment"], svg[aria-label="Share"]')) return
        if (sec.classList.contains('x1o61qjw') || sec.classList.contains('x12nagc') || sec.classList.contains('x1gslohp')) return
        
        if (authorUsername) {
          const hasAuthor = sec.querySelector(`a[href="/${authorUsername}/"], a[href="/${authorUsername}"]`)
          if (hasAuthor) return
        }

        const text = sec.textContent || ''
        if (
          text.includes('like') ||
          text.includes('likes') ||
          text.includes('Liked by') ||
          text.includes('views') ||
          text.includes('view') ||
          /^\d+[\d,\.]*\s+(likes|views|like|view)/i.test(text.trim())
        ) {
          sec.setAttribute('data-ff-likes-hidden', 'true')
          sec.style.setProperty('display', 'none', 'important')
        }
      })

      // Hide all identified likes elements
      const likesEls = getLikesElementsForArticle(article, authorUsername)
      likesEls.forEach((el) => {
        el.setAttribute('data-ff-likes-hidden', 'true')
        el.style.setProperty('display', 'none', 'important')
      })
    })

    // 2. Reels and other icons Likes Hiding Fallback (covers Reels page & sidebar action items)
    const allSvgs = document.querySelectorAll('svg')
    
    // Fallback A: Match by heart icon paths or labels
    allSvgs.forEach((svg) => {
      const label = (svg.getAttribute('aria-label') || svg.parentElement?.getAttribute('aria-label') || '').toLowerCase()
      let isHeart = label === 'like' || label === 'unlike'
      
      if (!isHeart) {
        const paths = svg.querySelectorAll('path')
        for (const p of paths) {
          const d = p.getAttribute('d') || ''
          if (d.includes('16.792') || d.includes('12.002') || d.includes('12 21.35')) {
            isHeart = true
            break
          }
        }
      }
      
      if (isHeart) {
        const button = svg.closest('button') || svg.closest('[role="button"]')
        if (button) {
          const children = button.querySelectorAll('span, div')
          children.forEach((child) => {
            if (!child.querySelector('svg')) {
              const text = (child.textContent || '').trim()
              if (/^\d+[\d,\.\sKkMm]*$/.test(text) && text.length < 10) {
                child.setAttribute('data-ff-likes-hidden', 'true');
                (child as HTMLElement).style.setProperty('display', 'none', 'important')
              }
            }
          })
          
          let current: HTMLElement | null = button
          for (let depth = 0; depth < 2; depth++) {
            if (!current) break
            const parent = current.parentElement
            if (parent) {
              const siblings = Array.from(parent.children)
              siblings.forEach((sib) => {
                if (sib !== current && !sib.querySelector('svg') && !sib.querySelector('button, [role="button"]')) {
                  const text = (sib.textContent || '').trim()
                  if (/^\d+[\d,\.\sKkMm]*$/.test(text) && text.length < 10) {
                    sib.setAttribute('data-ff-likes-hidden', 'true');
                    (sib as HTMLElement).style.setProperty('display', 'none', 'important')
                  }
                }
              })
            }
            current = current.parentElement
          }
        }
      }
    })

    // Fallback B: Match Reels Like button via Comment button sibling
    allSvgs.forEach((svg) => {
      let isComment = false
      const label = (svg.getAttribute('aria-label') || svg.parentElement?.getAttribute('aria-label') || '').toLowerCase()
      if (label.includes('comment')) {
        isComment = true
      } else {
        const paths = svg.querySelectorAll('path')
        for (const p of paths) {
          const d = p.getAttribute('d') || ''
          if (d.includes('20.656')) {
            isComment = true
            break
          }
        }
      }
      
      if (isComment) {
        const commentBtn = svg.closest('button') || svg.closest('[role="button"]')
        if (commentBtn) {
          let commentItem: HTMLElement | null = commentBtn
          let verticalBar = commentBtn.parentElement
          while (verticalBar && verticalBar.tagName !== 'BODY') {
            if (verticalBar.children.length >= 3 && Array.from(verticalBar.children).indexOf(commentItem) > 0) {
              break
            }
            commentItem = verticalBar
            verticalBar = verticalBar.parentElement
          }
          
          if (verticalBar && commentItem) {
            const index = Array.from(verticalBar.children).indexOf(commentItem)
            if (index > 0) {
              const likeItem = verticalBar.children[index - 1] as HTMLElement
              const children = likeItem.querySelectorAll('span, div')
              children.forEach((child) => {
                if (!child.querySelector('svg')) {
                  const text = (child.textContent || '').trim()
                  if (/^\d+[\d,\.\sKkMm]*$/.test(text) && text.length < 10) {
                    child.setAttribute('data-ff-likes-hidden', 'true');
                    (child as HTMLElement).style.setProperty('display', 'none', 'important')
                  }
                }
              })
            }
          }
        }
      }
    })
  } catch (e) {
    err('hideInstagramLikesJS failed:', e)
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
        if (ul.closest('header') || ul.closest('section')) return
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
        if (div === article || div.closest('header') || div.closest('form') || div.closest('section')) return
        if (isLikesElement(div, article, authorUsername)) return
        
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

    // 3. Find and hide "View all X comments" button by text content inside main content and dialogs
    const containers = document.querySelectorAll('main, div[role="dialog"]')
    containers.forEach((container) => {
      const elements = container.querySelectorAll('span, button, a, div')
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement
        const text = el.textContent || ''
        if (
          (text.includes('View all') || text.includes('View comments') || text.includes('view all')) &&
          (text.includes('comment') || text.includes('comments')) &&
          el.offsetWidth > 0
        ) {
          const target = el.closest('div') || el
          if (target !== container && target !== document.body && target !== document.documentElement) {
            target.setAttribute('data-ff-comment-hidden', 'true')
            target.style.setProperty('display', 'none', 'important')
          }
        }
      }
    })

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
  if (!state.globalEnabled) return

  const rules = getActiveRules(state)
  log('applyRules — globalEnabled:', state.globalEnabled, 'activeRules:', rules.map(r => r.name))
  try {
    updateStyles(rules)
    removeAntiflicker()
    hideInstagramCommentsJS()
    hideInstagramLikesJS()
  } catch (e) {
    err('applyRules failed:', e)
  }
}

function teardownAll(): void {
  unmountAll()
  restoreInstagramCommentsJS()
  restoreInstagramLikesJS()
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
      hideInstagramLikesJS()
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
      hideInstagramLikesJS()
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
