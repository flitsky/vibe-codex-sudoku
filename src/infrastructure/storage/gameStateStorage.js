import { createLocalStorageAdapter } from './localStorageAdapter.js'

const STORAGE_VERSION = 1
const GAME_STATE_KEY = 'game-state'
const SETTINGS_KEY = 'settings'

const wrap = (payload) => ({
  version: STORAGE_VERSION,
  savedAt: Date.now(),
  data: payload,
})

const unwrap = (payload) => {
  if (!payload || typeof payload !== 'object') return null
  if (payload.version !== STORAGE_VERSION) return null
  return payload.data ?? null
}

const DEFAULT_SETTINGS = {
  effectsEnabled: true,
  soundEnabled: true,
  notesAutoFill: false,
  colorBlindMode: false,
}

export const createGameStateStorage = ({ storage = createLocalStorageAdapter() } = {}) => {
  return {
    isPersistent: storage.isPersistent,
    loadGameState() {
      const stored = storage.get(GAME_STATE_KEY)
      return unwrap(stored)
    },
    saveGameState(state) {
      storage.set(GAME_STATE_KEY, wrap(state))
    },
    clearGameState() {
      storage.remove(GAME_STATE_KEY)
    },
    loadSettings() {
      const stored = storage.get(SETTINGS_KEY, DEFAULT_SETTINGS)
      return { ...DEFAULT_SETTINGS, ...(stored ?? {}) }
    },
    saveSettings(settings) {
      storage.set(SETTINGS_KEY, { ...DEFAULT_SETTINGS, ...(settings ?? {}) })
    },
  }
}
