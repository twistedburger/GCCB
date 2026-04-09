import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { locationSearchStrings } from '../locales/en/ComponentStrings/LocationSearchStrings'

export default function LocationSearch({
  clearRef,
  onSearch,
  defaultLocation = '',
  placeHolder = locationSearchStrings.searchPlaceholder,
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

  // allows for LocationSearch input to be cleared when user clears location in landing page
  useEffect(() => {
    if (clearRef) {
      clearRef.current = {
        clear: () => {
          const el = autocompleteRef.current
          if (!el) return
          el.value = '' // empties the text inside search bar
          el.dispatchEvent(new Event('change', { bubbles: true })) // manually notifies the component text is empty to update UI
          el.dispatchEvent(new InputEvent('input', { bubbles: true }))
          setLocation('')
        },
      }
    }
  }, [clearRef])

  useEffect(() => {
    const el = autocompleteRef.current

    const handleSelect = async event => {
      const placePrediction = event.placePrediction
      const place = placePrediction.toPlace()
      await place.fetchFields({
        fields: ['formattedAddress', 'location', 'photos', 'id'],
      })

      const address = place.formattedAddress
      const latitude = place.location.lat()
      const longitude = place.location.lng()
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
  clearRef: PropTypes.shape({ current: PropTypes.object }),
  defaultLocation: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
}
