import PropTypes from 'prop-types'
import GenericButton from './GenericButton'
import { Person, Edit } from '@mui/icons-material'

/**
 * A circular profile picture component with an edit overlay button.
 *
 * Displays the user's avatar if a URL is provided, or a default person icon
 * as a placeholder. An edit icon is always shown in the bottom-right corner
 * to indicate the image is clickable/changeable.
 *
 * @param {Function} [onImageClick] - Callback triggered when the user clicks the profile picture.
 * @param {string} [props.avatarUrl] - URL of the user's current profile image.
 * @returns {JSX.Element}
 */
function ProfilePicture({ onImageClick, avatarUrl }) {
  return (
    <GenericButton
      onClick={onImageClick}
      unstyled={true}
      customStyling="relative h-full w-full rounded-full border border-light-grey bg-light-grey transition active:scale-95"
    >
      <div className="h-full w-full overflow-hidden rounded-full">
        {avatarUrl && avatarUrl.length > 0 ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary text-center p-2">
            <Person sx={{ fontSize: 80 }} />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0 flex items-center justify-center h-7 w-7 rounded-full bg-white border border-light-grey shadow-sm text-text-primary">
        <Edit sx={{ fontSize: 16 }} />
      </div>
    </GenericButton>
  )
}

ProfilePicture.propTypes = {
  onImageClick: PropTypes.func.isRequired,
  avatarUrl: PropTypes.string,
}

export default ProfilePicture
