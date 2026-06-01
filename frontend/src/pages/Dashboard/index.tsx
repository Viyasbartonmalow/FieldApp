import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import CreatePTPModal from '@/components/common/CreatePTPModal'
import ProjectSelectionModal from '@/components/common/ProjectSelectionModal'
import { useDataStoreReady } from '@/hooks/useDataStoreReady'
import { useDataStoreDiagnostics } from '@/hooks/useDataStoreDiagnostics'
import ptpWorkflowService, { PtpWorkflowRecord } from '@/services/ptpWorkflow.service'
import './Dashboard.css'

/* ── Stat card SVG icons ── */
const TotalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M8 4V2M16 4V2M3 9h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M7 13h4M7 17h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const InProgressIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M8 7h8M8 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="17" cy="17" r="4" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M16 16l1 1 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const SubmittedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="18" cy="18" r="4" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M16.5 18l1 1 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ReviewedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const FlaggedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M6 3v18M6 4h10l-3 4.5L16 13H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="18" cy="18" r="4" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M18 16v2.5M18 20v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const ClosedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

/* ── PTP item interface ── */
interface PTPItem {
  id: string
  name: string
  status: 'in-progress' | 'submitted' | 'reviewed' | 'flagged' | 'closed'
  isFlagged: boolean
  createdOn: string
  submittedBy: string
  lastUpdated: string
}

const STATUS_CONFIG: Record<PTPItem['status'], { label: string; cls: string }> = {
  'in-progress': { label: 'In Progress',          cls: 'badge-inprogress' },
  'submitted':   { label: 'Submitted', cls: 'badge-submitted' },
  'reviewed':    { label: 'Reviewed',             cls: 'badge-reviewed' },
  'flagged':     { label: 'Flagged for Changes',  cls: 'badge-flagged' },
  'closed':      { label: 'Closed',               cls: 'badge-closed' },
}

/* ── Filter dropdown ── */
const FilterSelect: React.FC<{ label: string; value: string; options: string[]; onChange: (v: string) => void }> =
  ({ label, value, options, onChange }) => (
  <div className="dash-filter">
    <select className="dash-filter-select" value={value} onChange={e => onChange(e.target.value)} aria-label={label}>
      <option value="">{label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <svg className="dash-filter-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  </div>
)

/* ── Project dropdown with modal ── */
const ProjectDropdown: React.FC<{
  value: string
  selectedChoices: string[]
  onChooseProject: (projectName: string) => void
  onOpenModal: () => void
}> = ({ value, selectedChoices, onChooseProject, onOpenModal }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="dashboard-project-dropdown">
      <button
        className="dashboard-project-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select project"
      >
        <span className="dashboard-project-value">{value}</span>
        <svg className="dashboard-project-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className="dashboard-project-menu">
          {selectedChoices.map((project) => (
            <button
              key={project}
              className={`dashboard-project-menu-choice ${project === value ? 'dashboard-project-menu-choice--active' : ''}`}
              onClick={() => {
                onChooseProject(project)
                setIsOpen(false)
              }}
            >
              {project}
            </button>
          ))}

          <div className="dashboard-project-menu-divider" />

          <button
            className="dashboard-project-menu-item"
            onClick={() => {
              setIsOpen(false)
              onOpenModal()
            }}
          >
            <span>Pick other project site</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 2l6 4-6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const PAGE_SIZE = 6

  const formatDateTime = (value?: string | null): string => {
    if (!value) return '-'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '-'
    return parsed.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterDate,   setFilterDate]     = useState('')
  const [filterFlagged, setFilterFlagged] = useState(false)
  const [isDateFieldActive, setIsDateFieldActive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(() => searchParams.get('createPTP') === '1')
  const [showProjectModal, setShowProjectModal] = useState(false)
  const showSyncDebug = searchParams.get('debugSync') === '1'

  // Clear only the createPTP param once consumed and preserve other debug/query flags.
  useEffect(() => {
    if (searchParams.get('createPTP') === '1') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('createPTP')
      setSearchParams(nextParams, { replace: true })
    }
  }, [])
  const [ptps, setPtps] = useState<PTPItem[]>([])
  const [deleteTarget, setDeleteTarget] = useState<PTPItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [exportTarget, setExportTarget] = useState<PTPItem | null>(null)
  const [exportRecord, setExportRecord] = useState<PtpWorkflowRecord | null>(null)
  const [isExportLoading, setIsExportLoading] = useState(false)
  const [isExportDownloading, setIsExportDownloading] = useState(false)
  const [showDownloadToast, setShowDownloadToast] = useState(false)
  const [showPtpSuccessToast, setShowPtpSuccessToast] = useState(false)
  const [ptpSuccessMessage, setPtpSuccessMessage] = useState('PTP submitted successfully.')
  const exportModalRef = useRef<HTMLDivElement>(null)
  const downloadToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ptpSuccessToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (downloadToastTimerRef.current) {
        clearTimeout(downloadToastTimerRef.current)
      }
      if (ptpSuccessToastTimerRef.current) {
        clearTimeout(ptpSuccessToastTimerRef.current)
      }
    }
  }, [])

  // Show PTP success toast if navigated here after a successful create/edit
  useEffect(() => {
    const state = location.state as { ptpSuccess?: boolean; ptpMessage?: string } | null
    if (state?.ptpSuccess) {
      setPtpSuccessMessage(state.ptpMessage || 'PTP submitted successfully.')
      setShowPtpSuccessToast(true)
      // Clear router state so refreshing doesn't re-show toast
      window.history.replaceState({}, '')
      if (ptpSuccessToastTimerRef.current) clearTimeout(ptpSuccessToastTimerRef.current)
      ptpSuccessToastTimerRef.current = setTimeout(() => {
        setShowPtpSuccessToast(false)
      }, 4000)
    }
  }, [location.state])

  const loadPTPs = async (attempt = 0) => {
    try {
      const rows = await ptpWorkflowService.listWorkflows({ limit: 200 })
        const mapped: PTPItem[] = rows.map((row) => {
        const statusMap: Record<string, PTPItem['status']> = {
          draft: 'in-progress',
          in_progress: 'in-progress',
          submitted: 'submitted',
          reviewed: 'reviewed',
          changes_requested: 'flagged',
          flagged: 'flagged',
          closed: 'closed',
        }

        const status = statusMap[row.status] ?? 'in-progress'
          const reviewPayload = (row.review_json ?? {}) as any
          const isFlagged = Boolean(reviewPayload.flaggedForChange) || status === 'flagged'
          const createdOn = formatDateTime(row.created_at)
          const updated = row.updated_at ? formatDateTime(row.updated_at) : createdOn

        return {
          id: row.ptp_id,
          name: row.title || 'Pre-Task Plan',
          status,
          isFlagged,
            createdOn,
            submittedBy: row.created_by || row.updated_by || 'Unknown',
          lastUpdated: updated,
        }
      })

      setPtps(mapped)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      const isClearingState = errorMessage.includes('DataStore') && errorMessage.includes('Clearing')

      if (isClearingState && attempt < 3) {
        window.setTimeout(() => {
          void loadPTPs(attempt + 1)
        }, 1000 * (attempt + 1))
        return
      }

      setPtps([])
    }
  }

  useEffect(() => {
    loadPTPs()
  }, [])

  const dataStoreReady = useDataStoreReady()
  const syncDiagnostics = useDataStoreDiagnostics(showSyncDebug)

  useEffect(() => {
    // Reload PTPs once DataStore is ready to ensure data is fresh from cloud
    if (dataStoreReady) {
      console.log('[Dashboard] DataStore ready, loading PTPs')
      loadPTPs()
    }
  }, [dataStoreReady])

  const handleRequestDelete = (ptp: PTPItem) => {
    setDeleteTarget(ptp)
  }

  const handleCancelDelete = () => {
    if (isDeleting) return
    setDeleteTarget(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return
    try {
      setIsDeleting(true)
      await ptpWorkflowService.deleteWorkflow(deleteTarget.id)
      setDeleteTarget(null)
      await loadPTPs()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenExport = async (ptp: PTPItem) => {
    setExportTarget(ptp)
    setExportRecord(null)
    try {
      setIsExportLoading(true)
      const fullRecord = await ptpWorkflowService.getWorkflow(ptp.id)
      setExportRecord(fullRecord)
    } catch {
      setExportRecord(null)
    } finally {
      setIsExportLoading(false)
    }
  }

  const handleCloseExport = () => {
    if (isExportLoading) return
    setExportTarget(null)
    setExportRecord(null)
  }

  const handleDownloadPDF = async () => {
    if (!exportModalRef.current || isExportDownloading) return
    try {
      setIsExportDownloading(true)
      
      // Capture the export modal content as canvas
      const canvas = await html2canvas(exportModalRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      // Calculate PDF dimensions
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const doc = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgData = canvas.toDataURL('image/png')
      let heightLeft = imgHeight
      let position = 0

      // Add pages as needed
      while (heightLeft > 0) {
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= doc.internal.pageSize.getHeight()
        if (heightLeft > 0) {
          doc.addPage()
          position = heightLeft - imgHeight
        }
      }

      // Generate filename
      const dateStr = new Date().toLocaleDateString('en-US').replace(/\//g, '-')
      const fileName = `${exportTarget?.name || 'PTP'}-${exportTarget?.status || 'export'}-${dateStr}.pdf`
      
      // Download PDF
      doc.save(fileName)

      // Show success toast and close modal after successful download
      setShowDownloadToast(true)
      handleCloseExport()
      if (downloadToastTimerRef.current) {
        clearTimeout(downloadToastTimerRef.current)
      }
      downloadToastTimerRef.current = setTimeout(() => {
        setShowDownloadToast(false)
      }, 3000)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsExportDownloading(false)
    }
  }

  const filteredPTPs = useMemo(() => {
    return ptps.filter((p) => {
      if (selectedProject && !p.name.toLowerCase().includes(selectedProject.toLowerCase())) return false
      if (filterCompany && !p.name.toLowerCase().includes(filterCompany.toLowerCase())) return false
      if (filterStatus) {
        const normalizedFilterStatus = filterStatus.toLowerCase().replace(/\s+/g, '-')
        if (p.status !== normalizedFilterStatus) return false
      }
      if (filterDate) {
        const selected = new Date(filterDate).toLocaleDateString('en-US')
        const createdDate = p.createdOn !== '-' ? new Date(p.createdOn).toLocaleDateString('en-US') : '-'
        if (createdDate !== selected) return false
      }
      if (filterFlagged && !p.isFlagged) return false
      return true
    })
  }, [filterCompany, filterDate, filterFlagged, filterStatus, ptps, selectedProject])

  const totalPtpCount = filteredPTPs.length
  const totalPages = Math.max(1, Math.ceil(totalPtpCount / PAGE_SIZE))
  const visiblePTPs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredPTPs.slice(start, start + PAGE_SIZE)
  }, [currentPage, filteredPTPs])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedProject, filterCompany, filterStatus, filterDate, filterFlagged])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1)
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 'ellipsis', totalPages] as Array<number | 'ellipsis'>
    }

    if (currentPage >= totalPages - 3) {
      return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as Array<number | 'ellipsis'>
    }

    return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages] as Array<number | 'ellipsis'>
  }

  const paginationItems = getPaginationItems()
  const startRecord = totalPtpCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endRecord = totalPtpCount === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, totalPtpCount)

  const statCards = [
    { label: "Total PTP's", value: ptps.length, icon: <TotalIcon />,      color: '#1B4F72', bgColor: 'rgba(27,79,114,0.12)' },
    { label: 'In Progress', value: ptps.filter((p) => p.status === 'in-progress').length, icon: <InProgressIcon />, color: '#E35205', bgColor: 'rgba(227,82,5,0.12)' },
    { label: 'Submitted',   value: ptps.filter((p) => p.status === 'submitted').length, icon: <SubmittedIcon />,  color: '#4D81E7', bgColor: 'rgba(77,129,231,0.12)' },
    { label: 'Reviewed',    value: ptps.filter((p) => p.status === 'reviewed').length, icon: <ReviewedIcon />,   color: '#22C55E', bgColor: 'rgba(34,197,94,0.12)' },
    { label: 'Flagged',     value: ptps.filter((p) => p.isFlagged).length, icon: <FlaggedIcon />,    color: '#D97706', bgColor: 'rgba(217,119,6,0.12)' },
    { label: 'Closed',      value: ptps.filter((p) => p.status === 'closed').length, icon: <ClosedIcon />,     color: '#DC2626', bgColor: 'rgba(220,38,38,0.12)' },
  ]

  const handleProjectSelectionsSave = (projects: string[]) => {
    const nextSelections = projects.slice(0, 4)
    setSelectedProjects(nextSelections)

    if (!nextSelections.includes(selectedProject) && nextSelections.length > 0) {
      setSelectedProject(nextSelections[0])
    }
  }

  const exportTasksPayload = (exportRecord?.tasks_json ?? {}) as any
  const exportActivityPayload = (exportRecord?.activity_controls_json ?? {}) as any
  const exportRequirementsPayload = (exportRecord?.requirements_json ?? {}) as any
  const exportEmergencyPayload = (exportRecord?.emergency_contacts_json ?? {}) as any
  const exportReviewPayload = (exportRecord?.review_json ?? {}) as any
  const exportWorkSteps = Array.isArray(exportTasksPayload.tasks) ? exportTasksPayload.tasks : []
  
  // Group activity selections by category
  const exportActivityGrouped = useMemo(() => {
    const items = exportActivityPayload.items ?? {}
    const grouped: Record<string, string[]> = {}
    
    Object.entries(items).forEach(([key, checked]) => {
      if (Boolean(checked)) {
        const [category, item] = key.split('::')
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(item || key)
      }
    })
    
    return grouped
  }, [exportActivityPayload])
  
  const exportPermits = Object.entries(exportRequirementsPayload.permits ?? {}).filter(([, checked]) => Boolean(checked)).map(([name]) => name)
  const exportPpe = Object.entries(exportRequirementsPayload.ppeItems ?? {}).filter(([, checked]) => Boolean(checked)).map(([name]) => name)

  return (
    <>
    <div className="dashboard-page">
      {showPtpSuccessToast && (
        <div className="dashboard-download-toast" role="status" aria-live="polite">
          <span className="dashboard-download-toast-icon">✓</span>
          <span className="dashboard-download-toast-text">{ptpSuccessMessage}</span>
          <button
            type="button"
            className="dashboard-download-toast-close"
            aria-label="Close notification"
            onClick={() => setShowPtpSuccessToast(false)}
          >
            ×
          </button>
        </div>
      )}

      {showDownloadToast && (
        <div className="dashboard-download-toast" role="status" aria-live="polite">
          <span className="dashboard-download-toast-icon">✓</span>
          <span className="dashboard-download-toast-text">File downloaded successfully</span>
          <button
            type="button"
            className="dashboard-download-toast-close"
            aria-label="Close notification"
            onClick={() => setShowDownloadToast(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* Page title */}
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Dashboard</h1>
      </div>

      {showSyncDebug && (
        <div className="dashboard-sync-debug" role="status" aria-live="polite">
          <div className="dashboard-sync-debug-title">DataStore Diagnostics</div>
          <div className="dashboard-sync-debug-grid">
            <div><strong>Ready:</strong> {syncDiagnostics.isReady ? 'yes' : 'no'}</div>
            <div><strong>Phase:</strong> {syncDiagnostics.syncPhase}</div>
            <div><strong>Last Event:</strong> {syncDiagnostics.lastEvent}</div>
            <div><strong>Event Count:</strong> {syncDiagnostics.eventCount}</div>
            <div><strong>Controls:</strong> {syncDiagnostics.counts.controls}</div>
            <div><strong>Task Details:</strong> {syncDiagnostics.counts.taskDetails}</div>
            <div><strong>Updated:</strong> {syncDiagnostics.lastUpdated || 'n/a'}</div>
          </div>
          {syncDiagnostics.lastError && (
            <div className="dashboard-sync-debug-error"><strong>Error:</strong> {syncDiagnostics.lastError}</div>
          )}
        </div>
      )}

      {/* Project dropdown */}
      <div className="dashboard-project-row">
        <label className="dashboard-project-label">Project</label>
        <ProjectDropdown
          value={selectedProject}
          selectedChoices={selectedProjects}
          onChooseProject={setSelectedProject}
          onOpenModal={() => setShowProjectModal(true)}
        />
      </div>

      {/* 6 stat cards — 2 rows of 3 */}
      <div className="dashboard-stats">
        {statCards.map(card => (
          <div className="dashboard-stat-card" key={card.label}>
            <div className="dashboard-stat-body">
              <div className="dashboard-stat-label">{card.label}</div>
              <div className="dashboard-stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous Pre-Task Plans section */}
      <div className="dashboard-table-card">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Previous Pre-Task Plans</h2>
        </div>

        {/* Filter row */}
        <div className="dashboard-filter-row">
          <FilterSelect label="All Companies" value={filterCompany} options={['Atlas Electrical', 'ProPipe Mechanical', 'All Companies']} onChange={setFilterCompany} />
          <FilterSelect label="All Status" value={filterStatus} options={['In Progress', 'Submitted', 'Reviewed', 'Closed']} onChange={setFilterStatus} />
          <div
            className={`dash-filter dash-filter-date ${!filterDate && !isDateFieldActive ? 'dash-filter-date--show-placeholder' : ''}`}
            data-placeholder="Select Date"
          >
            <input
              type={isDateFieldActive || Boolean(filterDate) ? 'date' : 'text'}
              className="dash-date-input"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              onFocus={() => setIsDateFieldActive(true)}
              onBlur={() => {
                if (!filterDate) setIsDateFieldActive(false)
              }}
              placeholder=""
            />
          </div>

          <label className="dashboard-flagged-filter">
            <input type="checkbox" checked={filterFlagged} onChange={e => setFilterFlagged(e.target.checked)} />
            <span>Flagged</span>
          </label>

          <button className="dashboard-btn-create" onClick={() => setShowCreateModal(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Create New PTP
          </button>
        </div>

        {/* PTP list */}
        <div className="dashboard-ptp-list">
          {visiblePTPs.map(ptp => {
            const s = STATUS_CONFIG[ptp.status]
            return (
              <div className="dashboard-ptp-item" key={ptp.id}>
                <div className="dashboard-ptp-main">
                  <div className="dashboard-ptp-top">
                    <a href="#" className="dashboard-ptp-name" onClick={e => { e.preventDefault(); navigate(`/ptp/workflow?ptpId=${ptp.id}`) }}>
                      {ptp.name}
                    </a>
                    <span className={`dash-status-badge ${s.cls}`}>{s.label}</span>
                    {ptp.isFlagged && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="#E30000" style={{ marginLeft: 6, flexShrink: 0 }}>
                        <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001"/>
                      </svg>
                    )}
                  </div>
                  <div className="dashboard-ptp-meta">
                    <span>Created On <strong>{ptp.createdOn}</strong></span>
                    <span className="dash-meta-sep">|</span>
                    <span>Last Updated <strong>{ptp.lastUpdated}</strong></span>
                  </div>
                  <div className="dashboard-ptp-meta">
                    <span>Submitted By <strong>{ptp.submittedBy}</strong></span>
                  </div>
                </div>
                <div className="dashboard-ptp-actions">
                  {ptp.status === 'closed' ? (
                    <button className="dash-icon-btn" title="Download" type="button" onClick={() => handleOpenExport(ptp)}>
                      <img
                        src="/images/ptpdownload.png"
                        alt="Download"
                        width="22"
                        height="22"
                        className="dash-action-icon"
                        style={{ objectFit: 'contain' }}
                      />
                    </button>
                  ) : (
                    <>
                  {ptp.status === 'reviewed' && (
                    <button
                      className="dash-icon-btn"
                      title="Open Day Closure"
                      onClick={() => navigate(`/ptp/workflow?ptpId=${ptp.id}&step=ptp-day-closure&fromClock=1`)}
                    >
                      <img
                        src="/images/clockico.png"
                        alt="Reviewed"
                        width="22"
                        height="22"
                        className="dash-action-icon dash-icon-reviewed"
                        style={{ objectFit: 'contain' }}
                      />
                    </button>
                  )}
                  {ptp.status === 'submitted' && !ptp.isFlagged && (
                    <button className="dash-icon-btn" title="Preview" onClick={() => navigate(`/ptp/preview?ptpId=${ptp.id}`)}>
                      <img src="/images/dashboardPreview.png" alt="Preview" width="22" height="22" style={{ objectFit: 'contain' }} />
                    </button>
                  )}
                  <button className="dash-icon-btn" title="Edit" onClick={() => navigate(`/ptp/workflow?ptpId=${ptp.id}`)}>
                    <img src="/images/DashboardEdit.png" alt="Edit" width="22" height="22" style={{ objectFit: 'contain' }} />
                  </button>
                  <button className="dash-icon-btn dash-icon-btn--delete" title="Delete" onClick={() => handleRequestDelete(ptp)}>
                    <img src="/images/DashboardDelete.png" alt="Delete" width="22" height="22" style={{ objectFit: 'contain' }} />
                  </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          {totalPtpCount === 0 && <div className="dashboard-empty-row">No records</div>}
        </div>

        <div className="dashboard-footer-row">
          <div className="dashboard-pagination-range">Showing {startRecord} - {endRecord} of {totalPtpCount}</div>
          <div className="dashboard-pagination">
            <button
              className="dash-page-btn"
              aria-label="Previous page"
              type="button"
              disabled={currentPage === 1 || totalPtpCount === 0}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              &lt;
            </button>

            {paginationItems.map((item, idx) => {
              if (item === 'ellipsis') {
                return <span key={`ellipsis-${idx}`} className="dash-page-ellipsis">...</span>
              }

              return (
                <button
                  key={item}
                  className={`dash-page-btn ${item === currentPage ? 'dash-page-btn--active' : ''}`}
                  aria-label={`Page ${item}`}
                  type="button"
                  onClick={() => setCurrentPage(item)}
                >
                  {item}
                </button>
              )
            })}

            <button
              className="dash-page-btn"
              aria-label="Next page"
              type="button"
              disabled={currentPage === totalPages || totalPtpCount === 0}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>

    {deleteTarget && (
      <div className="dashboard-delete-overlay" role="dialog" aria-modal="true" aria-label="Delete PTP">
        <div className="dashboard-delete-modal">
          <div className="dashboard-delete-header">
            <h3 className="dashboard-delete-title">Delete PTP</h3>
            <button className="dashboard-delete-close" type="button" onClick={handleCancelDelete} aria-label="Close">
              x
            </button>
          </div>
          <div className="dashboard-delete-body">
            <p className="dashboard-delete-text">Are you sure you want to delete:</p>
            <p className="dashboard-delete-name">{deleteTarget.name}</p>
          </div>
          <div className="dashboard-delete-actions">
            <button className="dashboard-delete-cancel" type="button" onClick={handleCancelDelete} disabled={isDeleting}>
              Cancel
            </button>
            <button className="dashboard-delete-confirm" type="button" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    )}

    {exportTarget && (
      <div className="dashboard-export-overlay" role="dialog" aria-modal="true" aria-label="Export PTP">
        <div className="dashboard-export-modal">
          <div className="dashboard-export-header">
            <h3 className="dashboard-export-title">Export PTP</h3>
            <button className="dashboard-export-close" type="button" onClick={handleCloseExport} aria-label="Close export modal">
              ✕
            </button>
          </div>

          <div className="dashboard-export-body">
            {isExportLoading && <div className="dashboard-export-loading">Loading PTP details...</div>}

            {!isExportLoading && !exportRecord && (
              <div className="dashboard-export-loading">Unable to load PTP details. Please try again.</div>
            )}

            {!isExportLoading && exportRecord && (
              <div className="dashboard-export-content" ref={exportModalRef}>
                {/* Header Section with Logo and Title */}
                <div className="export-header-section">
                  <div className="export-header-logo">
                    <img src="/images/barton-malow-logo.png" alt="Barton Malow" className="export-logo-image" />
                  </div>
                  <div className="export-header-title">
                    <h2 className="export-title-main">Pre-Task Plan</h2>
                    <p className="export-title-date">PTP Date: {formatDateTime(exportRecord.created_at)}</p>
                  </div>
                </div>

                <hr className="export-divider" />

                {/* Summary Table */}
                <div className="export-summary-section">
                  <table className="export-summary-table">
                    <tbody>
                      <tr>
                        <td className="export-label">Task &amp; Jobs</td>
                        <td className="export-value">{exportTasksPayload.tasks?.[0]?.name || exportRecord.title || '-'}</td>
                        <td className="export-label">Project Name</td>
                        <td className="export-value">{exportTasksPayload.project || '-'}</td>
                      </tr>
                      <tr>
                        <td className="export-label">Status</td>
                        <td className="export-value">{STATUS_CONFIG[(exportTarget.status as PTPItem['status'])].label}</td>
                        <td className="export-label">Created By</td>
                        <td className="export-value">{exportRecord.created_by || '-'}</td>
                      </tr>
                      <tr>
                        <td className="export-label">Company</td>
                        <td className="export-value">{exportReviewPayload.company || '-'}</td>
                        <td className="export-label">Submitted On</td>
                        <td className="export-value">{formatDateTime(exportRecord.updated_at)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr className="export-divider" />

                {/* Work Steps */}
                <div className="export-section">
                  <h3 className="export-section-title">Work Steps</h3>
                  {exportWorkSteps.length > 0 ? exportWorkSteps.map((step: any, idx: number) => (
                    <div className="export-work-step" key={`${step.id ?? 'step'}-${idx}`}>
                      <h4 className="export-step-name">Work Steps {idx + 1}</h4>
                      <div className="export-step-detail"><strong>Hazards or Exposures:</strong> {step.activityExposures || '-'}</div>
                      <div className="export-step-detail"><strong>Tools/Power Tools:</strong> {Array.isArray(step.toolsEquipment) ? step.toolsEquipment.join(', ') || '-' : '-'}</div>
                      <div className="export-step-detail"><strong>Control Measures:</strong> {step.controlMeasures || '-'}</div>
                    </div>
                  )) : <div className="export-item">No work steps recorded.</div>}
                </div>

                <hr className="export-divider" />

                {/* Hazards & Control Measures */}
                <div className="export-section">
                  <h3 className="export-section-title">Hazards &amp; Control Measures</h3>
                  {Object.keys(exportActivityGrouped).length > 0 ? (
                    <div className="export-hazards-container">
                      {Object.entries(exportActivityGrouped).map(([category, items]) => (
                        <div className="export-hazard-category" key={category}>
                          <h4 className="export-hazard-category-title">{category}</h4>
                          <div className="export-hazard-items">
                            {items.map((item) => (
                              <div className="export-hazard-item" key={item}>
                                <span className="export-checkmark">✓</span> {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="export-item">No selections recorded.</div>}
                </div>

                <hr className="export-divider" />

                {/* Requirements */}
                <div className="export-section">
                  <h3 className="export-section-title">Requirements</h3>
                  <div className="export-requirements-grid">
                    <div className="export-requirement-block">
                      <h4 className="export-requirement-title">Critical Hazards Permits</h4>
                      {exportPermits.length > 0 ? (
                        <div className="export-permit-list">
                          {exportPermits.map((permit) => (
                            <div key={permit} className="export-permit-item">
                              <span className="export-checkmark">✓</span> {permit}
                            </div>
                          ))}
                        </div>
                      ) : <div>-</div>}
                    </div>
                    <div className="export-requirement-block">
                      <h4 className="export-requirement-title">Required PPE</h4>
                      <div className="export-pee-category">
                        <strong>Respiratory Protection</strong>
                        {exportPpe.length > 0 ? (
                          <div className="export-pee-list">
                            {exportPpe.map((pee) => (
                              <div key={pee} className="export-pee-item">
                                <span className="export-checkmark">✓</span> {pee}
                              </div>
                            ))}
                          </div>
                        ) : <div>-</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="export-divider" />

                {/* Emergency Information */}
                <div className="export-section">
                  <h3 className="export-section-title">Emergency Information</h3>
                  <table className="export-info-table">
                    <tbody>
                      <tr>
                        <td className="export-info-label">Safety Professional</td>
                        <td className="export-info-value">{exportEmergencyPayload.safetyContact || '-'}</td>
                      </tr>
                      <tr>
                        <td className="export-info-label">Superintendent</td>
                        <td className="export-info-value">{exportEmergencyPayload.superintendentContact || '-'}</td>
                      </tr>
                      <tr>
                        <td className="export-info-label">Master Location</td>
                        <td className="export-info-value">{exportEmergencyPayload.musterArea || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr className="export-divider" />

                {/* Crew Members */}
                <div className="export-section">
                  <h3 className="export-section-title">Crew Members</h3>
                  <table className="export-crew-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Signature</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(exportRecord.crew_signin_json) ? exportRecord.crew_signin_json : []).map((member: any, idx: number) => (
                        <tr key={`${member.id ?? 'crew'}-${idx}`}>
                          <td>{idx + 1}</td>
                          <td>{member.name || '-'}</td>
                          <td>
                            {member.signatureData ? (
                              <img src={member.signatureData} alt="Crew signature" className="export-crew-signature" />
                            ) : <span className="export-no-sig">-</span>}
                          </td>
                          <td>{member.time ? formatDateTime(member.time) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <hr className="export-divider" />

                {/* Signatures */}
                <div className="export-section">
                  <h3 className="export-section-title">Signatures</h3>
                  <div className="export-signatures-grid">
                    <div className="export-signature-block">
                      <h4>Shift Start</h4>
                      <p><strong>Signed By:</strong> {exportReviewPayload.foremanName || 'Not signed'}</p>
                      <p><strong>Company:</strong> {exportReviewPayload.company || '-'}</p>
                      <p><strong>Signed Date:</strong> {exportReviewPayload.foremanSignatureDate ? formatDateTime(exportReviewPayload.foremanSignatureDate) : '-'}</p>
                      {exportReviewPayload.foremanSignature ? (
                        <img src={exportReviewPayload.foremanSignature} alt="Foreman signature" className="export-signature-img" />
                      ) : <div className="export-no-signature">No signature</div>}
                    </div>
                    <div className="export-signature-block">
                      <h4>Shift End</h4>
                      <p><strong>Signed By:</strong> {exportReviewPayload.supervisorName || 'Not signed'}</p>
                      <p><strong>Company:</strong> {exportReviewPayload.company || '-'}</p>
                      <p><strong>Signed Date:</strong> {exportReviewPayload.supervisorSignatureDate ? formatDateTime(exportReviewPayload.supervisorSignatureDate) : '-'}</p>
                      {exportReviewPayload.supervisorSignature ? (
                        <img src={exportReviewPayload.supervisorSignature} alt="Supervisor signature" className="export-signature-img" />
                      ) : <div className="export-no-signature">No signature</div>}
                    </div>
                  </div>
                </div>

                {/* Generated Timestamp */}
                <div className="export-footer-timestamp">
                  Generated on: {new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-export-actions">
            <button type="button" className="dashboard-export-btn dashboard-export-btn-close" onClick={handleCloseExport} disabled={isExportDownloading}>Close</button>
            <button type="button" className="dashboard-export-btn dashboard-export-btn-download" onClick={handleDownloadPDF} disabled={isExportDownloading}>
              {isExportDownloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    )}

    {showCreateModal && <CreatePTPModal onClose={() => setShowCreateModal(false)} />}
    {showProjectModal && (
      <ProjectSelectionModal
        onClose={() => setShowProjectModal(false)}
        onSelect={handleProjectSelectionsSave}
        currentSelections={selectedProjects}
      />
    )}
    </>
  )
}

export default DashboardPage

