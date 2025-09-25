import { BOARD_SIZE } from '../../shared/constants.js'
import { validateBoardShape, validateSolutionShape } from './validation.js'

const validateMaskShape = (mask) => {
  if (!Array.isArray(mask) || mask.length !== BOARD_SIZE) {
    throw new Error('Mask must be a 9x9 matrix')
  }

  mask.forEach((row) => {
    if (!Array.isArray(row) || row.length !== BOARD_SIZE) {
      throw new Error('Mask must be a 9x9 matrix')
    }
  })
}

export const findNextHint = ({ board, solution, givenMask }) => {
  validateBoardShape(board)
  validateSolutionShape(solution)

  if (givenMask) {
    validateMaskShape(givenMask)
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (givenMask && givenMask[row][col]) {
        continue
      }

      const cellValue = board[row][col]
      const solutionValue = solution[row][col]

      if (cellValue === null || cellValue !== solutionValue) {
        return {
          row,
          col,
          value: solutionValue,
        }
      }
    }
  }

  return null
}
