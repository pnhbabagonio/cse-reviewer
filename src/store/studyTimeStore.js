import { create } from 'zustand'
import { getItem, setItem } from '../utils/storage'

const STORAGE_KEY = 'study_time'

const defaultState = {
  records: [],
  dailyGoalMinutes: null,
}

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeState = (state) => ({
  records: Array.isArray(state?.records) ? state.records : [],
  dailyGoalMinutes: state?.dailyGoalMinutes ?? null,
})

const load = () => normalizeState(getItem(STORAGE_KEY, defaultState))
const save = (state) => setItem(STORAGE_KEY, {
  records: state.records,
  dailyGoalMinutes: state.dailyGoalMinutes,
})

export const useStudyTimeStore = create((set, get) => ({
  ...load(),

  addRecord: ({ date, categories, durationSeconds }) => {
    const record = {
      date,
      categories: Array.isArray(categories) ? categories : [],
      durationSeconds,
    }
    const records = [...get().records, record]
    set({ records })
    save({ records, dailyGoalMinutes: get().dailyGoalMinutes })
  },

  setDailyGoal: (minutes) => {
    set({ dailyGoalMinutes: minutes })
    save({ records: get().records, dailyGoalMinutes: minutes })
  },

  clearRecords: () => {
    set({ records: [] })
    save({ records: [], dailyGoalMinutes: get().dailyGoalMinutes })
  },

  getTotalSeconds: () =>
    get().records.reduce((sum, r) => sum + r.durationSeconds, 0),

  getTodaySeconds: () => {
    const today = getLocalDateString()
    return get().records
      .filter(r => r.date === today)
      .reduce((sum, r) => sum + r.durationSeconds, 0)
  },

  getLast7DaysData: () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = getLocalDateString(date)
      const totalSeconds = get().records
        .filter(r => r.date === dateStr)
        .reduce((sum, r) => sum + r.durationSeconds, 0)
      days.push({ date: dateStr, totalSeconds })
    }
    return days
  },

  getCategoryBreakdown: () => {
    const breakdown = { verbal: 0, analytical: 0, numerical: 0, general_info: 0, filipino: 0 }
    get().records.forEach(r => {
      if (!Array.isArray(r.categories) || r.categories.length === 0) return
      r.categories.forEach(cat => {
        if (breakdown[cat] !== undefined) {
          breakdown[cat] += Math.floor(r.durationSeconds / r.categories.length)
        }
      })
    })
    return breakdown
  },
}))
