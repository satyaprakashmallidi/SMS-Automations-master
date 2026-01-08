import PropTypes from 'prop-types'
import { TAG_COLORS } from '../../data/tagsData'

function ColorPicker({ label = 'Color', name, value = '', onChange, required = false, error = '' }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-4 gap-3">
        {TAG_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange({ target: { name, value: color } })}
            className={`w-10 h-10 rounded-full transition-all ${
              value === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

ColorPicker.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
}

export default ColorPicker
