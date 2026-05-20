import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen">
        <div className="w-full max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
