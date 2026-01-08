/* eslint-disable react/prop-types */
/**
 * Button Component
 * Reusable button component with multiple variants and sizes
 */

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles =
    'font-semibold rounded transition-colors duration-200 cursor-pointer'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-300 text-black hover:bg-gray-400 disabled:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const variantStyles = variants[variant] || variants.primary
  const sizeStyles = sizes[size] || sizes.md

  const finalClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`

  return (
    <button
      className={finalClassName}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
