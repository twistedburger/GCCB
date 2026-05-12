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
  Avatar,
  Typography,
  Box,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  HomeOutlined,
  CommuteOutlined,
  PersonOutlineOutlined,
  AdminPanelSettingsOutlined,
  PersonOffOutlined,
  ForumOutlined,
  NotificationsNoneOutlined,
} from '@mui/icons-material'
import { authLevel } from '../hooks/Authorization'
import PropTypes from 'prop-types'
import { sidebarStrings } from '../locales/en/ComponentStrings/SidebarStrings'

/**
 * An array of navigation items for the main sidebar.
 *
 * @type {Array<{id: string, icon: React.ReactNode, label: string, path: string}>}
 */

const mainNavigation = [
  {
    id: 'Home',
    icon: <HomeOutlined />,
    label: sidebarStrings.home,
    path: '/',
  },
  {
    id: 'My Trips',
    icon: <CommuteOutlined />,
    label: sidebarStrings.myTrips,
    path: '/mytrip',
  },
  {
    id: 'Dashboard',
    icon: <PersonOutlineOutlined />,
    label: sidebarStrings.dashboard,
    path: '/dashboard',
  },
  {
    id: 'Moderate',
    icon: <AdminPanelSettingsOutlined />,
    label: sidebarStrings.moderate,
    path: '/moderate',
  },
  {
    id: 'Banned Users',
    icon: <PersonOffOutlined />,
    label: sidebarStrings.bannedUsers,
    path: '/bannedusers',
  },
  {
    id: 'Chats',
    icon: <ForumOutlined />,
    label: sidebarStrings.chats,
    path: '/chat',
  },
  {
    id: 'Notifications',
    icon: <NotificationsNoneOutlined />,
    label: sidebarStrings.notifications,
    path: '/notifications',
  },
]

/**
 * A sidebar component for navigation.
 *
 * @param {Object} props
 * @param {string} props.userRole - The role of the current user.
 * @param {Object} props.userData - The data of the current user.
 * @returns {JSX.Element}
 */

export default function Sidebar({ userData }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const userRole = userData?.role || 'USER'

  const navItems = mainNavigation.filter(item => {
    const isModeratorItem = item.id === 'Moderate' || item.id === 'Banned Users'
    const isUserModerator = userRole === authLevel.MODERATOR.label

    return !isModeratorItem || isUserModerator
  })

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

          <Box
            sx={{
              display: 'flex',
              flexDirection: open ? 'row' : 'column',
              alignItems: 'center',
              px: open ? 2 : 0,
              pb: 2,
              transition: 'all 0.2s',
            }}
          >
            <Avatar
              src={userData?.profile_pic}
              alt={userData?.name}
              sx={{
                width: open ? 45 : 32,
                height: open ? 45 : 32,
                transition: 'all 0.2s',
                border: '2px solid #E5E7EB',
              }}
            />
            {open && (
              <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ fontWeight: 'bold', color: '#111827' }}
                >
                  {userData?.name}
                </Typography>
                <Typography
                  variant="caption"
                  noWrap
                  component="div"
                  sx={{ color: '#6B7280', lineHeight: 1 }}
                >
                  @{userData?.nickname}
                </Typography>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    color: 'var(--color-blue-primary)',
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                >
                  {userRole}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          <List>
            {navItems.map(({ id, icon, label, path }) => (
              <ListItem key={id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(path)
                    setOpen(false)
                  }}
                  sx={{
                    height: 52,
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
                {sidebarStrings.userGuide}
              </button>
              <button
                onClick={() =>
                  (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/logoutRoute`)
                }
                className="block py-2 text-xs text-red-500 font-bold"
              >
                {sidebarStrings.logout}
              </button>
            </div>
          )}
        </div>
      </ClickAwayListener>
    </Drawer>
  )
}

Sidebar.propTypes = { userData: PropTypes.object }
