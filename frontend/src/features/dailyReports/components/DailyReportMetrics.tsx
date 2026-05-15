import React from 'react'
import { DailyReportMetric } from '@/features/dailyReports/types'
import styles from './DailyReports.module.css'

interface DailyReportMetricsProps {
  metrics: DailyReportMetric[]
}

const WeatherIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10.8 21.8h10.4a5.2 5.2 0 0 0 .3-10.4 7.2 7.2 0 0 0-13.6 2.4 4.2 4.2 0 0 0 2.9 8z" fill="#00324E"/>
    <path d="M10.5 24.2l-1.6 1.9M14.8 24.2l-1.6 1.9M19.1 24.2l-1.6 1.9" stroke="#00324E" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const DailyReportMetrics: React.FC<DailyReportMetricsProps> = ({ metrics }) => {
  return (
    <div className={styles.metricGrid}>
      {metrics.map((metric) => (
        <div className={styles.metricCard} key={metric.label}>
          <div className={styles.metricDot}>{metric.label === 'WEATHER' ? <WeatherIcon /> : null}</div>
          <div>
            <p className={styles.metricValue}>{metric.value}</p>
            <p className={styles.metricLabel}>{metric.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DailyReportMetrics
