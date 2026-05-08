import GenericButton from '../components/GenericButton'
import { NotificationType } from '../../../shared/NotificationTypes'
import TransitLegCard from '../components/TransitLegCard'
import { useNotifications } from '../../context/NotificationContext'

export default function Notifications() {
  const { notifications } = useNotifications()

  return (
    <div>
      <p>Notifications</p>
      <GenericButton
        onClick={async () => {
          console.log('hello')
          const notification = {
            type: NotificationType.Route,
            id: 2,
            metadata: { message: 'hello' },
          }
          const response = await fetch(
            'http://localhost:3000/notifications/notify',
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
        <TransitLegCard
          key={n}
          name={n.notification_type}
          type={''}
          distance={n.metadata.message}
        />
      ))}
    </div>
  )
}
