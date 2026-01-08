/**
 * Format timestamp to relative time string (e.g., "2h ago", "Yesterday")
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  const messageDate = new Date(timestamp)
  if (Number.isNaN(messageDate.getTime())) return ''
  const now = new Date()
  const diffMs = now - messageDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format timestamp to time string for message display (e.g., "2:30 PM")
 */
export const formatMessageTimeOfDay = (timestamp) => {
  if (!timestamp) return ''
  const messageDate = new Date(timestamp)
  if (Number.isNaN(messageDate.getTime())) return ''
  return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/**
 * Format timestamp to date divider string (e.g., "Today", "Yesterday", "Nov 25, 2025")
 */
export const formatMessageDate = (timestamp) => {
  if (!timestamp) return ''
  const messageDate = new Date(timestamp)
  if (Number.isNaN(messageDate.getTime())) return ''
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()

  if (isSameDay(messageDate, today)) return 'Today'
  if (isSameDay(messageDate, yesterday)) return 'Yesterday'
  return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Get initials from a full name (e.g., "John Doe" → "JD")
 */
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Get avatar background color based on name hash
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
  ]
  if (!name) return colors[0]
  return colors[name.charCodeAt(0) % colors.length]
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
