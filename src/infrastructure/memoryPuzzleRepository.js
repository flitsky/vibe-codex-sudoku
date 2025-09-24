import { createEmptyBoard } from '../domain/entities/board.js'

const DEFAULT_PUZZLE = () => {
  const board = createEmptyBoard()
  board[0][0] = 5
  board[1][3] = 2
  board[4][4] = 7
  board[7][6] = 3
  return board
}

export const createMemoryPuzzleRepository = () => {
  let cachedPuzzle = null

  return {
    async fetchPuzzle() {
      if (!cachedPuzzle) {
        cachedPuzzle = DEFAULT_PUZZLE()
      }

      return cachedPuzzle
    },
  }
}
