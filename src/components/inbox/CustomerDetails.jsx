import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { X, Phone, Mail, MapPin } from 'lucide-react'
import { getInitials, getAvatarColor } from '../../utils/timeFormatters'
import Badge from '../ui/Badge'
import { formatCurrency, formatDate, formatPhoneNumber } from '../../utils/formatters'

function CustomerDetails({ customer, onClose, isMobile = false, tags = [] }) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!customer) {
    return null
  }

  const resolvedTags = (customer.tags || [])
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter(Boolean)
  const statusValue = customer.status || 'inactive'
  const statusLabel =
    statusValue.charAt(0).toUpperCase() + statusValue.slice(1)

  const content = (
    <>
      {/* Content - scrollable */}
      <div className="overflow-y-auto p-4 space-y-6">
        {/* Avatar + Name (Body) */}
        <div className="flex items-center justify-center gap-4 pb-6 border-b border-gray-100">
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              font-bold text-xl flex-shrink-0
              ${getAvatarColor(customer.name)}
            `}
          >
            {getInitials(customer.name)}
          </div>
          <div className="text-left">
            <h4 className="font-bold text-gray-900 text-xl">
              {customer.name}
            </h4>
            <p className="text-sm text-gray-500 mt-1">{customer.type || 'Customer'}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-700 text-sm">Contact Information</h5>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                {customer.phone ? formatPhoneNumber(customer.phone) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 break-all">
                {customer.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                {customer.address || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-700 text-sm">Status</h5>
          <Badge variant={statusValue} size="md">
            {statusLabel}
          </Badge>
        </div>

        {/* Tags */}
        {resolvedTags.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700 text-sm">Tags</h5>
            <div className="flex flex-wrap gap-2 items-center">
              {resolvedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${tag.color}22`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-700 text-sm">Statistics</h5>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Spent</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(customer.totalSpent || 0)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Last Service</p>
              <p className="text-sm font-semibold text-gray-900">
                {customer.lastService ? formatDate(customer.lastService) : 'Never'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg col-span-2">
              <p className="text-xs text-gray-600 mb-1">Member Since</p>
              <p className="text-sm font-semibold text-gray-900">
                {customer.createdAt ? formatDate(customer.createdAt) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  if (isMobile) {
    // Mobile: Full screen modal
    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end"
        onClick={onClose}
      >
        <div
          className="w-full max-h-[90vh] bg-white rounded-t-2xl flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          {content}
        </div>
      </div>
    )
  }

  // Desktop: Slide-over from right
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="h-full w-96 bg-white shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        {content}
      </div>
    </div>
  )
}

CustomerDetails.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.string,
    type: PropTypes.string,
    totalSpent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lastService: PropTypes.string,
    createdAt: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    ),
  }),
  onClose: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.object),
}

export default CustomerDetails
