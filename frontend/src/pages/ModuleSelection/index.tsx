import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setActiveModule } from '@/store/moduleSlice'
import './ModuleSelection.css'

const ChecklistIcon = () => (
  <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="12" y="11" width="34" height="36" rx="4" fill="#EA5605"/>
    <rect x="24" y="8" width="10" height="7" rx="3.5" fill="#EA5605"/>
    <path d="M20 29.5l5 5L37 22" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ReportIcon = () => (
  <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 10h16l10 10v28a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill="#00324E"/>
    <path d="M34 10v10h10" fill="#00324E"/>
    <path d="M23 28h12M23 35h12M23 42h8" stroke="white" strokeWidth="4" strokeLinecap="round"/>
  </svg>
)

const OnboardIcon = () => (
  <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="12" y="11" width="34" height="36" rx="4" fill="#6B8294"/>
    <rect x="24" y="8" width="10" height="7" rx="3.5" fill="#6B8294"/>
    <circle cx="29" cy="24" r="7" fill="white"/>
    <path d="M18 40c3.5-6 18.5-6 22 0" stroke="white" strokeWidth="4" strokeLinecap="round"/>
  </svg>
)

const ModuleSelectionPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSelectPTP = () => {
    dispatch(setActiveModule('ptp'))
    navigate('/dashboard')
  }

  const handleSelectDailyReports = () => {
    dispatch(setActiveModule('daily-reports'))
    navigate('/daily-reports')
  }

  return (
    <div className="module-selection-page">
      <div className="module-selection-grid">
        <button type="button" className="module-card module-card-ptp" onClick={handleSelectPTP}>
          <div className="module-icon-wrap"><ChecklistIcon /></div>
          <div className="module-title">Pre-Task Plan</div>
        </button>

        <button type="button" className="module-card module-card-daily" onClick={handleSelectDailyReports}>
          <div className="module-icon-wrap"><ReportIcon /></div>
          <div className="module-title">Daily Report</div>
        </button>

        <button type="button" className="module-card module-card-disabled" disabled>
          <div className="module-icon-wrap"><OnboardIcon /></div>
          <div className="module-title">Onboarding</div>
          <div className="module-pill">Coming Soon...</div>
        </button>
      </div>
    </div>
  )
}

export default ModuleSelectionPage
