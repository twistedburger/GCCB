import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

/**
 * A block component for displaying vehicle information.
 * @param {Object} props
 * @param {number} props.userId - The ID of the user whose vehicles to display.
 * @returns {JSX.Element}
 */

const VehicleBlock = ({ userId }) => {
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    const fetchVehicle = async userId => {
      console.log('Fetching vehicle details for user ID:', userId)
      const mockVehicleDetails = [
        {
          make: 'Toyota',
          model: 'Camasdfkjhajlksejhflkajhweflkjhry',
          year: 2020,
          license_plate: 'ABC123',
        },
        {
          make: 'Tesla',
          model: 'Model 3',
          year: 2013,
          license_plate: 'XYZ789',
        },
        {
          make: 'BMW',
          model: 'X5',
          year: 2019,
          license_plate: 'CHONKY',
        },
      ]
      return mockVehicleDetails

      // // make API call to get vehicle details based on user.vehicle
      // const response = await api.getVehicleDetails(userId);
      // if (!response.ok) {
      //   console.error("Error fetching vehicle details");
      //   return;
      // }

      // const vehicleDetails = await response.json();
      // return vehicleDetails;
    }

    if (userId) {
      fetchVehicle(userId).then(setVehicles)
    }
  }, [userId])

  if (!vehicles.length) return null

  return (
    <div className="flex flex-col w-95 gap-1.5 mb-4">
      <label className="text-sm font-semibold text-text-primary ml-1">
        Vehicle
      </label>
      <div className="grid grid-cols-2 gap-3">
        {vehicles.map((vehicle, index) => (
          <div
            key={index}
            className="bg-white shadow-sm p-3 rounded-lg flex items-center min-w-0 overflow-hidden"
          >
            <div className="min-w-0 flex-1 text-center">
              <p
                className="font-bold text-blue-primary truncate"
                title={`${vehicle.make} ${vehicle.model}`}
              >
                {vehicle.make} {vehicle.model}
              </p>
              <p className="text-xs text-dark-grey truncate">
                {vehicle.year} • {vehicle.license_plate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

VehicleBlock.propTypes = {
  userId: PropTypes.number.isRequired,
}

export default VehicleBlock
