import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import GenericButton from '../../components/GenericButton'
import { PlaceOutlined } from '@mui/icons-material'

describe('GenericButton Component', () => {
  it('display text button correctly', () => {
    render(<GenericButton unstyled={false}>Hello!</GenericButton>)
    expect(screen.getByText('Hello!')).toBeInTheDocument()
  })

  it('display icon button correctly', () => {
    const { container } = render(
      <GenericButton unstyled={false}>
        <PlaceOutlined />
      </GenericButton>
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('displays icon and text together correctly', () => {
    const { container } = render(
      <GenericButton unstyled={false}>
        <PlaceOutlined />
        Hello!
      </GenericButton>
    )
    expect(screen.getByText('Hello!')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders default styling if no extra styling given and unstyled is false', () => {
    render(<GenericButton unstyled={false}>Button</GenericButton>)
    const button = screen.getByRole('button')
    // confirm if it has default styling
    expect(button).toHaveClass('bg-blue-primary', 'text-white', 'font-medium')
  })

  it('renders default styling and custom if given', () => {
    render(
      <GenericButton unstyled={false} customStyling={'border-10'}>
        Button
      </GenericButton>
    )
    const button = screen.getByRole('button')
    // confirm if it has default and custom styling
    expect(button).toHaveClass(
      'bg-blue-primary',
      'text-white',
      'font-medium',
      'border-10'
    )
  })

  it('renders completely custom styling if unstyled is true', () => {
    render(
      <GenericButton unstyled={true} customStyling={'border-10'}>
        Button
      </GenericButton>
    )
    const button = screen.getByRole('button')
    // confirm it has custom styling and no default styling
    expect(button).toHaveClass('border-10')
    expect(button).not.toHaveClass('bg-blue-primary')
  })

  it('calls the onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(
      <GenericButton unstyled={false} onClick={handleClick}>
        Button
      </GenericButton>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    // confirm if mock function is called on click
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled if disabled set to true', () => {
    render(<GenericButton disabled={true}>Button</GenericButton>)
    const button = screen.getByRole('button')
    // confirm if it has disabled attribute and disabled styling
    expect(button).toHaveAttribute('disabled')
    expect(button).toHaveClass(
      'disabled:bg-gray-300',
      'disabled:text-gray-500',
      'disabled:cursor-not-allowed'
    )
  })

  it('onClick cannot be called if disabled', () => {
    const handleClick = jest.fn()
    render(
      <GenericButton onClick={handleClick} disabled={true}>
        Button
      </GenericButton>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(0)
  })

  it('renders with correct type', () => {
    render(<GenericButton type={'submit'}>Button</GenericButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
