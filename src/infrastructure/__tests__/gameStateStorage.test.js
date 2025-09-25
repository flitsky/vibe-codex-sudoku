import { describe, expect, it } from 'vitest'
import { createGameStateStorage } from '../storage/gameStateStorage.js'
import { createLocalStorageAdapter } from '../storage/localStorageAdapter.js'

describe('GameStateStorage', () => {
  it('persists and retrieves the latest game state snapshot', () => {
    const storage = createLocalStorageAdapter({ namespace: 'test-game' })
    const gateway = createGameStateStorage({ storage })
    const snapshot = {
      board: [[1, null], [null, 2]],
      notes: [[[1], []]],
      difficulty: 'easy',
      elapsedMs: 42000,
    }

    gateway.saveGameState(snapshot)
    const loaded = gateway.loadGameState()

    expect(loaded).toMatchObject(snapshot)
  })

  it('resets stored game state', () => {
    const gateway = createGameStateStorage({
      storage: createLocalStorageAdapter({ namespace: 'reset-game' }),
    })

    gateway.saveGameState({ foo: 'bar' })
    gateway.clearGameState()

    expect(gateway.loadGameState()).toBeNull()
  })

  it('merges settings with defaults on load', () => {
    const gateway = createGameStateStorage({
      storage: createLocalStorageAdapter({ namespace: 'settings' }),
    })

    gateway.saveSettings({ effectsEnabled: false })
    const settings = gateway.loadSettings()

    expect(settings.effectsEnabled).toBe(false)
    expect(settings.soundEnabled).toBe(true)
    expect(settings.notesAutoFill).toBe(false)
  })
})
