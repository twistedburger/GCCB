import { useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  CommuteOutlined,
  PersonOutlineOutlined,
} from '@mui/icons-material'

export default function NavigationBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { id: 'home', Icon: HomeOutlined, label: 'Home', path: '/' },
    { id: 'mytrip', Icon: CommuteOutlined, label: 'My Trips', path: '/mytrip' },
    {
      id: 'dashboard',
      Icon: PersonOutlineOutlined,
      label: 'Dashboard',
      path: '/dashboard',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 flex justify-around w-full bg-background-off-white h-20 border-t border-light-grey">
      {navigationItems.map(({ id, Icon, label, path }) => {
        const isSelected = location.pathname === path
        return (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={isSelected ? 'text-blue-primary' : 'text-medium-grey'}
          >
            <Icon sx={{ fontSize: 28 }} />
            <p className="text-[10px]">{label}</p>
          </button>
        )
      })}
    </nav>
  )
}
