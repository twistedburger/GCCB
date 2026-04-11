import PropTypes from 'prop-types'
import Modal from './Modal'
import GenericButton from './GenericButton'
import { confirmationDialogStrings } from '../locales/en/ComponentStrings/ConfirmationDialogStrings'

/**
 * Component to display a confirmation dialog.
 *
 * @param {boolean} isOpen - Whether the dialog is open.
 * @param {Function} onClose - The function to call when the dialog is closed.
 * @param {Function} onConfirm - The function to call when the confirmation is accepted.
 * @param {React.ReactNode} [children=confirmationDialogStrings.defaultConfirm] - The content to display in the dialog.
 * @param {string} [title=confirmationDialogStrings.defaultTitle] - The title of the dialog.
 * @param {string} [confirmText=confirmationDialogStrings.confirm] - The text for the confirmation button.
 * @param {string} [cancelText=confirmationDialogStrings.cancel] - The text for the cancel button.
 * @param {'primary'|'danger'} [variant='primary'] - The variant of the dialog.
 * @returns {JSX.Element}
 */

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  children = confirmationDialogStrings.defaultConfirm,
  title = confirmationDialogStrings.defaultTitle,
  confirmText = confirmationDialogStrings.confirm,
  cancelText = confirmationDialogStrings.cancel,
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
            customStyling={confirmButtonStyles}
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
