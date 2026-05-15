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
    <nav className={`navbar${isDailyReportsPage ? ' navbar--daily-report' : ''}`}>
      {isDailyReportsPage ? (
        /* ── Daily Report: single flat row — no nested flex gaps ── */
        <div className="navbar-dr-row">
        
          <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 7H19" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
              <path d="M5 17H19" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
            </svg>
          </button>

          <a
            href="/module-selection"
            className="navbar-brand-wordmark-link"
            onClick={(e) => { e.preventDefault(); navigate('/module-selection') }}
          >
            <img src="/images/barton-malow-logo.png" alt="Barton Malow" className="navbar-brand-logo" />
          </a>

          <button
            type="button"
            className="navbar-home-btn"
            aria-label="Go to module selection"
            onClick={() => navigate('/module-selection')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 8.2l7-5.4 7 5.4v8a1 1 0 0 1-1 1h-4.2v-5h-3.6v5H4a1 1 0 0 1-1-1v-8z" fill="#00263A"/>
            </svg>
          </button>

          <span className="navbar-breadcrumb-slash">/</span>
          <span className="navbar-breadcrumb-label">Daily Report</span>


          {/* Right section: Online status, Profile, Exit */}
          {user && (
            <div className="navbar-dr-right">
              <div className="navbar-status-badge">
                <span className="navbar-status-dot"></span>
                <span className="navbar-status-text">Online</span>
              </div>
              <div className="navbar-user-avatar-small">{initials}</div>
              <button className="navbar-exit-btn" onClick={handleLogout}>
                Exit
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Left: hamburger + brand */}
          <div className="navbar-left">
            <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 7H19" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
                <path d="M5 17H19" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="navbar-brand">
              <a
                href="/module-selection"
                className="navbar-brand-wordmark-link"
                onClick={(e) => { e.preventDefault(); navigate('/module-selection') }}
              >
                <img src="/images/barton-malow-logo.png" alt="Barton Malow" className="navbar-brand-logo" />
              </a>
              <span className="navbar-brand-text">{t('common.appName')}</span>
            </div>
          </div>

          {/* Right: Online status, Profile, Exit */}
          {user ? (
            <div className="navbar-dr-right">
              <button type="button" className="dr-feedback-btn">
                Feedback
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 4h8M3 7h6M3 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M11 11.5 8.9 10.2H3.8A1.8 1.8 0 0 1 2 8.4V3.8A1.8 1.8 0 0 1 3.8 2h6.4A1.8 1.8 0 0 1 12 3.8v6.3c0 .84-.92 1.35-1.64.9Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none" />
                </svg>
              </button>

              <button type="button" className="dr-help-btn" aria-label="Help">
                ?
              </button>

              <div className="dr-online-chip">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="5" fill="#2AAB58" opacity="0.22" />
                  <path d="M3.5 6.2 5.1 7.7 8.4 4.5" stroke="#2AAB58" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Online
              </div>

              <div className="dr-user-chip">{initials}</div>

              <button className="dr-exit-btn" onClick={handleLogout}>
                Exit
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 2.5H3.8A1.3 1.3 0 0 0 2.5 3.8v6.4A1.3 1.3 0 0 0 3.8 11.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M8.2 4.3 11 7l-2.8 2.7M10.8 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ) : null}
        </>
      )}
    </nav>
  )
}

export default Navigation

