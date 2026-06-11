import { useEffect, useState } from 'react'
import { useStore } from './store'
import { Toggle } from './components/Toggle'
import { YouTubePanel } from './components/YouTubePanel'
import { InstagramPanel } from './components/InstagramPanel'

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
          className="tooltip flex items-center active:scale-95"
          data-tooltip="100% Local & Secure - GitHub Repo"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400/80 hover:text-emerald-300 transition-colors duration-150" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </a>
        <a
          href="https://ko-fi.com/anisharyal09"
          target="_blank"
          rel="noopener noreferrer"
          className="tooltip flex items-center text-slate-500 hover:text-[#FF5E5B] transition-colors duration-150 active:scale-95"
          data-tooltip="Support me on Ko-fi!"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M.5 6a.5.5 0 0 0-.488.608l1.652 7.434A2.5 2.5 0 0 0 4.104 16h5.792a2.5 2.5 0 0 0 2.44-1.958l.131-.59a3 3 0 0 0 1.3-5.854l.221-.99A.5.5 0 0 0 13.5 6zM13 12.5a2 2 0 0 1-.316-.025l.867-3.898A2.001 2.001 0 0 1 13 12.5" />
            <path d="m4.4.8-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.253.382l-.018.025-.005.008-.002.002A.5.5 0 0 1 3.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 3.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 3 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 4.4.8m3 0-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.253.382l-.018.025-.005.008-.002.002A.5.5 0 0 1 6.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 6.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 6 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 7.4.8m3 0-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.253.382l-.018.025-.005.008-.002.002A.5.5 0 0 1 9.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 9.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 9 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 10.4.8" />
          </svg>
        </a>
        <a
          href="mailto:anish.creations.hq@gmail.com?subject=[Feed%20Free%20Extension]%20Support%20/%20Feedback"
          className="tooltip flex items-center text-slate-500 hover:text-emerald-400 transition-colors duration-150 active:scale-95"
          data-tooltip="Contact (Support / Feedback)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </a>
        <div className="shrink-0">v1.2.2</div>
      </footer>
    </div>
  )
}