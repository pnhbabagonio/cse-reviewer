import { useState, useEffect } from 'react'

export function useCountdown(targetDateString) {
  const calculate = () => {
    if (!targetDateString) return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false, isPast: false }

    // Target: midnight at the START of the exam date in local timezone
    const now = new Date()
    const target = new Date(targetDateString + 'T00:00:00')

    const todayStr = now.toISOString().split('T')[0]
    const isToday = todayStr === targetDateString
    const isPast = now > target && !isToday

    if (isPast) return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false, isPast: true }
    if (isToday) return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true, isPast: false }

    const diff = target - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, isToday: false, isPast: false }
  }

  const [timeLeft, setTimeLeft] = useState(calculate)

  useEffect(() => {
    if (!targetDateString) return
    const interval = setInterval(() => setTimeLeft(calculate()), 1000)
    return () => clearInterval(interval)
  }, [targetDateString])

  return timeLeft
}
