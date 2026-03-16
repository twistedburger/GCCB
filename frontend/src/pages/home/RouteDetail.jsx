import PropTypes from 'prop-types'
import GenericButton from '../../components/GenericButton'
import OrganizerCard from '../../components/OrganizerCard'
import RouteCard from '../../components/RouteCard'
import { Cancel } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../utils/Authorization'

export default function RouteDetail({ selectedRoute, onClose }) {
  const navigate = useNavigate()
  const { authorization } = useAuth()

  const handleClose = () => {
    if (onClose) onClose()
    else setTimeout(() => navigate(-1), 300)
  }

  if (!selectedRoute) return null

  return (
    <div className="flex flex-col h-full overflow-y-auto rounded-t-3xl">
      <div className="flex justify-between items-start px-4 pt-2">
        <div className="w-8" />
        <div className="bg-text-primary rounded-full h-1.5 w-20 mt-2" />
        <GenericButton
          onClick={handleClose}
          unstyled
          customStyling="text-text-primary scale-110"
        >
          <Cancel />
        </GenericButton>
      </div>
      <div className="flex flex-col pb-36 px-6">
        <div className="flex flex-col pt-4 pb-4">
          <h3 className="font-semibold text-xl text-text-primary pb-2">
            {selectedRoute.title}
          </h3>
          <span className="text-xs text-text-secondary">
            {selectedRoute.description}
          </span>
          <RouteCard
            route={selectedRoute}
            view={authorization}
            routeDetailView={true}
          />
        </div>
        <p className="font-semibold pt-4 pb-2 text-text-primary">Organizer</p>
        <OrganizerCard
          user={{
            id: selectedRoute.creator_id,
            name: selectedRoute.creator_name,
            nickname: selectedRoute.nickname,
            profile_pic: selectedRoute.profile_pic,
            role: '',
            description: '',
            active: true,
          }}
        />
      </div>
    </div>
  )
}

RouteDetail.propTypes = {
  selectedRoute: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    creator_id: PropTypes.number,
    creator_name: PropTypes.string,
    nickname: PropTypes.string,
    profile_pic: PropTypes.string,
  }),
  onClose: PropTypes.func,
}
