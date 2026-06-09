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
        onChange={(v) => setInstagram({ nukeExplore: v })}
      />

      <Row
        label="Hide Stories (Home)"
        hint="Remove the stories tray from the home feed"
        checked={state.instagram.nukeStoriesEverywhere || state.instagram.nukeStoriesHome}
        disabled={disabled || state.instagram.nukeStoriesEverywhere}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeStoriesHome: v })}
      />
      <div style={{ paddingLeft: '16px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
        <Row
          label="Hide Stories Everywhere"
          hint="Remove stories tray, highlights, and story rings"
          checked={state.instagram.nukeStoriesEverywhere}
          disabled={disabled}
          activeColor={activeColor}
          onChange={(v) => {
            if (v) {
              setInstagram({ nukeStoriesEverywhere: true, nukeStoriesHome: true })
            } else {
              setInstagram({ nukeStoriesEverywhere: false })
            }
          }}
        />
      </div>

      <Row
        label="Square Profile Photos"
        hint="Render profile avatars as perfect squares"
        checked={state.instagram.squareProfile}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ squareProfile: v })}
      />

      <Row
        label="Hide Notes"
        hint="Block status note bubbles from profiles and inbox"
        checked={state.instagram.nukeNotes}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeNotes: v })}
      />

      <Row
        label="Hide Likes"
        hint="Hide like counts on posts and reels"
        checked={state.instagram.hideLikes}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ hideLikes: v })}
      />

      <Row
        label="Hide Notifications"
        hint="Remove notifications tab from sidebar"
        checked={state.instagram.nukeNotifications}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeNotifications: v })}
      />
      <Row
        label="Hide Comments"
        hint="Hide comments list, counts, and forms on posts and reels"
        checked={state.instagram.hideComments}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ hideComments: v })}
      />
      <Row
        label="Grayscale Mode"
        hint="Turn Instagram completely black & white"
        checked={state.instagram.grayMode}
        disabled={disabled}
        activeColor={activeColor}
        isLast
        onChange={(v) => setInstagram({ grayMode: v })}
      />
      <div style={{ height: '24px' }} />
    </div>
  )
}
