import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useProgressStore = create(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (session) => {
        set((state) => ({ sessions: [session, ...state.sessions] }))
      },

      clearHistory: () => {
        set({ sessions: [] })
      },

      getStats: () => {
        const { sessions } = get()
        if (sessions.length === 0) {
          return { overallAccuracy: 0, totalQuestions: 0, streak: 0 }
        }
        let totalCorrect = 0
        let totalAnswered = 0
        const dates = new Set()
        for (const session of sessions) {
          totalCorrect += session.score
          totalAnswered += session.totalQuestions
          const sessionDate = new Date(session.date).toDateString()
          dates.add(sessionDate)
        }
        const overallAccuracy = totalAnswered === 0 ? 0 : (totalCorrect / totalAnswered) * 100
        return {
          overallAccuracy,
          totalQuestions: totalAnswered,
          streak: dates.size,
        }
      },

      getCategoryStats: () => {
        const { sessions } = get()
        const catStats = {}
        for (const session of sessions) {
          if (session.categoryBreakdown) {
            for (const [cat, data] of Object.entries(session.categoryBreakdown)) {
              if (!catStats[cat]) catStats[cat] = { correct: 0, total: 0 }
              catStats[cat].correct += data.correct
              catStats[cat].total += data.total
            }
          }
        }
        const result = {}
        for (const [cat, data] of Object.entries(catStats)) {
          result[cat] = {
            accuracy: data.total === 0 ? 0 : (data.correct / data.total) * 100,
            total: data.total,
          }
        }
        return result
      },

      getWeakestCategory: () => {
        const { sessions } = get()
        if (sessions.length === 0) return null

        const subStats = {}
        for (const session of sessions) {
          if (session.subcategoryBreakdown) {
            for (const [key, data] of Object.entries(session.subcategoryBreakdown)) {
              if (!subStats[key]) {
                subStats[key] = { ...data, correct: 0, total: 0 }
              }
              subStats[key].correct += data.correct
              subStats[key].total += data.total
            }
          }
        }

        if (Object.keys(subStats).length === 0) return null

        let weakest = null
        let lowestAccuracy = Infinity

        for (const [key, data] of Object.entries(subStats)) {
          if (data.total < 3) continue
          const accuracy = data.total === 0 ? 0 : (data.correct / data.total) * 100
          if (accuracy < lowestAccuracy) {
            lowestAccuracy = accuracy
            weakest = { key, ...data, accuracy }
          }
        }

        return weakest
      },
    }),
    {
      name: 'cse_progress_store',
    }
  )
)

export default useProgressStore