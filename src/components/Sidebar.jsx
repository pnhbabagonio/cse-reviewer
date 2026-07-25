import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Bookmark, History, Home, Settings, Flag } from 'lucide-react'
import useFlagStore from '../store/flagStore'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/flagged', icon: Flag, label: 'Flagged', badge: true },
  { path: '/history', icon: History, label: 'History' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const flaggedCount = useFlagStore((state) => Object.keys(state.flags || {}).length)

  const handleNavigate = (path) => {
    sessionStorage.setItem('flagged_prev_path', location.pathname)
    navigate(path)
  }

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-60 bg-[#f8f9fb] dark:bg-[#0f1f35] border-r border-gray-200 dark:border-gray-800 z-40">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <span className="font-heading font-bold text-lg text-[#1e3a5f] dark:text-white">
          CSE Pro Reviewer
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Professional Level</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={() => {
              sessionStorage.setItem('flagged_prev_path', location.pathname)
            }}
            className={({ isActive }) =>
              `px-3 py-2.5 flex items-center gap-3 rounded-lg text-sm font-medium transition-colors relative ${isActive
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