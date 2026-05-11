import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConfirmationDialog from '../ConfirmationDialog'
import { confirmationDialogStrings } from '../../locales/en/ComponentStrings/ConfirmationDialogStrings'

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
}

describe('ConfirmationDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmationDialog {...baseProps} isOpen={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the dialog when isOpen is true', () => {
    render(<ConfirmationDialog {...baseProps} />)
    expect(
      screen.getByText(confirmationDialogStrings.defaultTitle)
    ).toBeInTheDocument()
  })

  it('renders default title when no title is provided', () => {
    render(<ConfirmationDialog {...baseProps} />)
    expect(
      screen.getByText(confirmationDialogStrings.defaultTitle)
    ).toBeInTheDocument()
  })

  it('renders custom title when provided', () => {
    render(<ConfirmationDialog {...baseProps} title="Delete Account" />)
    expect(screen.getByText('Delete Account')).toBeInTheDocument()
  })

  it('renders default content when no children are provided', () => {
    render(<ConfirmationDialog {...baseProps} />)
    expect(
      screen.getByText(confirmationDialogStrings.defaultConfirm)
    ).toBeInTheDocument()
  })

  it('renders custom children when provided', () => {
    render(
      <ConfirmationDialog {...baseProps}>
        Are you sure you want to delete this item?
      </ConfirmationDialog>
    )
    expect(
      screen.getByText('Are you sure you want to delete this item?')
    ).toBeInTheDocument()
  })

  it('renders default confirm button text when no confirmText is provided', () => {
    render(<ConfirmationDialog {...baseProps} />)
    expect(
      screen.getByText(confirmationDialogStrings.confirm)
    ).toBeInTheDocument()
  })

  it('renders custom confirm button text when provided', () => {
    render(<ConfirmationDialog {...baseProps} confirmText="Yes, delete" />)
    expect(screen.getByText('Yes, delete')).toBeInTheDocument()
  })

  it('renders default cancel button text when no cancelText is provided', () => {
    render(<ConfirmationDialog {...baseProps} />)
    expect(
      screen.getByText(confirmationDialogStrings.cancel)
    ).toBeInTheDocument()
  })

  it('renders custom cancel button text when provided', () => {
    render(<ConfirmationDialog {...baseProps} cancelText="Go back" />)
    expect(screen.getByText('Go back')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn()
    render(<ConfirmationDialog {...baseProps} onClose={onClose} />)
    fireEvent.click(screen.getByText(confirmationDialogStrings.cancel))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm and onClose when confirm button is clicked', () => {
    const onClose = jest.fn()
    const onConfirm = jest.fn()
    render(
      <ConfirmationDialog
        {...baseProps}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )
    fireEvent.click(screen.getByText(confirmationDialogStrings.confirm))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onConfirm when cancel button is clicked', () => {
    const onConfirm = jest.fn()
    render(<ConfirmationDialog {...baseProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText(confirmationDialogStrings.cancel))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('applies danger styles to confirm button when variant is danger', () => {
    render(<ConfirmationDialog {...baseProps} variant="danger" />)
    const confirmButton = screen.getByText(confirmationDialogStrings.confirm)
    expect(confirmButton.closest('button')).toHaveClass('bg-red-700')
  })

  it('confirm button has regular styling when variant is primary', () => {
    render(<ConfirmationDialog {...baseProps} variant="primary" />)
    const confirmButton = screen.getByText(confirmationDialogStrings.confirm)
    expect(confirmButton.closest('button')).toHaveClass('bg-blue-primary')
  })

  it('confirm button has regular styling when variant is not provided', () => {
    render(<ConfirmationDialog {...baseProps} />)
    const confirmButton = screen.getByText(confirmationDialogStrings.confirm)
    expect(confirmButton.closest('button')).toHaveClass('bg-blue-primary')
  })
})
