import PropTypes from 'prop-types'

function Badge({ children, variant = 'neutral', size = 'md' }) {
  const variants = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    recurring: 'bg-blue-100 text-blue-800',
    residential: 'bg-purple-100 text-purple-800',
    'opted out': 'bg-red-100 text-red-800',
    auto: 'bg-blue-100 text-blue-800',
    manual: 'bg-gray-100 text-gray-800',
    neutral: 'bg-gray-100 text-gray-800',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs font-medium rounded',
    md: 'px-3 py-1 text-sm font-medium rounded-full',
    lg: 'px-4 py-2 text-base font-medium rounded-full',
  }

  const variantStyles = variants[variant] || variants.neutral
  const sizeStyles = sizes[size] || sizes.md

  return (
    <span className={`${variantStyles} ${sizeStyles} inline-block whitespace-nowrap`}>
      {children}
    </span>
  )
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  size: PropTypes.string,
}

export default Badge
