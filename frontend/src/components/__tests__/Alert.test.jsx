import { render, act } from '@testing-library/react'
import Alert from '../../components/Alert'

describe('Alert', () => {
  const onTimeout = jest.fn()

  beforeEach(() => {
    jest.useFakeTimers()
    onTimeout.mockClear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  //render test

  test('renders message text', () => {
    const { getByText } = render(
      <Alert
        message="Something went wrong"
        type="error"
        onTimeout={onTimeout}
      />
    )
    expect(getByText('Something went wrong')).toBeInTheDocument()
  })

  test('renders error icon for type "error"', () => {
    const { container } = render(
      <Alert message="Error!" type="error" onTimeout={onTimeout} />
    )
    //confirm error theme class is present
    const wrapper = container.firstChild
    expect(wrapper.className).toContain('bg-red-100')
    expect(wrapper.className).toContain('border-red-500')
    expect(wrapper.className).toContain('text-red-800')
  })

  test('renders success theme for type "success"', () => {
    const { container } = render(
      <Alert message="Saved!" type="success" onTimeout={onTimeout} />
    )
    const wrapper = container.firstChild
    expect(wrapper.className).toContain('bg-green-100')
    expect(wrapper.className).toContain('border-green-500')
    expect(wrapper.className).toContain('text-green-800')
  })

  test('renders info theme for type "info"', () => {
    const { container } = render(
      <Alert message="Heads up" type="info" onTimeout={onTimeout} />
    )
    const wrapper = container.firstChild
    expect(wrapper.className).toContain('bg-blue-100')
    expect(wrapper.className).toContain('border-blue-300')
    expect(wrapper.className).toContain('text-blue-800')
  })

  test('falls back to error theme for unknown type', () => {
    const { container } = render(
      <Alert message="Unknown" type="unknown-type" onTimeout={onTimeout} />
    )
    const wrapper = container.firstChild
    expect(wrapper.className).toContain('bg-red-100')
  })

  //animation state tests

  test('starts with the entry animation class before animationEnd fires', () => {
    const { container } = render(
      <Alert message="Hello" type="info" onTimeout={onTimeout} />
    )
    const wrapper = container.firstChild
    expect(wrapper.className).toContain('animate-alert-in')
  })

  test('removes entry animation class after animationEnd fires', () => {
    const { container } = render(
      <Alert message="Hello" type="info" onTimeout={onTimeout} />
    )
    const wrapper = container.firstChild

    act(() => {
      wrapper.dispatchEvent(new Event('animationend', { bubbles: true }))
    })

    //after animationEnd, animate-alert-in should be gone
    expect(wrapper.className).not.toContain('animate-alert-in')
  })

  //timeout tests (500 ms = transition time)

  test('adds opacity-0 class after (duration - 500) ms', () => {
    const { container } = render(
      <Alert message="Bye" type="info" duration={3000} onTimeout={onTimeout} />
    )
    const wrapper = container.firstChild

    expect(wrapper.className).toContain('opacity-100')

    act(() => {
      jest.advanceTimersByTime(2500)
    })

    expect(wrapper.className).toContain('opacity-0')
    expect(wrapper.className).toContain('-translate-y-3')
    expect(wrapper.className).toContain('pointer-events-none')
  })

  test('does not start exiting before (duration - 500) ms', () => {
    const { container } = render(
      <Alert
        message="Still here"
        type="info"
        duration={3000}
        onTimeout={onTimeout}
      />
    )
    const wrapper = container.firstChild

    act(() => {
      jest.advanceTimersByTime(2499)
    })

    expect(wrapper.className).not.toContain('opacity-0')
  })

  test('calls onTimeout after exit transition ends', () => {
    const { container } = render(
      <Alert
        message="Bye"
        type="success"
        duration={3000}
        onTimeout={onTimeout}
      />
    )
    const wrapper = container.firstChild

    //trigger exit
    act(() => {
      jest.advanceTimersByTime(2500)
    })

    //CSS transition
    act(() => {
      wrapper.dispatchEvent(new Event('transitionend', { bubbles: true }))
    })

    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  test('does not call onTimeout on transitionEnd before exit starts', () => {
    const { container } = render(
      <Alert
        message="Still visible"
        type="info"
        duration={3000}
        onTimeout={onTimeout}
      />
    )
    const wrapper = container.firstChild

    act(() => {
      wrapper.dispatchEvent(new Event('transitionend', { bubbles: true }))
    })

    expect(onTimeout).not.toHaveBeenCalled()
  })

  //test custom duration

  test('respects a custom duration prop', () => {
    const { container } = render(
      <Alert
        message="Quick"
        type="error"
        duration={1000}
        onTimeout={onTimeout}
      />
    )
    const wrapper = container.firstChild

    act(() => {
      jest.advanceTimersByTime(499) // duration - 501
    })
    expect(wrapper.className).not.toContain('opacity-0')

    act(() => {
      jest.advanceTimersByTime(1) // duration - 500
    })
    expect(wrapper.className).toContain('opacity-0')
  })

  test('uses default duration of 3000ms when duration is not provided', () => {
    const { container } = render(
      <Alert message="Default" type="success" onTimeout={onTimeout} />
    )
    const wrapper = container.firstChild

    act(() => {
      jest.advanceTimersByTime(2499)
    })
    expect(wrapper.className).not.toContain('opacity-0')

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(wrapper.className).toContain('opacity-0')
  })

  //onTimeout prop change tests

  test('calls the latest onTimeout if the prop changes before exit', () => {
    const firstCallback = jest.fn()
    const secondCallback = jest.fn()

    const { container, rerender } = render(
      <Alert
        message="Changing"
        type="info"
        duration={3000}
        onTimeout={firstCallback}
      />
    )
    const wrapper = container.firstChild

    //replace onTimeout mid-life
    rerender(
      <Alert
        message="Changing"
        type="info"
        duration={3000}
        onTimeout={secondCallback}
      />
    )

    act(() => {
      jest.advanceTimersByTime(2500)
    })

    act(() => {
      wrapper.dispatchEvent(new Event('transitionend', { bubbles: true }))
    })

    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).toHaveBeenCalledTimes(1)
  })

  //cleanup tests

  test('clears the exit timer on unmount (no setState after unmount)', () => {
    const { unmount } = render(
      <Alert
        message="Unmounting"
        type="error"
        duration={3000}
        onTimeout={onTimeout}
      />
    )

    unmount()

    expect(() => {
      act(() => {
        jest.advanceTimersByTime(5000)
      })
    }).not.toThrow()
  })
})
