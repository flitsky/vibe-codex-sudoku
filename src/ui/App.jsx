import { useEffect, useMemo, useState } from 'react'
import { useCelebrationEffect } from '../effects/useCelebrationEffect.js'
import './App.css'

const DIFFICULTIES = ['easy', 'normal', 'hard']

function App({ gameService }) {
  const [board, setBoard] = useState([])
  const [activeDifficulty, setActiveDifficulty] = useState(DIFFICULTIES[0])
  const { triggerCelebration } = useCelebrationEffect()

  const hasBoard = board.length > 0

  useEffect(() => {
    if (!gameService) return undefined

    let isMounted = true

    gameService.startNewGame({ difficulty: activeDifficulty }).then(({ puzzle }) => {
      if (isMounted) {
        setBoard(puzzle)
      }
    })

    return () => {
      isMounted = false
    }
  }, [activeDifficulty, gameService])

  const handlePuzzleComplete = () => {
    triggerCelebration()
  }

  const difficultyLabels = useMemo(
    () => ({
      easy: '쉬움',
      normal: '보통',
      hard: '어려움',
    }),
    [],
  )

  return (
    <main className="app">
      <header className="app__header">
        <h1>Vibe Codex Sudoku</h1>
        <p className="app__subtitle">클린 아키텍처 기반 웹 스도쿠 MVP</p>
      </header>

      <section className="app__controls" aria-label="난이도 선택">
        {DIFFICULTIES.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            className={`app__difficulty ${difficulty === activeDifficulty ? 'is-active' : ''}`}
            onClick={() => setActiveDifficulty(difficulty)}
          >
            {difficultyLabels[difficulty]}
          </button>
        ))}
        <button type="button" className="app__celebrate" onClick={handlePuzzleComplete}>
          퍼즐 완료 시연
        </button>
      </section>

      <section className="app__board" aria-label="스도쿠 보드">
        {!gameService && <p className="app__empty-state">게임 서비스가 초기화되지 않았습니다.</p>}
        {gameService && hasBoard ? (
          <table>
            <tbody>
              {board.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`} data-filled={cell !== null}>
                      {cell ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="app__empty-state">퍼즐 데이터를 불러오는 중입니다…</p>
        )}
      </section>
    </main>
  )
}

export default App
