import { classNames } from '../utils/classNames.js'

function Card({ className, children, ...props }) {
  return (
    <article className={classNames('card', className)} {...props}>
      {children}
    </article>
  )
}

export default Card
