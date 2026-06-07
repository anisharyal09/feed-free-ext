import { useStore } from '../store'
import { Row } from './Row'

export function YouTubePanel() {
  const state = useStore((s) => s.state)
  const setYouTube = useStore((s) => s.setYouTube)
  const disabled = !state.globalEnabled
  const activeColor = 'var(--youtube)'

  return (
    <div className="flex flex-col">
      <Row
        label="Hide Home Feed"
        hint="Remove recommendations on homepage"
        checked={state.youtube.nukeHomeFeed}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeHomeFeed: v })}
      />
      <Row
        label="Hide Shorts"
        hint="Remove Shorts from sidebar and homepage"
        checked={state.youtube.nukeShorts}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeShorts: v })}
      />
      <Row
        label="Hide Sidebar Recs"
        hint="Clear suggestions next to videos"
        checked={state.youtube.nukeSidebarRecs}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeSidebarRecs: v })}
      />
      <Row
        label="Hide Comments"
        hint="Remove the comments section"
        checked={state.youtube.nukeComments}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeComments: v })}
      />
      <Row
        label="Music Mode"
        hint="Black out video, keep audio playing"
        checked={state.youtube.musicOnlyMode}
        disabled={disabled}
        activeColor={activeColor}
        isLast={!state.youtube.musicOnlyMode}
        onChange={(v) => setYouTube({ musicOnlyMode: v })}
      />
      {state.youtube.musicOnlyMode && (
        <div style={{ paddingLeft: '16px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
          <Row
            label="Show Screen Overlay"
            hint="Display visualizer & controls on black screen"
            checked={state.youtube.musicOnlyShowOverlay}
            disabled={disabled}
            activeColor={activeColor}
            isLast
            onChange={(v) => setYouTube({ musicOnlyShowOverlay: v })}
          />
        </div>
      )}
      <div style={{ height: '24px' }} />
    </div>
  )
}
