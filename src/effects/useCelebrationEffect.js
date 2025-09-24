import { useCallback } from 'react'

export const useCelebrationEffect = () => {
  const triggerCelebration = useCallback(() => {
    // Placeholder for celebratory animation or sound effect hooks
    if (import.meta.env.DEV) {
      console.info('Celebration effect triggered')
    }
  }, [])

  return { triggerCelebration }
}
