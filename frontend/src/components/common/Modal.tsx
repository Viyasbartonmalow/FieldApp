import React from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onSubmit?: () => void
  submitText?: string
  cancelText?: string
  showCancel?: boolean
  isSubmitting?: boolean
  errorMessage?: string | null
  children: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showCancel = true,
  isSubmitting = false,
  errorMessage,
  children,
  width = 'md',
}) => {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`${styles.modal} ${width === 'sm' ? styles.sm : ''} ${width === 'lg' ? styles.lg : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        <div className={styles.footer}>
          {showCancel && (
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSubmitting}>
              {cancelText}
            </button>
          )}
          {onSubmit && (
            <button type="button" className={styles.submitButton} onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitText}
            </button>
          )}
        </div>

        {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
      </div>
    </div>
  )
}

export default Modal
