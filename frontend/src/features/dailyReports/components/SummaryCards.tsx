import React from 'react'
import styles from './SummaryCards.module.css'

export interface SummaryCardData {
  label: string
  value: string | number
  icon: string
  unit?: string
}

interface SummaryCardsProps {
  cards: SummaryCardData[]
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
  return (
    <div className={styles.container}>
      {cards.map((card, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.icon}>{card.icon}</div>
          <div className={styles.content}>
            <div className={styles.value}>{card.value}</div>
            <div className={styles.label}>
              {card.label}
              {card.unit && <span className={styles.unit}>{card.unit}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummaryCards
