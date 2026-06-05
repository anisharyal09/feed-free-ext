import type { FeedFreeState } from '../types'
import { STORAGE_KEY, CURRENT_VERSION, createDefaultState } from '../config/defaults'

type MigrationFn = (data: Record<string, unknown>) => Record<string, unknown>

const migrations: Record<string, MigrationFn> = {
  '1.0.0': (data) => {
    delete data.lock
    const yt = data.youtube as Record<string, unknown> | undefined
    if (yt) delete yt.showUnbiasedFeed
    const ig = data.instagram as Record<string, unknown> | undefined
    if (ig) delete ig.showUnbiasedFeed
    return data
  },
}

function applyMigrations(raw: Record<string, unknown>): FeedFreeState {
  const currentVersion = (raw.version as string) || '0.0.0'

  if (currentVersion === CURRENT_VERSION) {
    return raw as unknown as FeedFreeState
  }

  let migrated = { ...raw }
  const versionKeys = Object.keys(migrations).sort()

  for (const version of versionKeys) {
    migrated = migrations[version](migrated)
    migrated.version = version
  }

  // Force strip lock if it still exists
  delete migrated.lock
  return migrated as unknown as FeedFreeState
}

export async function loadState(): Promise<FeedFreeState> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    const raw = result[STORAGE_KEY]
    if (!raw) {
      const defaults = createDefaultState()
      await chrome.storage.local.set({ [STORAGE_KEY]: defaults })
      return defaults
    }
    const migrated = applyMigrations(raw)
    await chrome.storage.local.set({ [STORAGE_KEY]: migrated })
    return migrated
  } catch {
    const defaults = createDefaultState()
    await chrome.storage.local.set({ [STORAGE_KEY]: defaults })
    return defaults
  }
}

export async function saveState(state: FeedFreeState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state })
}

export function onStateChanged(
  callback: (state: FeedFreeState) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue as FeedFreeState)
    }
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}

const POLL_INTERVAL = 2000

export function pollState(
  callback: (state: FeedFreeState) => void,
): () => void {
  let lastJson = ''
  const id = setInterval(async () => {
    try {
      const state = await loadState()
      const json = JSON.stringify(state)
      if (json !== lastJson) {
        lastJson = json
        callback(state)
      }
    } catch {
      /* silent */
    }
  }, POLL_INTERVAL)
  return () => clearInterval(id)
}
