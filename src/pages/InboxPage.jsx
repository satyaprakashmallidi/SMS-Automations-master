import { useState, useEffect } from 'react'
import ConversationList from '../components/inbox/ConversationList'
import MessageThread from '../components/inbox/MessageThread'
import CustomerDetails from '../components/inbox/CustomerDetails'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getCustomers } from '../services/customersService'
import { getTags } from '../services/tagsService'
import {
  ensureCustomerConversations,
  getCustomerConversations,
  deleteCustomerConversations,
  markConversationAsRead,
} from '../services/conversationsService'
import { sendDirectMessage } from '../services/inboxMessagingService'

const generateMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function InboxPage() {
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  // State management
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [filterTab, setFilterTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [customers, setCustomers] = useState([])
  const [tags, setTags] = useState([])
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sendingConversations, setSendingConversations] = useState({})

  // Detect actual screen size for mobile vs desktop
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'thread' | 'details'

  // Listen for window resize to detect mobile vs desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let isCancelled = false

    const loadData = async () => {
      if (!user?.id || authLoading) return
      setIsLoading(true)

      try {
        const [fetchedCustomers, fetchedTags] = await Promise.all([
          getCustomers(user.id),
          getTags(user.id),
        ])

        if (isCancelled) return
        setCustomers(fetchedCustomers)
        setTags(fetchedTags)

        await ensureCustomerConversations(user.id, fetchedCustomers)
        const conversationRows = await getCustomerConversations(user.id)
        if (isCancelled) return

        const normalizeConversation = (row) => {
          const customerId = row.customer_id ? String(row.customer_id) : null
          const messageHistory = Array.isArray(row.messages) ? row.messages : []
          const lastMessageFromHistory =
            messageHistory.length > 0
              ? messageHistory[messageHistory.length - 1]
              : null

          const lastMessageContent =
            row.last_message ||
            lastMessageFromHistory?.content ||
            ''
          const lastMessageTime =
            row.last_message_at ||
            lastMessageFromHistory?.timestamp ||
            row.updated_at ||
            null

          const deliveryStatus = typeof row.status === 'string' ? row.status : null

          let status = 'open'
          if ((row.unread_count || 0) > 0) {
            status = 'unread'
          } else if (!deliveryStatus && lastMessageFromHistory?.direction === 'inbound') {
            status = 'unresponded'
          } else if (deliveryStatus) {
            status = deliveryStatus
          }

          return {
            id: row.id,
            customerId,
            customerName: row.customer_name || '',
            lastMessage: lastMessageContent,
            lastMessageTime,
            unreadCount: row.unread_count || 0,
            status,
            deliveryStatus,
            messages: messageHistory,
          }
        }

        const customerIdSet = new Set(
          fetchedCustomers
            .map((customer) =>
              customer?.id === undefined || customer?.id === null ? null : String(customer.id)
            )
            .filter(Boolean)
        )

        const validConversationRows = []
        const orphanCustomerIds = []
        const rows = Array.isArray(conversationRows) ? conversationRows : []

        rows.forEach((row) => {
          const customerId = row.customer_id ? String(row.customer_id) : null
          if (customerId && customerIdSet.has(customerId)) {
            validConversationRows.push(row)
          } else if (customerId) {
            orphanCustomerIds.push(customerId)
          }
        })

        if (orphanCustomerIds.length > 0) {
          deleteCustomerConversations(user.id, orphanCustomerIds).catch((error) => {
            console.error('Failed to prune orphaned conversations:', error)
          })
        }

        setConversations(validConversationRows.map(normalizeConversation))
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load inbox data', error)
          toast.error('Failed to load inbox data')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => {
      isCancelled = true
    }
  }, [user?.id, authLoading, toast])

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedConversationId(null)
      return
    }

    if (
      selectedConversationId &&
      conversations.some(
        (conv) => String(conv.customerId) === String(selectedConversationId)
      )
    ) {
      return
    }

    setSelectedConversationId(conversations[0].customerId)
  }, [conversations, selectedConversationId])

  // Mark conversation as read when selected
  useEffect(() => {
    if (!user?.id || !selectedConversationId) return

    const selectedConv = conversations.find(
      (conv) => String(conv.customerId) === String(selectedConversationId)
    )

    // Only mark as read if there are unread messages
    if (selectedConv && selectedConv.unreadCount > 0) {
      markConversationAsRead(user.id, selectedConversationId).then(() => {
        // Update local state to reflect the read status
        setConversations((prev) =>
          prev.map((conv) =>
            String(conv.customerId) === String(selectedConversationId)
              ? { ...conv, unreadCount: 0, status: conv.status === 'unread' ? 'open' : conv.status }
              : conv
          )
        )
      }).catch((error) => {
        console.error('Failed to mark conversation as read:', error)
      })
    }
  }, [selectedConversationId, user?.id])

  const activeConversation =
    conversations.find(
      (conv) => String(conv.customerId) === String(selectedConversationId)
    ) || null

  // Find customer from customers list, or create fallback from conversation data
  let activeCustomer = customers.find((customer) => {
    // Match by customer ID
    if (String(customer.id) === String(selectedConversationId)) return true
    // Also match by phone number (for inbound-only contacts)
    const customerPhone = customer.phone || customer.phone_number || customer.phoneNumber
    if (customerPhone && customerPhone.replace(/\D/g, '') === String(selectedConversationId).replace(/\D/g, '')) {
      return true
    }
    return false
  })

  // If not found in customers list (inbound-only contact), create from conversation data
  if (!activeCustomer && activeConversation) {
    activeCustomer = {
      id: activeConversation.customerId,
      name: activeConversation.customerName || `Incoming ${activeConversation.customerId}`,
      phone: activeConversation.customerId,
      source: 'inbound',
    }
  }

  const updateConversationMessages = (conversationId, newMessage) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (String(conv.customerId) !== String(conversationId)) return conv

        const existingMessages = Array.isArray(conv.messages) ? conv.messages : []
        const nextMessages = [...existingMessages, newMessage]

        return {
          ...conv,
          messages: nextMessages,
          lastMessage: newMessage.content,
          lastMessageTime: newMessage.timestamp,
          unreadCount: 0,
          status: 'open',
        }
      })
    )
  }

  const handleSendConversationMessage = async (conversationId, text) => {
    if (!conversationId || !text?.trim()) return
    if (!user?.id) {
      toast.error('You must be logged in to send messages')
      return
    }

    const customerRecord =
      customers.find((c) => String(c.id) === String(conversationId)) || null

    if (!customerRecord) {
      toast.error('Customer details not found for this conversation')
      return
    }

    if (!customerRecord.phone) {
      toast.error('Customer phone number is required to send messages')
      return
    }

    setSendingConversations((prev) => ({
      ...prev,
      [conversationId]: true,
    }))

    try {
      const response = await sendDirectMessage({
        userId: user.id,
        customer: customerRecord,
        message: text,
      })

      const newMessageEntry = {
        id: response?.message?.id || generateMessageId(),
        direction: 'outbound',
        content: response?.message?.content || text,
        status: response?.message?.status || 'queued',
        timestamp: response?.message?.timestamp || new Date().toISOString(),
      }

      updateConversationMessages(conversationId, newMessageEntry)
      toast.success('Message sent')
    } catch (error) {
      console.error('Failed to send inbox message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingConversations((prev) => {
        const next = { ...prev }
        delete next[conversationId]
        return next
      })
    }
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Column: Conversation List - fixed width on desktop, full width on mobile if in list view */}
      <div
        className={`
          ${isMobileScreen && mobileView !== 'list' ? 'hidden' : 'flex'}
          w-full lg:w-80
          border-r border-gray-200
          bg-white
          h-full
          flex-shrink-0
        `}
      >
        <ConversationList
          conversations={conversations}
          customers={customers}
          isLoading={isLoading}
          selectedConversationId={selectedConversationId}
          onSelectConversation={(id) => {
            setSelectedConversationId(id ? String(id) : null)
            if (isMobileScreen) {
              setMobileView('thread')
            }
          }}
          filterTab={filterTab}
          onFilterChange={setFilterTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Middle Column: Message Thread - flex-1, hidden on mobile if not in thread view */}
      <div
        className={`
          ${isMobileScreen && mobileView !== 'thread' ? 'hidden' : 'flex'}
          flex-1
          flex-col
          bg-white
          h-full
          min-w-0
        `}
      >
        <MessageThread
          conversation={activeConversation}
          customer={activeCustomer}
          onBack={() => {
            if (isMobileScreen) {
              setMobileView('list')
            }
          }}
          onShowCustomerDetails={() => {
            if (!activeCustomer) return
            setShowCustomerDetails(true)
            if (isMobileScreen) {
              setMobileView('details')
            }
          }}
          isMobile={isMobileScreen}
          isLoading={isLoading}
          onSendMessage={handleSendConversationMessage}
          isSending={
            !!(
              activeConversation &&
              sendingConversations[String(activeConversation.customerId)]
            )
          }
        />
      </div>

      {/* Right Panel: Customer Details - slide-over on all screen sizes, full screen on mobile */}
      {showCustomerDetails && activeCustomer && (
        <CustomerDetails
          customer={activeCustomer}
          onClose={() => {
            setShowCustomerDetails(false)
            if (isMobileScreen) {
              setMobileView('thread')
            }
          }}
          isMobile={isMobileScreen}
          tags={tags}
        />
      )}
    </div>
  )
}

export default InboxPage
