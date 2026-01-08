import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import InputField from '../ui/InputField'
import SelectField from '../ui/SelectField'
import TextareaField from '../ui/TextareaField'
import Button from '../Button'
import { typeOptions } from '../../data/tagsData'
import { validateTagForm } from '../../utils/validation'

function TagForm({ tag = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'auto',
    color: '#3B82F6',
    icon: 'Tag',
    definition: '',
    trigger: '',
  })

  const [errors, setErrors] = useState({})

  // Initialize form with tag data if editing
  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name || '',
        type: tag.type || 'auto',
        color: tag.color || '#3B82F6',
        icon: tag.icon || 'Tag',
        definition: tag.definition || '',
        trigger: tag.trigger || '',
      })
    }
  }, [tag])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validation = validateTagForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    onSave({
      ...formData,
      createdAt: tag?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Row 1: Name + Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <InputField
            label="Tag Name"
            name="name"
            type="text"
            placeholder="e.g., VIP"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 2, maximum 50 characters</p>
        </div>
        <SelectField
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={typeOptions}
          error={errors.type}
          required
        />
      </div>

      {/* Row 2: Color + Icon (side by side) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color<span className="text-red-600 ml-1">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#F97316'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange({ target: { name: 'color', value: color } })}
                className={`w-8 h-8 rounded-full transition-all ${
                  formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          {errors.color && <p className="text-xs text-red-600 mt-0.5">{errors.color}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon<span className="text-red-600 ml-1">*</span>
          </label>
          <div className="grid grid-cols-4 gap-1">
            {['Star', 'Users', 'TrendingUp', 'DollarSign', 'Gift', 'AlertTriangle', 'Heart', 'Award'].map((iconName) => {
              const IconComponent = Icons[iconName] || Icons.Tag
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'icon', value: iconName } })}
                  className={`p-1.5 rounded border transition-all text-xs ${
                    formData.icon === iconName
                      ? 'bg-blue-100 border-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={iconName}
                >
                  <IconComponent className="w-4 h-4 mx-auto text-gray-600" />
                </button>
              )
            })}
          </div>
          {errors.icon && <p className="text-xs text-red-600 mt-0.5">{errors.icon}</p>}
        </div>
      </div>

      {/* Row 3: Definition */}
      <div>
        <TextareaField
          label="Definition"
          name="definition"
          placeholder="What does this tag mean?"
          value={formData.definition}
          onChange={handleChange}
          rows={1}
          error={errors.definition}
          required
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 10, maximum 200 characters</p>
      </div>

      {/* Row 4: Trigger */}
      <div>
        <TextareaField
          label="Trigger"
          name="trigger"
          placeholder="How is this tag applied?"
          value={formData.trigger}
          onChange={handleChange}
          rows={1}
          error={errors.trigger}
          required
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 10, maximum 200 characters</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <Button variant="secondary" size="sm" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit">
          {tag ? 'Save Tag' : 'Create Tag'}
        </Button>
      </div>
    </form>
  )
}

TagForm.propTypes = {
  tag: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
    definition: PropTypes.string,
    trigger: PropTypes.string,
    type: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default TagForm
