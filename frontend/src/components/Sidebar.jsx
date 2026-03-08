import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  ClickAwayListener,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  HomeOutlined,
  CommuteOutlined,
  PersonOutlineOutlined,
} from '@mui/icons-material'

const mainNavigation = [
  {
    id: 'Home',
    icon: <HomeOutlined />,
    label: 'Home',
    path: '/',
  },
  {
    id: 'My Trips',
    icon: <CommuteOutlined />,
    label: 'My Trips',
    path: '/mytrip',
  },
  {
    id: 'Dashboard',
    icon: <PersonOutlineOutlined />,
    label: 'Dashboard',
    path: '/Dashboard',
  },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleClose = () => {
    if (open) setOpen(false)
  }

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: 55,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 190 : 55,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          backgroundColor: '#F9F9F9',
          borderRight: '1px solid #E5E7EB',
          transition: 'width 0.2s ease-in-out',
          boxShadow: open ? '4px 0px 10px rgba(0,0,0,0.05)' : 'none',
          zIndex: 1201,
        },
      }}
    >
      <ClickAwayListener onClickAway={handleClose}>
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center p-4 ${open ? 'justify-end' : 'justify-center'}`}
          >
            <IconButton onClick={() => setOpen(!open)}>
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </div>

          <Divider />

          <List>
            {mainNavigation.map(({ id, icon, label, path }) => (
              <ListItem key={id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(path)
                    setOpen(false)
                  }}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    justifyContent: open ? 'initial' : 'center',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    sx={{ opacity: open ? 1 : 0, transition: 'opacity 0.2s' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {open && (
            <div className="mt-auto p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate('/user-guide')
                  setOpen(false)
                }}
                className="block py-2 text-xs text-gray-500"
              >
                USER GUIDE
              </button>
              <button
                onClick={() =>
                  (window.location.href = 'http://localhost:3000/logoutRoute')
                }
                className="block py-2 text-xs text-red-500 font-bold"
              >
                LOGOUT
              </button>
            </div>
          )}
        </div>
      </ClickAwayListener>
    </Drawer>
  )
}
