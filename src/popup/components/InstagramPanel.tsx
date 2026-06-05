import { useStore } from '../store'
import { Row } from './Row'

export function InstagramPanel() {
  const state = useStore((s) => s.state)
  const setInstagram = useStore((s) => s.setInstagram)
  const disabled = !state.globalEnabled
  const activeColor = 'var(--instagram)'

  const redirectOn = state.instagram.nukeMainFeed
  const blockOn = state.instagram.blockDMs
  const hasConflict = redirectOn && blockOn
  const target = state.instagram.conflictRedirectTarget

  return (
    <div className="flex flex-col">
      <Row
        label="Redirect Home to Following"
        hint="Instead of Home Feed, redirects to Following feed"
        checked={state.instagram.forceChronological}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ forceChronological: v })}
      />
      <Row
        label="Redirect to DMs from Home"
        hint="Go straight to messages instead of feed"
        checked={redirectOn}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeMainFeed: v })}
      />
      <Row
        label="Hide DMs"
        hint="Hide DM nav and redirect away from messages"
        checked={blockOn}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ blockDMs: v })}
      />

      {hasConflict && (
        <div
          className="mx-2.5 my-2.5 px-3 py-3 rounded-lg border bg-white/[0.02] flex flex-col gap-2"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: 'var(--muted)' }}>
            Both ON*, redirect to:
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setInstagram({ conflictRedirectTarget: 'profile' })}
              className="flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all duration-150 cursor-pointer border border-transparent"
              style={{
                background: target === 'profile' ? 'var(--instagram)' : 'rgba(255, 255, 255, 0.04)',
                color: '#fff',
                borderColor: target === 'profile' ? 'transparent' : 'var(--border)',
                boxShadow: target === 'profile' ? '0 2px 8px rgba(217, 70, 239, 0.25)' : 'none'
              }}
            >
              Profile
            </button>
            <button
              onClick={() => setInstagram({ conflictRedirectTarget: 'saved' })}
              className="flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all duration-150 cursor-pointer border border-transparent"
              style={{
                background: target === 'saved' ? 'var(--instagram)' : 'rgba(255, 255, 255, 0.04)',
                color: '#fff',
                borderColor: target === 'saved' ? 'transparent' : 'var(--border)',
                boxShadow: target === 'saved' ? '0 2px 8px rgba(217, 70, 239, 0.25)' : 'none'
              }}
            >
              Saved
            </button>
          </div>
        </div>
      )}

      <Row
        label="Hide Reels"
        hint="Block Reels from navigation & redirects"
        checked={state.instagram.nukeReels}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeReels: v })}
      />
      <Row
        label="Hide Explore"
        hint="Remove Explore tab & auto-redirects"
        checked={state.instagram.nukeExplore}
        disabled={disabled}
        activeColor={activeColor}
        isLast
        onChange={(v) => setInstagram({ nukeExplore: v })}
      />
      <div style={{ height: '24px' }} />
    </div>
  )
}
