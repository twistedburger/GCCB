import GenericButton from '../components/GenericButton'
import { NotificationType } from '../../../shared/NotificationTypes'
import { useNotifications } from '../../context/NotificationContext'
import { notificationStrings } from '../locales/en/NotificationStrings'
import {
  clearAllNotifications,
  sendNotification,
} from '../utils/NotificationUtils'
import NotificationCard from '../components/NotificationCard'

/**
 * Display the notifications page.
 *
 * @returns {JSX.Element}
 */
export default function Notifications() {
  const { notifications, setNotifications } = useNotifications()

  return (
    <div>
      <p>{notificationStrings.title}</p>
      <GenericButton
        onClick={async () => {
          const cleared = await clearAllNotifications()
          if (cleared) {
            setNotifications([])
          } else {
            console.log(notificationStrings.errorClearingNotifications)
          }
        }}
      >
        {notificationStrings.clearAll}
      </GenericButton>
      {/* This button is temporary and will be removed when notification sending works*/}
      <GenericButton
        onClick={() => {
          sendNotification(
            NotificationType.Event,
            2,
            'Event Title',
            'Notification Message'
          )
          sendNotification(
            NotificationType.Route,
            2,
            'Route Title',
            'Notification Message'
          )
          sendNotification(
            NotificationType.Badge,
            23,
            'Badge Title',
            'Notification Message'
          )
        }}
      >
        Send Notification
      </GenericButton>
      {notifications.map(notification => (
        <NotificationCard
          key={notification.notificationID}
          notification={notification}
        ></NotificationCard>
      ))}
    </div>
  )
}
