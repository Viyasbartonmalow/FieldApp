import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import DailyReportHeader from '@/features/dailyReports/components/DailyReportHeader'
import DailyReportTabs from '@/features/dailyReports/components/DailyReportTabs'
import DailyReportWorkspace from '@/features/dailyReports/components/DailyReportWorkspace'
import DailyReportsList from '@/features/dailyReports/components/DailyReportsList'
import SummaryCards, { SummaryCardData } from '@/features/dailyReports/components/SummaryCards'
import { DailyReportTab } from '@/features/dailyReports/types'
import styles from '@/features/dailyReports/components/DailyReports.module.css'

const tabOrder: DailyReportTab[] = [
  'subcontractors',
  'tasks',
  'incidents',
  'equipment',
  'schedule',
  'delivers',
  'observations',
]

const DailyReportsPage: React.FC = () => {
  const { reportId } = useParams<{ reportId?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const isCreateMode = location.pathname === '/daily-reports/new'
  const isPreviewMode = location.pathname.endsWith('/preview')
  const showListView = !reportId && !isCreateMode
  const [activeTab, setActiveTab] = useState<DailyReportTab>(isPreviewMode ? 'preview' : 'subcontractors')
  const [footerAction, setFooterAction] = useState<(() => Promise<void>) | null>(null)
  const [footerState, setFooterState] = useState({
    isEditing: false,
    isLoading: false,
    canSubmit: false,
  })
  const [footerError, setFooterError] = useState<string | null>(null)
  const [projectSiteName, setProjectSiteName] = useState<string>('')
  const [reportCreatedDate, setReportCreatedDate] = useState<string>('')
  const [summaryCards, setSummaryCards] = useState<SummaryCardData[]>([])

  useEffect(() => {
    if (isPreviewMode) {
      setActiveTab('preview')
    } else if (activeTab === 'preview') {
      setActiveTab('subcontractors')
    }
  }, [isPreviewMode, activeTab])

  // If no reportId and not in /new route, show the list view.
  if (showListView) {
    return <DailyReportsList />
  }

  const handleSaveAndNext = async () => {
    if (footerAction) {
      setFooterError(null)
      try {
        await footerAction()
      } catch (err) {
        setFooterError(err instanceof Error ? err.message : 'Failed to save report')
        return
      }
    }

    setFooterError(null)

    const currentTabIndex = tabOrder.indexOf(activeTab)
    const nextTab = tabOrder[Math.min(currentTabIndex + 1, tabOrder.length - 1)]
    setActiveTab(nextTab)
  }

  const handlePrev = () => {
    const currentTabIndex = tabOrder.indexOf(activeTab)
    if (currentTabIndex > 0) {
      setActiveTab(tabOrder[currentTabIndex - 1])
    }
  }

  const isFirstTab = tabOrder.indexOf(activeTab) === 0
  const isObservationsTab = activeTab === 'observations'
  const showGlobalFooter = !isPreviewMode && !isObservationsTab
  const showTabs = !isPreviewMode

  const headerTitle = projectSiteName || 'Daily Report'
  const headerSubtitle = reportCreatedDate 
    ? `From Pre-Task-Plans - ${reportCreatedDate}. Editable Until Finalization.`
    : isCreateMode ? 'New Report' : `Report #${reportId ?? ''}`

  return (
    <div className={styles.page}>
      <DailyReportHeader title={headerTitle} subtitle={headerSubtitle} />
      <div className={styles.panel}>
        {!isPreviewMode && summaryCards.length > 0 && (
          <SummaryCards cards={summaryCards} />
        )}
        {showTabs && <DailyReportTabs activeTab={activeTab} onChange={setActiveTab} />}

        <div className={styles.content}>
          <DailyReportWorkspace
            activeTab={activeTab}
            reportId={reportId}
            onGeneratePreview={(resolvedReportId) => navigate(`/daily-reports/${resolvedReportId}/preview`)}
            onBackFromPreview={() => {
              if (reportId) {
                navigate(`/daily-reports/${reportId}`)
              }
            }}
            onFinalizeReport={() => navigate('/daily-reports')}
            onMetadataChange={(metadata) => {
              setProjectSiteName(metadata.projectSite)
              setReportCreatedDate(metadata.createdDate)
            }}
            onSummaryChange={setSummaryCards}
            onPrev={handlePrev}
            onRegisterSaveHandler={(handler) => {
              if (handler) {
                setFooterAction(() => handler)
                return
              }
              setFooterAction(null)
            }}
            onFooterStateChange={setFooterState}
          />
        </div>

        {showGlobalFooter && (
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnNav}
              onClick={handlePrev}
              disabled={isFirstTab || footerState.isLoading}
            >
              ← Prev
            </button>
            {footerError && (
              <p style={{ margin: 0, color: '#cf3d09', fontWeight: 600, fontSize: 13 }}>{footerError}</p>
            )}
            {isObservationsTab ? null : (
              <button
                type="button"
                className={styles.btnNav}
                onClick={() => void handleSaveAndNext()}
                disabled={footerState.isLoading}
              >
                {footerState.isLoading ? 'Saving...' : 'Next →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyReportsPage
