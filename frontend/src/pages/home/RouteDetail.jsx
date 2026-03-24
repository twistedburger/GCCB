import PropTypes from 'prop-types'
import GenericButton from '../../components/GenericButton'
import OrganizerCard from '../../components/OrganizerCard'
import RouteCard from '../../components/RouteCard'
import { Cancel } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { TravelMode } from '../../utils/routes'
import { useState, useEffect } from 'react'
import TransitLegCard from '../../components/TransitLegCard'
import { useAuth } from '../../utils/Authorization'

export default function RouteDetail({ selectedRoute, onClose }) {
  const [transitLegs, setTransitLegs] = useState([])
  const navigate = useNavigate()
  const { authorization } = useAuth()

  const handleClose = () => {
    if (onClose) onClose()
    else setTimeout(() => navigate(-1), 300)
  }

  const calculateTransitLegs = route => {
    if (route.transportation_mode.toUpperCase() != TravelMode.Transit) {
      // assume only transit has different steps
      setTransitLegs([])
      return
    }
    const legs = []
    route.path.legs[0].steps.forEach(step => {
      const last_leg = legs.at(-1)
      let leg
      const name =
        step.travelMode === TravelMode.Walk
          ? TravelMode.Walk
          : step.transitDetails.transitLine.nameShort
      const type =
        step.travelMode === TravelMode.Walk
          ? TravelMode.Walk
          : step.transitDetails.transitLine.vehicle.type

      if (last_leg) {
        const same_leg = last_leg.name === name
        leg = {
          name: name,
          type: type,
          distance: same_leg
            ? last_leg.distance + step.distanceMeters
            : step.distanceMeters,
        }

        if (same_leg) {
          legs.pop()
        }
      } else {
        leg = {
          name: name,
          type: type,
          distance: step.distanceMeters,
        }
      }

      legs.push(leg)
    })
    setTransitLegs(legs)
  }

  useEffect(() => {
    if (selectedRoute) calculateTransitLegs(selectedRoute)
  }, [selectedRoute])

  if (!selectedRoute) return null

  return (
    <div className="flex flex-col max-h-full rounded-t-3xl">
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
      <div className="flex flex-col overflow-y-auto pb-[25dvh] px-6">
        {' '}
        {/* drawer snap point is 80% max, so padding in Route Detail is 25% from bottom*/}
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
        <p className="font-semibold pt-4 pb-2 text-text-primary">
          {transitLegs.length > 0 ? 'Transit Details' : ''}
        </p>
        <div className="flex flex-col gap-2">
          {transitLegs.map((leg, index) => (
            <TransitLegCard
              key={index}
              name={leg.name}
              type={leg.type}
              distance={leg.distance}
            />
          ))}
        </div>
        <p className="font-semibold pt-4 pb-2 text-text-primary">
          {transitLegs.length > 0 ? 'Transit Details' : ''}
        </p>
        <div className="flex flex-col gap-2">
          {transitLegs.map((leg, index) => (
            <TransitLegCard
              key={index}
              name={leg.name}
              type={leg.type}
              distance={leg.distance}
            />
          ))}
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
