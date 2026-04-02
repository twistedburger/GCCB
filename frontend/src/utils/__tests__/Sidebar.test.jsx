import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../../components/Sidebar'
import { authLevel } from '../../utils/Authorization'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('Sidebar', () => {
  const renderSidebar = (userRole = '') =>
    render(<Sidebar userRole={userRole} />)

  //open/close toggle tests
  test('renders in closed state by default', () => {
    renderSidebar()
    expect(screen.queryByText('Home')).not.toBeVisible()
  })

  test('opens when menu button is clicked', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    expect(screen.getByText('Home')).toBeVisible()
  })

  test('closes when chevron button is clicked while open', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    fireEvent.click(screen.getByTestId('ChevronLeftIcon').closest('button'))
    expect(screen.queryByText('Home')).not.toBeVisible()
  })

  //clickaway tests
  test('does not close sidebar when already closed', () => {
    renderSidebar()
    fireEvent.mouseDown(document)
    expect(screen.queryByText('USER GUIDE')).not.toBeInTheDocument()
  })

  test('closes sidebar when handleClose is triggered while open', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    expect(screen.getByText('USER GUIDE')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('ChevronLeftIcon').closest('button'))
    expect(screen.queryByText('USER GUIDE')).not.toBeInTheDocument()
  })

  // moderator access tests
  test('hides Moderate item for non-moderator users', () => {
    renderSidebar('user')
    expect(screen.queryByText('Moderate')).not.toBeInTheDocument()
  })

  test('shows Moderate item for moderator users', () => {
    renderSidebar(authLevel.MODERATOR.label)
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    expect(screen.getByText('Moderate')).toBeInTheDocument()
  })

  // navigation on item click tests
  test('navigates to home when Home is clicked', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    fireEvent.click(screen.getByText('Home'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  test('navigates to /mytrip when My Trips is clicked', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    fireEvent.click(screen.getByText('My Trips'))
    expect(mockNavigate).toHaveBeenCalledWith('/mytrip')
  })

  test('navigates to /dashboard when Dashboard is clicked', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    fireEvent.click(screen.getByText('Dashboard'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  test('navigates to /moderate when Moderate is clicked', () => {
    renderSidebar(authLevel.MODERATOR.label)
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    fireEvent.click(screen.getByText('Moderate'))
    expect(mockNavigate).toHaveBeenCalledWith('/moderate')
  })

  test('closes sidebar after navigation', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    fireEvent.click(screen.getByText('Home'))
    expect(screen.queryByText('Home')).not.toBeVisible()
  })

  // user guide/logout button tests
  test('shows User Guide and Logout buttons when sidebar is open', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    expect(screen.getByText('USER GUIDE')).toBeInTheDocument()
    expect(screen.getByText('LOGOUT')).toBeInTheDocument()
  })

  test('hides User Guide and Logout buttons when sidebar is closed', () => {
    renderSidebar()
    expect(screen.queryByText('USER GUIDE')).not.toBeInTheDocument()
    expect(screen.queryByText('LOGOUT')).not.toBeInTheDocument()
  })

  test('navigates to /user-guide when User Guide is clicked', () => {
    renderSidebar()
    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'))
    fireEvent.click(screen.getByText('USER GUIDE'))
    expect(mockNavigate).toHaveBeenCalledWith('/user-guide')
  })
})
