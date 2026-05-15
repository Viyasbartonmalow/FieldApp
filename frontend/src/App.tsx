import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/layout/Layout'

// Pages
import LoginPage from '@/pages/Login'
import DashboardPage from '@/pages/Dashboard'
import PTPPage from '@/pages/PTP'
import TradeSpecificTemplatePage from '@/pages/PTP/TradeSpecificTemplate'
import ActivityControlsPage from '@/pages/PTP/ActivityControls'
import PreviousDayPTPPage from '@/pages/PTP/PreviousDayPTP'
import PriorDatesPTPPage from '@/pages/PTP/PriorDatesPTP'
import PTPWorkflowPage from '@/pages/PTP/PTPWorkflow'
import PTPPreviewPage from '@/pages/PTP/PTPPreview'
import CrewSignInPage from '@/pages/CrewSignIn'
import ModuleSelectionPage from '@/pages/ModuleSelection'
import DailyReportsPage from '@/features/dailyReports/pages'
import NotFoundPage from '@/pages/NotFound'

const App: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/module-selection"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ModuleSelectionPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes (Main Layout) */}
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/daily-reports" element={<DailyReportsPage />} />
        <Route path="/daily-reports/:reportId" element={<DailyReportsPage />} />
        <Route path="/daily-reports/:reportId/preview" element={<DailyReportsPage />} />
        <Route path="/daily-reports/new" element={<DailyReportsPage />} />
        <Route path="/ptp" element={<PTPPage />} />
        <Route path="/ptp/create/previous-day" element={<PreviousDayPTPPage />} />
        <Route path="/ptp/create/trade-specific" element={<TradeSpecificTemplatePage />} />
        <Route path="/ptp/create/trade-specific/activity-controls" element={<ActivityControlsPage />} />
        <Route path="/ptp/create/prior-dates" element={<PriorDatesPTPPage />} />
        <Route path="/ptp/workflow" element={<PTPWorkflowPage />} />
        <Route path="/ptp/preview" element={<PTPPreviewPage />} />
        <Route path="/crew-signin" element={<CrewSignInPage />} />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
