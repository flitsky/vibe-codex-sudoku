const difficultyLabels = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
}

export const GameControls = ({
  activeDifficulty,
  difficulties,
  onSelectDifficulty,
  onNewGame,
  noteMode,
  onToggleNoteMode,
  onUndo,
  onRedo,
  onHint,
  onRestart,
  canUndo,
  canRedo,
  isBusy,
}) => {
  return (
    <section className="game-controls" aria-label="게임 컨트롤">
      <div className="game-controls__row" role="group" aria-label="난이도 선택">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            className={`pill-button ${difficulty === activeDifficulty ? 'is-active' : ''}`}
            onClick={() => onSelectDifficulty?.(difficulty)}
            aria-pressed={difficulty === activeDifficulty}
            disabled={isBusy}
          >
            {difficultyLabels[difficulty] ?? difficulty}
          </button>
        ))}
        <button type="button" className="pill-button" onClick={() => onNewGame?.(activeDifficulty)} disabled={isBusy}>
          새 퍼즐
        </button>
      </div>

      <div className="game-controls__row" role="group" aria-label="플레이어 액션">
        <button type="button" className="pill-button" onClick={onUndo} disabled={!canUndo || isBusy}>
          되돌리기
        </button>
        <button type="button" className="pill-button" onClick={onRedo} disabled={!canRedo || isBusy}>
          다시하기
        </button>
        <button type="button" className={`pill-button ${noteMode ? 'is-active' : ''}`} onClick={onToggleNoteMode}>
          메모 {noteMode ? '켜짐' : '꺼짐'}
        </button>
        <button type="button" className="pill-button" onClick={onHint} disabled={isBusy}>
          힌트
        </button>
        <button type="button" className="pill-button pill-button--secondary" onClick={onRestart}>
          초기화
        </button>
      </div>
    </section>
  )
}
