import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, setAuthToken, getAuthToken, ensureGuestToken } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      init: async () => {
        const token = getAuthToken()
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })
        try {
          const response = await authAPI.getUser()
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          setAuthToken(null)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const guestToken = ensureGuestToken()
          const response = await authAPI.login({
            email,
            password,
            guest_token: guestToken,
          })

          setAuthToken(response.token)
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      register: async (username, email, password, passwordConfirmation) => {
        set({ isLoading: true })
        try {
          const guestToken = ensureGuestToken()
          const response = await authAPI.register({
            username,
            email,
            password,
            password_confirmation: passwordConfirmation,
            guest_token: guestToken,
          })

          setAuthToken(response.token)
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message, errors: error.errors }
        }
      },

      logout: async () => {
        try {
          await authAPI.logout()
        } catch (error) {
          // Ignore logout errors — clear local state anyway
        }
        setAuthToken(null)
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cse_auth_store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore