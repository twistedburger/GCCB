import { motion, useAnimation, useDragControls } from 'framer-motion'
import PropTypes from 'prop-types'

export default function SliderCard({ sliderInformation }) {
  const controls = useAnimation()
  const dragControls = useDragControls()

  const handleDragEnd = (event, info) => {
    if (info.offset.y < -100) {
      controls.start({ y: 30 })
    } else {
      controls.start({ y: 750 })
    }
  }

  return (
    <motion.div
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 750 }}
      initial={{ y: 750 }}
      animate={controls}
      onDragEnd={handleDragEnd}
      dragMomentum={false}
      transition={{ type: 'spring', damping: 50, stiffness: 400 }}
      className="bg-background-off-white h-screen w-full rounded-t-4xl fixed top-0 flex flex-col overflow-hidden z-12"
    >
      <div
        onPointerDown={e => dragControls.start(e)}
        className="flex justify-center mt-6 h-14 w-full shrink-0 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="bg-text-primary rounded-full h-1.5 w-20"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 flex flex-col gap-4">
        {sliderInformation}
      </div>
    </motion.div>
  )
}

SliderCard.propTypes = { sliderInformation: PropTypes.node }
