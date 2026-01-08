import PropTypes from 'prop-types'
import { Trash2 } from 'lucide-react'
import CampaignMetrics from './CampaignMetrics'

function CampaignCard({ campaign, onDelete, onEdit, onSchedule, onStart, onViewCustomers, showDelete = true, allowManagementActions = true }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateMessage = (message, maxLength = 100) => {
    if (!message) return 'No message yet'
    if (message.length > maxLength) return `${message.substring(0, maxLength)}...`
    return message
  }

  const formatActualCost = (value) => {
    if (value == null) return null
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    const fixed = num.toFixed(6)
    return fixed.replace(/\.?0+$/, '')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header with name and actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
          <p className="mt-1 text-xs text-gray-500">Campaign ID: {campaign.campaignId || campaign.id}</p>
        </div>

        {/* Action icons */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {allowManagementActions && (campaign.status === 'draft' || campaign.status === 'scheduled') && onEdit && (
            <button
              onClick={() => onEdit(campaign.id)}
              className="px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              Edit
            </button>
          )}

          {allowManagementActions && campaign.status === 'draft' && onSchedule && (
            <button
              onClick={() => onSchedule(campaign.id)}
              className="px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors"
            >
              Schedule
            </button>
          )}

          {allowManagementActions && (campaign.status === 'draft' || campaign.status === 'scheduled') && onStart && (
            <button
              onClick={() => onStart(campaign.id)}
              className="px-3 py-1 text-xs font-medium text-green-700 border border-green-200 rounded hover:bg-green-50 transition-colors"
            >
              Start
            </button>
          )}

          {onViewCustomers && (
            <button
              onClick={() => onViewCustomers(campaign.id)}
              className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              {campaign.status === 'completed' || campaign.status === 'sent'
                ? 'View details'
                : 'View customers'}
            </button>
          )}

          {allowManagementActions && showDelete && onDelete && (
            <button
              onClick={() => onDelete(campaign.id)}
              className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
              title="Delete campaign"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message preview */}
      <div className="bg-gray-50 rounded p-4 mb-4">
        <p className="text-sm text-gray-600 line-clamp-2">{truncateMessage(campaign.message)}</p>
      </div>

      {/* Sent info */}
      <div className="flex gap-6 text-sm text-gray-600 mb-4">
        <span>Sent: {campaign.sentAt ? formatDate(campaign.sentAt) : 'Not sent yet'}</span>
        <span>Recipients: {campaign.recipientCount}</span>
      </div>

      {(campaign.costEstimation != null || campaign.actualCost != null) && (
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
          {campaign.costEstimation != null && (
            <span>Est. cost: ${Number(campaign.costEstimation).toFixed(2)}</span>
          )}
          {campaign.actualCost != null && (
            <span>Actual cost: ${formatActualCost(campaign.actualCost)}</span>
          )}
        </div>
      )}

      {/* Metrics */}
      <CampaignMetrics
        sent={campaign.sentCount}
        delivered={campaign.deliveredCount}
        uncertain={campaign.uncertainCount}
        failed={campaign.failedCount}
        successRate={campaign.successRate}
      />
    </div>
  )
}

CampaignCard.propTypes = {
  campaign: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    campaignId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    sentAt: PropTypes.string,
    recipientCount: PropTypes.number.isRequired,
    costEstimation: PropTypes.number,
    actualCost: PropTypes.number,
    sentCount: PropTypes.number.isRequired,
    deliveredCount: PropTypes.number.isRequired,
    uncertainCount: PropTypes.number.isRequired,
    failedCount: PropTypes.number.isRequired,
    successRate: PropTypes.number.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onSchedule: PropTypes.func,
  onStart: PropTypes.func,
  onViewCustomers: PropTypes.func,
  showDelete: PropTypes.bool,
  allowManagementActions: PropTypes.bool,
}

export default CampaignCard
