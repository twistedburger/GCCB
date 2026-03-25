import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Close } from '@mui/icons-material'
import GenericButton from './GenericButton'

export function Modal({ isOpen, onClose, children, title }) {
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 10)
      return () => clearTimeout(timer)
    } else {
      setAnimateIn(false)
    }
  }, [isOpen])

  if (!isOpen && !animateIn) return null

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 transition-all duration-500 ease-out
        ${animateIn ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'}`}
      />

      {/* Modal */}
      <div
        className={`relative bg-white w-full rounded-3xl shadow-2xl 
          max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out
          ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}
        `}
      >
        {/* Close Button */}
        <GenericButton
          onClick={onClose}
          unstyled={true}
          customStyling="absolute top-4 right-4 z-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <Close fontSize="large" />
        </GenericButton>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
          {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
}
