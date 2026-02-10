import PropTypes from 'prop-types'

export default function DropDownList({ items, onChange }) {
  return (
    <select
      name="selectItem"
      onChange={onChange}
      className="m-2 px-4 py-2 rounded-[10px] font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-primary"
    >
      {items.map(item => (
        <option value={item} key={item}>
          {item}
        </option>
      ))}
    </select>
  )
}

DropDownList.propTypes = { items: PropTypes.array, onChange: PropTypes.func }
