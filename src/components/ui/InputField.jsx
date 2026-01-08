import PropTypes from 'prop-types'
import { forwardRef } from 'react'

const InputField = forwardRef(function InputField(
  {
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    helperText,
    required,
  },
  ref
) {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
      />
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  )
})

InputField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
}

export default InputField
