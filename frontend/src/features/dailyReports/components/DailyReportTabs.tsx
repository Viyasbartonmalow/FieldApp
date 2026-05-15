import React from 'react'
import { DailyReportTab } from '@/features/dailyReports/types'
import styles from './DailyReports.module.css'

interface DailyReportTabsProps {
  activeTab: DailyReportTab
  onChange: (tab: DailyReportTab) => void
}

const tabItems: Array<{ key: DailyReportTab; label: string }> = [
  { key: 'subcontractors', label: 'Subcontractors' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'delivers', label: 'Delivers' },
  { key: 'observations', label: 'Observations' },
]

const DailyReportTabs: React.FC<DailyReportTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className={styles.tabBar}>
      {tabItems.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabActive : ''}`}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default DailyReportTabs
