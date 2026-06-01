import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDailyReports } from '@/features/dailyReports/hooks/useDailyReports'
import DeleteConfirmModal from '@/features/dailyReports/components/DeleteConfirmModal'
import Modal from '@/components/common/Modal'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ptpWorkflowService from '@/services/ptpWorkflow.service'
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
    status: 'In Progress',
  })

  const [deleteState, setDeleteState] = useState<{ open: boolean; reportId: string; message: string }>({
    open: false,
    reportId: '',
    message: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createModalError, setCreateModalError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<CreateReportFormState>({
    projectSite: '',
    reportDate: '',
    status: 'In Progress',
  })
  const [ptpNameOptions, setPtpNameOptions] = useState<string[]>([])
  const itemsPerPage = 6

  useEffect(() => {
    void loadReports()
  }, [loadReports])

  useEffect(() => {
    const loadPtpNames = async () => {
      try {
        const workflows = await ptpWorkflowService.listWorkflows({ limit: 200 })
        const names = workflows
          .flatMap((item) => {
            const directTitle = item.title?.trim() ?? ''
            const taskPayload = (item.tasks_json ?? {}) as { ptpName?: unknown }
            const ptpNameFromTask = typeof taskPayload.ptpName === 'string' ? taskPayload.ptpName.trim() : ''
            return [directTitle, ptpNameFromTask]
          })
          .filter((value): value is string => Boolean(value))
        setPtpNameOptions(Array.from(new Set(names)))
      } catch {
        setPtpNameOptions([])
      }
    }

    void loadPtpNames()
  }, [])

  const projectSiteOptions = Array.from(
    new Set(
      reports
        .map((report) => report.trade)
        .filter((value): value is string => Boolean(value && value.trim()))
    )
  )

  const createProjectSiteOptions = Array.from(
    new Set([...ptpNameOptions, ...projectSiteOptions])
  )

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
    setCreateModalOpen(true)
  }

  const handleCreateNewFromModal = async () => {
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
    }
  }

  const handleEditReport = (reportId: string) => {
    navigate(`/daily-reports/${reportId}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        <h2 className={styles.sectionTitle}>List Of Daily Report</h2>

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
              {projectSiteOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterGroup}>
            <span>Date</span>
            <input
              type="date"
              className={styles.filterInput}
              value={filters.date}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, date: e.target.value }))
                setCurrentPage(1)
              }}
            />
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
              <option value="In Progress">In progress</option>
              <option value="Finalized">Finalized</option>
              <option value="Not Started">Not Started</option>
              <option value="Completed">Completed</option>
              <option value="">All</option>
            </select>
          </label>

          <button className={styles.btnCreateReport} onClick={handleCreateReport}>
            ⊕ Create Report
          </button>
        </div>

        {loading && <p className={styles.loadingText}>Loading reports...</p>}
        {error && <p className={styles.errorText}>{error}</p>}

        {paginatedReports.length === 0 && !loading && (
          <p className={styles.noDataText}>No reports found.</p>
        )}

        <div className={styles.reportsList}>
          {paginatedReports.map((report) => {
            const createdDisplay =
              formatDisplayDate(report.createdAt) ?? formatDisplayDate(report.reportDate) ?? 'N/A'
            const updatedDisplay =
              formatDisplayDate(report.updatedAt) ??
              formatDisplayDate(report.createdAt) ??
              formatDisplayDate(report.reportDate) ??
              'N/A'

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
        isSubmitting={loading}
        errorMessage={createModalError}
        width="md"
      >
        <div className={styles.createReportForm}>
          <label className={styles.createField}>
            <span>Project site</span>
            <select
              className={styles.select}
              value={createForm.projectSite}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, projectSite: e.target.value }))}
            >
              <option value="">Please Select</option>
              {createProjectSiteOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.createField}>
            <span>Date</span>
            <input
              type="date"
              className={styles.input}
              value={createForm.reportDate}
              placeholder="Select Date"
              onChange={(e) => setCreateForm((prev) => ({ ...prev, reportDate: e.target.value }))}
            />
          </label>

          <div className={styles.createInfoNote}>
            <span className={styles.createInfoIcon}>ⓘ</span>
            <span>The report pulls data only from PTPs in Submitted or Closed status.</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DailyReportsList
