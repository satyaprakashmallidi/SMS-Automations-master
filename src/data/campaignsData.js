// Campaign status options
export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'active', 'sent', 'failed']
export const CAMPAIGN_TYPES = ['one_time', 'recurring']

// Cost per SMS
export const COST_PER_SMS = 0.02

// Campaign status options for display
export const campaignStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'sent', label: 'Completed' },
]

// Customer type options
export const customerTypeOptions = [
  { value: 'all', label: 'All Active Customers' },
  { value: 'recurring', label: 'Recurring Customers' },
  { value: 'residential', label: 'Residential Customers' },
  { value: 'opted_out', label: 'Opted-out Customers' },
  { value: 'all_including_inactive', label: 'All Customers' },
]

// Last booking filter options
export const lastBookingFilterOptions = [
  { value: '', label: 'No filter - Include all customers' },
  { value: 'within_30_days', label: 'Within last 30 days' },
  { value: 'within_60_days', label: 'Within last 60 days' },
  { value: 'within_90_days', label: 'Within last 90 days' },
  { value: 'more_than_90_days', label: 'More than 90 days ago' },
]
