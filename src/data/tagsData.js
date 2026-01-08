export const TAG_TYPES = {
  AUTO: 'auto',
  MANUAL: 'manual',
}

export const typeOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
]

// Predefined color palette for tags
export const TAG_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6B7280', // gray
  '#F97316', // orange
]

// Commonly used lucide-react icons for tags
export const TAG_ICONS = [
  { name: 'Star', label: 'Star' },
  { name: 'Users', label: 'Users' },
  { name: 'TrendingUp', label: 'Trending Up' },
  { name: 'DollarSign', label: 'Dollar Sign' },
  { name: 'Gift', label: 'Gift' },
  { name: 'AlertTriangle', label: 'Alert' },
  { name: 'Heart', label: 'Heart' },
  { name: 'Award', label: 'Award' },
  { name: 'Crown', label: 'Crown' },
  { name: 'Zap', label: 'Zap' },
  { name: 'Target', label: 'Target' },
  { name: 'Shield', label: 'Shield' },
]

export const mockTags = [
  {
    id: 1,
    name: 'VIP',
    icon: 'Crown',
    color: '#F59E0B',
    definition: 'Top-tier customers with highest value',
    trigger: 'Top 10% by spend OR $1,000+ lifetime value',
    type: 'auto',
    createdAt: '2024-11-20',
    updatedAt: '2024-11-20',
  },
  {
    id: 2,
    name: 'Loyal',
    icon: 'Heart',
    color: '#EC4899',
    definition: 'Repeat customers with consistent bookings',
    trigger: '$500+ lifetime spend',
    type: 'auto',
    createdAt: '2024-11-19',
    updatedAt: '2024-11-19',
  },
  {
    id: 3,
    name: 'At Risk',
    icon: 'AlertTriangle',
    color: '#EF4444',
    definition: 'Previous customers who haven\'t booked recently',
    trigger: 'Had a booking but none in last 180 days',
    type: 'auto',
    createdAt: '2024-11-18',
    updatedAt: '2024-11-18',
  },
  {
    id: 4,
    name: 'New Customer',
    icon: 'Users',
    color: '#3B82F6',
    definition: 'Recently acquired customers',
    trigger: 'First booking within last 30 days',
    type: 'auto',
    createdAt: '2024-11-17',
    updatedAt: '2024-11-17',
  },
  {
    id: 5,
    name: 'High Value',
    icon: 'DollarSign',
    color: '#10B981',
    definition: 'Customers with significant spend',
    trigger: '$300+ lifetime spend',
    type: 'auto',
    createdAt: '2024-11-16',
    updatedAt: '2024-11-16',
  },
  {
    id: 6,
    name: 'One-Timer',
    icon: 'Target',
    color: '#8B5CF6',
    definition: 'Customers with single booking, no return',
    trigger: 'Only 1 booking, 90+ days ago',
    type: 'auto',
    createdAt: '2024-11-15',
    updatedAt: '2024-11-15',
  },
  {
    id: 7,
    name: 'Lead - New Inquiry',
    icon: 'Zap',
    color: '#F97316',
    definition: 'Submitted a quote/booking request but not yet scheduled.',
    trigger: 'Auto when website form submitted or chat lead captured.',
    type: 'auto',
    createdAt: '2024-11-14',
    updatedAt: '2024-11-14',
  },
  {
    id: 8,
    name: 'Lead - Quote Sent',
    icon: 'Award',
    color: '#6B7280',
    definition: 'Price/estimate sent but no booking yet.',
    trigger: 'Auto when estimate/SMS sent; remove on booking.',
    type: 'auto',
    createdAt: '2024-11-13',
    updatedAt: '2024-11-13',
  },
]
