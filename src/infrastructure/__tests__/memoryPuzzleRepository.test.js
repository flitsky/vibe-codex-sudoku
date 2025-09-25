import { describe, expect, it } from 'vitest'
import { createMemoryPuzzleRepository } from '../memoryPuzzleRepository.js'

const BOARD_SIZE = 9

const expectMatrix = (matrix, allowZero = false) => {
  expect(Array.isArray(matrix)).toBe(true)
  expect(matrix).toHaveLength(BOARD_SIZE)
  matrix.forEach((row) => {
    expect(row).toHaveLength(BOARD_SIZE)
    row.forEach((value) => {
      if (allowZero && value === 0) return
      expect(typeof value).toBe('number')
    })
  })
}

describe('createMemoryPuzzleRepository', () => {
  it('returns a puzzle and solution matrix for the requested difficulty', async () => {
    const repository = createMemoryPuzzleRepository()
    const { puzzle, solution, difficulty } = await repository.fetchPuzzle({ difficulty: 'normal' })

    expect(difficulty).toBe('normal')
    expectMatrix(puzzle, true)
    expectMatrix(solution)
  })

  it('falls back to easy difficulty when an unknown difficulty is requested', async () => {
    const repository = createMemoryPuzzleRepository()
    const { difficulty } = await repository.fetchPuzzle({ difficulty: 'unknown' })

    expect(difficulty).toBe('easy')
  })

  it('lists available difficulties', () => {
    const repository = createMemoryPuzzleRepository()

    expect(repository.listDifficulties()).toEqual(['easy', 'normal', 'hard'])
  })

  it('retrieves a specific puzzle by id', async () => {
    const repository = createMemoryPuzzleRepository()
    const sample = await repository.fetchPuzzle({ difficulty: 'hard' })
    const replay = await repository.fetchPuzzleById(sample.id)

    expect(replay).not.toBeNull()
    expect(replay.id).toBe(sample.id)
    expectMatrix(replay.puzzle, true)
    expectMatrix(replay.solution)
  })
})
