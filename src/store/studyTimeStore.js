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

const formatRangeDate = (dateStr) => (
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  })
)

const formatDateRangeLabel = (dateStrings) => {
  const start = dateStrings[0]
  const end = dateStrings[dateStrings.length - 1]
  if (!start || !end) return ''
  if (start === end) return formatRangeDate(start)
  return `${formatRangeDate(start)} - ${formatRangeDate(end)}`
}

const WEEK_COUNTS_BY_RANGE = {
  30: 4,
  60: 8,
  90: 13,
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

  getChartData: (range) => {
    const records = get().records

    if (range === 7) {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = getLocalDateString(date)
        const totalSeconds = records
          .filter(r => r.date === dateStr)
          .reduce((sum, r) => sum + r.durationSeconds, 0)
        const label = date.toLocaleDateString('en-PH', { weekday: 'short' })
        days.push({ label, totalSeconds })
      }
      return days
    }

    const weekCount = WEEK_COUNTS_BY_RANGE[range] ?? Math.ceil(range / 7)
    const dateStrings = []
    for (let i = range - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dateStrings.push(getLocalDateString(date))
    }

    const daysPerGroup = Math.ceil(range / weekCount)
    const weeks = []
    for (let index = 0; index < weekCount; index++) {
      const groupDates = dateStrings.slice(index * daysPerGroup, (index + 1) * daysPerGroup)
      const totalSeconds = groupDates.reduce((sum, dateStr) => {
        return sum + records
          .filter(r => r.date === dateStr)
          .reduce((recordSum, r) => recordSum + r.durationSeconds, 0)
      }, 0)
      weeks.push({
        label: formatDateRangeLabel(groupDates),
        startLabel: formatRangeDate(groupDates[0]),
        endLabel: formatRangeDate(groupDates[groupDates.length - 1]),
        totalSeconds,
      })
    }

    return weeks
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
