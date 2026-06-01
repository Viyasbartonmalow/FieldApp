import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RootState } from '@/store'
import { logout } from '@/store/authSlice'
import { useLanguage } from '@/context/LanguageContext'
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

      {/* Right: feedback + help + online + user + exit */}
      <div className="navbar-right">
        <button className="dr-feedback-btn" aria-label="Feedback">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 14l1-4H1a3 3 0 013-3h8a3 3 0 013 3v2a3 3 0 01-3 3H5l-4 3v-3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span>Feedback</span>
        </button>

        <button className="dr-help-btn" aria-label="Help">?</button>

        <span className="dr-online-chip" aria-label="Online status">
          <span className="dr-online-dot" />
          Online
        </span>

        {user && (
          <span
            className="dr-user-chip"
            aria-label={`User initials, role ${user.role ?? 'Foreman'}`}
            title={user.role ?? 'Foreman'}
          >
            {initials}
          </span>
        )}

        <button type="button" className="dr-exit-btn" onClick={handleLogout} aria-label="Exit">
          Exit
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M9 3h4v10H9M3 8h8M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}

export default Navigation

