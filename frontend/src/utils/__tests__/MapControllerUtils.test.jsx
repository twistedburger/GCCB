import { DrawRoute } from '../MapControllerUtils'

const mockPolyline = {
  setMap: jest.fn(),
}
const mockPin = {
  map: 'some-map',
}

global.google = {
  maps: {
    importLibrary: jest.fn().mockResolvedValue({
      AdvancedMarkerElement: jest.fn().mockReturnValue(mockPin),
      PinElement: jest.fn().mockReturnValue({ element: {} }),
      encoding: {
        decodePath: jest.fn().mockReturnValue([
          { lat: 49.28, lng: -123.12 },
          { lat: 49.29, lng: -123.13 },
        ]),
      },
    }),
    LatLngBounds: jest.fn().mockReturnValue({ extend: jest.fn() }),
    Polyline: jest.fn().mockReturnValue(mockPolyline),
  },
}

describe('Test map cleanups from route lines', () => {
  const mockMap = { fitBounds: jest.fn() }

  test('basic route cleanup removes polyline and pins from map', async () => {
    const route = {
      path: {
        polyline: { encodedPolyline: 'fake' },
      },
      transportation_mode: 'DRIVE',
    }

    const cleanup = await DrawRoute(mockMap, route)
    cleanup()

    expect(mockPolyline.setMap).toHaveBeenCalledWith(null)
    expect(mockPin.map).toBeNull()
  })

  test('transit route cleanup removes polyline and pins from map', async () => {
    const route = {
      path: {
        polyline: { encodedPolyline: 'fake' },
        legs: [
          {
            steps: [
              { travelMode: 'WALK', polyline: { encodedPolyline: 'fake' } },
            ],
          },
        ],
      },
      transportation_mode: 'TRANSIT',
    }

    const cleanup = await DrawRoute(mockMap, route)
    cleanup()

    expect(mockPolyline.setMap).toHaveBeenCalledWith(null)
    expect(mockPin.map).toBeNull()
  })
})
