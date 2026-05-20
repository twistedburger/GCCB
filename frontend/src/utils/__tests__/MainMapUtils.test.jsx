import { render } from '@testing-library/react'
import { postGISToLatLng, reverseGeocode, RadiusCircle } from '../MainMapUtils'

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

//reverseGeocode
describe('reverseGeocode', () => {
  const mockGeocode = jest.fn()

  beforeEach(() => {
    global.google = {
      maps: {
        Geocoder: jest.fn(() => ({ geocode: mockGeocode })),
      },
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const buildComponents = ({
    streetNumber = '',
    route = '',
    locality = '',
    adminArea = '',
    postalCode = '',
    country = '',
  }) => [
    {
      types: ['street_number'],
      long_name: streetNumber,
      short_name: streetNumber,
    },
    { types: ['route'], long_name: route, short_name: route },
    { types: ['locality'], long_name: locality, short_name: locality },
    {
      types: ['administrative_area_level_1'],
      long_name: adminArea,
      short_name: adminArea,
    },
    { types: ['postal_code'], long_name: postalCode, short_name: postalCode },
    { types: ['country'], long_name: country, short_name: country },
  ]

  test('returns formatted address as [street, city line, country]', async () => {
    mockGeocode.mockResolvedValue({
      results: [
        {
          address_components: buildComponents({
            streetNumber: '777',
            route: 'Pacific Blvd',
            locality: 'Vancouver',
            adminArea: 'BC',
            postalCode: 'V6B 4Y8',
            country: 'Canada',
          }),
        },
      ],
    })

    const result = await reverseGeocode({ lat: 49.2827, lng: -123.1207 })

    expect(result).toEqual([
      '777 Pacific Blvd',
      'Vancouver, BC, V6B 4Y8',
      'Canada',
    ])
  })

  test('throws an error when geocoding returns no results', async () => {
    mockGeocode.mockResolvedValue({ results: [] })

    await expect(reverseGeocode({ lat: 0, lng: 0 })).rejects.toThrow()
  })

  test('omits street line when street number and route are missing', async () => {
    mockGeocode.mockResolvedValue({
      results: [
        {
          address_components: buildComponents({
            locality: 'Vancouver',
            adminArea: 'BC',
            postalCode: 'V6B 4Y8',
            country: 'Canada',
          }),
        },
      ],
    })

    const result = await reverseGeocode({ lat: 49.2827, lng: -123.1207 })

    expect(result).toEqual(['Vancouver, BC, V6B 4Y8', 'Canada'])
  })

  test('uses sublocality when locality is missing', async () => {
    mockGeocode.mockResolvedValue({
      results: [
        {
          address_components: [
            {
              types: ['sublocality'],
              long_name: 'Downtown',
              short_name: 'Downtown',
            },
            {
              types: ['administrative_area_level_1'],
              long_name: 'British Columbia',
              short_name: 'BC',
            },
            {
              types: ['postal_code'],
              long_name: 'V6B 4Y8',
              short_name: 'V6B 4Y8',
            },
            { types: ['country'], long_name: 'Canada', short_name: 'Canada' },
          ],
        },
      ],
    })

    const result = await reverseGeocode({ lat: 49.2827, lng: -123.1207 })

    expect(result[0]).toContain('Downtown')
  })

  test('omits missing fields from city line', async () => {
    mockGeocode.mockResolvedValue({
      results: [
        {
          address_components: buildComponents({
            locality: 'Vancouver',
            country: 'Canada',
          }),
        },
      ],
    })

    const result = await reverseGeocode({ lat: 49.2827, lng: -123.1207 })

    expect(result).toEqual(['Vancouver', 'Canada'])
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
