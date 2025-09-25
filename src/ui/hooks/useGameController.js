import { useEffect, useMemo, useState } from 'react'
import { BOARD_SIZE } from '../../shared/constants.js'

const hasDocument = () => typeof window !== 'undefined' && typeof document !== 'undefined'

export const useGameController = (gameService) => {
  const [state, setState] = useState(() => gameService?.getState?.() ?? null)

  useEffect(() => {
    if (!gameService) return undefined

    const unsubscribe = gameService.subscribe?.((nextState) => {
      setState(nextState)
    })

    return unsubscribe
  }, [gameService])

  useEffect(() => {
    if (!gameService) return undefined
    const currentState = gameService.getState?.()
    if (currentState?.status === 'idle') {
      gameService.startNewGame?.({ difficulty: currentState.difficulty, resume: true })
    }

    return undefined
  }, [gameService])

  const canTick = state?.status === 'ready'

  useEffect(() => {
    if (!gameService || !hasDocument()) return undefined
    if (!canTick) return undefined

    const tickInterval = 1000
    let lastTick = performance.now()

    const interval = window.setInterval(() => {
      const now = performance.now()
      const delta = now - lastTick
      lastTick = now
      gameService.advanceTime?.(delta)
    }, tickInterval)

    return () => window.clearInterval(interval)
  }, [gameService, canTick])

  const actions = useMemo(() => {
    if (!gameService) {
      return {}
    }

    const moveSelection = (deltaRow, deltaCol) => {
      const snapshot = gameService.getState?.()
      const board = snapshot?.board
      if (!board || !board.length) return

      const current = snapshot.selectedCell ?? { row: 0, col: 0 }
      const nextRow = (current.row + deltaRow + BOARD_SIZE) % BOARD_SIZE
      const nextCol = (current.col + deltaCol + BOARD_SIZE) % BOARD_SIZE
      gameService.selectCell?.(nextRow, nextCol)
    }

    return {
      startNewGame: (options) => gameService.startNewGame?.(options),
      newGame: (difficulty) => gameService.startNewGame?.({ difficulty, resume: false }),
      selectCell: (row, col) => gameService.selectCell?.(row, col),
      moveSelection,
      toggleNoteMode: () => gameService.setNoteMode?.(),
      setNoteMode: (enabled) => gameService.setNoteMode?.(enabled),
      enterDigit: (value) => gameService.enterDigit?.(value),
      clearCell: () => gameService.clearCell?.(),
      undo: () => gameService.undo?.(),
      redo: () => gameService.redo?.(),
      requestHint: () => gameService.requestHint?.(),
      restart: () => gameService.restartPuzzle?.(),
      updateSettings: (settings) => gameService.updateSettings?.(settings),
      clearFeedback: () => gameService.clearFeedback?.(),
    }
  }, [gameService])

  return { state, actions }
}
