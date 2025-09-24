import { createEmptyBoard, mapPuzzleToBoard } from '../../domain/entities/board.js'

export const createGameService = ({ puzzleRepository }) => {
  const startNewGame = async ({ difficulty } = {}) => {
    const rawPuzzle = await puzzleRepository.fetchPuzzle({ difficulty })

    return {
      puzzle: mapPuzzleToBoard(rawPuzzle),
      notes: createEmptyBoard(),
    }
  }

  return {
    startNewGame,
  }
}
