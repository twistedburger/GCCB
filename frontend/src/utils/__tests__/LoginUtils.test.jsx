import { getSSOProviders } from '../LoginUtils'

describe('Test getSSOProviders', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('returns schools on connect', async () => {
    const mockData = [
      { sso_connection: 'UBC_Connection', school_name: 'UBC' },
      { sso_connection: 'SFU_Connection', school_name: 'SFU' },
    ]

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    })

    const result = await getSSOProviders('bc')

    expect(result).toEqual([
      { value: 'UBC_Connection', label: 'UBC' },
      { value: 'SFU_Connection', label: 'SFU' },
    ])
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/sso_list?search=bc'
    )
  })

  test('returns empty array when response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Internal Server Error'),
    })

    const result = await getSSOProviders('bc')
    expect(result).toEqual([])
  })

  test('returns empty array when response JSON is falsy', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(null),
    })

    const result = await getSSOProviders('bc')
    expect(result).toEqual([])
  })
})
