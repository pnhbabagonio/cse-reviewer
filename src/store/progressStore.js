import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sessionsAPI } from '../services/api'
import useAuthStore from './authStore'

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

      // Fetch remote sessions from API and merge with local
      fetchRemoteSessions: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated
        if (!isAuthenticated) return

        try {
          const response = await sessionsAPI.getAll()
          const remoteSessions = response.data || []
          
          const localSessions = get().sessions
          const localIds = new Set(localSessions.map(s => s.id))
          const newRemoteSessions = remoteSessions.filter(s => !localIds.has(String(s.id)))

          if (newRemoteSessions.length > 0) {
            const merged = [...localSessions, ...newRemoteSessions.map(s => ({
              id: String(s.id),
              date: s.completed_at,
              mode: s.mode,
              categories: s.categories,
              difficulty: s.difficulty,
              totalQuestions: s.total_questions,
              score: s.score,
              percentage: Number(s.percentage),
              passed: s.passed,
              timeTakenSeconds: s.time_taken_sec,
              results: (s.answers || []).map(a => ({
                questionId: a.question_id,
                userAnswer: a.user_answer,
                correctAnswer: a.correct_answer,
                isCorrect: a.is_correct,
              })),
            }))]
            set({ sessions: merged })
          }
        } catch (error) {
          console.warn('Failed to fetch remote sessions:', error.message)
        }
      },
    }),
    {
      name: 'cse_progress_store',
    }
  )
)

export default useProgressStore