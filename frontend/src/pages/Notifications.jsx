import { useEffect } from 'react'
import GenericButton from '../components/GenericButton'
import { NotificationType } from '../../../shared/NotificationTypes'

export default function Notifications() {
  useEffect(() => {
    const stream = new EventSource(
      'http://localhost:3000/notifications/listenForNotifications',
      { withCredentials: true }
    )

    stream.onmessage = event => {
      const notification = JSON.parse(event.data)
      console.log(notification)
    }

    stream.onerror = () => {
      stream.close()
    }

    return () => stream.close()
  }, [])

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
        ClickMe
      </GenericButton>
    </div>
  )
}
