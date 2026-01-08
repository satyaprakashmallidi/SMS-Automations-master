import PropTypes from 'prop-types'
import * as Icons from 'lucide-react'
import { TAG_ICONS } from '../../data/tagsData'

function IconPicker({ label = 'Icon', name, value = '', onChange, required = false, error = '' }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-6 gap-2">
        {TAG_ICONS.map(({ name: iconName, label: iconLabel }) => {
          const IconComponent = Icons[iconName] || Icons.Tag
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onChange({ target: { name, value: iconName } })}
              className={`p-2 rounded border transition-all ${
                value === iconName
                  ? 'bg-blue-100 border-blue-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title={iconLabel}
            >
              <IconComponent className="w-5 h-5 mx-auto text-gray-600" />
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

IconPicker.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
}

export default IconPicker
