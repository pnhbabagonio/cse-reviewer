import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getItem, setItem } from '../utils/storage'

const savedSettings = getItem('settings', {}) || {}

const useSettingsStore = create(
  persist(
    (set, get) => ({
      darkMode: false,
      timerSound: true,
      examCountdown: savedSettings.examCountdown ?? null,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleTimerSound: () => set((state) => ({ timerSound: !state.timerSound })),

      setExamCountdown: (examName, examDate) => {
        const countdown = { examName, examDate }
        set({ examCountdown: countdown })
        const current = getItem('settings', {}) || {}
        setItem('settings', { ...current, examCountdown: countdown })
      },

      clearExamCountdown: () => {
        set({ examCountdown: null })
        const current = getItem('settings', {}) || {}
        const { examCountdown, ...rest } = current
        setItem('settings', rest)
      },

      importQuestions: (newQuestions) => {
        const existing = localStorage.getItem('cse_imported_bank')
        let merged = []
        if (existing) {
          try {
            merged = JSON.parse(existing)
          } catch(e) {}
        }
        // merge, avoid duplicates by id
        const combined = [...merged, ...newQuestions]
        const unique = Array.from(new Map(combined.map(q => [q.id, q])).values())
        localStorage.setItem('cse_imported_bank', JSON.stringify(unique))
        // trigger reload of questions in examStore
        window.dispatchEvent(new Event('storage'))
        // simple page reload to refresh question bank
        window.location.reload()
      },
    }),
    {
      name: 'cse_settings_store',
    }
  )
)

export default useSettingsStore
