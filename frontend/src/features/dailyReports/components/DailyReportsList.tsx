import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDailyReports } from '@/features/dailyReports/hooks/useDailyReports'
import DeleteConfirmModal from '@/features/dailyReports/components/DeleteConfirmModal'
import PreTaskControlsList from '@/features/dailyReports/components/PreTaskControlsList'
import Modal from '@/components/common/Modal'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import projectAppsyncService from '@/services/projectAppsync.service'
import pretaskControlService, { PreTaskControl } from '@/services/pretaskControl.service'
import styles from './DailyReports.module.css'

interface FilterState {
  projectSite: string
  date: string
  status: string
}

interface CreateReportFormState {
  projectSite: string
  reportDate: string
  status: string
}

const formatDisplayDate = (value?: string | null): string | null => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  const datePart = parsed.toLocaleDateString('en-US')
  const timePart = parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${datePart} - ${timePart}`
}

const DailyReportsList: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const { reports, loading, error, loadReports, deleteReport, saveReport } = useDailyReports()

  const [filters, setFilters] = useState<FilterState>({
    projectSite: '',
    date: '',
    status: '',
  })

  const [deleteState, setDeleteState] = useState<{ open: boolean; reportId: string; message: string }>({
    open: false,
    reportId: '',
    message: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createModalError, setCreateModalError] = useState<string | null>(null)
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  const [createForm, setCreateForm] = useState<CreateReportFormState>({
    projectSite: '',
    reportDate: '',
    status: 'In Progress',
  })
  const [projectNameOptions, setProjectNameOptions] = useState<string[]>([])
  const [preTaskControls, setPreTaskControls] = useState<PreTaskControl[]>([])
  const [preTaskControlsLoading, setPreTaskControlsLoading] = useState(false)
  const [preTaskControlsError, setPreTaskControlsError] = useState<string | null>(null)
  const itemsPerPage = 6

  useEffect(() => {
    void loadReports()
  }, [loadReports])

  useEffect(() => {
    const loadProjectNames = async () => {
      try {
        const projects = await projectAppsyncService.listProjectNames()
        const normalizedProjects = Array.from(
          new Set(projects.map((name) => name.trim()).filter((name) => Boolean(name)))
        ).sort((a, b) => a.localeCompare(b))

        setProjectNameOptions(normalizedProjects)
      } catch {
        setProjectNameOptions([])
      }
    }

    void loadProjectNames()
  }, [])

  // Fetch PreTaskControl data when both project and date are selected in the create modal
  useEffect(() => {
    const fetchPreTaskControlData = async () => {
      if (!createForm.projectSite.trim() || !createForm.reportDate) {
        setPreTaskControls([])
        setPreTaskControlsError(null)
        return
      }

      setPreTaskControlsLoading(true)
      setPreTaskControlsError(null)

      try {
        const controls = await pretaskControlService.fetchPreTaskControls(
          createForm.projectSite,
          createForm.reportDate
        )
        setPreTaskControls(controls)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch PreTask Controls'
        setPreTaskControlsError(errorMessage)
        setPreTaskControls([])
      } finally {
        setPreTaskControlsLoading(false)
      }
    }

    void fetchPreTaskControlData()
  }, [createForm.projectSite, createForm.reportDate])

  const filteredReports = reports.filter((report) => {
    if (filters.projectSite && report.trade !== filters.projectSite) return false
    if (filters.date && report.reportDate !== filters.date) return false
    if (filters.status && report.status !== filters.status) return false
    return true
  })

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage)

  const paginationItems: Array<number | 'ellipsis'> = (() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 'ellipsis', totalPages]
    }

    if (currentPage >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
  })()

  const handleDeleteReport = async () => {
    if (!deleteState.reportId) return
    await deleteReport(deleteState.reportId)
    setDeleteState({ open: false, reportId: '', message: '' })
  }

  const handleCreateReport = () => {
    setCreateModalError(null)
    setCreateForm({ projectSite: '', reportDate: '', status: 'In Progress' })
    setPreTaskControls([])
    setPreTaskControlsError(null)
    setCreateModalOpen(true)
  }

  const handleCreateNewFromModal = async () => {
    if (isCreatingReport) return

    if (!createForm.projectSite.trim()) {
      setCreateModalError('Project site is required.')
      return
    }

    if (!createForm.reportDate) {
      setCreateModalError('Date is required.')
      return
    }

    const resolvedUserId = user?.id ?? 'demo-001'
    const resolvedEmployeeName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.id || 'Unknown'

    try {
      setIsCreatingReport(true)
      setCreateModalError(null)
      const saved = await saveReport({
        userId: resolvedUserId,
        reportDate: createForm.reportDate,
        employeeName: resolvedEmployeeName,
        trade: createForm.projectSite,
        status: createForm.status,
        remarks: '',
      })
      setCreateModalOpen(false)
      navigate(`/daily-reports/${saved.reportId}`)
    } catch (err) {
      setCreateModalError(err instanceof Error ? err.message : 'Failed to create report')
    } finally {
      setIsCreatingReport(false)
    }
  }

  const handleEditReport = (reportId: string) => {
    navigate(`/daily-reports/${reportId}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
       <b> <span className={styles.listPageTitle}>List Of Daily Reports</span></b>

        <div className={styles.filterBar}>
          <label className={styles.filterGroup}>
            <span>Project site</span>
            <select
              className={styles.filterSelect}
              value={filters.projectSite}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, projectSite: e.target.value }))
                setCurrentPage(1)
              }}
            >
              <option value="">Please Select</option>
              {projectNameOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterGroup}>
            <span>Date</span>
            <div className={styles.filterDateWrapper}>
              {!filters.date && (
                <span className={styles.filterDatePlaceholder}>Select Date</span>
              )}
              <input
                type="date"
                className={styles.filterInput}
                data-empty={!filters.date ? 'true' : undefined}
                value={filters.date}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, date: e.target.value }))
                  setCurrentPage(1)
                }}
              />
            </div>
          </label>

          <label className={styles.filterGroup}>
            <span>Status</span>
            <select
              className={styles.filterSelect}
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, status: e.target.value }))
                setCurrentPage(1)
              }}
            >
              <option value="">All</option>
              <option value="In Progress">In Progress</option>
              <option value="Finalized">Finalized</option>
              <option value="Not Started">Not Started</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <button className={styles.btnCreateReport} onClick={handleCreateReport}>
            <span className={styles.createIcon} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.75" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 4.8v6.4M4.8 8h6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            Create Report
          </button>
        </div>

        <div className={styles.listPanel}>
          {loading && <p className={styles.loadingText}>Loading reports...</p>}
          {error && <p className={styles.errorText}>{error}</p>}

          {paginatedReports.length === 0 && !loading && (
            <p className={styles.noDataText}>No reports found.</p>
          )}

          <div className={styles.reportsList}>
            {paginatedReports.map((report) => {
              const createdDisplay = formatDisplayDate(report.createdAt) ?? 'N/A'
              const updatedDisplay = formatDisplayDate(report.updatedAt) ?? 'N/A'

              return (
                <div key={report.reportId} className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitleRow}>
                        <h3 className={styles.reportTitle}>{report.trade || report.employeeName || 'Unnamed Report'}</h3>
                        <span className={`${styles.statusBadge} ${report.status === 'Finalized' ? styles.statusFinalized : styles.statusInProgress}`}>
                          {report.status || 'In Progress'}
                        </span>
                      </div>
                      <p className={styles.reportMeta}>
                        Created on {createdDisplay} | Last updated {updatedDisplay}
                      </p>
                      <p className={styles.reportSubmitted}>
                        Submitted by {report.employeeName || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className={styles.reportActions}>
                    <button
                      className={styles.btnIcon}
                      onClick={() => handleEditReport(report.reportId)}
                      title="Edit"
                      aria-label="Edit"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1a.5.5 0 0 1-.707 0L12.354 2.2l1-1a.5.5 0 0 1 .707 0l1.44 1.44z" />
                        <path d="M11.854 2.7 2.5 12.05V14h1.95l9.354-9.354-1.95-1.95z" />
                      </svg>
                    </button>
                    <button
                      className={`${styles.btnIcon} ${styles.btnDelete}`}
                      onClick={() => setDeleteState({
                        open: true,
                        reportId: report.reportId,
                        message: `Delete report ${report.reportId}?`,
                      })}
                      title="Delete"
                      aria-label="Delete"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z" />
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredReports.length > 0 && (
            <div className={styles.paginationBar}>
              <p className={styles.paginationInfo}>
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredReports.length)} of{' '}
                {filteredReports.length}
              </p>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageArrow}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    {'<'}
                  </button>

                  {paginationItems.map((item, index) =>
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className={styles.pageEllipsis}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        className={`${styles.pageButton} ${currentPage === item ? styles.pageButtonActive : ''}`}
                        onClick={() => setCurrentPage(item)}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    className={styles.pageArrow}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    {'>'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteState.open}
        message={deleteState.message}
        onClose={() => setDeleteState((prev) => ({ ...prev, open: false }))}
        onConfirm={handleDeleteReport}
        isSubmitting={loading}
        errorMessage={error}
      />

      <Modal
        isOpen={createModalOpen}
        title="Create Report"
        onClose={() => setCreateModalOpen(false)}
        onSubmit={() => void handleCreateNewFromModal()}
        submitText="Create New"
        cancelText="Cancel"
        isSubmitting={isCreatingReport}
        errorMessage={createModalError}
        width="md"
      >
        <div className={styles.createReportForm}>
          <label className={styles.createField}>
            <span>Project site</span>
            <div className={styles.dateInputWrapper}>
              {!createForm.projectSite && (
                <span className={styles.datePlaceholder}>Please Select</span>
              )}
              <select
                className={`${styles.select} ${styles.selectInput}`}
                value={createForm.projectSite}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, projectSite: e.target.value }))}
              >
                <option value=""></option>
                {projectNameOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className={styles.createField}>
            <span>Date</span>
            <div className={styles.dateInputWrapper}>
              {!createForm.reportDate && (
                <span className={styles.datePlaceholder}>Select Date</span>
              )}
              <input
                type="date"
                className={`${styles.input} ${styles.dateInput}`}
                data-empty={!createForm.reportDate ? 'true' : undefined}
                value={createForm.reportDate}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, reportDate: e.target.value }))}
              />
            </div>
          </label>

          <div className={styles.createInfoNote}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{flexShrink: 0}}>
              <circle cx="12" cy="12" r="10" stroke="#3a86b4" strokeWidth="2" fill="#EAF4FB"/>
              <line x1="12" y1="11" x2="12" y2="17" stroke="#3a86b4" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="7.5" r="1" fill="#3a86b4"/>
            </svg>
            <span>The report pulls data only from PTPs in Submitted or Closed status.</span>
          </div>
          {/* PreTaskPlanControl data display */}
          {(createForm.projectSite.trim() && createForm.reportDate) && (
            <PreTaskControlsList
              controls={preTaskControls}
              isLoading={preTaskControlsLoading}
              error={preTaskControlsError}
            />
          )}        </div>
      </Modal>
    </div>
  )
}

export default DailyReportsList

