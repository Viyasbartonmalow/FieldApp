import React from 'react'
import Modal from '@/components/common/Modal'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title?: string
  message: string
  onClose: () => void
  onConfirm: () => Promise<void>
  isSubmitting: boolean
  errorMessage?: string | null
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Delete Record',
  message,
  onClose,
  onConfirm,
  isSubmitting,
  errorMessage,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      onSubmit={onConfirm}
      submitText="Delete"
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      width="sm"
    >
      <p style={{ margin: 0, color: '#1f2a33', fontSize: 14 }}>{message}</p>
    </Modal>
  )
}

export default DeleteConfirmModal
