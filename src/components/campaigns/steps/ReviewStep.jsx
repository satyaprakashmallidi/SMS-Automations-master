import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Users } from 'lucide-react'
import * as Icons from 'lucide-react'

// Realistic SMS pricing range (carrier-dependent)
const SMS_COST_MIN = 0.0085
const SMS_COST_MAX = 0.01
const SMS_COST_AVG = (SMS_COST_MIN + SMS_COST_MAX) / 2

function ReviewStep({ audienceFilters, customers, tags, onLoadingChange, onAudienceCalculated }) {
  const [loading, setLoading] = useState(true)
  const [removedCustomerIds, setRemovedCustomerIds] = useState([])
  const lastAudienceSignatureRef = useRef(null)

  // Reset manual exclusions whenever the filters change
  useEffect(() => {
    setRemovedCustomerIds([])
  }, [audienceFilters, customers])

  // Show loading while calculating audience (brief delay for smooth UX)
  useEffect(() => {
    setLoading(true)
    onLoadingChange?.(true)

    const timer = setTimeout(() => {
      setLoading(false)
      onLoadingChange?.(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [audienceFilters, customers, onLoadingChange])

  // Filter customers based on audience filters
  const getFilteredCustomers = () => {
    let filtered = [...customers]

    // Filter by customer type
    if (audienceFilters.customerType === 'recurring') {
      filtered = filtered.filter((c) => c.type === 'Recurring')
    } else if (audienceFilters.customerType === 'residential') {
      filtered = filtered.filter((c) => c.type === 'Residential')
    } else if (audienceFilters.customerType === 'opted_out') {
      filtered = filtered.filter((c) => c.type === 'Opted Out')
    }

    // Filter by status (for "All Active Customers")
    if (audienceFilters.customerType === 'all') {
      filtered = filtered.filter((c) => c.status === 'active')
    }

    // Filter by last booking date (simple mock implementation)
    if (audienceFilters.lastBookingFilter && audienceFilters.lastBookingFilter !== 'no_filter') {
      // In real app, would calculate based on actual dates
      // For demo, just return all
    }

    // Filter by tags using tag IDs
    const { includeAny, requireAll, exclude } = audienceFilters.tagFilters

    if (includeAny.length > 0 || requireAll.length > 0 || exclude.length > 0) {
      filtered = filtered.filter((customer) => {
        const customerTagIds = customer.tags || []

        // Exclude: customer must NOT have any excluded tag IDs
        if (exclude.length > 0) {
          const hasExcludedTag = exclude.some((tagId) => customerTagIds.includes(tagId))
          if (hasExcludedTag) return false
        }

        // Require All: customer must have ALL required tag IDs
        if (requireAll.length > 0) {
          const hasAllRequired = requireAll.every((tagId) => customerTagIds.includes(tagId))
          if (!hasAllRequired) return false
        }

        // Include Any: customer must have AT LEAST ONE of these tag IDs
        if (includeAny.length > 0) {
          const hasAnyIncluded = includeAny.some((tagId) => customerTagIds.includes(tagId))
          if (!hasAnyIncluded) return false
        }

        return true
      })
    }

    return filtered.filter((customer) => !removedCustomerIds.includes(customer.id))
  }

  const filteredCustomers = getFilteredCustomers()
  const recipientCount = filteredCustomers.length
  const estimatedCostMin = recipientCount * SMS_COST_MIN
  const estimatedCostMax = recipientCount * SMS_COST_MAX
  const estimatedCostAvg = recipientCount * SMS_COST_AVG

  // Notify parent (wizard) once per unique audience + cost combination
  useEffect(() => {
    if (loading || typeof onAudienceCalculated !== 'function') return

    const signature = JSON.stringify({
      ids: filteredCustomers.map((c) => c.id),
      cost: estimatedCostAvg,
    })

    if (lastAudienceSignatureRef.current === signature) return

    lastAudienceSignatureRef.current = signature
    onAudienceCalculated(filteredCustomers, estimatedCostAvg)
  }, [loading, filteredCustomers, estimatedCostAvg, onAudienceCalculated])

  const removedCustomers = customers.filter((customer) =>
    removedCustomerIds.includes(customer.id)
  )

  // Generate avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
    ]
    return colors[name.charCodeAt(0) % colors.length]
  }

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const handleRemoveCustomer = (customerId) => {
    setRemovedCustomerIds((prev) => {
      if (prev.includes(customerId)) return prev
      return [...prev, customerId]
    })
  }

  const handleRestoreCustomer = (customerId) => {
    setRemovedCustomerIds((prev) => prev.filter((id) => id !== customerId))
  }

  const handleResetRemovals = () => {
    setRemovedCustomerIds([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Calculating audience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Audience Preview Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Recipients */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{recipientCount}</span>
            </div>
            <p className="text-sm text-gray-600">Recipients</p>
          </div>

          {/* Estimated Cost */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ~${estimatedCostAvg.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Estimated Cost</p>
          </div>
        </div>
      </div>

      {/* Recipient List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            Recipients ({recipientCount})
          </h4>
          {removedCustomerIds.length > 0 && (
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={handleResetRemovals}
            >
              Reset removals
            </button>
          )}
        </div>
        {filteredCustomers.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No customers match your filters.
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center gap-3 p-3">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${getAvatarColor(
                    customer.name
                  )}`}
                >
                  {getInitials(customer.name)}
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>

                {/* Tags (real) */}
                <div className="flex flex-wrap gap-2">
                  {(customer.tags || []).map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId)
                    if (!tag) return null

                    const IconComponent = Icons[tag.icon] || Icons.Tag

                    return (
                      <span
                        key={tagId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded"
                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        title={tag.definition}
                      >
                        <IconComponent className="w-3 h-3" />
                        {tag.name}
                      </span>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCustomer(customer.id)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Icons.UserX className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {removedCustomers.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Removed Recipients ({removedCustomers.length})
          </h4>
          <div className="max-h-48 overflow-y-auto border border-dashed border-gray-200 rounded-lg divide-y divide-gray-100 bg-gray-50">
            {removedCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center gap-3 p-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${getAvatarColor(
                    customer.name
                  )}`}
                >
                  {getInitials(customer.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestoreCustomer(customer.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Icons.RotateCcw className="w-4 h-4" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

ReviewStep.propTypes = {
  audienceFilters: PropTypes.shape({
    customerType: PropTypes.string,
    lastBookingFilter: PropTypes.string,
    tagFilters: PropTypes.shape({
      includeAny: PropTypes.arrayOf(PropTypes.number),
      requireAll: PropTypes.arrayOf(PropTypes.number),
      exclude: PropTypes.arrayOf(PropTypes.number),
    }),
  }).isRequired,
  customers: PropTypes.arrayOf(PropTypes.object).isRequired,
  tags: PropTypes.arrayOf(PropTypes.object).isRequired,
  onLoadingChange: PropTypes.func,
  onAudienceCalculated: PropTypes.func,
}

export default ReviewStep
