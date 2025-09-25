const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export const NumberPad = ({ onSelectNumber, onClear, noteMode, onToggleNoteMode, disabled = false }) => {
  return (
    <section className="number-pad" aria-label="숫자 패드">
      <div className="number-pad__grid">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            className="number-pad__button"
            onClick={() => onSelectNumber?.(digit)}
            disabled={disabled}
          >
            {digit}
          </button>
        ))}
      </div>
      <div className="number-pad__footer">
        <button
          type="button"
          className="number-pad__button number-pad__button--ghost"
          onClick={onClear}
          disabled={disabled}
        >
          지우기
        </button>
        <button
          type="button"
          className={`number-pad__button number-pad__button--ghost ${noteMode ? 'is-active' : ''}`}
          onClick={onToggleNoteMode}
          disabled={disabled}
        >
          메모 모드
        </button>
      </div>
    </section>
  )
}
