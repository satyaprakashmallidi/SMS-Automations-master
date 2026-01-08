import PropTypes from 'prop-types'
import { MessageCircle, Send, Clock, AlertTriangle, FileText } from 'lucide-react'

const VARIANT_META = {
  sent: {
    icon: Send,
    dot: 'bg-blue-500',
    label: 'Messages Sent',
  },
  received: {
    icon: MessageCircle,
    dot: 'bg-green-500',
    label: 'Message Received',
  },
  scheduled: {
    icon: Clock,
    dot: 'bg-amber-500',
    label: 'Campaign Scheduled',
  },
  draft: {
    icon: FileText,
    dot: 'bg-gray-400',
    label: 'Draft Saved',
  },
  failed: {
    icon: AlertTriangle,
    dot: 'bg-red-500',
    label: 'Send Failed',
  },
}

function RecentActivityFeed({ activities = [], isLoading = false }) {
  const hasActivity = activities.length > 0

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col h-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4 md:mb-6">
        Recent Activity
      </h3>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center text-gray-500 text-sm py-10">
            Loading activity...
          </div>
        ) : !hasActivity ? (
          <div className="text-center text-gray-500 text-sm py-10">
            No campaign activity yet.
          </div>
        ) : (
          activities.map((activity, index) => {
            const meta = VARIANT_META[activity.variant] || VARIANT_META.sent
            const IconComponent = meta.icon || Send
            return (
              <div key={activity.id} className="flex items-start">
                {/* Timeline Line */}
                <div className="flex flex-col items-center mr-4">
                  <div
                    className={`w-3 h-3 rounded-full ${meta.dot} border-4 border-white`}
                  />
                  {index < activities.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Activity Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-gray-700" />
                    <span className="text-sm font-medium text-gray-900">
                      {activity.label || meta.label}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}

RecentActivityFeed.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      variant: PropTypes.oneOf(['sent', 'received', 'scheduled', 'failed', 'draft']),
      label: PropTypes.string,
      description: PropTypes.string,
      timestamp: PropTypes.string,
    })
  ),
  isLoading: PropTypes.bool,
}

export default RecentActivityFeed
