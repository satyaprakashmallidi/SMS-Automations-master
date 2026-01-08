import PropTypes from 'prop-types'
import { createContext, useState } from 'react'

/* eslint-disable react-refresh/only-export-components */
export const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen)
  const closeMobileSidebar = () => setIsMobileOpen(false)

  return (
    <SidebarContext.Provider 
      value={{ 
        isCollapsed, 
        toggleCollapse, 
        isMobileOpen, 
        toggleMobileSidebar, 
        closeMobileSidebar 
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
