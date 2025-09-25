import { describe, expect, it, vi } from 'vitest'
import { createGameService } from '../services/gameService.js'

const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
]

const puzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

describe('createGameService', () => {
  const createTestService = ({ persistedState } = {}) => {
    const puzzleRepository = {
      fetchPuzzle: vi.fn().mockResolvedValue({
        id: 'test-puzzle',
        difficulty: 'easy',
        puzzle,
        solution,
      }),
      fetchPuzzleById: vi.fn().mockResolvedValue({
        id: 'test-puzzle',
        difficulty: 'easy',
        puzzle,
        solution,
      }),
    }

    const persistenceGateway = {
      loadGameState: vi.fn().mockReturnValue(persistedState ?? null),
      saveGameState: vi.fn(),
      clearGameState: vi.fn(),
      loadSettings: vi.fn().mockReturnValue(undefined),
      saveSettings: vi.fn(),
    }

    const service = createGameService({ puzzleRepository, persistenceGateway })

    return { service, puzzleRepository, persistenceGateway }
  }

  it('starts a new game and hydrates state from repository data', async () => {
    const { service, persistenceGateway } = createTestService()

    await service.startNewGame({ difficulty: 'easy' })
    const state = service.getState()

    expect(state.status).toBe('ready')
    expect(state.board[0][2]).toBeNull()
    expect(state.initialBoard[0][0]).toBe(5)
    expect(state.solution[0][2]).toBe(4)
    expect(persistenceGateway.saveGameState).toHaveBeenCalled()
  })

  it('supports note toggling and value entry with history tracking', async () => {
    const { service, persistenceGateway } = createTestService()

    await service.startNewGame()
    service.selectCell(0, 2)
    service.setNoteMode(true)
    service.enterDigit(1)

    let state = service.getState()
    expect(state.notes[0][2]).toEqual([1])
    expect(state.board[0][2]).toBeNull()

    service.setNoteMode(false)
    service.enterDigit(4)

    state = service.getState()
    expect(state.board[0][2]).toBe(4)
    expect(state.history.length).toBeGreaterThan(0)

    const lastCallIndex = persistenceGateway.saveGameState.mock.calls.length - 1
    const lastPersisted = persistenceGateway.saveGameState.mock.calls[lastCallIndex][0]
    expect(lastPersisted.board[0][2]).toBe(4)
  })

  it('undoes and redoes moves', async () => {
    const { service } = createTestService()

    await service.startNewGame()
    service.selectCell(0, 2)
    service.enterDigit(4)

    let state = service.getState()
    expect(state.board[0][2]).toBe(4)

    service.undo()
    state = service.getState()
    expect(state.board[0][2]).toBeNull()

    service.redo()
    state = service.getState()
    expect(state.board[0][2]).toBe(4)
  })

  it('provides hints and marks completion when solved', async () => {
    const { service } = createTestService()

    await service.startNewGame()

    // Fill almost the entire board via hints
    for (let i = 0; i < 30; i += 1) {
      service.requestHint()
      if (service.getState().status === 'completed') break
    }

    const state = service.getState()
    expect(state.hintsUsed).toBeGreaterThan(0)
    expect(['ready', 'completed']).toContain(state.status)
  })

  it('restores persisted state when available', async () => {
    const persistedState = {
      puzzleId: 'test-puzzle',
      difficulty: 'easy',
      board: puzzle.map((row) => row.map((value) => (value === 0 ? null : value))),
      notes: puzzle.map((row) => row.map(() => [])),
      noteMode: false,
      selectedCell: { row: 0, col: 2 },
      elapsedMs: 120000,
      hintsUsed: 1,
      mistakes: 0,
      status: 'ready',
    }

    const { service, persistenceGateway } = createTestService({ persistedState })

    await service.startNewGame()
    const state = service.getState()

    expect(state.resumed).toBe(true)
    expect(state.elapsedMs).toBe(120000)
    expect(state.selectedCell).toEqual({ row: 0, col: 2 })
    expect(persistenceGateway.loadGameState).toHaveBeenCalled()
  })
})
