import PropTypes from 'prop-types'
import { SearchOutlined } from '@mui/icons-material'
import { useState } from 'react'

export default function SearchBar({ onSearch }) {
  const [location, setLocation] = useState('')

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 w-9/10">
      <div className="w-full flex flex-row justify-start bg-white rounded-xl px-2 py-3 shadow-md shadow-light-grey">
        <input
          type="text"
          placeholder="Search location..."
          onChange={e => setLocation(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch(location)}
          className="flex-1 pl-2 focus:outline-none"
        />
        <button onClick={() => onSearch(location)}>
          <SearchOutlined className="text-text-primary" />
        </button>
      </div>
    </div>
  )
}

SearchBar.propTypes = { onSearch: PropTypes.func }
