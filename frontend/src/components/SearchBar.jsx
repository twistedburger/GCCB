import { SearchOutlined } from '@mui/icons-material'

export default function SearchBar() {
  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
      <div className="w-full flex flex-row justify-start bg-white rounded-xl px-2 py-3 shadow-md shadow-light-grey">
        <SearchOutlined className="text-text-primary" />
        <input
          type="text"
          placeholder="Search location..."
          className="flex-1 pl-2 focus:outline-none"
        />
      </div>
    </div>
  )
}
