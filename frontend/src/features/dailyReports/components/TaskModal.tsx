import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '@/components/common/Modal'
import styles from './DailyReportModal.module.css'

export interface DynamicModalField {
  name: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'date' | 'checkbox'
  required?: boolean
  options?: string[]
}

interface TaskModalProps {
  isOpen: boolean
  title: string
  fields: DynamicModalField[]
  initialValues?: Record<string, unknown>
  onClose: () => void
  onSubmit: (values: Record<string, unknown>) => Promise<void>
  isSubmitting: boolean
  errorMessage?: string | null
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  title,
  fields,
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
  } = useForm<Record<string, unknown>>({ defaultValues: initialValues })

  useEffect(() => {
    if (isOpen) {
      reset(initialValues ?? {})
    }
  }, [initialValues, isOpen, reset])

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      submitText="Save"
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    >
      <form className={styles.form}>
        {fields.map((field) => {
          const error = errors[field.name]
          const validation = field.required ? { required: `${field.label} is required` } : undefined

          return (
            <label key={field.name} className={styles.field}>
              <span>{field.label}</span>
              {field.type === 'textarea' && <textarea rows={4} {...register(field.name, validation)} />}
              {field.type === 'select' && (
                <select {...register(field.name, validation)}>
                  <option value="">Select</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              {field.type === 'checkbox' && (
                <input type="checkbox" {...register(field.name)} />
              )}
              {(!field.type || field.type === 'text' || field.type === 'number' || field.type === 'date') && (
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  {...register(field.name, validation)}
                />
              )}
              {error && <small>{String(error.message ?? '')}</small>}
            </label>
          )
        })}
      </form>
    </Modal>
  )
}

export default TaskModal
