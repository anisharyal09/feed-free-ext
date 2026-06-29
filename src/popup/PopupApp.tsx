import { useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from './store'
import { YouTubePanel } from './components/YouTubePanel'
import { InstagramPanel } from './components/InstagramPanel'
import { CURRENT_VERSION } from '../config/defaults'

type Site = 'youtube' | 'instagram' | 'other'
type SelectedSite = 'auto' | 'youtube' | 'instagram'

async function detectSite(): Promise<Site> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = tab?.url ?? ''
    if (url.includes('youtube.com')) return 'youtube'
    if (url.includes('instagram.com')) return 'instagram'
    return 'other'
  } catch {
    return 'other'
  }
}

function getSiteLabel(site: SelectedSite): string {
  switch (site) {
    case 'auto':
      return 'Auto'
    case 'youtube':
      return 'YouTube'
    case 'instagram':
      return 'Instagram'
  }
}

function getSiteIcon(site: SelectedSite) {
  switch (site) {
    case 'auto':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    case 'youtube':
      return (
        <svg className="w-4 h-4" fill="var(--youtube)" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className="w-4 h-4" fill="none" stroke="var(--instagram)" strokeWidth="2.5" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
  }
}

export default function PopupApp() {
  const init = useStore((s) => s.init)
  const loaded = useStore((s) => s.loaded)
  const globalEnabled = useStore((s) => s.state.globalEnabled)
  const setGlobal = useStore((s) => s.setGlobal)
  const resetAll = useStore((s) => s.resetAll)

  const [currentSite, setCurrentSite] = useState<Site>('other')
  const [selectedSite, setSelectedSite] = useState<SelectedSite>('auto')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(true)
  const [showTopFade, setShowTopFade] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isResetting, setIsResetting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    init()
    detectSite().then((site) => {
      setCurrentSite(site)
    })
    chrome.storage.local.get('ff-theme').then((r) => {
      const t = (r['ff-theme'] as 'dark' | 'light' | undefined) || 'dark'
      setTheme(t)
    })
  }, [init])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const root = document.getElementById('popup-root')
    if (root) root.setAttribute('data-theme', theme)
    chrome.storage.local.set({ 'ff-theme': theme })
  }, [theme])

  const handleScroll = useCallback(() => {
    const el = contentRef.current
    if (el) {
      setShowBottomFade(el.scrollHeight - el.scrollTop - el.clientHeight > 12)
      setShowTopFade(el.scrollTop > 12)
    }
  }, [])

  const effectiveSite = selectedSite === 'auto' ? currentSite : selectedSite
  const isSupportedSite = effectiveSite === 'youtube' || effectiveSite === 'instagram'
  const showUnsupportedMessage = selectedSite === 'auto' && currentSite === 'other'

  useEffect(() => {
    const timer = setTimeout(() => {
      handleScroll()
    }, 100)
    return () => clearTimeout(timer)
  }, [effectiveSite, globalEnabled, handleScroll])

  if (!loaded) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: '100%', height: '480px', background: 'var(--bg)' }}
      >
        <div
          className="w-6 h-6 rounded-full animate-spin border-2 border-slate-700"
          style={{ borderTopColor: 'var(--accent)' }}
        />
      </div>
    )
  }

  return (
    <div
      id="popup-root"
      className="flex flex-col select-none"
      style={{
        width: '100%',
        minHeight: '480px',
        maxHeight: '540px',
        background: 'var(--bg)',
        backgroundImage: 'var(--bg-gradient)',
        color: 'var(--text)',
        padding: '16px',
        gap: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between"
        style={{
          paddingBottom: '12px',
          borderBottom: '1px solid var(--header-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] flex items-center justify-center overflow-hidden rounded-lg" style={{ background: 'var(--surface)' }}>
            <img src="/icons/icon128.png" alt="Logo" className="w-[125%] h-[125%] max-w-none object-cover" style={{ mixBlendMode: theme === 'light' ? 'multiply' : 'screen' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              FF - UF
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-badge" />
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
              Feed Free - Unbiased Feed
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{ padding: '7px', background: 'var(--btn-bg)', borderColor: 'var(--btn-border)' }}
            className="rounded-lg transition-all duration-150 cursor-pointer border hover:brightness-110 active:scale-95 flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}>
              {theme === 'dark' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              )}
            </svg>
          </button>

          {/* Site Selector Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ padding: '7px 10px', background: 'var(--btn-bg)', borderColor: 'var(--btn-border)' }}
              className="rounded-lg transition-all duration-150 cursor-pointer border hover:brightness-110 active:scale-95 flex items-center gap-1.5"
              title={`Active Filter: ${getSiteLabel(selectedSite)}`}
            >
              {getSiteIcon(selectedSite)}
              <svg
                className={`w-2.5 h-2.5 transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ color: 'var(--muted)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 rounded-xl border backdrop-blur-md shadow-xl animate-dropdown-in flex flex-col gap-1"
                style={{
                  width: '144px',
                  padding: '8px 6px',
                  background: 'var(--dropdown-menu-bg)',
                  borderColor: 'var(--surface-border)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
                }}>
                <button
                  onClick={() => { setSelectedSite('auto'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 pl-4 pr-3 py-2 text-left transition-all duration-150 active:scale-[0.98] cursor-pointer rounded-lg"
                  style={{ color: 'var(--text)', background: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0" style={{ background: 'var(--btn-bg)' }}>
                    {getSiteIcon('auto')}
                  </div>
                  <span className="text-[11px] font-bold block flex-1">Auto Detect</span>
                  {selectedSite === 'auto' && (
                    <svg className="w-3.5 h-3.5 shrink-0" fill="var(--accent)" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1000-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => { setSelectedSite('youtube'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 pl-4 pr-3 py-2 text-left transition-all duration-150 active:scale-[0.98] cursor-pointer rounded-lg"
                  style={{ color: 'var(--text)', background: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0" style={{ background: 'var(--btn-bg)' }}>
                    {getSiteIcon('youtube')}
                  </div>
                  <span className="text-[11px] font-bold block flex-1">YouTube</span>
                  {selectedSite === 'youtube' && (
                    <svg className="w-3.5 h-3.5 shrink-0" fill="var(--accent)" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1000-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => { setSelectedSite('instagram'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 pl-4 pr-3 py-2 text-left transition-all duration-150 active:scale-[0.98] cursor-pointer rounded-lg"
                  style={{ color: 'var(--text)', background: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0" style={{ background: 'var(--btn-bg)' }}>
                    {getSiteIcon('instagram')}
                  </div>
                  <span className="text-[11px] font-bold block flex-1">Instagram</span>
                  {selectedSite === 'instagram' && (
                    <svg className="w-3.5 h-3.5 shrink-0" fill="var(--accent)" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1000-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Controls Row */}
      <section className="flex flex-row items-center gap-2.5">
        {/* Feed Free Global Toggle */}
        <div style={{ flex: 1.65, minWidth: 0 }}>
          <button
            onClick={() => setGlobal(!globalEnabled)}
            className="w-full rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 hover:brightness-110 active:scale-[0.98]"
            style={{
              height: '32px',
              paddingLeft: '11px',
              paddingRight: '11px',
              background: globalEnabled
                ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))'
                : 'var(--surface)',
              borderColor: globalEnabled ? 'var(--accent)' : 'var(--surface-border)',
              boxShadow: globalEnabled ? '0 0 16px var(--accent-glow)' : 'none',
              fontFamily: 'inherit',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={globalEnabled ? 'var(--accent)' : 'var(--muted)'}>
                {globalEnabled ? (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </>
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21" />
                  </>
                )}
              </svg>
              <span className="text-[12.5px] font-bold tracking-tight truncate" style={{ color: globalEnabled ? 'var(--text)' : 'var(--muted)' }}>
                Feed Free
              </span>
            </div>

            <div className="shrink-0 flex items-center">
              <div
                style={{
                  backgroundColor: globalEnabled ? 'var(--accent)' : 'var(--border)',
                }}
                className="relative w-[30px] h-[16px] rounded-full transition-all duration-200"
              >
                <div
                  style={{
                    backgroundColor: '#fff',
                  }}
                  className={`absolute top-[3px] left-[3px] w-[10px] h-[10px] rounded-full transition-transform duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${globalEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`}
                />
              </div>
            </div>
          </button>
        </div>

        {/* Reset Button */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            onClick={() => {
              setIsResetting(true)
              resetAll()
              setTimeout(() => setIsResetting(false), 600)
            }}
            style={{ height: '32px', background: 'var(--btn-bg)', borderColor: 'var(--btn-border)', paddingLeft: '11px', paddingRight: '11px' }}
            className="w-full rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.98]"
            title="Reset All Settings"
          >
            <svg className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin-once' : ''}`} fill="none" stroke="var(--muted)" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Reset</span>
          </button>
        </div>
      </section>

      {showUnsupportedMessage && (
        <section className="flex-1 flex items-center justify-center px-1">
          <div className="rounded-2xl border text-center animate-fade-in w-full flex flex-col items-center justify-center"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--surface-border)',
              padding: '32px 24px',
              minHeight: '220px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(251, 146, 60, 0.1)',
                border: '1.5px solid rgba(251, 146, 60, 0.25)',
                boxShadow: '0 0 20px rgba(251, 146, 60, 0.05)',
              }}>
              <svg className="w-6 h-6" fill="none" stroke="rgb(251, 146, 60)" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-[16px] font-extrabold tracking-wide" style={{ color: 'var(--text)' }}>Oops!</h3>
            <div className="h-px w-10 my-3" style={{ background: 'var(--border)' }} />
            <p className="text-[12.5px] font-bold mb-1.5 leading-relaxed" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Feed Free is not supported for this website.
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)', opacity: 0.9 }}>
              Currently works on YouTube & Instagram only.
            </p>
          </div>
        </section>
      )}

      {isSupportedSite && !showUnsupportedMessage && (
        <main
          className="flex-1 rounded-xl border flex flex-col overflow-hidden relative"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--surface-border)',
            padding: '3px',
          }}
        >
          {showTopFade && (
            <div
              className="absolute top-1 left-0 right-0 h-8 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, var(--surface) 8%, transparent 100%)',
              }}
            />
          )}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
            style={{ padding: '3px' }}
          >
            {effectiveSite === 'youtube' && <YouTubePanel />}
            {effectiveSite === 'instagram' && <InstagramPanel />}
          </div>
          {showBottomFade && (
            <>
              <div
                className="absolute bottom-1 left-0 right-0 h-8 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to top, var(--surface) 8%, transparent 100%)',
                }}
              />
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-0.5 z-20">
                <svg className="w-3.5 h-3.5 animate-scroll-arrow" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
                </svg>
              </div>
            </>
          )}
        </main>
      )}

      {/* Footer */}
      <footer
        className="flex items-center justify-between text-[9px] font-semibold tracking-wide relative"
        style={{
          paddingTop: '12px',
          color: 'var(--muted)',
        }}
      >
        <div
          className="absolute top-0 left-4 right-4 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.12), rgba(168,85,247,0.12), transparent)',
          }}
        />
        <a
          href="https://github.com/anisharyal09/feed-free-ext"
          target="_blank"
          rel="noopener noreferrer"
          className="tooltip flex items-center active:scale-95 transition-all duration-150 opacity-60 hover:opacity-100 hover:scale-110"
          data-tooltip="100% Local & Secure - GitHub Repo"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </a>
        <a
          href="https://anisharyal09.com.np/support?from=feed-free"
          target="_blank"
          rel="noopener noreferrer"
          className="tooltip flex items-center active:scale-95 transition-all duration-150 opacity-60 hover:opacity-100 hover:scale-110"
          data-tooltip="Support me <3"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </a>
        <a
          href="https://github.com/anisharyal09/feed-free-ext/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener noreferrer"
          className="tooltip tooltip-left shrink-0 hover:underline transition-all duration-150 opacity-60 hover:opacity-100 hover:scale-105"
          data-tooltip="View Changelog"
        >
          v{CURRENT_VERSION}
        </a>
      </footer>
    </div>
  )
}