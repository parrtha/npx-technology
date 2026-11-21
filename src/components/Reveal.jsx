import { motion, useReducedMotion } from 'motion/react'

function Reveal({
  as = 'div',
  children,
  className,
  delay = 0,
  distance = 14,
  amount = 0.16,
  ...props
}) {
  const reduceMotion = useReducedMotion()
  const MotionElement = motion[as]

  return (
    <MotionElement
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: reduceMotion ? 0 : 0.42,
        delay: reduceMotion ? 0 : delay,
        ease: 'easeOut',
      }}
      {...props}
    >
      {children}
    </MotionElement>
  )
}

export default Reveal
