import PropTypes from 'prop-types'
import GenericCard from './GenericCard'
import { useEffect, useState } from 'react'
import { notificationStrings } from '../locales/en/NotificationStrings'
import {
  clearNotification,
  getNotificationDetails,
} from '../utils/NotificationUtils'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'

export default function NotificationCard({ notification }) {
  const [notificationDetails, setNotificationDetails] = useState(null)
  const { notifications, setNotifications } = useNotifications()
  const navigate = useNavigate()
  useEffect(() => {
    const fetchDetails = async () => {
      const { details } = await getNotificationDetails(notification, navigate)
      setNotificationDetails(details)
    }
    fetchDetails()
  }, [notification, navigate])

  return notificationDetails ? (
    <GenericCard
      onClick={() => {
        clearNotification(notification.notificationID)
        setNotifications(
          notifications.filter(
            notificationToCheck =>
              notificationToCheck.notificationID !== notification.notificationID
          )
        )
        notificationDetails.onClick()
      }}
    >
      <div className="flex flex-col justify-start m-4 gap-2">
        <div className="flex flex-row items-center justify-start gap-4">
          <h1 className="font-bold text-lg">{notificationDetails.title}</h1>
          <p className="text-gray-600 text-sm">
            {new Date(notificationDetails.time).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </p>
        </div>
        <p className="text-left">{notificationDetails.message}</p>
      </div>
    </GenericCard>
  ) : (
    <GenericCard>{notificationStrings.loading}</GenericCard>
  )
}

NotificationCard.propTypes = {
  notification: PropTypes.shape({
    notificationID: PropTypes.number.isRequired,
    notificationType: PropTypes.object.isRequired,
    routeID: PropTypes.number,
    eventID: PropTypes.number,
    badgeID: PropTypes.number,
    metadata: PropTypes.object,
    createdAt: PropTypes.string,
  }).isRequired,
}
