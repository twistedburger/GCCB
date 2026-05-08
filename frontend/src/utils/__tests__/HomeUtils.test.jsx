import {
  handleFormResult,
  locationSetSuccess,
  locationSetError,
  buildSearchURL,
  reverseGeocode,
  hasMapPanned,
} from '../HomeUtils'
import { homeStrings } from '../../locales/en/HomeStrings'

const homeUtilStrings = homeStrings.utils

// handleFormResult
describe('handleFormResult', () => {
  let setShowCreateEvent, setAlert, onSuccess

  beforeEach(() => {
    setShowCreateEvent = jest.fn()
    setAlert = jest.fn()
    onSuccess = jest.fn()
  })

  test('on success: closes modal, shows success alert, and calls onSuccess', () => {
    handleFormResult(
      { success: true },
      { setShowCreateEvent, setAlert, onSuccess }
    )

    expect(setShowCreateEvent).toHaveBeenCalledWith(false)
    expect(setAlert).toHaveBeenCalledWith({
      type: 'success',
      text: homeUtilStrings.successCreation,
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  test('on success: works when onSuccess is not provided', () => {
    expect(() =>
      handleFormResult(
        { success: true },
        { setShowCreateEvent, setAlert, onSuccess: undefined }
      )
    ).not.toThrow()

    expect(setShowCreateEvent).toHaveBeenCalledWith(false)
    expect(setAlert).toHaveBeenCalledWith({
      type: 'success',
      text: homeUtilStrings.successCreation,
    })
  })

  test('on failure: shows error alert and does not close modal', () => {
    handleFormResult(
      { success: false },
      { setShowCreateEvent, setAlert, onSuccess }
    )

    expect(setShowCreateEvent).not.toHaveBeenCalled()
    expect(setAlert).toHaveBeenCalledWith({
      type: 'error',
      text: homeUtilStrings.failureCreation,
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })
})

// locationSetSuccess
describe('locationSetSuccess', () => {
  test('returns a function that sets lat/lng from a GeolocationPosition', () => {
    const setUserLocation = jest.fn()
    const callback = locationSetSuccess(setUserLocation)

    const mockPosition = {
      coords: { latitude: 49.2827, longitude: -123.1207 },
    }

    callback(mockPosition)

    expect(setUserLocation).toHaveBeenCalledWith({
      lat: 49.2827,
      lng: -123.1207,
    })
  })
})

// locationSetError
describe('locationSetError', () => {
  test('logs a message without throwing', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    expect(() => locationSetError()).not.toThrow()
    expect(consoleSpy).toHaveBeenCalledWith(homeUtilStrings.defaultLocation)

    consoleSpy.mockRestore()
  })
})

// buildSearchURL
describe('buildSearchURL', () => {
  const userLocation = { lat: 49.2827, lng: -123.1207 }

  test('returns events URL when mainEventsOnly is true', () => {
    const filters = {
      mainEventsOnly: true,
      time: '',
      transportationModes: [],
      verifiedEventsOnly: false,
      radius: '',
    }

    const url = buildSearchURL(filters, userLocation, true)
    expect(url).toContain('/api/events?')
    expect(url).not.toContain('/api/routes?')
  })

  test('returns routes URL when mainEventsOnly is false', () => {
    const filters = {
      mainEventsOnly: false,
      time: '',
      transportationModes: [],
      verifiedEventsOnly: false,
      radius: '',
    }

    const url = buildSearchURL(filters, userLocation, false)
    expect(url).toContain('/api/routes?')
    expect(url).not.toContain('/api/events?')
  })

  test('includes time param when provided', () => {
    const filters = {
      mainEventsOnly: true,
      time: '14:00',
      transportationModes: [],
      verifiedEventsOnly: false,
      radius: '',
    }

    const url = buildSearchURL(filters, userLocation, true)
    expect(url).toContain('time=14%3A00')
  })

  test('includes transportation_modes param when modes are provided', () => {
    const filters = {
      mainEventsOnly: true,
      time: '',
      transportationModes: ['bus', 'bike'],
      verifiedEventsOnly: false,
      radius: '',
    }

    const url = buildSearchURL(filters, userLocation, true)
    expect(url).toContain('transportation_modes=bus%2Cbike')
  })

  test('omits transportation_modes when array is empty', () => {
    const filters = {
      mainEventsOnly: true,
      time: '',
      transportationModes: [],
      verifiedEventsOnly: false,
      radius: '',
    }

    const url = buildSearchURL(filters, userLocation, true)
    expect(url).not.toContain('transportation_modes')
  })

  test('includes verified param when verifiedEventsOnly is true', () => {
    const filters = {
      mainEventsOnly: true,
      time: '',
      transportationModes: [],
      verifiedEventsOnly: true,
      radius: '',
    }

    const url = buildSearchURL(filters, userLocation, true)
    expect(url).toContain('verified=true')
  })

  test('includes radius param when provided', () => {
    const filters = {
      mainEventsOnly: true,
      time: '',
      transportationModes: [],
      verifiedEventsOnly: false,
      radius: '10',
    }

    const url = buildSearchURL(filters, userLocation, true)
    expect(url).toContain('radius=10')
  })

  test('always includes isArriving, longitude, and latitude', () => {
    const filters = {
      mainEventsOnly: true,
      time: '',
      transportationModes: [],
      verifiedEventsOnly: false,
      radius: '',
    }

    const url = buildSearchURL(filters, userLocation, false)
    expect(url).toContain('isArriving=false')
    expect(url).toContain('longitude=-123.1207')
    expect(url).toContain('latitude=49.2827')
  })
})

// reverseGeocode
describe('reverseGeocode', () => {
  beforeEach(() => {
    global.google = {
      maps: {
        Geocoder: jest.fn(),
      },
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('resolves with the formatted address on success', async () => {
    const mockGeocode = jest.fn((_, callback) => {
      callback([{ formatted_address: '123 Main St, Vancouver, BC' }], 'OK')
    })
    global.google.maps.Geocoder.mockImplementation(() => ({
      geocode: mockGeocode,
    }))

    const address = await reverseGeocode({ lat: 49.2827, lng: -123.1207 })
    expect(address).toBe('123 Main St, Vancouver, BC')
  })

  test('rejects with the status when geocoding fails', async () => {
    const mockGeocode = jest.fn((_, callback) => {
      callback([], 'ZERO_RESULTS')
    })
    global.google.maps.Geocoder.mockImplementation(() => ({
      geocode: mockGeocode,
    }))

    await expect(reverseGeocode({ lat: 49.2827, lng: -123.1207 })).rejects.toBe(
      'ZERO_RESULTS'
    )
  })

  test('rejects when results array is empty', async () => {
    const mockGeocode = jest.fn((_, callback) => {
      callback(null, 'OK')
    })
    global.google.maps.Geocoder.mockImplementation(() => ({
      geocode: mockGeocode,
    }))

    await expect(reverseGeocode({ lat: 49.2827, lng: -123.1207 })).rejects.toBe(
      'OK'
    )
  })
})

// hasMapPanned
describe('hasMapPanned', () => {
  const userLocation = { lat: 49.0, lng: -123.0 }

  test('returns false when the map has not moved', () => {
    expect(hasMapPanned({ lat: 49.0, lng: -123.0 }, userLocation)).toBe(false)
  })

  test('returns false when movement is within the default threshold', () => {
    expect(hasMapPanned({ lat: 49.0005, lng: -123.0004 }, userLocation)).toBe(
      false
    )
  })

  test('returns true when movement exceeds the default threshold', () => {
    expect(hasMapPanned({ lat: 49.002, lng: -123.0 }, userLocation)).toBe(true)
  })

  test('works with a custom threshold', () => {
    // 0.005 difference, under a 0.01 threshold
    expect(
      hasMapPanned({ lat: 49.003, lng: -123.002 }, userLocation, 0.01)
    ).toBe(false)

    // 0.005 difference, over a 0.004 threshold
    expect(
      hasMapPanned({ lat: 49.003, lng: -123.002 }, userLocation, 0.004)
    ).toBe(true)
  })
})
