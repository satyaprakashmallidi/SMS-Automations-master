import { useState, useEffect } from 'react'
import InputField from '../ui/InputField'
import TextareaField from '../ui/TextareaField'
import SaveButton from '../ui/SaveButton'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAuth'
import { getSettings, updateSettings } from '../../services/settingsService'

function CompanyTab() {
  const { user } = useAuth()
  const showToast = useToast()
  const [formData, setFormData] = useState({
    companyName: '',
    businessAddress: '',
    businessPhone: '',
    website: '',
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
            companyName: settings.companyName || '',
            businessAddress: settings.businessAddress || '',
            businessPhone: settings.businessPhone || '',
            website: settings.website || '',
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
        Company Details
      </h2>

      <InputField
        label="Company Name"
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
        required
      />

      <TextareaField
        label="Business Address"
        name="businessAddress"
        value={formData.businessAddress}
        onChange={handleChange}
        rows={2}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Business Phone"
          name="businessPhone"
          value={formData.businessPhone}
          onChange={handleChange}
          required
        />
        <InputField
          label="Website"
          name="website"
          value={formData.website}
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

export default CompanyTab
