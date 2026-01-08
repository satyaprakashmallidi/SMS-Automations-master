import { useState } from 'react'
import InputField from '../ui/InputField'
import SaveButton from '../ui/SaveButton'
import { useToast } from '../../hooks/useToast'

function SecurityTab() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  })

  const [loading, setLoading] = useState(false)
  const showToast = useToast()

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = () => {
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      showToast.error('Passwords do not match!')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      showToast.success('Changes saved successfully!')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Password</h2>

        <InputField
          label="Current Password"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange}
        />

        <InputField
          label="New Password"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
        />

        <InputField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Two-Factor Authentication
        </h2>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="twoFactor"
                checked={formData.twoFactorEnabled}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    twoFactorEnabled: e.target.checked,
                  }))
                }
                className="mt-1 w-5 h-5 rounded cursor-pointer accent-blue-600"
              />
              <div>
                <label
                  htmlFor="twoFactor"
                  className="block text-sm font-medium text-gray-900 cursor-pointer"
                >
                  SMS Authentication
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Receive verification codes via SMS
                </p>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Enable
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  )
}

export default SecurityTab
