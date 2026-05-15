import { createContext, useContext, useState } from 'react'
import { useUser } from './UserContext'
import ConfirmationDialog from '../src/components/ConfirmationDialog'
import Alert from '../src/components/Alert'
import PropTypes from 'prop-types'

const RouteActionsContext = createContext(null)

export function RouteActionsProvider({ children }) {
  const { user } = useUser()
  const [pendingLeave, setPendingLeave] = useState(null)
  const [alert, setAlert] = useState(null)
  const baseURL = import.meta.env.VITE_API_BASE_URL

  const toggleJoin = async (route, onSuccess) => {
    if (route.isJoined) {
      const isRouteCreator = user?.id === route.creator_id
      const isCar =
        route.transportation_mode === 'Car' ||
        route.transportationMode === 'Car'
      setPendingLeave({
        route,
        isCreatorDelete: isRouteCreator && isCar,
        onSuccess,
      })
    } else {
      await fetch(`${baseURL}/api/routes/${route.id}/join`, {
        method: 'POST',
        credentials: 'include',
      })
      setAlert({ type: 'success', message: 'Successfully joined the trip!' })
      onSuccess?.({ routeId: route.id, joined: true })
    }
  }

  return (
    <RouteActionsContext.Provider value={{ toggleJoin, user }}>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onTimeout={() => setAlert(null)}
        />
      )}
      <div className="*:ml-13.75">
        <ConfirmationDialog
          isOpen={pendingLeave !== null}
          onClose={() => setPendingLeave(null)}
          variant={pendingLeave?.isCreatorDelete ? 'danger' : 'primary'}
          title={
            pendingLeave?.isCreatorDelete ? 'Delete Route?' : 'Leave Trip?'
          }
          onConfirm={async () => {
            const { route, isCreatorDelete, onSuccess } = pendingLeave
            const url = `${baseURL}/api/routes/${route.id}/${isCreatorDelete ? 'delete' : 'leave'}`
            const response = await fetch(url, {
              method: 'DELETE',
              credentials: 'include',
            })
            if (response.ok) {
              setAlert({
                type: 'success',
                message: isCreatorDelete
                  ? 'Route deleted.'
                  : 'Successfully left the trip.',
              })
              onSuccess?.({
                routeId: route.id,
                joined: false,
                deleted: isCreatorDelete,
              })
            } else {
              setAlert({ type: 'error', message: 'Something went wrong.' })
            }
            setPendingLeave(null)
          }}
        >
          {pendingLeave?.isCreatorDelete
            ? 'As the creator of this route, leaving will delete it for everyone currently joined. Are you sure?'
            : 'Are you sure you want to leave this trip?'}
        </ConfirmationDialog>
      </div>
      {children}
    </RouteActionsContext.Provider>
  )
}

RouteActionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useRouteActions = () => useContext(RouteActionsContext)
