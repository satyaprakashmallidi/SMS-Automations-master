import PropTypes from 'prop-types'
import { getInitials, getAvatarColor, formatMessageTime } from '../../utils/timeFormatters'

function ConversationItem({
  conversation,
  customer = null,
  isSelected = false,
  onClick,
}) {
  if (!conversation) return null

  const displayName = customer?.name || conversation.customerName || 'Unknown customer'
  const lastMessagePreview = conversation.lastMessage || 'No messages yet'
  const timeLabel = conversation.lastMessageTime
    ? formatMessageTime(conversation.lastMessageTime)
    : ''

  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            flex-shrink-0 font-semibold text-sm
            ${getAvatarColor(displayName)}
          `}
        >
          {getInitials(displayName)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and time */}
          <div className="flex justify-between items-baseline gap-2 mb-1">
            <p className="font-semibold text-gray-900 truncate">
              {displayName}
            </p>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {timeLabel || '—'}
            </span>
          </div>

          {/* Message preview */}
          <p className="text-sm text-gray-600 truncate">
            {lastMessagePreview}
          </p>
        </div>

        {/* Unread badge */}
        {conversation.unreadCount > 0 && (
          <div className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </div>
        )}
      </div>
    </div>
  )
}

ConversationItem.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lastMessage: PropTypes.string,
    lastMessageTime: PropTypes.string,
    unreadCount: PropTypes.number,
    status: PropTypes.string,
  }).isRequired,
  customer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}

export default ConversationItem
