import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

/* SVG Icon helpers */
const DashboardIcon = () => (
  <svg className="sidebar-link-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 14.5 6.2 10.4l3.2 2.7 4.3-5 4.3 3.1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 4.5h15v11h-15z" stroke="currentColor" strokeWidth="1.7"/>
  </svg>
)

const TemplatesIcon = () => (
  <svg className="sidebar-link-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 5h9v10H3z" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 9h9v10H8z" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)

const ReportsIcon = () => (
  <svg className="sidebar-link-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 16h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <rect x="4" y="9" width="2.6" height="6" fill="currentColor"/>
    <rect x="8.7" y="6" width="2.6" height="9" fill="currentColor"/>
    <rect x="13.4" y="3" width="2.6" height="12" fill="currentColor"/>
  </svg>
)

const SettingsIcon = () => (
  <svg className="sidebar-link-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9.9 3.2a1.6 1.6 0 0 1 1.6 1.6v.3c.4.1.8.3 1.1.5l.2-.2a1.6 1.6 0 1 1 2.2 2.2l-.2.2c.2.4.4.7.5 1.1h.3a1.6 1.6 0 1 1 0 3.2h-.3a5 5 0 0 1-.5 1.1l.2.2a1.6 1.6 0 1 1-2.2 2.2l-.2-.2a5 5 0 0 1-1.1.5v.3a1.6 1.6 0 1 1-3.2 0V16a5 5 0 0 1-1.1-.5l-.2.2a1.6 1.6 0 1 1-2.2-2.2l.2-.2a5 5 0 0 1-.5-1.1h-.3a1.6 1.6 0 1 1 0-3.2h.3c.1-.4.3-.8.5-1.1l-.2-.2a1.6 1.6 0 1 1 2.2-2.2l.2.2c.4-.2.7-.4 1.1-.5v-.3a1.6 1.6 0 0 1 1.6-1.6Z" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    if (path === '/ptp') return location.pathname.startsWith('/ptp')
    return location.pathname.startsWith(path)
  }

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, clickable: true },
    { label: 'Templates', path: '/ptp', icon: <TemplatesIcon />, clickable: false },
    { label: 'Reports', path: '/daily-reports', icon: <ReportsIcon />, clickable: false },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon />, clickable: false },
  ]

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          role="presentation"
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
        <nav className="sidebar-nav">
          {mainNavItems.map((item) => (
            item.clickable ? (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => {
                  if (isMobile) onClose()
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <button key={item.path} type="button" className="sidebar-link sidebar-link-disabled" aria-disabled="true">
                {item.icon}
                {item.label}
              </button>
            )
          ))}
        </nav>

        {user && isMobile && (
          <div className="sidebar-footer">
            <p className="sidebar-footer-label">Logged In As</p>
            <Link
              to="/profile"
              className="sidebar-link"
              style={{ padding: '8px 0', borderLeft: 'none' }}
            >
              {user.firstName} {user.lastName}
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar


