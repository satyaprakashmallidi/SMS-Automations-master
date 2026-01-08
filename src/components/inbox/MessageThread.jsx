import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { ArrowLeft, Info } from 'lucide-react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import { formatPhoneNumber } from '../../utils/formatters'
import {
  formatMessageDate,
  getInitials,
  getAvatarColor,
} from '../../utils/timeFormatters'

function MessageThread({
  conversation = null,
  customer = null,
  onBack,
  onShowCustomerDetails,
  isMobile = false,
  isLoading = false,
  onSendMessage,
  isSending = false,
}) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.id, conversation?.messages?.length])

  const handleSendMessage = (message) => {
    if (typeof onSendMessage !== 'function') return
    if (!conversation?.customerId) return
    onSendMessage(conversation.customerId, message)
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading conversation...</p>
        </div>
        <MessageInput disabled={true} onSend={() => {}} />
      </div>
    )
  }

  if (!conversation || !customer) {
    return (
      <div className="h-full w-full flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No conversation selected
            </h3>
            <p className="text-sm text-gray-600">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
        <MessageInput disabled={true} onSend={() => {}} />
      </div>
    )
  }

  const conversationMessages = Array.isArray(conversation.messages)
    ? conversation.messages
    : []

  const normalizedMessages = conversationMessages
    .map((message, index) => {
      const rawTimestamp =
        message?.timestamp ||
        message?.sent_at ||
        message?.created_at ||
        ''
      const parsedTimestamp = rawTimestamp ? new Date(rawTimestamp).getTime() : NaN
      const sortKey = Number.isNaN(parsedTimestamp) ? index : parsedTimestamp

      const statusDetails = message?.statusDetails || message?.status_details || null

      return {
        id:
          message?.id ||
          message?.providerMessageId ||
          `${conversation.customerId || 'message'}-${index}`,
        senderType: message?.direction === 'outbound' ? 'business' : 'customer',
        content: message?.content || '',
        timestamp: Number.isNaN(parsedTimestamp) ? '' : rawTimestamp,
        status: message?.status || '',
        statusDetails,
        sortKey,
      }
    })
    .filter((msg) => msg.content.trim().length > 0)
    .sort((a, b) => a.sortKey - b.sortKey)

  const messagesByDate = normalizedMessages.reduce((groups, msg) => {
    const label = msg.timestamp ? formatMessageDate(msg.timestamp) : 'Undated'
    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(msg)
    return groups
  }, {})
  const dateKeys = Object.keys(messagesByDate)

  const canShowDetails = typeof onShowCustomerDetails === 'function'
  const handleShowDetails = () => {
    if (canShowDetails) {
      onShowCustomerDetails()
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {customer && (
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {isMobile && onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div
              className={`
                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
                font-semibold text-xs md:text-sm flex-shrink-0 cursor-pointer
                hover:ring-2 hover:ring-blue-500 hover:ring-offset-2
                transition-all
                ${getAvatarColor(customer.name)}
              `}
              onClick={handleShowDetails}
            >
              {getInitials(customer.name)}
            </div>

            <div className="flex-1 min-w-0 ml-2">
              <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                {customer.name}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 truncate">
                {customer.phone
                  ? formatPhoneNumber(customer.phone)
                  : customer.email || 'No contact info'}
              </p>
            </div>
          </div>

          <div className="mx-2 flex-shrink-0 text-center">
            <p className="text-[10px] md:text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 md:px-3 md:py-1 rounded-full border border-gray-100 truncate inline-block">
              <span className="md:hidden">~$0.0055 / msg</span>
              <span className="hidden md:inline">It will take around $0.0055 for sending 1 message (160 characters)</span>
            </p>
          </div>

          <button
            onClick={handleShowDetails}
            disabled={!canShowDetails}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              canShowDetails
                ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Show customer details"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {normalizedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No messages yet</p>
              <p className="text-xs text-gray-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          dateKeys.map((date) => (
            <div key={date}>
              {date !== 'Undated' && date.length > 0 && (
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 border-t border-gray-300" />
                  <span className="text-xs text-gray-500 font-semibold px-3 py-1 bg-white rounded-full shadow-sm">
                    {date}
                  </span>
                  <div className="flex-1 border-t border-gray-300" />
                </div>
              )}

              <div className="space-y-4">
                {messagesByDate[date].map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg.content}
                    senderType={msg.senderType}
                    timestamp={msg.timestamp || ''}
                    status={msg.status}
                    statusDetails={msg.statusDetails}
                  />
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        disabled={!conversation || !customer}
        onSend={handleSendMessage}
        isSending={isSending}
      />
    </div>
  )
}

MessageThread.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.string,
    customerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    messages: PropTypes.arrayOf(PropTypes.object),
  }),
  customer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
  }),
  onBack: PropTypes.func,
  onShowCustomerDetails: PropTypes.func,
  isMobile: PropTypes.bool,
  isLoading: PropTypes.bool,
  onSendMessage: PropTypes.func,
  isSending: PropTypes.bool,
}

export default MessageThread
