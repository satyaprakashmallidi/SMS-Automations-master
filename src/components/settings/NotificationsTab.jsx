import { useState } from 'react'
import CheckboxField from '../ui/CheckboxField'
import SaveButton from '../ui/SaveButton'
import { useToast } from '../../hooks/useToast'

function NotificationsTab() {
  const [formData, setFormData] = useState({
    campaignCompletion: true,
    lowCredit: true,
    monthlyReports: false,
    newCustomer: true,
  })

  const [loading, setLoading] = useState(false)
  const showToast = useToast()

  const notifications = [
    {
      id: 'campaignCompletion',
      label: 'Campaign completion',
      description: 'Get notified when your campaigns finish',
    },
    {
      id: 'lowCredit',
      label: 'Low credit balance',
      description: 'Alert when SMS credits are running low',
    },
    {
      id: 'monthlyReports',
      label: 'Monthly reports',
      description: 'Receive monthly performance summaries',
    },
    {
      id: 'newCustomer',
      label: 'New customer added',
      description: 'Notification when customers are added to your list',
    },
  ]

  const handleChange = e => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast.success('Changes saved successfully!')
    }, 1000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Email Notifications
      </h2>

      <div className="space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="flex justify-between items-start"
          >
            <div className="flex-1">
              <CheckboxField
                label={notification.label}
                name={notification.id}
                checked={formData[notification.id]}
                onChange={handleChange}
                description={notification.description}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  )
}

export default NotificationsTab
