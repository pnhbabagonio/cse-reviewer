import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Calendar, BookOpen, Clock, Moon, Sun } from 'lucide-react'
import useProgressStore from '../store/progressStore'
import { useStudyTimeStore } from '../store/studyTimeStore'
import ScoreRing from '../components/ScoreRing'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import CategoryBadge from '../components/CategoryBadge'
import CountdownCard from '../components/CountdownCard'
import useSettingsStore from '../store/settingsStore'

const formatPercentage = (value) => {
  if (!Number.isFinite(value)) return '0.00'
  return value.toFixed(2)
}

const formatDuration = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600)
  const min = Math.floor((totalSeconds % 3600) / 60)
  if (hrs === 0) return `${min} min`
  if (min === 0) return `${hrs} hr`
  return `${hrs} hr ${min} min`
}

const RANGES = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '60D', value: 60 },
  { label: '90D', value: 90 },
]

export default function Home() {
  const navigate = useNavigate()
  const [chartRange, setChartRange] = useState(7)
  const { sessions, getStats, getCategoryStats } = useProgressStore()
  const {
    dailyGoalMinutes,
    getTotalSeconds,
    getTodaySeconds,
    getChartData,
    getCategoryBreakdown,
  } = useStudyTimeStore()
  const { darkMode, toggleDarkMode } = useSettingsStore()
  const stats = getStats()
  const categoryStats = getCategoryStats()
  const totalStudySeconds = getTotalSeconds()
  const todayStudySeconds = getTodaySeconds()
  const chartData = getChartData(chartRange).map(day => ({
    ...day,
    minutes: Math.round(day.totalSeconds / 60),
  }))
  const maxChartMinutes = Math.max(...chartData.map(day => day.minutes), 1)
  const categoryTimeBreakdown = getCategoryBreakdown()

  const recentSessions = sessions.slice(0, 5)

  const categoryConfig = {
    verbal: { label: 'Verbal', color: 'bg-blue-500' },
    analytical: { label: 'Analytical', color: 'bg-purple-500' },
    numerical: { label: 'Numerical', color: 'bg-green-500' },
    general_info: { label: 'General Info', color: 'bg-orange-500' },
    filipino: { label: 'Filipino', color: 'bg-red-500' },
  }

  return (
    <div className="w-full space-y-6">
      <CountdownCard />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">CSE Pro</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Professional Level Reviewer</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div className="card flex flex-col items-center text-center">
          <ScoreRing percentage={stats.overallAccuracy} size={140} />
          <h2 className="mt-3 text-xl font-bold">Overall Mastery</h2>
          <p className="text-sm text-gray-500">{stats.totalQuestions} questions answered</p>
        </div>

        <div className="space-y-3 mt-6 lg:mt-0">
          <h3 className="font-semibold text-lg">Per-Category Progress</h3>
          {Object.entries(categoryConfig).map(([key, { label, color }]) => {
            const catStat = categoryStats[key] || { accuracy: 0, total: 0 }
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span>{formatPercentage(catStat.accuracy)}% ({catStat.total} qs)</span>
                </div>
                <ProgressBar value={catStat.accuracy} max={100} color={color} />
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total Answered" value={stats.totalQuestions} icon={BookOpen} />
        <StatCard label="Exams Taken" value={sessions.length} icon={CheckCircle} />
        <StatCard label="Current Streak" value={stats.streak} icon={Calendar} />
        <StatCard label="Study Time" value={formatDuration(totalStudySeconds)} icon={Clock} />
      </div>

      {dailyGoalMinutes && (() => {
        const goalSeconds = dailyGoalMinutes * 60
        const pct = Math.min(100, Math.round((todayStudySeconds / goalSeconds) * 100))
        const isComplete = pct >= 100
        return (
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
            <div className="flex justify-between items-center gap-3 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Daily Study Goal
              </span>
              <span className={`text-sm font-semibold text-right ${isComplete ? 'text-green-500' : 'text-[#1e3a5f] dark:text-amber-400'}`}>
                {formatDuration(todayStudySeconds)} / {formatDuration(goalSeconds)}
                {isComplete && ' ✓'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-amber-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })()}

      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Study Time
          </h3>
          <div className="flex gap-1">
            {RANGES.map(range => (
              <button
                key={range.value}
                onClick={() => setChartRange(range.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  chartRange === range.value
                    ? 'bg-[#1e3a5f] text-white dark:bg-amber-400 dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div
            className="h-40 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))`,
              minWidth: `${Math.max(320, chartData.length * 48)}px`,
            }}
          >
            {chartData.map(day => {
              const height = day.minutes === 0
                ? '2px'
                : `${Math.max(8, Math.round((day.minutes / maxChartMinutes) * 100))}%`
              return (
                <div key={day.label} className="h-full min-w-0 flex flex-col items-center justify-end gap-2">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {day.minutes}
                  </span>
                  <div className="h-24 w-full flex items-end justify-center">
                    <div
                      className={`w-full max-w-[40px] rounded-t transition-all duration-500 ${day.minutes > 0 ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                      style={{ height }}
                      title={`${day.label}: ${day.minutes} min`}
                    />
                  </div>
                  {day.startLabel && day.endLabel ? (
                    <span className="h-8 text-[10px] leading-tight text-gray-500 dark:text-gray-400 text-center">
                      <span className="block">{day.startLabel}</span>
                      <span className="block">{day.endLabel}</span>
                    </span>
                  ) : (
                    <span className="h-8 text-[11px] text-gray-500 dark:text-gray-400 text-center">
                      {day.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
          {chartRange === 7 ? 'Last 7 days' : `Last ${chartRange} days (grouped by date range)`}
        </p>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Time by Category
        </h3>
        <div className="space-y-2">
          {Object.entries(categoryTimeBreakdown).map(([cat, seconds]) => (
            <div key={cat} className="flex items-center justify-between">
              <CategoryBadge category={cat} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {seconds > 0 ? formatDuration(seconds) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {recentSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Recent Sessions</h3>

          <div className="space-y-3 lg:hidden">
            {recentSessions.map((session) => (
              <div key={session.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                        {session.mode === 'timed' ? 'Timed' : 'Practice'}
                      </span>
                      {session.categories.slice(0, 2).map(cat => (
                        <CategoryBadge key={cat} category={cat} />
                      ))}
                      {session.categories.length > 2 && (
                        <span className="text-xs text-gray-500">+{session.categories.length - 2}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${session.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.round(session.percentage)}%
                    </div>
                    <div className={`text-xs ${session.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {session.passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                </div>
                <ProgressBar value={session.score} max={session.totalQuestions} />
              </div>
            ))}
          </div>

          <div className="hidden lg:block overflow-hidden card">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Categories</th>
                  <th className="pb-3 font-medium">Questions</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentSessions.map(session => (
                  <tr key={session.id}>
                    <td className="py-3 pr-3 text-gray-600 dark:text-gray-300">{new Date(session.date).toLocaleDateString()}</td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {session.categories.slice(0, 2).map(cat => (
                          <CategoryBadge key={cat} category={cat} />
                        ))}
                        {session.categories.length > 2 && (
                          <span className="text-xs text-gray-500">+{session.categories.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-3">{session.totalQuestions}</td>
                    <td className="py-3 pr-3 font-semibold">{Math.round(session.percentage)}%</td>
                    <td className={`py-3 font-semibold ${session.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {session.passed ? 'PASSED' : 'FAILED'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-4 lg:hidden">
        <button
          onClick={() => navigate('/setup', { state: { mode: 'timed' } })}
          className="w-full btn-primary"
        >
          Take Exam
        </button>
        <button
          onClick={() => navigate('/setup', { state: { mode: 'practice' } })}
          className="w-full btn-outline"
        >
          Practice Mode
        </button>
      </div>
    </div>
  )
}
