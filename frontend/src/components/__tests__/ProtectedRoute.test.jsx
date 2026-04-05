import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CheckAuthorization } from '../ProtectedRoute'
import ProtectedRoute from '../ProtectedRoute'
import { useAuth, authLevel } from '../../hooks/Authorization'

describe('Test CheckAuthorization', () => {
  test('User when required is User', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.USER.label,
      authLevel.USER
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('User when required is Moderator', () => {
    const expected_authorization = false
    const actual_authorization = CheckAuthorization(
      authLevel.USER.label,
      authLevel.MODERATOR
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('User when required is Admin', () => {
    const expected_authorization = false
    const actual_authorization = CheckAuthorization(
      authLevel.USER.label,
      authLevel.ADMIN
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('User when required is SuperAdmin', () => {
    const expected_authorization = false
    const actual_authorization = CheckAuthorization(
      authLevel.USER.label,
      authLevel.SUPERADMIN
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('Moderator when required is User', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.MODERATOR.label,
      authLevel.USER
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('Moderator when required is Moderator', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.MODERATOR.label,
      authLevel.MODERATOR
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('Moderator when required is Admin', () => {
    const expected_authorization = false
    const actual_authorization = CheckAuthorization(
      authLevel.MODERATOR.label,
      authLevel.ADMIN
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('Moderator when required is SuperAdmin', () => {
    const expected_authorization = false
    const actual_authorization = CheckAuthorization(
      authLevel.MODERATOR.label,
      authLevel.SUPERADMIN
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('Admin when required is User', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.ADMIN.label,
      authLevel.USER
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('Admin when required is Moderator', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.ADMIN.label,
      authLevel.MODERATOR
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('Admin when required is Admin', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.ADMIN.label,
      authLevel.ADMIN
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('Admin when required is SuperAdmin', () => {
    const expected_authorization = false
    const actual_authorization = CheckAuthorization(
      authLevel.ADMIN.label,
      authLevel.SUPERADMIN
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('SuperAdmin when required is User', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.SUPERADMIN.label,
      authLevel.USER
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('SuperAdmin when required is Moderator', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.SUPERADMIN.label,
      authLevel.MODERATOR
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('SuperAdmin when required is Admin', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.SUPERADMIN.label,
      authLevel.ADMIN
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
  test('SuperAdmin when required is SuperAdmin', () => {
    const expected_authorization = true
    const actual_authorization = CheckAuthorization(
      authLevel.SUPERADMIN.label,
      authLevel.SUPERADMIN
    )
    expect(actual_authorization).toBe(expected_authorization)
  })
})

jest.mock('../../hooks/Authorization', () => ({
  ...jest.requireActual('../../hooks/Authorization'),
  useAuth: jest.fn(),
}))

describe('TestProtectedRoute', () => {
  const renderProtectedRoute = (authorizationLabel, requiredAuthorization) => {
    useAuth.mockReturnValue({ authorization: authorizationLabel })
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route
            element={
              <ProtectedRoute requiredAuthorization={requiredAuthorization} />
            }
          >
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  test('allow route access when user has sufficient authorization', () => {
    renderProtectedRoute(authLevel.USER.label, authLevel.USER)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  test('redirects to / when user has insufficient authorization', () => {
    renderProtectedRoute(authLevel.USER.label, authLevel.MODERATOR)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
