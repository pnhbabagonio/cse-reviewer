import { useState, useEffect, useRef, useCallback } from 'react'

export default function useTimer({ durationSeconds, onExpire, autoStart = true }) {
  const initialDuration = Math.max(0, durationSeconds)
  const [timeLeft, setTimeLeft] = useState(initialDuration)
  const [isRunning, setIsRunning] = useState(autoStart && initialDuration > 0)
  const intervalRef = useRef(null)
  const timeLeftRef = useRef(initialDuration)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            if (onExpireRef.current) onExpireRef.current()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  const pause = useCallback(() => setIsRunning(false), [])
  const resume = useCallback(() => {
    setIsRunning(timeLeftRef.current > 0)
  }, [])
  const reset = useCallback((newDuration) => {
    const nextDuration = Math.max(0, newDuration)
    setTimeLeft(nextDuration)
    setIsRunning(nextDuration > 0)
  }, [])

  return { timeLeft, isRunning, pause, resume, reset }
}
