import PropTypes from 'prop-types'
import { useEffect } from 'react'
import {
  ErrorOutline,
  CheckCircleOutline,
  InfoOutlined,
} from '@mui/icons-material'

const Alert = ({ message, type, duration = 3000, onTimeout }) => {
  const configs = {
    error: {
      theme: 'bg-red-100 border-red-500 text-red-800',
      icon: <ErrorOutline className="text-red-500" fontSize="small" />,
    },
    success: {
      theme: 'bg-green-100 border-green-500 text-green-800',
      icon: <CheckCircleOutline className="text-green-500" fontSize="small" />,
    },
    info: {
      theme: 'bg-blue-100 border-blue-500 text-blue-800',
      icon: <InfoOutlined className="text-blue-500" fontSize="small" />,
    },
  }

  const style = configs[type] || configs.error

  useEffect(() => {
    const timer = setTimeout(onTimeout, duration)
    return () => clearTimeout(timer)
  }, [duration, onTimeout])

  return (
    <div
      className={`
        absolute top-20 left-1/2 -translate-x-1/2 z-10
        w-max max-w-80%] 
        flex items-center gap-2 p-3 px-6
        rounded-full border-2 shadow-lg ${style.theme}
        animate-in fade-in slide-in-from-top-4 duration-300
      `}
    >
      {style.icon}
      <span className="text-sm font-semibold">{message}</span>
    </div>
  )
}

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'success', 'info']).isRequired,
  duration: PropTypes.number,
  onTimeout: PropTypes.func.isRequired,
}

export default Alert
