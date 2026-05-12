import PropTypes from 'prop-types'
import GenericCard from './GenericCard'
import { useEffect, useState } from 'react'
import { notificationStrings } from '../locales/en/NotificationStrings'
import { getNotificationDetails } from '../utils/NotificationUtils'
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
        setNotifications(
          notifications.filter(
            notificationToCheck =>
              notificationToCheck.notificationID !== notification.notificationID
          )
        )
        notificationDetails.onClick()
      }}
    >
      <h1>{notificationDetails.title}</h1>
      <p>{notificationDetails.message}</p>
      <p>Received at : {notificationDetails.time}</p>
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
