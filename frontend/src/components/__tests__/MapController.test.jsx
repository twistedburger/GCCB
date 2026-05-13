import { render } from '@testing-library/react'
import { act } from 'react'
import MapController from '../MapController'
import { DrawRoute } from '../../utils/MapControllerUtils'
import { useMap } from '@vis.gl/react-google-maps'

jest.mock('@vis.gl/react-google-maps', () => ({
  useMap: jest.fn(),
}))

jest.mock('../../utils/MapControllerUtils', () => ({
  DrawRoute: jest.fn(),
}))

const mockMap = { panTo: jest.fn() }
const mockCenter = { lat: 49.28, lng: -123.12 }
const mockRoute = { path: { polyline: { encodedPolyline: 'fake' } } }

describe('Test MapController calls expected functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useMap.mockReturnValue(mockMap)
    DrawRoute.mockResolvedValue(undefined)
  })

  test('pans to center when map and center are available', async () => {
    await act(async () => {
      render(<MapController center={mockCenter} route={mockRoute} />)
    })
    expect(mockMap.panTo).toHaveBeenCalledWith(mockCenter)
  })

  test('calls DrawRoute with map and route', async () => {
    await act(async () => {
      render(<MapController center={mockCenter} route={mockRoute} />)
    })
    expect(DrawRoute).toHaveBeenCalledWith(mockMap, mockRoute)
  })

  test('calls DrawRoute cleanup on unmount', async () => {
    const cleanup = jest.fn()
    DrawRoute.mockResolvedValue(cleanup)

    let unmount
    await act(async () => {
      ;({ unmount } = render(
        <MapController center={mockCenter} route={mockRoute} />
      ))
    })

    unmount()
    expect(cleanup).toHaveBeenCalled()
  })
})
