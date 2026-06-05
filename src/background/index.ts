// Background service worker: ensures state is initialized on startup.
import { loadState } from '../utils/storage'

async function init(): Promise<void> {
  // Load state from local storage; if uninitialized, set default configuration parameters.
  await loadState()
}

init()
