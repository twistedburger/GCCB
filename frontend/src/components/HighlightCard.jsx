import PropTypes from 'prop-types'
import { forwardRef, useEffect, useState } from 'react'

const HighlightCard = forwardRef(function HighlightCard(
  { children, shouldFlash },
  ref
) {
  const [highlight, setHighlight] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setHighlight(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 rounded-xl ${
        highlight && shouldFlash ? 'bg-yellow-200 p-2' : 'bg-transparent p-0'
      }`}
    >
      {children}
    </div>
  )
})

HighlightCard.propTypes = {
  children: PropTypes.node.isRequired,
  shouldFlash: PropTypes.bool.isRequired,
}

export default HighlightCard
