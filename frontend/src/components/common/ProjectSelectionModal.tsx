import React, { useEffect, useState } from 'react'
import projectAppsyncService from '@/services/projectAppsync.service'
import './ProjectSelectionModal.css'

interface ProjectSelectionModalProps {
  onClose: () => void
  onSelect: (projectNames: string[]) => void
  currentSelections?: string[]
}

const MAX_SELECTIONS = 4

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({ onClose, onSelect, currentSelections = [] }) => {
  const [projects, setProjects] = useState<string[]>([])
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAll, setFilterAll] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 7
  const filteredProjects = projects.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Initialize selected projects from parent state when modal opens
  useEffect(() => {
    setSelectedProjects(new Set(currentSelections.slice(0, MAX_SELECTIONS)))
  }, [currentSelections])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const projectList = await projectAppsyncService.listProjectNames()
        setProjects(projectList)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleCheckboxChange = (projectName: string) => {
    if (selectedProjects.has(projectName)) {
      const newSelected = new Set(selectedProjects)
      newSelected.delete(projectName)
      setSelectedProjects(newSelected)
    } else {
      if (selectedProjects.size >= MAX_SELECTIONS) {
        return
      }
      const newSelected = new Set(selectedProjects)
      newSelected.add(projectName)
      setSelectedProjects(newSelected)
    }
  }

  const handleSave = () => {
    if (selectedProjects.size > 0) {
      onSelect(Array.from(selectedProjects))
      onClose()
    }
  }

  const selectionLimitReached = selectedProjects.size >= MAX_SELECTIONS

  const renderPageButtons = () => {
    const buttons = []
    const maxButtons = 5

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i)
      }
    } else {
      buttons.push(1)
      if (currentPage > 3) buttons.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!buttons.includes(i)) buttons.push(i)
      }
      if (currentPage < totalPages - 2) buttons.push('...')
      buttons.push(totalPages)
    }

    return buttons
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-selection-modal" onClick={e => e.stopPropagation()}>
        <div className="psm-header">
          <h2>Add Project Site to Favorites</h2>
          <button className="psm-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="psm-content">
          <div className="psm-section-title">Project Sites</div>

          {/* Search and filter row */}
          <div className="psm-search-filter-row">
            <div className="psm-search-box">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="psm-search-icon">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search Project Site"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="psm-search-input"
              />
            </div>
            <div className="psm-filter-select-wrapper">
              <select value={filterAll} onChange={e => setFilterAll(e.target.value)} className="psm-filter-select">
                <option>All</option>
                <option>Development</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="psm-filter-chevron">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Projects list */}
          <div className="psm-projects-list">
            {loading ? (
              <div className="psm-loading">Loading projects...</div>
            ) : error ? (
              <div className="psm-error">{error}</div>
            ) : paginatedProjects.length === 0 ? (
              <div className="psm-empty">No projects found</div>
            ) : (
              paginatedProjects.map(project => (
                <label
                  key={project}
                  className={`psm-project-item ${!selectedProjects.has(project) && selectionLimitReached ? 'psm-project-item--disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProjects.has(project)}
                    onChange={() => handleCheckboxChange(project)}
                    className="psm-checkbox"
                    disabled={!selectedProjects.has(project) && selectionLimitReached}
                  />
                  <span className="psm-project-name">{project}</span>
                  {selectedProjects.has(project) && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="psm-checkmark">
                      <circle cx="8" cy="8" r="7" stroke="#22C55E" strokeWidth="1.2" fill="none"/>
                      <path d="M4 8l3 3 5-5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </label>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredProjects.length > 0 && (
            <div className="psm-pagination">
              <button
                className="psm-page-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                &lt;
              </button>
              {renderPageButtons().map((btn, idx) => (
                <button
                  key={idx}
                  className={`psm-page-btn ${btn === currentPage ? 'psm-page-btn--active' : ''} ${btn === '...' ? 'psm-page-btn--ellipsis' : ''}`}
                  onClick={() => typeof btn === 'number' && setCurrentPage(btn)}
                  disabled={btn === '...'}
                >
                  {btn}
                </button>
              ))}
              <button
                className="psm-page-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        <div className="psm-footer">
          <button className="psm-btn psm-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="psm-btn psm-btn--save"
            onClick={handleSave}
            disabled={selectedProjects.size === 0}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectSelectionModal
