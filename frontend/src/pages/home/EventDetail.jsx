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
import CreateRoute from '../../components/CreateRoute'
import Alert from '../../components/Alert'
import Report from '../../components/Report'

/**
 * Displays the event detail drawer
 * @returns {JSX.Element}
 */
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
  const { setSnapPoint, setSelectedRoute: setHomeSelectedRoute } =
    useOutletContext()
  const [eventSnapPoint, setEventSnapPoint] = useState(1)
  const [addRoute, setAddRoute] = useState(false)
  const [alert, setAlert] = useState(null)

  const [reportData, setReportData] = useState(null)

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => navigate(-1), 300)
  }
  const handleAddRoute = async routeData => {
    try {
      const response = await fetch(`http://localhost:3000/api/createRoute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...routeData,
          eventID: event.id,
        }),
      })

      const result = await response.json()

      setAlert({
        type: response.ok ? 'success' : 'error',
        message: response.ok
          ? 'Route created successfully!'
          : 'Error creating route. Please try again.',
      })

      if (response.ok) {
        const newRouteForState = {
          ...routeData,
          id: result.routeID,
          transportation_mode: routeData.transportationMode,
          created_at: new Date(),
        }
        setEvent(prevEvent => ({
          ...prevEvent,
          routes: [...(prevEvent.routes || []), newRouteForState],
        }))
      }
    } catch (error) {
      console.error('Error creating route:', error)
      setAlert({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      })
    }
  }

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

  return (
    <div>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onTimeout={() => setAlert(null)}
        />
      )}
      {event && (
        <>
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 45,
              marginLeft: '27px',
            }}
          >
            <GenericButton type="button" onClick={() => setAddRoute(true)}>
              Add a Route
            </GenericButton>
          </div>
        </>
      )}
      <Drawer.Root
        open={open}
        onOpenChange={open => !open && handleClose()}
        modal={false}
        snapPoints={[0.01, 1]}
        activeSnapPoint={eventSnapPoint}
        setActiveSnapPoint={setEventSnapPoint}
        noBodyStyles={true}
        setBackgroundColorOnScale={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay style={{ pointerEvents: 'none' }} />
          <Drawer.Content
            onInteractOutside={e => {
              if (addRoute) {
                const isInsideNested =
                  e.target.closest('[data-vaul-drawer]') ||
                  e.target.closest('input')

                if (isInsideNested) {
                  return
                }
                e.preventDefault()
              }
            }}
            onOpenAutoFocus={e => e.preventDefault()}
            onCloseAutoFocus={e => e.preventDefault()}
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
              {event && dateObj && (
                <div>
                  <div className="relative">
                    <img
                      src={event.banner_url || bcitCover}
                      className="h-32 w-full object-cover"
                    />
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
                        <>
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
                            disableAutoFocus
                            disableEnforceFocus
                            disableRestoreFocus
                          >
                            <MenuItem
                              onClick={() => {
                                setAnchorEl(null)
                                setReportData({
                                  type: 'event',
                                  targetId: event.id,
                                  title: event.title,
                                })
                              }}
                            >
                              Report Event
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setAnchorEl(null)
                                setReportData({
                                  type: 'user',
                                  targetId: event.creator_id,
                                  title: event.creator_name,
                                })
                              }}
                            >
                              Report Organizer
                            </MenuItem>
                          </Menu>
                        </>
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
                              onReport={data => setReportData(data)}
                              individualView={false}
                              onSelect={route => {
                                const fullRoute = {
                                  ...route,
                                  creator_id: event.creator_id,
                                  creator_name: event.creator_name,
                                  nickname: event.nickname,
                                  profile_pic: event.profile_pic,
                                }
                                setSelectedRoute(fullRoute)
                                setHomeSelectedRoute(fullRoute)
                                setEventSnapPoint(0.01)
                                setSnapPoint(0.085)
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
                  <Drawer.NestedRoot
                    open={!!reportData}
                    onOpenChange={open => {
                      if (!open) setReportData(null)
                    }}
                    shouldScaleBackground={false}
                    dismissible={false}
                  >
                    <Drawer.Portal>
                      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
                      <Drawer.Content
                        onPointerDownOutside={() => setReportData(null)}
                        className="fixed bottom-0 left-13.75 right-0 z-50 flex flex-col rounded-t-3xl bg-white"
                      >
                        <div className="flex-1 p-4">
                          <div className="absolute top-4 right-4 z-10">
                            <GenericButton
                              onClick={() => setReportData(null)}
                              unstyled={true}
                              customStyling="text-text-primary scale-110"
                            >
                              <Cancel />
                            </GenericButton>
                          </div>
                          {reportData && (
                            <>
                              <Drawer.Title className="text-lg font-bold mb-4">
                                Report {reportData.title}
                              </Drawer.Title>
                              <Drawer.Description className="sr-only">
                                Report Page
                              </Drawer.Description>
                              <Report
                                type={reportData.type}
                                targetId={reportData.targetId}
                                onClose={() => setReportData(null)}
                                setAlert={reportAlert => {
                                  if (!reportAlert || !reportAlert.type) return
                                  setAlert({
                                    type: reportAlert.type,
                                    message: reportAlert.text,
                                  })
                                }}
                              />
                            </>
                          )}
                        </div>
                      </Drawer.Content>
                    </Drawer.Portal>
                  </Drawer.NestedRoot>
                  <Drawer.NestedRoot open={addRoute} onOpenChange={setAddRoute}>
                    <Drawer.Portal>
                      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
                      <Drawer.Content
                        className="fixed bottom-0 left-13.75 right-0 z-50 flex flex-col rounded-t-3xl bg-white"
                        style={{ height: '90%' }}
                        onPointerDownOutside={e => e.preventDefault()}
                        onInteractOutside={e => e.preventDefault()}
                      >
                        <div
                          className="p-4 overflow-y-auto"
                          onPointerDown={e => e.stopPropagation()}
                        >
                          {/* Close Button */}
                          <div className="flex justify-end mb-2">
                            <GenericButton
                              onClick={() => setAddRoute(false)}
                              unstyled={true}
                              customStyling="text-text-primary scale-110"
                            >
                              <Cancel />
                            </GenericButton>
                          </div>

                          <Drawer.Title className="text-lg font-bold mb-4">
                            Create a New Route
                          </Drawer.Title>

                          <CreateRoute
                            initLoc={event.location}
                            eventTime={event.event_time}
                            onSubmit={routeData => {
                              handleAddRoute(routeData)
                              setAddRoute(false)
                            }}
                          />
                        </div>
                      </Drawer.Content>
                    </Drawer.Portal>
                  </Drawer.NestedRoot>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      <RouteDetail
        selectedRoute={selectedRoute}
        onClose={() => {
          setSelectedRoute(null)
          setHomeSelectedRoute(null)
          setEventSnapPoint(1)
          setSnapPoint(1)
        }}
        setAlert={reportAlert => {
          if (!reportAlert?.type) return
          setAlert({
            ...reportAlert,
            message:
              reportAlert.type === 'success'
                ? 'Report submitted successfully.'
                : 'Failed to submit report.',
          })
        }}
      />
    </div>
  )
}
