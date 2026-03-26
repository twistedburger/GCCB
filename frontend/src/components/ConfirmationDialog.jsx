import PropTypes from 'prop-types'
import Modal from './Modal'
import GenericButton from './GenericButton'

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  children = 'Please confirm that you would like to proceed with this action. This change may be permanent.',
  title = 'Confirmation',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}) {
  // confirmation button is red if danger variant
  const confirmButtonStyles = variant === 'danger' ? 'bg-red-700' : ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-6">
        {/* content */}
        <div className="text-zinc-700">{children}</div>

        {/* action buttons */}
        <div className="flex items-center justify-end">
          <GenericButton
            onClick={onClose}
            unstyled={false}
            customStyling="text-zinc-700 bg-zinc-200"
          >
            {cancelText}
          </GenericButton>

          <GenericButton
            onClick={() => {
              onConfirm()
              onClose()
            }}
            unstyled={false}
            customStyling={`${confirmButtonStyles}`}
          >
            {confirmText}
          </GenericButton>
        </div>
      </div>
    </Modal>
  )
}

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  children: PropTypes.node,
  title: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'danger']),
}
