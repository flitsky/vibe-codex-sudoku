const PARTICLE_COUNT = 28

export const CelebrationOverlay = () => {
  return (
    <div className="celebration-overlay" aria-hidden="true">
      {Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
        const offset = index - PARTICLE_COUNT / 2
        const delay = (index % 7) * 0.07
        return <span key={index} style={{ '--offset': offset, '--delay': `${delay}s` }} />
      })}
    </div>
  )
}
