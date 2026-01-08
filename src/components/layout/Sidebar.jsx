import { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { SidebarContext } from '../../context/SidebarContext.jsx'
import { useAuth } from '../../hooks/useAuth'
import SMSCreditsWidget from './SMSCreditsWidget.jsx'
import { navTabs } from '../../data/dashboardData.js'

function Sidebar() {
  const navigate = useNavigate()
  const { 
    isCollapsed, 
    toggleCollapse, 
    isMobileOpen, 
    closeMobileSidebar 
  } = useContext(SidebarContext)
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    closeMobileSidebar()
    navigate('/login')
  }

  // Get the icon component from lucide-react
  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName]
    return IconComponent ? (
      <IconComponent className="w-5 h-5" strokeWidth={1.5} />
    ) : null
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-white text-gray-600 border-r border-gray-200 shadow-lg shadow-gray-200/50 transition-all duration-300 ease-in-out flex flex-col z-40 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          w-64 
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`
        }
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
          <div 
            className={`flex items-center gap-3 ${isCollapsed ? 'lg:w-full lg:justify-center lg:cursor-pointer' : ''}`}
            onClick={isCollapsed ? toggleCollapse : undefined}
            title={isCollapsed ? "Expand sidebar" : ""}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0 transition-transform hover:scale-105">
              <Icons.Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            
            {/* Show title if: Mobile OR Desktop Expanded */}
            {(!isCollapsed || isMobileOpen) && (
              <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
                <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-none">
                  Nudge
                </h1>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                  Automations
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:block p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Collapse sidebar"
            >
              <Icons.ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {navTabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group 
                ${isCollapsed ? 'lg:justify-center' : ''} 
                ${isActive
                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
              title={isCollapsed ? tab.label : ''}
            >
              <span className={`flex-shrink-0 transition-transform ${!isCollapsed && 'group-hover:scale-105'}`}>
                {getIcon(tab.icon)}
              </span>
              
              {/* Label: Always show on Mobile. On Desktop, show only if expanded */}
              <span className={`text-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                {tab.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          {/* Content: Always show full footer on Mobile. On Desktop, respect collapse state. */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className={`space-y-4 animate-fade-in ${isCollapsed ? 'lg:hidden' : ''}`}>
              <SMSCreditsWidget />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Icons.LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : null}

          {/* Collapsed Desktop Footer Icons */}
          {isCollapsed && (
            <div className="hidden lg:flex flex-col items-center gap-4">
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <Icons.LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
