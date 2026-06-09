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
        checked={state.youtube.nukeShortsFromProfiles || state.youtube.nukeShorts}
        disabled={disabled || state.youtube.nukeShortsFromProfiles}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeShorts: v })}
      />
      <div style={{ paddingLeft: '16px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
        <Row
          label="Hide Shorts Everywhere"
          hint="Remove Shorts tab and thumbnails from channel pages"
          checked={state.youtube.nukeShortsFromProfiles}
          disabled={disabled}
          activeColor={activeColor}
          onChange={(v) => {
            if (v) {
              setYouTube({ nukeShortsFromProfiles: true, nukeShorts: true })
            } else {
              setYouTube({ nukeShortsFromProfiles: false })
            }
          }}
        />
      </div>
      <Row
        label="Hide Recommendations"
        hint="Clear suggestions next to videos & playlists"
        checked={state.youtube.nukeSidebarRecs}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeSidebarRecs: v })}
      />
      <Row
        label="Hide Entire Sidebar"
        hint="Remove sidebar completely, stretching player"
        checked={state.youtube.nukeSidebar}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeSidebar: v })}
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
        label="Hide End Screens"
        hint="Remove video card overlays at the end"
        checked={state.youtube.nukeEndScreens}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeEndScreens: v })}
      />
      <Row
        label="Hide Subscriptions"
        hint="Remove Subscriptions link from sidebar"
        checked={state.youtube.nukeSubscriptions}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeSubscriptions: v })}
      />
      <Row
        label="Hide Explore"
        hint="Remove Trending link from sidebar"
        checked={state.youtube.nukeExplore}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeExplore: v })}
      />

      <Row
        label="Hide Report History"
        hint="Remove Report History link from sidebar"
        checked={state.youtube.nukeReportHistory}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeReportHistory: v })}
      />
      <Row
        label="Hide More from YouTube"
        hint="Remove 'More from YouTube' section from sidebar"
        checked={state.youtube.nukeMoreFromYouTube}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeMoreFromYouTube: v })}
      />
      <Row
        label="Music Mode"
        hint="Black out video, keep audio playing"
        checked={state.youtube.musicOnlyMode}
        disabled={disabled}
        activeColor={activeColor}
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
            onChange={(v) => setYouTube({ musicOnlyShowOverlay: v })}
          />
        </div>
      )}
      <Row
        label="Grayscale Mode"
        hint="Turn YouTube completely black & white"
        checked={state.youtube.grayMode}
        disabled={disabled}
        activeColor={activeColor}
        isLast
        onChange={(v) => setYouTube({ grayMode: v })}
      />
      <div style={{ height: '24px' }} />
    </div>
  )
}
