import PropTypes from 'prop-types'
import { SearchOutlined } from '@mui/icons-material'
import { useState } from 'react'

export default function SearchBar({
  placeHolder = 'Search location...',
  className = 'w-full flex flex-row justify-start focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 bg-white rounded-xl px-2 py-3 shadow-md shadow-light-grey transition-all',
  onSearch,
}) {
  const [location, setLocation] = useState('')
  return (
    <div className={className}>
      <input
        type="text"
        placeholder={placeHolder}
        onChange={e => setLocation(e.target.value)}
        className="flex-1 pl-2 focus:outline-none bg-transparent"
      />
      <button onClick={() => onSearch(location)}>
        <SearchOutlined className="text-text-primary" />
      </button>
    </div>
  )
}

SearchBar.propTypes = {
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  onSearch: PropTypes.func,
}
