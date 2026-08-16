import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { flagsAPI } from '../services/api'
import useAuthStore from './authStore'

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

        // Sync to API
        if (useAuthStore.getState().isAuthenticated) {
          flagsAPI.add(questionId, reason).catch(() => {})
        }
      },

      unflagQuestion: (questionId) => {
        set((state) => {
          const newFlags = { ...state.flags }
          delete newFlags[questionId]
          return { flags: newFlags }
        })

        // Sync removal to API
        if (useAuthStore.getState().isAuthenticated) {
          flagsAPI.remove(questionId).catch(() => {})
        }
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

      // Fetch flags from API and merge with local
      fetchRemoteFlags: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated
        if (!isAuthenticated) return

        try {
          const response = await flagsAPI.getAll()
          const remoteFlags = response.data || []
          
          const localFlags = get().flags
          const merged = { ...localFlags }

          for (const flag of remoteFlags) {
            if (!merged[flag.question_id]) {
              merged[flag.question_id] = {
                reason: flag.reason,
                timestamp: new Date(flag.created_at).getTime(),
              }
            }
          }

          set({ flags: merged })
        } catch (error) {
          console.warn('Failed to fetch remote flags:', error.message)
        }
      },
    }),
    {
      name: 'cse_flag_store',
    }
  )
)

export default useFlagStore