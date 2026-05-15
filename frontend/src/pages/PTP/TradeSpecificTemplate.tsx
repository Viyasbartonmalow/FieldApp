import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ptpWorkflowService from '@/services/ptpWorkflow.service'
import styles from './TradeSpecificTemplate.module.css'

/* ---- Data: all checkbox items extracted from Figma node 4582-20547 ---- */

const criticalPermits = [
  'Traffic',
  'Confined Space',
  'Hot Work',
  'Ground Disturbance (over 12")',
  'Pressure Testing',
  'Guard Rail Removal',
  'Excavation',
  'Energy Isolation/LOTO',
  'ICRA',
]

const requiredChecklists = [
  'Backfill Checklist',
  'Demo Checklist',
  'Exploratory Zone Checklist',
  'Utility Installation Checklist',
  'Cranes Checklist',
  'Pressure Testing Checklist',
  'Hydro Checklist',
  'Excavation Zone Checklist',
]

const ppeCategories = [
  {
    label: 'Head Protection',
    items: ['Hard Hat', 'Ear Plugs/Muffs'],
  },
  {
    label: 'Eye Protection',
    items: ['Safety Glasses', 'Face Shield', 'Chemical Goggles'],
  },
  {
    label: 'Hand Protection',
    items: [
      'Cut Resistant Gloves',
      'Welder Gloves',
      'Nitrile Gloves',
      'Electrical Insulated',
      'Rubber Gloves',
      'Cut Resistant Arm Sleeves',
    ],
  },
  {
    label: 'Respiratory Protection',
    items: [
      'Dust Mask',
      'Air Purifying Resp.',
      'Supplied Air Resp.',
      'SCBA',
      'Emerg Escape Resp.',
      'Proper Safety Vest (for Task)',
    ],
  },
  {
    label: 'Foot Protection',
    items: [
      'Sturdy Work Boots',
      'Safety Toe Boots',
      'Rubber Boots',
      'Dielectric Footwear',
    ],
  },
  {
    label: 'Special Clothing',
    items: ['Coveralls', 'Tyvek Disposable Suits', 'Shoe Coverings', 'Rain Suit'],
  },
]

/* ---- Inline Figma-matched SVG icons ---- */

/** Licence icon (Critical Activity Permits header) */
const LicenceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="12" height="12" rx="2" stroke="#00263A" strokeWidth="1.2" fill="none"/>
    <path d="M4 5h6M4 7h4" stroke="#00263A" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

/** To Do / Checklist icon (Required Checklists header) */
const ChecklistIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3.5h10M2 7h7M2 10.5h5" stroke="#00263A" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="11" cy="10" r="2" stroke="#00263A" strokeWidth="1" fill="none"/>
    <path d="M10 10l.7.7 1.3-1.3" stroke="#00263A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/** Worker / PPE icon (Required PPE header) */
const PPEIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="4" r="2.5" stroke="#00263A" strokeWidth="1.2" fill="none"/>
    <path d="M2 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#00263A" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <path d="M4 8l1 2M10 8l-1 2" stroke="#00263A" strokeWidth="1" strokeLinecap="round"/>
  </svg>
)

/** Prev arrow icon */
const PrevIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ---- Checkbox component ---- */
interface CheckboxItemProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked, onChange }) => (
  <label className={styles['checkbox-item']}>
    <span className={`${styles['checkbox-box']} ${checked ? styles['checkbox-box--checked'] : ''}`}>
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={styles['checkbox-native']}
    />
    <span className={styles['checkbox-label']}>{label}</span>
  </label>
)

/* ---- Section card header ---- */
interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => (
  <div className={styles['section-header']}>
    <div className={styles['section-header-row']}>
      <span className={styles['section-icon-box']}>{icon}</span>
      <span className={styles['section-header-title']}>{title}</span>
    </div>
    <div className={styles['section-divider']} />
  </div>
)

/* ---- Checkbox grid ---- */
const CheckboxGrid: React.FC<{
  items: string[]
  checked: Record<string, boolean>
  onChange: (key: string, val: boolean) => void
}> = ({ items, checked, onChange }) => (
  <div className={styles['checkbox-grid']}>
    {items.map((item) => (
      <CheckboxItem
        key={item}
        label={item}
        checked={!!checked[item]}
        onChange={(val) => onChange(item, val)}
      />
    ))}
  </div>
)

/* ---- Main page ---- */
const TradeSpecificTemplatePage: React.FC = () => {
  const navigate = useNavigate()

  /* Permits */
  const [permits, setPermits] = useState<Record<string, boolean>>({})
  /* Checklists */
  const [checklists, setChecklists] = useState<Record<string, boolean>>({})
  /* PPE */
  const [ppeChecked, setPPEChecked] = useState<Record<string, boolean>>({})

  const handlePermitChange = (key: string, val: boolean) =>
    setPermits((prev) => ({ ...prev, [key]: val }))

  const handleChecklistChange = (key: string, val: boolean) =>
    setChecklists((prev) => ({ ...prev, [key]: val }))

  const handlePPEChange = (key: string, val: boolean) =>
    setPPEChecked((prev) => ({ ...prev, [key]: val }))

  const buildRequirementsPayload = () => ({
    permitsToggle: true,
    checklistsToggle: true,
    ppeToggle: true,
    permits,
    checklists,
    ppeItems: ppeChecked,
  })

  const handleSaveFinal = async () => {
    try {
      const created = await ptpWorkflowService.createWorkflow({
        ptpType: 'trade_specific',
        title: 'Trade Specific Template',
        ptpDate: new Date().toISOString().slice(0, 10),
        status: 'reviewed',
        initialData: {
          requirements: buildRequirementsPayload(),
        },
      })

      navigate(`/ptp/workflow?ptpId=${created.ptp_id}&ptpType=trade_specific`)
    } catch {
      navigate('/ptp/workflow?ptpType=trade_specific')
    }
  }

  const handleSaveDraft = async () => {
    try {
      const created = await ptpWorkflowService.createWorkflow({
        ptpType: 'trade_specific',
        title: 'Trade Specific Template',
        ptpDate: new Date().toISOString().slice(0, 10),
        status: 'draft',
        initialData: {
          requirements: buildRequirementsPayload(),
        },
      })

      navigate(`/ptp/workflow?ptpId=${created.ptp_id}&ptpType=trade_specific`)
    } catch {
      navigate('/ptp/workflow?ptpType=trade_specific')
    }
  }

  return (
    <div className={styles['page']}>
      {/* Page title bar — Figma: Frame 427319074 (#00263A bg, white text) */}
      <div className={styles['page-title-bar']}>
        <h1 className={styles['page-title']}>Create Trade Specific Custom Template</h1>
      </div>

      {/* Content area */}
      <div className={styles['content']}>

        {/* ── Requirements panel — Figma: Frame 427319082 ── */}
        <div className={styles['panel']}>

          {/* Requirements section label (navy bg stripe) */}
          <div className={styles['panel-header']}>
            <span className={styles['panel-header-title']}>Requirements</span>
          </div>

          {/* ── Inner card 1: Critical Activity Permits ── */}
          <div className={styles['inner-card']}>
            <SectionHeader icon={<LicenceIcon />} title="Critical Activity Permits" />
            <CheckboxGrid
              items={criticalPermits}
              checked={permits}
              onChange={handlePermitChange}
            />
          </div>

          {/* ── Inner card 2: Required Checklists ── */}
          <div className={styles['inner-card']} style={{ marginTop: 12 }}>
            <SectionHeader icon={<ChecklistIcon />} title="Required Checklists" />
            <CheckboxGrid
              items={requiredChecklists}
              checked={checklists}
              onChange={handleChecklistChange}
            />
          </div>
        </div>

        {/* ── Required PPE panel — Figma: Frame 427319078 (690×459) ── */}
        <div className={styles['panel']} style={{ marginTop: 16 }}>

          {/* PPE section header */}
          <div className={styles['inner-card']}>
            <SectionHeader icon={<PPEIcon />} title="Required PPE" />

            {ppeCategories.map((cat) => (
              <div key={cat.label} className={styles['ppe-category']}>
                {/* Category label — Figma: fill_794JHE = rgba(214,230,243,0.5), URW DIN Bold 7px */}
                <div className={styles['ppe-category-label']}>
                  {cat.label}
                </div>
                <CheckboxGrid
                  items={cat.items}
                  checked={ppeChecked}
                  onChange={handlePPEChange}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Navigation buttons — Figma: Group 427319089 + Group 427319317 ── */}
        <div className={styles['nav-row']}>
          {/* Prev — Figma: outline button with icon left */}
          <button
            type="button"
            className={styles['btn-prev']}
            onClick={() => navigate(-1)}
          >
            <PrevIcon />
            Prev
          </button>

          <div className={styles['nav-right']}>
            {/* Save as Draft — Figma: white bg, #344054 border/text, radius 8px */}
            <button
              type="button"
              className={styles['btn-draft']}
              onClick={handleSaveDraft}
            >
              Save as Draft
            </button>

            {/* Save as Final — Figma: #34C759 bg, white text, radius 8px */}
            <button
              type="button"
              className={styles['btn-final']}
              onClick={handleSaveFinal}
            >
              Save as Final
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TradeSpecificTemplatePage
