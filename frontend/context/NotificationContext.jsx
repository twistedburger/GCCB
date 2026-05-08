import PropTypes from 'prop-types'
import { loadNotifications } from '../src/utils/NotificationUtils'

import { createContext, useContext, useEffect, useState } from 'react'

const NotificationContext = createContext(null)

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
      setNotifications(notificationsResponse.notifications)
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

export function useNotifications() {
  return useContext(NotificationContext)
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
