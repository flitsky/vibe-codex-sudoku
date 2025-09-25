import { PUZZLE_POOL, PUZZLES_BY_ID } from './data/puzzles.js'

const cloneMatrix = (matrix) => matrix.map((row) => [...row])

const getPoolByDifficulty = (difficulty = 'easy') => {
  if (difficulty && PUZZLE_POOL[difficulty]) {
    return {
      pool: PUZZLE_POOL[difficulty],
      difficulty,
    }
  }

  return {
    pool: PUZZLE_POOL.easy,
    difficulty: 'easy',
  }
}

const pickRandomPuzzle = (pool) => {
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

export const createMemoryPuzzleRepository = () => {
  return {
    async fetchPuzzle({ difficulty } = {}) {
      const { pool, difficulty: resolvedDifficulty } = getPoolByDifficulty(difficulty)
      const selected = pickRandomPuzzle(pool)

      return {
        id: selected.id,
        difficulty: resolvedDifficulty,
        puzzle: cloneMatrix(selected.puzzle),
        solution: cloneMatrix(selected.solution),
      }
    },
    async fetchPuzzleById(id) {
      if (!id) return null
      const entry = PUZZLES_BY_ID.get(id)
      if (!entry) return null

      return {
        id: entry.id,
        difficulty: entry.difficulty,
        puzzle: cloneMatrix(entry.puzzle),
        solution: cloneMatrix(entry.solution),
      }
    },
    listDifficulties() {
      return Object.keys(PUZZLE_POOL)
    },
  }
}
