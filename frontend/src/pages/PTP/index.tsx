import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { RootState } from '@/store'
import { fetchPTPsStart, fetchPTPsSuccess, setFilters } from '@/store/ptpSlice'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import CreatePTPModal from '@/components/common/CreatePTPModal'
import './PTP.css'

const PTPListPage: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: ptps, isLoading, filters } = useSelector((state: RootState) => state.ptp)
  const [statusFilter, setStatusFilter] = useState<string>(filters.status || '')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    // Fetch PTPs on mount
    dispatch(fetchPTPsStart())
    // Simulate API call
    setTimeout(() => {
      dispatch(fetchPTPsSuccess({ items: [], pagination: { page: 1, limit: 10, total: 0 } }))
    }, 500)
  }, [dispatch, filters])

  const handleFilterChange = (status: string) => {
    setStatusFilter(status)
    dispatch(setFilters({ status: status || undefined }))
  }

  return (
    <div className="ptp-list-page">
      <div className="ptp-header">
        <h1>Pre-Task Plans (PTPs)</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => navigate('/ptp/create/trade-specific')}
          >
            + Trade Specific Template
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>Create New PTP</Button>
        </div>
      </div>

      <Card>
        <div className="ptp-filters">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select value={statusFilter} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="loading">Loading PTPs...</p>
        ) : ptps.length === 0 ? (
          <div className="no-data">
            <p>No PTPs found</p>
            <Button onClick={() => setShowCreateModal(true)}>Create your first PTP</Button>
          </div>
        ) : (
          <div className="ptp-grid">
            {ptps.map((ptp) => (
              <div key={ptp.id} className="ptp-card">
                <div className="ptp-card-header">
                  <h3>{ptp.title}</h3>
                  <span className={`badge badge-${ptp.status}`}>{ptp.status}</span>
                </div>
                <p className="ptp-card-description">{ptp.description}</p>
                <div className="ptp-card-meta">
                  <span>Project: {ptp.projectId}</span>
                  <span>{new Date(ptp.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="ptp-card-actions">
                  <Link to={`/ptp/${ptp.id}`} className="action-link">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showCreateModal && (
        <CreatePTPModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

export default PTPListPage
