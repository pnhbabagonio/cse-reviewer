import { NavLink } from 'react-router-dom'
import { Home, History, Bookmark, Settings } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 px-4 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-gold dark:text-gold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-gold'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
