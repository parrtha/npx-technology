import { Link } from 'react-router-dom'
import { classNames } from '../utils/classNames.js'

function Button({
  to,
  href,
  variant = 'primary',
  size = 'medium',
  className,
  children,
  type = 'button',
  ...props
}) {
  const classes = classNames(
    'button',
    `button--${variant}`,
    `button--${size}`,
    className,
  )

  if (to) {
    return <Link className={classes} to={to} {...props}>{children}</Link>
  }

  if (href) {
    return <a className={classes} href={href} {...props}>{children}</a>
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}

export default Button
