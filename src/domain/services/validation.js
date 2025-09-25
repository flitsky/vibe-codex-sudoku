import { BOARD_SIZE, BOX_SIZE, DIGITS } from '../../shared/constants.js'

const toKey = (row, col) => `${row}:${col}`

export const validateBoardShape = (board) => {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
    throw new Error('Board must be a 9x9 matrix')
  }

  board.forEach((row) => {
    if (!Array.isArray(row) || row.length !== BOARD_SIZE) {
      throw new Error('Board must be a 9x9 matrix')
    }

    row.forEach((value) => {
      if (value === null) return

      if (!Number.isInteger(value) || !DIGITS.includes(value)) {
        throw new Error('Board cell values must be null or integers between 1 and 9')
      }
    })
  })
}

export const validateSolutionShape = (solution) => {
  if (!Array.isArray(solution) || solution.length !== BOARD_SIZE) {
    throw new Error('Solution must be a 9x9 matrix')
  }

  solution.forEach((row) => {
    if (!Array.isArray(row) || row.length !== BOARD_SIZE) {
      throw new Error('Solution must be a 9x9 matrix')
    }

    row.forEach((value) => {
      if (!Number.isInteger(value) || !DIGITS.includes(value)) {
        throw new Error('Solution cell values must be integers between 1 and 9')
      }
    })
  })
}

const collectDuplicates = (positionsByValue, conflictMap) => {
  positionsByValue.forEach((positions) => {
    if (positions.length <= 1) return
    positions.forEach(({ row, col }) => {
      const key = toKey(row, col)
      if (!conflictMap.has(key)) {
        conflictMap.set(key, { row, col })
      }
    })
  })
}

export const collectConflicts = (board) => {
  validateBoardShape(board)

  const conflicts = new Map()

  // Row conflicts
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const valuePositions = new Map()

    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const value = board[row][col]
      if (value === null) continue

      if (!valuePositions.has(value)) {
        valuePositions.set(value, [])
      }

      valuePositions.get(value).push({ row, col })
    }

    collectDuplicates(valuePositions, conflicts)
  }

  // Column conflicts
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    const valuePositions = new Map()

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      const value = board[row][col]
      if (value === null) continue

      if (!valuePositions.has(value)) {
        valuePositions.set(value, [])
      }

      valuePositions.get(value).push({ row, col })
    }

    collectDuplicates(valuePositions, conflicts)
  }

  // Box conflicts
  for (let boxRow = 0; boxRow < BOARD_SIZE; boxRow += BOX_SIZE) {
    for (let boxCol = 0; boxCol < BOARD_SIZE; boxCol += BOX_SIZE) {
      const valuePositions = new Map()

      for (let row = boxRow; row < boxRow + BOX_SIZE; row += 1) {
        for (let col = boxCol; col < boxCol + BOX_SIZE; col += 1) {
          const value = board[row][col]
          if (value === null) continue

          if (!valuePositions.has(value)) {
            valuePositions.set(value, [])
          }

          valuePositions.get(value).push({ row, col })
        }
      }

      collectDuplicates(valuePositions, conflicts)
    }
  }

  return [...conflicts.values()]
}

export const isBoardValid = (board) => collectConflicts(board).length === 0

export const isBoardComplete = (board) => {
  validateBoardShape(board)
  return board.every((row) => row.every((value) => value !== null))
}

export const isMoveAllowed = ({ board, row, col, value }) => {
  validateBoardShape(board)

  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    throw new Error('Row and column must be integers')
  }

  if (!Number.isInteger(value) || !DIGITS.includes(value)) {
    throw new Error('Value must be an integer between 1 and 9')
  }

  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    throw new Error('Row and column must be within board bounds')
  }

  for (let idx = 0; idx < BOARD_SIZE; idx += 1) {
    if (idx !== col && board[row][idx] === value) return false
    if (idx !== row && board[idx][col] === value) return false
  }

  const boxStartRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const boxStartCol = Math.floor(col / BOX_SIZE) * BOX_SIZE

  for (let r = boxStartRow; r < boxStartRow + BOX_SIZE; r += 1) {
    for (let c = boxStartCol; c < boxStartCol + BOX_SIZE; c += 1) {
      if (r === row && c === col) continue
      if (board[r][c] === value) return false
    }
  }

  return true
}

export const isBoardSolved = (board, solution) => {
  validateBoardShape(board)
  validateSolutionShape(solution)

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cellValue = board[row][col]
      const solutionValue = solution[row][col]

      if (cellValue === null || cellValue !== solutionValue) {
        return false
      }
    }
  }

  return true
}
