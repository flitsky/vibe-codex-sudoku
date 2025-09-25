const formatTime = (elapsedMs = 0) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const StatusBar = ({ difficultyLabel, elapsedMs, mistakes, mistakeLimit, hintsUsed, status, resumed }) => {
  const mistakesRemaining = Math.max(0, (mistakeLimit ?? 0) - (mistakes ?? 0))

  return (
    <section className="status-bar" aria-live="polite">
      <div className="status-bar__item">
        <span className="status-bar__label">난이도</span>
        <span className="status-bar__value">{difficultyLabel}</span>
      </div>
      <div className="status-bar__item">
        <span className="status-bar__label">경과 시간</span>
        <span className="status-bar__value">{formatTime(elapsedMs)}</span>
      </div>
      <div className="status-bar__item">
        <span className="status-bar__label">실수 가능</span>
        <span className="status-bar__value">
          {mistakesRemaining} / {mistakeLimit}
        </span>
      </div>
      <div className="status-bar__item">
        <span className="status-bar__label">힌트 사용</span>
        <span className="status-bar__value">{hintsUsed}</span>
      </div>
      <div className={`status-bar__badge status-${status}`}>
        {status === 'completed' ? '퍼즐 완료!' : status === 'ready' ? (resumed ? '이어서 플레이 중' : '플레이 중') : status === 'loading' ? '로딩 중' : status === 'error' ? '오류' : ''}
      </div>
    </section>
  )
}
