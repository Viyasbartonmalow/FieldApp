import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '@/components/common/Modal'
import { DailyReportInput } from '@/services/graphql/dailyReportsApi'
import styles from './DailyReportModal.module.css'

interface DailyReportModalProps {
  isOpen: boolean
  mode: 'create' | 'edit' | 'save'
  initialValues: DailyReportInput & { reportId?: string }
  onClose: () => void
  onSubmit: (payload: DailyReportInput & { reportId?: string }) => Promise<void>
  isSubmitting: boolean
  errorMessage?: string | null
}

const toIsoDate = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString().split('T')[0]
}

const createUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `dr-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  mode,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DailyReportInput & { reportId?: string }>({
    defaultValues: initialValues,
  })

  useEffect(() => {
    if (isOpen) {
      reset(initialValues)
    }
  }, [initialValues, isOpen, reset])

  const submitLabel = mode === 'edit' ? 'Update Report' : mode === 'save' ? 'Save Report' : 'Add Report'

  return (
    <Modal
      isOpen={isOpen}
      title={submitLabel}
      onClose={onClose}
      onSubmit={handleSubmit(async (values) => {
        const payload: DailyReportInput & { reportId?: string } = {
          ...values,
          reportId: values.reportId || (mode === 'create' ? createUuid() : undefined),
          reportDate: toIsoDate(values.reportDate),
        }

        await onSubmit(payload)
      })}
      submitText={submitLabel}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      width="lg"
    >
      <form className={styles.form}>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>User ID</span>
            <input {...register('userId', { required: 'User ID is required' })} />
            {errors.userId && <small>{errors.userId.message}</small>}
          </label>
          <label className={styles.field}>
            <span>Report Date</span>
            <input type="date" {...register('reportDate', { required: 'Report date is required' })} />
            {errors.reportDate && <small>{errors.reportDate.message}</small>}
          </label>
        </div>

        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Employee Name</span>
            <input {...register('employeeName', { required: 'Employee name is required' })} />
            {errors.employeeName && <small>{errors.employeeName.message}</small>}
          </label>
          <label className={styles.field}>
            <span>Trade</span>
            <input {...register('trade')} />
          </label>
        </div>

        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Status</span>
            <select {...register('status')}>
              <option value="">Select status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Hours Worked</span>
            <input type="number" step="0.25" min="0" {...register('hoursWorked', { valueAsNumber: true })} />
          </label>
        </div>

        <label className={styles.field}>
          <span>Task Details</span>
          <textarea rows={4} {...register('taskDetails', { required: 'Task details are required' })} />
          {errors.taskDetails && <small>{errors.taskDetails.message}</small>}
        </label>

        <label className={styles.field}>
          <span>Remarks</span>
          <textarea rows={3} {...register('remarks')} />
        </label>
      </form>
    </Modal>
  )
}

export default DailyReportModal
