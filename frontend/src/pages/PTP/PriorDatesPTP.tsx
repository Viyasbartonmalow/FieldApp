import React, { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import ptpWorkflowService from '@/services/ptpWorkflow.service'
import styles from "./PriorDatesPTP.module.css"

interface PTPTask { label: string; description: string; toolsEquipment: string; exposures?: string; controlMeasures?: string; competentInitials?: string }
interface ActivityControl { category: string; items: string[] }
interface CriticalPermit { name: string; checked: boolean }
interface PriorPTP { id: string; name: string; createdBy: string; company: string; lastUpdated: string; tasks: PTPTask[]; activityControls?: ActivityControl[]; permits?: CriticalPermit[] }

// WorkflowStep type removed (unused)


function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

const PriorDatesPTPPage: React.FC = () => {
  const navigate = useNavigate()
  const today = new Date()

  const [calYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [calOpen, setCalOpen] = useState(false)
  const [search, setSearch] = useState<string>("")
  const [selectedId, setSelectedId] = useState<string>("")
  const [viewPTP, setViewPTP] = useState<PriorPTP | null>(null)
  const [priorPtps, setPriorPtps] = useState<PriorPTP[]>([])

  useEffect(() => {
    const loadPriorDatePtps = async () => {
      try {
        const rows = await ptpWorkflowService.listWorkflows({ limit: 100 })

        const mapped: PriorPTP[] = rows.map((row) => {
          const tasksPayload = (row.tasks_json ?? {}) as any
          const activityPayload = (row.activity_controls_json ?? {}) as any
          const requirementsPayload = (row.requirements_json ?? {}) as any

          return {
            id: row.ptp_id,
            name: row.title || 'Pre-Task Plan',
            createdBy: row.created_by || 'Unknown',
            company: '',
            lastUpdated: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '',
            tasks: Array.isArray(tasksPayload.tasks)
              ? tasksPayload.tasks.map((t: any, idx: number) => ({
                  label: t.name || `Task ${idx + 1}`,
                  description: t.description || '',
                  toolsEquipment: Array.isArray(t.toolsEquipment) ? t.toolsEquipment.join(', ') : '',
                  exposures: t.activityExposures,
                  controlMeasures: t.controlMeasures,
                  competentInitials: t.competentInitials,
                }))
              : [],
            activityControls: Object.keys(activityPayload.toggles ?? {}).length
              ? [
                  {
                    category: 'Activity Controls',
                    items: Object.keys(activityPayload.toggles).filter((key) => activityPayload.toggles[key]),
                  },
                ]
              : undefined,
            permits: Object.keys(requirementsPayload.permits ?? {}).map((name) => ({
              name,
              checked: !!requirementsPayload.permits[name],
            })),
          }
        })

        setPriorPtps(mapped)
      } catch {
        setPriorPtps([])
      }
    }

    loadPriorDatePtps()
  }, [])

  const filtered = useMemo(() => {
    return priorPtps.filter(p =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.createdBy.toLowerCase().includes(search.toLowerCase())
    )
  }, [priorPtps, search])

  const ViewPTPModal = ({ ptp }: { ptp: PriorPTP }) => (
    <div className={styles.modalOverlay} onClick={() => setViewPTP(null)}>
      <div className={styles.viewModal} onClick={e => e.stopPropagation()}>
        <div className={styles.viewModalHeader}>
          <span className={styles.viewModalTitle}>View of PTP</span>
          <button className={styles.viewModalClose} onClick={() => setViewPTP(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className={styles.viewModalBody}>
          {/* Task Section */}
          {ptp.tasks.map((task, i) => (
            <div key={i} className={styles.viewSection}>
              <div className={styles.viewTaskCard}>
                <p className={styles.viewTaskLabel}>{task.label}</p>
                <p className={styles.viewTaskDesc}>{task.description}</p>
                {task.toolsEquipment && (
                  <>
                    <p className={styles.viewFieldLabel}>Tools &amp; Equipment</p>
                    <p className={styles.viewFieldValue}>{task.toolsEquipment}</p>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Activity & Control Measures Section */}
          {ptp.activityControls && (
            <div className={styles.viewSection}>
              <h3 className={styles.viewSectionTitle}>Activity &amp; Control Measures</h3>
              {ptp.activityControls.map((control, i) => (
                <div key={i} className={styles.viewActivityCard}>
                  <div className={styles.viewActivityHeader}>
                    <div className={styles.viewActivityDot} />
                    <span className={styles.viewActivityCategory}>{control.category}</span>
                  </div>
                  <div className={styles.viewCheckGrid}>
                    {control.items.map((item, j) => (
                      <div key={j} className={styles.viewCheckRow}>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Requirements Section */}
          {ptp.permits && (
            <div className={styles.viewSection}>
              <h3 className={styles.viewSectionTitle}>Requirements</h3>
              
              {/* Critical Activity Permits */}
              <div className={styles.viewActivityCard}>
                <div className={styles.viewActivityHeader}>
                  <div className={styles.viewActivityDot} />
                  <span className={styles.viewActivityCategory}>Critical Activity Permits</span>
                </div>
                <div className={styles.viewCheckGrid}>
                  {ptp.permits.map((permit, j) => (
                    <label key={j} className={styles.viewCheckRow}>
                      <input type="checkbox" checked={permit.checked} readOnly disabled />
                      <span>{permit.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
        <div className={styles.viewModalFooter}>
          <button className={styles.btnOutlined} onClick={() => setViewPTP(null)}>Close</button>
          <button
            className={styles.btnPrimary}
            onClick={async () => {
              if (!ptp.id) return
              setViewPTP(null)

              try {
                const created = await ptpWorkflowService.createWorkflow({
                  ptpType: 'prior_dates',
                  sourcePtpId: ptp.id,
                  title: `${ptp.name} Copy`,
                  ptpDate: new Date().toISOString().slice(0, 10),
                  status: 'draft',
                })
                navigate(`/ptp/workflow?ptpId=${created.ptp_id}&ptpType=prior_dates&sourcePtpId=${ptp.id}`)
              } catch {
                navigate('/ptp/workflow?ptpType=prior_dates')
              }
            }}
          >
            Create PTP Workflow →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <p className={styles.stepText}>Step 2 of 7</p>
        <h2 className={styles.stepTitle}>Select PTP</h2>
      </div>

      <div className={styles.stepSection}>
        {/* ── Inline Date Picker ── */}
        <div className={styles.inlineDateRow}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.inlineDateIcon}>
            <rect x="1" y="2" width="14" height="13" rx="2" stroke="#6C7278" strokeWidth="1.3" fill="none"/>
            <path d="M1 6h14" stroke="#6C7278" strokeWidth="1.3"/>
            <path d="M5 1v2M11 1v2" stroke="#6C7278" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <button className={styles.inlineDateBtn} onClick={() => setCalOpen(o => !o)}>
            {selectedDate
              ? (() => { const [y,m,d] = selectedDate.split("-"); return `${d}/${m}/${y}` })()
              : "Select date"}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginLeft:4}}>
              <path d={calOpen ? "M1 7l4-4 4 4" : "M1 3l4 4 4-4"} stroke="#6C7278" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>

          {calOpen && (
            <div className={styles.miniCalDrop}>
              <div className={styles.miniCalHeader}>
                <button onClick={() => setCalMonth(calMonth === 0 ? 11 : calMonth - 1)}>‹</button>
                <span>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][calMonth]} {calYear}</span>
                <button onClick={() => setCalMonth(calMonth === 11 ? 0 : calMonth + 1)}>›</button>
              </div>
              <div className={styles.miniCalGrid}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className={styles.miniCalDayHdr}>{d}</div>)}
                {buildCalendarDays(calYear, calMonth).map((day, i) => {
                  const dateStr = day ? `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : ""
                  return (
                    <button
                      key={i}
                      className={`${styles.miniCalDay} ${!day ? styles.miniCalDayEmpty : ""} ${selectedDate === dateStr ? styles.miniCalDaySelected : ""}`}
                      onClick={() => { if (day) { setSelectedDate(dateStr); setCalOpen(false) } }}
                      disabled={!day}
                    >{day}</button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.4"/>
            <path d="M11 11l3 3" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input className={styles.searchInput} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* PTP List */}
        <div className={styles.ptpList}>
          {filtered.map(ptp => {
            const selected = selectedId === ptp.id
            return (
              <div key={ptp.id} className={`${styles.ptpRow} ${selected ? styles.ptpRowSelected : ""}`} onClick={() => setSelectedId(selected ? "" : ptp.id)}>
                <div className={styles.ptpRowLeft}>
                  <div className={styles.ptpNameRow}>
                    <span className={styles.ptpName}>{ptp.name}</span>
                    <button className={styles.eyeBtn} title="View PTP" onClick={e => { e.stopPropagation(); setViewPTP(ptp) }}>
                      <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                        <path d="M1 6.5C1 6.5 3.909 1 9 1s8 5.5 8 5.5-2.909 5.5-8 5.5S1 6.5 1 6.5z" stroke="#4D81E7" strokeWidth="1.4" fill="none"/>
                        <circle cx="9" cy="6.5" r="2.2" stroke="#4D81E7" strokeWidth="1.4" fill="none"/>
                      </svg>
                    </button>
                  </div>
                  <p className={styles.ptpMeta}>Created by <strong>{ptp.createdBy}</strong>{ptp.company ? <> - {ptp.company}</> : null}</p>
                </div>
                <div className={`${styles.radioCircle} ${selected ? styles.radioCircleSelected : ""}`}>
                  {selected && <div className={styles.radioDot} />}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p style={{ margin: 0, color: '#6C7278' }}>
              No prior-date PTP records found.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={styles.stepFooter}>
          <button className={styles.btnOutlined} onClick={() => navigate("/ptp")}>← Back</button>
          <button
            className={`${styles.btnPrimary} ${!selectedId ? styles.btnDisabled : ""}`}
            disabled={!selectedId}
            onClick={() => {
              const selectedPTP = priorPtps.find(p => p.id === selectedId)
              if (selectedPTP) setViewPTP(selectedPTP)
            }}
          >Create PTP Workflow →</button>
        </div>
      </div>

      {viewPTP && <ViewPTPModal ptp={viewPTP} />}
    </div>
  )
}

export default PriorDatesPTPPage

