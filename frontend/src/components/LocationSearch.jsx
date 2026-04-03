import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'

export default function LocationSearch({
  onSearch,
  defaultLocation = '',
  placeHolder = 'Search location...',
  className = 'w-full flex flex-row justify-start focus-within:ring-4 focus-within:ring-blue-100 border border-transparent rounded-xl shadow-md shadow-light-grey transition-all',
  disabled = false,
}) {
  const [location, setLocation] = useState(defaultLocation)
  const autocompleteRef = useRef(null)

  useEffect(() => {
    if (autocompleteRef.current) {
      autocompleteRef.current.value = defaultLocation ?? ''
    }
  }, [defaultLocation])

  useEffect(() => {
    const el = autocompleteRef.current

    const handleSelect = async event => {
      const placePrediction = event.placePrediction
      const place = placePrediction.toPlace()
      // photos for banner url, id to re-fetch banner url later if the photo url is expired
      await place.fetchFields({
        fields: ['formattedAddress', 'location', 'photos', 'id'],
      })

      const address = place.formattedAddress
      const latitude = place.location.lat()
      const longitude = place.location.lng()
      // returns an array, just get the first one for the banner
      // save the url for event banner, save the place id to later update the url if it expires
      const banner = place.photos?.[0]?.getURI() || null
      const placeId = place.id
      setLocation(address)
      onSearch(address, latitude, longitude, banner, placeId)
    }

    if (el) {
      el.addEventListener('gmp-select', handleSelect)
    }

    return () => {
      if (el) el.removeEventListener('gmp-select', handleSelect)
    }
  }, [onSearch])

  return (
    <gmp-place-autocomplete
      className={`${className} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      ref={autocompleteRef}
      placeholder={placeHolder}
      onInput={e => setLocation(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') onSearch(location)
      }}
    />
  )
}

LocationSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  defaultLocation: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
}
