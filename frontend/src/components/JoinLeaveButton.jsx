import PropTypes from 'prop-types'

export default function JoinLeaveButton({ isJoined, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`m-2 px-8 py-1 rounded-xl bg-blue-secondary font-medium text-text-secondary ${!isJoined && 'outline outline-text-secondary'}`}
    >
      {isJoined ? 'Leave' : 'Join'}
    </button>
  )
}

JoinLeaveButton.propTypes = {
  isJoined: PropTypes.bool,
  onClick: PropTypes.func,
}
