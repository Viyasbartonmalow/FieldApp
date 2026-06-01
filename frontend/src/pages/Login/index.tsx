import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess, loginFailed } from '@/store/authSlice'
import { clearAndSyncDataStore } from '@/services/datastore-sync'
import type { UserRole } from '@/types'
import './Login.css'

const LoginPage: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'foreman' | 'superintendent'>('foreman')

  const DEMO_EMAIL = 'demo@bartonmalow.com'

  const handleSignIn = async (role: UserRole = selectedRole) => {
    setIsLoading(true)
    setServerError(null)

    try {
      dispatch(loginSuccess({
        user: {
          id: 'demo-001',
          email: DEMO_EMAIL,
          firstName: 'Caverly',
          lastName: 'Allatt',
          role,
          company: 'Barton Malow',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: `demo-access-token-${role}`,
          refreshToken: `demo-refresh-token-${role}`,
          expiresIn: 3600,
        },
      }))
      
      // Preserve debugSync query flag across login redirects for in-app diagnostics.
      const incomingParams = new URLSearchParams(location.search)
      const debugSync = incomingParams.get('debugSync') === '1'

      if (role === 'foreman') {
        const nextParams = new URLSearchParams({ createPTP: '1' })
        if (debugSync) nextParams.set('debugSync', '1')
        navigate(`/dashboard?${nextParams.toString()}`)
      } else {
        const suffix = debugSync ? '?debugSync=1' : ''
        navigate(`/module-selection${suffix}`)
      }

      // Clear local DataStore and resync from DynamoDB after login (background)
      // Don't await so navigation isn't blocked
      void clearAndSyncDataStore()
    } catch {
      setServerError('Sign in failed')
      dispatch(loginFailed('Sign in failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <header className="login-topbar">
        <img
          className="login-logo-image"
          src="/images/barton-malow-logo.png"
          alt="Barton Malow"
        />
      </header>

      <div className="login-bg" />

      <div className="login-card">
        <h2 className="login-title">FieldApp</h2>
        <p className="login-subtitle">Login</p>

        {serverError && (
          <div className="login-error" role="alert">
            {serverError}
          </div>
        )}

        {/* Role selector */}
        <div className="login-role-selector">
          <button
            type="button"
            className={`login-role-btn${selectedRole === 'foreman' ? ' login-role-btn--active' : ''}`}
            onClick={() => setSelectedRole('foreman')}
          >
            Foreman
          </button>
          <button
            type="button"
            className={`login-role-btn${selectedRole === 'superintendent' ? ' login-role-btn--active' : ''}`}
            onClick={() => setSelectedRole('superintendent')}
          >
            Superintendent
          </button>
        </div>

        <div className="login-form">
          <button type="button" className="login-btn-primary" disabled={isLoading} onClick={() => handleSignIn(selectedRole)}>
            <span className="login-btn-icon" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            {isLoading && <span className="login-spinner" aria-hidden="true" />}
            Sign in with Barton Malow
          </button>

          <div className="login-divider" role="separator" aria-hidden="true">
            <div className="login-divider-line" />
            <span className="login-divider-text">OR</span>
            <div className="login-divider-line" />
          </div>

          <button
            type="button"
            className="login-btn-crew"
            disabled={isLoading}
            onClick={() => handleSignIn('crew' as UserRole)}
          >
            Click here to log in as Crew Member
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

