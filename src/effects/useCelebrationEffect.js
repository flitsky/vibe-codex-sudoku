import { useCallback, useEffect, useState } from 'react'

const CELEBRATION_DURATION = 2400

export const useCelebrationEffect = () => {
  const [isActive, setIsActive] = useState(false)
  const [triggerCount, setTriggerCount] = useState(0)

  const triggerCelebration = useCallback(() => {
    setIsActive(true)
    setTriggerCount((count) => count + 1)
  }, [])

  useEffect(() => {
    if (!isActive) return undefined

    const timeout = window.setTimeout(() => {
      setIsActive(false)
    }, CELEBRATION_DURATION)

    return () => window.clearTimeout(timeout)
  }, [isActive, triggerCount])

  return { isActive, triggerCelebration }
}
