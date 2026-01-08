import PropTypes from 'prop-types'
import { formatMessageTimeOfDay } from '../../utils/timeFormatters'

const STATUS_META = {
  delivered: { color: 'bg-green-500', label: 'Delivered' },
  sent: { color: 'bg-amber-500', label: 'Sent' },
  queued: { color: 'bg-amber-500', label: 'Queued' },
  pending: { color: 'bg-amber-500', label: 'Pending' },
  uncertain: { color: 'bg-amber-500', label: 'Uncertain' },
  failed: { color: 'bg-red-500', label: 'Failed' },
  error: { color: 'bg-red-500', label: 'Failed' },
}

function MessageBubble({ message, senderType, timestamp, status, statusDetails }) {
  const isFromBusiness = senderType === 'business'
  const normalizedStatus = (status || '').toLowerCase()
  const statusInfo = STATUS_META[normalizedStatus]
  const latestStatusEvent =
    statusDetails?.events?.[statusDetails.events.length - 1] || null

  const statusTooltip = (() => {
    if (!statusInfo && !latestStatusEvent) return ''
    const parts = []
    if (statusInfo?.label) {
      parts.push(statusInfo.label)
    } else if (latestStatusEvent?.value) {
      parts.push(latestStatusEvent.value)
    }
    if (latestStatusEvent?.classification) {
      parts.push(`(${latestStatusEvent.classification})`)
    }
    if (latestStatusEvent?.checkedAt) {
      const parsedDate = new Date(latestStatusEvent.checkedAt)
      if (!Number.isNaN(parsedDate.getTime())) {
        parts.push(`• ${parsedDate.toLocaleString()}`)
      }
    }
    return parts.filter(Boolean).join(' ')
  })()

  return (
    <div className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      <div
        className={`
          max-w-md px-4 py-2 rounded-lg
          ${
            isFromBusiness
              ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
          }
        `}
      >
        <p className="text-sm break-words">{message}</p>
        <p className={`text-xs mt-1 ${isFromBusiness ? 'opacity-70' : 'text-gray-500'}`}>
          {formatMessageTimeOfDay(timestamp)}
        </p>
      </div>
      {isFromBusiness && statusInfo && (
        <span
          className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`}
          title={statusTooltip || statusInfo.label}
        />
      )}
    </div>
  )
}

MessageBubble.propTypes = {
  message: PropTypes.string.isRequired,
  senderType: PropTypes.oneOf(['customer', 'business']).isRequired,
  timestamp: PropTypes.string.isRequired,
  status: PropTypes.string,
  statusDetails: PropTypes.shape({
    events: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        source: PropTypes.string,
        checkedAt: PropTypes.string,
        classification: PropTypes.string,
      })
    ),
  }),
}

export default MessageBubble
