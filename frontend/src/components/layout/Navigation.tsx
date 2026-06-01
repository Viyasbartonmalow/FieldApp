import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RootState } from '@/store'
import { logout } from '@/store/authSlice'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import './Navigation.css'

interface NavigationProps {
  onToggleSidebar: () => void
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSidebar }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)
  const { t } = useLanguage()
  const isDailyReportsPage = location.pathname.startsWith('/daily-reports')

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  /** Initials from user name */
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U'

  return (
    <nav className="navbar">
      {/* Left: hamburger + brand */}
      <div className="navbar-left">
        <button
          className="navbar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <div className="navbar-brand" aria-label="Brand">
          <img
            src="/images/barton-malow-logo.png"
            alt="Barton Malow"
            className="navbar-brand-logo"
          />

          {isDailyReportsPage ? (
            <div className="navbar-breadcrumb">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 8.2l7-5.4 7 5.4v8a1 1 0 0 1-1 1h-4.2v-5h-3.6v5H4a1 1 0 0 1-1-1v-8z" fill="#00263A"/>
              </svg>
              <span className="navbar-breadcrumb-slash">/</span>
              <span className="navbar-breadcrumb-label">Daily Report</span>
            </div>
          ) : (
            <span className="navbar-brand-text">{t('common.appName')}</span>
          )}
        </div>
      </div>

      {/* Right: daily report controls OR default header controls */}
      <div className="navbar-right">
        {isDailyReportsPage ? (
          <>
            <span className="dr-online-chip" aria-label="Online status">
              <span className="dr-online-dot" />
              Online
            </span>
            <span className="dr-user-chip" aria-label="User initials">{initials}</span>
            <button type="button" className="dr-exit-btn" onClick={handleLogout}>
              Exit
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M9 3h4v10H9M3 8h8M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        ) : (
          <>
            <LanguageSwitcher variant="header" />

            <button className="navbar-bell" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 00-6 6c0 3.5-1.5 5-2 5.5h16c-.5-.5-2-2-2-5.5a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M8.5 17a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {user && (
              <div className="navbar-user-area">
                <div className="navbar-user-avatar">{initials}</div>
                <div className="navbar-user-info">
                  <span className="navbar-user-name">
                    {user.lastName},{user.firstName}
                  </span>
                  <span className="navbar-user-role">{user.role ?? 'Foreman'}</span>
                </div>
                <button className="navbar-logout-btn" onClick={handleLogout}>
                  {t('common.logout')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  )
}

export default Navigation

