import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Target, Flame, Calendar, LogIn } from 'lucide-react'
import { leaderboardAPI } from '../services/api'
import useAuthStore from '../store/authStore'

const TABS = [
  { id: 'accuracy', label: 'Accuracy', icon: Target },
  { id: 'streak', label: 'Streak', icon: Flame },
  { id: 'simulator', label: 'Simulator', icon: Trophy },
  { id: 'weekly', label: 'Weekly', icon: Calendar },
]

const RANK_COLORS = {
  1: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  2: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

const getRankBadge = (rank) => {
  if (rank <= 3) {
    return (
      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${RANK_COLORS[rank]}`}>
        {rank}
      </span>
    )
  }
  return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700">
      {rank}
    </span>
  )
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('accuracy')
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await leaderboardAPI[getApiMethod(activeTab)]()
        setData(response.data || [])
      } catch (err) {
        setError('Failed to load leaderboard. Please check your connection.')
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [activeTab])

  const getApiMethod = (tab) => {
    switch (tab) {
      case 'accuracy': return 'getAccuracy'
      case 'streak': return 'getStreak'
      case 'simulator': return 'getSimulator'
      case 'weekly': return 'getWeekly'
      default: return 'getAccuracy'
    }
  }

  const getColumnLabel = (tab) => {
    switch (tab) {
      case 'accuracy': return 'Accuracy'
      case 'streak': return 'Streak (Days)'
      case 'simulator': return 'Best Score'
      case 'weekly': return 'Accuracy'
      default: return 'Score'
    }
  }

  const getRowValue = (item, tab) => {
    switch (tab) {
      case 'accuracy': return `${Number(item.overall_accuracy).toFixed(1)}%`
      case 'streak': return `${item.current_streak} days`
      case 'simulator': return `${item.best_simulator_score}/150`
      case 'weekly': return `${Number(item.overall_accuracy).toFixed(1)}%`
      default: return ''
    }
  }

  const getSubValue = (item, tab) => {
    switch (tab) {
      case 'accuracy': return `${item.total_questions} questions`
      case 'streak': return `Longest: ${item.longest_streak} days`
      case 'simulator': return `${item.exams_taken} exams taken`
      case 'weekly': return `${item.total_questions} questions this week`
      default: return ''
    }
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-1">Top performers in the CSE Reviewer community</p>
      </div>

      {/* Login prompt for unauthenticated users */}
      {!isAuthenticated && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Want to see your name on the leaderboard?
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              Create an account to save your progress and compete with others.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1e3a5f] text-white text-xs font-medium hover:bg-[#152a4a] transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            Join Now
          </button>
        </div>
      )}

      {/* User's rank if authenticated */}
      {isAuthenticated && user && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-lg font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.username}</p>
            <p className="text-xs text-gray-500">Your scores are being tracked — keep practicing!</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-navy dark:border-t-gold rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{error}</p>
            <button
              onClick={() => setActiveTab(activeTab)}
              className="mt-3 px-4 py-2 rounded-lg bg-navy text-white text-sm"
            >
              Retry
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No data available for this category yet.</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to make the leaderboard!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500">
                  <th className="pb-3 font-medium w-16">Rank</th>
                  <th className="pb-3 font-medium">Username</th>
                  <th className="pb-3 font-medium text-right">{getColumnLabel(activeTab)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item, index) => (
                  <tr key={item.username + index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 pr-3">{getRankBadge(index + 1)}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          {item.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white truncate">
                            {item.username}
                          </p>
                          <p className="text-xs text-gray-400">{getSubValue(item, activeTab)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold text-navy dark:text-gold">
                      {getRowValue(item, activeTab)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}