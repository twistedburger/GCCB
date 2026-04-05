import { render, fireEvent, act } from '@testing-library/react'
import LocationSearch from '../../components/LocationSearch'

beforeAll(() => {
  if (!customElements.get('gmp-place-autocomplete')) {
    customElements.define(
      'gmp-place-autocomplete',
      class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = `<input placeholder="${this.getAttribute('placeholder') ?? ''}" />`
        }
      }
    )
  }
})

describe('LocationSearch', () => {
  const onSearch = jest.fn()

  //rendering tests
  test('renders with default placeholder', () => {
    render(<LocationSearch onSearch={onSearch} />)
    const el = document.querySelector('gmp-place-autocomplete')
    expect(el.getAttribute('placeholder')).toBe('Search location...')
  })

  test('renders with custom placeholder', () => {
    render(<LocationSearch onSearch={onSearch} placeHolder="Enter a city" />)
    const el = document.querySelector('gmp-place-autocomplete')
    expect(el.getAttribute('placeholder')).toBe('Enter a city')
  })

  test('applies custom className', () => {
    render(<LocationSearch onSearch={onSearch} className="custom-class" />)
    const el = document.querySelector('gmp-place-autocomplete')
    expect(el.className).toContain('custom-class')
  })

  //disabled state tests
  test('applies disabled styles when disabled prop is true', () => {
    render(<LocationSearch onSearch={onSearch} disabled={true} />)
    const el = document.querySelector('gmp-place-autocomplete')
    expect(el.className).toContain('pointer-events-none')
    expect(el.className).toContain('opacity-50')
  })

  test('does not apply disabled styles when disabled is false', () => {
    render(<LocationSearch onSearch={onSearch} disabled={false} />)
    const el = document.querySelector('gmp-place-autocomplete')
    expect(el.className).not.toContain('pointer-events-none')
    expect(el.className).not.toContain('opacity-50')
  })

  //default location tests
  test('syncs input value when defaultLocation prop changes', () => {
    const { rerender } = render(
      <LocationSearch onSearch={onSearch} defaultLocation="Vancouver" />
    )
    const el = document.querySelector('gmp-place-autocomplete')
    expect(el.value).toBe('Vancouver')

    rerender(<LocationSearch onSearch={onSearch} defaultLocation="Antwerp" />)
    expect(el.value).toBe('Antwerp')
  })

  //keyboard action tests
  test('calls onSearch with current location on Enter key', () => {
    render(<LocationSearch onSearch={onSearch} defaultLocation="Vancouver" />)
    const el = document.querySelector('gmp-place-autocomplete')
    fireEvent.keyDown(el, { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('Vancouver')
  })

  test('calls onSearch with updated value after typing then pressing Enter', () => {
    render(<LocationSearch onSearch={onSearch} />)
    const el = document.querySelector('gmp-place-autocomplete')
    const input = el.querySelector('input')
    fireEvent.input(input, { target: { value: 'Antwerp' } })
    fireEvent.keyDown(el, { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('Antwerp')
  })

  test('does not call onSearch on non-Enter keydown', () => {
    render(<LocationSearch onSearch={onSearch} />)
    const el = document.querySelector('gmp-place-autocomplete')
    fireEvent.keyDown(el, { key: 'Escape' })
    expect(onSearch).not.toHaveBeenCalled()
  })

  //gmp-select event (Google Maps place selection) tests
  test('calls onSearch with formatted address on gmp-select event', async () => {
    render(<LocationSearch onSearch={onSearch} />)
    const el = document.querySelector('gmp-place-autocomplete')

    const mockPhotoUri = 'https://mockphoto.com'
    const mockPlace = {
      fetchFields: jest.fn().mockResolvedValue(undefined),
      formattedAddress: '123 Main St, Vancouver, BC',
      location: { lat: () => 49.2827, lng: () => -123.1207 },
      photos: [{ getURI: () => mockPhotoUri }],
      id: 'place-id-abc123',
    }
    const mockPrediction = { toPlace: jest.fn().mockReturnValue(mockPlace) }

    await act(async () => {
      const event = new CustomEvent('gmp-select', { bubbles: true })
      event.placePrediction = mockPrediction
      el.dispatchEvent(event)
    })

    expect(mockPrediction.toPlace).toHaveBeenCalled()
    expect(mockPlace.fetchFields).toHaveBeenCalledWith({
      fields: ['formattedAddress', 'location', 'photos', 'id'],
    })
    expect(onSearch).toHaveBeenCalledWith(
      '123 Main St, Vancouver, BC',
      49.2827,
      -123.1207,
      mockPhotoUri,
      'place-id-abc123'
    )
  })

  test('passes null as banner when place has no photos', async () => {
    render(<LocationSearch onSearch={onSearch} />)
    const el = document.querySelector('gmp-place-autocomplete')

    const mockPlace = {
      fetchFields: jest.fn().mockResolvedValue(undefined),
      formattedAddress: '456 No Photo Ave',
      location: { lat: () => 51.5074, lng: () => -0.1278 },
      photos: null,
      id: 'place-id-no-photo',
    }
    const mockPrediction = { toPlace: jest.fn().mockReturnValue(mockPlace) }

    await act(async () => {
      const event = new CustomEvent('gmp-select', { bubbles: true })
      event.placePrediction = mockPrediction
      el.dispatchEvent(event)
    })

    expect(onSearch).toHaveBeenCalledWith(
      '456 No Photo Ave',
      51.5074,
      -0.1278,
      null,
      'place-id-no-photo'
    )
  })

  test('passes null as banner when photos array is empty', async () => {
    render(<LocationSearch onSearch={onSearch} />)
    const el = document.querySelector('gmp-place-autocomplete')

    const mockPlace = {
      fetchFields: jest.fn().mockResolvedValue(undefined),
      formattedAddress: '789 Empty Photos Blvd',
      location: { lat: () => 48.8566, lng: () => 2.3522 },
      photos: [],
      id: 'place-id-empty-photos',
    }
    const mockPrediction = { toPlace: jest.fn().mockReturnValue(mockPlace) }

    await act(async () => {
      const event = new CustomEvent('gmp-select', { bubbles: true })
      event.placePrediction = mockPrediction
      el.dispatchEvent(event)
    })

    expect(onSearch).toHaveBeenCalledWith(
      '789 Empty Photos Blvd',
      48.8566,
      2.3522,
      null,
      'place-id-empty-photos'
    )
  })

  test('cleans up gmp-select event listener on unmount', () => {
    const { unmount } = render(<LocationSearch onSearch={onSearch} />)
    const el = document.querySelector('gmp-place-autocomplete')
    const removeEventListenerSpy = jest.spyOn(el, 'removeEventListener')

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'gmp-select',
      expect.any(Function)
    )
  })

  //clearRef tests

  test('populates clearRef.current with a clear function on mount', () => {
    const clearRef = { current: null }
    render(<LocationSearch onSearch={onSearch} clearRef={clearRef} />)
    expect(clearRef.current).not.toBeNull()
    expect(typeof clearRef.current.clear).toBe('function')
  })

  test('clear() empties the autocomplete input value', () => {
    const clearRef = { current: null }
    render(
      <LocationSearch
        onSearch={onSearch}
        clearRef={clearRef}
        defaultLocation="Vancouver"
      />
    )
    const el = document.querySelector('gmp-place-autocomplete')
    expect(el.value).toBe('Vancouver')

    act(() => {
      clearRef.current.clear()
    })

    expect(el.value).toBe('')
  })

  test('clear() dispatches change and input events on the element', () => {
    const clearRef = { current: null }
    render(<LocationSearch onSearch={onSearch} clearRef={clearRef} />)
    const el = document.querySelector('gmp-place-autocomplete')

    const changeHandler = jest.fn()
    const inputHandler = jest.fn()
    el.addEventListener('change', changeHandler)
    el.addEventListener('input', inputHandler)

    act(() => {
      clearRef.current.clear()
    })

    expect(changeHandler).toHaveBeenCalledTimes(1)
    expect(inputHandler).toHaveBeenCalledTimes(1)

    el.removeEventListener('change', changeHandler)
    el.removeEventListener('input', inputHandler)
  })

  test('does not throw when clearRef is not provided', () => {
    expect(() => {
      render(<LocationSearch onSearch={onSearch} />)
    }).not.toThrow()
  })
})
