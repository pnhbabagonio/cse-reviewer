import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  const location = useLocation()
  const hideNavPaths = ['/exam', '/results', '/review']
  const showBottomNav = !hideNavPaths.includes(location.pathname)

  return (
    <div className="min-h-screen pb-20">
      <Outlet />
      {showBottomNav && <BottomNav />}
    </div>
  )
}