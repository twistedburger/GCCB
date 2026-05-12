import PropTypes from 'prop-types'
import GenericCard from './GenericCard'
import { useEffect, useState } from 'react'
import { notificationStrings } from '../locales/en/NotificationStrings'
import { getNotificationDetails } from '../utils/NotificationUtils'

export default function NotificationCard(notification) {
  const [notificationDetails, setNotificationDetails] = useState(null)
  useEffect(() => {
    const details = getNotificationDetails(notification.notification)
    setNotificationDetails(details)
  }, [notification])

  return notificationDetails ? (
    <GenericCard onClick={notificationDetails.onClick}>
      <h1>{notificationDetails.title}</h1>
      <p>{notificationDetails.message}</p>
      <p>Received at : {notificationDetails.time}</p>
    </GenericCard>
  ) : (
    <>{notificationStrings.loading}</>
  )
}

GenericCard.propTypes = {
  notification: PropTypes.shape({
    notificationID: PropTypes.number.isRequired,
    notificationType: PropTypes.shape.isRequired,
    routeID: PropTypes.number,
    eventID: PropTypes.number,
    badgeID: PropTypes.number,
    metadata: PropTypes.shape,
    createdAt: PropTypes.string,
  }).isRequired,
}
