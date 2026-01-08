import PropTypes from 'prop-types'

function CheckboxField({ label, name, checked, onChange, description }) {
  return (
    <div className="mb-4 flex items-center">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded cursor-pointer accent-blue-600"
      />
      <div className="ml-3 flex-1">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}

CheckboxField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  description: PropTypes.string,
}

export default CheckboxField
