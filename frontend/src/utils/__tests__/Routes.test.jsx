import { routeStrings } from '../../locales/en/routestrings'
import { isValidTravelMode, calculateRoute, TravelMode } from '../RouteUtils'
import axios from 'axios'
jest.mock('axios')

describe('Test isValidTravelMode', () => {
  test('Check Valid Travel Modes', () => {
    Object.values(TravelMode).forEach(element => {
      expect(isValidTravelMode(element)).toBe(true)
    })
  })

  test('Check invalid travel modes are false', () => {
    expect(isValidTravelMode('Apple')).toBe(false)
  })

  test('Check raw string travel mode is true', () => {
    expect(isValidTravelMode('TRANSIT')).toBe(true)
  })

  test('Check null travel mode is false', () => {
    expect(isValidTravelMode(null)).toBe(false)
  })

  test('Check undefined travel mode is false', () => {
    expect(isValidTravelMode()).toBe(false)
  })
})

describe('Test calculateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  const startLocation = { location: 'BCIT' }
  const endLocation = { location: 'UBC' }
  const travelMode = TravelMode.Transit
  const departureTime = '2026-03-24T19:20:21'
  const arrivalTime = '2026-03-24T18:19:20'

  test('Check valid travel mode calls api and returns route', async () => {
    const routeBody = {
      origin: startLocation,
      destination: endLocation,
      travelMode: travelMode,
      computeAlternativeRoutes: false,
      languageCode: 'en-US',
      units: 'METRIC',
    }
    const mockRoutes = { routes: [{ polyline: 'MockPolyline' }] }
    axios.post.mockResolvedValue({ data: mockRoutes })
    const result = await calculateRoute(startLocation, endLocation, travelMode)
    expect(result).toEqual({ polyline: 'MockPolyline' })
    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.VITE_API_BASE_URL}/api/requestRoute`,
      routeBody,
      { withCredentials: true }
    )
  })

  test('Check invalid travel mode throws error', async () => {
    const expectedError = routeStrings.invalidTravelMode
    await expect(
      calculateRoute(startLocation, endLocation, 'Tetris')
    ).rejects.toThrow(expectedError)
  })

  test('Check arrival time is part of post body, if specified', async () => {
    const routeBody = {
      origin: startLocation,
      destination: endLocation,
      travelMode: travelMode,
      computeAlternativeRoutes: false,
      languageCode: 'en-US',
      units: 'METRIC',
      arrivalTime: arrivalTime,
    }
    const mockRoutes = { routes: [{ polyline: 'MockPolyline' }] }
    axios.post.mockResolvedValue({ data: mockRoutes })
    const result = await calculateRoute(
      startLocation,
      endLocation,
      travelMode,
      { _arrivalTime: arrivalTime }
    )
    expect(result).toEqual({ polyline: 'MockPolyline' })
    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.VITE_API_BASE_URL}/api/requestRoute`,
      routeBody,
      { withCredentials: true }
    )
  })

  test('Check arrival/departure time is not part of post body, if not specified', async () => {
    const mockRoutes = { routes: [{ polyline: 'MockPolyline' }] }
    axios.post.mockResolvedValue({ data: mockRoutes })
    const result = await calculateRoute(startLocation, endLocation, travelMode)
    expect(result).toEqual({ polyline: 'MockPolyline' })
    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.VITE_API_BASE_URL}/api/requestRoute`,
      expect.not.objectContaining({
        arrivalTime: expect.anything(),
        departureTime: expect.anything(),
      }),
      { withCredentials: true }
    )
  })

  test('Check departure time is part of post body, if specified', async () => {
    const routeBody = {
      origin: startLocation,
      destination: endLocation,
      travelMode: travelMode,
      computeAlternativeRoutes: false,
      languageCode: 'en-US',
      units: 'METRIC',
      departureTime: departureTime,
    }
    const mockRoutes = { routes: [{ polyline: 'MockPolyline' }] }
    axios.post.mockResolvedValue({ data: mockRoutes })
    const result = await calculateRoute(
      startLocation,
      endLocation,
      travelMode,
      { _departureTime: departureTime }
    )
    expect(result).toEqual({ polyline: 'MockPolyline' })
    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.VITE_API_BASE_URL}/api/requestRoute`,
      routeBody,
      { withCredentials: true }
    )
  })

  test('Check arrival time is part of post body and departure time is not if both are specified', async () => {
    const mockRoutes = { routes: [{ polyline: 'MockPolyline' }] }
    axios.post.mockResolvedValue({ data: mockRoutes })
    const result = await calculateRoute(
      startLocation,
      endLocation,
      travelMode,
      { _arrivalTime: arrivalTime, _departureTime: departureTime }
    )
    expect(result).toEqual({ polyline: 'MockPolyline' })
    const body = axios.post.mock.calls[0][1]
    expect(body).toMatchObject({ arrivalTime: arrivalTime })
    expect(body).not.toHaveProperty('departureTime')
  })

  test('Check error thrown if no routes are returned from the api', async () => {
    const mockRoutes = { routes: [] }
    axios.post.mockResolvedValue({ data: mockRoutes })
    const expectedError = routeStrings.noRoutesError
    await expect(
      calculateRoute(startLocation, endLocation, TravelMode.Transit)
    ).rejects.toThrow(expectedError)
  })

  test('Check error thrown if there is an error in the response', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'Bad Request' },
      },
    })

    await expect(
      calculateRoute(startLocation, endLocation, travelMode)
    ).rejects.toThrow(routeStrings.routeAPIError)
  })

  test('Check error thrown if there is an error in the request', async () => {
    axios.post.mockRejectedValue({
      request: {},
    })

    await expect(
      calculateRoute(startLocation, endLocation, travelMode)
    ).rejects.toThrow(routeStrings.networkError)
  })

  test('Check route body contains all required fields', async () => {
    const mockRoutes = { routes: [{ polyline: 'MockPolyline' }] }
    axios.post.mockResolvedValue({ data: mockRoutes })
    await calculateRoute(startLocation, endLocation, travelMode)
    const body = axios.post.mock.calls[0][1]
    expect(body).toMatchObject({ computeAlternativeRoutes: false })
    expect(body).toMatchObject({ languageCode: 'en-US' })
    expect(body).toMatchObject({ units: 'METRIC' })
  })
})
