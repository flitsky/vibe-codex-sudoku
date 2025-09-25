import { BOARD_SIZE, DIGITS } from '../../shared/constants.js'

const isValidCellValue = (value) => value === null || DIGITS.includes(value)

export const createEmptyBoard = () =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))

export const cloneBoard = (board) =>
  board.map((row) => row.map((cell) => {
    if (!isValidCellValue(cell)) {
      throw new Error('Invalid cell value encountered while cloning board')
    }

    return cell
  }))

const normalisePuzzleCell = (cell) => {
  if (cell === null || cell === 0) return null

  if (!Number.isInteger(cell) || !DIGITS.includes(cell)) {
    throw new Error('Puzzle cell must be an integer between 1 and 9')
  }

  return cell
}

export const mapPuzzleToBoard = (puzzle) => {
  if (!Array.isArray(puzzle) || puzzle.length !== BOARD_SIZE) {
    throw new Error('Puzzle must be a 9x9 matrix')
  }

  return puzzle.map((row) => {
    if (!Array.isArray(row) || row.length !== BOARD_SIZE) {
      throw new Error('Puzzle must be a 9x9 matrix')
    }

    return row.map((cell) => normalisePuzzleCell(cell))
  })
}

export const createGivenMaskFromPuzzle = (puzzle) =>
  mapPuzzleToBoard(puzzle).map((row) => row.map((cell) => cell !== null))

export const isWithinBoard = (row, col) =>
  Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
