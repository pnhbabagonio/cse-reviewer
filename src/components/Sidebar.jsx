import { NavLink, useNavigate } from 'react-router-dom'
import { Bookmark, History, Home, Settings } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-60 bg-[#f8f9fb] dark:bg-[#0f1f35] border-r border-gray-200 dark:border-gray-800 z-40">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <span className="font-heading font-bold text-lg text-[#1e3a5f] dark:text-white">
          CSE Pro Reviewer
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Professional Level</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `px-3 py-2.5 flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
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
