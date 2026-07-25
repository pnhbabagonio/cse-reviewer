import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const FLAG_REASONS = [
  { value: 'wrong_answer', label: 'Wrong Answer', icon: '❌' },
  { value: 'typo', label: 'Typo / Error', icon: '📝' },
  { value: 'unclear', label: 'Unclear Question', icon: '❓' },
  { value: 'missing_image', label: 'Missing Image', icon: '🖼️' },
  { value: 'duplicate', label: 'Duplicate', icon: '🔄' },
]

const useFlagStore = create(
  persist(
    (set, get) => ({
      flags: {},

      flagQuestion: (questionId, reason) => {
        set((state) => ({
          flags: {
            ...state.flags,
            [questionId]: { reason, timestamp: Date.now() },
          },
        }))
      },

      unflagQuestion: (questionId) => {
        set((state) => {
          const newFlags = { ...state.flags }
          delete newFlags[questionId]
          return { flags: newFlags }
        })
      },

      isFlagged: (questionId) => {
        return !!get().flags[questionId]
      },

      getFlag: (questionId) => {
        return get().flags[questionId] || null
      },

      getFlaggedIds: () => {
        return Object.keys(get().flags)
      },

      getFlaggedCount: () => {
        return Object.keys(get().flags).length
      },
    }),
    {
      name: 'cse_flag_store',
    }
  )
)

export default useFlagStore