import PropTypes from 'prop-types'
import bcitCover from '../assets/bcit.jpg'
import {
  OutlinedFlagRounded,
  VerifiedOutlined,
  ReportGmailerrorred,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { eventCardStrings } from '../locales/en/ComponentStrings/EventCardStrings'

export default function EventCard({ event, view, onReport }) {
  const dateObj = new Date(event.event_time)
  const navigate = useNavigate()
  const [bannerUrl, setBannerUrl] = useState(event.banner_url)

  useEffect(() => {
    const refreshBanner = async () => {
      if (!event.place_id) {
        setBannerUrl(bcitCover)
        return
      }
      try {
        const response = await fetch(
          'http://localhost:3000/api/refresh-banner',
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              placeID: event.place_id,
              eventID: event.id,
            }),
          }
        )
        const data = await response.json()
        setBannerUrl(data.bannerUrl || bcitCover)
      } catch (err) {
        console.error(eventCardStrings.refreshFailed, err)
        setBannerUrl(bcitCover)
      }
    }

    if (!event.banner_url) {
      refreshBanner()
      return
    }

    const img = new Image()
    img.src = event.banner_url
    img.onerror = () => refreshBanner()
  }, [event.id, event.banner_url, event.place_id])

  return (
    <div
      onClick={() => {
        navigate(`/event/${event.id}`)
      }}
      className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white"
    >
      <div className="relative">
        <img
          src={bannerUrl || bcitCover}
          className="h-24 w-full object-cover rounded-t-xl"
        />
        {view != 'moderator' && (
          <ReportGmailerrorred
            className="absolute top-2 right-2"
            onClick={e => {
              e.stopPropagation()
              onReport({ id: event.id, title: event.title, type: 'event' })
            }}
          />
        )}
      </div>
      <div className="flex p-4 gap-4">
        <div className="flex flex-col justify-center text-center px-2 shrink-0">
          <span className="text-dark-grey font-medium">
            {dateObj && !isNaN(dateObj)
              ? dateObj
                  .toLocaleDateString('en-US', { month: 'short' })
                  .toUpperCase()
              : '—'}
          </span>
          <span className="text-2xl text-text-primary font-bold -mt-1">
            {dateObj && !isNaN(dateObj) ? dateObj.getDate() : '—'}
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
            <OutlinedFlagRounded fontSize="small" className="shrink-0" />
            <p className="truncate">{event.location}</p>
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
    </div>
  )
}

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  view: PropTypes.string,
  onReport: PropTypes.func.isRequired,
}
