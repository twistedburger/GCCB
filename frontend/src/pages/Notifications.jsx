import GenericButton from '../components/GenericButton'
import { NotificationType } from '../../../shared/NotificationTypes'
import { useNotifications } from '../../context/NotificationContext'
import GenericCard from '../components/GenericCard'
import { notificationStrings } from '../locales/en/NotificationStrings'
import { clearAllNotifications } from '../utils/NotificationUtils'

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
        onClick={async () => {
          console.log('hello')
          const notification = {
            type: NotificationType.Route,
            id: 2,
            metadata: { message: 'hello' },
          }
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/notifications/notify`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(notification),
              credentials: 'include',
            }
          )
          console.log(response)
        }}
      >
        Send Notification
      </GenericButton>
      {notifications.map(n => (
        <GenericCard key={n.notification_id}>
          {`${n.notification_id}: ${n.metadata.message}`}
        </GenericCard>
      ))}
    </div>
  )
}
