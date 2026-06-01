import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CreatePTPModal.module.css'

/* ================================================================
   Create New PTP Form Modal
   Figma: Frame 427319124 / Frame 427319112
   Node: 4582:11173 (first occurrence)

   Three option cards (Figma Info Glance 5, 2, 4):
   1. Previous Day PTP      — orange border #E35205
   2. Trade-Specific PTP    — blue-grey border #4F758B
   3. PTP from Prior Dates  — light blue border #A5BAC9

   Get Started → navigates to the selected option's route
   ================================================================ */

interface Option {
  id: string
  title: string
  description: string
  accentColor: string   /* card border + left strip color */
  route: string
}

const OPTIONS: Option[] = [
  {
    id: 'start-new',
    title: 'Start a New PTP',
    description:
      'Begin a fresh PTP workflow with no copied data from previous templates.',
    accentColor: '#00263A',
    route: '/ptp/workflow?ptpType=standard',
  },
  {
    id: 'previous-day',
    title: 'Previous Day PTP',
    description:
      'Use the previous day PTP to create the new PTP and modify as required.',
    accentColor: '#E35205',   /* fill_WDI17V — orange (selected state in Figma) */
    route: '/ptp/create/previous-day',
  },
  {
    id: 'trade-specific',
    title: 'Trade-Specific PTP',
    description:
      'Create the daily PTP using the pre-defined trade-specific templates to identify Activity and plan safe work activities effectively.',
    accentColor: '#4F758B',   /* fill_CLAX0R — blue-grey */
    route: '/ptp/create/trade-specific',
  },
  {
    id: 'prior-dates',
    title: 'PTP from Prior Dates',
    description:
      "Use the calendar to access and quickly select PTP's from any prior date for consistent planning and also reuse PTP's from earlier dates.",
    accentColor: '#A5BAC9',   /* fill_8XD96L — light blue */
    route: '/ptp/create/prior-dates',
  },
]

interface CreatePTPModalProps {
  onClose: () => void
}

const CreatePTPModal: React.FC<CreatePTPModalProps> = ({ onClose }) => {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string>('start-new')

  const handleGetStarted = () => {
    const option = OPTIONS.find(o => o.id === selectedId)
    if (option) {
      onClose()
      navigate(option.route)
    }
  }

  return (
    /* Overlay — Figma: fill_NP6TA9 = rgba(41,41,58,0.23) */
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      {/* Modal card — Figma: Frame 427319112, white, radius 10px, 691×798 */}
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header — Figma: Frame 427319115, fill_07J42F = #00263A, radius 10 10 0 0 */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>Create New PTP Form</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            {/* Red circle close — Figma: fill_975Y9D MacOS Close */}
            <span className={styles.closeDot}>✕</span>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Subtitle — Figma: style_V8TGIH URW DIN Regular, fill_HPAX9Y = #666666 */}
          <p className={styles.subtitle}>
            Select one of the below options to start daily PTP creation:
          </p>

          {/* Option cards — Figma: Frame 1618868461 column gap:14px */}
          <div className={styles.optionsList}>
            {OPTIONS.map(option => {
              const isSelected = selectedId === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
                  style={{
                    borderColor: option.accentColor,
                    /* Override left strip color per option */
                    '--accent': option.accentColor,
                  } as React.CSSProperties}
                  onClick={() => setSelectedId(option.id)}
                >
                  {/* Left color strip — Figma: Frame 1618868408, 9px wide, full height */}
                  <div
                    className={styles.leftStrip}
                    style={{ backgroundColor: option.accentColor }}
                  />

                  {/* Card content */}
                  <div className={styles.optionContent}>
                    {/* Title — Figma: style_VQCRUH URW DIN Bold 700, fill_N51C7U = #111111 */}
                    <span className={styles.optionTitle}>{option.title}</span>
                    {/* Description — Figma: style_V8TGIH URW DIN Regular, fill_F7A9BT = #696969 */}
                    <span className={styles.optionDesc}>{option.description}</span>
                  </div>

                  {/* Radio indicator — Figma: Ellipse 2, right side */}
                  <div
                    className={`${styles.radioRing} ${isSelected ? styles.radioRingSelected : ''}`}
                    style={isSelected ? { borderColor: option.accentColor } : {}}
                  >
                    {isSelected && (
                      <div
                        className={styles.radioDot}
                        style={{ backgroundColor: option.accentColor }}
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Get Started button — Figma: Group 427319077, fill_07J42F #00263A, radius 4px, icon-right */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.getStartedBtn}
            onClick={handleGetStarted}
          >
            Get Started
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M5 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePTPModal
