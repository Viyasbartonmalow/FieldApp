import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ptpWorkflowService, { PtpWorkflowStepKey } from '@/services/ptpWorkflow.service'
import ptpTemplateDataStoreService from '@/services/ptpTemplateDataStore.service'
import ProjectSelectionModal from '@/components/common/ProjectSelectionModal'
import useRole from '@/hooks/useRole'
import styles from './PTPWorkflow.module.css'

/* ════════════════════════════════════════════
   TYPES
════════════════════════════════════════════ */
interface Task {
  id: string
  name: string
  description: string
  toolsEquipment: string[]
  onsiteEquipment?: string[]
  activityExposures: string
  controlMeasures: string
  competentInitials: string
  expanded: boolean
}

interface CrewMember {
  id: string
  name: string
  username: string
  initials: string
  avatarColor: string
  signedIn: boolean
  comment: string
  time: string
  signatureData?: string
}

interface ShiftReview {
  toolsCleaned: boolean
  permitsClosed: boolean
  anyIncidents: boolean
  incidentReported: boolean
  incidentDescription: string
}

/* ════════════════════════════════════════════
   STEPS
════════════════════════════════════════════ */
type Step = 'tasks' | 'activity-controls' | 'requirements' | 'emergency-contacts' | 'crew-signin' | 'ptp-review' | 'ptp-day-closure'

const STEPS: { key: Step; line1: string; line2?: string }[] = [
  { key: 'activity-controls', line1: 'Activity & Control', line2: 'Measures' },
  { key: 'requirements',     line1: 'Permits &', line2: 'ChecklLists' },
  { key: 'tasks',            line1: 'Work Steps' },
  { key: 'emergency-contacts', line1: 'Emergency', line2: 'Contacts' },
  { key: 'crew-signin',      line1: 'Crew Sign In' },
  { key: 'ptp-review',       line1: 'PTP Review' },
  { key: 'ptp-day-closure',  line1: 'PTP Day', line2: 'Closure' },
]

/* ════════════════════════════════════════════
  STATIC OPTIONS
════════════════════════════════════════════ */
const TOOLS_POWER_BASE_OPTIONS = ['Band Saw', 'Makita Multi Cutter', 'Angle Grinder', 'Cut Off Saw', 'Beveling Tool', 'Circular Saw']
const TOOLS_POWER_OTHERS_OPTION = 'Others'
const ONSITE_EQUIPMENT_BASE_OPTIONS = ['Bulldozer', 'Pallet jack', 'Skid steer', 'Street sweeper', 'Forklift', 'Telehandler', 'Portable lights', 'Water truck', 'Mini excavator']
const ONSITE_EQUIPMENT_OTHERS_OPTION = 'Others'
const HAZARD_EXPOSURE_OPTIONS = [
  {
    id: 'adjacent-work-others',
    chipLabel: 'Others above/below',
    fullLabel: 'Others above/below (Adjacent Work Processes)',
  },
  {
    id: 'asbestos-lead-paint-controls',
    chipLabel: 'Lead Paint Controls in Place',
    fullLabel: 'Lead Paint Controls in Place (Asbestos or Lead Paint Potential (CAP))',
  },
]

const PERMITS = ['Confined Space', 'Hot Work', 'Ground Disturbance (over 12")', 'Pressure Testing', 'Traffic', 'Guard Rail Removal', 'Excavation', 'Energy Isolation/LOTO', 'ICRA']
const CHECKLISTS = ['Backfill Checklist', 'Demo Checklist', 'Exploratory Zone Checklist', 'Utility Installation Checklist', 'Cranes Checklist', 'Hydro Checklist', 'Pressure Testing Checklist', 'Excavation Zone Checklist']

interface ActivityCategory { key: string; name: string; items: string[]; hasDistanceField?: boolean }
interface PpeCategory { name: string; items: string[] }
const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { key: 'adjacent-work', name: 'Adjacent Work Processes', items: ['Coordinated with Adjacent Employers', 'Need Barriers Between', 'Notified Them of our Presence', 'Others above/below'] },
  { key: 'asbestos', name: 'Asbestos or Lead Paint Potential (CAP)', items: ['Area Contains Asbestos or Lead', 'Asbestos Controls in Place', 'Exposure Monitoring Req.', 'Lead Paint Controls in Place'] },
  { key: 'barricades', name: 'Barricades/Covers', items: ['Caution Barricade Tape Req.', 'Danger Barricade Tape Req. with Signage', 'Rigid Railing Req.', 'Secured Covers over Opening', 'Warning Signs Req.'] },
  { key: 'crane-lifting', name: 'Crane or Other Lifting Equip. (CAP)', items: ['Area Around Crane Barricaded', 'Lifting Equip. Inspected', 'Signalman Assigned', 'Tag Line in Use', 'Worker Protected/Overhead Load'] },
  { key: 'electrical', name: 'Electrical (CAP)', items: ['Confirm Equip. De-Energized', 'Existing Cords Protected', 'GCFI in Use', 'Lock Out/Tag Out/Try Out', 'Protected from Water', 'Reviewed Elect. Safety Procedures'] },
  { key: 'environmental', name: 'Environmental', items: ['Air Emissions', 'Hazardous Waste', 'Other', 'Pollution Prevention', 'Waste Minimization', 'Water Discharge'] },
  { key: 'excavations', name: 'Excavations', items: ['Access/Ingress Provided', 'Barricades Provided', 'Inspected Prior to Entering', 'Proper Sloping/Shoring'] },
  { key: 'fire-hazard', name: 'Fire Hazard (CAP)', items: ['Adjacent Area Protected', 'Fire Extinguishers', 'Fire Watch', 'Flammable/Combustible Material Removed', 'Hot Work Permit'] },
  { key: 'hand-power-tools', name: 'Hand & Power Tools', items: ['GCFI Used', 'Guarding OK', 'Identified PPE', 'Inspect General Condition', 'Reviewed Owner Manual Safety Req.'] },
  { key: 'hand-hazards', name: 'Hand Hazards', items: ['PPE - Proper Gloves, etc.', 'Protected Sharp Edges'] },
  { key: 'heat-stress', name: 'Heat Stress Potential', items: ['Cool Down Periods', 'Head Stress Monitoring > 85', 'Liquids Available', 'Reviewed Heat Symptoms', 'Sunscreen'] },
  { key: 'housekeeping', name: 'Housekeeping', items: ['Trash Properly Disposed of at Regular Intervals', 'Work Area Swept with Sweeping Compound'] },
  { key: 'ladders', name: 'Ladders', items: ['Inspect General Condition Prior', 'Ladder Inspected within Last Quarter', 'Ladder Tied Off or Held', 'Proper Angle and Placement', 'Reviewed Ladder Safety'] },
  { key: 'manual-lifting', name: 'Manual Lifting', items: ['Back Support Assistance', 'Hand Protection Required', 'Reviewed Equip. for Proper Lifting', 'Reviewed Proper Lifting Technique'] },
  { key: 'natural-hazards', name: 'Natural or Site Hazards', items: ['Animals/Reptiles/Insects', 'Biological Hazard', 'Terrain', 'Weather'] },
  { key: 'noise', name: 'Noise > 85db', items: ['Both Ear Plugs & Ear Muffs', 'Ear Muffs', 'Ear Plugs', 'Hearing Protection Required'] },
  { key: 'overhead-utilities', name: 'Overhead Utilities', items: ['Fire Watcher Required', 'Insulation Blankets Required', 'Power De-energization Required', 'Safe Work Zone Marked'], hasDistanceField: true },
  { key: 'pinch-points', name: 'Pinch Points', items: ['Hand/Body Positioning - Manual Material Handling', 'Working Near Operating Equip.'] },
  { key: 'slips-trips', name: 'Slips, Trips, & Falls', items: ['Clear Paths of Egress', 'Extension Cords Properly Stored', 'Hazards Marked', 'Inspect for Trip Hazards', 'Tools & Material Properly Stored', 'Work Zone Debris Free'] },
  { key: 'underground-utilities', name: 'Underground Utilities (CAP)', items: ['Owner Utilities Marked', 'Received Ground Disturbance Permit', 'Reviewed As-Built', 'Safe Work Zone Marked', 'Subsurface survey'], hasDistanceField: true },
  { key: 'vehicular-traffic', name: 'Vehicular Traffic Deliveries (CAP)', items: ['Communication w/ Operator', 'Cones', 'Lane Closure', 'Sign', 'Traffic Barricades', 'Trained Flagging Personnel or Protected Spotters'] },
  { key: 'working-chemicals', name: 'Working with Chemicals', items: ['Exposure Monitoring Req.', 'Have Proper Containers w/ Labels', 'Identified Proper PPE', 'Reviewed & Made SDS\' Readily Available'] },
]

const PPE_CATEGORIES: PpeCategory[] = [
  { name: 'Hand Protection', items: ['Cut Resistant Gloves', 'Welder Gloves', 'Nitrile Gloves', 'Rubber Gloves', 'Elect. Insulated Glov', 'Cut-Resistant Arm Sleeves'] },
  { name: 'Head Protection', items: ['Hard Hat', 'Ear Plugs / Muffs'] },
  { name: 'Foot Protection', items: ['Sturdy Work Boots', 'Safety Toe Boot', 'Rubber Boots', 'Dielectric Footwear'] },
  { name: 'Respiratory Protection', items: ['Dust Mask', 'Air Purifying Resp.', 'Supplied Air Resp.', 'SCBA', 'Emerg. Escape'] },
  { name: 'Fall Protection System', items: ['Harness', 'Needed (i.e. Cross arm strap, etc .)', 'Double Lanyard Required', 'Fall Clearance Distance Adequate', 'Anchorage Point Avail.', 'Additional Anchorage Connection'] },
  { name: 'Eye Protection', items: ['Safety Glasses', 'Face Shield', 'Chemical Goggles', 'Welding Hood'] },
  { name: 'Special Clothing', items: ['Coveralls', 'Tyvek Disposable Suits', 'Proper Safety Vest (for Task)', 'Rain Suit', 'Shoe Coverings'] },
]

const INITIAL_TASKS: Task[] = []

const INITIAL_CREW: CrewMember[] = []

/* ════════════════════════════════════════════
   PTP PROJECT DROPDOWN SUB-COMPONENT
════════════════════════════════════════════ */
const PTPProjectDropdown: React.FC<{
  value: string
  selectedChoices: string[]
  onChooseProject: (name: string) => void
  onOpenModal: () => void
  hasError?: boolean
}> = ({ value, selectedChoices, onChooseProject, onOpenModal, hasError = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={styles.ptpProjectDropdown}>
      <button
        className={`${styles.ptpProjectBtn} ${hasError ? styles.inputError : ''}`}
        onClick={() => setIsOpen(o => !o)}
        type="button"
        aria-haspopup="listbox"
      >
        <span className={styles.ptpProjectValue}>{value || 'Select Project'}</span>
        {hasError && (
          <svg className={styles.inputErrorIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="#F43F5E" strokeWidth="1.4"/>
            <path d="M8 4.6v4.2" stroke="#F43F5E" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11.6" r="0.9" fill="#F43F5E"/>
          </svg>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className={styles.ptpProjectMenu}>
          {selectedChoices.map(p => (
            <button
              key={p}
              className={`${styles.ptpProjectMenuChoice} ${p === value ? styles.ptpProjectMenuChoiceActive : ''}`}
              onClick={() => { onChooseProject(p); setIsOpen(false) }}
              type="button"
            >{p}</button>
          ))}
          <div className={styles.ptpProjectMenuDivider} />
          <button
            className={styles.ptpProjectMenuItem}
            onClick={() => { setIsOpen(false); onOpenModal() }}
            type="button"
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

/* ════════════════════════════════════════════
   SIGNATURE PAD SUB-COMPONENT
════════════════════════════════════════════ */
interface SigPadProps {
  personName: string
  companyName?: string
  date?: string
  variant?: 'default' | 'signin'
  initialSignature?: string
  onSignatureChange?: (dataUrl: string) => void
  hasError?: boolean
  errorText?: string
}
const SigPad: React.FC<SigPadProps> = ({
  personName,
  companyName = 'Partners Excavating',
  date = '12/11/2025',
  variant = 'default',
  initialSignature,
  onSignatureChange,
  hasError = false,
  errorText = 'Signature is required',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const didDrawRef = useRef(false)
  const [drawing, setDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(Boolean(initialSignature))

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY }
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY }
  }

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setDrawing(true)
    didDrawRef.current = false
    const ctx = canvas.getContext('2d')
    if (ctx) { const { x, y } = getPos(e, canvas); ctx.beginPath(); ctx.moveTo(x, y) }
  }
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const { x, y } = getPos(e, canvas)
      ctx.lineTo(x, y)
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.stroke()
      didDrawRef.current = true
    }
  }
  const stop = () => {
    setDrawing(false)
    if (!didDrawRef.current) return
    setHasSignature(true)
    const canvas = canvasRef.current
    if (!canvas || !onSignatureChange) return
    onSignatureChange(canvas.toDataURL('image/png'))
  }
  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    didDrawRef.current = false
    setHasSignature(false)
    onSignatureChange?.('')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!initialSignature) {
      setHasSignature(false)
      return
    }
    setHasSignature(true)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = initialSignature
  }, [initialSignature])

  const canvasWidth = variant === 'signin' ? 520 : 360
  const canvasHeight = variant === 'signin' ? 170 : 80

  return (
    <div className={`${styles.sigRow} ${variant === 'signin' ? styles.sigRowSignIn : ''}`}>
      <div className={styles.sigPadCol}>
        <div className={`${styles.sigPadWrap} ${variant === 'signin' ? styles.sigPadWrapSignIn : ''} ${hasError ? styles.sigPadWrapError : ''}`}>
          <button className={styles.sigClearBtn} onClick={clear} title="Refresh signature" type="button" aria-label="Refresh signature">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
            </svg>
          </button>
          {!hasSignature && <span className={styles.sigPlaceholder}>Sign here..</span>}
          <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className={`${styles.sigCanvas} ${variant === 'signin' ? styles.sigCanvasSignIn : ''}`}
            onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
            onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} />
          <div className={styles.sigLine} />
        </div>
        {hasError && <p className={styles.sigInlineError}>{errorText}</p>}
      </div>
      <div className={`${styles.sigInfo} ${variant === 'signin' ? styles.sigInfoSignIn : ''}`}>
        <p className={styles.sigInfoLabel}>Company Name</p>
        <p className={styles.sigInfoValue}>{companyName}</p>
        <div className={styles.sigInfoRow}>
          <div><p className={styles.sigInfoLabel}>Name</p><p className={styles.sigInfoValue}>{personName}</p></div>
          <div><p className={styles.sigInfoLabel}>Date</p><p className={styles.sigInfoValue}>{date}</p></div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const PTPWorkflowPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedStep = searchParams.get('step')
  const fromClock = searchParams.get('fromClock') === '1'
  const initialStep: Step = requestedStep && STEPS.some(s => s.key === requestedStep)
    ? (requestedStep as Step)
    : 'activity-controls'
  const user = useSelector((state: RootState) => state.auth.user)
  const { isSuperintendent } = useRole()
  const reviewPersonName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Viyas Jayarajan'
  const reviewCompanyName = user?.company || 'STG India'
  const reviewDate = new Date().toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const [ptpId, setPtpId] = useState<string | null>(searchParams.get('ptpId'))
  const initialPtpIdRef = useRef<string | null>(searchParams.get('ptpId'))
  const pendingCreatedPtpIdRef = useRef<string | null>(searchParams.get('ptpId'))
  const isEditMode = Boolean(initialPtpIdRef.current)
  const [isSaving, setIsSaving] = useState(false)
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false)
  const [showTaskDeleteConfirmModal, setShowTaskDeleteConfirmModal] = useState(false)
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState<Step>(initialStep)
  const stepIdx = STEPS.findIndex(s => s.key === currentStep)

  /* ── Step 1: Tasks ── */
  const [project, setProject]   = useState('')
  const [ptpName, setPtpName]   = useState('')
  const [projectError, setProjectError] = useState(false)
  const [ptpNameError, setPtpNameError] = useState(false)
  const [ptpNameErrorMessage, setPtpNameErrorMessage] = useState('')
  const [requiredToast, setRequiredToast] = useState<string | null>(null)
  const [tasks, setTasks]       = useState<Task[]>(INITIAL_TASKS)
  const [showAddTask, setShowAddTask] = useState(false)
  const [addTaskErrors, setAddTaskErrors] = useState({ workSteps: false, controls: false })
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTaskErrors, setEditTaskErrors] = useState({ workSteps: false, controls: false })
  const [editTask, setEditTask] = useState({
    workSteps: '',
    hazards: [] as string[],
    hazardsOpen: false,
    toolsPowerTools: [] as string[],
    toolsPowerOpen: false,
    customToolInput: '',
    customTools: [] as string[],
    onsiteEquipment: [] as string[],
    onsiteEquipmentOpen: false,
    customOnsiteEquipmentInput: '',
    customOnsiteEquipment: [] as string[],
    controls: '',
    initials: '',
  })
  const [newTask, setNewTask]   = useState({
    workSteps: '',
    hazards: [] as string[],
    hazardsOpen: false,
    toolsPowerTools: [] as string[],
    toolsPowerOpen: false,
    customToolInput: '',
    customTools: [] as string[],
    onsiteEquipment: [] as string[],
    onsiteEquipmentOpen: false,
    customOnsiteEquipmentInput: '',
    customOnsiteEquipment: [] as string[],
    controls: '',
    initials: '',
  })

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, expanded: !t.expanded } : t))
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id))
  const requestDeleteTask = (id: string) => {
    setPendingDeleteTaskId(id)
    setShowTaskDeleteConfirmModal(true)
  }
  const cancelDeleteTaskConfirm = () => {
    setPendingDeleteTaskId(null)
    setShowTaskDeleteConfirmModal(false)
  }
  const confirmDeleteTask = () => {
    if (pendingDeleteTaskId) deleteTask(pendingDeleteTaskId)
    setPendingDeleteTaskId(null)
    setShowTaskDeleteConfirmModal(false)
  }
  const addTask = () => {
    const wErr = !newTask.workSteps.trim()
    const cErr = !newTask.controls.trim()
    if (wErr || cErr) {
      setAddTaskErrors({ workSteps: wErr, controls: cErr })
      return
    }
    setAddTaskErrors({ workSteps: false, controls: false })
    const n = tasks.length + 1
    setTasks(prev => [...prev, {
      id: `t${Date.now()}`, name: `Work Step ${n}`, description: newTask.workSteps.trim(),
      toolsEquipment: newTask.toolsPowerTools.filter(tool => tool !== TOOLS_POWER_OTHERS_OPTION),
      onsiteEquipment: newTask.onsiteEquipment.filter(item => item !== ONSITE_EQUIPMENT_OTHERS_OPTION),
      activityExposures: newTask.hazards.join(', '),
      controlMeasures: newTask.controls, competentInitials: newTask.initials, expanded: false,
    }])
    setNewTask({
      workSteps: '',
      hazards: [],
      hazardsOpen: false,
      toolsPowerTools: [],
      toolsPowerOpen: false,
      customToolInput: '',
      customTools: [],
      onsiteEquipment: [],
      onsiteEquipmentOpen: false,
      customOnsiteEquipmentInput: '',
      customOnsiteEquipment: [],
      controls: '',
      initials: '',
    })
    setRequiredToast(null)
    setAddTaskErrors({ workSteps: false, controls: false })
    setShowAddTask(false)
  }

  const startEditTask = (task: Task) => {
    const customTools = (task.toolsEquipment || []).filter(t => !TOOLS_POWER_BASE_OPTIONS.includes(t))
    const customOnsite = (task.onsiteEquipment || []).filter(i => !ONSITE_EQUIPMENT_BASE_OPTIONS.includes(i))
    const hazardIds = task.activityExposures
      ? task.activityExposures.split(', ').filter(h => HAZARD_EXPOSURE_OPTIONS.some(o => o.id === h))
      : []
    setEditTask({
      workSteps: task.description,
      hazards: hazardIds,
      hazardsOpen: false,
      toolsPowerTools: task.toolsEquipment || [],
      toolsPowerOpen: false,
      customToolInput: '',
      customTools,
      onsiteEquipment: task.onsiteEquipment || [],
      onsiteEquipmentOpen: false,
      customOnsiteEquipmentInput: '',
      customOnsiteEquipment: customOnsite,
      controls: task.controlMeasures,
      initials: task.competentInitials,
    })
    setEditingTaskId(task.id)
  }

  const saveEditTask = () => {
    const wErr = !editTask.workSteps.trim()
    const cErr = !editTask.controls.trim()
    if (wErr || cErr || !editingTaskId) {
      setEditTaskErrors({ workSteps: wErr, controls: cErr })
      return
    }
    setEditTaskErrors({ workSteps: false, controls: false })
    setTasks(prev => prev.map(t => t.id === editingTaskId ? {
      ...t,
      description: editTask.workSteps.trim(),
      toolsEquipment: editTask.toolsPowerTools.filter(tool => tool !== TOOLS_POWER_OTHERS_OPTION),
      onsiteEquipment: editTask.onsiteEquipment.filter(item => item !== ONSITE_EQUIPMENT_OTHERS_OPTION),
      activityExposures: editTask.hazards.join(', '),
      controlMeasures: editTask.controls,
      competentInitials: editTask.initials,
    } : t))
    setEditingTaskId(null)
  }

  const toggleHazardSelection = (hazardId: string) => {
    setNewTask(prev => ({
      ...prev,
      hazards: prev.hazards.includes(hazardId)
        ? prev.hazards.filter(id => id !== hazardId)
        : [...prev.hazards, hazardId],
    }))
  }

  const removeHazardSelection = (hazardId: string) => {
    setNewTask(prev => ({ ...prev, hazards: prev.hazards.filter(id => id !== hazardId) }))
  }

  const togglePowerToolSelection = (tool: string) => {
    setNewTask(prev => {
      const selected = prev.toolsPowerTools.includes(tool)
      const nextSelection = selected
        ? prev.toolsPowerTools.filter(item => item !== tool)
        : [...prev.toolsPowerTools, tool]

      return {
        ...prev,
        toolsPowerTools: nextSelection,
        customToolInput: tool === TOOLS_POWER_OTHERS_OPTION && selected ? '' : prev.customToolInput,
      }
    })
  }

  const addCustomPowerTool = () => {
    const value = newTask.customToolInput.trim()
    if (!value) return

    setNewTask(prev => {
      const exists = [...TOOLS_POWER_BASE_OPTIONS, ...prev.customTools].some(
        item => item.toLowerCase() === value.toLowerCase()
      )

      const customTools = exists ? prev.customTools : [...prev.customTools, value]
      const toolsPowerTools = prev.toolsPowerTools.includes(value)
        ? prev.toolsPowerTools
        : [...prev.toolsPowerTools, value]

      return {
        ...prev,
        customTools,
        toolsPowerTools,
        customToolInput: '',
      }
    })
  }

  const toggleOnsiteEquipmentSelection = (item: string) => {
    setNewTask(prev => {
      const selected = prev.onsiteEquipment.includes(item)
      const nextSelection = selected
        ? prev.onsiteEquipment.filter(value => value !== item)
        : [...prev.onsiteEquipment, item]

      return {
        ...prev,
        onsiteEquipment: nextSelection,
        customOnsiteEquipmentInput: item === ONSITE_EQUIPMENT_OTHERS_OPTION && selected ? '' : prev.customOnsiteEquipmentInput,
      }
    })
  }

  const addCustomOnsiteEquipment = () => {
    const value = newTask.customOnsiteEquipmentInput.trim()
    if (!value) return

    setNewTask(prev => {
      const exists = [...ONSITE_EQUIPMENT_BASE_OPTIONS, ...prev.customOnsiteEquipment].some(
        item => item.toLowerCase() === value.toLowerCase()
      )

      const customOnsiteEquipment = exists ? prev.customOnsiteEquipment : [...prev.customOnsiteEquipment, value]
      const onsiteEquipment = prev.onsiteEquipment.includes(value)
        ? prev.onsiteEquipment
        : [...prev.onsiteEquipment, value]

      return {
        ...prev,
        customOnsiteEquipment,
        onsiteEquipment,
        customOnsiteEquipmentInput: '',
      }
    })
  }

  /* ── Edit modal toggle handlers ── */
  const toggleEditHazardSelection = (hazardId: string) => {
    setEditTask(prev => ({
      ...prev,
      hazards: prev.hazards.includes(hazardId)
        ? prev.hazards.filter(id => id !== hazardId)
        : [...prev.hazards, hazardId],
    }))
  }

  const removeEditHazardSelection = (hazardId: string) => {
    setEditTask(prev => ({ ...prev, hazards: prev.hazards.filter(id => id !== hazardId) }))
  }

  const toggleEditPowerToolSelection = (tool: string) => {
    setEditTask(prev => {
      const selected = prev.toolsPowerTools.includes(tool)
      const nextSelection = selected
        ? prev.toolsPowerTools.filter(item => item !== tool)
        : [...prev.toolsPowerTools, tool]
      return {
        ...prev,
        toolsPowerTools: nextSelection,
        customToolInput: tool === TOOLS_POWER_OTHERS_OPTION && selected ? '' : prev.customToolInput,
      }
    })
  }

  const addEditCustomPowerTool = () => {
    const value = editTask.customToolInput.trim()
    if (!value) return
    setEditTask(prev => {
      const exists = [...TOOLS_POWER_BASE_OPTIONS, ...prev.customTools].some(
        item => item.toLowerCase() === value.toLowerCase()
      )
      const customTools = exists ? prev.customTools : [...prev.customTools, value]
      const toolsPowerTools = prev.toolsPowerTools.includes(value)
        ? prev.toolsPowerTools
        : [...prev.toolsPowerTools, value]
      return { ...prev, customTools, toolsPowerTools, customToolInput: '' }
    })
  }

  const toggleEditOnsiteEquipmentSelection = (item: string) => {
    setEditTask(prev => {
      const selected = prev.onsiteEquipment.includes(item)
      const nextSelection = selected
        ? prev.onsiteEquipment.filter(v => v !== item)
        : [...prev.onsiteEquipment, item]
      return {
        ...prev,
        onsiteEquipment: nextSelection,
        customOnsiteEquipmentInput: item === ONSITE_EQUIPMENT_OTHERS_OPTION && selected ? '' : prev.customOnsiteEquipmentInput,
      }
    })
  }

  const addEditCustomOnsiteEquipment = () => {
    const value = editTask.customOnsiteEquipmentInput.trim()
    if (!value) return
    setEditTask(prev => {
      const exists = [...ONSITE_EQUIPMENT_BASE_OPTIONS, ...prev.customOnsiteEquipment].some(
        item => item.toLowerCase() === value.toLowerCase()
      )
      const customOnsiteEquipment = exists ? prev.customOnsiteEquipment : [...prev.customOnsiteEquipment, value]
      const onsiteEquipment = prev.onsiteEquipment.includes(value)
        ? prev.onsiteEquipment
        : [...prev.onsiteEquipment, value]
      return { ...prev, customOnsiteEquipment, onsiteEquipment, customOnsiteEquipmentInput: '' }
    })
  }

  /* ── Project dropdown (shared across steps) ── */
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [showProjectModal,  setShowProjectModal]  = useState(false)
  const handleProjectSelectionsSave = (names: string[]) => {
    setSelectedProjects(names)
    if (names.length > 0) {
      setProject(names[0])
      setProjectError(false)
      setRequiredToast(null)
    }
  }
  const handleProjectChange = (name: string) => {
    setProject(name)
    if (name.trim()) {
      setProjectError(false)
      setRequiredToast(null)
    }
  }
  const handlePtpNameChange = (value: string) => {
    setPtpName(value)
    if (value.trim()) {
      setPtpNameError(false)
      setPtpNameErrorMessage('')
      setRequiredToast(null)
    }
  }

  const validateUniquePtpName = async (inputName?: string): Promise<boolean> => {
    const nameToValidate = (inputName ?? ptpName).trim()
    if (!nameToValidate) return true

    try {
      const isDuplicate = await ptpWorkflowService.isTitleDuplicate(nameToValidate, ptpId ?? undefined)
      if (isDuplicate) {
        setPtpNameError(true)
        setPtpNameErrorMessage('PTP Name already exists, please try another name')
        return false
      }

      if (ptpNameErrorMessage === 'PTP Name already exists, please try another name') {
        setPtpNameError(false)
        setPtpNameErrorMessage('')
      }
      return true
    } catch {
      // Keep UX smooth if local store is temporarily unavailable.
      return true
    }
  }

  /* ── Step 2: Activity & Controls ── */
  const [activityToggles, setActivityToggles] = useState<Record<string,boolean>>({})
  const [activityItems,   setActivityItems]   = useState<Record<string,boolean>>({})
  const [activityDist,    setActivityDist]    = useState<Record<string,string>>({})
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES)
  const [showActivityValidationModal, setShowActivityValidationModal] = useState(false)
  const [showActivityToggleConfirmModal, setShowActivityToggleConfirmModal] = useState(false)
  const [pendingActivityToggleKey, setPendingActivityToggleKey] = useState<string | null>(null)

  /* ── Step 3: Requirements ── */
  const [permits,    setPermits]    = useState<Record<string,boolean>>({})
  const [checklists, setChecklists] = useState<Record<string,boolean>>({})
  const [ppeItems,   setPpeItems]   = useState<Record<string,boolean>>({})
  const [permitOptions, setPermitOptions] = useState<string[]>(PERMITS)
  const [checklistOptions, setChecklistOptions] = useState<string[]>(CHECKLISTS)
  const [ppeCategories, setPpeCategories] = useState<PpeCategory[]>(PPE_CATEGORIES)

  /* ── Step 4: Emergency Contacts ── */
  const [emergencyPlanDiscussed, setEmergencyPlanDiscussed] = useState(false)
  const [safetyContact,       setSafetyContact]       = useState('')
  const [superintendentContact, setSuperintendentContact] = useState('')
  const [otherContact,        setOtherContact]        = useState('')
  const [musterArea,          setMusterArea]          = useState('')

  /* ── Step 5: Crew Sign-In ── */
  const [crew, setCrew]          = useState<CrewMember[]>(INITIAL_CREW)
  const [signInModal, setSignInModal] = useState<string|null>(null)
  const [signCommentDraft, setSignCommentDraft] = useState('')
  const [signSignatureDraft, setSignSignatureDraft] = useState('')
  const [signInError, setSignInError] = useState<string | null>(null)
  const [showCrewDeleteConfirmModal, setShowCrewDeleteConfirmModal] = useState(false)
  const [pendingDeleteCrewId, setPendingDeleteCrewId] = useState<string | null>(null)
  const [newMemberName, setNewMemberName] = useState('')
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null)
  const [editingCrewNameDraft, setEditingCrewNameDraft] = useState('')
  const openSignInModal = (memberId: string) => {
    const member = crew.find(m => m.id === memberId)
    setSignCommentDraft(member?.comment ?? '')
    setSignSignatureDraft(member?.signatureData ?? '')
    setSignInError(null)
    setSignInModal(memberId)
  }
  const closeSignInModal = () => {
    setSignInModal(null)
    setSignCommentDraft('')
    setSignSignatureDraft('')
    setSignInError(null)
  }
  const signInMember = () => {
    if (!signInModal) return
    if (!signSignatureDraft.trim()) {
      setSignInError('Please provide your signature before proceeding.')
      return
    }
    const now = new Date()
    const timeStr = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()} ${now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}`
    setCrew(prev => prev.map(m => m.id === signInModal ? {
      ...m,
      signedIn: true,
      comment: signCommentDraft,
      signatureData: signSignatureDraft,
      time: timeStr,
    } : m))
    setRequiredToast(null)
    closeSignInModal()
  }
  const addCrewMember = () => {
    if (!newMemberName.trim()) return
    const parts = newMemberName.trim().split(' ')
    const initials = parts.map(p => p[0]?.toUpperCase() ?? '').join('').slice(0,2)
    const colors = ['#E35205','#4D81E7','#22C55E','#9333EA','#374151']
    setCrew(prev => [...prev, { id: `cm${Date.now()}`, name: newMemberName.trim(), username: `@${parts[0].toLowerCase()}`, initials, avatarColor: colors[prev.length % colors.length], signedIn: false, comment: '', time: '', signatureData: '' }])
    setNewMemberName('')
    setRequiredToast(null)
  }
  const startEditCrewMember = (member: CrewMember) => {
    setEditingCrewId(member.id)
    setEditingCrewNameDraft(member.name)
  }
  const cancelEditCrewMember = () => {
    setEditingCrewId(null)
    setEditingCrewNameDraft('')
  }
  const saveEditCrewMember = () => {
    if (!editingCrewId) return
    const nextName = editingCrewNameDraft.trim()
    if (!nextName) {
      cancelEditCrewMember()
      return
    }
    const parts = nextName.split(/\s+/).filter(Boolean)
    const initials = parts.map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 2)
    setCrew(prev => prev.map(m => m.id === editingCrewId ? {
      ...m,
      name: nextName,
      username: `@${(parts[0] ?? nextName).toLowerCase()}`,
      initials,
    } : m))
    cancelEditCrewMember()
  }
  const requestDeleteCrew = (id: string) => {
    setPendingDeleteCrewId(id)
    setShowCrewDeleteConfirmModal(true)
  }
  const cancelDeleteCrewConfirm = () => {
    setPendingDeleteCrewId(null)
    setShowCrewDeleteConfirmModal(false)
  }
  const confirmDeleteCrew = () => {
    if (pendingDeleteCrewId) removeCrew(pendingDeleteCrewId)
    setPendingDeleteCrewId(null)
    setShowCrewDeleteConfirmModal(false)
  }
  const removeCrew = (id: string) => {
    setCrew(prev => prev.filter(m => m.id !== id))
    if (editingCrewId === id) cancelEditCrewMember()
  }

  /* ── Step 6: PTP Review ── */
  const [foremanComment,    setForemanComment]    = useState('')
  const [supervisorComment, setSupervisorComment] = useState('')
  const [foremanReviewSignature, setForemanReviewSignature] = useState('')
  const [supervisorReviewSignature, setSupervisorReviewSignature] = useState('')
  const [foremanReviewSignatureError, setForemanReviewSignatureError] = useState(false)
  const [ptpReviewSignatureError, setPtpReviewSignatureError] = useState(false)
  const [isPtpReviewSaving, setIsPtpReviewSaving] = useState(false)

  const handlePtpReviewed = async () => {
    // Authorization guard: only superintendents can review.
    if (!isSuperintendent) return
    if (!ptpId || isPtpReviewSaving) return

    if (!supervisorReviewSignature.trim()) {
      setPtpReviewSignatureError(true)
      setRequiredToast('Please provide your signature before proceeding.')
      return
    }

    try {
      setIsPtpReviewSaving(true)
      setPtpReviewSignatureError(false)
      setRequiredToast(null)

      const payload = {
        foremanComment,
        supervisorComment,
        foremanSignature: foremanReviewSignature,
        supervisorSignature: supervisorReviewSignature,
        flaggedForChange: false,
      }

      await ptpWorkflowService.saveStep(ptpId, 'ptp-review', payload, 'reviewed', user?.id)
      navigate('/dashboard', { state: { ptpSuccess: true, ptpMessage: 'PTP reviewed successfully.' } })
    } catch (error) {
      console.error('[PTP Review] Error while marking reviewed:', error)
      setRequiredToast('Error saving ptp review. Please try again.')
    } finally {
      setIsPtpReviewSaving(false)
    }
  }

  /* ── Step 7: PTP Day Closure ── */
  const [signOff, setSignOff] = useState<Record<string,string>>({})
  const [dayClosurePage, setDayClosurePage] = useState(1)
  const [shift, setShift] = useState<ShiftReview>({ toolsCleaned: false, permitsClosed: false, anyIncidents: false, incidentReported: false, incidentDescription: '' })
  const [dayClosureForemanSignature, setDayClosureForemanSignature] = useState('')
  const [showEodValidationModal, setShowEodValidationModal] = useState(false)
  const [showEodSuccessModal, setShowEodSuccessModal] = useState(false)

  useEffect(() => {
    const bootstrap = async () => {
      const resolvedPtpId = searchParams.get('ptpId')

      if (!resolvedPtpId) {
        setPtpId(null)
        pendingCreatedPtpIdRef.current = null
        return
      }

      setPtpId(resolvedPtpId)
      pendingCreatedPtpIdRef.current = resolvedPtpId

      try {
        const existing = await ptpWorkflowService.getWorkflow(resolvedPtpId)

        const taskPayload = (existing.tasks_json ?? {}) as any
        if (Array.isArray(taskPayload.tasks)) setTasks(taskPayload.tasks)
        if (typeof taskPayload.project === 'string') setProject(taskPayload.project)
        if (typeof taskPayload.ptpName === 'string') setPtpName(taskPayload.ptpName)

        const activityPayload = (existing.activity_controls_json ?? {}) as any
        if (activityPayload.toggles) setActivityToggles(activityPayload.toggles)
        if (activityPayload.items) setActivityItems(activityPayload.items)
        if (activityPayload.distances) setActivityDist(activityPayload.distances)

        const reqPayload = (existing.requirements_json ?? {}) as any
        if (reqPayload.permits) setPermits(reqPayload.permits)
        if (reqPayload.checklists) setChecklists(reqPayload.checklists)
        if (reqPayload.ppeItems) setPpeItems(reqPayload.ppeItems)

        const contactsPayload = (existing.emergency_contacts_json ?? {}) as any
        if (typeof contactsPayload.emergencyPlanDiscussed === 'boolean') setEmergencyPlanDiscussed(contactsPayload.emergencyPlanDiscussed)
        if (typeof contactsPayload.safetyContact === 'string') setSafetyContact(contactsPayload.safetyContact)
        if (typeof contactsPayload.superintendentContact === 'string') setSuperintendentContact(contactsPayload.superintendentContact)
        if (typeof contactsPayload.otherContact === 'string') setOtherContact(contactsPayload.otherContact)
        if (typeof contactsPayload.musterArea === 'string') setMusterArea(contactsPayload.musterArea)

        if (Array.isArray(existing.crew_signin_json)) {
          setCrew(existing.crew_signin_json as CrewMember[])
        }

        const reviewPayload = (existing.review_json ?? {}) as any
        if (typeof reviewPayload.foremanComment === 'string') setForemanComment(reviewPayload.foremanComment)
        if (typeof reviewPayload.supervisorComment === 'string') setSupervisorComment(reviewPayload.supervisorComment)
        if (typeof reviewPayload.foremanSignature === 'string') setForemanReviewSignature(reviewPayload.foremanSignature)
        if (typeof reviewPayload.supervisorSignature === 'string') setSupervisorReviewSignature(reviewPayload.supervisorSignature)

        const closurePayload = (existing.day_closure_json ?? {}) as any
        if (closurePayload.signOff) setSignOff(closurePayload.signOff)
        if (closurePayload.shift) setShift(closurePayload.shift)
        if (typeof closurePayload.foremanSignature === 'string') setDayClosureForemanSignature(closurePayload.foremanSignature)
      } catch {
        // Keep default in-memory values when API is unavailable.
      }
    }

    bootstrap()
  }, [searchParams, setSearchParams, user?.id])

  useEffect(() => {
    const loadTemplateBindings = async () => {
      console.log('[PTPWorkflow] Loading template bindings...')
      const templateBindings = await ptpTemplateDataStoreService.loadBaseTemplateBindings()
      if (!templateBindings) {
        console.warn('[PTPWorkflow] No template data returned — using static defaults')
        return
      }

      console.log('[PTPWorkflow] ✅ Applying template data to UI')
      if (templateBindings.activityCategories.length > 0) {
        setActivityCategories(templateBindings.activityCategories)
      }
      if (templateBindings.permits.length > 0) {
        setPermitOptions(templateBindings.permits)
      }
      if (templateBindings.checklists.length > 0) {
        setChecklistOptions(templateBindings.checklists)
      }
      if (templateBindings.ppeCategories.length > 0) {
        setPpeCategories(templateBindings.ppeCategories)
      }
    }

    void loadTemplateBindings()
  }, [])

  const getStepPayload = (step: Step) => {
    if (step === 'tasks') {
      return { project, ptpName, tasks }
    }
    if (step === 'activity-controls') {
      return { toggles: activityToggles, items: activityItems, distances: activityDist }
    }
    if (step === 'requirements') {
      return {
        permits,
        checklists,
        ppeItems,
      }
    }
    if (step === 'emergency-contacts') {
      return {
        emergencyPlanDiscussed,
        safetyContact,
        superintendentContact,
        otherContact,
        musterArea,
      }
    }
    if (step === 'crew-signin') {
      return crew
    }
    if (step === 'ptp-review') {
      return {
        foremanComment,
        supervisorComment,
        foremanSignature: foremanReviewSignature,
        supervisorSignature: supervisorReviewSignature,
      }
    }

    return { signOff, shift, foremanSignature: dayClosureForemanSignature }
  }

  const hasMeaningfulTaskData = () => {
    return Boolean(project.trim()) ||
      Boolean(ptpName.trim()) ||
      tasks.some((task) =>
        Boolean(task.name?.trim()) ||
        Boolean(task.description?.trim()) ||
        Boolean(task.activityExposures?.trim()) ||
        Boolean(task.controlMeasures?.trim()) ||
        Boolean(task.competentInitials?.trim()) ||
        (Array.isArray(task.toolsEquipment) && task.toolsEquipment.length > 0) ||
        (Array.isArray(task.onsiteEquipment) && task.onsiteEquipment.length > 0)
      )
  }

  const hasAnyWorkflowInput = () => {
    if (hasMeaningfulTaskData()) return true

    const hasActivityInput =
      Object.values(activityToggles).some(Boolean) ||
      Object.values(activityItems).some(Boolean) ||
      Object.values(activityDist).some((value) => Boolean(String(value ?? '').trim()))

    if (hasActivityInput) return true

    const hasRequirementsInput =
      Object.values(permits).some(Boolean) ||
      Object.values(checklists).some(Boolean) ||
      Object.values(ppeItems).some(Boolean)

    if (hasRequirementsInput) return true

    const hasEmergencyInput =
      emergencyPlanDiscussed ||
      Boolean(safetyContact.trim()) ||
      Boolean(superintendentContact.trim()) ||
      Boolean(otherContact.trim()) ||
      Boolean(musterArea.trim())

    if (hasEmergencyInput) return true

    const hasCrewInput = crew.some((member) =>
      Boolean(member.name?.trim()) ||
      Boolean(member.comment?.trim()) ||
      Boolean(member.time?.trim()) ||
      Boolean(member.signatureData?.trim()) ||
      Boolean(member.signedIn)
    )

    if (hasCrewInput) return true

    const hasReviewInput =
      Boolean(foremanComment.trim()) ||
      Boolean(supervisorComment.trim()) ||
      Boolean(foremanReviewSignature.trim()) ||
      Boolean(supervisorReviewSignature.trim())

    if (hasReviewInput) return true

    const hasDayClosureInput =
      Object.keys(signOff).length > 0 ||
      shift.toolsCleaned ||
      shift.permitsClosed ||
      shift.anyIncidents ||
      shift.incidentReported ||
      Boolean(shift.incidentDescription.trim()) ||
      Boolean(dayClosureForemanSignature.trim())

    return hasDayClosureInput
  }

  const persistStep = async (step: Step, nextStatus?: string, showSuccessToast = false): Promise<boolean> => {
    const payload = getStepPayload(step)
    const stepKey = step as PtpWorkflowStepKey
    let workflowId = ptpId || pendingCreatedPtpIdRef.current

    if (!workflowId) {
      if (!hasAnyWorkflowInput()) {
        return true
      }

      try {
        const created = await ptpWorkflowService.createWorkflow({
          ptpType: (searchParams.get('ptpType') as any) || 'standard',
          sourcePtpId: searchParams.get('sourcePtpId') || undefined,
          title: ptpName.trim() || 'PTP Workflow',
          ptpDate: new Date().toISOString().slice(0, 10),
          status: nextStatus || 'draft',
          createdBy: user?.id,
        })

        workflowId = created.ptp_id
        pendingCreatedPtpIdRef.current = created.ptp_id
        setPtpId(created.ptp_id)
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.set('ptpId', created.ptp_id)
          return next
        })
      } catch {
        return false
      }
    }

    try {
      setIsSaving(true)
      console.log(`[persistStep] Saving step: ${step}, status: ${nextStatus}, payload:`, payload)
      
      await ptpWorkflowService.saveStep(workflowId, stepKey, payload, nextStatus, user?.id)
      
      console.log(`[persistStep] ✅ Successfully saved step: ${step}`)

      if (step === 'tasks') {
        await ptpWorkflowService.updateMeta(workflowId, {
          title: ptpName || 'PTP Workflow',
          ptpDate: new Date().toISOString().slice(0, 10),
          updatedBy: user?.id,
        })
      }
      
      if (showSuccessToast) {
        setRequiredToast(`✓ ${step.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} saved successfully`)
      }
      return true
    } catch (error) {
      console.error(`[persistStep] ❌ Error saving step ${step}:`, error)
      setRequiredToast(`Error saving ${step.replace('-', ' ')}. Please try again.`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  /* ── Navigation ── */
  const goBack = async () => {
    await persistStep(currentStep)
    if (stepIdx > 0) {
      setCurrentStep(STEPS[stepIdx-1].key)
    } else {
      navigate(-1)
    }
  }

  const handleSubmitForReview = async () => {
    if (!foremanReviewSignature.trim()) {
      setForemanReviewSignatureError(true)
      setRequiredToast('Please provide your signature before proceeding.')
      return
    }

    setForemanReviewSignatureError(false)
    setRequiredToast(null)
    console.log('[PTP Review] Submitting for review and navigating to dashboard...')
    const success = await persistStep('ptp-review', 'submitted')
    if (success) {
      // Show success toast briefly, then navigate
      setTimeout(() => {
        console.log('[PTP Review] ✅ Navigating to dashboard')
        navigate('/dashboard', { state: { ptpSuccess: true, ptpMessage: 'PTP submitted successfully.' } })
      }, 1000)
    }
  }

  const hasIncompleteActivitySections = () => {
    return activityCategories.some(category => {
      const markedNotApplicable = activityToggles[category.key] ?? false
      if (markedNotApplicable) return false

      const hasAtLeastOneCheckedOption = category.items.some(item => activityItems[`${category.key}::${item}`] ?? false)
      return !hasAtLeastOneCheckedOption
    })
  }

  const hasSelectedItemsForCategory = (categoryKey: string) => {
    const category = activityCategories.find(c => c.key === categoryKey)
    if (!category) return false
    return category.items.some(item => activityItems[`${categoryKey}::${item}`] ?? false)
  }

  const clearCategoryItems = (categoryKey: string) => {
    const category = activityCategories.find(c => c.key === categoryKey)
    if (!category) return

    setActivityItems(prev => {
      const next = { ...prev }
      category.items.forEach(item => {
        delete next[`${categoryKey}::${item}`]
      })
      return next
    })
  }

  const handleActivityToggleClick = (categoryKey: string, isApplicable: boolean) => {
    if (isApplicable) {
      setActivityToggles(prev => ({ ...prev, [categoryKey]: false }))
      return
    }

    if (hasSelectedItemsForCategory(categoryKey)) {
      setPendingActivityToggleKey(categoryKey)
      setShowActivityToggleConfirmModal(true)
      return
    }

    setActivityToggles(prev => ({ ...prev, [categoryKey]: true }))
  }

  const handleActivityDistanceChange = (categoryKey: string, rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '')

    if (!digitsOnly) {
      setActivityDist(prev => ({ ...prev, [categoryKey]: '' }))
      return
    }

    const parsed = Number.parseInt(digitsOnly, 10)
    if (Number.isNaN(parsed)) {
      setActivityDist(prev => ({ ...prev, [categoryKey]: '' }))
      return
    }

    const bounded = Math.min(parsed, 99999)
    setActivityDist(prev => ({ ...prev, [categoryKey]: String(bounded) }))
  }

  const confirmActivityToggle = () => {
    if (!pendingActivityToggleKey) return
    clearCategoryItems(pendingActivityToggleKey)
    setActivityToggles(prev => ({ ...prev, [pendingActivityToggleKey]: true }))
    setPendingActivityToggleKey(null)
    setShowActivityToggleConfirmModal(false)
  }

  const cancelActivityToggleConfirm = () => {
    setPendingActivityToggleKey(null)
    setShowActivityToggleConfirmModal(false)
  }

  const goNext = async () => {
    if (currentStep === 'activity-controls') {
      const missingProject = !project.trim()
      const missingPtpName = !ptpName.trim()

      setProjectError(missingProject)
      setPtpNameError(missingPtpName)
      setPtpNameErrorMessage(missingPtpName ? 'PTP Name is required' : '')

      if (missingProject || missingPtpName) {
        setRequiredToast(missingProject ? 'Project is required' : 'PTP Name is required')
        return
      }

      const isUniqueTitle = await validateUniquePtpName()
      if (!isUniqueTitle) return
    }

    if (currentStep === 'activity-controls' && hasIncompleteActivitySections()) {
      setShowActivityValidationModal(true)
      return
    }

    if (currentStep === 'requirements') {
      const hasAnyPermit = Object.values(permits).some(Boolean)
      const hasAnyChecklist = Object.values(checklists).some(Boolean)
      const hasAnyPpe = Object.values(ppeItems).some(Boolean)

      if (!hasAnyPermit && !hasAnyChecklist && !hasAnyPpe) {
        setRequiredToast('Please select at least one required permit, or checklist, or PPE')
        return
      }
    }

    if (currentStep === 'tasks' && tasks.length === 0) {
      setRequiredToast('At least one task is required')
      return
    }

    if (currentStep === 'emergency-contacts') {
      const missingMessages: string[] = []
      if (!safetyContact.trim()) missingMessages.push('Safety contact is required')
      if (!superintendentContact.trim()) missingMessages.push('Superintendent is required')
      if (!musterArea.trim()) missingMessages.push('Emergency Muster Area is required')

      if (missingMessages.length > 0) {
        setRequiredToast(missingMessages.join(' '))
        return
      }
    }

    if (currentStep === 'crew-signin' && crew.length === 0) {
      setRequiredToast('Please add at least one crew member before continuing.')
      return
    }

    if (currentStep === 'crew-signin') {
      const hasUnsignedCrew = crew.some(member => !member.signedIn || !(member.signatureData ?? '').trim())
      if (hasUnsignedCrew) {
        setRequiredToast('All the crew members must sign in before continuing.')
        return
      }
    }

    const nextStatus = isEditMode ? undefined : 'in_progress'
    const savedCurrentStep = await persistStep(currentStep, nextStatus, true)
    if (!savedCurrentStep) return

    // Project and job/task fields are captured through the tasks payload.
    // Persist them when leaving step 1 so values are retained even if user closes on step 2.
    if (currentStep === 'activity-controls') {
      const savedHeaderDetails = await persistStep('tasks', nextStatus)
      if (!savedHeaderDetails) return
    }

    if (stepIdx < STEPS.length-1) setCurrentStep(STEPS[stepIdx+1].key)
  }

  /* ── Check icon ── */
  const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
      <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3"/>
    </svg>
  )

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  const dayClosurePageSize = 5
  const dayClosureTotalPages = Math.max(1, Math.ceil(crew.length / dayClosurePageSize))
  const dayClosureStartIndex = (dayClosurePage - 1) * dayClosurePageSize
  const pagedCrew = crew.slice(dayClosureStartIndex, dayClosureStartIndex + dayClosurePageSize)

  const handleEodClosure = async () => {
    const allCrewSignedOut = crew.every((member) => {
      const value = (signOff[member.id] || '').trim().toLowerCase()
      return value === 'foreman' || value === 'self'
    })

    if (!allCrewSignedOut) {
      setRequiredToast('All the crew member must sign off before continuing')
      return
    }

    if (!dayClosureForemanSignature.trim()) {
      setShowEodValidationModal(true)
      return
    }

    await persistStep('ptp-day-closure', 'closed')
    setShowEodSuccessModal(true)
  }

  useEffect(() => {
    if (dayClosurePage > dayClosureTotalPages) {
      setDayClosurePage(dayClosureTotalPages)
    }
  }, [dayClosurePage, dayClosureTotalPages])

  return (
    <div className={styles.page}>
      {/* Page Title */}
      <div className={styles.pageTitleRow}>
        <h2 className={styles.pageTitle}>PTP Workflow</h2>
        <button className={styles.closeBtn} onClick={() => setShowCloseConfirmModal(true)} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Progress bar ── */}
      <div className={styles.progress}>
        {STEPS.map((step, idx) => {
          const done   = idx < stepIdx
          const active = idx === stepIdx
          return (
            <React.Fragment key={step.key}>
              <div className={styles.progressStep}>
                <div className={`${styles.progressDot} ${done ? styles.progressDotDone : ''} ${active ? styles.progressDotActive : ''}`}>
                  {done ? <CheckIcon /> : !active ? <span>{idx + 1}</span> : null}
                </div>
                <span className={`${styles.progressLabel} ${done ? styles.progressLabelDone : ''} ${active ? styles.progressLabelActive : ''}`}>
                  {[step.line1, step.line2].filter(Boolean).join(' ')}
                </span>
              </div>
              {idx < STEPS.length-1 && (
                <div className={`${styles.progressLine} ${idx < stepIdx ? styles.progressLineDone : ''} ${idx === stepIdx-1 ? styles.progressLineActive : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {requiredToast && (
        <div
          className={`${styles.requiredToast} ${requiredToast.startsWith('✓') ? styles.requiredToastSuccess : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className={styles.requiredToastAccent} />
          <span className={`${styles.requiredToastIcon} ${requiredToast.startsWith('✓') ? styles.requiredToastIconSuccess : ''}`}>
            {requiredToast.startsWith('✓') ? '✓' : '!'}
          </span>
          <span className={styles.requiredToastText}>{requiredToast}</span>
          <button type="button" className={styles.requiredToastClose} onClick={() => setRequiredToast(null)} aria-label="Close">
            x
          </button>
        </div>
      )}

      {/* ── Step content ── */}
      <div className={styles.stepBody}>

        {/* ════════ STEP 1: TASKS ════════ */}
        {currentStep === 'tasks' && (
          <>
            {/* Task list card */}
            <div className={styles.taskListCard}>
              <div className={styles.taskListHeader}>
                <h3 className={styles.taskListTitle}>Work Steps, Hazards, Controls &amp; Assignments</h3>
                <button className={styles.addTaskBtn} onClick={() => setShowAddTask(true)}>
                  <span className={styles.addTaskBtnPlus}>+</span>
                  Add Work Steps for Each Task
                </button>
              </div>

              <div className={styles.taskAccordion}>
                {tasks.map(task => (
                  <div key={task.id} className={styles.taskRow}>
                    <div className={styles.taskAccentBar} />
                    <div className={styles.taskContent}>
                      <div className={styles.taskHeader} onClick={() => toggleTask(task.id)}>
                        <div className={styles.taskHeaderLeft}>
                          <p className={styles.taskName}>{task.name}</p>
                          <p className={styles.taskDesc}>{task.description}</p>
                        </div>
                        <div className={styles.taskHeaderRight}>
                          <span className={`${styles.taskChevron} ${task.expanded ? styles.taskChevronOpen : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                          </span>
                        </div>
                      </div>
                      {task.expanded && (
                        <div className={styles.taskDetails}>
                          <div className={styles.taskDetailsActions}>
                            <button className={`${styles.iconBtn} ${styles.taskActionEdit}`} onClick={e => { e.stopPropagation(); startEditTask(task) }} title="Edit">
                              <img src="/images/DashboardEdit.png" alt="Edit" className={styles.taskActionIcon} />
                            </button>
                            <button className={`${styles.iconBtn} ${styles.taskActionDelete}`} onClick={e => { e.stopPropagation(); requestDeleteTask(task.id) }} title="Delete">
                              <img src="/images/DashboardDelete.png" alt="Delete" className={styles.taskActionIcon} />
                            </button>
                          </div>
                          <div className={styles.taskField}>
                            <p className={styles.taskFieldLabel}>Tools/Power Tools</p>
                            <p className={styles.taskFieldValue}>{task.toolsEquipment.join(', ')}</p>
                          </div>
                          <div className={styles.taskField}>
                            <p className={styles.taskFieldLabel}>Onsite Equipment</p>
                            <p className={styles.taskFieldValue}>{(task.onsiteEquipment ?? []).join(', ')}</p>
                          </div>
                          <div className={styles.taskField}>
                            <p className={styles.taskFieldLabel}>Hazards or Exposures</p>
                            <p className={styles.taskFieldValue}>{task.activityExposures}</p>
                          </div>
                          <div className={styles.taskField}>
                            <p className={styles.taskFieldLabel}>Control Measures</p>
                            <p className={styles.taskFieldValue}>{task.controlMeasures}</p>
                          </div>
                          <div className={styles.taskField}>
                            <p className={styles.taskFieldLabel}>Competent Person Initials</p>
                            <p className={styles.taskFieldValue}>{task.competentInitials}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════ STEP 1: ACTIVITY & CONTROLS ════════ */}
        {currentStep === 'activity-controls' && (
          <>
            <div className={styles.topInputRow}>
              <div className={styles.topInputLabels}>
                <label className={styles.formLabel}>Project <span className={styles.requiredStar}>*</span></label>
                <label className={styles.formLabel}>Job/Task <span className={styles.requiredStar}>*</span></label>
              </div>
              <div className={styles.topInputFields}>
                <PTPProjectDropdown
                  value={project}
                  selectedChoices={selectedProjects}
                  onChooseProject={handleProjectChange}
                  onOpenModal={() => setShowProjectModal(true)}
                  hasError={projectError}
                />
                <div className={styles.formInputWrap}>
                  <input
                    className={`${styles.formInputWide} ${ptpNameError ? styles.inputError : ''}`}
                    placeholder="Ex: Shake out steel"
                    value={ptpName}
                    onChange={e => handlePtpNameChange(e.target.value)}
                    onBlur={() => { void validateUniquePtpName() }}
                  />
                  {ptpNameError && (
                    <svg className={styles.inputErrorIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="#F43F5E" strokeWidth="1.4"/>
                      <path d="M8 4.6v4.2" stroke="#F43F5E" strokeWidth="1.4" strokeLinecap="round"/>
                      <circle cx="8" cy="11.6" r="0.9" fill="#F43F5E"/>
                    </svg>
                  )}
                </div>
              </div>
              <div className={styles.topInputErrors}>
                <span className={styles.inputErrorText}>{projectError ? 'Project is required' : ''}</span>
                <span className={styles.inputErrorText}>{ptpNameError ? (ptpNameErrorMessage || 'PTP Name is required') : ''}</span>
              </div>
            </div>
            <h3 className={styles.stepSectionTitle}>Activity &amp; Control Measures</h3>
            <div className={styles.activityList}>
              {activityCategories.map(cat => {
                const isApplicable = activityToggles[cat.key] ?? false
                return (
                  <div key={cat.key} className={styles.activityCard}>
                    <div className={styles.activityCardHeader}>
                      <div className={styles.activityCardLeft}>
                        <div className={styles.activityIcon}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="12" height="12" rx="2" fill="white" fillOpacity="0.3"/>
                            <path d="M4 7h6M7 4v6" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <span className={styles.activityCardName}>{cat.name}</span>
                      </div>
                      <div className={styles.activityCardRight}>
                        {cat.hasDistanceField && (
                          <span className={styles.activityDistLabel}>
                            Reqd.
                            <input
                              className={styles.activityDistInput}
                              type="text"
                              value={activityDist[cat.key] ?? ''}
                              disabled={isApplicable}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={5}
                              onChange={e => handleActivityDistanceChange(cat.key, e.target.value)}
                            />
                            ft
                          </span>
                        )}
                        <span className={styles.toggleLabel}>Not Applicable</span>
                        <button
                          className={`${styles.toggle} ${isApplicable ? styles.toggleOn : ''}`}
                          onClick={() => handleActivityToggleClick(cat.key, isApplicable)}
                          type="button"
                        >
                          <span className={styles.toggleThumb} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.activityCheckGrid}>
                      {cat.items.map(item => {
                        const k = `${cat.key}::${item}`
                        return (
                          <label key={item} className={`${styles.checkRow} ${isApplicable ? styles.checkRowDisabled : ''}`}>
                            <input type="checkbox" checked={activityItems[k] ?? false} disabled={isApplicable} onChange={e => setActivityItems(p => ({ ...p, [k]: e.target.checked }))} />
                            <span className={styles.checkLabel}>{item}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ════════ STEP 3: REQUIREMENTS ════════ */}
        {currentStep === 'requirements' && (
          <>
            <div className={styles.activityList}>

              {/* Critical Hazards Permits */}
              <div className={styles.activityCard}>
                <div className={styles.activityCardHeader}>
                  <div className={styles.activityCardLeft}>
                    <div className={styles.activityIcon}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4h4.5l-3.5 2.5 1.5 4L7 9l-3.5 2.5 1.5-4L1 5h4.5z" fill="white" fillOpacity="0.8"/></svg>
                    </div>
                    <span className={styles.activityCardName}>Critical Hazards Permits</span>
                  </div>
                </div>
                <div className={styles.activityCheckGrid}>
                  {permitOptions.map(p => (
                    <label key={p} className={styles.checkRow}>
                      <input
                        type="checkbox"
                        checked={permits[p] ?? false}
                        onChange={e => {
                          setPermits(prev => ({ ...prev, [p]: e.target.checked }))
                          if (e.target.checked) setRequiredToast(null)
                        }}
                      />
                      <span className={styles.checkLabel}>{p}</span>
                    </label>
                  ))}
                </div>
                <div className={styles.attachPermitsRow}>
                  <button className={styles.attachPermitsBtn} type="button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    Attach Permits
                  </button>
                </div>
              </div>

              {/* Required Checklists */}
              <div className={styles.activityCard}>
                <div className={styles.activityCardHeader}>
                  <div className={styles.activityCardLeft}>
                    <div className={styles.activityIcon}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2h8a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="white" strokeWidth="1.2" fill="none"/><path d="M4 5h6M4 7h6M4 9h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </div>
                    <span className={styles.activityCardName}>Required Checklists</span>
                  </div>
                </div>
                <div className={styles.activityCheckGrid}>
                  {checklistOptions.map(c => (
                    <label key={c} className={styles.checkRow}>
                      <input
                        type="checkbox"
                        checked={checklists[c] ?? false}
                        onChange={e => {
                          setChecklists(prev => ({ ...prev, [c]: e.target.checked }))
                          if (e.target.checked) setRequiredToast(null)
                        }}
                      />
                      <span className={styles.checkLabel}>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Required PPE */}
              <div className={styles.activityCard}>
                <div className={styles.activityCardHeader}>
                  <div className={styles.activityCardLeft}>
                    <div className={styles.activityIcon}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 3 3 5v1H2v5h10V6h-1V5c0-2-1.8-4-4-4z" stroke="white" strokeWidth="1.2" fill="none"/></svg>
                    </div>
                    <span className={styles.activityCardName}>Required PPE</span>
                  </div>
                </div>
                <div className={styles.ppeCategoryList}>
                  {ppeCategories.map(cat => (
                    <div key={cat.name}>
                      <div className={styles.ppeCategoryHeader}>{cat.name}</div>
                      <div className={styles.activityCheckGrid} style={{marginTop: 8}}>
                        {cat.items.map(item => (
                          <label key={item} className={styles.checkRow}>
                            <input
                              type="checkbox"
                              checked={ppeItems[item] ?? false}
                              onChange={e => {
                                setPpeItems(prev => ({ ...prev, [item]: e.target.checked }))
                                if (e.target.checked) setRequiredToast(null)
                              }}
                            />
                            <span className={styles.checkLabel}>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

        {/* ════════ STEP 4: EMERGENCY CONTACTS ════════ */}
        {currentStep === 'emergency-contacts' && (
          <div className={styles.emergencySection}>
            <h3 className={styles.emergencySectionTitle}>Emergency Names &amp; Phone Numbers</h3>
            <div className={styles.emergencyCard}>
              {/* Toggle row */}
              <div className={styles.emergencyToggleRow}>
                <span className={styles.emergencyToggleLabel}>Emergency Action Plan discussed before start of job?</span>
                <button
                  className={`${styles.toggle} ${emergencyPlanDiscussed ? styles.toggleOn : ''}`}
                  onClick={() => setEmergencyPlanDiscussed(p => !p)}
                  type="button"
                ><span className={styles.toggleThumb} /></button>
              </div>

              {/* 2x2 grid of inputs */}
              <div className={styles.emergencyGrid}>
                <div className={styles.emergencyField}>
                  <label className={styles.emergencyFieldLabel}>Safety <span className={styles.requiredStar}>*</span></label>
                  <input className={styles.emergencyInput} value={safetyContact} onChange={e => { setSafetyContact(e.target.value); if (requiredToast) setRequiredToast(null) }} placeholder="Mark Haggenmaker (434) 282-398" />
                </div>
                <div className={styles.emergencyField}>
                  <label className={styles.emergencyFieldLabel}>Superintendent <span className={styles.requiredStar}>*</span></label>
                  <input className={styles.emergencyInput} value={superintendentContact} onChange={e => { setSuperintendentContact(e.target.value); if (requiredToast) setRequiredToast(null) }} placeholder="BMB Stephen Wolf (434) 312-1922" />
                </div>
                <div className={styles.emergencyField}>
                  <label className={styles.emergencyFieldLabel}>Other</label>
                  <input className={styles.emergencyInput} value={otherContact} onChange={e => setOtherContact(e.target.value)} placeholder="Enter Additional Contact Number" />
                </div>
                <div className={styles.emergencyField}>
                  <label className={styles.emergencyFieldLabel}>Emergency Muster Area <span className={styles.requiredStar}>*</span></label>
                  <input className={styles.emergencyInput} value={musterArea} onChange={e => { setMusterArea(e.target.value); if (requiredToast) setRequiredToast(null) }} placeholder="Ex: BMB Office Trailer" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ STEP 5: CREW SIGN-IN ════════ */}
        {currentStep === 'crew-signin' && (
          <div className={styles.crewSignCard}>
            <h3 className={styles.crewSignTitle}>Crew Sign in</h3>
            <div className={styles.crewSignTableWrap}>
              <table className={styles.crewSignTable}>
                <thead>
                  <tr>
                    <th style={{width:48}}>No.</th>
                    <th>Member Names</th>
                    <th style={{width:180}}>Sign in</th>
                    <th style={{width:220}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {crew.map((m, idx) => (
                    <tr key={m.id}>
                      <td className={styles.crewSignNoCell}>{idx + 1}</td>
                      <td>
                        <div className={styles.crewSignMemberCell}>
                          <div className={styles.crewSignAvatar} style={{ background: m.avatarColor }}>{m.initials}</div>
                          <div>
                            {editingCrewId === m.id ? (
                              <input
                                className={styles.crewSignMemberEditInput}
                                value={editingCrewNameDraft}
                                onChange={e => setEditingCrewNameDraft(e.target.value)}
                                onBlur={saveEditCrewMember}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    saveEditCrewMember()
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault()
                                    cancelEditCrewMember()
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <p className={styles.crewSignMemberName}>{m.name}</p>
                            )}
                            <p className={styles.crewSignMemberUser}>{m.username.replace(/^@/, '')}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {m.signedIn
                          ? <button className={styles.crewSignedStateBtn} onClick={() => openSignInModal(m.id)} type="button">
                              <span className={styles.crewSignedCheck}>✓</span>
                              <span className={styles.crewSignedText}>Signed-in</span>
                              <img src="/images/message.svg" alt="" aria-hidden="true" className={styles.crewSignedMsgIcon} />
                            </button>
                          : <button className={styles.crewSignSignBtn} onClick={() => openSignInModal(m.id)} type="button">
                              <img className={styles.crewSignInkIcon} src="/images/SiginIn.png" alt="" aria-hidden="true" />
                              Sign in
                            </button>
                        }
                      </td>
                      <td>
                        <div className={styles.crewSignActionCell}>
                          <button
                            className={`${styles.iconBtn} ${styles.taskActionEdit}`}
                            type="button"
                            title="Edit"
                            onClick={() => editingCrewId === m.id ? saveEditCrewMember() : startEditCrewMember(m)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                              <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                            </svg>
                          </button>
                          <button className={`${styles.iconBtn} ${styles.taskActionDelete}`} onClick={() => requestDeleteCrew(m.id)} type="button" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className={styles.crewSignNoCell}>{crew.length + 1}</td>
                    <td>
                      <input
                        className={styles.crewSignMemberInput}
                        placeholder="Enter Member Name..."
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCrewMember()}
                      />
                    </td>
                    <td />
                    <td>
                      <button className={styles.crewSignAddBtn} onClick={addCrewMember} type="button">+ Add Member</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.crewSignPager}>
              <button type="button" className={styles.crewSignPagerBtn} aria-label="Previous crew page">&lt;</button>
              <span className={styles.crewSignPagerIndex}>1</span>
              <button type="button" className={styles.crewSignPagerBtn} aria-label="Next crew page">&gt;</button>
            </div>
          </div>
        )}

        {/* ════════ STEP 6: PTP REVIEW ════════ */}
        {currentStep === 'ptp-review' && (
          <>
            {/* Foreman Review */}
            <div className={styles.reviewSection}>
              <h3 className={styles.reviewSectionTitle}>Foreman Review</h3>
              <div className={styles.reviewForm}>
                <div className={styles.formGroup}>
                  <div className={styles.reviewCommentLabelRow}>
                    <label className={styles.formLabel}>Enter Comments</label>
                    <button className={styles.signInMicBtn} type="button" aria-label="Voice input">
                      <MicIcon />
                    </button>
                  </div>
                  <textarea className={styles.formTextarea} rows={3} placeholder="Enter your comments here.."
                    value={foremanComment} onChange={e => setForemanComment(e.target.value)} />
                </div>
                <SigPad
                  personName={reviewPersonName}
                  companyName={reviewCompanyName}
                  date={reviewDate}
                  variant="signin"
                  initialSignature={foremanReviewSignature}
                  hasError={foremanReviewSignatureError}
                  onSignatureChange={(value) => {
                    setForemanReviewSignature(value)
                    if (value.trim()) {
                      setForemanReviewSignatureError(false)
                      if (requiredToast === 'Please provide your signature before proceeding.') {
                        setRequiredToast(null)
                      }
                    }
                  }}
                />
                <div className={styles.reviewActionRow}>
                  <button 
                    className={styles.reviewSubmitBtn} 
                    type="button" 
                    disabled={isSaving}
                    onClick={handleSubmitForReview}
                  >
                    {isSaving ? 'Saving...' : 'Submit for Review'}
                  </button>
                </div>
              </div>
            </div>

            {/* PTP Supervisor Review */}
            <div className={styles.reviewSection}>
              <h3 className={styles.reviewSectionTitle}>PTP Review</h3>
              <div className={styles.reviewForm}>
                <div className={styles.formGroup}>
                  <div className={styles.reviewCommentLabelRow}>
                    <label className={styles.formLabel}>Enter Comments</label>
                    <button className={styles.signInMicBtn} type="button" aria-label="Voice input">
                      <MicIcon />
                    </button>
                  </div>
                  <textarea className={styles.formTextarea} rows={3} placeholder="Enter your comments here.."
                    value={supervisorComment} onChange={e => setSupervisorComment(e.target.value)} />
                </div>
                <SigPad
                  personName={reviewPersonName}
                  companyName={reviewCompanyName}
                  date={reviewDate}
                  variant="signin"
                  initialSignature={supervisorReviewSignature}
                  hasError={ptpReviewSignatureError}
                  onSignatureChange={(value) => {
                    setSupervisorReviewSignature(value)
                    if (value.trim()) {
                      setPtpReviewSignatureError(false)
                      if (requiredToast === 'Please provide your signature before proceeding.') {
                        setRequiredToast(null)
                      }
                    }
                  }}
                />
                <div className={styles.reviewActionRow}>
                  <button 
                    className={styles.reviewFlagBtn} 
                    type="button" 
                    disabled={isSaving || isPtpReviewSaving}
                    onClick={() => {
                      console.log('[PTP Review] Flagging for changes...')
                      persistStep('ptp-review', 'changes_requested')
                    }}
                  >
                    {(isSaving || isPtpReviewSaving) ? 'Saving...' : 'Flag for Changes'}
                  </button>
                  {isSuperintendent && (
                    <button 
                      className={styles.reviewReviewedBtn} 
                      type="button"
                      disabled={isPtpReviewSaving}
                      onClick={handlePtpReviewed}
                    >
                      {isPtpReviewSaving ? 'Saving...' : 'PTP Reviewed'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════ STEP 7: PTP DAY CLOSURE ════════ */}
        {currentStep === 'ptp-day-closure' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={`${styles.cardHeaderTitle} ${styles.dayClosureHeaderTitle}`}>PTP Day Closure</h3>
            </div>
            <div className={styles.cardBody}>
              {/* Member table */}
              <table className={styles.crewTable}>
                <thead>
                  <tr>
                    <th style={{width:40}}>No.</th>
                    <th>Member Names</th>
                    <th>Sign In</th>
                    <th>Sign Out</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCrew.map((m, idx) => (
                    <tr key={m.id}>
                      <td className={styles.noCell}>{dayClosureStartIndex + idx + 1}</td>
                      <td>
                        <div className={styles.memberCell}>
                          <div className={styles.memberAvatar} style={{background: m.avatarColor}}>{m.initials}</div>
                          <div>
                            <p className={styles.memberName}>{m.name}</p>
                            <p className={styles.memberUsername}>{m.username}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p style={{fontSize:13,margin:0,color:'#1A1C1E',fontWeight:500}}>Completed</p>
                      </td>
                      <td>
                        <select className={styles.ackSelect} value={signOff[m.id]||''} onChange={e => setSignOff(p => ({...p,[m.id]:e.target.value}))}>
                          <option value="">Acknowledged by</option>
                          <option>Foreman</option>
                          <option>Self</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.crewSignPager}>
                <button
                  type="button"
                  className={styles.crewSignPagerBtn}
                  aria-label="Previous day closure page"
                  disabled={dayClosurePage <= 1}
                  onClick={() => setDayClosurePage(prev => Math.max(1, prev - 1))}
                >
                  &lt;
                </button>
                <span className={styles.crewSignPagerIndex}>{dayClosurePage}</span>
                <button
                  type="button"
                  className={styles.crewSignPagerBtn}
                  aria-label="Next day closure page"
                  disabled={dayClosurePage >= dayClosureTotalPages}
                  onClick={() => setDayClosurePage(prev => Math.min(dayClosureTotalPages, prev + 1))}
                >
                  &gt;
                </button>
              </div>

              {/* End of Shift Review */}
              <div className={styles.eosSection}>
                <p className={styles.eosSectionTitle}>End of Shift Review</p>
                {[
                  { key: 'toolsCleaned',   q: 'Are all of tools/equipment used, debris, trash, etc. cleaned up and stored properly?' },
                  { key: 'permitsClosed',  q: 'Have all permits been closed or called off as required?' },
                  { key: 'anyIncidents',   q: 'Were there any incidents or injuries today?' },
                ].map(item => (
                  <div key={item.key} className={styles.eosRow}>
                    <span className={styles.eosQuestion}>{item.q}</span>
                    <div className={styles.eosToggleWrap}>
                      <span className={`${styles.eosToggleLabel} ${shift[item.key as keyof ShiftReview] ? styles.eosToggleLabelActive : ''}`}>
                        {shift[item.key as keyof ShiftReview] ? 'Yes' : 'No'}
                      </span>
                      <label className={styles.toggle}>
                        <input type="checkbox" checked={!!shift[item.key as keyof ShiftReview]}
                          onChange={e => setShift(p => ({...p, [item.key]: e.target.checked}))} />
                        <span className={styles.toggleSlider} />
                      </label>
                    </div>
                  </div>
                ))}
                {shift.anyIncidents && (
                  <>
                    <div className={styles.eosRow}>
                      <span className={styles.eosQuestion}>Was it reported?</span>
                      <div className={styles.eosToggleWrap}>
                        <span className={`${styles.eosToggleLabel} ${shift.incidentReported ? styles.eosToggleLabelActive : ''}`}>
                          {shift.incidentReported ? 'Yes' : 'No'}
                        </span>
                        <label className={styles.toggle}>
                          <input type="checkbox" checked={shift.incidentReported}
                            onChange={e => setShift(p => ({...p, incidentReported: e.target.checked}))} />
                          <span className={styles.toggleSlider} />
                        </label>
                      </div>
                    </div>
                    <textarea className={styles.eosTextarea} rows={2} placeholder="Provide description of the incident here..."
                      value={shift.incidentDescription} onChange={e => setShift(p => ({...p, incidentDescription: e.target.value}))} />
                  </>
                )}
              </div>

              {/* Foreman Signature */}
              <div className={styles.sigSectionWrap}>
                <p className={styles.sigSectionTitle}>Foreman Signature ( End of Shift ) <span className={styles.requiredStar}>*</span></p>
                <div className={styles.sigSectionBody}>
                  <SigPad
                    personName="Nick Fries"
                    initialSignature={dayClosureForemanSignature}
                    onSignatureChange={setDayClosureForemanSignature}
                  />
                </div>
              </div>

              {/* EoD Button */}
              <div className={styles.eodBtn}>
                <button
                  className={styles.btnEoD}
                  onClick={handleEodClosure}
                >
                  EoD PTP Closure
                </button>
              </div>
            </div>
          </div>
        )}

      </div>{/* end stepBody */}

      {showTaskDeleteConfirmModal && (
        <div className={styles.taskDeleteConfirmOverlay} onClick={cancelDeleteTaskConfirm}>
          <div className={styles.taskDeleteConfirmModal} role="dialog" aria-modal="true" aria-labelledby="task-delete-confirm-title" onClick={e => e.stopPropagation()}>
            <div className={styles.taskDeleteConfirmHeader}>
              <h3 id="task-delete-confirm-title" className={styles.taskDeleteConfirmTitle}>Confirm Delete</h3>
              <button
                className={styles.taskDeleteConfirmX}
                onClick={cancelDeleteTaskConfirm}
                type="button"
                aria-label="Close delete confirmation dialog"
              >
                x
              </button>
            </div>
            <div className={styles.taskDeleteConfirmBody}>
              <p>Are you sure you want to delete this task?</p>
            </div>
            <div className={styles.taskDeleteConfirmActions}>
              <button className={styles.taskDeleteCancelBtn} onClick={cancelDeleteTaskConfirm} type="button">Cancel</button>
              <button className={styles.taskDeleteDeleteBtn} onClick={confirmDeleteTask} type="button">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showCrewDeleteConfirmModal && (
        <div className={styles.crewDeleteConfirmOverlay} onClick={cancelDeleteCrewConfirm}>
          <div className={styles.crewDeleteConfirmModal} role="dialog" aria-modal="true" aria-labelledby="crew-delete-confirm-title" onClick={e => e.stopPropagation()}>
            <div className={styles.crewDeleteConfirmHeader}>
              <h3 id="crew-delete-confirm-title" className={styles.crewDeleteConfirmTitle}>Delete Crew Member</h3>
              <button
                className={styles.crewDeleteConfirmX}
                onClick={cancelDeleteCrewConfirm}
                type="button"
                aria-label="Close crew delete confirmation dialog"
              >
                x
              </button>
            </div>
            <div className={styles.crewDeleteConfirmBody}>
              <div className={styles.crewDeleteConfirmMessageCard}>
                <p className={styles.crewDeleteConfirmMessagePrimary}>Are you sure you want to delete this crew member?</p>
                <p className={styles.crewDeleteConfirmMessageSecondary}>This action cannot be undone.</p>
              </div>
            </div>
            <div className={styles.crewDeleteConfirmActions}>
              <button className={styles.crewDeleteCancelBtn} onClick={cancelDeleteCrewConfirm} type="button">Cancel</button>
              <button className={styles.crewDeleteConfirmBtn} onClick={confirmDeleteCrew} type="button">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ CLOSE CONFIRMATION MODAL ════════ */}
      {showCloseConfirmModal && (
        <div className={styles.closeConfirmOverlay}>
          <div className={styles.closeConfirmModal} role="dialog" aria-modal="true" aria-labelledby="close-confirm-title">
            <div className={styles.closeConfirmHeader}>
              <h3 id="close-confirm-title" className={styles.closeConfirmTitle}>Edit Activity &amp; Control Measures</h3>
              <button
                className={styles.closeConfirmX}
                onClick={() => setShowCloseConfirmModal(false)}
                type="button"
                aria-label="Close confirmation dialog"
              >
                x
              </button>
            </div>
            <div className={styles.closeConfirmBody}>
              <p>Are you sure you want to close this PTP? Any unsaved changes will be lost.</p>
            </div>
            <div className={styles.closeConfirmActions}>
              <button className={styles.closeConfirmNo} onClick={() => setShowCloseConfirmModal(false)} type="button">No</button>
              <button
                className={styles.closeConfirmYes}
                onClick={async () => {
                  if (!ptpId) {
                    navigate('/dashboard')
                    return
                  }

                  const closeStatus = isEditMode ? undefined : 'in_progress'
                  const savedCurrentStep = await persistStep(currentStep, closeStatus)
                  if (!savedCurrentStep) return

                  if (currentStep === 'activity-controls') {
                    const savedHeaderDetails = await persistStep('tasks', closeStatus)
                    if (!savedHeaderDetails) return
                  }

                  navigate('/dashboard')
                }}
                type="button"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivityToggleConfirmModal && (
        <div className={styles.activityToggleConfirmOverlay}>
          <div className={styles.activityToggleConfirmModal} role="dialog" aria-modal="true" aria-labelledby="activity-toggle-confirm-title">
            <div className={styles.activityToggleConfirmHeader}>
              <h3 id="activity-toggle-confirm-title" className={styles.activityToggleConfirmTitle}>Confirm</h3>
              <button
                className={styles.activityToggleConfirmX}
                onClick={cancelActivityToggleConfirm}
                type="button"
                aria-label="Close confirmation dialog"
              >
                x
              </button>
            </div>
            <div className={styles.activityToggleConfirmBody}>
              <p>You have options selected, these will be cleared. Are you sure you want to continue?</p>
            </div>
            <div className={styles.activityToggleConfirmActions}>
              <button className={styles.activityToggleConfirmNo} onClick={cancelActivityToggleConfirm} type="button">No</button>
              <button className={styles.activityToggleConfirmYes} onClick={confirmActivityToggle} type="button">Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer navigation ── */}
      <div className={styles.footer}>
        <button className={styles.btnPrev} onClick={goBack} disabled={isSaving}>
          &larr; Prev
        </button>
        <div style={{flex:1}} />

        {currentStep === 'crew-signin'
          ? <button className={styles.btnSaveNext} onClick={goNext} disabled={isSaving}>
              Save and Next &rarr;
            </button>
          : currentStep !== 'ptp-day-closure' && (currentStep !== 'ptp-review' || fromClock)
          ? <button className={styles.btnNext} onClick={goNext} disabled={isSaving}>
              Save and Next &rarr;
            </button>
          : null
        }
      </div>

      {/* ════════ PROJECT SELECTION MODAL ════════ */}
      {showProjectModal && (
        <ProjectSelectionModal
          onClose={() => setShowProjectModal(false)}
          onSelect={handleProjectSelectionsSave}
          currentSelections={selectedProjects}
        />
      )}

      {/* ════════ ACTIVITY VALIDATION MODAL ════════ */}
      {showActivityValidationModal && (
        <div className={styles.validationOverlay}>
          <div className={styles.validationModal} role="dialog" aria-modal="true" aria-labelledby="activity-validation-title">
            <div className={styles.validationHeader}>
              <h3 id="activity-validation-title" className={styles.validationTitle}>Validation Required</h3>
              <button
                className={styles.validationClose}
                onClick={() => setShowActivityValidationModal(false)}
                aria-label="Close validation popup"
                type="button"
              >
                x
              </button>
            </div>
            <div className={styles.validationBody}>
              <p>All activities must be reviewed and select appropriate options before continuing.</p>
            </div>
            <div className={styles.validationFooter}>
              <button className={styles.validationOkBtn} onClick={() => setShowActivityValidationModal(false)} type="button">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showEodSuccessModal && (
        <div className={styles.validationOverlay}>
          <div className={styles.validationModal} role="dialog" aria-modal="true" aria-labelledby="eod-success-title">
            <div className={styles.validationHeader}>
              <h3 id="eod-success-title" className={styles.validationTitle}>PTP Closed</h3>
              <button
                className={styles.validationClose}
                onClick={() => { setShowEodSuccessModal(false); navigate('/dashboard') }}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className={styles.validationBody}>
              <p>PTP End of Shift closure completed successfully.</p>
            </div>
            <div className={styles.validationFooter}>
              <button
                className={styles.validationOkBtn}
                onClick={() => { setShowEodSuccessModal(false); navigate('/dashboard') }}
                type="button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showEodValidationModal && (
        <div className={styles.validationOverlay}>
          <div className={styles.validationModal} role="dialog" aria-modal="true" aria-labelledby="eod-validation-title">
            <div className={styles.validationHeader}>
              <h3 id="eod-validation-title" className={styles.validationTitle}>Action Required Before Closing PTP</h3>
              <button
                className={styles.validationClose}
                onClick={() => setShowEodValidationModal(false)}
                aria-label="Close validation popup"
                type="button"
              >
                x
              </button>
            </div>
            <div className={styles.validationBody}>
              <p>Please make sure End of the Shift checklist is reviewed and necessary permits attached before closing the PTP.</p>
            </div>
            <div className={styles.validationFooter}>
              <button className={styles.validationOkBtn} onClick={() => setShowEodValidationModal(false)} type="button">
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ ADD TASK MODAL ════════ */}
      {showAddTask && (
        <div className={styles.workStepModalOverlay} onClick={() => setShowAddTask(false)}>
          <div className={styles.workStepModal} onClick={e => e.stopPropagation()}>
            <div className={styles.workStepModalHeader}>
              <h3 className={styles.workStepModalTitle}>Add Work Steps for Each Task</h3>
              <button className={styles.workStepModalClose} onClick={() => setShowAddTask(false)} type="button">x</button>
            </div>

            <div className={styles.workStepModalBody}>
              <div className={styles.formGroup}>
                <label className={styles.workStepLabel}>Hazards or Exposures</label>
                <div className={styles.hazardMultiSelect}>
                  <div
                    className={styles.hazardTrigger}
                    role="button"
                    tabIndex={0}
                    onClick={() => setNewTask(p => ({ ...p, hazardsOpen: !p.hazardsOpen }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setNewTask(p => ({ ...p, hazardsOpen: !p.hazardsOpen }))
                      }
                    }}
                  >
                    <div className={styles.hazardChipsWrap}>
                      {newTask.hazards.length === 0 ? (
                        <span className={styles.hazardPlaceholder}>Enter Hazards or exposures...</span>
                      ) : (
                        newTask.hazards.map(hazardId => {
                          const option = HAZARD_EXPOSURE_OPTIONS.find(o => o.id === hazardId)
                          if (!option) return null
                          return (
                            <span key={hazardId} className={styles.hazardChip}>
                              {option.chipLabel}
                              <button
                                type="button"
                                className={styles.hazardChipRemove}
                                onClick={e => {
                                  e.stopPropagation()
                                  removeHazardSelection(hazardId)
                                }}
                                aria-label={`Remove ${option.chipLabel}`}
                              >
                                x
                              </button>
                            </span>
                          )
                        })
                      )}
                    </div>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className={styles.hazardCaret}>
                      <path d="M2 4.2l3.5 3 3.5-3" stroke="#374151" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {newTask.hazardsOpen && (
                    <div className={styles.hazardDropdownList}>
                      {HAZARD_EXPOSURE_OPTIONS.map(option => {
                        const selected = newTask.hazards.includes(option.id)
                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={styles.hazardOptionRow}
                            onClick={() => toggleHazardSelection(option.id)}
                          >
                            <span className={`${styles.hazardOptionTick} ${selected ? styles.hazardOptionTickSelected : ''}`} aria-hidden="true">
                              {selected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            <span className={styles.hazardOptionText}>{option.fullLabel}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.workStepLabelRow}>
                  <label className={styles.workStepLabel}>Work Steps<span className={styles.workStepRequired}>*</span></label>
                  <span className={styles.workStepMic}><MicIcon /></span>
                </div>
                <textarea
                  className={`${styles.workStepTextarea}${addTaskErrors.workSteps ? ` ${styles.workStepFieldError}` : ''}`}
                  rows={2}
                  maxLength={300}
                  placeholder="Enter Work Steps information..."
                  value={newTask.workSteps}
                  onChange={e => { setNewTask(p => ({ ...p, workSteps: e.target.value })); if (e.target.value.trim()) setAddTaskErrors(p => ({ ...p, workSteps: false })) }}
                />
                {addTaskErrors.workSteps && <span className={styles.workStepErrorMsg}>Work Steps is required</span>}
                <span className={styles.workStepCount}>{newTask.workSteps.length}/300</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.workStepLabel}>Tools/Power Tools</label>
                <div className={styles.toolsPowerMulti}>
                  <div
                    className={styles.toolsPowerTrigger}
                    role="button"
                    tabIndex={0}
                    onClick={() => setNewTask(p => ({ ...p, toolsPowerOpen: !p.toolsPowerOpen }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setNewTask(p => ({ ...p, toolsPowerOpen: !p.toolsPowerOpen }))
                      }
                    }}
                  >
                    <div className={styles.toolsPowerChipsWrap}>
                      {newTask.toolsPowerTools.filter(tool => tool !== TOOLS_POWER_OTHERS_OPTION).length === 0 ? (
                        <span className={styles.toolsPowerValue}>Select tools</span>
                      ) : (
                        newTask.toolsPowerTools
                          .filter(tool => tool !== TOOLS_POWER_OTHERS_OPTION)
                          .map(tool => (
                            <span key={tool} className={styles.toolsPowerChip}>
                              {tool}
                              <button
                                type="button"
                                className={styles.toolsPowerChipRemove}
                                onClick={e => {
                                  e.stopPropagation()
                                  togglePowerToolSelection(tool)
                                }}
                                aria-label={`Remove ${tool}`}
                              >
                                x
                              </button>
                            </span>
                          ))
                      )}
                    </div>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 4.2l3.5 3 3.5-3" stroke="#374151" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {newTask.toolsPowerOpen && (
                    <div className={styles.toolsPowerDropdown}>
                      {TOOLS_POWER_BASE_OPTIONS.map(tool => {
                        const selected = newTask.toolsPowerTools.includes(tool)
                        return (
                          <button
                            key={tool}
                            type="button"
                            className={styles.toolsPowerOption}
                            onClick={() => togglePowerToolSelection(tool)}
                          >
                            <span className={`${styles.toolsPowerTick} ${selected ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                              {selected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            <span className={styles.toolsPowerOptionText}>{tool}</span>
                          </button>
                        )
                      })}

                      <div className={styles.toolsPowerDivider} />

                      <button
                        type="button"
                        className={styles.toolsPowerOption}
                        onClick={() => togglePowerToolSelection(TOOLS_POWER_OTHERS_OPTION)}
                      >
                        <span className={`${styles.toolsPowerTick} ${newTask.toolsPowerTools.includes(TOOLS_POWER_OTHERS_OPTION) ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                          {newTask.toolsPowerTools.includes(TOOLS_POWER_OTHERS_OPTION) && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        <span className={styles.toolsPowerOptionText}>{TOOLS_POWER_OTHERS_OPTION}</span>
                      </button>

                      {newTask.toolsPowerTools.includes(TOOLS_POWER_OTHERS_OPTION) && (
                        <div className={styles.toolsPowerAddRow}>
                          <button
                            type="button"
                            className={styles.toolsPowerRemoveOthers}
                            onClick={() => togglePowerToolSelection(TOOLS_POWER_OTHERS_OPTION)}
                            aria-label="Remove Others"
                          >
                            x
                          </button>
                          <input
                            className={styles.toolsPowerAddInput}
                            placeholder="Enter tool"
                            value={newTask.customToolInput}
                            onChange={e => setNewTask(p => ({ ...p, customToolInput: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomPowerTool()
                              }
                            }}
                          />
                          <button type="button" className={styles.toolsPowerAddBtn} onClick={addCustomPowerTool}>Add</button>
                        </div>
                      )}

                      {newTask.customTools.map(tool => {
                        const selected = newTask.toolsPowerTools.includes(tool)
                        return (
                          <button
                            key={tool}
                            type="button"
                            className={styles.toolsPowerOption}
                            onClick={() => togglePowerToolSelection(tool)}
                          >
                            <span className={`${styles.toolsPowerTick} ${selected ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                              {selected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            <span className={styles.toolsPowerOptionText}>{tool}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.workStepLabel}>Onsite Equipment <span className={styles.workStepHint}>(Ex: Scissor Lift)</span></label>
                <div className={styles.toolsPowerMulti}>
                  <div
                    className={styles.toolsPowerTrigger}
                    role="button"
                    tabIndex={0}
                    onClick={() => setNewTask(p => ({ ...p, onsiteEquipmentOpen: !p.onsiteEquipmentOpen }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setNewTask(p => ({ ...p, onsiteEquipmentOpen: !p.onsiteEquipmentOpen }))
                      }
                    }}
                  >
                    <div className={styles.toolsPowerChipsWrap}>
                      {newTask.onsiteEquipment.filter(item => item !== ONSITE_EQUIPMENT_OTHERS_OPTION).length === 0 ? (
                        <span className={styles.toolsPowerValue}>Select Equipment</span>
                      ) : (
                        newTask.onsiteEquipment
                          .filter(item => item !== ONSITE_EQUIPMENT_OTHERS_OPTION)
                          .map(item => (
                            <span key={item} className={styles.toolsPowerChip}>
                              {item}
                              <button
                                type="button"
                                className={styles.toolsPowerChipRemove}
                                onClick={e => {
                                  e.stopPropagation()
                                  toggleOnsiteEquipmentSelection(item)
                                }}
                                aria-label={`Remove ${item}`}
                              >
                                x
                              </button>
                            </span>
                          ))
                      )}
                    </div>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 4.2l3.5 3 3.5-3" stroke="#374151" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {newTask.onsiteEquipmentOpen && (
                    <div className={styles.toolsPowerDropdown}>
                      {ONSITE_EQUIPMENT_BASE_OPTIONS.map(item => {
                        const selected = newTask.onsiteEquipment.includes(item)
                        return (
                          <button
                            key={item}
                            type="button"
                            className={styles.toolsPowerOption}
                            onClick={() => toggleOnsiteEquipmentSelection(item)}
                          >
                            <span className={`${styles.toolsPowerTick} ${selected ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                              {selected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            <span className={styles.toolsPowerOptionText}>{item}</span>
                          </button>
                        )
                      })}

                      <div className={styles.toolsPowerDivider} />

                      <button
                        type="button"
                        className={styles.toolsPowerOption}
                        onClick={() => toggleOnsiteEquipmentSelection(ONSITE_EQUIPMENT_OTHERS_OPTION)}
                      >
                        <span className={`${styles.toolsPowerTick} ${newTask.onsiteEquipment.includes(ONSITE_EQUIPMENT_OTHERS_OPTION) ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                          {newTask.onsiteEquipment.includes(ONSITE_EQUIPMENT_OTHERS_OPTION) && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        <span className={styles.toolsPowerOptionText}>{ONSITE_EQUIPMENT_OTHERS_OPTION}</span>
                      </button>

                      {newTask.onsiteEquipment.includes(ONSITE_EQUIPMENT_OTHERS_OPTION) && (
                        <div className={styles.toolsPowerAddRow}>
                          <button
                            type="button"
                            className={styles.toolsPowerRemoveOthers}
                            onClick={() => toggleOnsiteEquipmentSelection(ONSITE_EQUIPMENT_OTHERS_OPTION)}
                            aria-label="Remove Others"
                          >
                            x
                          </button>
                          <input
                            className={styles.toolsPowerAddInput}
                            placeholder="Enter equipment"
                            value={newTask.customOnsiteEquipmentInput}
                            onChange={e => setNewTask(p => ({ ...p, customOnsiteEquipmentInput: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomOnsiteEquipment()
                              }
                            }}
                          />
                          <button type="button" className={styles.toolsPowerAddBtn} onClick={addCustomOnsiteEquipment}>Add</button>
                        </div>
                      )}

                      {newTask.customOnsiteEquipment.map(item => {
                        const selected = newTask.onsiteEquipment.includes(item)
                        return (
                          <button
                            key={item}
                            type="button"
                            className={styles.toolsPowerOption}
                            onClick={() => toggleOnsiteEquipmentSelection(item)}
                          >
                            <span className={`${styles.toolsPowerTick} ${selected ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                              {selected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            <span className={styles.toolsPowerOptionText}>{item}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.workStepLabelRow}>
                  <label className={styles.workStepLabel}>Control Measures<span className={styles.workStepRequired}>*</span></label>
                  <span className={styles.workStepMic}><MicIcon /></span>
                </div>
                <textarea
                  className={`${styles.workStepTextarea}${addTaskErrors.controls ? ` ${styles.workStepFieldError}` : ''}`}
                  rows={2}
                  maxLength={300}
                  placeholder="Enter control measures..."
                  value={newTask.controls}
                  onChange={e => { setNewTask(p => ({ ...p, controls: e.target.value })); if (e.target.value.trim()) setAddTaskErrors(p => ({ ...p, controls: false })) }}
                />
                {addTaskErrors.controls && <span className={styles.workStepErrorMsg}>Control Measures is required</span>}
                <span className={styles.workStepCount}>{newTask.controls.length}/300</span>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.workStepLabelRow}>
                  <label className={styles.workStepLabel}>Competent Person Initials</label>
                  <span className={styles.workStepMic}><MicIcon /></span>
                </div>
                <input
                  className={styles.workStepInput}
                  placeholder="Enter initials..."
                  value={newTask.initials}
                  onChange={e => setNewTask(p => ({ ...p, initials: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.workStepModalFooter}>
              <button className={styles.workStepCancelBtn} onClick={() => setShowAddTask(false)} type="button">
                Cancel
              </button>
              <button className={styles.workStepSaveBtn} onClick={addTask} type="button">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ EDIT TASK MODAL ════════ */}
      {editingTaskId !== null && (
        <div className={styles.workStepModalOverlay} onClick={() => setEditingTaskId(null)}>
          <div className={styles.workStepModal} onClick={e => e.stopPropagation()}>
            <div className={styles.workStepModalHeader}>
              <h3 className={styles.workStepModalTitle}>Edit Work Steps</h3>
              <button className={styles.workStepModalClose} onClick={() => setEditingTaskId(null)} type="button">x</button>
            </div>

            <div className={styles.workStepModalBody}>
              <div className={styles.formGroup}>
                <label className={styles.workStepLabel}>Hazards or Exposures</label>
                <div className={styles.hazardMultiSelect}>
                  <div
                    className={styles.hazardTrigger}
                    role="button"
                    tabIndex={0}
                    onClick={() => setEditTask(p => ({ ...p, hazardsOpen: !p.hazardsOpen }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setEditTask(p => ({ ...p, hazardsOpen: !p.hazardsOpen }))
                      }
                    }}
                  >
                    <div className={styles.hazardChipsWrap}>
                      {editTask.hazards.length === 0 ? (
                        <span className={styles.hazardPlaceholder}>Enter Hazards or exposures...</span>
                      ) : (
                        editTask.hazards.map(hazardId => {
                          const option = HAZARD_EXPOSURE_OPTIONS.find(o => o.id === hazardId)
                          if (!option) return null
                          return (
                            <span key={hazardId} className={styles.hazardChip}>
                              {option.chipLabel}
                              <button
                                type="button"
                                className={styles.hazardChipRemove}
                                onClick={e => { e.stopPropagation(); removeEditHazardSelection(hazardId) }}
                                aria-label={`Remove ${option.chipLabel}`}
                              >x</button>
                            </span>
                          )
                        })
                      )}
                    </div>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className={styles.hazardCaret}>
                      <path d="M2 4.2l3.5 3 3.5-3" stroke="#374151" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  {editTask.hazardsOpen && (
                    <div className={styles.hazardDropdownList}>
                      {HAZARD_EXPOSURE_OPTIONS.map(option => {
                        const selected = editTask.hazards.includes(option.id)
                        return (
                          <button key={option.id} type="button" className={styles.hazardOptionRow} onClick={() => toggleEditHazardSelection(option.id)}>
                            <span className={`${styles.hazardOptionTick} ${selected ? styles.hazardOptionTickSelected : ''}`} aria-hidden="true">
                              {selected && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                            </span>
                            <span className={styles.hazardOptionText}>{option.fullLabel}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.workStepLabelRow}>
                  <label className={styles.workStepLabel}>Work Steps<span className={styles.workStepRequired}>*</span></label>
                  <span className={styles.workStepMic}><MicIcon /></span>
                </div>
                <textarea
                  className={`${styles.workStepTextarea}${editTaskErrors.workSteps ? ` ${styles.workStepFieldError}` : ''}`}
                  rows={2}
                  maxLength={300}
                  placeholder="Enter Work Steps information..."
                  value={editTask.workSteps}
                  onChange={e => { setEditTask(p => ({ ...p, workSteps: e.target.value })); if (e.target.value.trim()) setEditTaskErrors(p => ({ ...p, workSteps: false })) }}
                />
                {editTaskErrors.workSteps && <span className={styles.workStepErrorMsg}>Work Steps is required</span>}
                <span className={styles.workStepCount}>{editTask.workSteps.length}/300</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.workStepLabel}>Tools/Power Tools</label>
                <div className={styles.toolsPowerMulti}>
                  <div
                    className={styles.toolsPowerTrigger}
                    role="button"
                    tabIndex={0}
                    onClick={() => setEditTask(p => ({ ...p, toolsPowerOpen: !p.toolsPowerOpen }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setEditTask(p => ({ ...p, toolsPowerOpen: !p.toolsPowerOpen }))
                      }
                    }}
                  >
                    <div className={styles.toolsPowerChipsWrap}>
                      {editTask.toolsPowerTools.filter(tool => tool !== TOOLS_POWER_OTHERS_OPTION).length === 0 ? (
                        <span className={styles.toolsPowerValue}>Select tools</span>
                      ) : (
                        editTask.toolsPowerTools
                          .filter(tool => tool !== TOOLS_POWER_OTHERS_OPTION)
                          .map(tool => (
                            <span key={tool} className={styles.toolsPowerChip}>
                              {tool}
                              <button type="button" className={styles.toolsPowerChipRemove}
                                onClick={e => { e.stopPropagation(); toggleEditPowerToolSelection(tool) }}
                                aria-label={`Remove ${tool}`}>x</button>
                            </span>
                          ))
                      )}
                    </div>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 4.2l3.5 3 3.5-3" stroke="#374151" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
                  </div>
                  {editTask.toolsPowerOpen && (
                    <div className={styles.toolsPowerDropdown}>
                      {TOOLS_POWER_BASE_OPTIONS.map(tool => {
                        const selected = editTask.toolsPowerTools.includes(tool)
                        return (
                          <button key={tool} type="button" className={styles.toolsPowerOption} onClick={() => toggleEditPowerToolSelection(tool)}>
                            <span className={`${styles.toolsPowerTick} ${selected ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                              {selected && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                            </span>
                            <span className={styles.toolsPowerOptionText}>{tool}</span>
                          </button>
                        )
                      })}
                      <div className={styles.toolsPowerDivider} />
                      <button type="button" className={styles.toolsPowerOption} onClick={() => toggleEditPowerToolSelection(TOOLS_POWER_OTHERS_OPTION)}>
                        <span className={`${styles.toolsPowerTick} ${editTask.toolsPowerTools.includes(TOOLS_POWER_OTHERS_OPTION) ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                          {editTask.toolsPowerTools.includes(TOOLS_POWER_OTHERS_OPTION) && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                        </span>
                        <span className={styles.toolsPowerOptionText}>{TOOLS_POWER_OTHERS_OPTION}</span>
                      </button>
                      {editTask.toolsPowerTools.includes(TOOLS_POWER_OTHERS_OPTION) && (
                        <div className={styles.toolsPowerAddRow}>
                          <button type="button" className={styles.toolsPowerRemoveOthers} onClick={() => toggleEditPowerToolSelection(TOOLS_POWER_OTHERS_OPTION)} aria-label="Remove Others">x</button>
                          <input
                            className={styles.toolsPowerAddInput}
                            placeholder="Enter tool"
                            value={editTask.customToolInput}
                            onChange={e => setEditTask(p => ({ ...p, customToolInput: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditCustomPowerTool() } }}
                          />
                          <button type="button" className={styles.toolsPowerAddBtn} onClick={addEditCustomPowerTool}>Add</button>
                        </div>
                      )}
                      {editTask.customTools.map(tool => {
                        const selected = editTask.toolsPowerTools.includes(tool)
                        return (
                          <button key={tool} type="button" className={styles.toolsPowerOption} onClick={() => toggleEditPowerToolSelection(tool)}>
                            <span className={`${styles.toolsPowerTick} ${selected ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                              {selected && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                            </span>
                            <span className={styles.toolsPowerOptionText}>{tool}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.workStepLabel}>Onsite Equipment <span className={styles.workStepHint}>(Ex: Scissor Lift)</span></label>
                <div className={styles.toolsPowerMulti}>
                  <div
                    className={styles.toolsPowerTrigger}
                    role="button"
                    tabIndex={0}
                    onClick={() => setEditTask(p => ({ ...p, onsiteEquipmentOpen: !p.onsiteEquipmentOpen }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setEditTask(p => ({ ...p, onsiteEquipmentOpen: !p.onsiteEquipmentOpen }))
                      }
                    }}
                  >
                    <div className={styles.toolsPowerChipsWrap}>
                      {editTask.onsiteEquipment.filter(item => item !== ONSITE_EQUIPMENT_OTHERS_OPTION).length === 0 ? (
                        <span className={styles.toolsPowerValue}>Select Equipment</span>
                      ) : (
                        editTask.onsiteEquipment
                          .filter(item => item !== ONSITE_EQUIPMENT_OTHERS_OPTION)
                          .map(item => (
                            <span key={item} className={styles.toolsPowerChip}>
                              {item}
                              <button type="button" className={styles.toolsPowerChipRemove}
                                onClick={e => { e.stopPropagation(); toggleEditOnsiteEquipmentSelection(item) }}
                                aria-label={`Remove ${item}`}>x</button>
                            </span>
                          ))
                      )}
                    </div>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 4.2l3.5 3 3.5-3" stroke="#374151" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
                  </div>
                  {editTask.onsiteEquipmentOpen && (
                    <div className={styles.toolsPowerDropdown}>
                      {ONSITE_EQUIPMENT_BASE_OPTIONS.map(item => {
                        const selected = editTask.onsiteEquipment.includes(item)
                        return (
                          <button key={item} type="button" className={styles.toolsPowerOption} onClick={() => toggleEditOnsiteEquipmentSelection(item)}>
                            <span className={`${styles.toolsPowerTick} ${selected ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                              {selected && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                            </span>
                            <span className={styles.toolsPowerOptionText}>{item}</span>
                          </button>
                        )
                      })}
                      <div className={styles.toolsPowerDivider} />
                      <button type="button" className={styles.toolsPowerOption} onClick={() => toggleEditOnsiteEquipmentSelection(ONSITE_EQUIPMENT_OTHERS_OPTION)}>
                        <span className={`${styles.toolsPowerTick} ${editTask.onsiteEquipment.includes(ONSITE_EQUIPMENT_OTHERS_OPTION) ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                          {editTask.onsiteEquipment.includes(ONSITE_EQUIPMENT_OTHERS_OPTION) && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                        </span>
                        <span className={styles.toolsPowerOptionText}>{ONSITE_EQUIPMENT_OTHERS_OPTION}</span>
                      </button>
                      {editTask.onsiteEquipment.includes(ONSITE_EQUIPMENT_OTHERS_OPTION) && (
                        <div className={styles.toolsPowerAddRow}>
                          <button type="button" className={styles.toolsPowerRemoveOthers} onClick={() => toggleEditOnsiteEquipmentSelection(ONSITE_EQUIPMENT_OTHERS_OPTION)} aria-label="Remove Others">x</button>
                          <input
                            className={styles.toolsPowerAddInput}
                            placeholder="Enter equipment"
                            value={editTask.customOnsiteEquipmentInput}
                            onChange={e => setEditTask(p => ({ ...p, customOnsiteEquipmentInput: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditCustomOnsiteEquipment() } }}
                          />
                          <button type="button" className={styles.toolsPowerAddBtn} onClick={addEditCustomOnsiteEquipment}>Add</button>
                        </div>
                      )}
                      {editTask.customOnsiteEquipment.map(item => {
                        const selected = editTask.onsiteEquipment.includes(item)
                        return (
                          <button key={item} type="button" className={styles.toolsPowerOption} onClick={() => toggleEditOnsiteEquipmentSelection(item)}>
                            <span className={`${styles.toolsPowerTick} ${selected ? styles.toolsPowerTickSelected : ''}`} aria-hidden="true">
                              {selected && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                            </span>
                            <span className={styles.toolsPowerOptionText}>{item}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.workStepLabelRow}>
                  <label className={styles.workStepLabel}>Control Measures<span className={styles.workStepRequired}>*</span></label>
                  <span className={styles.workStepMic}><MicIcon /></span>
                </div>
                <textarea
                  className={`${styles.workStepTextarea}${editTaskErrors.controls ? ` ${styles.workStepFieldError}` : ''}`}
                  rows={2}
                  maxLength={300}
                  placeholder="Enter control measures..."
                  value={editTask.controls}
                  onChange={e => { setEditTask(p => ({ ...p, controls: e.target.value })); if (e.target.value.trim()) setEditTaskErrors(p => ({ ...p, controls: false })) }}
                />
                {editTaskErrors.controls && <span className={styles.workStepErrorMsg}>Control Measures is required</span>}
                <span className={styles.workStepCount}>{editTask.controls.length}/300</span>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.workStepLabelRow}>
                  <label className={styles.workStepLabel}>Competent Person Initials</label>
                  <span className={styles.workStepMic}><MicIcon /></span>
                </div>
                <input
                  className={styles.workStepInput}
                  placeholder="Enter initials..."
                  value={editTask.initials}
                  onChange={e => setEditTask(p => ({ ...p, initials: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.workStepModalFooter}>
              <button className={styles.workStepCancelBtn} onClick={() => setEditingTaskId(null)} type="button">
                Cancel
              </button>
              <button className={styles.workStepSaveBtn} onClick={saveEditTask} type="button">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ SIGN IN MODAL ════════ */}
      {signInModal && (
        <div className={styles.modalOverlay} onClick={closeSignInModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Sign In</h3>
              <button className={styles.modalClose} type="button" onClick={closeSignInModal}>x</button>
            </div>
            {signInError && (
              <div className={styles.signInErrorToast} role="alert" aria-live="polite">
                <span className={styles.signInErrorAccent} aria-hidden="true" />
                <span className={styles.signInErrorIcon} aria-hidden="true">!</span>
                <span className={styles.signInErrorText}>{signInError}</span>
                <button
                  className={styles.signInErrorClose}
                  type="button"
                  onClick={() => setSignInError(null)}
                  aria-label="Close signature warning"
                >
                  ×
                </button>
              </div>
            )}
            <div className={`${styles.modalBody}${signInError ? ` ${styles.modalBodyWithSignInError}` : ''}`}>
              <div className={styles.formGroup}>
                <div className={styles.signInCommentLabelRow}>
                  <label className={styles.formLabel}>Enter Comments</label>
                  <button className={styles.signInMicBtn} type="button" aria-label="Voice input">
                    <MicIcon />
                  </button>
                </div>
                <textarea className={styles.signInTextarea} rows={3} placeholder="Enter your comments here.."
                  maxLength={200}
                  value={signCommentDraft} onChange={e => setSignCommentDraft(e.target.value)} />
                <span className={styles.commentCount}>{signCommentDraft.length}/200</span>
              </div>
              <p className={styles.signInSignatureTitle}>Signature</p>
              <SigPad
                personName={crew.find(m => m.id === signInModal)?.name ?? ''}
                companyName="--"
                date={new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                variant="signin"
                initialSignature={signSignatureDraft}
                onSignatureChange={(dataUrl) => {
                  setSignSignatureDraft(dataUrl)
                  if (dataUrl && signInError) setSignInError(null)
                }}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.signInCancelBtn} type="button" onClick={closeSignInModal}>Cancel</button>
              <button className={styles.signInConfirmBtn} type="button" onClick={signInMember}>Sign In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PTPWorkflowPage
