import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ptpWorkflowService from '@/services/ptpWorkflow.service'
import styles from './PreviousDayPTP.module.css'

interface PreviousPTP {
  id: string
  date: string
  trades: string[]
  activities: string[]
  controls: string[]
  requirements: string[]
  status: 'draft' | 'submitted' | 'approved'
  createdBy: string
}

const PreviousDayTPPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedPTP, setSelectedPTP] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [previousDayPTPs, setPreviousDayPTPs] = useState<PreviousPTP[]>([])

  // Previous day date reference
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDate = yesterday.toISOString().split('T')[0]

  useEffect(() => {
    const loadPreviousDayPTPs = async () => {
      try {
        const rows = await ptpWorkflowService.listWorkflows({ ptpType: 'previous_day', limit: 25 })

        setPreviousDayPTPs(
          rows.map((row) => {
            const activityPayload = (row.activity_controls_json ?? {}) as any
            const reqPayload = (row.requirements_json ?? {}) as any

            return {
              id: row.ptp_id,
              date: row.ptp_date || yesterdayDate,
              trades: row.trade ? [row.trade] : ['General'],
              activities: Object.keys(activityPayload.toggles ?? {}).filter((k) => activityPayload.toggles[k]),
              controls: Object.keys(activityPayload.items ?? {}).filter((k) => activityPayload.items[k]),
              requirements: Object.keys(reqPayload.permits ?? {}).filter((k) => reqPayload.permits[k]),
              status: row.status === 'approved' || row.status === 'submitted' ? (row.status as any) : 'draft',
              createdBy: row.created_by || 'Unknown',
            }
          })
        )
      } catch {
        setPreviousDayPTPs([])
      }
    }

    loadPreviousDayPTPs()
  }, [yesterdayDate])

  const selectedPTPData = previousDayPTPs.find((p) => p.id === selectedPTP)

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'approved':
        return styles.badgeApproved
      case 'submitted':
        return styles.badgeSubmitted
      default:
        return styles.badgeDraft
    }
  }

  const handleUsePTP = async () => {
    if (selectedPTP) {
      try {
        const created = await ptpWorkflowService.createWorkflow({
          ptpType: 'previous_day',
          sourcePtpId: selectedPTP,
          title: `Previous Day PTP ${new Date().toLocaleDateString()}`,
          ptpDate: new Date().toISOString().slice(0, 10),
          status: 'draft',
        })

        navigate(`/ptp/workflow?ptpId=${created.ptp_id}&ptpType=previous_day&sourcePtpId=${selectedPTP}`)
      } catch {
        navigate('/ptp/workflow')
      }
    }
  }

  return (
    <div className={styles.container}>
      {/* Title Bar */}
      <div className={styles.titleBar}>
        <h1 className={styles.title}>Create PTP from Previous Day</h1>
        <p className={styles.subtitle}>
          Quick access to {yesterday.toLocaleDateString()} PTPs — modify and reuse
        </p>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* PTP Selection Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Yesterday's PTPs</h2>
            <span className={styles.count}>({previousDayPTPs.length})</span>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.ptpGrid}>
              {previousDayPTPs.map((ptp) => (
                <div
                  key={ptp.id}
                  className={`${styles.ptpCard} ${selectedPTP === ptp.id ? styles.selected : ''}`}
                  onClick={() => {
                    setSelectedPTP(ptp.id)
                    setShowDetails(true)
                  }}
                >
                  <div className={styles.ptpCardHeader}>
                    <h3 className={styles.ptpCardTitle}>{ptp.trades.join(', ')}</h3>
                    <input
                      type="radio"
                      name="ptp-selection"
                      checked={selectedPTP === ptp.id}
                      onChange={() => setSelectedPTP(ptp.id)}
                      className={styles.radioInput}
                    />
                  </div>
                  <span className={`${styles.badge} ${getStatusBadgeClass(ptp.status)}`}>
                    {ptp.status.charAt(0).toUpperCase() + ptp.status.slice(1)}
                  </span>
                  <div className={styles.ptpCardMeta}>
                    <span>Activities: {ptp.activities.length}</span>
                    <span>Controls: {ptp.controls.length}</span>
                  </div>
                </div>
              ))}
              {previousDayPTPs.length === 0 && (
                <p style={{ margin: 0, color: '#6C7278' }}>
                  No previous-day PTP records found.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details Panel — Shows when selected */}
        {showDetails && selectedPTPData && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>PTP Details</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowDetails(false)}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>
            <div className={styles.panelBody}>
              {/* Trades Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Trades</h3>
                <div className={styles.tagGroup}>
                  {selectedPTPData.trades.map((trade, idx) => (
                    <span key={idx} className={styles.tagBold}>
                      {trade}
                    </span>
                  ))}
                </div>
              </div>

              {/* Activities Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Activities</h3>
                <div className={styles.checklistGroup}>
                  {selectedPTPData.activities.map((activity, idx) => (
                    <div key={idx} className={styles.checklistItem}>
                      <input type="checkbox" checked disabled readOnly />
                      <label>{activity}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Control Measures Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Control Measures</h3>
                <div className={styles.checklistGroup}>
                  {selectedPTPData.controls.map((control, idx) => (
                    <div key={idx} className={styles.checklistItem}>
                      <input type="checkbox" checked disabled readOnly />
                      <label>{control}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Requirements</h3>
                <div className={styles.checklistGroup}>
                  {selectedPTPData.requirements.map((req, idx) => (
                    <div key={idx} className={styles.checklistItem}>
                      <input type="checkbox" checked disabled readOnly />
                      <label>{req}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Created By */}
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Created by:</span>
                <span className={styles.metaValue}>{selectedPTPData.createdBy}</span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>How This Works</h2>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.infoBox}>
              <p>
                <strong>Select yesterday's PTP</strong> to quickly create today's PTP using the same activities,
                controls, and requirements.
              </p>
              <p>
                All data will be copied to your new PTP, and you can make any necessary modifications
                in the next steps before submission.
              </p>
              <p>
                This is the fastest way to create consistent daily PTPs with minimal changes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.navButtons}>
        <button className={styles.btnSecondary} onClick={() => navigate('/ptp')}>
          ← Back to PTPs
        </button>
        <button
          className={styles.btnPrimary}
          onClick={handleUsePTP}
          disabled={!selectedPTP}
        >
          Use This PTP →
        </button>
      </div>
    </div>
  )
}

export default PreviousDayTPPage
