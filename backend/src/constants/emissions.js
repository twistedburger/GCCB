// src: https://ourworldindata.org/travel-carbon-footprint#:~:text=He%20estimates%2025%20grams%20CO,International%20Council%20on%20Clean%20Transportation.
// Move to ReadMe eventually

// Car factors are PER VEHICLE-KM.
// Transit factors are PER PASSENGER-KM.
const EMISSIONS_G_PER_KM = {
  CAR_VEHICLE: {
    PETROL: 170,
    ELECTRIC: 47,
  },
  TRANSIT_PASSENGER: {
    BUS: 97,
    RAIL: 35,
  },
}

module.exports = { EMISSIONS_G_PER_KM }
