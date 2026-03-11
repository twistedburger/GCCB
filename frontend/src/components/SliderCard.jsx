import { motion, useAnimation, useDragControls } from 'framer-motion'
import PropTypes from 'prop-types'
import { useEffect, useMemo } from 'react'

export default function SliderCard({ children, isExpanded }) {
  const controls = useAnimation()
  const dragControls = useDragControls()

  const handleHeight = 55

  const MAX_TOP = useMemo(() => '5%', [])
  const MAX_BOTTOM = useMemo(() => `calc(100% - ${handleHeight}px)`, [])

  useEffect(() => {
    // automatically opens/closes using isExpanded
    if (isExpanded) {
      controls.start({ y: MAX_TOP })
    } else {
      controls.start({ y: MAX_BOTTOM })
    }
  }, [isExpanded, controls, MAX_TOP, MAX_BOTTOM])

  const handleDragEnd = (event, info) => {
    // no in-between, slider card only snaps to open or close
    const shouldExpand = info.offset.y < -100
    controls.start({ y: shouldExpand ? MAX_TOP : MAX_BOTTOM })
  }

  return (
    <motion.div
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 800 }}
      initial={{ y: MAX_BOTTOM }}
      animate={controls}
      onDragEnd={handleDragEnd}
      dragMomentum={false}
      transition={{ type: 'spring', damping: 50, stiffness: 400 }}
      className="bg-background-off-white h-screen fixed top-0 left-0 z-20 flex flex-col overflow-hidden rounded-t-4xl ml-[55px] w-[calc(100%-55px)]"
    >
      <div
        onPointerDown={e => {
          e.preventDefault()
          dragControls.start(e)
          e.stopPropagation()
        }}
        className="flex justify-center items-center h-14 w-full shrink-0 cursor-grab active:cursor-grabbing touch-none z-20"
      >
        <div className="bg-text-primary rounded-full h-1.5 w-20"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-36 flex flex-col gap-4">
        {children}
      </div>
    </motion.div>
  )
}

SliderCard.propTypes = { children: PropTypes.node, isExpanded: PropTypes.bool }
