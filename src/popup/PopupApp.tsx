import { useEffect, useState } from 'react'
import { useStore } from './store'
import { Toggle } from './components/Toggle'
import { YouTubePanel } from './components/YouTubePanel'
import { InstagramPanel } from './components/InstagramPanel'
import { CURRENT_VERSION } from '../config/defaults'

type Site = 'youtube' | 'instagram' | 'other'

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

export default function PopupApp() {
  const init = useStore((s) => s.init)
  const loaded = useStore((s) => s.loaded)
  const globalEnabled = useStore((s) => s.state.globalEnabled)
  const setGlobal = useStore((s) => s.setGlobal)
  const resetAll = useStore((s) => s.resetAll)

  const [currentSite, setCurrentSite] = useState<Site>('other')
  const [activeTab, setActiveTab] = useState<'youtube' | 'instagram'>('youtube')

  useEffect(() => {
    init()
    detectSite().then((site) => {
      setCurrentSite(site)
      if (site === 'youtube' || site === 'instagram') {
        setActiveTab(site)
      }
    })
  }, [init])

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
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] flex items-center justify-center overflow-hidden rounded-lg">
            <img src="/icons/icon128.png" alt="Logo" className="w-[125%] h-[125%] max-w-none object-cover mix-blend-screen" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold uppercase tracking-widest text-slate-100 flex items-center gap-1.5">
              FF - UF
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-badge" />
            </span>
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
              Feed Free - Unbiased Feed
            </span>
          </div>
        </div>
        <button
          onClick={resetAll}
          style={{ padding: '6px 12px' }}
          className="text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-150 cursor-pointer bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white text-slate-400 active:scale-95"
        >
          Reset
        </button>
      </header>

      {/* Global Toggle Card */}
      <section>
        <div
          onClick={() => setGlobal(!globalEnabled)}
          className="rounded-xl flex items-center justify-between border transition-all duration-300 cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.01]"
          style={{
            background: globalEnabled ? 'rgba(16, 185, 129, 0.02)' : 'var(--surface)',
            borderColor: globalEnabled ? 'rgba(16, 185, 129, 0.3)' : 'var(--surface-border)',
            boxShadow: globalEnabled ? '0 0 16px rgba(16, 185, 129, 0.03)' : 'none',
            padding: '12px 16px',
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${globalEnabled ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
                }`}
            />
            <span className="text-[12.5px] font-bold text-slate-200">
              {globalEnabled ? 'Feed Free Active' : 'Feed Free Inactive'}
            </span>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle checked={globalEnabled} onChange={setGlobal} />
          </div>
        </div>
      </section>

      {/* Segmented Tab Switcher */}
      <section>
        <div
          className="flex rounded-xl bg-slate-950/[0.4] border border-white/[0.04]"
          style={{ padding: '3px' }}
        >
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 relative cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'youtube'
              ? 'bg-slate-900 text-white border border-white/[0.06] shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <svg
              className="w-4 h-4"
              fill={activeTab === 'youtube' ? 'var(--youtube)' : 'currentColor'}
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
            {currentSite === 'youtube' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2" title="Active Page" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 relative cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'instagram'
              ? 'bg-slate-900 text-white border border-white/[0.06] shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke={activeTab === 'instagram' ? 'var(--instagram)' : 'currentColor'}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram
            {currentSite === 'instagram' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2" title="Active Page" />
            )}
          </button>
        </div>
      </section>

      {/* Platform Options Container */}
      <main
        className="flex-1 rounded-xl border flex flex-col overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--surface-border)',
          padding: '3px',
        }}
      >
        <div className="flex-1 overflow-y-auto" style={{ padding: '3px' }}>
          {activeTab === 'youtube' && <YouTubePanel />}
          {activeTab === 'instagram' && <InstagramPanel />}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="flex items-center justify-between text-[9px] text-slate-500 font-semibold tracking-wide border-t"
        style={{
          paddingTop: '12px',
          borderColor: 'rgba(255, 255, 255, 0.04)',
        }}
      >
        <a
          href="https://github.com/anisharyal09/feed-free-ext"
          target="_blank"
          rel="noopener noreferrer"
          className="tooltip flex items-center active:scale-95 transition-opacity duration-150 opacity-70 hover:opacity-100"
          data-tooltip="100% Local & Secure - GitHub Repo"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </a>
        <a
          href="https://anisharyal09.com.np/support?from=feed-free"
          target="_blank"
          rel="noopener noreferrer"
          className="tooltip flex items-center active:scale-95 transition-opacity duration-150 opacity-70 hover:opacity-100"
          data-tooltip="Support me <3"
        >
          <svg className="w-3.5 h-3.5 text-rose-400/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </a>
        <a
          href="https://github.com/anisharyal09/feed-free-ext/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener noreferrer"
          className="tooltip tooltip-left shrink-0 hover:underline transition-all duration-150 opacity-70 hover:opacity-100 text-slate-500 hover:text-slate-300"
          data-tooltip="View Changelog"
        >
          v{CURRENT_VERSION}
        </a>
      </footer>
    </div>
  )
}