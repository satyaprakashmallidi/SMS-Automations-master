import { useState, useEffect } from 'react'
import InputField from '../ui/InputField'
import TextareaField from '../ui/TextareaField'
import SelectField from '../ui/SelectField'
import SaveButton from '../ui/SaveButton'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAuth'
import { getSettings, updateSettings } from '../../services/settingsService'

function SMSSettingsTab() {
  const { user } = useAuth()
  const showToast = useToast()
  const [formData, setFormData] = useState({
    timezone: '',
    senderName: '',
    defaultSignature: '',
  })

  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    // North America
    { value: 'America/Anchorage', label: 'Alaska (AKST/AKDT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
    { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
    { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
    { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
    { value: 'America/Toronto', label: 'Eastern Time - Canada (EST/EDT)' },
    { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
    // South America
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)' },
    // Europe
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
    { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
    { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
    { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
    // Middle East
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    // Asia
    { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
    { value: 'Asia/Shanghai', label: 'China (CST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)' },
    // Australia & Pacific
    { value: 'Australia/Perth', label: 'Perth (AWST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
    { value: 'Australia/Melbourne', label: 'Melbourne (AEDT/AEST)' },
    { value: 'Pacific/Auckland', label: 'New Zealand (NZDT/NZST)' },
  ]

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!user?.id) return
        setIsLoading(true)
        const settings = await getSettings(user.id)
        if (settings) {
          setFormData({
            timezone: settings.timezone || '',
            senderName: settings.senderName || '',
            defaultSignature: settings.defaultSignature || '',
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
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
        SMS Configuration
      </h2>

      <SelectField
        label="Timezone"
        name="timezone"
        value={formData.timezone}
        onChange={handleChange}
        options={timezoneOptions}
        helperText="Scheduled campaigns will send based on this timezone"
        required
      />

      <InputField
        label="Sender Name"
        name="senderName"
        value={formData.senderName}
        onChange={handleChange}
        helperText="This will appear as the sender of your SMS messages"
        required
      />

      <TextareaField
        label="Default Signature"
        name="defaultSignature"
        value={formData.defaultSignature}
        onChange={handleChange}
        rows={3}
        required
      />

      <div className="flex justify-end mt-8">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  )
}

export default SMSSettingsTab
