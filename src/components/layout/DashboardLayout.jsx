import { Outlet, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { Menu, Zap } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import { SidebarContext } from '../../context/SidebarContext.jsx'

function DashboardLayout() {
  const { isCollapsed, toggleMobileSidebar } = useContext(SidebarContext)
  const location = useLocation()
  const isInboxPage = location.pathname === '/inbox'

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900">Nudge</span>
          </div>
        </div>
      </header>

      <Sidebar />

      {/* Main Content */}
      <main
        className={`
          flex-1 overflow-y-auto transition-all duration-300 ease-in-out
          ml-0 mt-16 lg:mt-0
          ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        {isInboxPage ? (
          <Outlet />
        ) : (
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardLayout
