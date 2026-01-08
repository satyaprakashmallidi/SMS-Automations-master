import { Outlet } from 'react-router-dom'
import SettingsSidebar from '../components/settings/SettingsSidebar'

function SettingsPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Manage your account, company, and SMS preferences
        </p>
      </div>

      {/* Main Content with Cards */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Sidebar Card */}
        <div className="w-full lg:w-auto">
          <SettingsSidebar />
        </div>

        {/* Content Card */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-8">
          <div className="max-w-2xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
