import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CommuteIcon from '../CommuteIcon'

describe('CommuteIcon Component', () => {
  it('renders correct icon for car type', () => {
    // mock render a commute icon type car
    const { container } = render(<CommuteIcon type={'car'} />)
    // select any element that is data type car
    const div = container.querySelector('[data-type="car"]')
    // confirm if it's been rendered in the DOM
    expect(div).toBeInTheDocument()
  })

  it('calls the onClick handler when clicked', () => {
    // creates mock function
    const handleClick = jest.fn()
    // mock render a commute icon type car
    const { container } = render(
      <CommuteIcon type={'car'} onClick={handleClick} />
    )
    // select any element that is class commute-icon
    const div = container.querySelector('.commute-icon')
    // simulate the click
    fireEvent.click(div)
    // confirm if mock function is called on click
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('cursor-pointer class applied when clickable', () => {
    const { container } = render(<CommuteIcon type={'car'} clickable={true} />)
    const div = container.querySelector('.commute-icon')
    expect(div).toHaveClass('cursor-pointer')
  })

  it('selected class applied when clickable and isSelected', () => {
    const { container } = render(
      <CommuteIcon type={'car'} clickable={true} isSelected={true} />
    )
    const div = container.querySelector('.commute-icon')
    expect(div).toHaveClass('selected')
  })
})
