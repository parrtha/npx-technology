import { classNames } from '../utils/classNames.js'

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}) {
  return (
    <div className={classNames('section-heading', `section-heading--${align}`, className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p className="section-heading__description">{description}</p>}
    </div>
  )
}

export default SectionHeading
