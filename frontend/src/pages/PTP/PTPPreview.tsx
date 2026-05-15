import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ptpWorkflowService, { PtpWorkflowRecord } from '@/services/ptpWorkflow.service'
import useRole from '@/hooks/useRole'
import styles from './PTPPreview.module.css'

/* ── Activity & Control categories (mirrors PTPWorkflow.tsx) ── */
interface ActivityCategory { key: string; name: string; items: string[]; hasDistanceField?: boolean }
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
  { key: 'working-chemicals', name: 'Working with Chemicals', items: ['Exposure Monitoring Req.', 'Have Proper Containers w/ Labels', 'Identified Proper PPE', "Reviewed & Made SDS' Readily Available"] },
]

interface PpeCategory { name: string; items: string[] }
const PPE_CATEGORIES: PpeCategory[] = [
  { name: 'Hand Protection', items: ['Cut Resistant Gloves', 'Welder Gloves', 'Nitrile Gloves', 'Rubber Gloves', 'Elect. Insulated Glov', 'Cut-Resistant Arm Sleeves'] },
  { name: 'Head Protection', items: ['Hard Hat', 'Ear Plugs / Muffs'] },
  { name: 'Foot Protection', items: ['Sturdy Work Boots', 'Safety Toe Boot', 'Rubber Boots', 'Dielectric Footwear'] },
  { name: 'Respiratory Protection', items: ['Dust Mask', 'Air Purifying Resp.', 'Supplied Air Resp.', 'SCBA', 'Emerg. Escape'] },
  { name: 'Fall Protection System', items: ['Harness', 'Needed (i.e. Cross arm strap, etc .)', 'Double Lanyard Required', 'Fall Clearance Distance Adequate', 'Anchorage Point Avail.', 'Additional Anchorage Connection'] },
  { name: 'Eye Protection', items: ['Safety Glasses', 'Face Shield', 'Chemical Goggles', 'Welding Hood'] },
  { name: 'Special Clothing', items: ['Coveralls', 'Tyvek Disposable Suits', 'Proper Safety Vest (for Task)', 'Rain Suit', 'Shoe Coverings'] },
]


/* ── Helpers ── */
const formatDateTime = (value?: string | null): string => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    in_progress: 'In Progress', draft: 'In Progress',
    submitted: 'Submitted', reviewed: 'Reviewed',
    changes_requested: 'Flagged for Changes', closed: 'Closed',
  }
  return map[status] ?? status
}

const statusClass = (status: string): string => {
  const map: Record<string, string> = {
    in_progress: styles.statusInProgress, draft: styles.statusInProgress,
    submitted: styles.statusSubmitted, reviewed: styles.statusReviewed,
    changes_requested: styles.statusFlagged, closed: styles.statusClosed,
  }
  return map[status] ?? ''
}

/* ── Check icon ── */
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.checkIcon}>
    <path d="M2 6l3 3 5-5" stroke="#27ae60" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Category icon SVG (proper icons by category) ── */
const CatIcon: React.FC<{ categoryKey: string }> = ({ categoryKey }) => {
  const iconMap: Record<string, JSX.Element> = {
    'adjacent-work': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <circle cx="9" cy="10" r="2.5" fill="white"/>
        <circle cx="19" cy="10" r="2.5" fill="white"/>
        <path d="M11 13l-1.5 4M17 13l1.5 4M14 16v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    'asbestos': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 6v4M14 18v4M10 14h4M14 14h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="14" r="3" fill="none" stroke="white" strokeWidth="1.4"/>
      </svg>
    ),
    'barricades': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <rect x="7" y="10" width="2" height="10" fill="white"/>
        <rect x="11" y="8" width="2" height="12" fill="white"/>
        <rect x="15" y="10" width="2" height="10" fill="white"/>
        <rect x="19" y="8" width="2" height="12" fill="white"/>
      </svg>
    ),
    'crane-lifting': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 6v12M10 18h8M12 18l-1 3M16 18l1 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'electrical': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 7v5l3-2.5L14 12v7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="14" r="4" fill="none" stroke="white" strokeWidth="1.2"/>
      </svg>
    ),
    'environmental': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 8c0 3-2 5-3 6s-2 3-2 4c0 2 2 4 5 4s5-2 5-4c0-1-1-3-2-4s-3-3-3-6" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="14" cy="22" r="1" fill="white"/>
      </svg>
    ),
    'excavations': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M8 18h12v2H8zM10 18v-6M14 18v-8M18 18v-5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    'fire-hazard': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 22c-2 0-3-1-3-3 0-2 1-3 3-5 2 2 3 3 3 5 0 2-1 3-3 3Z" fill="white"/>
        <path d="M14 10c-1-1-2-3-2-4 0-2 1-3 2-3s2 1 2 3c0 1-1 3-2 4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    'hand-power-tools': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M8 16h8v6H8zM16 14l2-2 3 3-2 2zM10 14v-3M14 14v-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'hand-hazards': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 8v10M10 12v6M14 8v10M18 12v6M12 18h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'heat-stress': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 8v4M10 10l-2-2M18 10l2-2M14 18c2 0 3-1 3-3s-1-3-3-3-3 1-3 3 1 3 3 3" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    'housekeeping': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M9 16h10v6H9zM14 10l-4 6h8z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'ladders': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <line x1="10" y1="8" x2="10" y2="20" stroke="white" strokeWidth="1.4"/>
        <line x1="18" y1="8" x2="18" y2="20" stroke="white" strokeWidth="1.4"/>
        <line x1="10" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.2"/>
        <line x1="10" y1="14" x2="18" y2="14" stroke="white" strokeWidth="1.2"/>
        <line x1="10" y1="18" x2="18" y2="18" stroke="white" strokeWidth="1.2"/>
      </svg>
    ),
    'manual-lifting': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 8v10M11 12l-2 4M17 12l2 4M14 8c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'natural-hazards': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M14 9c2 0 3 2 3 4s-1 4-3 5-3-2-3-4 1-5 3-5Z" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="11" cy="12" r="1" fill="white"/>
        <circle cx="17" cy="12" r="1" fill="white"/>
      </svg>
    ),
    'noise': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M12 16v-4c0-1 1-2 2-2s2 1 2 2v4M10 18h8M14 8v2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 18c1-2 2-4 2-6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M20 18c-1-2-2-4-2-6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    'overhead-utilities': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <line x1="6" y1="10" x2="22" y2="10" stroke="white" strokeWidth="1.4"/>
        <circle cx="10" cy="10" r="1.5" fill="white"/>
        <circle cx="14" cy="10" r="1.5" fill="white"/>
        <circle cx="18" cy="10" r="1.5" fill="white"/>
        <path d="M8 10v8M14 10v8M20 10v8" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    'underground-utilities': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M6 14h16M10 10v8M14 9v10M18 10v8" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="3" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="1 1"/>
      </svg>
    ),
    'vehicular-traffic': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <rect x="8" y="12" width="6" height="8" rx="1" stroke="white" strokeWidth="1.2"/>
        <circle cx="10" cy="20" r="1" fill="white"/>
        <circle cx="14" cy="20" r="1" fill="white"/>
        <path d="M16 18l3-4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    'working-chemicals': (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#E35205"/>
        <path d="M12 18v2M16 18v2M12 20h4M13 8v8h2V8Z" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="6" r="1" fill="white"/>
      </svg>
    ),
  }

  const icon = iconMap[categoryKey]
  return <span className={styles.catIconWrap} aria-hidden="true">{icon || iconMap['housekeeping']}</span>
}

/* ── Signature display ── */
const SignatureBlock: React.FC<{
  label: string
  signatureData?: string
  name?: string
  company?: string
  date?: string
  comment?: string
}> = ({ label, signatureData, name, company, date, comment }) => (
  <div className={styles.signatureSection}>
    <h4 className={styles.signatureSectionTitle}>{label}</h4>
    {comment !== undefined && (
      <div className={styles.commentBlock}>
        <div className={styles.commentLabel}>Comment's</div>
        <div className={styles.commentText}>{comment || <span className={styles.emptyValue}>—</span>}</div>
      </div>
    )}
    <div className={styles.signatureCard}>
      <div className={styles.signatureImageWrap}>
        {signatureData ? (
          <img src={signatureData} alt={`${label} signature`} className={styles.signatureImage} />
        ) : (
          <span className={styles.noSignature}>No signature</span>
        )}
      </div>
      <div className={styles.signatureMeta}>
        <div className={styles.signatureMetaBlock}>
          <span className={styles.signatureMetaLabel}>Company</span>
          <span className={styles.signatureMetaValue}>{company || '-'}</span>
        </div>
        <div className={styles.signatureMetaRow}>
          {name && (
            <div>
              <span className={styles.signatureMetaLabel}>Name</span>
              <span className={styles.signatureMetaValue}>{name}</span>
            </div>
          )}
          {date && (
            <div>
              <span className={styles.signatureMetaLabel}>Date</span>
              <span className={styles.signatureMetaValue}>{date}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)

/* ── Inline signature pad (canvas-based) ── */
interface SigPadInlineProps {
  initialSignature?: string
  onSignatureChange: (dataUrl: string) => void
  hasError?: boolean
}
const SigPadInline: React.FC<SigPadInlineProps> = ({ initialSignature, onSignatureChange, hasError = false }) => {
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
    const canvas = canvasRef.current; if (!canvas) return
    setDrawing(true); didDrawRef.current = false
    const ctx = canvas.getContext('2d')
    if (ctx) { const { x, y } = getPos(e, canvas); ctx.beginPath(); ctx.moveTo(x, y) }
  }
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const { x, y } = getPos(e, canvas)
      ctx.lineTo(x, y); ctx.strokeStyle = '#333333'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke()
      didDrawRef.current = true
    }
  }
  const stop = () => {
    setDrawing(false)
    if (didDrawRef.current) {
      setHasSignature(true)
      const canvas = canvasRef.current; if (!canvas) return
      onSignatureChange(canvas.toDataURL('image/png'))
    }
  }
  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    didDrawRef.current = false
    setHasSignature(false); onSignatureChange('')
  }

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!initialSignature) { setHasSignature(false); return }
    setHasSignature(true)
    const img = new Image()
    img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height) }
    img.src = initialSignature
  }, [initialSignature])

  return (
    <div className={`${styles.inlineSigPadWrap} ${hasError ? styles.inlineSigPadError : ''}`}>
      <button className={styles.inlineSigClearBtn} onClick={clear} type="button" aria-label="Clear signature">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
        </svg>
      </button>
      {!hasSignature && <span className={styles.inlineSigPlaceholder}>Sign here</span>}
      <canvas
        ref={canvasRef} width={360} height={100}
        className={styles.inlineSigCanvas}
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        style={{ touchAction: 'none' }}
      />
      <div className={styles.inlineSigLine} />
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const PTPPreviewPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ptpId = searchParams.get('ptpId')

  const { isSuperintendent } = useRole()

  const [record, setRecord] = useState<PtpWorkflowRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [reviewValidationError, setReviewValidationError] = useState<string | null>(null)
  const [flagValidationError, setFlagValidationError] = useState<string | null>(null)
  const [showFlagConfirm, setShowFlagConfirm] = useState(false)
  const [showFlagSuccess, setShowFlagSuccess] = useState(false)

  // Superintendent interactive review state
  const [supervisorComment, setSupervisorComment] = useState<string>('')
  const [supervisorSignature, setSupervisorSignature] = useState<string>('')
  const [commentError, setCommentError] = useState<string | null>(null)

  useEffect(() => {
    if (!ptpId) { setError('No PTP ID provided'); setLoading(false); return }
    ptpWorkflowService.getWorkflow(ptpId)
      .then(r => {
        setRecord(r)
        setLoading(false)
        // Pre-populate superintendent fields from saved data
        const rev = r.review_json as any ?? {}
        setSupervisorComment(rev.supervisorComment ?? '')
        setSupervisorSignature(rev.supervisorSignature ?? '')
      })
      .catch(() => { setError('Failed to load PTP data'); setLoading(false) })
  }, [ptpId])

  const handleFlagForChange = async () => {
    if (!record || isSaving) return
    // Validate: comment is required for flagging
    if (!supervisorComment.trim()) {
      setCommentError('Comment is required.')
      setFlagValidationError(null)
      return
    }
    setCommentError(null)
    // Validate: signature is required for flagging
    if (!supervisorSignature || !supervisorSignature.trim()) {
      setFlagValidationError('Please provide your signature before proceeding.')
      return
    }
    setFlagValidationError(null)
    // All validations passed, show confirmation modal
    setShowFlagConfirm(true)
  }

  const handleFlagConfirm = async () => {
    if (!record || isSaving) return
    try {
      setIsSaving(true)
      const payload = {
        ...(record.review_json ?? {}),
        supervisorComment,
        supervisorSignature,
        flaggedForChange: true,
        flaggedAt: new Date().toISOString(),
      }
      await ptpWorkflowService.saveStep(record.ptp_id, 'ptp-review', payload, record.status as any, record.updated_by ?? undefined)
      setShowFlagConfirm(false)
      setShowFlagSuccess(true)
      setIsSaving(false)
    } catch {
      setIsSaving(false)
      setShowFlagConfirm(false)
    }
  }

  const handleFlagCancel = () => {
    setShowFlagConfirm(false)
  }

  const handleFlagSuccessOk = () => {
    setShowFlagSuccess(false)
    navigate('/dashboard')
  }

  const handleReview = async () => {
    // Role guard: only superintendents may mark as reviewed
    if (!isSuperintendent) return
    if (!record || isSaving) return

    if (!supervisorSignature.trim()) {
      setReviewValidationError('Please provide your signature before proceeding.')
      return
    }

    try {
      setIsSaving(true)
      setReviewValidationError(null)
      const payload = { ...(record.review_json ?? {}), supervisorComment, supervisorSignature, flaggedForChange: false }
      await ptpWorkflowService.saveStep(record.ptp_id, 'ptp-review', payload, 'reviewed', record.updated_by ?? undefined)
      navigate('/dashboard')
    } catch {
      setIsSaving(false)
    }
  }

  if (loading) return (
    <div className={styles.previewPage}>
      <div className={styles.loadingState}>Loading PTP data…</div>
    </div>
  )

  if (error || !record) return (
    <div className={styles.previewPage}>
      <div className={styles.errorState}>{error ?? 'PTP not found'}</div>
    </div>
  )

  /* ── Destructure JSON payloads ── */
  const tasks: any[] = record.tasks_json?.tasks ?? []
  const ptpProject: string = record.tasks_json?.project ?? ''
  const ptpName: string = record.tasks_json?.ptpName ?? record.title ?? ''

  const actCtrl: any = record.activity_controls_json ?? {}
  const acItems: Record<string, boolean> = actCtrl.items ?? {}
  const acToggles: Record<string, boolean> = actCtrl.toggles ?? {}
  const acDistances: Record<string, string> = actCtrl.distances ?? {}

  const reqs: any = record.requirements_json ?? {}
  const permits: Record<string, boolean> = reqs.permits ?? {}
  const checklists: Record<string, boolean> = reqs.checklists ?? {}
  const ppeItems: Record<string, boolean> = reqs.ppeItems ?? {}

  const emergency: any = record.emergency_contacts_json ?? {}
  const crew: any[] = Array.isArray(record.crew_signin_json) ? record.crew_signin_json : []

  const review: any = record.review_json ?? {}
  const closure: any = record.day_closure_json ?? {}

  /* ── Active activity categories (has at least one item selected) ── */
  /* ── Active activity categories — data-driven from stored acItems ── */
  // PTPWorkflow may use template-generated category keys that differ from the static list.
  // Reconstruct categories directly from the saved data so nothing gets dropped.
  const activeCategories: Array<{ key: string; name: string; items: string[]; hasDistanceField?: boolean }> = (() => {
    const grouped: Record<string, string[]> = {}
    Object.entries(acItems).forEach(([rawKey, checked]) => {
      if (!Boolean(checked)) return
      const sepIdx = rawKey.indexOf('::')
      if (sepIdx === -1) return
      const catKey = rawKey.substring(0, sepIdx)
      const item = rawKey.substring(sepIdx + 2)
      if (!item) return
      if (!grouped[catKey]) grouped[catKey] = []
      grouped[catKey].push(item)
    })
    return Object.entries(grouped)
      .filter(([catKey]) => acToggles[catKey] !== true) // exclude N/A categories
      .map(([catKey, items]) => {
        const staticCat = ACTIVITY_CATEGORIES.find(c => c.key === catKey)
        return {
          key: catKey,
          name: staticCat?.name ?? catKey,
          items,
          hasDistanceField: staticCat?.hasDistanceField ?? false,
        }
      })
  })()

  /* ── Selected permits / checklists ── */
  const selectedPermits = Object.entries(permits).filter(([, checked]) => Boolean(checked)).map(([name]) => name)
  const selectedChecklists = Object.entries(checklists).filter(([, checked]) => Boolean(checked)).map(([name]) => name)

  /* ── Selected PPE by category — data-driven ── */
  // Items are stored as { [itemName]: true } (no category prefix).
  // Group by static PPE_CATEGORIES; items not found in any category go to "Other".
  const activePpeCategories: Array<{ name: string; selected: string[] }> = (() => {
    const allSelected = Object.entries(ppeItems)
      .filter(([, checked]) => Boolean(checked))
      .map(([name]) => name)
    const assigned = new Set<string>()
    const categorized = PPE_CATEGORIES.map(cat => ({
      name: cat.name,
      selected: cat.items.filter(item => {
        const found =
          ppeItems[`${cat.name}::${item}`] === true ||
          ppeItems[item] === true
        if (found) assigned.add(item)
        return found
      }),
    })).filter(cat => cat.selected.length > 0)
    const others = allSelected.filter(item => !assigned.has(item))
    if (others.length > 0) categorized.push({ name: 'Other', selected: others })
    return categorized
  })()

  return (
    <div className={styles.previewPage}>
      {/* ── Header: title row with close button ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>PTP Review</h1>
        <button
          className={styles.closeBtn}
          onClick={() => navigate('/dashboard')}
          aria-label="Close preview"
        >
          <svg width="30" height="30" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#E35205"/>
            <path d="M7 7l6 6M13 7l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Meta info grid ── */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Task &amp; Jobs</span>
          <span className={styles.metaValue}>{ptpName || '-'}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Project Name</span>
          <span className={styles.metaValue}>{ptpProject || '-'}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Status</span>
          <span className={`${styles.metaValue} ${statusClass(record.status)}`}>{statusLabel(record.status)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Created By</span>
          <span className={styles.metaValue}>{record.created_by || '-'}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Company</span>
          <span className={styles.metaValue}>{review.company || closure.company || '-'}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Submitted On</span>
          <span className={styles.metaValue}>{formatDateTime(record.updated_at)}</span>
        </div>
      </div>

      <div className={styles.metaDivider} />

      {commentError && (
        <div className={styles.reviewErrorToast} role="alert" aria-live="polite">
          <span className={styles.reviewErrorAccent} />
          <span className={styles.reviewErrorIcon}>!</span>
          <span className={styles.reviewErrorText}>{commentError}</span>
          <button type="button" className={styles.reviewErrorClose} onClick={() => setCommentError(null)} aria-label="Close">
            x
          </button>
        </div>
      )}

      {reviewValidationError && (
        <div className={styles.reviewErrorToast} role="alert" aria-live="polite">
          <span className={styles.reviewErrorAccent} />
          <span className={styles.reviewErrorIcon}>!</span>
          <span className={styles.reviewErrorText}>{reviewValidationError}</span>
          <button type="button" className={styles.reviewErrorClose} onClick={() => setReviewValidationError(null)} aria-label="Close">
            x
          </button>
        </div>
      )}

      {flagValidationError && (
        <div className={styles.reviewErrorToast} role="alert" aria-live="polite">
          <span className={styles.reviewErrorAccent} />
          <span className={styles.reviewErrorIcon}>!</span>
          <span className={styles.reviewErrorText}>{flagValidationError}</span>
          <button type="button" className={styles.reviewErrorClose} onClick={() => setFlagValidationError(null)} aria-label="Close">
            x
          </button>
        </div>
      )}

      {/* ── Scrollable body ── */}
      <div className={styles.previewBody}>

        {/* ════ SECTION 1: Hazards & Control Measures ════ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hazards &amp; Control Measures</h2>
          {activeCategories.length === 0 ? (
            <p className={styles.emptySection}>No activity controls selected.</p>
          ) : (
            <div className={styles.categoryList}>
              {activeCategories.map(cat => {
                const selectedItems = cat.items.filter(item => acItems[`${cat.key}::${item}`] === true)
                const distance = acDistances[cat.key]
                return (
                  <div className={styles.categoryBlock} key={cat.key}>
                    <div className={styles.categoryHeader}>
                      <CatIcon categoryKey={cat.key} />
                      <span className={styles.categoryName}>{cat.name}</span>
                    </div>
                    <div className={styles.itemGrid}>
                      {selectedItems.map(item => (
                        <div key={item} className={styles.itemRow}>
                          <CheckIcon />
                          <span className={styles.itemLabel}>{item}</span>
                        </div>
                      ))}
                    </div>
                    {cat.hasDistanceField && distance && (
                      <div className={styles.distanceRow}>
                        <span className={styles.distanceLabel}>Distance:</span>
                        <span className={styles.distanceValue}>{distance} ft</span>
                      </div>
                    )}
                    <div className={styles.categoryDivider} />
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ════ SECTION 2: Permits & Checklists ════ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Permits &amp; Check Lists</h2>

          {/* Critical Hazards Permits */}
          {selectedPermits.length > 0 && (
            <div className={styles.categoryBlock}>
              <div className={styles.categoryHeader}>
                <CatIcon categoryKey="fire-hazard" />
                <span className={styles.categoryName}>Critical Hazards Permits</span>
                <button className={styles.viewAttachmentsBtn} type="button">View Attachments</button>
              </div>
              <div className={styles.itemGrid}>
                {selectedPermits.map(p => (
                  <div key={p} className={styles.itemRow}>
                    <CheckIcon />
                    <span className={styles.itemLabel}>{p}</span>
                  </div>
                ))}
              </div>
              <div className={styles.categoryDivider} />
            </div>
          )}

          {/* Required Checklists */}
          {selectedChecklists.length > 0 && (
            <div className={styles.categoryBlock}>
              <div className={styles.categoryHeader}>
                <CatIcon categoryKey="housekeeping" />
                <span className={styles.categoryName}>Required Checklists</span>
              </div>
              <div className={styles.itemGrid}>
                {selectedChecklists.map(c => (
                  <div key={c} className={styles.itemRow}>
                    <CheckIcon />
                    <span className={styles.itemLabel}>{c}</span>
                  </div>
                ))}
              </div>
              <div className={styles.categoryDivider} />
            </div>
          )}

          {/* Required PPE */}
          {activePpeCategories.length > 0 && (
            <div className={styles.categoryBlock}>
              <div className={styles.categoryHeader}>
                <CatIcon categoryKey="hand-hazards" />
                <span className={styles.categoryName}>Required PPE</span>
              </div>
              {activePpeCategories.map(cat => (
                <div key={cat.name}>
                  <div className={styles.ppeSubLabel}>{cat.name}</div>
                  <div className={styles.itemGrid}>
                    {cat.selected.map(item => (
                      <div key={item} className={styles.itemRow}>
                        <CheckIcon />
                        <span className={styles.itemLabel}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className={styles.categoryDivider} />
            </div>
          )}

          {selectedPermits.length === 0 && selectedChecklists.length === 0 && activePpeCategories.length === 0 && (
            <p className={styles.emptySection}>No permits, checklists, or PPE selected.</p>
          )}
        </section>

        {/* ════ SECTION 3: Work Steps ════ */}
        <section className={styles.workStepsSection}>
          <h2 className={styles.workStepsSectionTitle}>Work Steps</h2>
          {tasks.length === 0 ? (
            <p className={styles.emptySection}>No work steps defined.</p>
          ) : (
            tasks.map((task: any, idx: number) => (
              <div className={styles.workStepCard} key={task.id ?? idx}>
                <div className={styles.workStepHeader}>Work Steps {idx + 1}</div>
                <div className={styles.workStepName}>{task.name || '-'}</div>

                {task.activityExposures && (
                  <div className={styles.workStepField}>
                    <span className={styles.workStepFieldLabel}>Hazards or Exposures</span>
                    <span className={styles.workStepFieldValue}>{task.activityExposures}</span>
                  </div>
                )}

                {Array.isArray(task.toolsEquipment) && task.toolsEquipment.length > 0 && (
                  <div className={styles.workStepField}>
                    <span className={styles.workStepFieldLabel}>Tools/Power Tools</span>
                    <span className={styles.workStepFieldValue}>{task.toolsEquipment.join(', ')}</span>
                  </div>
                )}

                {Array.isArray(task.onsiteEquipment) && task.onsiteEquipment.length > 0 && (
                  <div className={styles.workStepField}>
                    <span className={styles.workStepFieldLabel}>On-Site Equipment</span>
                    <span className={styles.workStepFieldValue}>{task.onsiteEquipment.join(', ')}</span>
                  </div>
                )}

                {task.controlMeasures && (
                  <div className={styles.workStepField}>
                    <span className={styles.workStepFieldLabel}>Control Measures</span>
                    <span className={styles.workStepFieldValue}>{task.controlMeasures}</span>
                  </div>
                )}

                {task.competentInitials && (
                  <div className={styles.workStepField}>
                    <span className={styles.workStepFieldLabel}>Competent Person Initials</span>
                    <span className={styles.workStepFieldValue}>{task.competentInitials}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        {/* ════ SECTION 4: Emergency Contacts ════ */}
        <section className={styles.emergencySection}>
          <h2 className={styles.emergencySectionTitle}>Emergency Contacts</h2>
          <div className={styles.emergencyCard}>
            <div className={styles.emergencyPlanRow}>
              <span className={styles.emergencyPlanText}>Emergency Action Plan discussed before start of work?</span>
              <span className={`${styles.toggleIndicator} ${emergency.emergencyPlanDiscussed ? styles.toggleOn : styles.toggleOff}`}>
                {emergency.emergencyPlanDiscussed ? '●' : '○'}
              </span>
            </div>
            <div className={styles.emergencyContactGrid}>
              <div className={styles.emergencyContactItem}>
                <span className={styles.emergencyContactLabel}>Safety Professional</span>
                <span className={styles.emergencyContactValue}>{emergency.safetyContact || '-'}</span>
              </div>
              <div className={styles.emergencyContactItem}>
                <span className={styles.emergencyContactLabel}>Superintendent</span>
                <span className={styles.emergencyContactValue}>{emergency.superintendentContact || '-'}</span>
              </div>
              <div className={styles.emergencyContactItem}>
                <span className={styles.emergencyContactLabel}>Muster Location</span>
                <span className={styles.emergencyContactValue}>{emergency.musterArea || '-'}</span>
              </div>
              <div className={styles.emergencyContactItem}>
                <span className={styles.emergencyContactLabel}>Other</span>
                <span className={styles.emergencyContactValue}>{emergency.otherContact || '-'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ════ SECTION 5: Crew Sign In ════ */}
        <section className={styles.crewSection}>
          <h2 className={styles.crewSectionTitle}>Crew Sign In</h2>
          {crew.length === 0 ? (
            <p className={styles.emptySection}>No crew members signed in.</p>
          ) : (
            <div className={styles.crewTable}>
              <div className={styles.crewTableHeader}>
                <span>No.</span>
                <span>Member Names</span>
                <span>Sign in</span>
                <span>Comment's</span>
              </div>
              {crew.map((member: any, idx: number) => (
                <div className={styles.crewTableRow} key={member.id ?? idx}>
                  <span className={styles.crewRowNum}>{idx + 1}</span>
                  <span className={styles.crewRowName}>
                    <span className={styles.crewAvatar} style={{ background: member.avatarColor ?? '#E35205' }}>
                      {(member.initials || (member.name || 'C').charAt(0).toUpperCase())}
                    </span>
                    <span>{member.name}</span>
                  </span>
                  <span className={styles.crewRowSignin}>
                    {member.signedIn ? (
                      <><CheckIcon /><span className={styles.signedInText}>Signed in</span></>
                    ) : (
                      <span className={styles.notSignedInText}>Not signed in</span>
                    )}
                  </span>
                  <span className={styles.crewRowComment}>
                    {member.comment ? (
                      <span title={member.comment}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="3" width="14" height="10" rx="2" stroke="#4F758B" strokeWidth="1.4" fill="none"/>
                          <path d="M5 7h8M5 10h5" stroke="#4F758B" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </span>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="3" width="14" height="10" rx="2" stroke="#b0b8c1" strokeWidth="1.4" fill="none"/>
                        <path d="M5 7h8M5 10h5" stroke="#b0b8c1" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ════ SECTION 6: Foreman Signature (from PTP Review step) ════ */}
        {(review.foremanSignature || review.foremanComment !== undefined) && (
          <SignatureBlock
            label="Foreman Signature"
            signatureData={review.foremanSignature}
            name={review.foremanName || record.created_by || undefined}
            company={review.company || record.created_by || '-'}
            date={review.foremanDate ? formatDateTime(review.foremanDate) : formatDateTime(record.updated_at)}
            comment={review.foremanComment}
          />
        )}

        {/* ════ SECTION 7: PTP Review (supervisor) ════ */}
        <section className={styles.ptpReviewSection}>
          <h2 className={styles.ptpReviewTitle}>PTP Review</h2>

          {/* Comments field — editable for Superintendent, read-only otherwise */}
          <div className={styles.commentBlock}>
            <div className={styles.commentLabel}>Enter Comments</div>
            {isSuperintendent ? (
              <>
                <textarea
                  className={`${styles.supervisorCommentInput}${commentError ? ` ${styles.supervisorCommentInputError}` : ''}`}
                  value={supervisorComment}
                  onChange={e => { setSupervisorComment(e.target.value); if (e.target.value.trim()) setCommentError(null) }}
                  placeholder="Enter Text"
                  rows={3}
                />
                {commentError && <div className={styles.commentErrorMsg}>{commentError}</div>}
              </>
            ) : (
              <div className={styles.commentText}>{supervisorComment || <span className={styles.emptyValue}>—</span>}</div>
            )}
          </div>

          {/* Signature — interactive canvas for Superintendent, static image otherwise */}
          {isSuperintendent ? (
            <div className={`${styles.signatureCard} ${reviewValidationError ? styles.signatureCardError : ''}`}>
              <SigPadInline
                initialSignature={supervisorSignature || undefined}
                onSignatureChange={setSupervisorSignature}
                hasError={!!reviewValidationError}
              />
              <div className={styles.signatureMeta}>
                <div className={styles.signatureMetaBlock}>
                  <span className={styles.signatureMetaLabel}>Company</span>
                  <span className={styles.signatureMetaValue}>{review.company || record.updated_by || '-'}</span>
                </div>
                <div className={styles.signatureMetaRow}>
                  <div>
                    <span className={styles.signatureMetaLabel}>Name</span>
                    <span className={styles.signatureMetaValue}>{review.supervisorName || record.updated_by || '-'}</span>
                  </div>
                  <div>
                    <span className={styles.signatureMetaLabel}>Date</span>
                    <span className={styles.signatureMetaValue}>{formatDateTime(record.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.signatureCard}>
              <div className={styles.signatureImageWrap}>
                {supervisorSignature
                  ? <img src={supervisorSignature} alt="Supervisor signature" className={styles.signatureImage} />
                  : <span className={styles.noSignature}>No signature yet</span>}
              </div>
              <div className={styles.signatureMeta}>
                <div className={styles.signatureMetaBlock}>
                  <span className={styles.signatureMetaLabel}>Company</span>
                  <span className={styles.signatureMetaValue}>{review.company || record.updated_by || '-'}</span>
                </div>
                <div className={styles.signatureMetaRow}>
                  <div>
                    <span className={styles.signatureMetaLabel}>Name</span>
                    <span className={styles.signatureMetaValue}>{review.supervisorName || record.updated_by || '-'}</span>
                  </div>
                  <div>
                    <span className={styles.signatureMetaLabel}>Date</span>
                    <span className={styles.signatureMetaValue}>{formatDateTime(record.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* ── Footer ── */}
      <div className={styles.previewFooter}>
        <button
          className={styles.btnCancel}
          onClick={() => navigate('/dashboard')}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          className={styles.btnFlagForChange}
          onClick={handleFlagForChange}
          disabled={isSaving}
        >
          Flag For Changes
        </button>
        {isSuperintendent && (
          <button
            className={styles.btnReview}
            onClick={handleReview}
            disabled={isSaving}
          >
            PTP Reviewed
          </button>
        )}
      </div>

      {/* ── Confirmation Modal for Flag For Change ── */}
      {showFlagConfirm && (
        <div className={styles.modalOverlay} onClick={() => !isSaving && handleFlagCancel()}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Flag for change</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleFlagCancel}
                disabled={isSaving}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalMessage}>You're about to flag this PTP. Are you sure you want to continue?</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalBtnCancel}
                onClick={handleFlagCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalBtnConfirm}
                onClick={handleFlagConfirm}
                disabled={isSaving}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal after Flagging ── */}
      {showFlagSuccess && (
        <div className={styles.modalOverlay} onClick={handleFlagSuccessOk}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Flagged Successfully</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleFlagSuccessOk}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalMessage}>PTP has been flagged for change.</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalBtnConfirm}
                onClick={handleFlagSuccessOk}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PTPPreviewPage
