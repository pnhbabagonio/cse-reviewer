import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Bookmark, History, Home, Settings, Flag, LogIn, LogOut, Trophy } from 'lucide-react'
import useFlagStore from '../store/flagStore'
import useAuthStore from '../store/authStore'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/flagged', icon: Flag, label: 'Flagged', badge: true },
  { path: '/history', icon: History, label: 'History' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const flaggedCount = useFlagStore((state) => Object.keys(state.flags || {}).length)
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-60 bg-[#f8f9fb] dark:bg-[#0f1f35] border-r border-gray-200 dark:border-gray-800 z-40">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <span className="font-heading font-bold text-lg text-[#1e3a5f] dark:text-white">
          CSE Pro Reviewer
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Professional Level</p>
      </div>

      {/* User status */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {user.username}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login / Register
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `px-3 py-2.5 flex items-center gap-3 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {badge && flaggedCount > 0 && (
              <span className="ml-auto min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                {flaggedCount > 99 ? '99+' : flaggedCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={() => navigate('/setup', { state: { mode: 'timed' } })}
          className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium"
        >
          Take Exam
        </button>
        <button
          onClick={() => navigate('/setup', { state: { mode: 'practice' } })}
          className="w-full py-2.5 border border-[#1e3a5f] text-[#1e3a5f] dark:text-white dark:border-white rounded-lg text-sm font-medium"
        >
          Practice Mode
        </button>
      </div>
    </aside>
  )
}