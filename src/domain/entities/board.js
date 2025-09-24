import { BOARD_SIZE } from '../../shared/constants.js'

export const createEmptyBoard = () =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))

export const mapPuzzleToBoard = (puzzle) =>
  puzzle.map((row) => row.map((cell) => (cell === 0 ? null : cell)))
