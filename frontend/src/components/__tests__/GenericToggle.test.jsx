import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import GenericToggle from '../GenericToggle'

describe('GenericToggle Component', () => {
  it('renders both labels', () => {
    // mock render a toggle component
    render(<GenericToggle labels={['Label 1', 'Label 2']} />)
    // confirm if both labels are within the document
    expect(screen.getByText('Label 1')).toBeInTheDocument()
  })

  it('applies active UI for left side, and inactive UI for right side when value is true', () => {
    // mock render a toggle component
    render(<GenericToggle value={true} labels={['Label 1', 'Label 2']} />)
    const leftButton = screen.getByText('Label 1')
    const rightButton = screen.getByText('Label 2')
    // confirm active/inactive by colour/opacity
    expect(leftButton).toHaveClass('bg-blue-primary')
    expect(rightButton).toHaveClass('opacity-50')
  })

  it('applies active UI for right side, and inactive UI for left side when value is false', () => {
    // mock render a toggle component
    render(<GenericToggle value={false} labels={['Label 1', 'Label 2']} />)
    const leftButton = screen.getByText('Label 1')
    const rightButton = screen.getByText('Label 2')
    // confirm active/inactive by colour/opacity
    expect(leftButton).toHaveClass('opacity-50')
    expect(rightButton).toHaveClass('bg-blue-primary')
  })

  it('calls onChange(false) when toggled from true', () => {
    // creates a mock function
    const handleChange = jest.fn()
    // mock render a toggle component with value true
    const { container } = render(
      <GenericToggle
        value={true}
        onChange={handleChange}
        labels={['Label 1', 'Label 2']}
      />
    )
    // mock click
    fireEvent.click(container.firstChild)
    // confirm handleChange is called with false
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it('calls onChange(true) when toggled from false', () => {
    const handleChange = jest.fn()
    const { container } = render(
      <GenericToggle
        value={false}
        onChange={handleChange}
        labels={['Label 1', 'Label 2']}
      />
    )
    fireEvent.click(container.firstChild)
    expect(handleChange).toHaveBeenCalledWith(true)
  })
})
