import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ActivityControls.module.css'

/* ============================================================
   Figma Node: 4582-22257 "Frame 1618868614"
   Screen: Activity & Control Measures
   Section: Trade Specific Custom Template Creation (step 2)
   ============================================================ */

/* ---- Activity data extracted from Figma layers ---- */

interface ActivitySection {
  id: string
  title: string
  icon: React.ReactNode
  items: string[]
  hasDistanceInput?: boolean
}

/* SVG icon helpers — orange box icons from Figma (fill_WDI17V = #E35205 bg, 13×15 container) */

const OverheadUtilitiesIcon = () => (
  <img
    src="/images/overhead-utilities-icon.svg"
    alt="Overhead Utilities"
    className={styles['activity-icon-image']}
  />
)

const CraneIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M1 8V3L5 1l3 2v5" stroke="#FFFFFF" strokeWidth="1" fill="none"/>
    <rect x="3" y="5" width="3" height="3" stroke="#FFFFFF" strokeWidth="1" fill="none"/>
  </svg>
)

const ExcavationIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M1 5l2-4 2 4H1z" stroke="#FFFFFF" strokeWidth="1" fill="none"/>
    <rect x="5" y="3" width="3" height="6" rx="1" stroke="#FFFFFF" strokeWidth="1" fill="none"/>
  </svg>
)

const ElectricalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M6 1L3 6h3L4 9" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const UndergroundIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
    <rect x="1" y="1" width="8" height="6" rx="1" stroke="#FFFFFF" strokeWidth="1" fill="none"/>
    <path d="M3 7v4M7 7v4M1 10h8" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round"/>
  </svg>
)

const activities: ActivitySection[] = [
  {
    id: 'overhead-utilities',
    title: 'Overhead Utilities',
    icon: <OverheadUtilitiesIcon />,
    items: [
      'Power De-energization Required',
      'Insulation Blankets Required',
      'Fire Watcher Required',
      'Safe Work Zone Marked',
    ],
    hasDistanceInput: true,
  },
  {
    id: 'crane-lifting',
    title: 'Crane or Other Lifting Equip.',
    icon: <CraneIcon />,
    items: [
      'Signalman Assigned',
      'Worker Protected/Overhead Load',
      'Lifting Equip. Inspected',
      'Area Around Crane Barricaded',
      'Tag Line in Use',
    ],
  },
  {
    id: 'excavations',
    title: 'Excavations',
    icon: <ExcavationIcon />,
    items: [
      'Proper Sloping/Shoring',
      'Access/Ingress Provided',
      'Protected from water',
      'Inspected Prior to Entering',
      'Barricades Provided',
    ],
  },
  {
    id: 'electrical',
    title: 'Electrical',
    icon: <ElectricalIcon />,
    items: [
      'Lock Out/Tag Out/Try Out',
      'Reviewed Elect. Safety Procedures',
      'Confirm Equip. De-Energized',
      'Existing Cords protected',
    ],
  },
  {
    id: 'underground-utilities',
    title: 'Underground Utilities [CAP]',
    icon: <UndergroundIcon />,
    items: [
      'Safe Work Zone Marked',
      'Received Ground Disturbance Permit',
      'Subsurface Survey',
      'Reviewed As-Built',
      'Owner Utilities Marked',
    ],
    hasDistanceInput: true,
  },
]

/* ---- Custom checkbox ---- */
const CheckboxItem: React.FC<{
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}> = ({ label, checked, onChange }) => (
  <label className={styles['cb-item']}>
    <span className={`${styles['cb-box']} ${checked ? styles['cb-box--on'] : ''}`}>
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
    <input
      type="checkbox"
      className={styles['cb-native']}
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    <span className={styles['cb-label']}>{label}</span>
  </label>
)

/* ---- Edit Modal ---- */
interface EditModalProps {
  activityTitle: string
  modalItems: Array<{ label: string; checked: boolean }>
  onToggle: (idx: number) => void
  onSave: () => void
  onClose: () => void
}

const EditModal: React.FC<EditModalProps> = ({
  activityTitle, modalItems, onToggle, onSave, onClose,
}) => (
  <div className={styles['modal-overlay']} onClick={onClose}>
    <div className={styles['modal']} onClick={e => e.stopPropagation()}>
      {/* Modal header — Figma: fill_07J42F = #00263A bg, white text, style_W7916N: Industry Black 800 15px */}
      <div className={styles['modal-header']}>
        <span className={styles['modal-title']}>Edit Activity &amp; Control Measures</span>
        <button className={styles['modal-close']} onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Modal body */}
      <div className={styles['modal-body']}>
        {/* Highlighted item row — fill_794JHE = rgba(214,230,243,0.5) */}
        <div className={styles['modal-item-header']}>
          <span className={styles['modal-item-label']}>{activityTitle}</span>
        </div>

        <div className={styles['modal-items']}>
          {modalItems.map((item, i) => (
            <CheckboxItem
              key={item.label}
              label={item.label}
              checked={item.checked}
              onChange={() => onToggle(i)}
            />
          ))}
        </div>
      </div>

      {/* Save button — Figma: fill_07J42F = #00263A bg, white text, radius 4px */}
      <div className={styles['modal-footer']}>
        <button className={styles['modal-save-btn']} onClick={onSave}>Save</button>
      </div>
    </div>
  </div>
)

/* ---- Distance input field ---- */
const DistanceInput: React.FC<{
  value: string
  onChange: (v: string) => void
}> = ({ value, onChange }) => (
  <div className={styles['distance-row']}>
    <span className={styles['distance-label']}>Reqd.</span>
    <input
      type="text"
      className={styles['distance-input']}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="0"
      maxLength={6}
    />
    <span className={styles['distance-unit']}>ft</span>
  </div>
)

/* ---- Activity Card — Figma: white card, radius 10px, shadow, left orange border when active ---- */
interface ActivityCardProps {
  section: ActivitySection
  checked: Record<string, boolean>
  distance: string
  onCheckChange: (key: string, val: boolean) => void
  onDistanceChange: (val: string) => void
  onEdit: () => void
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  section, checked, distance, onCheckChange, onDistanceChange, onEdit,
}) => (
  <div className={styles['activity-card']}>
    {/* Card header row — orange icon box + title */}
    <div className={styles['activity-card-header']}>
      <div className={styles['activity-icon-wrap']}>{section.icon}</div>
      <span className={styles['activity-title']}>{section.title}</span>
    </div>

    {/* Separator */}
    <div className={styles['activity-divider']} />

    {/* Checkbox items — Figma: row layout, 4 per row, gap 7px, style_XOHV6G 9px */}
    <div className={styles['activity-checks']}>
      {section.items.map(item => (
        <CheckboxItem
          key={item}
          label={item}
          checked={!!checked[item]}
          onChange={val => onCheckChange(item, val)}
        />
      ))}
    </div>

    {/* Distance input (for Overhead + Underground Utilities) */}
    {section.hasDistanceInput && (
      <DistanceInput value={distance} onChange={onDistanceChange} />
    )}

    {/* Edit icon — top right (Figma: IMAGE-SVG ellipsis/edit icon at right) */}
    <button
      className={styles['activity-edit-btn']}
      onClick={onEdit}
      aria-label={`Edit ${section.title}`}
      title="Edit"
    >
      ···
    </button>
  </div>
)

/* ============================================================
   Main Page Component
   ============================================================ */

const ActivityControlsPage: React.FC = () => {
  const navigate = useNavigate()

  /* Checkbox state per activity */
  const [allChecked, setAllChecked] = useState<Record<string, Record<string, boolean>>>(
    Object.fromEntries(activities.map(a => [a.id, {}]))
  )

  /* Distance inputs */
  const [distances, setDistances] = useState<Record<string, string>>(
    Object.fromEntries(activities.filter(a => a.hasDistanceInput).map(a => [a.id, '']))
  )

  /* Modal state */
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalChecked, setModalChecked] = useState<Array<{ label: string; checked: boolean }>>([])

  const openEdit = (section: ActivitySection) => {
    setEditingId(section.id)
    setModalChecked(
      section.items.map(label => ({ label, checked: !!allChecked[section.id]?.[label] }))
    )
  }

  const closeModal = () => setEditingId(null)

  const saveModal = () => {
    if (!editingId) return
    const updates: Record<string, boolean> = {}
    modalChecked.forEach(({ label, checked }) => { updates[label] = checked })
    setAllChecked(prev => ({ ...prev, [editingId]: { ...prev[editingId], ...updates } }))
    closeModal()
  }

  const editingSection = editingId ? activities.find(a => a.id === editingId) : null

  return (
    <div className={styles['page']}>

      {/* Page title bar — Figma: Frame 427319074, #FFFFFF bg */}
      <div className={styles['page-title-bar']}>
        <h1 className={styles['page-title']}>Create Trade Specific Custom Template</h1>
      </div>

      {/* Main panel — Figma: Frame 427319082, bg #F8FBFD, radius 10px, shadow */}
      <div className={styles['panel']}>

        {/* Panel heading — style_3MVRJ7: Industry Demi 600 15px, #00263A */}
        <div className={styles['panel-heading']}>
          <span className={styles['panel-heading-text']}>Activity &amp; Control Measures</span>
        </div>

        {/* Scrollable activity cards grid */}
        <div className={styles['cards-container']}>
          {activities.map(section => (
            <ActivityCard
              key={section.id}
              section={section}
              checked={allChecked[section.id] ?? {}}
              distance={distances[section.id] ?? ''}
              onCheckChange={(key, val) =>
                setAllChecked(prev => ({
                  ...prev,
                  [section.id]: { ...prev[section.id], [key]: val },
                }))
              }
              onDistanceChange={val =>
                setDistances(prev => ({ ...prev, [section.id]: val }))
              }
              onEdit={() => openEdit(section)}
            />
          ))}
        </div>

        {/* Next button — Figma: Group 427319077, "Next" with right arrow icon */}
        <div className={styles['nav-row']}>
          <button
            type="button"
            className={styles['btn-next']}
            onClick={() => navigate('/ptp/create/trade-specific/review')}
          >
            Next
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Edit Modal — Figma: Frame 427319112, modal overlay rgba(41,41,58,0.23) ── */}
      {editingSection && (
        <EditModal
          activityTitle={editingSection.title}
          modalItems={modalChecked}
          onToggle={i =>
            setModalChecked(prev =>
              prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item)
            )
          }
          onSave={saveModal}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default ActivityControlsPage
