import GenericButton from '../../components/GenericButton'
import OrganizerCard from '../../components/OrganizerCard'
import RouteCard from '../../components/RouteCard'
import { Cancel } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import bcitCover from '../../assets/bcit.jpg'
import { OutlinedFlagRounded, VerifiedOutlined } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'

export default function EventDetail() {
  const location = useLocation()
  const id = location.pathname.split('/').pop()
  const navigate = useNavigate()
  const [isClosing, setIsClosing] = useState(false)
  const [event, setEvent] = useState(null)
  const dateObj = event ? new Date(event.event_time) : null
  const [anchorEl, setAnchorEl] = useState(null)
  const menuOpen = Boolean(anchorEl)

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
    setIsClosing(true)
    setTimeout(() => navigate(-1), 300)
  }

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background-off-white ml-13.75 ${isClosing ? 'sheet-exit' : 'sheet-enter'}`}
        style={{ maxHeight: '100dvh', overflowY: 'auto' }}
      >
        <div className="flex flex-col justify-between h-screen">
          <div className="flex-1 w-full">
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
                      {event.verified && <VerifiedOutlined fontSize="small" />}
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
        </div>
      </div>
    </>
  )
}
