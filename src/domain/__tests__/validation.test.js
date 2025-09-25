import { describe, expect, it } from 'vitest'
import { createEmptyBoard } from '../entities/board.js'
import {
  collectConflicts,
  isBoardComplete,
  isBoardSolved,
  isBoardValid,
  isMoveAllowed,
} from '../services/validation.js'

const createSolvedBoard = () => [
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

describe('collectConflicts', () => {
  it('finds row, column, and box conflicts', () => {
    const board = createEmptyBoard()
    board[0][0] = 5
    board[0][1] = 5 // Row conflict
    board[1][0] = 5 // Column and box conflict

    const conflicts = collectConflicts(board)

    expect(conflicts).toEqual(
      expect.arrayContaining([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
      ]),
    )
    expect(isBoardValid(board)).toBe(false)
  })
})

describe('isMoveAllowed', () => {
  it('returns false when the move would duplicate a value in the row', () => {
    const board = createEmptyBoard()
    board[0][0] = 7

    expect(
      isMoveAllowed({
        board,
        row: 0,
        col: 2,
        value: 7,
      }),
    ).toBe(false)
  })

  it('returns true when the move keeps the board valid', () => {
    const board = createEmptyBoard()
    board[0][0] = 7

    expect(
      isMoveAllowed({
        board,
        row: 0,
        col: 2,
        value: 9,
      }),
    ).toBe(true)
  })

  it('allows re-entering the same value in the current cell', () => {
    const board = createEmptyBoard()
    board[4][4] = 3

    expect(
      isMoveAllowed({
        board,
        row: 4,
        col: 4,
        value: 3,
      }),
    ).toBe(true)
  })
})

describe('isBoardComplete', () => {
  it('returns false when at least one empty cell exists', () => {
    const board = createSolvedBoard()
    board[8][8] = null

    expect(isBoardComplete(board)).toBe(false)
  })

  it('returns true when all cells are filled', () => {
    const board = createSolvedBoard()

    expect(isBoardComplete(board)).toBe(true)
  })
})

describe('isBoardSolved', () => {
  it('returns true when the board matches the solution', () => {
    const board = createSolvedBoard()
    const solution = createSolvedBoard()

    expect(isBoardSolved(board, solution)).toBe(true)
  })

  it('returns false when the board differs from the solution', () => {
    const board = createSolvedBoard()
    const solution = createSolvedBoard()
    board[0][0] = null

    expect(isBoardSolved(board, solution)).toBe(false)
  })
})
