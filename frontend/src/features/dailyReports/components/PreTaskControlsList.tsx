import React from 'react'
import { PreTaskControl } from '@/services/pretaskControl.service'
import styles from './PreTaskControlsList.module.css'

interface PreTaskControlsListProps {
  controls: PreTaskControl[]
  isLoading?: boolean
  error?: string | null
}

const PreTaskControlsList: React.FC<PreTaskControlsListProps> = ({
  controls,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return <div className={styles.loadingMessage}>Loading PreTask Controls...</div>
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>
  }

  if (!controls || controls.length === 0) {
    return <div className={styles.emptyMessage}>No PreTask Controls found for this project and date.</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>PreTask Plan Controls ({controls.length})</h4>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thCompanyName}>Company Name</th>
              <th className={styles.thProjectName}>Project Name</th>
              <th className={styles.thCreatedAt}>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control, index) => {
              const createdDate = control.createdAt
                ? new Date(control.createdAt).toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                : 'N/A'

              return (
                <tr key={control.id || index} className={styles.row}>
                  <td className={styles.tdCompanyName}>{control.company_name || 'N/A'}</td>
                  <td className={styles.tdProjectName}>{control.control_name || 'N/A'}</td>
                  <td className={styles.tdCreatedAt}>{createdDate}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PreTaskControlsList
