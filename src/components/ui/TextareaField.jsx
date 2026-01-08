import PropTypes from 'prop-types'

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  rows = 4,
  required,
}) {
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
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
      />
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  )
}

TextareaField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  rows: PropTypes.number,
  required: PropTypes.bool,
}

export default TextareaField
