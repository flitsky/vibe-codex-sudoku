import { describe, expect, it } from 'vitest'
import { createGivenMaskFromPuzzle, mapPuzzleToBoard } from '../entities/board.js'
import { findNextHint } from '../services/hints.js'

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

describe('findNextHint', () => {
  it('returns the first mismatched cell as a hint', () => {
    const board = mapPuzzleToBoard(puzzle)

    const hint = findNextHint({ board, solution })

    expect(hint).toEqual({ row: 0, col: 2, value: 4 })
  })

  it('skips cells marked as givens when searching for hints', () => {
    const board = mapPuzzleToBoard(puzzle)
    const givenMask = createGivenMaskFromPuzzle(puzzle)

    board[0][2] = 4 // First non-given cell is now correct

    const hint = findNextHint({ board, solution, givenMask })

    expect(hint).toEqual({ row: 0, col: 3, value: 6 })
  })

  it('returns null when the board already matches the solution', () => {
    const board = mapPuzzleToBoard(solution)

    const hint = findNextHint({ board, solution })

    expect(hint).toBeNull()
  })
})
