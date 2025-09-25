import { BOARD_SIZE } from '../../shared/constants.js'
import {
  createEmptyBoard,
  mapPuzzleToBoard,
  createGivenMaskFromPuzzle,
  cloneBoard,
  isWithinBoard,
} from '../../domain/entities/board.js'
import {
  collectConflicts,
  isBoardSolved,
  isMoveAllowed,
} from '../../domain/services/validation.js'
import { findNextHint } from '../../domain/services/hints.js'

const DEFAULT_DIFFICULTY = 'easy'
const MAX_HISTORY = 200
const MISTAKE_LIMIT = 3

const DEFAULT_SETTINGS = {
  effectsEnabled: true,
  soundEnabled: true,
  notesAutoFill: false,
  colorBlindMode: false,
}

const createEmptyNotes = () =>
  Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => []))

const cloneNotes = (notes) => notes.map((row) => row.map((cell) => [...cell]))

const safeCloneNotes = (notes, fallback) => {
  try {
    return cloneNotes(notes)
  } catch {
    return cloneNotes(fallback)
  }
}

const safeCloneBoard = (board, fallback) => {
  try {
    return cloneBoard(board)
  } catch {
    return cloneBoard(fallback)
  }
}

const normaliseSelectedCell = (selected) => {
  if (!selected) return null
  const { row, col } = selected
  if (!isWithinBoard(row, col)) return null
  return { row, col }
}

const normaliseNotes = (notes) => {
  if (!Array.isArray(notes)) return createEmptyNotes()

  return notes.map((row) => {
    if (!Array.isArray(row) || row.length !== BOARD_SIZE) {
      return Array.from({ length: BOARD_SIZE }, () => [])
    }

    return row.map((cell) => {
      if (!Array.isArray(cell)) return []

      const unique = [...new Set(cell.filter((value) => Number.isInteger(value) && value >= 1 && value <= 9))]
      return unique.sort((a, b) => a - b)
    })
  })
}

const createSnapshot = (state) => ({
  board: cloneBoard(state.board),
  notes: cloneNotes(state.notes),
  selectedCell: state.selectedCell ? { ...state.selectedCell } : null,
  noteMode: state.noteMode,
  conflicts: state.conflicts.map((position) => ({ ...position })),
  mistakes: state.mistakes,
  hintsUsed: state.hintsUsed,
  status: state.status,
})

const serializeForPersistence = (state) => ({
  puzzleId: state.puzzleId,
  difficulty: state.difficulty,
  board: cloneBoard(state.board),
  notes: cloneNotes(state.notes),
  noteMode: state.noteMode,
  selectedCell: state.selectedCell,
  elapsedMs: state.elapsedMs,
  hintsUsed: state.hintsUsed,
  mistakes: state.mistakes,
  status: state.status,
})

const clampMistakes = (value) => Math.min(MISTAKE_LIMIT, Math.max(0, value))

const createInitialState = (settings) => ({
  status: 'idle',
  error: null,
  difficulty: DEFAULT_DIFFICULTY,
  puzzleId: null,
  board: createEmptyBoard(),
  initialBoard: createEmptyBoard(),
  solution: createEmptyBoard(),
  givens: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false)),
  notes: createEmptyNotes(),
  noteMode: false,
  selectedCell: null,
  conflicts: [],
  history: [],
  future: [],
  mistakes: 0,
  mistakeLimit: MISTAKE_LIMIT,
  hintsUsed: 0,
  elapsedMs: 0,
  feedback: null,
  settings,
  lastAction: null,
  resumed: false,
})

const toPositionKey = ({ row, col }) => `${row}:${col}`

export const createGameService = ({ puzzleRepository, persistenceGateway } = {}) => {
  if (!puzzleRepository) {
    throw new Error('createGameService requires a puzzleRepository instance')
  }

  const persistedSettings = persistenceGateway?.loadSettings?.()
  const initialSettings = { ...DEFAULT_SETTINGS, ...(persistedSettings ?? {}) }

  let state = createInitialState(initialSettings)
  const subscribers = new Set()

  const notify = () => {
    subscribers.forEach((listener) => listener(state))
  }

  const persistState = (nextState) => {
    if (!persistenceGateway) return

    try {
      if (nextState.status === 'completed') {
        persistenceGateway.clearGameState?.()
      } else {
        persistenceGateway.saveGameState?.(serializeForPersistence(nextState))
      }
    } catch {
      // Persistence failures should not break gameplay
    }
  }

  const updateState = (updater, { persist = true } = {}) => {
    const nextState = updater(state)
    if (nextState === state) {
      return state
    }

    state = nextState

    if (persist) {
      persistState(state)
    }

    notify()
    return state
  }

  const pushHistory = (current) => {
    const snapshot = createSnapshot(current)
    const history = [...current.history, snapshot]
    if (history.length > MAX_HISTORY) {
      history.shift()
    }

    return { ...current, history }
  }

  const clearFuture = (current) => (current.future.length ? { ...current, future: [] } : current)

  const withFeedback = (current, feedback, lastAction) => ({
    ...current,
    feedback,
    lastAction,
  })

  const startNewGame = async ({ difficulty, resume = true } = {}) => {
    const requestedDifficulty = difficulty ?? state.difficulty ?? DEFAULT_DIFFICULTY

    updateState(
      (current) => ({
        ...current,
        status: 'loading',
        error: null,
        feedback: null,
        lastAction: 'loading',
      }),
      { persist: false },
    )

    try {
      let savedState =
        resume && persistenceGateway?.loadGameState
          ? persistenceGateway.loadGameState()
          : null

      if (savedState && savedState.status === 'completed') {
        savedState = null
      }

      if (savedState && difficulty && savedState.difficulty !== difficulty) {
        savedState = null
      }

      let puzzle = null

      if (savedState?.puzzleId) {
        puzzle = await puzzleRepository.fetchPuzzleById(savedState.puzzleId)
      }

      if (!puzzle) {
        puzzle = await puzzleRepository.fetchPuzzle({ difficulty: requestedDifficulty })
      }

      const puzzleBoard = mapPuzzleToBoard(puzzle.puzzle)
      const solutionBoard = mapPuzzleToBoard(puzzle.solution)
      const givens = createGivenMaskFromPuzzle(puzzle.puzzle)

      const resumed = Boolean(savedState && puzzle && savedState.puzzleId === puzzle.id)

      const board = resumed
        ? safeCloneBoard(savedState.board, puzzleBoard)
        : cloneBoard(puzzleBoard)
      const notes = resumed
        ? safeCloneNotes(normaliseNotes(savedState.notes), puzzleBoard.map(() => Array(BOARD_SIZE).fill([])))
        : createEmptyNotes()

      const selectedCell = resumed ? normaliseSelectedCell(savedState.selectedCell) : null
      const noteMode = resumed ? Boolean(savedState.noteMode) : false
      const hintsUsed = resumed ? savedState.hintsUsed ?? 0 : 0
      const mistakes = clampMistakes(resumed ? savedState.mistakes ?? 0 : 0)
      const elapsedMs = resumed ? savedState.elapsedMs ?? 0 : 0

      const conflicts = collectConflicts(board)
      let status = resumed ? savedState.status ?? 'ready' : 'ready'
      if (isBoardSolved(board, solutionBoard)) {
        status = 'completed'
      } else if (status === 'completed') {
        status = 'ready'
      }

      const baseState = createInitialState(state.settings)
      const nextState = {
        ...baseState,
        status,
        error: null,
        difficulty: puzzle.difficulty ?? requestedDifficulty,
        puzzleId: puzzle.id,
        board,
        initialBoard: puzzleBoard,
        solution: solutionBoard,
        givens,
        notes,
        noteMode,
        selectedCell,
        conflicts,
        mistakes,
        hintsUsed,
        elapsedMs,
        feedback: resumed
          ? {
              type: 'resume',
              timestamp: Date.now(),
              puzzleId: puzzle.id,
            }
          : {
              type: 'new-game',
              timestamp: Date.now(),
              puzzleId: puzzle.id,
            },
        lastAction: resumed ? 'resume' : 'bootstrap',
        resumed,
      }

      updateState(() => nextState)
    } catch (error) {
      updateState(
        (current) => ({
          ...current,
          status: 'error',
          error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
          feedback: {
            type: 'error',
            message: error instanceof Error ? error.message : String(error),
            timestamp: Date.now(),
          },
          lastAction: 'error',
        }),
        { persist: false },
      )
    }
  }

  const selectCell = (row, col) => {
    if (!isWithinBoard(row, col)) return

    updateState((current) => {
      if (current.status === 'loading') return current
      if (current.selectedCell && current.selectedCell.row === row && current.selectedCell.col === col) {
        return current
      }

      return withFeedback(
        {
          ...current,
          selectedCell: { row, col },
        },
        {
          type: 'select',
          row,
          col,
          timestamp: Date.now(),
        },
        'select',
      )
    })
  }

  const setNoteMode = (enabled) => {
    updateState((current) => {
      const nextValue = typeof enabled === 'boolean' ? enabled : !current.noteMode
      if (current.noteMode === nextValue) return current

      return withFeedback(
        {
          ...current,
          noteMode: nextValue,
        },
        {
          type: 'note-mode',
          enabled: nextValue,
          timestamp: Date.now(),
        },
        'toggle-note-mode',
      )
    })
  }

  const commitBoardUpdate = ({
    current,
    board,
    notes,
    feedback,
    lastAction,
    hintsUsed,
    mistakes,
    status,
  }) => ({
    ...current,
    board,
    notes: notes ?? current.notes,
    conflicts: collectConflicts(board),
    hintsUsed: hintsUsed ?? current.hintsUsed,
    mistakes: clampMistakes(mistakes ?? current.mistakes),
    status: status ?? current.status,
    feedback,
    lastAction,
  })

  const enterDigit = (value) => {
    if (!Number.isInteger(value) || value < 1 || value > 9) return

    updateState((current) => {
      if (current.status !== 'ready') return current
      const target = current.selectedCell
      if (!target) return current

      const { row, col } = target

      if (current.givens[row][col]) return current

      if (current.noteMode) {
        const existingNotes = current.notes[row][col]
        const hasValue = existingNotes.includes(value)
        const updatedCellNotes = hasValue
          ? existingNotes.filter((digit) => digit !== value)
          : [...existingNotes, value].sort((a, b) => a - b)

        if (existingNotes.length === updatedCellNotes.length && hasValue) {
          return current
        }

        let nextState = pushHistory(current)
        nextState = clearFuture(nextState)

        const notes = cloneNotes(nextState.notes)
        notes[row][col] = updatedCellNotes

        return commitBoardUpdate({
          current: nextState,
          board: nextState.board,
          notes,
          feedback: {
            type: 'note',
            row,
            col,
            value,
            added: !hasValue,
            timestamp: Date.now(),
          },
          lastAction: 'note',
        })
      }

      if (current.board[row][col] === value) {
        return current
      }

      const moveIsAllowed = isMoveAllowed({ board: current.board, row, col, value })

      let nextState = pushHistory(current)
      nextState = clearFuture(nextState)

      const board = cloneBoard(nextState.board)
      const notes = cloneNotes(nextState.notes)
      board[row][col] = value
      notes[row][col] = []

      const conflicts = collectConflicts(board)
      const conflictsSet = new Set(conflicts.map(toPositionKey))
      const selectedKey = toPositionKey({ row, col })

      let mistakes = nextState.mistakes
      if (!moveIsAllowed || conflictsSet.has(selectedKey)) {
        mistakes = clampMistakes(mistakes + 1)
      }

      let status = nextState.status
      let feedback = {
        type: moveIsAllowed ? 'input' : 'mistake',
        row,
        col,
        value,
        timestamp: Date.now(),
        remainingMistakes: Math.max(0, MISTAKE_LIMIT - mistakes),
      }

      if (isBoardSolved(board, nextState.solution)) {
        status = 'completed'
        feedback = {
          type: 'completed',
          timestamp: Date.now(),
        }
      }

      return {
        ...nextState,
        board,
        notes,
        conflicts,
        mistakes,
        status,
        feedback,
        lastAction: 'input',
      }
    })
  }

  const clearCell = () => {
    updateState((current) => {
      if (current.status !== 'ready') return current
      const target = current.selectedCell
      if (!target) return current

      const { row, col } = target
      if (current.givens[row][col]) return current
      if (current.board[row][col] === null) return current

      let nextState = pushHistory(current)
      nextState = clearFuture(nextState)

      const board = cloneBoard(nextState.board)
      const notes = cloneNotes(nextState.notes)
      board[row][col] = null
      notes[row][col] = []

      const conflicts = collectConflicts(board)

      return {
        ...nextState,
        board,
        notes,
        conflicts,
        feedback: {
          type: 'clear',
          row,
          col,
          timestamp: Date.now(),
        },
        lastAction: 'clear',
        status: 'ready',
      }
    })
  }

  const undo = () => {
    updateState((current) => {
      if (!current.history.length) return current

      const previousSnapshot = current.history[current.history.length - 1]
      const history = current.history.slice(0, -1)
      const future = [...current.future, createSnapshot(current)]
      if (future.length > MAX_HISTORY) {
        future.shift()
      }

      return {
        ...current,
        board: cloneBoard(previousSnapshot.board),
        notes: cloneNotes(previousSnapshot.notes),
        selectedCell: previousSnapshot.selectedCell,
        noteMode: previousSnapshot.noteMode,
        conflicts: previousSnapshot.conflicts.map((position) => ({ ...position })),
        mistakes: previousSnapshot.mistakes,
        hintsUsed: previousSnapshot.hintsUsed,
        status: previousSnapshot.status,
        history,
        future,
        feedback: {
          type: 'undo',
          timestamp: Date.now(),
        },
        lastAction: 'undo',
      }
    })
  }

  const redo = () => {
    updateState((current) => {
      if (!current.future.length) return current

      const nextSnapshot = current.future[current.future.length - 1]
      const future = current.future.slice(0, -1)
      const history = [...current.history, createSnapshot(current)]
      if (history.length > MAX_HISTORY) {
        history.shift()
      }

      return {
        ...current,
        board: cloneBoard(nextSnapshot.board),
        notes: cloneNotes(nextSnapshot.notes),
        selectedCell: nextSnapshot.selectedCell,
        noteMode: nextSnapshot.noteMode,
        conflicts: nextSnapshot.conflicts.map((position) => ({ ...position })),
        mistakes: nextSnapshot.mistakes,
        hintsUsed: nextSnapshot.hintsUsed,
        status: nextSnapshot.status,
        history,
        future,
        feedback: {
          type: 'redo',
          timestamp: Date.now(),
        },
        lastAction: 'redo',
      }
    })
  }

  const requestHint = () => {
    updateState((current) => {
      if (current.status !== 'ready') return current

      const hint = findNextHint({
        board: current.board,
        solution: current.solution,
        givenMask: current.givens,
      })

      if (!hint) {
        return withFeedback(
          current,
          {
            type: 'hint-unavailable',
            timestamp: Date.now(),
          },
          'hint-unavailable',
        )
      }

      let nextState = pushHistory(current)
      nextState = clearFuture(nextState)

      const board = cloneBoard(nextState.board)
      const notes = cloneNotes(nextState.notes)
      board[hint.row][hint.col] = hint.value
      notes[hint.row][hint.col] = []

      const conflicts = collectConflicts(board)
      const hintsUsed = nextState.hintsUsed + 1
      const status = isBoardSolved(board, nextState.solution) ? 'completed' : nextState.status

      return {
        ...nextState,
        board,
        notes,
        conflicts,
        hintsUsed,
        selectedCell: { row: hint.row, col: hint.col },
        status,
        feedback: {
          type: 'hint',
          row: hint.row,
          col: hint.col,
          value: hint.value,
          timestamp: Date.now(),
        },
        lastAction: 'hint',
      }
    })
  }

  const restartPuzzle = () => {
    updateState((current) => {
      if (!current.puzzleId) return current

      const board = cloneBoard(current.initialBoard)
      const notes = createEmptyNotes()
      const conflicts = collectConflicts(board)

      return {
        ...current,
        board,
        notes,
        conflicts,
        mistakes: 0,
        hintsUsed: 0,
        history: [],
        future: [],
        elapsedMs: 0,
        status: 'ready',
        feedback: {
          type: 'restart',
          timestamp: Date.now(),
        },
        lastAction: 'restart',
      }
    })
  }

  const advanceTime = (deltaMs) => {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return

    updateState(
      (current) => {
        if (current.status !== 'ready') return current
        return {
          ...current,
          elapsedMs: current.elapsedMs + deltaMs,
        }
      },
      { persist: false },
    )
  }

  const updateSettings = (partialSettings) => {
    updateState(
      (current) => {
        const settings = { ...current.settings, ...(partialSettings ?? {}) }
        persistenceGateway?.saveSettings?.(settings)

        return {
          ...current,
          settings,
          feedback: {
            type: 'settings',
            timestamp: Date.now(),
          },
          lastAction: 'settings',
        }
      },
      { persist: false },
    )
  }

  const clearFeedback = () => {
    updateState((current) => ({ ...current, feedback: null }), { persist: false })
  }

  const getState = () => state

  const subscribe = (listener) => {
    if (typeof listener !== 'function') return () => {}
    subscribers.add(listener)
    listener(state)
    return () => {
      subscribers.delete(listener)
    }
  }

  return {
    getState,
    subscribe,
    startNewGame,
    selectCell,
    setNoteMode,
    enterDigit,
    clearCell,
    undo,
    redo,
    requestHint,
    restartPuzzle,
    advanceTime,
    updateSettings,
    clearFeedback,
  }
}
