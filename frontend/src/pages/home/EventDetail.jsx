import GenericButton from '../../components/GenericButton'
import OrganizerCard from '../../components/OrganizerCard'
import RouteCard from '../../components/RouteCard'
import RouteDetail from './RouteDetail'
import { Cancel } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom'
import bcitCover from '../../assets/bcit.jpg'
import { OutlinedFlagRounded, VerifiedOutlined } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Drawer } from 'vaul'

export default function EventDetail() {
  const location = useLocation()
  const id = location.pathname.split('/').pop()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const dateObj = event ? new Date(event.event_time) : null
  const [open, setOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const menuOpen = Boolean(anchorEl)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const { setSnapPoint } = useOutletContext()
  const [eventSnapPoint, setEventSnapPoint] = useState(1)
  const [routeSnapPoint, setRouteSnapPoint] = useState(0.25)

  useEffect(() => {
    const fetchEvent = async () => {
      const response = await fetch(
        `http://localhost:3000/api/eventdetail/${id}`
      )
      const data = await response.json()
      setEvent(data)
    }
    fetchEvent()
  }, [id])

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => navigate(-1), 300)
  }

  return (
    <div>
      <Drawer.Root
        open={open}
        onOpenChange={open => !open && handleClose()}
        modal={false}
        snapPoints={[0.095, 1]}
        activeSnapPoint={eventSnapPoint}
        setActiveSnapPoint={setEventSnapPoint}
        noBodyStyles={true}
        setBackgroundColorOnScale={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay style={{ pointerEvents: 'none' }} />
          <Drawer.Content
            style={{
              zIndex: 40,
              marginLeft: '55px',
              width: 'calc(100% - 55px)',
              height: '100%',
              position: 'fixed',
              bottom: 0,
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Drawer.Title className="sr-only">Event Detail</Drawer.Title>
            <Drawer.Description className="sr-only">
              Event details
            </Drawer.Description>
            <div
              style={{
                pointerEvents: 'auto',
                background: '#F9F9F9',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflowY: 'auto',
              }}
            >
              <div className="relative">
                <img src={bcitCover} className="h-32 w-full object-cover" />
                <div className="absolute top-2 right-2">
                  <GenericButton
                    onClick={handleClose}
                    unstyled={true}
                    customStyling="text-text-primary scale-110"
                  >
                    <Cancel />
                  </GenericButton>
                </div>
              </div>
              {event && dateObj && (
                <div>
                  <div className="flex p-4 gap-4">
                    <div className="flex flex-col justify-center text-center px-2 shrink-0">
                      <span className="text-dark-grey font-medium">
                        {dateObj
                          .toLocaleDateString('en-US', { month: 'short' })
                          .toUpperCase()}
                      </span>
                      <span className="text-2xl text-text-primary font-bold -mt-1">
                        {dateObj.getDate()}
                      </span>
                      <span className="text-xs text-text-secondary mt-1 whitespace-nowrap">
                        {dateObj.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <div className="border-r text-text-secondary -my-1"></div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-text-secondary flex text-xs items-center gap-1 min-w-0">
                        <OutlinedFlagRounded
                          fontSize="small"
                          className="shrink-0"
                        />
                        <p className="truncate flex-1">{event.location}</p>
                        <IconButton
                          size="small"
                          onClick={e => setAnchorEl(e.currentTarget)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={menuOpen}
                          onClose={() => setAnchorEl(null)}
                        >
                          <MenuItem
                            onClick={() => {
                              setAnchorEl(null)
                              navigate(`/report`, {
                                state: {
                                  type: 'event',
                                  targetId: event.id,
                                  targetName: event.title,
                                },
                              })
                            }}
                          >
                            Report Event
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setAnchorEl(null)
                              navigate(`/report`, {
                                state: {
                                  type: 'user',
                                  targetId: event.creator_id,
                                  targetName: event.creator_name,
                                },
                              })
                            }}
                          >
                            Report Organizer
                          </MenuItem>
                        </Menu>
                      </div>
                      <div className="flex flex-row items-center">
                        <h3 className="font-semibold text-lg text-text-primary mr-1">
                          {event.title}
                        </h3>
                        {event.verified && (
                          <VerifiedOutlined fontSize="small" />
                        )}
                      </div>
                      <span className="text-xs text-text-secondary mt-1">
                        {event.description}
                      </span>
                    </div>
                  </div>
                  <div className="px-6">
                    <OrganizerCard
                      user={{
                        id: event.creator_id,
                        name: event.creator_name,
                        nickname: event.nickname,
                        role: '',
                        description: '',
                        profile_pic: event.profile_pic,
                        active: true,
                      }}
                    />
                    <div>
                      <p className="font-semibold pt-4 pb-2 text-text-primary">
                        Travel Options
                      </p>
                      <div className="flex flex-col gap-2">
                        {event.routes && event.routes.length > 0 ? (
                          event.routes.map(route => (
                            <RouteCard
                              key={route.id}
                              route={route}
                              individualView={false}
                              onSelect={route => {
                                setSelectedRoute(route)
                                setEventSnapPoint(0.095)
                                setSnapPoint(0.095)
                                document.activeElement?.blur()
                              }}
                            />
                          ))
                        ) : (
                          <p className="text-text-secondary text-sm text-center py-4">
                            No travel options available for this event.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      <Drawer.Root
        open={!!selectedRoute}
        onOpenChange={open => !open && setSelectedRoute(null)}
        modal={false}
        snapPoints={[0.095, 0.25, 0.4]}
        activeSnapPoint={routeSnapPoint}
        setActiveSnapPoint={setRouteSnapPoint}
        noBodyStyles={true}
        setBackgroundColorOnScale={false}
        dismissible={false}
        preventScrollRestoration={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay style={{ pointerEvents: 'none' }} />
          <Drawer.Content
            style={{
              zIndex: 50,
              marginLeft: '55px',
              width: 'calc(100% - 55px)',
              borderRadius: '24px 24px 0 0',
              height: '96%',
              position: 'fixed',
              bottom: 0,
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
            }}
          >
            <Drawer.Title className="sr-only">Route Detail</Drawer.Title>
            <Drawer.Description className="sr-only">
              Route details
            </Drawer.Description>
            <div
              style={{
                pointerEvents: 'auto',
                background: '#F9F9F9',
                borderRadius: '24px 24px 0 0',
              }}
            >
              {selectedRoute && (
                <RouteDetail
                  selectedRoute={selectedRoute}
                  onClose={() => {
                    setSelectedRoute(null)
                    setEventSnapPoint(1)
                    setSnapPoint(1)
                  }}
                />
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
