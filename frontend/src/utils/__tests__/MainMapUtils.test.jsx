import { render } from '@testing-library/react'
import { postGISToLatLng, RadiusCircle } from '../MainMapUtils'

// postGISToLatLng
describe('postGISToLatLng', () => {
  // From Google: PostGIS hex string for vancouver coordinates (123.1207, 49.2827)
  const vancouverHex = '0101000020E6100000E07A14AE47C75EC06512D19D65A44840'

  test('correctly extracts longitude and latitude from hex string', () => {
    const result = postGISToLatLng(vancouverHex)
    expect(result.lng).toBeCloseTo(-123.1207, 1)
    expect(result.lat).toBeCloseTo(49.2827, 1)
  })

  test('returns an object with lat and lng keys', () => {
    const result = postGISToLatLng(vancouverHex)
    expect(result).toHaveProperty('lat')
    expect(result).toHaveProperty('lng')
  })
})

const mockSetMap = jest.fn()
const mockCircleInstance = { setMap: mockSetMap }

beforeEach(() => {
  global.google = {
    maps: {
      Circle: jest.fn(() => mockCircleInstance),
    },
  }
})

afterEach(() => {
  jest.resetAllMocks()
})

jest.mock('@vis.gl/react-google-maps', () => ({
  useMap: jest.fn(),
}))

const { useMap } = require('@vis.gl/react-google-maps')

// RadiusCircle
describe('RadiusCircle', () => {
  const center = { lat: 49.2827, lng: -123.1207 }
  const radius = 1000

  test('creates a google.maps Circle with the correct properties', () => {
    const mockMap = {}
    useMap.mockReturnValue(mockMap)

    render(<RadiusCircle center={center} radius={radius} />)

    expect(global.google.maps.Circle).toHaveBeenCalledWith({
      map: mockMap,
      center,
      radius,
      strokeColor: '#6fa4ea',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#6fa4ea',
      fillOpacity: 0.08,
    })
  })

  test('does not create a circle when map is null', () => {
    useMap.mockReturnValue(null)
    render(<RadiusCircle center={center} radius={radius} />)
    expect(global.google.maps.Circle).not.toHaveBeenCalled()
  })

  test('does not create a circle when center is null', () => {
    useMap.mockReturnValue({})
    render(<RadiusCircle center={null} radius={radius} />)
    expect(global.google.maps.Circle).not.toHaveBeenCalled()
  })

  test('re-creates the circle when center changes', () => {
    useMap.mockReturnValue({})
    const { rerender } = render(
      <RadiusCircle center={center} radius={radius} />
    )

    const newCenter = { lat: 43.6532, lng: -79.3832 }
    rerender(<RadiusCircle center={newCenter} radius={radius} />)

    // confirms previous circle was removed from map
    expect(mockSetMap).toHaveBeenCalledWith(null)
    // confirms 2 circles were created, on mount and another recreated
    expect(global.google.maps.Circle).toHaveBeenCalledTimes(2)
  })

  test('re-creates the circle when radius changes', () => {
    useMap.mockReturnValue({})
    const { rerender } = render(<RadiusCircle center={center} radius={500} />)

    rerender(<RadiusCircle center={center} radius={2000} />)

    expect(mockSetMap).toHaveBeenCalledWith(null)
    expect(global.google.maps.Circle).toHaveBeenCalledTimes(2)
  })
})
