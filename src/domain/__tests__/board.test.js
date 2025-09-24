import { describe, expect, it } from 'vitest'
import { createEmptyBoard } from '../entities/board.js'

describe('createEmptyBoard', () => {
  it('creates a 9x9 matrix filled with null', () => {
    const board = createEmptyBoard()

    expect(board).toHaveLength(9)
    board.forEach((row) => {
      expect(row).toHaveLength(9)
      row.forEach((cell) => {
        expect(cell).toBeNull()
      })
    })
  })
})
