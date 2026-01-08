import { useState, useEffect } from 'react'
import InputField from '../ui/InputField'
import SaveButton from '../ui/SaveButton'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAuth'
import { getSettings, updateSettings } from '../../services/settingsService'

function AccountTab() {
  const { user } = useAuth()
  const showToast = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!user?.id) return
        setIsLoading(true)
        const settings = await getSettings(user.id)
        if (settings) {
          setFormData({
            firstName: settings.firstName || '',
            lastName: settings.lastName || '',
            email: settings.email || '',
            phone: settings.phone || '',
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        showToast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [user?.id, showToast])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      if (!user?.id) {
        showToast.error('User not authenticated')
        return
      }

      setLoading(true)
      await updateSettings(user.id, formData)
      showToast.success('Changes saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast.error(error.message || 'Failed to save changes')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Profile Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <InputField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <InputField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex justify-end mt-8">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  )
}

export default AccountTab
