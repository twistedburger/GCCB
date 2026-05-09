import PropTypes from 'prop-types'
import { loadNotifications } from '../src/utils/NotificationUtils'

import { createContext, useContext, useEffect, useState } from 'react'

const NotificationContext = createContext(null)

/**
 * Establishes an open stream from the server to listen for notifications.
 *
 * @param {Object} Children
 * @returns closes the stream
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  useEffect(() => {
    loadNotifications(setNotifications)
  }, [setNotifications])

  useEffect(() => {
    const stream = new EventSource(
      'http://localhost:3000/notifications/listenForNotifications',
      { withCredentials: true }
    )

    stream.onmessage = event => {
      const notificationsResponse = JSON.parse(event.data)
      if (notificationsResponse.error) {
        console.log(notificationsResponse.error)
        setNotifications([])
      } else {
        setNotifications(notificationsResponse.notifications)
      }
    }

    stream.onerror = () => {
      stream.close()
    }

    return () => stream.close()
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Use the notification context
 *
 * @returns Notification context
 */
export function useNotifications() {
  return useContext(NotificationContext)
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
