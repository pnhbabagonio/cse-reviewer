import { useEffect, useRef, useState } from 'react'
import { useStudyTimeStore } from '../store/studyTimeStore'

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useStudyTimer({ categories = [] } = {}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const addRecord = useStudyTimeStore(s => s.addRecord)

  const elapsedRef = useRef(0)
  const pausedRef = useRef(false)
  const categoriesRef = useRef(categories)

  if (Array.isArray(categories) && categories.length > 0) {
    categoriesRef.current = categories
  }

  useEffect(() => {
    const handleVisibility = () => {
      const hidden = document.hidden
      pausedRef.current = hidden
      setIsPaused(hidden)
    }

    handleVisibility()

    const interval = setInterval(() => {
      if (!pausedRef.current) {
        elapsedRef.current += 1
        setElapsedSeconds(elapsedRef.current)
      }
    }, 1000)

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (elapsedRef.current > 0) {
        addRecord({
          date: getLocalDateString(),
          categories: categoriesRef.current,
          durationSeconds: elapsedRef.current,
        })
      }
    }
  }, [])

  return { elapsedSeconds, isPaused }
}
