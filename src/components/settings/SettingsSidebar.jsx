import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'

function SettingsSidebar() {
  const settingsTabs = [
    {
      id: 1,
      label: 'Account',
      path: '/settings/account',
      icon: 'User',
    },
    {
      id: 2,
      label: 'Company',
      path: '/settings/company',
      icon: 'Building2',
    },
    {
      id: 3,
      label: 'SMS Settings',
      path: '/settings/sms-settings',
      icon: 'MessageSquare',
    },
    {
      id: 4,
      label: 'Billing',
      path: '/settings/billing',
      icon: 'CreditCard',
    },
  ]

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName]
    return IconComponent ? (
      <IconComponent className="w-5 h-5" strokeWidth={1.5} />
    ) : null
  }

  return (
    <div className="w-full lg:w-64 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-4 lg:flex lg:flex-col lg:py-6">
        {settingsTabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center lg:justify-start gap-1.5 p-2 lg:flex-row lg:gap-3 lg:px-6 lg:py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50/50 lg:bg-blue-50 lg:border-l-4 lg:border-blue-600 border-b-2 border-blue-600 lg:border-b-0'
                  : 'text-gray-700 lg:border-l-4 border-b-2 border-transparent lg:border-b-0 hover:bg-gray-50'
              }`
            }
          >
            <span className="flex-shrink-0">{getIcon(tab.icon)}</span>
            <span className="text-[10px] sm:text-xs lg:text-sm text-center leading-tight">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default SettingsSidebar
