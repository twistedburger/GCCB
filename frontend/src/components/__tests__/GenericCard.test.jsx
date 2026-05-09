import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import GenericCard from '../GenericCard'

describe('GenericCard Component', () => {
  test('should render content/children correctly', () => {
    render(<GenericCard>Card content</GenericCard>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  test('should render as a div by default', () => {
    const { container } = render(<GenericCard>Content</GenericCard>)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  test('should render as a section when as="section"', () => {
    const { container } = render(
      <GenericCard as="section">Content</GenericCard>
    )
    expect(container.firstChild.tagName).toBe('SECTION')
  })

  test('should render as an article when as="article"', () => {
    const { container } = render(
      <GenericCard as="article">Content</GenericCard>
    )
    expect(container.firstChild.tagName).toBe('ARTICLE')
  })

  test('should apply default styling when unstyled is set false', () => {
    const { container } = render(<GenericCard>Content</GenericCard>)
    expect(container.firstChild).toHaveClass(
      'rounded-xl',
      'bg-white',
      'shadow-sm',
      'border',
      'border-zinc-200'
    )
  })

  test('should append customStyling to default styling', () => {
    const { container } = render(
      <GenericCard customStyling="p-4 mt-2">Content</GenericCard>
    )
    expect(container.firstChild).toHaveClass(
      'rounded-xl',
      'bg-white',
      'p-4',
      'mt-2'
    )
  })

  test('should only apply customStyling when unstyled is true', () => {
    const { container } = render(
      <GenericCard unstyled customStyling="bg-gray-100 rounded-3xl">
        Content
      </GenericCard>
    )
    expect(container.firstChild).toHaveClass('bg-gray-100', 'rounded-3xl')
    expect(container.firstChild).not.toHaveClass('bg-white', 'shadow-sm')
  })

  test('should not have any classes when unstyled is true and no customStyling given', () => {
    const { container } = render(<GenericCard unstyled>Content</GenericCard>)
    expect(container.firstChild.className.trim()).toBe('')
  })

  test('should render as a button when onClick is given', () => {
    render(<GenericCard onClick={() => {}}>Content</GenericCard>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('should not render as a button when onClick is not given', () => {
    render(<GenericCard>Content</GenericCard>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('should call onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<GenericCard onClick={handleClick}>Content</GenericCard>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('should be disabled when disabled prop is true', () => {
    render(
      <GenericCard onClick={() => {}} disabled>
        Content
      </GenericCard>
    )
    expect(screen.getByRole('button')).toHaveAttribute('disabled')
  })

  test('should not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(
      <GenericCard onClick={handleClick} disabled>
        Content
      </GenericCard>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(0)
  })

  test('should apply interactive styling when onClick is provided', () => {
    render(<GenericCard onClick={() => {}}>Content</GenericCard>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('cursor-pointer', 'transition')
  })

  test('should render multiple children correctly', () => {
    render(
      <GenericCard>
        <p>First</p>
        <p>Second</p>
      </GenericCard>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  test('should render nested components correctly', () => {
    render(
      <GenericCard>
        <span data-testid="nested">Nested</span>
      </GenericCard>
    )
    expect(screen.getByTestId('nested')).toBeInTheDocument()
  })
})
