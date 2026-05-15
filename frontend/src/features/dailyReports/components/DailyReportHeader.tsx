import React from 'react'
import styles from './DailyReports.module.css'

interface DailyReportHeaderProps {
  title: string
  subtitle: string
}

const DailyReportHeader: React.FC<DailyReportHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className={styles.headerBlock}>
      <h1 className={styles.projectTitle}>{title}</h1>
      <p className={styles.projectSub}>{subtitle}</p>
    </div>
  )
}

export default DailyReportHeader
