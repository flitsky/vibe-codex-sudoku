const baseSolution = [
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

const easyPuzzle1 = [
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

const normalPuzzle1 = [
  [5, 0, 0, 0, 7, 8, 0, 1, 0],
  [0, 7, 2, 1, 0, 0, 3, 0, 0],
  [1, 0, 0, 3, 0, 0, 5, 0, 7],
  [0, 5, 0, 7, 6, 1, 4, 0, 0],
  [4, 0, 0, 0, 0, 3, 0, 9, 1],
  [0, 1, 3, 0, 2, 0, 0, 5, 0],
  [9, 0, 0, 0, 3, 0, 0, 8, 4],
  [2, 0, 7, 4, 1, 0, 0, 3, 0],
  [0, 4, 0, 0, 8, 6, 1, 0, 0],
]

const hardPuzzle1 = [
  [0, 0, 0, 6, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 8],
  [0, 9, 0, 0, 0, 0, 5, 0, 0],
  [0, 0, 9, 0, 0, 0, 0, 2, 0],
  [4, 0, 0, 0, 0, 3, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 8, 0, 0],
  [9, 0, 0, 0, 3, 0, 0, 0, 4],
  [0, 0, 0, 4, 0, 0, 0, 3, 5],
  [0, 0, 0, 0, 0, 0, 1, 0, 0],
]

const shiftDigits = (grid, shift) =>
  grid.map((row) =>
    row.map((value) => {
      if (value === 0) return 0
      const normalised = ((value + shift - 1) % 9) + 1
      return normalised
    }),
  )

const createPuzzleVariant = ({ id, difficulty, puzzle, solution }, shift) => ({
  id: `${id}-v${shift}`,
  difficulty,
  puzzle: shiftDigits(puzzle, shift),
  solution: shiftDigits(solution, shift),
})

const basePuzzles = [
  { id: 'easy-1', difficulty: 'easy', puzzle: easyPuzzle1, solution: baseSolution },
  { id: 'normal-1', difficulty: 'normal', puzzle: normalPuzzle1, solution: baseSolution },
  { id: 'hard-1', difficulty: 'hard', puzzle: hardPuzzle1, solution: baseSolution },
]

const deriveVariants = (entry) => [entry, createPuzzleVariant(entry, 2)]

const groupedByDifficulty = basePuzzles.reduce((acc, entry) => {
  const variants = deriveVariants(entry)

  variants.forEach((variant) => {
    if (!acc[variant.difficulty]) {
      acc[variant.difficulty] = []
    }

    acc[variant.difficulty].push({
      id: variant.id,
      difficulty: variant.difficulty,
      puzzle: variant.puzzle,
      solution: variant.solution,
    })
  })

  return acc
}, {})

const puzzlesById = new Map()

Object.values(groupedByDifficulty).forEach((entries) => {
  entries.forEach((entry) => {
    puzzlesById.set(entry.id, entry)
  })
})

export const PUZZLE_POOL = Object.freeze(groupedByDifficulty)
export const PUZZLES_BY_ID = puzzlesById
