import { useEffect, useMemo, useRef } from 'react'
import { BOX_SIZE, BOARD_SIZE } from '../../shared/constants.js'

const positionKey = (row, col) => `${row}:${col}`

const createNoteGrid = () => Array.from({ length: BOARD_SIZE }, (_, index) => index + 1)

const NOTE_DIGITS = createNoteGrid()

const getBoxIndex = (value) => Math.floor(value / BOX_SIZE)

const isSameBox = (a, b) => getBoxIndex(a) === getBoxIndex(b)

const buildCellLabel = ({ row, col, value, isGiven, notes, isConflict }) => {
  const base = [`행 ${row + 1}`, `열 ${col + 1}`]
  if (value !== null) {
    base.push(`값 ${value}`)
  } else if (notes?.length) {
    base.push(`메모 ${notes.join(', ')}`)
  } else {
    base.push('빈 칸')
  }
  if (isGiven) {
    base.push('기본 숫자')
  }
  if (isConflict) {
    base.push('충돌 상태')
  }
  return base.join(', ')
}

export const GameBoard = ({
  board,
  notes,
  givens,
  conflicts,
  selectedCell,
  onSelectCell,
}) => {
  const cellRefs = useRef(new Map())

  const conflictSet = useMemo(() => {
    if (!conflicts) return new Set()
    return new Set(conflicts.map(({ row, col }) => positionKey(row, col)))
  }, [conflicts])

  const selectedValue = selectedCell ? board?.[selectedCell.row]?.[selectedCell.col] ?? null : null

  const handleCellRef = (row, col) => (element) => {
    const key = positionKey(row, col)
    if (element) {
      cellRefs.current.set(key, element)
    } else {
      cellRefs.current.delete(key)
    }
  }

  useEffect(() => {
    if (!selectedCell) return
    const key = positionKey(selectedCell.row, selectedCell.col)
    const element = cellRefs.current.get(key)
    if (element && document.activeElement !== element) {
      element.focus({ preventScroll: true })
    }
  }, [selectedCell])

  const handleSelect = (row, col) => {
    onSelectCell?.(row, col)
  }

  return (
    <div className="game-board" role="grid" aria-label="스도쿠 보드">
      {board.map((rowValues, rowIndex) => {
        return rowValues.map((value, colIndex) => {
          const isGiven = givens?.[rowIndex]?.[colIndex] ?? false
          const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex
          const isPeer =
            selectedCell &&
            (selectedCell.row === rowIndex ||
              selectedCell.col === colIndex ||
              (isSameBox(selectedCell.row, rowIndex) && isSameBox(selectedCell.col, colIndex)))
          const hasSameValue = selectedValue !== null && value === selectedValue
          const isConflict = conflictSet.has(positionKey(rowIndex, colIndex))
          const cellNotes = notes?.[rowIndex]?.[colIndex] ?? []

          const classNames = [
            'game-cell',
            isGiven ? 'is-given' : '',
            isSelected ? 'is-selected' : '',
            isPeer ? 'is-peer' : '',
            hasSameValue && !isSelected ? 'is-matching' : '',
            isConflict ? 'is-conflict' : '',
            value === null && cellNotes.length ? 'has-notes' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={`cell-${rowIndex}-${colIndex}`}
              ref={handleCellRef(rowIndex, colIndex)}
              type="button"
              className={classNames}
              onClick={() => handleSelect(rowIndex, colIndex)}
              role="gridcell"
              aria-selected={isSelected}
              aria-label={buildCellLabel({
                row: rowIndex,
                col: colIndex,
                value,
                isGiven,
                notes: cellNotes,
                isConflict,
              })}
              tabIndex={isSelected ? 0 : -1}
              data-row={rowIndex}
              data-col={colIndex}
            >
              {value !== null ? (
                <span className="game-cell__value">{value}</span>
              ) : (
                <span className="game-cell__notes" aria-hidden="true">
                  {NOTE_DIGITS.map((digit) => {
                    const isActive = cellNotes.includes(digit)
                    return (
                      <span key={digit} data-active={isActive}>
                        {isActive ? digit : ''}
                      </span>
                    )
                  })}
                </span>
              )}
            </button>
          )
        })
      })}
    </div>
  )
}
