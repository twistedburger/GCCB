// src: https://ourworldindata.org/travel-carbon-footprint#:~:text=He%20estimates%2025%20grams%20CO,International%20Council%20on%20Clean%20Transportation.
// Move to ReadMe eventually
const EMISSIONS_G_PER_PASSENGER_KM = {
  CAR_PETROL: 170,
  CAR_ELECTRIC: 47,
  BUS: 97,
  WALK: 0,
  BIKE: 0,
}

const MODE = {
  WALK: 'walk',
  CYCLE: 'cycle',
  BUS: 'bus',
  CAR_ELECTRIC: 'electric_car',
  CARPOOL: 'carpool',
  CAR: 'car', // petrol will become baseline
}

module.exports = {
  EMISSIONS_G_PER_PASSENGER_KM,
  MODE,
}
