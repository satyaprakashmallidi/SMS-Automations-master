import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import InputField from '../ui/InputField'
import SelectField from '../ui/SelectField'
import SaveButton from '../ui/SaveButton'
import Button from '../Button'
import TagSelector from './TagSelector'
import { statusOptions, typeOptions } from '../../data/customersData'
import { validateCustomerForm } from '../../utils/validation'

/**
 * Normalize phone number - adds +1 for 10-digit US numbers
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return phone
  const digits = phone.replace(/\D/g, '')
  // If exactly 10 digits, assume US and prepend +1
  if (digits.length === 10) {
    return `+1${digits}`
  }
  // If already has country code (11+ digits starting with 1 for US), format with +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  // Return as-is for other formats
  return phone
}

function CustomerForm({ customer, onSave, onCancel, availableTags = [], loading: externalLoading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'active',
    type: 'Recurring',
    lastService: '',
    address: '',
    totalSpent: '',
    tags: [],
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        status: customer.status || 'active',
        type: customer.type || 'Recurring',
        lastService: customer.lastService || '',
        address: customer.address || '',
        totalSpent: customer.totalSpent ? customer.totalSpent.toString() : '',
        tags: customer.tags || [],
      })
    }
  }, [customer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const handleTagsChange = (tags) => {
    setFormData((prev) => ({
      ...prev,
      tags,
    }))
  }

  const handleSubmit = () => {
    const validation = validateCustomerForm(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onSave({
        ...formData,
        phone: normalizePhoneNumber(formData.phone),
        totalSpent: parseFloat(formData.totalSpent) || 0,
      })
    }, 300)
  }

  const isLoading = loading || externalLoading

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <InputField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Customer name"
            required
            error={errors.name}
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 2 characters required</p>
        </div>
        <div>
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
            error={errors.email}
          />
          <p className="text-xs text-gray-500 mt-1">Must be a valid email address</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <InputField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            required
            error={errors.phone}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter 10 digits for US numbers (e.g., 2025551234). Country code +1 is added automatically.
          </p>
          <p className="text-xs text-gray-500">
            For other countries, include the country code (e.g., +44 7911 123456 for UK).
          </p>
        </div>
        <SelectField
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
          error={errors.status}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SelectField
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={typeOptions}
          required
          error={errors.type}
        />
        <InputField
          label="Last Service"
          name="lastService"
          type="date"
          value={formData.lastService}
          onChange={handleChange}
          error={errors.lastService}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <InputField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main St"
          error={errors.address}
        />
        <InputField
          label="Total Spent"
          name="totalSpent"
          type="number"
          value={formData.totalSpent}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          error={errors.totalSpent}
        />
      </div>

      <div>
        <TagSelector
          selectedTags={formData.tags}
          onChange={handleTagsChange}
          availableTags={availableTags}
        />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <SaveButton onClick={handleSubmit} loading={isLoading} />
      </div>
    </div>
  )
}

CustomerForm.propTypes = {
  customer: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  availableTags: PropTypes.array,
  loading: PropTypes.bool,
}

export default CustomerForm
