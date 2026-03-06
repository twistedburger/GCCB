import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'

export default function LocationSearch({
  onSearch,
  defaultLocation = '',
  placeHolder = 'Search location...',
  className = 'w-full flex flex-row justify-start focus-within:ring-4 focus-within:ring-blue-100 border border-transparent rounded-xl shadow-md shadow-light-grey transition-all',
}) {
  const [location, setLocation] = useState(defaultLocation)
  const autocompleteRef = useRef(null)

  useEffect(() => {
    if (autocompleteRef.current) {
      autocompleteRef.current.value = defaultLocation
    }
  }, [defaultLocation])

  useEffect(() => {
    const el = autocompleteRef.current

    const handleSelect = async event => {
      const placePrediction = event.placePrediction
      const place = placePrediction.toPlace()
      await place.fetchFields({ fields: ['formattedAddress'] })

      const address = place.formattedAddress
      setLocation(address)
      onSearch(address)
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
      className={`w-full ${className}`}
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
}
