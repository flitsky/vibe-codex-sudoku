import { useEffect, useMemo } from 'react'
import './App.css'
import { useGameController } from './hooks/useGameController.js'
import { GameBoard } from './components/GameBoard.jsx'
import { GameControls } from './components/GameControls.jsx'
import { NumberPad } from './components/NumberPad.jsx'
import { StatusBar } from './components/StatusBar.jsx'
import { CelebrationOverlay } from './components/CelebrationOverlay.jsx'
import { useCelebrationEffect } from '../effects/useCelebrationEffect.js'

const DIFFICULTIES = ['easy', 'normal', 'hard']

const difficultyLabels = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
}

const createNullBoard = () => Array.from({ length: 9 }, () => Array(9).fill(null))
const createEmptyNotes = () =>
  Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
const createFalseMask = () => Array.from({ length: 9 }, () => Array(9).fill(false))

function App({ gameService }) {
  const { state, actions } = useGameController(gameService)

  const board = state?.board ?? createNullBoard()
  const notes = state?.notes ?? createEmptyNotes()
  const givens = state?.givens ?? createFalseMask()
  const conflicts = state?.conflicts ?? []
  const status = state?.status ?? 'loading'
  const noteMode = state?.noteMode ?? false
  const difficulty = state?.difficulty ?? 'easy'
  const isBusy = status === 'loading'
  const canUndo = (state?.history?.length ?? 0) > 0
  const canRedo = (state?.future?.length ?? 0) > 0
  const { isActive: showCelebration, triggerCelebration } = useCelebrationEffect()

  const handleSelectCell = (row, col) => {
    if (isBusy) return
    actions.selectCell?.(row, col)
  }

  const handleNumberSelect = (value) => {
    if (isBusy) return
    actions.enterDigit?.(value)
  }

  const handleClearCell = () => {
    if (isBusy) return
    actions.clearCell?.()
  }

  const handleToggleNote = () => {
    actions.toggleNoteMode?.()
  }

  useEffect(() => {
    if (!gameService) return undefined
    if (typeof window === 'undefined') return undefined

    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName
      if (tagName && ['INPUT', 'TEXTAREA'].includes(tagName)) return
      if (!actions) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          actions.moveSelection?.(-1, 0)
          break
        case 'ArrowDown':
          event.preventDefault()
          actions.moveSelection?.(1, 0)
          break
        case 'ArrowLeft':
          event.preventDefault()
          actions.moveSelection?.(0, -1)
          break
        case 'ArrowRight':
          event.preventDefault()
          actions.moveSelection?.(0, 1)
          break
        case 'Backspace':
        case 'Delete':
        case '0':
          event.preventDefault()
          actions.clearCell?.()
          break
        case 'n':
        case 'N':
          event.preventDefault()
          actions.toggleNoteMode?.()
          break
        default:
          if (/^[1-9]$/.test(event.key)) {
            event.preventDefault()
            actions.enterDigit?.(Number(event.key))
          }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actions, gameService])

  const difficultyLabel = difficultyLabels[difficulty] ?? difficulty

  const helperMessage = useMemo(() => {
    if (status === 'completed') {
      return '축하합니다! 퍼즐을 모두 완성했습니다.'
    }
    if (status === 'error') {
      return state?.error ?? '퍼즐을 불러오는 중 오류가 발생했습니다.'
    }
    if (status === 'loading') {
      return '퍼즐을 불러오는 중입니다…'
    }
    return null
  }, [status, state?.error])

  useEffect(() => {
    const feedback = state?.feedback
    if (!feedback) return

    if (feedback.type === 'completed') {
      triggerCelebration()
    } else if (feedback.type === 'mistake' && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(80)
      } catch {
        // ignore vibration errors silently
      }
    }

    actions.clearFeedback?.()
  }, [state?.feedback, triggerCelebration, actions])

  return (
    <main className="app">
      <header className="app__header">
        <h1>Vibe Codex Sudoku</h1>
        <p className="app__subtitle">클린 아키텍처 기반 웹 스도쿠 경험</p>
      </header>

      <StatusBar
        difficultyLabel={difficultyLabel}
        elapsedMs={state?.elapsedMs}
        mistakes={state?.mistakes}
        mistakeLimit={state?.mistakeLimit}
        hintsUsed={state?.hintsUsed}
        status={status}
        resumed={state?.resumed}
      />

      <GameControls
        difficulties={DIFFICULTIES}
        activeDifficulty={difficulty}
        onSelectDifficulty={(nextDifficulty) => actions.newGame?.(nextDifficulty)}
        onNewGame={(currentDifficulty) => actions.newGame?.(currentDifficulty)}
        noteMode={noteMode}
        onToggleNoteMode={handleToggleNote}
        onUndo={() => actions.undo?.()}
        onRedo={() => actions.redo?.()}
        onHint={() => actions.requestHint?.()}
        onRestart={() => actions.restart?.()}
        canUndo={canUndo}
        canRedo={canRedo}
        isBusy={isBusy}
      />

      <section className="app__play-area">
        <div className="app__board-wrapper">
          {showCelebration && <CelebrationOverlay />}
          <GameBoard
            board={board}
            notes={notes}
            givens={givens}
            conflicts={conflicts}
            selectedCell={state?.selectedCell}
            onSelectCell={handleSelectCell}
          />
          {helperMessage && (
            <div className={`app__helper app__helper--${status}`} role="status">
              {helperMessage}
              {status === 'error' && (
                <button type="button" onClick={() => actions.startNewGame?.({ difficulty, resume: false })}>
                  다시 시도
                </button>
              )}
            </div>
          )}
        </div>

        <aside className="app__sidebar">
          <NumberPad
            onSelectNumber={handleNumberSelect}
            onClear={handleClearCell}
            noteMode={noteMode}
            onToggleNoteMode={handleToggleNote}
            disabled={isBusy}
          />

          <section className="app__tips" aria-label="게임 팁">
            <h2>플레이 가이드</h2>
            <ul>
              <li>키보드 숫자 또는 위 숫자 패드로 값을 입력할 수 있습니다.</li>
              <li>메모 모드에서는 후보 숫자를 입력하고 다시 눌러 제거합니다.</li>
              <li>방향키로 셀을 이동하고, Backspace 키로 값을 지울 수 있습니다.</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  )
}

export default App
