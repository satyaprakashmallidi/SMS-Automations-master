import { useMemo } from 'react'
import PropTypes from 'prop-types'
import SearchInput from '../ui/SearchInput'
import TabFilter from '../ui/TabFilter'
import ConversationItem from './ConversationItem'

function ConversationList({
  conversations = [],
  customers = [],
  isLoading = false,
  selectedConversationId,
  onSelectConversation,
  filterTab,
  onFilterChange,
  searchTerm,
  onSearchChange,
}) {
  const customerMap = useMemo(() => {
    const map = new Map()
    customers.forEach((customer) => {
      if (customer?.id === undefined || customer?.id === null) return
      map.set(String(customer.id), customer)
    })
    return map
  }, [customers])

  const getCustomerForConversation = (conversation) => {
    if (!conversation?.customerId) return null
    return customerMap.get(String(conversation.customerId)) || null
  }

  // Filter conversations based on tab
  const filterByTab = (conversations) => {
    if (filterTab === 'unread') {
      return conversations.filter((c) => c.status === 'unread')
    }
    if (filterTab === 'unresponded') {
      return conversations.filter((c) => c.status === 'unresponded')
    }
    return conversations // 'all'
  }

  // Filter conversations based on search term
  const filterBySearch = (conversations) => {
    if (!searchTerm.trim()) return conversations

    const term = searchTerm.toLowerCase()
    return conversations.filter((conv) => {
      const customer = getCustomerForConversation(conv)
      const customerName = customer?.name || conv.customerName || ''
      const customerMatch = customerName.toLowerCase().includes(term)
      const messageMatch = (conv.lastMessage || '').toLowerCase().includes(term)
      return customerMatch || messageMatch
    })
  }

  // Sort by most recent first
  const sortByTime = (conversations) => {
    const toTimestamp = (conv) => {
      const candidate =
        conv.lastMessageTime ||
        getCustomerForConversation(conv)?.updatedAt ||
        getCustomerForConversation(conv)?.createdAt ||
        null

      if (!candidate) return 0
      const value = new Date(candidate).getTime()
      return Number.isNaN(value) ? 0 : value
    }

    return [...conversations].sort((a, b) => toTimestamp(b) - toTimestamp(a))
  }

  // Apply all filters
  let filtered = conversations
  filtered = filterByTab(filtered)
  filtered = filterBySearch(filtered)
  filtered = sortByTime(filtered)

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Header with search */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Messages</h2>
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search conversations..."
        />
      </div>

      {/* Tabs */}
      <div className="border-b">
        <TabFilter
          activeTab={filterTab}
          onTabChange={onFilterChange}
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'unresponded', label: 'Unresponded' },
          ]}
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>Loading conversations...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((conversation) => {
            const customer = getCustomerForConversation(conversation)
            const selectionId = conversation.customerId
            return (
              <ConversationItem
                key={conversation.id || selectionId}
                conversation={conversation}
                customer={customer}
                isSelected={
                  selectionId !== undefined &&
                  selectedConversationId !== null &&
                  String(selectedConversationId) === String(selectionId)
                }
                onClick={() => onSelectConversation(selectionId)}
              />
            )
          })
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}

ConversationList.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      customerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      lastMessage: PropTypes.string,
      lastMessageTime: PropTypes.string,
      unreadCount: PropTypes.number,
      status: PropTypes.string,
    })
  ),
  customers: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  selectedConversationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectConversation: PropTypes.func.isRequired,
  filterTab: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
}

export default ConversationList
