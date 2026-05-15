import GenericButton from '../components/GenericButton'
import { useNotifications } from '../../context/NotificationContext'
import { notificationStrings } from '../locales/en/NotificationStrings'
import { clearAllNotifications } from '../utils/NotificationUtils'
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
      <h1 className="m-3 text-2xl">{notificationStrings.title}</h1>
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
      <div className="flex flex-col gap-1.5 m-1.5">
        {notifications.map(notification => (
          <NotificationCard
            key={notification.notificationID}
            notification={notification}
            className="m-3"
          ></NotificationCard>
        ))}
      </div>
    </div>
  )
}
