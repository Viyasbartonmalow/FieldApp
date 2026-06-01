import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import Sidebar from './Sidebar'
import './Layout.css'

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`layout ${sidebarOpen ? 'layout--sidebar-open' : 'layout--sidebar-closed'}`}>
      <Navigation onToggleSidebar={() => setSidebarOpen((p) => !p)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-content">
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

