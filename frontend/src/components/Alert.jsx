import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import {
  ErrorOutline,
  CheckCircleOutline,
  InfoOutlined,
} from '@mui/icons-material'

const ALERT_CONFIGS = {
  error: {
    theme: 'bg-red-100 border-red-500 text-red-800',
    icon: <ErrorOutline className="text-red-500" fontSize="small" />,
  },
  success: {
    theme: 'bg-green-100 border-green-500 text-green-800',
    icon: <CheckCircleOutline className="text-green-500" fontSize="small" />,
  },
  info: {
    theme: 'bg-blue-100 border-blue-300 text-blue-800',
    icon: <InfoOutlined className="text-blue-500" fontSize="small" />,
  },
}

const Alert = ({ message, type, duration = 3000, onTimeout }) => {
  const [entered, setEntered] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const onTimeoutRef = useRef(onTimeout)

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  })

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 500)
    return () => clearTimeout(exitTimer)
  }, [duration])

  const style = ALERT_CONFIGS[type] ?? ALERT_CONFIGS.error

  return (
    <div
      onAnimationEnd={() => setEntered(true)}
      onTransitionEnd={() => {
        if (isExiting) onTimeoutRef.current?.()
      }}
      className={`
        fixed top-6 z-9999 w-max max-w-[calc(80%-55px)]
        flex items-center gap-2 p-3 px-6
        rounded-full border-2 shadow-lg ${style.theme}
        transition-all duration-500 ease-in-out ml-[27.5px]
        ${isExiting ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100'}
        ${!entered && !isExiting ? 'animate-alert-in' : ''}
  `}
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
      }}
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
